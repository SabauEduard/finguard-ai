export const fiscalDeadlines = [
  // Ianuarie
  { 
    id: 101, title: 'Declarația D300', date: '25 Ianuarie, 2026', type: 'High', status: 'pending', tags: ['TVA', 'ANAF'],
    description: 'Decont de TVA pentru luna Decembrie 2025.', actualDate: new Date(2026, 0, 25)
  },
  { 
    id: 102, title: 'Declarația D390', date: '25 Ianuarie, 2026', type: 'Medium', status: 'pending', tags: ['Intracomunitar'],
    description: 'Declarație recapitulativă VIES pentru Decembrie 2025.', actualDate: new Date(2026, 0, 25)
  },
  { 
    id: 103, title: 'Impozit Micro Q4 2025', date: '25 Ianuarie, 2026', type: 'High', status: 'pending', tags: ['Impozit', 'Micro'],
    description: 'Plata impozitului pe venitul microîntreprinderilor pentru trimestrul 4 din 2025.', actualDate: new Date(2026, 0, 25)
  },

  // Februarie
  { 
    id: 201, title: 'Declarația D300', date: '25 Februarie, 2026', type: 'High', status: 'pending', tags: ['TVA', 'ANAF'],
    description: 'Decont de TVA pentru luna Ianuarie.', actualDate: new Date(2026, 1, 25)
  },
  { 
    id: 202, title: 'Declarația D101', date: '25 Februarie, 2026', type: 'High', status: 'pending', tags: ['Impozit Profit'],
    description: 'Declarația anuală privind impozitul pe profit pe 2025.', actualDate: new Date(2026, 1, 25)
  },

  // Martie
  { 
    id: 301, title: 'Declarația D300', date: '25 Martie, 2026', type: 'High', status: 'pending', tags: ['TVA', 'ANAF'],
    description: 'Decont de TVA pentru luna Februarie.', actualDate: new Date(2026, 2, 25)
  },
  { 
    id: 302, title: 'Săptămâna Auditului', date: '15 Martie, 2026', type: 'Low', status: 'pending', tags: ['Intern'],
    description: 'Verificarea închiderii de an și pregătirea dosarului de prețuri de transfer.', actualDate: new Date(2026, 2, 15)
  },

  // Aprilie
  { 
    id: 401, title: 'Declarația D300', date: '25 Aprilie, 2026', type: 'High', status: 'pending', tags: ['TVA', 'ANAF'],
    description: 'Decont de TVA pentru luna Martie / Q1.', actualDate: new Date(2026, 3, 25)
  },
  { 
    id: 402, title: 'Impozit Micro Q1', date: '25 Aprilie, 2026', type: 'High', status: 'pending', tags: ['Impozit', 'Micro'],
    description: 'Plata impozitului pe venit micro pentru trimestrul 1.', actualDate: new Date(2026, 3, 25)
  },

  // Mai (Luna curentă în simulare)
  { 
    id: 501, title: 'Declarația D300', date: '25 Mai, 2026', type: 'High', status: 'urgent', tags: ['TVA', 'ANAF'],
    description: 'Decont de TVA pentru luna Aprilie.', actualDate: new Date(2026, 4, 25)
  },
  { 
    id: 502, title: 'Declarația Unică 2026', date: '25 Mai, 2026', type: 'High', status: 'urgent', tags: ['DU', 'Freelancer'],
    description: 'Termenul limită pentru depunerea Declarației Unice (Venituri estimate 2026 și Definitive 2025).', actualDate: new Date(2026, 4, 25)
  },
  { 
    id: 503, title: 'Declarația D390', date: '25 Mai, 2026', type: 'Medium', status: 'pending', tags: ['VIES'],
    description: 'Declarație recapitulativă privind livrările/achizițiile intracomunitare pe Aprilie.', actualDate: new Date(2026, 4, 25)
  },
  { 
    id: 504, title: 'Bilanț Anual 2025', date: '30 Mai, 2026', type: 'High', status: 'pending', tags: ['Contabilitate'],
    description: 'Termen limită depunere situații financiare anuale pentru 2025.', actualDate: new Date(2026, 4, 30)
  },

  // Iunie
  { 
    id: 601, title: 'Declarația D300', date: '25 Iunie, 2026', type: 'High', status: 'pending', tags: ['TVA', 'ANAF'],
    description: 'Decont de TVA pentru luna Mai.', actualDate: new Date(2026, 5, 25)
  },
  { 
    id: 602, title: 'Contribuție CASS', date: '25 Iunie, 2026', type: 'Medium', status: 'pending', tags: ['CASS'],
    description: 'Plata contribuției de sănătate conform Declarației Unice.', actualDate: new Date(2026, 5, 25)
  },

  // Iulie
  { 
    id: 701, title: 'Declarația D300', date: '25 Iulie, 2026', type: 'High', status: 'pending', tags: ['TVA', 'ANAF'],
    description: 'Decont de TVA pentru luna Iunie / Q2.', actualDate: new Date(2026, 6, 25)
  },
  { 
    id: 702, title: 'Impozit Micro Q2', date: '25 Iulie, 2026', type: 'High', status: 'pending', tags: ['Impozit', 'Micro'],
    description: 'Plata impozitului pe venit micro pentru trimestrul 2.', actualDate: new Date(2026, 6, 25)
  },

  // August
  { 
    id: 801, title: 'Declarația D300', date: '25 August, 2026', type: 'High', status: 'pending', tags: ['TVA', 'ANAF'],
    description: 'Decont de TVA pentru luna Iulie.', actualDate: new Date(2026, 7, 25)
  },

  // Septembrie
  { 
    id: 901, title: 'Declarația D300', date: '25 Septembrie, 2026', type: 'High', status: 'pending', tags: ['TVA', 'ANAF'],
    description: 'Decont de TVA pentru luna August.', actualDate: new Date(2026, 8, 25)
  },

  // Octombrie
  { 
    id: 1001, title: 'Declarația D300', date: '25 Octombrie, 2026', type: 'High', status: 'pending', tags: ['TVA', 'ANAF'],
    description: 'Decont de TVA pentru luna Septembrie / Q3.', actualDate: new Date(2026, 9, 25)
  },
  { 
    id: 1002, title: 'Impozit Micro Q3', date: '25 Octombrie, 2026', type: 'High', status: 'pending', tags: ['Impozit', 'Micro'],
    description: 'Plata impozitului pe venit micro pentru trimestrul 3.', actualDate: new Date(2026, 9, 25)
  },

  // Noiembrie
  { 
    id: 1101, title: 'Declarația D300', date: '25 Noiembrie, 2026', type: 'High', status: 'pending', tags: ['TVA', 'ANAF'],
    description: 'Decont de TVA pentru luna Octombrie.', actualDate: new Date(2026, 10, 25)
  },

  // Decembrie
  { 
    id: 1201, title: 'Declarația D300', date: '22 Decembrie, 2026', type: 'High', status: 'pending', tags: ['TVA', 'ANAF'],
    description: 'Decont de TVA pentru luna Noiembrie (termen devansat pentru sărbători).', actualDate: new Date(2026, 11, 22)
  },
  { 
    id: 1202, title: 'Închidere An Fiscal', date: '31 Decembrie, 2026', type: 'Low', status: 'pending', tags: ['Intern'],
    description: 'Inventarierea patrimoniului și pregătirea închiderii de an.', actualDate: new Date(2026, 11, 31)
  }
];
