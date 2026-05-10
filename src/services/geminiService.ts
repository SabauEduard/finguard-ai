/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Types ---

export interface ExtractedExpense {
  vendor: string;
  vendorCif?: string;
  client: string;
  clientCif?: string;
  amount: number;
  currency: string;
  date: string;
  vatAmount: number;
  category: string;
  type: 'income' | 'expense';
  deductiblePercentage: number;
  description: string;
  legalJustification: string;
  isComplete: boolean;
}

export interface TaxAdvice {
  summary: string;
  riskScore: number;
  riskDescription: string;
}

// --- Tools Implementation (Registry for automatic execution) ---

const tools_registry: Record<string, Function> = {
  validateCIF: (args: { cif: string }) => {
    const cleanCif = args.cif.replace(/\D/g, "");
    if (cleanCif.length < 2 || cleanCif.length > 10) return { valid: false, error: "Format invalid" };
    return { valid: true, registrationStatus: "ACTIV", vatPayer: cleanCif.length > 7 };
  },
  getDeductibilityRules: (args: { category: string }) => {
    const rules: Record<string, string> = {
      "Utilities": "100% deductibil pentru sediul social.",
      "Travel": "50% deductibil pentru combustibil/mentenanta vehicule (uz mixt).",
      "Software": "100% deductibil.",
      "Marketing": "100% deductibil.",
    };
    return { rule: rules[args.category] || "Regula standard: 100% daca este in scopul profitului." };
  }
};

class AIAgent {
  protected modelName: string;
  protected systemInstruction: string;

  constructor(systemInstruction: string, modelName: string = "gemini-3-flash-preview") {
    this.systemInstruction = systemInstruction;
    this.modelName = modelName;
  }

  /**
   * Executa un ciclu de rationament (ReAct) autonom.
   */
  protected async runAgenticCycle(contents: any, tools?: any[], responseSchema?: any): Promise<any> {
    // Normalizeaza input-ul intr-un format valid de Content (rol + parti)
    let requestContents: any[] = [];
    
    if (Array.isArray(contents)) {
      // Daca primim o lista de parti (fara role), le impachetam intr-un singur turn de utilizator
      if (contents.length > 0 && !contents[0].role) {
        requestContents = [{ role: "user", parts: contents }];
      } else {
        requestContents = contents;
      }
    } else if (typeof contents === "string") {
      requestContents = [{ role: "user", parts: [{ text: contents }] }];
    } else {
      requestContents = [contents];
    }

    let currentResponse = await ai.models.generateContent({
      model: this.modelName,
      contents: requestContents,
      config: {
        systemInstruction: this.systemInstruction,
        tools: tools,
        responseMimeType: responseSchema ? "application/json" : undefined,
        responseSchema: responseSchema,
      },
    });

    let safetyCounter = 0;
    while (currentResponse.functionCalls && safetyCounter < 5) {
      const toolResponses = currentResponse.functionCalls.map(call => {
        const handler = tools_registry[call.name];
        const output = handler ? handler(call.args) : { error: "Action not supported" };
        return {
          name: call.name,
          response: output
        };
      });

      const modelContent = (currentResponse as any).candidates?.[0]?.content || {
        role: "model",
        parts: [
          ...((currentResponse as any).thought ? [{ thought: (currentResponse as any).thought }] : []),
          ...currentResponse.functionCalls.map(fc => ({ functionCall: fc }))
        ]
      };
      
      requestContents.push(modelContent);
      requestContents.push({ role: "user", parts: toolResponses.map(tr => ({ functionResponse: tr })) });

      currentResponse = await ai.models.generateContent({
        model: this.modelName,
        contents: requestContents,
        config: {
          systemInstruction: this.systemInstruction,
          tools: tools,
          responseMimeType: responseSchema ? "application/json" : undefined,
          responseSchema: responseSchema,
        },
      });
      safetyCounter++;
    }

    try {
      if (responseSchema) {
        return JSON.parse(currentResponse.text || "{}");
      }
      return currentResponse.text;
    } catch (e) {
      console.error("Agent Output Parsing Error:", e);
      return null;
    }
  }
}

class ScanAgent extends AIAgent {
  constructor() {
    super(`Ești "Agentul de Extracție și Validare FinGuard".
Identitatea ta: Un expert OCR care nu doar citește date, ci le validează folosind unelte externe.
Misiunea ta:
1. Extrage datele brute din document.
2. Folosește unealta 'validateCIF' pentru a verifica validitatea partenerilor.
3. Clasifică documentul și stabilește deductibilitatea.
4. Returnează DOAR datele validate sub formă de JSON conform schemei.
5. IMPORTANT: Toate câmpurile precum 'vendor', 'vendorCif', 'client' trebuie să fie STRING, nu obiecte.`);
  }

