/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

export async function scanDocument(base64Data: string, userCif?: string, mimeType: string = "image/jpeg"): Promise<ExtractedExpense> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        {
          text: `You are an expert Romanian tax accountant. Analyze this invoice or receipt.
          Extract the following information in JSON format:
          - vendor: Name of the seller
          - vendorCif: CIF/CUI of the seller
          - client: Name of the buyer/client
          - clientCif: CIF/CUI of the buyer
          - amount: Total sum (numeric)
          - currency: Currency (e.g., RON, EUR)
          - date: Date of the document (YYYY-MM-DD)
          - vatAmount: VAT (TVA) amount (numeric)
          - category: One of [Utilities, Rent, Software, Office Supplies, Travel, Marketing, Services, Other]
          - type: If the client CIF matches "${userCif || 'the target company'}", it's an 'expense'. If the vendor CIF matches "${userCif || 'the target company'}", it's an 'income'.
          - deductiblePercentage: Percentage of deduction (0 or 50 or 100) based on RO Fiscal Code
          - description: Brief details
          - legalJustification: A short explanation in Romanian (RO) citing the actual Romanian Fiscal Code article/reason why the deductible percentage was chosen, based on the legislation found at: https://static.anaf.ro/static/10/Anaf/legislatie/Cod_fiscal_norme_2023.htm (e.g., "Deductibil 50% conform Art. 298 din Codul Fiscal pentru vehicule - sursa ANAF").
          - isComplete: Boolean, true if all critical data (vendor, client, date, amount) is present.
          
          Respond ONLY with valid JSON.`,
        },
      ],
    },
    config: {
      tools: [{urlContext: {}}],
      responseMimeType: "application/json",
      responseSchema: {
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
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export interface TaxAdvice {
  summary: string;
  riskScore: number;
  riskDescription: string;
}

export async function getTaxAdvice(data: any, profile: any): Promise<TaxAdvice> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Tu ești FinGuard AI, un consultant de taxe pentru freelancerii români și antreprenori.
      Data de azi: ${new Date().toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}
      Profilul utilizatorului: ${JSON.stringify(profile)}
      Date financiare recente: ${JSON.stringify(data)}
      
      Generează un raport detaliat în limba română (RO) pentru perioada: ${data.period || 'nespecificată'}.
      DATE FINANCIARE OBLIGATORII (Folosește EXACT aceste sume, nu calcula altele):
      - Venituri Totale: **${data.totalIncome} RON**
      - Cheltuieli Totale: **${data.totalExpenses} RON**
      - Defalcare Venituri pe Categorii: ${JSON.stringify(data.incomeByCategory || {})}
      - Defalcare Cheltuieli pe Categorii: ${JSON.stringify(data.expensesByCategory || {})}
      
      CRITIC: 
      1. În raport, menționează explicit sumele de mai sus ca fiind baza analizei.
      2. Nu încerca să deduci alte sume. Sumele totale sunt deja calculate de sistem pentru perioada specificată.
      3. NU ADUNA Veniturile cu Cheltuielile pentru a obține un "total" (ex: ${data.totalIncome} + ${data.totalExpenses} = ${data.totalIncome + data.totalExpenses} este o eroare gravă în acest context). Singura operație validă este Diferența (Profit = Venit - Cheltuială).
      4. Analizează EXCLUSIV datele primite, ignorând orice alt context anterior. Recomandările trebuie să fie specifice pentru volumul de ${data.invoiceCount} documente filtrate pentru perioada "${data.period}".
      
      Structura raportului trebuie să fie elegantă și bine organizată folosind Markdown:
      - Titlu mare (H1) sugestiv (ex: "# Raport Strategie Fiscală - ${data.period || ''}").
      - O linie de metadate: "**Pregătit pentru:** ${profile.type} | **Analiză Perioadă:** ${data.period || 'Curentă'}".
      - Introducere prietenoasă din partea asistentului digital FinGuard AI.
      - Secțiuni clare de tip H2 (ex: "## 📊 ANALIZĂ CASH-FLOW", "## ⚖️ OPTIMIZARE TAXE", "## 🛡️ STRATEGIE DE RISC").
      - Sub-puncte folosind H3 pentru detalii specifice.
      - Liste cu puncte pentru recomandări acționabile.
      - Referințe la Codul Fiscal Român acolo unde este relevant.

      Răspunde DOAR cu un obiect JSON care conține:
      1. "summary": Analiza completă formatată Markdown în limba română.
      2. "riskScore": Estimează riscul de audit printr-o valoare de la 1 la 10.
      3. "riskDescription": O explicație precisă de o singură frază în limba română.
      
      Folosește un ton profesional și empatic. Toate textele trebuie să fie exclusiv în limba română.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            riskScore: { type: Type.NUMBER },
            riskDescription: { type: Type.STRING },
          },
          required: ["summary", "riskScore", "riskDescription"],
        },
      },
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      return {
        summary: response.text || "Raportul a fost generat parțial. Vă rugăm să reveniți mai târziu pentru o analiză completă.",
        riskScore: 3,
        riskDescription: "Analiză parțială din cauza formatării răspunsului."
      };
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Check for quota/rate limit error
    const isQuotaError = error?.message?.includes("429") || error?.message?.includes("quota") || error?.message?.includes("RESOURCE_EXHAUSTED");
    
    return {
      summary: `# FinGuard AI: Notificare Sistem\n\n${isQuotaError ? "🤖 **Capacitate AI Limitata:** Sistemul a atins limita temporară de procesări. Raportul de față este unul generic." : "⚠️ **Eroare Tehnică:** Nu am putut genera o analiză personalizată momentan."}\n\n### Sumar Activitate (${data.period || 'Perioada Curentă'})\nS-au identificat ${data.invoiceCount || 0} documente:\n- **Venituri:** ${data.totalIncome?.toFixed(2) || 0} RON\n- **Cheltuieli:** ${data.totalExpenses?.toFixed(2) || 0} RON\n\n### Recomandări Generale\n1. Păstrați toate justificativele pentru cheltuielile de utilități.\n2. Verificați periodic plafoanele de TVA și microîntreprindere.\n3. Consultați un expert contabil pentru tranzacții atipice.`,
      riskScore: 2,
      riskDescription: isQuotaError ? "Scor generic (Limita API atinsă)" : "Scor generic (Eroare comunicare)"
    };
  }
}