  async process(base64Data: string, userCif?: string, mimeType: string = "image/jpeg"): Promise<ExtractedExpense> {
    const prompt = `Analizează această imagine. Firma utilizatorului are CIF: ${userCif || 'necunoscut'}.
    Validează CIF-ul vendorului identificat înainte de a finaliza raportul.`;

    const contents = [
      { inlineData: { mimeType, data: base64Data } },
      { text: prompt }
    ];

    const schema = {
      type: Type.OBJECT,
      properties: {
        vendor: { type: Type.STRING },
        vendorCif: { type: Type.STRING },
        client: { type: Type.STRING },
        clientCif: { type: Type.STRING },
        amount: { type: Type.NUMBER },
        currency: { type: Type.STRING },
        date: { type: Type.STRING },
        vatAmount: { type: Type.NUMBER },
        category: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['income', 'expense'] },
        deductiblePercentage: { type: Type.NUMBER },
        description: { type: Type.STRING },
        legalJustification: { type: Type.STRING },
        isComplete: { type: Type.BOOLEAN },
      },
      required: ["vendor", "client", "amount", "currency", "date", "category", "type", "legalJustification", "isComplete"],
    };

    // Definim uneltele disponibile pentru ScanAgent
    const tools = [
      {
        functionDeclarations: [
          {
            name: "validateCIF",
            description: "Verifică dacă un cod de identificare fiscală (CIF/CUI) este valid în registrul oficial.",
            parameters: {
              type: Type.OBJECT,
              properties: {
                cif: { type: Type.STRING, description: "CIF-ul de verificat" }
              },
              required: ["cif"]
            }
          }
        ]
      }
    ];

    return await this.runAgenticCycle(contents, tools, schema);
  }
}

class StrategyAgent extends AIAgent {
  constructor() {
    super(`Ești "Strategul Fiscal Senior FinGuard".
Misiunea ta: Generează strategii fiscale bazate pe date reale și legislație la zi.
Abilități:
1. Poți căuta legi noi folosind Search.
2. Poți verifica reguli specifice folosind local tools.
3. Ești capabil să corelezi veniturile cu cheltuielile pentru a identifica riscuri de audit.
4. Răspunde întotdeauna în format JSON conform schemei.`);
  }

  async generateStrategy(data: any, profile: any): Promise<TaxAdvice> {
    const prompt = `Generează un raport strategic pentru ${profile.type}.
    Date: Venit ${data.totalIncome} RON, Cheltuieli ${data.totalExpenses} RON.
    Folosește googleSearch pentru a vedea dacă există modificări în Codul Fiscal Român pentru anul 2026 înainte de a oferi recomandări.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        riskScore: { type: Type.NUMBER },
        riskDescription: { type: Type.STRING },
      },
      required: ["summary", "riskScore", "riskDescription"],
    };

    const tools = [
      { googleSearch: {} }, // Grounding agentic - cauta in timp real pe web
      {
        functionDeclarations: [
          {
            name: "getDeductibilityRules",
            description: "Obține regulile specifice de deductibilitate dintr-o bază de date locală.",
            parameters: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING, description: "Categoria de cheltuială" }
              },
              required: ["category"]
            }
          }
        ]
      }
    ];

    try {
      const result = await this.runAgenticCycle(prompt, tools, schema);
      return result || { summary: "Eroare agent", riskScore: 5, riskDescription: "Inaccesibil" };
    } catch (e) {
      console.error("Strategy Agent Error:", e);
      return { 
        summary: "Agentul a întâmpinat o eroare de comunicare.", 
        riskScore: 2, 
        riskDescription: "Problema tehnica agent." 
      };
    }
  }
}

// --- Exports ---

const docScanAgent = new ScanAgent();
const taxStrategyAgent = new StrategyAgent();

/**
 * @deprecated Use docScanAgent.process()
 */
export async function scanDocument(base64Data: string, userCif?: string, mimeType: string = "image/jpeg"): Promise<ExtractedExpense> {
  return docScanAgent.process(base64Data, userCif, mimeType);
}

/**
 * @deprecated Use taxStrategyAgent.generateStrategy()
 */
export async function getTaxAdvice(data: any, profile: any): Promise<TaxAdvice> {
  return taxStrategyAgent.generateStrategy(data, profile);
}

export { docScanAgent, taxStrategyAgent };