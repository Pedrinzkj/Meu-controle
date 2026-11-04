/**
 * MEU CONTROLE - FINANÇAS PESSOAIS
 * Pacote consolidado universal (Universal Standalone Bundle)
 * Permite execução imediata por duplo-clique no arquivo index.html (protocolo file://)
 * ou hospedagem em qualquer servidor HTTP / GitHub Pages sem erros de CORS.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. UTILS
  // =========================================================================
  const Utils = {
    formatCurrency(value) {
      if (value === null || value === undefined || isNaN(value)) value = 0;
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    },

    parseCurrency(input) {
      if (typeof input === 'number') return input;
      if (!input) return 0;
      const cleaned = input
        .toString()
        .replace(/[R$\s]/g, '')
        .replace(/\./g, '')
        .replace(',', '.');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
    },

    formatDate(dateStr) {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}/${d.getFullYear()}`;
    },

    formatDateShort(dateStr) {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length >= 3) return `${parts[2]}/${parts[1]}`;
      return dateStr;
    },

    getMonthName(monthIndex) {
      const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      return months[monthIndex] || '';
    },

    getMonthShortName(monthIndex) {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return months[monthIndex] || '';
    },

    getTodayString() {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    },

    generateId() {
      return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
    },

    escapeHtml(str) {
      if (!str) return '';
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return str.toString().replace(/[&<>"']/g, m => map[m]);
    },

    downloadFile(content, filename, mimeType = 'text/plain;charset=utf-8') {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    icons: {
      dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>`,
      transactions: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>`,
      reports: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
      categories: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`,
      settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
      plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
      wallet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>`,
      trendingUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
      trendingDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>`,
      piggyBank: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"></path><circle cx="7" cy="11" r="1"></circle></svg>`,
      eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
      eyeOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`,
      sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
      moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
      edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
      trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
      search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
      check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
      alertCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
      download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
      upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`,
      refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
      close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
      target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
      caixinhas: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"></path><circle cx="7" cy="11" r="1"></circle></svg>`
    }
  };

  // =========================================================================
  // 2. STORAGE LAYER (Isolamento Multi-Usuário + Sincronização Supabase)
  // =========================================================================
  const LEGACY_STORAGE_KEYS = {
    TRANSACTIONS: 'meu_controle_transactions',
    CATEGORIES: 'meu_controle_categories',
    SETTINGS: 'meu_controle_settings',
    CAIXINHAS: 'meu_controle_caixinhas',
    INVESTMENTS: 'meu_controle_investments',
    INVESTMENT_TRANSACTIONS: 'meu_controle_investment_transactions',
    DIVIDENDS: 'meu_controle_dividends',
    INVESTMENT_GOALS: 'meu_controle_investment_goals',
    PORTFOLIO_SNAPSHOTS: 'meu_controle_portfolio_snapshots',
    QUOTES_CACHE: 'meu_controle_quotes_cache'
  };

  const STORAGE_KEYS = {
    _prefix() {
      const uid = (typeof AuthService !== 'undefined' && AuthService.currentUser && AuthService.currentUser.id)
        ? AuthService.currentUser.id
        : 'guest_unauth';
      return `meu_controle_u_${uid}_`;
    },
    get TRANSACTIONS() { return this._prefix() + 'transactions'; },
    get CATEGORIES() { return this._prefix() + 'categories'; },
    get SETTINGS() { return this._prefix() + 'settings'; },
    get CAIXINHAS() { return this._prefix() + 'caixinhas'; },
    get INVESTMENTS() { return this._prefix() + 'investments'; },
    get INVESTMENT_TRANSACTIONS() { return this._prefix() + 'investment_transactions'; },
    get DIVIDENDS() { return this._prefix() + 'dividends'; },
    get INVESTMENT_GOALS() { return this._prefix() + 'investment_goals'; },
    get PORTFOLIO_SNAPSHOTS() { return this._prefix() + 'portfolio_snapshots'; },
    get QUOTES_CACHE() { return 'meu_controle_quotes_cache'; }
  };

  // Caixinhas padrão de demonstração
  const DEFAULT_CAIXINHAS = [
    {
      id: 'cax_demo_1',
      name: 'Reserva de Emergência',
      description: 'Segurança financeira equivalente a 6 meses de despesas',
      targetAmount: 8000.00,
      currentAmount: 2400.00,
      icon: '🛡️',
      color: '#10b981',
      deadline: '2026-12-31',
      history: [
        { id: 'h_demo_1', type: 'deposit', amount: 1500.00, date: '2026-10-05', description: 'Depósito inicial da reserva', createdAt: '2026-10-05T10:00:00.000Z' },
        { id: 'h_demo_2', type: 'deposit', amount: 900.00, date: '2026-11-01', description: 'Aporte de economia mensal', createdAt: '2026-11-01T14:30:00.000Z' }
      ],
      createdAt: '2026-10-01T08:00:00.000Z'
    },
    {
      id: 'cax_demo_2',
      name: 'Viagem de Férias',
      description: 'Viagem de descanso de fim de ano',
      targetAmount: 3500.00,
      currentAmount: 1750.00,
      icon: '✈️',
      color: '#3b82f6',
      deadline: '2026-12-20',
      history: [
        { id: 'h_demo_3', type: 'deposit', amount: 1000.00, date: '2026-10-10', description: 'Aporte inicial viagem', createdAt: '2026-10-10T12:00:00.000Z' },
        { id: 'h_demo_4', type: 'deposit', amount: 750.00, date: '2026-10-25', description: 'Economia com freelance', createdAt: '2026-10-25T16:00:00.000Z' }
      ],
      createdAt: '2026-10-10T12:00:00.000Z'
    },
    {
      id: 'cax_demo_3',
      name: 'Comprar Computador',
      description: 'Upgrade de equipamento de desenvolvimento',
      targetAmount: 2000.00,
      currentAmount: 2000.00,
      icon: '💻',
      color: '#8b5cf6',
      deadline: '2026-11-15',
      history: [
        { id: 'h_demo_5', type: 'deposit', amount: 1200.00, date: '2026-09-20', description: 'Economia do salário', createdAt: '2026-09-20T10:00:00.000Z' },
        { id: 'h_demo_6', type: 'deposit', amount: 800.00, date: '2026-10-15', description: 'Venda de peças antigas', createdAt: '2026-10-15T15:00:00.000Z' }
      ],
      createdAt: '2026-09-20T10:00:00.000Z'
    }
  ];

  const DEFAULT_INVESTMENTS = [
  {
    id: 'inv_btc',
    ticker: 'BTC',
    name: 'Bitcoin',
    type: 'crypto', // crypto, fii, stock, fixed
    institution: 'Binance',
    quantity: 0.015,
    averagePrice: 320000.00,
    totalInvested: 4800.00,
    lastUpdate: new Date().toISOString(),
    notes: 'Reserva descentralizada e reserva de valor global'
  },
  {
    id: 'inv_mxrf',
    ticker: 'MXRF11',
    name: 'Maxi Renda FII',
    type: 'fii',
    institution: 'XP Investimentos',
    quantity: 250,
    averagePrice: 10.15,
    totalInvested: 2537.50,
    lastUpdate: new Date().toISOString(),
    notes: 'Fundo de papel diversificado com foco em dividendos mensais'
  },
  {
    id: 'inv_petr',
    ticker: 'PETR4',
    name: 'Petrobras PN',
    type: 'stock',
    institution: 'BTG Pactual',
    quantity: 60,
    averagePrice: 34.50,
    totalInvested: 2070.00,
    lastUpdate: new Date().toISOString(),
    notes: 'Posição em dividendos e setor de energia'
  },
  {
    id: 'inv_cdb',
    ticker: '',
    name: 'CDB Banco Inter 110% CDI',
    type: 'fixed',
    institution: 'Banco Inter',
    quantity: 1,
    averagePrice: 5000.00,
    appliedAmount: 5000.00,
    totalInvested: 5000.00,
    costBasis: 5000.00,
    yieldType: 'CDI',
    rateText: '110% do CDI',
    benchmark: 'CDI',
    rateValue: 110,
    liquidity: 'Diária',
    applicationDate: '2026-07-01',
    maturityDate: '2027-12-15',
    accumulatedYield: null,
    lastUpdate: new Date().toISOString(),
    notes: 'Reserva de liquidez com rendimento acima da Selic'
  }
];

const DEFAULT_INVESTMENT_TRANSACTIONS = [
  {
    id: 'itx_1',
    investmentId: 'inv_btc',
    type: 'buy', // buy, sell
    quantity: 0.015,
    unitPrice: 320000.00,
    fees: 0.00,
    totalAmount: 4800.00,
    date: '2026-08-10',
    broker: 'Binance',
    notes: 'Primeiro aporte em Bitcoin'
  },
  {
    id: 'itx_2',
    investmentId: 'inv_mxrf',
    type: 'buy',
    quantity: 250,
    unitPrice: 10.15,
    fees: 0.00,
    totalAmount: 2537.50,
    date: '2026-09-05',
    broker: 'XP Investimentos',
    notes: 'Montagem de posição em fundos imobiliários'
  },
  {
    id: 'itx_3',
    investmentId: 'inv_petr',
    type: 'buy',
    quantity: 60,
    unitPrice: 34.50,
    fees: 0.00,
    totalAmount: 2070.00,
    date: '2026-09-18',
    broker: 'BTG Pactual',
    notes: 'Compra de ações'
  },
  {
    id: 'itx_4',
    investmentId: 'inv_cdb',
    type: 'buy',
    quantity: 1,
    unitPrice: 5000.00,
    fees: 0.00,
    totalAmount: 5000.00,
    date: '2026-07-01',
    broker: 'Banco Inter',
    notes: 'Aplicação em renda fixa pós-fixada'
  }
];

const DEFAULT_DIVIDENDS = [
  {
    id: 'div_1',
    investmentId: 'inv_mxrf',
    ticker: 'MXRF11',
    type: 'dividend', // dividend, jcp, yield
    amount: 25.00,
    quantityRef: 250,
    date: '2026-10-15',
    notes: 'Rendimento mensal MXRF11 (R$ 0,10 por cota)'
  },
  {
    id: 'div_2',
    investmentId: 'inv_petr',
    ticker: 'PETR4',
    type: 'dividend',
    amount: 68.40,
    quantityRef: 60,
    date: '2026-10-20',
    notes: 'Dividendos extraordinários Petrobras'
  }
];

const DEFAULT_INVESTMENT_GOALS = [
  {
    id: 'ig_1',
    name: 'Alcançar R$ 25.000 Investidos',
    targetAmount: 25000.00,
    deadline: '2027-06-30',
    description: 'Meta geral de patrimônio alocado em ativos geradores de renda'
  },
  {
    id: 'ig_2',
    name: 'Receber R$ 300/mês em Dividendos',
    targetAmount: 300.00,
    deadline: '2027-12-31',
    description: 'Renda passiva mensal gerada por FIIs e Ações'
  }
];

// Catálogo de sugestões rápidas para pesquisa por Ticker / Símbolo (apenas renda variável e criptomoedas)
const TICKER_CATALOG = [
  // Criptomoedas
  { ticker: 'BTC', name: 'Bitcoin', type: 'crypto', coingeckoId: 'bitcoin' },
  { ticker: 'ETH', name: 'Ethereum', type: 'crypto', coingeckoId: 'ethereum' },
  { ticker: 'SOL', name: 'Solana', type: 'crypto', coingeckoId: 'solana' },
  { ticker: 'USDT', name: 'Tether USD', type: 'crypto', coingeckoId: 'tether' },
  { ticker: 'ADA', name: 'Cardano', type: 'crypto', coingeckoId: 'cardano' },
  { ticker: 'BNB', name: 'BNB', type: 'crypto', coingeckoId: 'binancecoin' },
  { ticker: 'XRP', name: 'XRP', type: 'crypto', coingeckoId: 'ripple' },
  // FIIs
  { ticker: 'MXRF11', name: 'Maxi Renda FII', type: 'fii' },
  { ticker: 'HGLG11', name: 'CSHG Logística FII', type: 'fii' },
  { ticker: 'KNRI11', name: 'Kinea Renda Imobiliária FII', type: 'fii' },
  { ticker: 'XPLG11', name: 'XP Log FII', type: 'fii' },
  { ticker: 'VISC11', name: 'Vinci Shopping Centers FII', type: 'fii' },
  { ticker: 'HGRU11', name: 'CSHG Renda Urbana FII', type: 'fii' },
  { ticker: 'BTLG11', name: 'BTG Pactual Logística FII', type: 'fii' },
  { ticker: 'CPTS11', name: 'Capitânia Securities II FII', type: 'fii' },
  { ticker: 'XPML11', name: 'XP Malls FII', type: 'fii' },
  { ticker: 'KNCR11', name: 'Kinea Rendimentos Imobiliários FII', type: 'fii' },
  // Ações
  { ticker: 'PETR4', name: 'Petrobras PN', type: 'stock' },
  { ticker: 'PETR3', name: 'Petrobras ON', type: 'stock' },
  { ticker: 'VALE3', name: 'Vale ON', type: 'stock' },
  { ticker: 'ITUB4', name: 'Itaú Unibanco PN', type: 'stock' },
  { ticker: 'BBAS3', name: 'Banco do Brasil ON', type: 'stock' },
  { ticker: 'WEGE3', name: 'WEG ON', type: 'stock' },
  { ticker: 'BBDC4', name: 'Bradesco PN', type: 'stock' },
  { ticker: 'ABEV3', name: 'Ambev ON', type: 'stock' },
  { ticker: 'RENT3', name: 'Localiza ON', type: 'stock' },
  { ticker: 'MGLU3', name: 'Magazine Luiza ON', type: 'stock' },
  { ticker: 'TAEE11', name: 'Taesa UNT', type: 'stock' },
  { ticker: 'EGIE3', name: 'Engie Brasil ON', type: 'stock' }
];


  const DEFAULT_CATEGORIES = [
    { id: 'cat_alim', name: 'Alimentação', type: 'expense', icon: '🍔', color: '#ef4444' },
    { id: 'cat_trans', name: 'Transporte', type: 'expense', icon: '🚗', color: '#f97316' },
    { id: 'cat_morad', name: 'Moradia', type: 'expense', icon: '🏠', color: '#eab308' },
    { id: 'cat_saude', name: 'Saúde', type: 'expense', icon: '💊', color: '#ec4899' },
    { id: 'cat_educ', name: 'Educação', type: 'expense', icon: '🎓', color: '#8b5cf6' },
    { id: 'cat_lazer', name: 'Lazer', type: 'expense', icon: '🎮', color: '#06b6d4' },
    { id: 'cat_comp', name: 'Compras', type: 'expense', icon: '🛍️', color: '#3b82f6' },
    { id: 'cat_cont', name: 'Contas', type: 'expense', icon: '📄', color: '#64748b' },
    { id: 'cat_out_desp', name: 'Outros', type: 'expense', icon: '📦', color: '#78716c' },
    { id: 'cat_sal', name: 'Salário', type: 'income', icon: '💼', color: '#10b981' },
    { id: 'cat_free', name: 'Freelance', type: 'income', icon: '💻', color: '#059669' },
    { id: 'cat_inv', name: 'Investimentos', type: 'income', icon: '📈', color: '#14b8a6' },
    { id: 'cat_vend', name: 'Vendas', type: 'income', icon: '🏷️', color: '#6366f1' },
    { id: 'cat_out_rec', name: 'Outros', type: 'income', icon: '💵', color: '#84cc16' }
  ];

  const DEFAULT_SETTINGS = {
    userName: 'Pedro Henrique',
    theme: 'light',
    hideBalances: false,
    currency: 'BRL',
    createdAt: new Date().toISOString()
  };

  function generateDemoTransactions() {
    const today = new Date();
    const curY = today.getFullYear();
    const curM = today.getMonth() + 1;
    const pad = n => String(n).padStart(2, '0');
    const mCur = `${curY}-${pad(curM)}`;
    const prevDate = new Date(curY, today.getMonth() - 1, 1);
    const mPrev = `${prevDate.getFullYear()}-${pad(prevDate.getMonth() + 1)}`;

    return [
      { id: 'tx_1', description: 'Salário Mensal', amount: 4800.00, type: 'income', categoryId: 'cat_sal', date: `${mCur}-05`, notes: 'Depósito integral em conta corrente' },
      { id: 'tx_2', description: 'Projeto Freelance Web', amount: 1600.00, type: 'income', categoryId: 'cat_free', date: `${mCur}-12`, notes: 'Consultoria de desenvolvimento frontend' },
      { id: 'tx_3', description: 'Rendimento de Aplicações', amount: 340.50, type: 'income', categoryId: 'cat_inv', date: `${mCur}-15`, notes: 'Rendimento Tesouro Direto Selic' },
      { id: 'tx_4', description: 'Aluguel do Apartamento', amount: 1350.00, type: 'expense', categoryId: 'cat_morad', date: `${mCur}-06`, notes: 'Mensalidade e condomínio inclusos' },
      { id: 'tx_5', description: 'Supermercado Mensal', amount: 740.80, type: 'expense', categoryId: 'cat_alim', date: `${mCur}-08`, notes: 'Compras do mês' },
      { id: 'tx_6', description: 'Combustível do Carro', amount: 240.00, type: 'expense', categoryId: 'cat_trans', date: `${mCur}-10`, notes: 'Abastecimento etanol' },
      { id: 'tx_7', description: 'Fatura de Luz e Energia', amount: 165.40, type: 'expense', categoryId: 'cat_cont', date: `${mCur}-11`, notes: 'Conta mensal de energia elétrica' },
      { id: 'tx_8', description: 'Internet Fibra 600 Mega', amount: 129.90, type: 'expense', categoryId: 'cat_cont', date: `${mCur}-13`, notes: 'Plano residencial fibra óptica' },
      { id: 'tx_9', description: 'Jantar Restaurante', amount: 180.00, type: 'expense', categoryId: 'cat_lazer', date: `${mCur}-14`, notes: 'Confraternização final de semana' },
      { id: 'tx_10', description: 'Farmácia e Medicamentos', amount: 95.30, type: 'expense', categoryId: 'cat_saude', date: `${mCur}-16`, notes: 'Itens de cuidados e vitaminas' },
      { id: 'tx_11', description: 'Curso de Especialização', amount: 260.00, type: 'expense', categoryId: 'cat_educ', date: `${mCur}-18`, notes: 'Mensalidade curso tecnologia' },
      // Mês anterior
      { id: 'tx_p1', description: 'Salário Mensal', amount: 4800.00, type: 'income', categoryId: 'cat_sal', date: `${mPrev}-05`, notes: 'Salário mês anterior' },
      { id: 'tx_p2', description: 'Venda de Equipamento Usado', amount: 650.00, type: 'income', categoryId: 'cat_vend', date: `${mPrev}-10`, notes: 'Monitor gamer usado' },
      { id: 'tx_p3', description: 'Aluguel do Apartamento', amount: 1350.00, type: 'expense', categoryId: 'cat_morad', date: `${mPrev}-06`, notes: 'Aluguel anterior' },
      { id: 'tx_p4', description: 'Supermercado e Feira', amount: 690.00, type: 'expense', categoryId: 'cat_alim', date: `${mPrev}-09`, notes: 'Compras mês anterior' },
      { id: 'tx_p5', description: 'Manutenção Veicular', amount: 420.00, type: 'expense', categoryId: 'cat_trans', date: `${mPrev}-15`, notes: 'Revisão periódica e troca de óleo' },
      { id: 'tx_p6', description: 'Contas de Água e Luz', amount: 245.50, type: 'expense', categoryId: 'cat_cont', date: `${mPrev}-12`, notes: 'Faturas anteriores' }
    ];
  }

  const Storage = {
    init() {
      if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      }
      if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        const defaultUserSettings = { ...DEFAULT_SETTINGS };
        if (typeof AuthService !== 'undefined' && AuthService.currentUser) {
          defaultUserSettings.userName = AuthService.getUserDisplayName();
        }
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultUserSettings));
      }
      if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, '[]');
      }
      if (!localStorage.getItem(STORAGE_KEYS.CAIXINHAS)) {
        localStorage.setItem(STORAGE_KEYS.CAIXINHAS, '[]');
      }
      if (!localStorage.getItem(STORAGE_KEYS.INVESTMENTS)) {
        localStorage.setItem(STORAGE_KEYS.INVESTMENTS, '[]');
      }
      if (!localStorage.getItem(STORAGE_KEYS.INVESTMENT_TRANSACTIONS)) {
        localStorage.setItem(STORAGE_KEYS.INVESTMENT_TRANSACTIONS, '[]');
      }
      if (!localStorage.getItem(STORAGE_KEYS.DIVIDENDS)) {
        localStorage.setItem(STORAGE_KEYS.DIVIDENDS, '[]');
      }
      if (!localStorage.getItem(STORAGE_KEYS.INVESTMENT_GOALS)) {
        localStorage.setItem(STORAGE_KEYS.INVESTMENT_GOALS, '[]');
      }
      if (!localStorage.getItem(STORAGE_KEYS.PORTFOLIO_SNAPSHOTS)) {
        // Sem histórico inventado: o histórico começa vazio e é construído com valores realmente calculados
        localStorage.setItem(STORAGE_KEYS.PORTFOLIO_SNAPSHOTS, '[]');
      }
      this.migrateInvestmentData();
      this.normalizeInvestmentFields();
    },

    _lastDataMutationAt: 0,
    _dirtyRenderScheduled: false,

    _markDataDirty(changeInfo = null) {
      this._lastDataMutationAt = Date.now();
      if (typeof IntelligenceView !== 'undefined') {
        IntelligenceView.lastReport = null;
        if (changeInfo && changeInfo.date) {
          const parts = String(changeInfo.date).split('-');
          if (parts.length >= 2) {
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            if (y && m >= 1 && m <= 12) {
              IntelligenceView.selectedYear = y;
              if (IntelligenceView.selectedMonth !== 'all') {
                IntelligenceView.selectedMonth = m;
              }
            }
          }
        }
        if (!this._dirtyRenderScheduled) {
          this._dirtyRenderScheduled = true;
          Promise.resolve().then(() => {
            this._dirtyRenderScheduled = false;
            if (
              typeof State !== 'undefined' &&
              (State.currentView === 'intelligence' || State.currentView === 'assistant') &&
              !IntelligenceView.isAssistantLoading
            ) {
              IntelligenceView.render();
            }
          });
        }
      }
    },

    _get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        return fallback;
      }
    },

    _set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn('[Storage._set] Erro ao salvar:', e);
      }
    },

    getTransactions() {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        return [];
      }
    },

    getTransactionById(id) {
      return this.getTransactions().find(t => t.id === id) || null;
    },

    saveTransaction(transaction) {
      const list = this.getTransactions();
      const newTx = {
        id: transaction.id || Utils.generateId(),
        description: transaction.description.trim(),
        amount: Number(transaction.amount),
        type: transaction.type,
        categoryId: transaction.categoryId,
        date: transaction.date || Utils.getTodayString(),
        notes: (transaction.notes || '').trim(),
        investmentId: transaction.investmentId || undefined,
        createdAt: transaction.createdAt || new Date().toISOString()
      };
      const existingIdx = list.findIndex(t => t.id === newTx.id);
      if (existingIdx !== -1) {
        list[existingIdx] = newTx;
      } else {
        list.unshift(newTx);
      }
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.upsertTransaction(newTx);
      this._markDataDirty({ type: 'transaction', date: newTx.date });
      return newTx;
    },

    updateTransaction(transaction) {
      const list = this.getTransactions();
      const index = list.findIndex(t => t.id === transaction.id);
      if (index === -1) return null;
      list[index] = {
        ...list[index],
        description: transaction.description !== undefined ? String(transaction.description).trim() : list[index].description,
        amount: transaction.amount !== undefined ? Number(transaction.amount) : list[index].amount,
        type: transaction.type || list[index].type,
        categoryId: transaction.categoryId || list[index].categoryId,
        date: transaction.date || list[index].date,
        notes: transaction.notes !== undefined ? String(transaction.notes || '').trim() : list[index].notes,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.upsertTransaction(list[index]);
      this._markDataDirty({ type: 'transaction', date: list[index].date });
      return list[index];
    },

    deleteTransaction(id) {
      const list = this.getTransactions().filter(t => t.id !== id);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.deleteRecord('transactions', id);
      this._markDataDirty({ type: 'transaction_deleted' });
      return true;
    },

    getCategories() {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
        return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
      } catch (e) {
        return DEFAULT_CATEGORIES;
      }
    },

    getCategoryById(id) {
      return this.getCategories().find(c => c.id === id) || {
        id: 'unknown',
        name: 'Outros',
        icon: '🏷️',
        color: '#94a3b8',
        type: 'expense'
      };
    },

    getCategory(id) {
      return this.getCategoryById(id);
    },

    saveCategory(category) {
      const list = this.getCategories();
      const newCat = {
        id: category.id || Utils.generateId(),
        name: category.name.trim(),
        type: category.type,
        icon: category.icon || '🏷️',
        color: category.color || '#3b82f6'
      };
      list.push(newCat);
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.upsertCategory(newCat);
      this._markDataDirty({ type: 'category' });
      return newCat;
    },

    updateCategory(category) {
      const list = this.getCategories();
      const index = list.findIndex(c => c.id === category.id);
      if (index === -1) return null;
      list[index] = {
        ...list[index],
        name: category.name !== undefined ? String(category.name).trim() : list[index].name,
        type: category.type || list[index].type,
        icon: category.icon || list[index].icon,
        color: category.color || list[index].color
      };
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.upsertCategory(list[index]);
      this._markDataDirty({ type: 'category' });
      return list[index];
    },

    countTransactionsByCategory(categoryId) {
      return this.getTransactions().filter(t => t.categoryId === categoryId).length;
    },

    deleteCategory(categoryId, reclassifyToId = null) {
      const count = this.countTransactionsByCategory(categoryId);
      if (count > 0 && !reclassifyToId) {
        throw new Error(`Esta categoria está em uso por ${count} transações.`);
      }
      if (reclassifyToId) {
        const transactions = this.getTransactions().map(t => {
          if (t.categoryId === categoryId) {
            return { ...t, categoryId: reclassifyToId };
          }
          return t;
        });
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
        if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.syncAllTransactions(transactions);
      }
      const list = this.getCategories().filter(c => c.id !== categoryId);
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.deleteRecord('categories', categoryId);
      this._markDataDirty({ type: 'category' });
      return true;
    },

    getSettings() {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    },

    saveSettings(newSettings) {
      const current = this.getSettings();
      const merged = { ...current, ...newSettings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.upsertProfileSettings(merged);
      return merged;
    },

    exportToCsv(customTransactions = null, periodLabel = null) {
      const transactions = customTransactions || this.getTransactions();
      if (!Array.isArray(transactions) || transactions.length === 0) {
        if (typeof Toast !== 'undefined') {
          Toast.warning('Nenhuma movimentação', 'Não há movimentações para exportar no período selecionado.');
        }
        return false;
      }

      const categoriesMap = new Map(this.getCategories().map(c => [c.id, c.name]));
      const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

      let totalIncome = 0;
      let totalExpense = 0;
      sorted.forEach(t => {
        const val = Number(t.amount) || 0;
        if (t.type === 'income') totalIncome += val;
        else totalExpense += val;
      });
      const net = totalIncome - totalExpense;

      const pLabel = periodLabel || 'Geral (Todas as movimentações)';
      const nowStr = new Date().toLocaleString('pt-BR');

      const escapeCsv = (str) => {
        const s = String(str || '').trim();
        if (s.includes(';') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };

      const lines = [
        escapeCsv('Meu Controle – Relatório Financeiro'),
        escapeCsv(`Período: ${pLabel}`),
        escapeCsv(`Emitido em: ${nowStr}`),
        '',
        ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor (R$)', 'Observações'].map(escapeCsv).join(';')
      ];

      sorted.forEach(t => {
        const catName = categoriesMap.get(t.categoryId) || 'Outros';
        const typeStr = t.type === 'income' ? 'Receita' : 'Despesa';
        const valNum = Number(t.amount) || 0;
        const valStr = valNum.toFixed(2).replace('.', ',');
        const dateStr = Utils.formatDate(t.date);
        lines.push([
          escapeCsv(dateStr),
          escapeCsv(typeStr),
          escapeCsv(catName),
          escapeCsv(t.description || ''),
          escapeCsv(valStr),
          escapeCsv(t.notes || '')
        ].join(';'));
      });

      lines.push('');
      lines.push(['', '', '', 'Total de Receitas (R$)', totalIncome.toFixed(2).replace('.', ','), ''].map(escapeCsv).join(';'));
      lines.push(['', '', '', 'Total de Despesas (R$)', totalExpense.toFixed(2).replace('.', ','), ''].map(escapeCsv).join(';'));
      lines.push(['', '', '', 'Saldo do Período (R$)', net.toFixed(2).replace('.', ','), ''].map(escapeCsv).join(';'));

      const csvContent = '\uFEFF' + lines.join('\r\n');
      const filename = `meu_controle_relatorio_${Utils.getTodayString()}.csv`;
      Utils.downloadFile(csvContent, filename, 'text/csv;charset=utf-8');
      if (typeof Toast !== 'undefined') {
        Toast.success('Exportação Concluída', `Arquivo CSV "${filename}" gerado com sucesso.`);
      }
      return true;
    },

    exportToXlsx(customTransactions = null, periodLabel = null) {
      const transactions = customTransactions || this.getTransactions();
      if (!Array.isArray(transactions) || transactions.length === 0) {
        if (typeof Toast !== 'undefined') {
          Toast.warning('Nenhuma movimentação', 'Não há movimentações para exportar no período selecionado.');
        }
        return false;
      }

      const categoriesMap = new Map(this.getCategories().map(c => [c.id, c.name]));
      const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

      let totalIncome = 0;
      let totalExpense = 0;
      sorted.forEach(t => {
        const val = Number(t.amount) || 0;
        if (t.type === 'income') totalIncome += val;
        else totalExpense += val;
      });
      const net = totalIncome - totalExpense;

      const pLabel = periodLabel || 'Geral (Todas as movimentações)';
      const nowStr = new Date().toLocaleString('pt-BR');
      const filename = `meu_controle_relatorio_${Utils.getTodayString()}.xlsx`;

      if (typeof XLSX !== 'undefined') {
        try {
          const wb = XLSX.utils.book_new();

          const sheetData = [
            ['Meu Controle – Relatório Financeiro'],
            [`Período: ${pLabel}`],
            [`Emitido em: ${nowStr}`],
            [],
            ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor (R$)', 'Observações']
          ];

          sorted.forEach(t => {
            const catName = categoriesMap.get(t.categoryId) || 'Outros';
            const typeStr = t.type === 'income' ? 'Receita' : 'Despesa';
            const valNum = Number(t.amount) || 0;
            sheetData.push([
              Utils.formatDate(t.date),
              typeStr,
              catName,
              t.description || '',
              valNum,
              t.notes || ''
            ]);
          });

          sheetData.push([]);
          sheetData.push(['', '', '', 'Total de Receitas (R$)', totalIncome, '']);
          sheetData.push(['', '', '', 'Total de Despesas (R$)', totalExpense, '']);
          sheetData.push(['', '', '', 'Saldo do Período (R$)', net, '']);

          const ws = XLSX.utils.aoa_to_sheet(sheetData);

          ws['!cols'] = [
            { wch: 14 },
            { wch: 12 },
            { wch: 22 },
            { wch: 35 },
            { wch: 18 },
            { wch: 35 }
          ];

          XLSX.utils.book_append_sheet(wb, ws, 'Movimentações');
          XLSX.writeFile(wb, filename);

          if (typeof Toast !== 'undefined') {
            Toast.success('Exportação Excel Concluída', `Planilha "${filename}" gerada com sucesso.`);
          }
          return true;
        } catch (err) {
          console.warn('[Storage.exportToXlsx] Erro ao gerar XLSX:', err);
          return this.exportToCsv(customTransactions, periodLabel);
        }
      } else {
        return this.exportToCsv(customTransactions, periodLabel);
      }
    },

    exportToJson() {
      const data = {
        version: '3.0.0',
        exportDate: new Date().toISOString(),
        transactions: this.getTransactions(),
        categories: this.getCategories(),
        caixinhas: this.getCaixinhas(),
        investments: this.getInvestments(),
        investmentTransactions: this.getInvestmentTransactions(),
        dividends: this.getDividends(),
        investmentGoals: this.getInvestmentGoals(),
        portfolioSnapshots: this.getPortfolioSnapshots(),
        settings: this.getSettings()
      };
      Utils.downloadFile(JSON.stringify(data, null, 2), `meu_controle_backup_${Utils.getTodayString()}.json`, 'application/json;charset=utf-8');
    },

    importFromJson(jsonString) {
      const data = JSON.parse(jsonString);
      if (!data.transactions || !data.categories) {
        throw new Error('Arquivo de backup inválido: dados essenciais ausentes.');
      }
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
      if (data.caixinhas) {
        localStorage.setItem(STORAGE_KEYS.CAIXINHAS, JSON.stringify(data.caixinhas));
      }
      if (data.investments) {
        localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(data.investments));
      }
      if (data.investmentTransactions) {
        localStorage.setItem(STORAGE_KEYS.INVESTMENT_TRANSACTIONS, JSON.stringify(data.investmentTransactions));
      }
      if (data.dividends) {
        localStorage.setItem(STORAGE_KEYS.DIVIDENDS, JSON.stringify(data.dividends));
      }
      if (data.investmentGoals) {
        localStorage.setItem(STORAGE_KEYS.INVESTMENT_GOALS, JSON.stringify(data.investmentGoals));
      }
      if (data.portfolioSnapshots) {
        localStorage.setItem(STORAGE_KEYS.PORTFOLIO_SNAPSHOTS, JSON.stringify(data.portfolioSnapshots));
      }
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.pushAllLocalToCloud();
      return true;
    },

    resetToDemo() {
      this.backupInvestmentData('antes_de_restaurar_demo');
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(generateDemoTransactions()));
      localStorage.setItem(STORAGE_KEYS.CAIXINHAS, JSON.stringify(DEFAULT_CAIXINHAS));
      localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(DEFAULT_INVESTMENTS));
      localStorage.setItem(STORAGE_KEYS.INVESTMENT_TRANSACTIONS, JSON.stringify(DEFAULT_INVESTMENT_TRANSACTIONS));
      localStorage.setItem(STORAGE_KEYS.DIVIDENDS, JSON.stringify(DEFAULT_DIVIDENDS));
      localStorage.setItem(STORAGE_KEYS.INVESTMENT_GOALS, JSON.stringify(DEFAULT_INVESTMENT_GOALS));
      this.savePortfolioSnapshots([]);
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.pushAllLocalToCloud();
    },

    clearAllData() {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.CAIXINHAS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.INVESTMENT_TRANSACTIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.DIVIDENDS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.INVESTMENT_GOALS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.PORTFOLIO_SNAPSHOTS, JSON.stringify([]));
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.clearAllCloudUserData();
    },

    // ==========================================
    // CAIXINHAS (Metas e Poupança Reservada)
    // ==========================================

    getCaixinhas() {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.CAIXINHAS);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        console.error('Erro ao ler caixinhas:', e);
        return [];
      }
    },

    getCaixinhaById(id) {
      return this.getCaixinhas().find(c => c.id === id) || null;
    },

    getTotalInCaixinhas() {
      return this.getCaixinhas().reduce((sum, c) => sum + (Number(c.currentAmount) || 0), 0);
    },

    saveCaixinha(data) {
      const list = this.getCaixinhas();
      const initialAmount = Math.max(0, Number(data.initialAmount) || 0);
      const history = [];
      if (initialAmount > 0) {
        history.push({
          id: Utils.generateId(),
          type: 'deposit',
          amount: initialAmount,
          date: Utils.getTodayString(),
          description: 'Depósito inicial da caixinha',
          createdAt: new Date().toISOString()
        });
      }
      const newCaixinha = {
        id: data.id || Utils.generateId(),
        name: data.name.trim(),
        description: (data.description || '').trim(),
        targetAmount: Math.max(0.01, Number(data.targetAmount) || 0),
        currentAmount: initialAmount,
        icon: data.icon || '🎯',
        color: data.color || '#10b981',
        deadline: data.deadline || null,
        history: history,
        createdAt: new Date().toISOString()
      };
      list.push(newCaixinha);
      localStorage.setItem(STORAGE_KEYS.CAIXINHAS, JSON.stringify(list));
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.upsertCaixinha(newCaixinha);
      this._markDataDirty({ type: 'caixinha' });
      return newCaixinha;
    },

    updateCaixinha(data) {
      const list = this.getCaixinhas();
      const index = list.findIndex(c => c.id === data.id);
      if (index === -1) return null;
      list[index] = {
        ...list[index],
        name: data.name !== undefined ? String(data.name).trim() : list[index].name,
        description: data.description !== undefined ? String(data.description).trim() : list[index].description,
        targetAmount: data.targetAmount !== undefined ? Math.max(0.01, Number(data.targetAmount) || 0) : list[index].targetAmount,
        currentAmount: data.currentAmount !== undefined ? Math.max(0, Number(data.currentAmount) || 0) : list[index].currentAmount,
        deadline: data.deadline !== undefined ? (data.deadline || null) : list[index].deadline,
        icon: data.icon || list[index].icon,
        color: data.color || list[index].color,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.CAIXINHAS, JSON.stringify(list));
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.upsertCaixinha(list[index]);
      this._markDataDirty({ type: 'caixinha' });
      return list[index];
    },

    deleteCaixinha(id) {
      const list = this.getCaixinhas();
      const filtered = list.filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEYS.CAIXINHAS, JSON.stringify(filtered));
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.deleteRecord('caixinhas', id);
      this._markDataDirty({ type: 'caixinha' });
      return true;
    },

    addFundsToCaixinha(id, amount, date, description) {
      const val = Number(amount);
      if (isNaN(val) || val <= 0) throw new Error('Informe um valor válido e positivo para guardar.');
      const list = this.getCaixinhas();
      const index = list.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Caixinha não encontrada.');
      const cax = list[index];
      cax.currentAmount = (Number(cax.currentAmount) || 0) + val;
      if (!cax.history) cax.history = [];
      cax.history.unshift({
        id: Utils.generateId(),
        type: 'deposit',
        amount: val,
        date: date || Utils.getTodayString(),
        description: (description || 'Depósito na caixinha').trim(),
        createdAt: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEYS.CAIXINHAS, JSON.stringify(list));
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.upsertCaixinha(cax);

      // Adiciona automaticamente movimentação correspondente na lista de transações
      this.saveTransaction({
        description: `Depósito na Caixinha: ${cax.name}`,
        amount: val,
        type: 'expense',
        categoryId: 'cat_out_desp',
        date: date || Utils.getTodayString(),
        notes: (description || 'Transferência para caixinha de reserva').trim()
      });

      return cax;
    },

    withdrawFundsFromCaixinha(id, amount, date, description) {
      const val = Number(amount);
      if (isNaN(val) || val <= 0) throw new Error('Informe um valor válido e positivo para resgatar.');
      const list = this.getCaixinhas();
      const index = list.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Caixinha não encontrada.');
      const cax = list[index];
      const cur = Number(cax.currentAmount) || 0;
      if (val > cur) throw new Error(`Saldo insuficiente na caixinha. Você possui apenas ${Utils.formatCurrency(cur)} guardados.`);
      cax.currentAmount = cur - val;
      if (!cax.history) cax.history = [];
      cax.history.unshift({
        id: Utils.generateId(),
        type: 'withdraw',
        amount: val,
        date: date || Utils.getTodayString(),
        description: (description || 'Resgate para saldo disponível').trim(),
        createdAt: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEYS.CAIXINHAS, JSON.stringify(list));
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.upsertCaixinha(cax);

      // Adiciona automaticamente movimentação correspondente na lista de transações
      this.saveTransaction({
        description: `Resgate da Caixinha: ${cax.name}`,
        amount: val,
        type: 'income',
        categoryId: 'cat_out_rec',
        date: date || Utils.getTodayString(),
        notes: (description || 'Resgate de caixinha para a conta principal').trim()
      });

      return cax;
    },

    // ==========================================
    // INVESTIMENTOS (Ações, FIIs, Cripto, Renda Fixa)
    // ==========================================

    // Leitura segura: se o JSON estiver corrompido, guarda uma cópia do texto original e NÃO devolve dados de demonstração
    _readJsonSafe(key, fallback) {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      try {
        return JSON.parse(raw);
      } catch (e) {
        try { localStorage.setItem(key + '_corrompido_' + Date.now(), raw); } catch (_) { /* sem espaço */ }
        console.error('[Storage] JSON inválido em ' + key + '; cópia preservada.', e);
        return fallback;
      }
    },

    getInvestments() {
      return this._readJsonSafe(STORAGE_KEYS.INVESTMENTS, []);
    },

    getActiveInvestments() {
      return this.getInvestments().filter(inv => {
        if (!inv) return false;
        if (inv.status === 'closed') return false;
        if (inv.type === 'fixed') {
          return this.getAppliedAmount(inv) > 0;
        }
        return (Number(inv.quantity) || 0) > 0;
      });
    },

    // ==========================================
    // BACKUP / MIGRAÇÃO / PREÇOS / CUSTO
    // ==========================================

    backupInvestmentData(label) {
      try {
        const pad = n => String(n).padStart(2, '0');
        const d = new Date();
        const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
        const prefix = `meu_controle_backup_${label}_`;
        const key = prefix + stamp;
        const data = {};
        [STORAGE_KEYS.INVESTMENTS, STORAGE_KEYS.INVESTMENT_TRANSACTIONS, STORAGE_KEYS.DIVIDENDS,
         STORAGE_KEYS.INVESTMENT_GOALS, STORAGE_KEYS.PORTFOLIO_SNAPSHOTS].forEach(k => { data[k] = localStorage.getItem(k); });
        localStorage.setItem(key, JSON.stringify({ createdAt: d.toISOString(), label, data }));
        // mantém os 5 backups mais recentes de cada tipo
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(prefix)) keys.push(k);
        }
        keys.sort();
        while (keys.length > 5) localStorage.removeItem(keys.shift());
        return key;
      } catch (e) {
        console.error('[Storage] Falha ao criar backup:', e);
        return null;
      }
    },

    // Preço de mercado validado, ou null. NUNCA usa preço médio como se fosse cotação.
    getMarketPrice(inv) {
      const q = inv && inv.quote;
      const p = q ? Number(q.price) : NaN;
      return Number.isFinite(p) && p > 0 ? p : null;
    },

    hasMarketQuote(inv) {
      return this.getMarketPrice(inv) !== null;
    },

    // Valor de mercado da posição (quantidade × cotação), ou null se não houver cotação válida
    getMarketValue(inv) {
      const p = this.getMarketPrice(inv);
      return p === null ? null : (Number(inv.quantity) || 0) * p;
    },

    // Custo contábil atual da posição (custo médio ponderado, com taxas)
    getCostBasis(inv) {
      if (inv && inv.type === 'fixed') {
        const applied = Number(inv.appliedAmount);
        if (Number.isFinite(applied) && applied >= 0) return applied;
      }
      const c = Number(inv && inv.costBasis);
      if (Number.isFinite(c) && c >= 0) return c;
      return (Number(inv && inv.quantity) || 0) * (Number(inv && inv.averagePrice) || 0);
    },

    getAppliedAmount(inv) {
      if (!inv) return 0;
      const applied = Number(inv.appliedAmount);
      if (Number.isFinite(applied) && applied >= 0) return applied;
      const c = Number(inv.costBasis);
      if (Number.isFinite(c) && c >= 0) return c;
      const ti = Number(inv.totalInvested);
      if (Number.isFinite(ti) && ti >= 0) return ti;
      return (Number(inv.quantity) || 1) * (Number(inv.averagePrice) || 0);
    },

    getAccumulatedYield(inv) {
      if (!inv || inv.type !== 'fixed') return null;
      if (inv.accumulatedYield === null || inv.accumulatedYield === undefined || inv.accumulatedYield === '') return null;
      const y = Number(inv.accumulatedYield);
      return Number.isFinite(y) ? y : null;
    },

    getYieldTypeLabel(yieldType) {
      const y = String(yieldType || '').toUpperCase().trim();
      if (y === 'CDI') return 'Pós-fixado (CDI)';
      if (y === 'IPCA') return 'Híbrido (IPCA+)';
      if (y === 'PREFIXADA' || y === 'PRE') return 'Prefixada';
      return yieldType || 'CDI';
    },

    // Cache persistente de últimas cotações válidas por ticker/símbolo
    getQuotesCache() {
      return this._readJsonSafe(STORAGE_KEYS.QUOTES_CACHE, {});
    },

    saveCachedQuote(symbol, quoteObj) {
      if (!symbol || !quoteObj || !Number.isFinite(Number(quoteObj.price)) || Number(quoteObj.price) <= 0) return;
      const key = String(symbol).toUpperCase().trim();
      const cache = this.getQuotesCache();
      cache[key] = {
        ...quoteObj,
        symbol: key,
        fetchedAt: quoteObj.fetchedAt || new Date().toISOString()
      };
      try {
        localStorage.setItem(STORAGE_KEYS.QUOTES_CACHE, JSON.stringify(cache));
      } catch (_) {}
    },

    getCachedQuote(symbol) {
      if (!symbol) return null;
      const key = String(symbol).toUpperCase().trim();
      const cache = this.getQuotesCache();
      const q = cache && cache[key];
      if (q && Number.isFinite(Number(q.price)) && Number(q.price) > 0) return q;
      // Também verifica se algum ativo em carteira possui cotação válida para o mesmo ticker
      const inv = this.getInvestments().find(i => String(i.ticker || '').toUpperCase() === key && this.hasMarketQuote(i));
      return inv ? inv.quote : null;
    },

    // Normaliza campos específicos de cada classe sem apagar investimentos nem histórico existentes
    normalizeInvestmentFields() {
      const list = this.getInvestments();
      if (!Array.isArray(list) || list.length === 0) return;
      const trades = this.getInvestmentTransactions();
      let changed = false;

      list.forEach(inv => {
        if (!inv) return;
        if (inv.type === 'fixed') {
          if (inv.ticker) {
            inv.ticker = '';
            changed = true;
          }
          const applied = this.getAppliedAmount(inv);
          if (inv.appliedAmount !== applied) {
            inv.appliedAmount = applied;
            inv.costBasis = applied;
            inv.totalInvested = applied;
            inv.quantity = 1;
            inv.averagePrice = applied;
            changed = true;
          }
          if (!inv.yieldType) {
            const rt = String(inv.rateText || inv.benchmark || '').toUpperCase();
            if (rt.includes('IPCA')) inv.yieldType = 'IPCA';
            else if (rt.includes('PRE') || rt.includes('PRÉ') || (!rt.includes('CDI') && !rt.includes('SELIC') && /\d+%/.test(rt))) inv.yieldType = 'PREFIXADA';
            else inv.yieldType = 'CDI';
            changed = true;
          }
          if (!inv.applicationDate) {
            const invTrades = trades.filter(t => t.investmentId === inv.id && t.date).sort((a, b) => String(a.date).localeCompare(String(b.date)));
            inv.applicationDate = invTrades.length > 0
              ? invTrades[0].date
              : (inv.lastUpdate ? String(inv.lastUpdate).slice(0, 10) : Utils.getTodayString());
            changed = true;
          }
          if (inv.accumulatedYield === undefined) {
            inv.accumulatedYield = null;
            changed = true;
          }
        } else {
          // Para ações, FIIs e criptomoedas: se possui cotação válida, garante que está salva no cache de cotações
          if (inv.ticker && this.hasMarketQuote(inv)) {
            this.saveCachedQuote(inv.ticker, inv.quote);
          }
        }
      });

      if (changed) {
        this.saveInvestments(list);
      }
    },

    // Reconstrói a posição a partir do histórico de operações (média ponderada, com taxas)
    replayInvestmentTrades(invId, trades) {
      const mine = trades.map((t, idx) => ({ t, idx })).filter(x => x.t.investmentId === invId)
        .sort((a, b) => String(a.t.date).localeCompare(String(b.t.date)) || b.idx - a.idx); // a lista é guardada do mais novo para o mais antigo
      let qty = 0, cost = 0, realized = 0;
      const perTrade = {};
      for (const { t } of mine) {
        const q = Number(t.quantity) || 0;
        const u = Number(t.unitPrice) || 0;
        const f = Number(t.fees) || 0;
        if (t.type === 'buy') {
          qty += q;
          cost += q * u + f;
        } else {
          if (q > qty + 1e-9) return null; // venda maior que a posição: histórico incoerente
          const avg = qty > 0 ? cost / qty : 0;
          const costOfSold = q * avg;
          const proceeds = q * u - f;
          perTrade[t.id] = { costOfSold, realizedProfit: proceeds - costOfSold };
          realized += proceeds - costOfSold;
          cost -= costOfSold;
          qty -= q;
          if (qty < 1e-9) { qty = 0; cost = 0; }
        }
      }
      return { qty, cost, avg: qty > 0 ? cost / qty : 0, realized, perTrade };
    },

    positionMatchesReplay(inv, rp) {
      const qty = Number(inv.quantity) || 0;
      const avg = Number(inv.averagePrice) || 0;
      return Math.abs(rp.qty - qty) <= 1e-8 * Math.max(1, qty) + 1e-9 &&
             Math.abs(rp.avg - avg) <= 0.005 + 1e-6 * avg;
    },

    // Migração v2: faz backup, cria custo contábil/lucro realizado e retira históricos sem marca de cálculo real
    migrateInvestmentData() {
      const VERSION = 2;
      const MK = STORAGE_KEYS._prefix() + 'investments_migration';
      if (Number(localStorage.getItem(MK)) >= VERSION) return;

      const investments = this.getInvestments();
      const trades = this.getInvestmentTransactions();
      const snaps = this.getPortfolioSnapshots();
      const legacySnaps = snaps.filter(s => !s.calculated);

      if (investments.length === 0 && trades.length === 0 && legacySnaps.length === 0) {
        localStorage.setItem(MK, String(VERSION));
        return;
      }
      if (!this.backupInvestmentData('pre_migracao_v2')) return; // sem backup, não altera nada

      let tradesChanged = false;
      investments.forEach(inv => {
        const qty = Number(inv.quantity) || 0;
        const avg = Number(inv.averagePrice) || 0;
        if (!Number.isFinite(Number(inv.costBasis))) inv.costBasis = qty * avg;
        if (!Number.isFinite(Number(inv.realizedProfit))) {
          const sells = trades.filter(t => t.investmentId === inv.id && t.type === 'sell');
          if (sells.length === 0) {
            inv.realizedProfit = 0;
          } else {
            const rp = this.replayInvestmentTrades(inv.id, trades);
            if (rp && this.positionMatchesReplay(inv, rp)) {
              inv.realizedProfit = rp.realized;
              trades.forEach(t => {
                if (t.investmentId === inv.id && t.type === 'sell' && rp.perTrade[t.id]) {
                  t.costOfSold = rp.perTrade[t.id].costOfSold;
                  t.realizedProfit = rp.perTrade[t.id].realizedProfit;
                  tradesChanged = true;
                }
              });
            } else {
              inv.realizedProfit = 0;
              inv.realizedLegacyUnknown = true; // vendas antigas não puderam ser reconstruídas com segurança
            }
          }
        }
      });

      this.saveInvestments(investments);
      if (tradesChanged) this.saveInvestmentTransactions(trades);
      if (legacySnaps.length > 0) {
        // os registros antigos continuam no backup; saem apenas do gráfico (não têm marca de valor calculado)
        this.savePortfolioSnapshots(snaps.filter(s => s.calculated));
      }
      localStorage.setItem(MK, String(VERSION));
    },

    // Resumo calculado da carteira (nada é estimado: ativo sem cotação fica fora do valor de mercado)
    getPortfolioSummary() {
      const list = this.getInvestments();
      const s = {
        marketValue: 0, quotedCost: 0, fixedApplied: 0, fixedAccumulatedYield: 0, unquotedCount: 0, unquotedCost: 0,
        totalCost: 0, realizedProfit: 0, realizedHasUnknown: false, openPositions: 0, positions: []
      };
      for (const inv of list) {
        s.realizedProfit += Number(inv.realizedProfit) || 0;
        if (inv.realizedLegacyUnknown) s.realizedLegacyUnknown = true;
        if (inv.realizedLegacyUnknown) s.realizedHasUnknown = true;
        if (inv.type === 'fixed') {
          if (inv.status === 'closed') continue;
          const applied = this.getAppliedAmount(inv);
          if (applied <= 0) continue;
          s.openPositions++;
          s.totalCost += applied;
          s.fixedApplied += applied;
          const accYield = this.getAccumulatedYield(inv);
          if (accYield !== null) s.fixedAccumulatedYield += accYield;
          s.positions.push({ id: inv.id, ticker: '', name: inv.name, type: inv.type, quantity: 1, cost: applied, value: applied + (accYield || 0), accumulatedYield: accYield, basis: 'applied' });
          continue;
        }
        const qty = Number(inv.quantity) || 0;
        if (qty <= 0 || inv.status === 'closed') continue;
        s.openPositions++;
        const cost = this.getCostBasis(inv);
        s.totalCost += cost;
        if (this.hasMarketQuote(inv)) {
          const p = this.getMarketPrice(inv);
          s.marketValue += qty * p;
          s.quotedCost += cost;
          s.positions.push({ id: inv.id, ticker: inv.ticker, name: inv.name, type: inv.type, quantity: qty, cost, price: p, value: qty * p, basis: 'market', source: inv.quote.source, quotedAt: inv.quote.fetchedAt });
        } else {
          s.unquotedCount++;
          s.unquotedCost += cost;
          s.positions.push({ id: inv.id, ticker: inv.ticker, name: inv.name, type: inv.type, quantity: qty, cost, basis: 'none' });
        }
      }
      return s;
    },

    getInvestmentById(id) {
      return this.getInvestments().find(i => i.id === id) || null;
    },

    saveInvestments(list) {
      localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(list));
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.syncAllInvestments(list);
      this._markDataDirty({ type: 'investment' });
    },

    saveInvestment(data) {
      const list = this.getInvestments();
      const invType = data.type || 'stock';
      const isFixed = invType === 'fixed';
      const cleanTicker = isFixed ? '' : String(data.ticker || '').toUpperCase().trim();

      if (!isFixed) {
        if (!cleanTicker) throw new Error('Informe o código de negociação (ticker/símbolo).');
        const existing = list.find(i => i.type !== 'fixed' && String(i.ticker || '').toUpperCase() === cleanTicker);
        if (existing) {
          const isExistingActive = existing.status !== 'closed' && (Number(existing.quantity) || 0) > 0;
          if (isExistingActive) {
            throw new Error(`O ativo ${cleanTicker} já está cadastrado na carteira. Para alterar ou comprar mais unidades, utilize as opções de Editar ou Comprar/Vender na tabela.`);
          }

          // Ativo previamente encerrado/vendido sendo recomprado: reativa a posição existente
          const initialQty = Number(data.quantity) || 0;
          const initialPrice = Number(data.averagePrice) || 0;
          const fees = Number(data.fees) || 0;
          const totalCost = (initialQty * initialPrice) + fees;
          const avgPriceWithFees = initialQty > 0 ? totalCost / initialQty : initialPrice;

          let initialQuote = null;
          let currentPrice = null;
          if (data.quote && Number.isFinite(Number(data.quote.price)) && Number(data.quote.price) > 0) {
            initialQuote = {
              ...data.quote,
              symbol: cleanTicker,
              fetchedAt: data.quote.fetchedAt || new Date().toISOString()
            };
            currentPrice = Number(initialQuote.price);
            this.saveCachedQuote(cleanTicker, initialQuote);
          } else {
            const cached = this.getCachedQuote(cleanTicker);
            if (cached) {
              initialQuote = cached;
              currentPrice = Number(cached.price);
            }
          }

          existing.name = (data.name || existing.name || '').trim();
          existing.type = invType;
          existing.institution = (data.institution || existing.institution || '').trim();
          existing.quantity = initialQty;
          existing.averagePrice = avgPriceWithFees;
          existing.currentPrice = currentPrice || existing.currentPrice;
          if (initialQuote) existing.quote = initialQuote;
          existing.coingeckoId = data.coingeckoId || existing.coingeckoId;
          existing.totalInvested = totalCost;
          existing.costBasis = totalCost;
          existing.status = 'active';
          delete existing.closedAt;
          existing.notes = (data.notes !== undefined ? data.notes : (existing.notes || '')).trim();
          existing.lastUpdate = new Date().toISOString();

          this.saveInvestments(list);

          if (initialQty > 0) {
            this.saveInvestmentTransaction({
              investmentId: existing.id,
              type: 'buy',
              quantity: initialQty,
              unitPrice: initialPrice,
              fees: fees,
              totalAmount: totalCost,
              date: Utils.getTodayString(),
              broker: existing.institution,
              notes: 'Recompra / Nova posição no ativo'
            });

            const unitLabel = invType === 'stock' ? 'ações' : invType === 'fii' ? 'cotas' : 'unidades';
            this.saveTransaction({
              description: `Aporte em Investimento: ${existing.ticker}`,
              amount: totalCost,
              type: 'expense',
              categoryId: 'cat_inv',
              date: Utils.getTodayString(),
              notes: `Compra de ${initialQty} ${unitLabel} de ${existing.ticker}`
            });
          }

          this.createPortfolioSnapshot();
          this._markDataDirty({ type: 'investment' });
          return existing;
        }
      }

      let newInv;
      if (isFixed) {
        const appliedAmount = Number(data.appliedAmount !== undefined ? data.appliedAmount : (data.totalInvested || data.averagePrice || 0));
        if (!Number.isFinite(appliedAmount) || appliedAmount <= 0) {
          throw new Error('Informe um valor aplicado válido maior que zero.');
        }
        const yieldType = String(data.yieldType || data.benchmark || 'CDI').toUpperCase().trim();
        const accYield = (data.accumulatedYield !== undefined && data.accumulatedYield !== null && data.accumulatedYield !== '')
          ? Number(data.accumulatedYield)
          : null;
        const appDate = data.applicationDate || Utils.getTodayString();

        newInv = {
          id: data.id || Utils.generateId(),
          ticker: '',
          name: (data.name || '').trim(),
          type: 'fixed',
          institution: (data.institution || '').trim(),
          quantity: 1,
          averagePrice: appliedAmount,
          appliedAmount: appliedAmount,
          currentPrice: null,
          quote: null,
          totalInvested: appliedAmount,
          costBasis: appliedAmount,
          realizedProfit: 0,
          yieldType: yieldType,
          benchmark: yieldType,
          rateText: (data.rateText || '').trim(),
          applicationDate: appDate,
          maturityDate: data.maturityDate || null,
          accumulatedYield: Number.isFinite(accYield) ? accYield : null,
          notes: (data.notes || '').trim(),
          lastUpdate: new Date().toISOString()
        };

        list.push(newInv);
        this.saveInvestments(list);

        this.saveInvestmentTransaction({
          investmentId: newInv.id,
          type: 'buy',
          quantity: 1,
          unitPrice: appliedAmount,
          fees: 0,
          totalAmount: appliedAmount,
          date: appDate,
          broker: newInv.institution,
          notes: 'Aplicação inicial em Renda Fixa'
        });

        this.saveTransaction({
          description: `Aplicação em Renda Fixa: ${newInv.name}`,
          amount: appliedAmount,
          type: 'expense',
          categoryId: 'cat_inv',
          date: appDate,
          notes: `${newInv.institution ? newInv.institution + ' - ' : ''}${newInv.rateText || this.getYieldTypeLabel(newInv.yieldType)}`
        });
      } else {
        const initialQty = Number(data.quantity) || 0;
        const initialPrice = Number(data.averagePrice) || 0;
        const fees = Number(data.fees) || 0;
        const totalCost = (initialQty * initialPrice) + fees;
        const avgPriceWithFees = initialQty > 0 ? totalCost / initialQty : initialPrice;

        let initialQuote = null;
        let currentPrice = null;
        if (data.quote && Number.isFinite(Number(data.quote.price)) && Number(data.quote.price) > 0) {
          initialQuote = {
            ...data.quote,
            symbol: cleanTicker,
            fetchedAt: data.quote.fetchedAt || new Date().toISOString()
          };
          currentPrice = Number(initialQuote.price);
          this.saveCachedQuote(cleanTicker, initialQuote);
        } else {
          const cached = this.getCachedQuote(cleanTicker);
          if (cached) {
            initialQuote = cached;
            currentPrice = Number(cached.price);
          }
        }

        newInv = {
          id: data.id || Utils.generateId(),
          ticker: cleanTicker,
          name: (data.name || '').trim(),
          type: invType,
          institution: (data.institution || '').trim(),
          quantity: initialQty,
          averagePrice: avgPriceWithFees,
          currentPrice: currentPrice,
          quote: initialQuote,
          coingeckoId: data.coingeckoId || (initialQuote && initialQuote.providerId && invType === 'crypto' ? initialQuote.providerId : undefined),
          totalInvested: totalCost,
          costBasis: totalCost,
          realizedProfit: 0,
          rateText: '',
          maturityDate: null,
          notes: (data.notes || '').trim(),
          lastUpdate: new Date().toISOString()
        };
        if (data.quoteError) newInv.quoteError = data.quoteError;

        list.push(newInv);
        this.saveInvestments(list);

        if (initialQty > 0) {
          this.saveInvestmentTransaction({
            investmentId: newInv.id,
            type: 'buy',
            quantity: initialQty,
            unitPrice: initialPrice,
            fees: fees,
            totalAmount: totalCost,
            date: Utils.getTodayString(),
            broker: newInv.institution,
            notes: 'Aporte inicial de cadastro do ativo'
          });

          const unitLabel = invType === 'stock' ? 'ações' : invType === 'fii' ? 'cotas' : 'unidades';
          this.saveTransaction({
            description: `Aporte em Investimento: ${newInv.ticker}`,
            amount: totalCost,
            type: 'expense',
            categoryId: 'cat_inv',
            date: Utils.getTodayString(),
            notes: `Compra de ${initialQty} ${unitLabel} de ${newInv.ticker}`
          });
        }
      }

      this.createPortfolioSnapshot();
      this._markDataDirty({ type: 'investment' });
      return newInv;
    },

    updateInvestment(data) {
      const list = this.getInvestments();
      const index = list.findIndex(i => i.id === data.id);
      if (index === -1) return null;

      const existing = list[index];
      const invType = data.type || existing.type || 'stock';
      const isFixed = invType === 'fixed';

      if (isFixed) {
        const appliedAmount = Number(data.appliedAmount !== undefined ? data.appliedAmount : this.getAppliedAmount(existing));
        const validApplied = (Number.isFinite(appliedAmount) && appliedAmount > 0) ? appliedAmount : this.getAppliedAmount(existing);
        const yieldType = String(data.yieldType || existing.yieldType || existing.benchmark || 'CDI').toUpperCase().trim();
        const accYield = (data.accumulatedYield !== undefined && data.accumulatedYield !== null && data.accumulatedYield !== '')
          ? Number(data.accumulatedYield)
          : null;

        list[index] = {
          ...existing,
          type: 'fixed',
          ticker: '',
          name: (data.name || existing.name || '').trim(),
          institution: (data.institution !== undefined ? data.institution : (existing.institution || '')).trim(),
          quantity: 1,
          averagePrice: validApplied,
          appliedAmount: validApplied,
          costBasis: validApplied,
          totalInvested: validApplied,
          yieldType: yieldType,
          benchmark: yieldType,
          rateText: (data.rateText !== undefined ? data.rateText : (existing.rateText || '')).trim(),
          applicationDate: data.applicationDate !== undefined ? data.applicationDate : (existing.applicationDate || null),
          maturityDate: data.maturityDate !== undefined ? (data.maturityDate || null) : (existing.maturityDate || null),
          accumulatedYield: Number.isFinite(accYield) ? accYield : null,
          notes: (data.notes !== undefined ? data.notes : (existing.notes || '')).trim(),
          lastUpdate: new Date().toISOString()
        };
      } else {
        const cleanTicker = String(data.ticker !== undefined ? data.ticker : (existing.ticker || '')).toUpperCase().trim();
        if (!cleanTicker) throw new Error('Informe o código de negociação (ticker/símbolo).');
        const duplicate = list.find((i, idx) => idx !== index && i.type !== 'fixed' && String(i.ticker || '').toUpperCase() === cleanTicker);
        if (duplicate) {
          throw new Error(`Já existe outro ativo cadastrado com o código ${cleanTicker}.`);
        }

        const newQty = (data.quantity !== undefined && Number.isFinite(Number(data.quantity)) && Number(data.quantity) >= 0)
          ? Number(data.quantity)
          : Number(existing.quantity) || 0;
        const newAvg = (data.averagePrice !== undefined && Number.isFinite(Number(data.averagePrice)) && Number(data.averagePrice) >= 0)
          ? Number(data.averagePrice)
          : Number(existing.averagePrice) || 0;
        const newCostBasis = newQty * newAvg;

        let updatedQuote = existing.quote || null;
        let updatedCurrentPrice = existing.currentPrice || null;
        if (data.quote && Number.isFinite(Number(data.quote.price)) && Number(data.quote.price) > 0) {
          updatedQuote = {
            ...data.quote,
            symbol: cleanTicker,
            fetchedAt: data.quote.fetchedAt || new Date().toISOString()
          };
          updatedCurrentPrice = Number(updatedQuote.price);
          this.saveCachedQuote(cleanTicker, updatedQuote);
        } else if (cleanTicker !== String(existing.ticker || '').toUpperCase()) {
          const cached = this.getCachedQuote(cleanTicker);
          updatedQuote = cached || null;
          updatedCurrentPrice = cached ? Number(cached.price) : null;
        }

        list[index] = {
          ...existing,
          type: invType,
          ticker: cleanTicker,
          name: (data.name || existing.name || '').trim(),
          institution: (data.institution !== undefined ? data.institution : (existing.institution || '')).trim(),
          quantity: newQty,
          averagePrice: newAvg,
          costBasis: newCostBasis,
          totalInvested: newCostBasis,
          quote: updatedQuote,
          currentPrice: updatedCurrentPrice,
          rateText: '',
          maturityDate: null,
          notes: (data.notes !== undefined ? data.notes : (existing.notes || '')).trim(),
          lastUpdate: new Date().toISOString()
        };
        if (data.quoteError) {
          list[index].quoteError = data.quoteError;
        } else if (data.quote) {
          delete list[index].quoteError;
        }
      }

      this.saveInvestments(list);
      this.createPortfolioSnapshot();
      this._markDataDirty({ type: 'investment' });
      return list[index];
    },

    deleteInvestment(id) {
      const existing = this.getInvestmentById(id);
      const list = this.getInvestments().filter(i => i.id !== id);
      this.saveInvestments(list);
      // Remove transações e proventos vinculados
      const trades = this.getInvestmentTransactions();
      const removedTrades = trades.filter(t => t.investmentId === id);
      const remainingTrades = trades.filter(t => t.investmentId !== id);
      this.saveInvestmentTransactions(remainingTrades);
      const divs = this.getDividends();
      const removedDivs = divs.filter(d => d.investmentId === id);
      const remainingDivs = divs.filter(d => d.investmentId !== id);
      this.saveDividends(remainingDivs);

      // Remove lançamentos financeiros de aporte vinculados a este investimento
      const allTx = this.getTransactions();
      const removedTx = allTx.filter(t =>
        t.id === `inv_tx_${id}` ||
        t.investmentId === id ||
        (existing && t.categoryId === 'cat_inv' && (
          (existing.name && t.description === `Aplicação em Renda Fixa: ${existing.name}`) ||
          (existing.ticker && t.description === `Aporte em Investimento: ${existing.ticker}`)
        ))
      );
      if (removedTx.length > 0) {
        const removedTxIds = new Set(removedTx.map(t => t.id));
        const remainingTx = allTx.filter(t => !removedTxIds.has(t.id));
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(remainingTx));
      }

      if (typeof SupabaseSyncService !== 'undefined') {
        SupabaseSyncService.deleteRecord('investments', id);
        removedTrades.forEach(t => SupabaseSyncService.deleteRecord('investment_transactions', t.id));
        removedDivs.forEach(d => SupabaseSyncService.deleteRecord('dividends', d.id));
        removedTx.forEach(t => SupabaseSyncService.deleteRecord('transactions', t.id));
      }
      this.createPortfolioSnapshot();
      this._markDataDirty({ type: 'investment_deleted' });
      return true;
    },

    executeInvestmentTrade(id, trade) {
      const round8 = x => Math.round(x * 100000000) / 100000000;
      const list = this.getInvestments();
      const index = list.findIndex(i => i.id === id);
      if (index === -1) throw new Error('Ativo não encontrado.');

      const inv = list[index];
      const qty = Number(trade.quantity);
      const unitPrice = Number(trade.unitPrice);
      const fees = Number(trade.fees) || 0;
      const isBuy = trade.type === 'buy';
      const date = trade.date || Utils.getTodayString();

      if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(unitPrice) || unitPrice <= 0) {
        throw new Error('Quantidade e preço devem ser maiores que zero.');
      }
      if (fees < 0) throw new Error('As taxas não podem ser negativas.');

      const currentQty = Number(inv.quantity) || 0;
      const currentCost = this.getCostBasis(inv);
      let totalAmount;
      let costOfSold = null;
      let realizedProfit = null;

      if (isBuy) {
        // Compra: taxas entram no custo e, portanto, no preço médio
        totalAmount = qty * unitPrice + fees;
        const newQty = round8(currentQty + qty);
        const newCost = currentCost + totalAmount;
        inv.quantity = inv.type === 'fixed' ? 1 : newQty;
        inv.costBasis = newCost;
        inv.averagePrice = inv.type === 'fixed' ? newCost : (newCost / newQty);
        if (inv.type === 'fixed') inv.appliedAmount = newCost;
        inv.totalInvested = newCost;
        inv.status = 'active';
        delete inv.closedAt;

        const assetLabel = inv.type === 'fixed' ? inv.name : inv.ticker;
        this.saveTransaction({
          description: `${inv.type === 'fixed' ? 'Aporte em Renda Fixa' : 'Compra de Ativo'}: ${assetLabel}`,
          amount: totalAmount,
          type: 'expense',
          categoryId: 'cat_inv',
          date,
          notes: inv.type === 'fixed'
            ? `Aporte adicional em ${inv.name} (${trade.broker || inv.institution || 'Instituição'})`
            : `Compra de ${qty} cotas a ${Utils.formatCurrency(unitPrice)} cada (${trade.broker || 'Corretora'})`
        });
      } else {
        if (currentQty <= 0) {
          throw new Error('Não há quantidade disponível para venda deste ativo.');
        }
        if (qty > currentQty + 1e-9) {
          throw new Error(`Quantidade a vender (${qty}) é superior à posição atual (${currentQty}).`);
        }
        // Venda: baixa proporcional do custo; o preço médio NÃO muda
        const avg = currentQty > 0 ? (currentCost / currentQty) : (Number(inv.averagePrice) || 0);
        totalAmount = qty * unitPrice - fees;                 // dinheiro líquido recebido (não é lucro)
        if (totalAmount < 0) throw new Error('As taxas não podem ser maiores que o valor da venda.');
        costOfSold = Math.round(qty * avg * 100) / 100;       // custo de aquisição das unidades vendidas
        realizedProfit = Math.round((totalAmount - costOfSold) * 100) / 100; // lucro realizado = recebido - custo
        const newQty = round8(Math.max(0, currentQty - qty));
        if (newQty <= 1e-8) {
          // Venda total das cotas: posição encerrada / totalmente vendida
          inv.quantity = 0;
          inv.costBasis = 0;
          inv.totalInvested = 0;
          if (inv.type === 'fixed') inv.appliedAmount = 0;
          // Regra 5: Preservar o preço médio histórico pago pelo ativo (não zerar)
          inv.averagePrice = avg;
          // Regra 3: O ativo deve ser considerado encerrado ou totalmente vendido
          inv.status = 'closed';
          inv.closedAt = new Date().toISOString();
        } else {
          // Venda parcial: atualiza quantidade restante e custo investido proporcional
          inv.quantity = newQty;
          inv.averagePrice = avg;
          const remainingCost = round8(newQty * avg);
          inv.costBasis = remainingCost;
          inv.totalInvested = remainingCost;
          if (inv.type === 'fixed') inv.appliedAmount = remainingCost;
          inv.status = 'active';
        }
        inv.realizedProfit = Math.round(((Number(inv.realizedProfit) || 0) + realizedProfit) * 100) / 100;

        const assetLabel = inv.type === 'fixed' ? inv.name : inv.ticker;
        this.saveTransaction({
          description: `${inv.type === 'fixed' ? 'Resgate de Renda Fixa' : 'Venda de Ativo'}: ${assetLabel}`,
          amount: totalAmount,
          type: 'income',
          categoryId: 'cat_inv',
          date,
          notes: inv.type === 'fixed'
            ? `Resgate de ${inv.name} (${trade.broker || inv.institution || 'Instituição'})`
            : `Venda de ${qty} cotas a ${Utils.formatCurrency(unitPrice)} cada (${trade.broker || 'Corretora'})`
        });
      }

      inv.lastUpdate = new Date().toISOString();
      this.saveInvestments(list);

      this.saveInvestmentTransaction({
        investmentId: inv.id,
        type: trade.type,
        quantity: qty,
        unitPrice,
        fees,
        totalAmount,
        costOfSold,
        realizedProfit,
        date,
        broker: trade.broker || inv.institution,
        notes: trade.notes || ''
      });

      this.createPortfolioSnapshot();
      return inv;
    },

    getInvestmentTransactions() {
      return this._readJsonSafe(STORAGE_KEYS.INVESTMENT_TRANSACTIONS, []);
    },

    saveInvestmentTransactions(list) {
      localStorage.setItem(STORAGE_KEYS.INVESTMENT_TRANSACTIONS, JSON.stringify(list));
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.syncAllInvestmentTransactions(list);
    },

    saveInvestmentTransaction(trade) {
      const list = this.getInvestmentTransactions();
      const newTrade = {
        id: trade.id || Utils.generateId(),
        investmentId: trade.investmentId,
        type: trade.type,
        quantity: Number(trade.quantity),
        unitPrice: Number(trade.unitPrice),
        fees: Number(trade.fees) || 0,
        totalAmount: Number(trade.totalAmount),
        costOfSold: trade.costOfSold === undefined || trade.costOfSold === null ? null : Number(trade.costOfSold),
        realizedProfit: trade.realizedProfit === undefined || trade.realizedProfit === null ? null : Number(trade.realizedProfit),
        date: trade.date || Utils.getTodayString(),
        broker: (trade.broker || '').trim(),
        notes: (trade.notes || '').trim()
      };
      list.unshift(newTrade);
      this.saveInvestmentTransactions(list);
      return newTrade;
    },

    // Exclui uma operação. Se o histórico do ativo for coerente com a posição, recalcula quantidade, custo,
    // preço médio e lucro realizado; caso contrário apaga só o registro (e informa que a posição não mudou).
    deleteInvestmentTransaction(id) {
      const trades = this.getInvestmentTransactions();
      const trade = trades.find(t => t.id === id);
      if (!trade) return { removed: false, recomputed: false };

      const remaining = trades.filter(t => t.id !== id);
      const list = this.getInvestments();
      const inv = list.find(i => i.id === trade.investmentId);
      let recomputed = false;

      if (inv) {
        const before = this.replayInvestmentTrades(inv.id, trades);
        if (before && this.positionMatchesReplay(inv, before)) {
          const after = this.replayInvestmentTrades(inv.id, remaining);
          if (!after) {
            throw new Error('Não é possível excluir esta operação: as vendas posteriores ficariam maiores que a posição.');
          }
          inv.quantity = Math.round(after.qty * 100000000) / 100000000;
          inv.costBasis = after.cost;
          inv.totalInvested = after.cost;
          inv.averagePrice = after.avg;
          inv.realizedProfit = after.realized;
          inv.status = inv.quantity > 0 ? 'active' : 'closed';
          if (inv.quantity === 0) inv.closedAt = new Date().toISOString();
          else delete inv.closedAt;
          delete inv.realizedLegacyUnknown;
          inv.lastUpdate = new Date().toISOString();
          remaining.forEach(t => {
            if (t.investmentId === inv.id && t.type === 'sell' && after.perTrade[t.id]) {
              t.costOfSold = after.perTrade[t.id].costOfSold;
              t.realizedProfit = after.perTrade[t.id].realizedProfit;
            }
          });
          this.saveInvestments(list);
          recomputed = true;
        }
      }
      this.saveInvestmentTransactions(remaining);
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.deleteRecord('investment_transactions', id);
      if (recomputed) this.createPortfolioSnapshot();
      return { removed: true, recomputed };
    },

    // ==========================================
    // PROVENTOS / DIVIDENDOS
    // ==========================================

    getDividends() {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.DIVIDENDS);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        try { localStorage.setItem(STORAGE_KEYS.DIVIDENDS + '_corrompido_' + Date.now(), localStorage.getItem(STORAGE_KEYS.DIVIDENDS) || ''); } catch (_) {}
        return [];
      }
    },

    saveDividends(list) {
      localStorage.setItem(STORAGE_KEYS.DIVIDENDS, JSON.stringify(list));
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.syncAllDividends(list);
    },

    saveDividend(dividend) {
      const list = this.getDividends();
      const amount = Number(dividend.amount) || 0;
      const newDiv = {
        id: dividend.id || Utils.generateId(),
        investmentId: dividend.investmentId,
        ticker: dividend.ticker || 'PROVENTO',
        type: dividend.type || 'dividend',
        amount: amount,
        quantityRef: Number(dividend.quantityRef) || 0,
        date: dividend.date || Utils.getTodayString(),
        notes: (dividend.notes || '').trim()
      };
      list.unshift(newDiv);
      this.saveDividends(list);

      // Registra provento como receita na conta
      this.saveTransaction({
        description: `Provento Recebido: ${newDiv.ticker} (${newDiv.type.toUpperCase()})`,
        amount: amount,
        type: 'income',
        categoryId: 'cat_inv',
        date: newDiv.date,
        notes: newDiv.notes || 'Rendimento financeiro recebido'
      });

      return newDiv;
    },

    deleteDividend(id) {
      const list = this.getDividends().filter(d => d.id !== id);
      this.saveDividends(list);
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.deleteRecord('dividends', id);
      return true;
    },

    // ==========================================
    // METAS DE INVESTIMENTO
    // ==========================================

    getInvestmentGoals() {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.INVESTMENT_GOALS);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        return [];
      }
    },

    saveInvestmentGoals(list) {
      localStorage.setItem(STORAGE_KEYS.INVESTMENT_GOALS, JSON.stringify(list));
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.syncAllInvestmentGoals(list);
    },

    saveInvestmentGoal(goal) {
      const list = this.getInvestmentGoals();
      const newGoal = {
        id: goal.id || Utils.generateId(),
        name: goal.name.trim(),
        targetAmount: Number(goal.targetAmount),
        deadline: goal.deadline || null,
        description: (goal.description || '').trim()
      };
      list.push(newGoal);
      this.saveInvestmentGoals(list);
      return newGoal;
    },

    deleteInvestmentGoal(id) {
      const list = this.getInvestmentGoals().filter(g => g.id !== id);
      this.saveInvestmentGoals(list);
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.deleteRecord('investment_goals', id);
      return true;
    },

    // ==========================================
    // SNAPSHOTS E VALORES PATRIMONIAIS
    // ==========================================

    // Valor de mercado dos ativos com cotação + valor aplicado da renda fixa (sem marcação a mercado)
    getTotalInInvestments() {
      const s = this.getPortfolioSummary();
      return s.marketValue + s.fixedApplied;
    },

    getTotalInvestedCost() {
      return this.getPortfolioSummary().totalCost;
    },

    getPortfolioSnapshots() {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.PORTFOLIO_SNAPSHOTS);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        return [];
      }
    },

    savePortfolioSnapshots(list) {
      localStorage.setItem(STORAGE_KEYS.PORTFOLIO_SNAPSHOTS, JSON.stringify(list));
      if (typeof SupabaseSyncService !== 'undefined') SupabaseSyncService.syncAllPortfolioSnapshots(list);
    },

    // Registra um snapshot com valores EFETIVAMENTE calculados (cotações reais + posição atual).
    // Nunca estima ou preenche o passado.
    createPortfolioSnapshot() {
      const s = this.getPortfolioSummary();
      const value = s.marketValue + s.fixedApplied;
      if (s.openPositions === 0 || value <= 0) return null;

      const snapshots = this.getPortfolioSnapshots();
      const today = Utils.getTodayString();
      const complete = s.unquotedCount === 0; // só é "completo" se todos os ativos variáveis tinham cotação válida
      const entry = {
        date: today,
        recordedAt: new Date().toISOString(),
        calculated: true,
        complete,
        value: Math.round(value * 100) / 100,
        marketValue: Math.round(s.marketValue * 100) / 100,
        fixedApplied: Math.round(s.fixedApplied * 100) / 100,
        cost: Math.round(s.totalCost * 100) / 100,
        unquotedCount: s.unquotedCount,
        positions: s.positions
      };

      const idx = snapshots.findIndex(x => x.date === today);
      if (idx !== -1) {
        // não troca um registro completo do dia por um incompleto
        if (snapshots[idx].complete && !complete) return snapshots[idx];
        snapshots[idx] = entry;
      } else {
        snapshots.push(entry);
      }
      snapshots.sort((a, b) => a.date.localeCompare(b.date));
      this.savePortfolioSnapshots(snapshots);
      return entry;
    },

    exportInvestmentsToCsv() {
      const investments = this.getActiveInvestments();
      const num = (v) => (v === null || v === undefined || !Number.isFinite(v)) ? '' : v.toFixed(2).replace('.', ',');
      const classLabel = (t) => t === 'stock' ? 'Acao' : t === 'fii' ? 'FII' : t === 'crypto' ? 'Criptomoeda' : 'Renda Fixa';
      const headers = ['Classe;Codigo/Simbolo;Nome do Investimento;Instituicao;Quantidade;Preco Medio de Compra;Cotacao Atual Automatica;Fonte da Cotacao;Valor Total Investido / Aplicado;Valor da Posicao Atual;Tipo Rentabilidade (Renda Fixa);Taxa Contratada (Renda Fixa);Data Aplicacao;Data Vencimento;Rentabilidade Acumulada (R$);Resultado Nao Realizado (R$);Rentabilidade (%)'];
      const rows = investments.map(inv => {
        if (inv.type === 'fixed') {
          const applied = this.getAppliedAmount(inv);
          const accYield = this.getAccumulatedYield(inv);
          const posVal = accYield !== null ? applied + accYield : applied;
          const pct = (accYield !== null && applied > 0) ? (accYield / applied) * 100 : null;
          return [
            classLabel(inv.type),
            '',
            (inv.name || '').replace(/;/g, ' '),
            (inv.institution || '-').replace(/;/g, ' '),
            '',
            '',
            '',
            '',
            num(applied),
            num(posVal),
            inv.yieldType || inv.benchmark || 'CDI',
            (inv.rateText || '').replace(/;/g, ' '),
            inv.applicationDate ? Utils.formatDate(inv.applicationDate) : '',
            inv.maturityDate ? Utils.formatDate(inv.maturityDate) : '',
            num(accYield),
            num(accYield),
            num(pct)
          ].join(';');
        }
        const qty = Number(inv.quantity) || 0;
        const cost = this.getCostBasis(inv);
        const price = this.getMarketPrice(inv);
        const mv = price === null ? null : qty * price;
        const profit = mv === null ? null : mv - cost;
        const pct = (profit !== null && cost > 0) ? (profit / cost) * 100 : null;
        return [
          classLabel(inv.type),
          inv.ticker || '',
          (inv.name || '').replace(/;/g, ' '),
          (inv.institution || '-').replace(/;/g, ' '),
          String(qty).replace('.', ','),
          num(Number(inv.averagePrice) || 0),
          num(price),
          price === null ? '' : (inv.quote.source || ''),
          num(cost),
          num(mv),
          '',
          '',
          '',
          '',
          '',
          num(profit),
          num(pct)
        ].join(';');
      });
      const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
      Utils.downloadFile(csvContent, `meu_controle_investimentos_${Utils.getTodayString()}.csv`, 'text/csv;charset=utf-8');
    }
  };

  // =========================================================================
  // 3. STATE STORE & FINANCIAL CALCULATIONS ENGINE
  // =========================================================================
  class StateStore {
    constructor() {
      this.subscribers = [];
      this.currentView = 'dashboard';
      const today = new Date();
      this.dashboardFilter = {
        month: today.getMonth() + 1,
        year: today.getFullYear()
      };
      this.transactionsFilter = {
        search: '',
        type: 'all',
        categoryId: 'all',
        period: 'all'
      };
      this.reportsFilter = {
        preset: 'current_month',
        startDate: null,
        endDate: null
      };
    }

    subscribe(callback) {
      this.subscribers.push(callback);
      return () => {
        this.subscribers = this.subscribers.filter(fn => fn !== callback);
      };
    }

    notify(eventName, payload = null) {
      this.subscribers.forEach(fn => {
        try { fn(eventName, payload); } catch (e) { console.error(e); }
      });
    }

    setView(viewName) {
      this.currentView = viewName;
      this.notify('view_changed', viewName);
    }

    setDashboardFilter(month, year) {
      this.dashboardFilter = {
        month: month === 'all' ? 'all' : parseInt(month, 10),
        year: parseInt(year, 10)
      };
      this.notify('dashboard_filter_changed', this.dashboardFilter);
    }

    setTransactionsFilter(newFilters) {
      this.transactionsFilter = { ...this.transactionsFilter, ...newFilters };
      this.notify('transactions_filter_changed', this.transactionsFilter);
    }

    setReportsFilter(preset, startDate = null, endDate = null) {
      this.reportsFilter = { preset, startDate, endDate };
      this.notify('reports_filter_changed', this.reportsFilter);
    }

    filterByMonthAndYear(transactions, month, year) {
      return transactions.filter(t => {
        if (!t.date) return false;
        const [tY, tM] = t.date.split('-').map(n => parseInt(n, 10));
        if (year && tY !== year) return false;
        if (month !== 'all' && tM !== month) return false;
        return true;
      });
    }

    calculateMetrics(transactions) {
      let income = 0;
      let expense = 0;
      for (const t of transactions) {
        const val = Math.abs(Number(t.amount) || 0);
        if (t.type === 'income') income += val;
        else if (t.type === 'expense') expense += val;
      }
      const reservedInCaixinhas = Storage.getTotalInCaixinhas();
      const investedWealth = Storage.getTotalInInvestments();
      const balance = income - expense;
      const totalWealth = balance + reservedInCaixinhas + investedWealth;
      let savingsRate = 0;
      if (income > 0) {
        savingsRate = Math.max(0, Math.round(((income - expense) / income) * 100));
      }
      return { balance, income, expense, savingsRate, reservedInCaixinhas, investedWealth, totalWealth };
    }

    calculateInvestmentMetrics() {
      const s = Storage.getPortfolioSummary();
      const dividends = Storage.getDividends();
      const r2 = x => Math.round(x * 100) / 100;

      // Resultado não realizado: somente ativos COM cotação válida (custo x valor de mercado)
      const unrealizedProfit = s.marketValue - s.quotedCost;
      const profitPercentage = s.quotedCost > 0 ? (unrealizedProfit / s.quotedCost) * 100 : 0;
      const totalDividends = dividends.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

      return {
        totalCurrentValue: r2(s.marketValue),       // valor de mercado (apenas ativos com cotação)
        marketValue: r2(s.marketValue),
        fixedAppliedValue: r2(s.fixedApplied),      // renda fixa: valor aplicado
        fixedAccumulatedYield: r2(s.fixedAccumulatedYield || 0),
        unquotedCount: s.unquotedCount,
        unquotedCost: r2(s.unquotedCost),
        totalInvested: r2(s.totalCost),             // custo contábil total da posição atual
        quotedCost: r2(s.quotedCost),
        unrealizedProfit: r2(unrealizedProfit),
        profitPercentage: r2(profitPercentage),
        realizedProfit: r2(s.realizedProfit),
        realizedHasUnknown: s.realizedHasUnknown,
        totalDividends: r2(totalDividends),
        totalAssets: s.openPositions
      };
    }

    getCategoryBreakdown(transactions, type = 'expense') {
      const categories = Storage.getCategories();
      const catMap = new Map(categories.map(c => [c.id, c]));
      const filtered = transactions.filter(t => t.type === type);
      const totals = new Map();
      let totalSum = 0;

      for (const t of filtered) {
        const catId = t.categoryId;
        const cur = totals.get(catId) || 0;
        const val = Number(t.amount) || 0;
        totals.set(catId, cur + val);
        totalSum += val;
      }

      const result = [];
      totals.forEach((amount, catId) => {
        const cat = catMap.get(catId) || { id: catId, name: 'Outros', icon: '🏷️', color: '#94a3b8' };
        const percentage = totalSum > 0 ? (amount / totalSum) * 100 : 0;
        result.push({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          amount,
          percentage: Math.round(percentage * 10) / 10
        });
      });

      result.sort((a, b) => b.amount - a.amount);
      return { items: result, totalSum };
    }

    getMonthlyEvolution(transactions, year) {
      const months = Array.from({ length: 12 }, (_, i) => ({
        monthIndex: i,
        income: 0,
        expense: 0
      }));

      for (const t of transactions) {
        if (!t.date) continue;
        const [tY, tM] = t.date.split('-').map(n => parseInt(n, 10));
        if (tY === year && tM >= 1 && tM <= 12) {
          const idx = tM - 1;
          const val = Number(t.amount) || 0;
          if (t.type === 'income') months[idx].income += val;
          else if (t.type === 'expense') months[idx].expense += val;
        }
      }
      return months;
    }
  }

  const State = new StateStore();

  // =========================================================================
  // 4. CANVAS CHART ENGINE (INTERATIVO COM TOOLTIPS)
  // =========================================================================
  const Charts = {
    getTooltip(canvas) {
      const container = canvas.parentElement;
      if (!container) return null;
      let tip = container.querySelector('.chart-tooltip');
      if (!tip) {
        tip = document.createElement('div');
        tip.className = 'chart-tooltip';
        container.appendChild(tip);
      }
      return tip;
    },

    renderBarChart(canvas, data) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || canvas.parentElement.clientWidth || 500;
      const height = rect.height || 280;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const textColor = isDark ? '#94a3b8' : '#64748b';
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)';
      const highlightBg = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.03)';
      const incomeColor = '#10b981';
      const expenseColor = '#ef4444';

      const padding = { top: 25, right: 20, bottom: 45, left: 65 };
      const chartW = width - padding.left - padding.right;
      const chartH = height - padding.top - padding.bottom;

      let maxVal = 0;
      data.forEach(d => {
        if (d.income > maxVal) maxVal = d.income;
        if (d.expense > maxVal) maxVal = d.expense;
      });
      if (maxVal === 0) maxVal = 1000;
      maxVal = Math.ceil(maxVal * 1.15);

      const groupCount = data.length;
      const groupWidth = chartW / groupCount;
      const barWidth = Math.min(22, (groupWidth - 10) / 2);

      const draw = (hoveredIndex = -1) => {
        ctx.clearRect(0, 0, width, height);

        const hasData = data.some(d => d.income > 0 || d.expense > 0);
        if (!hasData) {
          ctx.fillStyle = textColor;
          ctx.font = '500 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Nenhuma movimentação registrada no período selecionado', width / 2, height / 2);
          return;
        }

        const gridSteps = 4;
        ctx.lineWidth = 1;
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        for (let i = 0; i <= gridSteps; i++) {
          const yVal = (maxVal / gridSteps) * i;
          const yPos = padding.top + chartH - (chartH * (i / gridSteps));

          ctx.strokeStyle = gridColor;
          ctx.beginPath();
          ctx.moveTo(padding.left, yPos);
          ctx.lineTo(padding.left + chartW, yPos);
          ctx.stroke();

          ctx.fillStyle = textColor;
          const label = yVal >= 1000 ? `R$ ${(yVal / 1000).toFixed(1)}k` : `R$ ${Math.round(yVal)}`;
          ctx.fillText(label, padding.left - 8, yPos);
        }

        data.forEach((d, idx) => {
          const groupLeft = padding.left + (idx * groupWidth);
          const groupCenterX = groupLeft + (groupWidth / 2);

          if (idx === hoveredIndex) {
            ctx.fillStyle = highlightBg;
            this.drawRoundedRect(ctx, groupLeft + 2, padding.top, groupWidth - 4, chartH, 6);
          }

          const incomeH = (d.income / maxVal) * chartH;
          const expenseH = (d.expense / maxVal) * chartH;

          if (incomeH > 0) {
            ctx.fillStyle = incomeColor;
            this.drawRoundedRect(ctx, groupCenterX - barWidth - 2, padding.top + chartH - incomeH, barWidth, incomeH, 4);
          }

          if (expenseH > 0) {
            ctx.fillStyle = expenseColor;
            this.drawRoundedRect(ctx, groupCenterX + 2, padding.top + chartH - expenseH, barWidth, expenseH, 4);
          }

          ctx.fillStyle = (idx === hoveredIndex) ? (isDark ? '#f8fafc' : '#0f172a') : textColor;
          ctx.font = (idx === hoveredIndex) ? '600 11px sans-serif' : '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(Utils.getMonthShortName(d.monthIndex), groupCenterX, padding.top + chartH + 10);
        });

        this.drawChartLegend(ctx, width - padding.right, padding.top - 12, [
          { label: 'Receitas', color: incomeColor },
          { label: 'Despesas', color: expenseColor }
        ]);
      };

      draw(-1);

      const tooltip = this.getTooltip(canvas);

      if (canvas._barMouseHandler) {
        canvas.removeEventListener('mousemove', canvas._barMouseHandler);
        canvas.removeEventListener('mouseleave', canvas._barLeaveHandler);
      }

      const onMouseMove = (e) => {
        const cRect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - cRect.left;
        const mouseY = e.clientY - cRect.top;

        if (mouseX >= padding.left && mouseX <= padding.left + chartW && mouseY >= padding.top && mouseY <= padding.top + chartH + 20) {
          const idx = Math.floor((mouseX - padding.left) / groupWidth);
          if (idx >= 0 && idx < data.length) {
            const d = data[idx];
            draw(idx);

            if (tooltip) {
              const monthFullName = Utils.getMonthName(d.monthIndex);
              const netBalance = d.income - d.expense;
              tooltip.innerHTML = `
                <div style="font-weight: 700; margin-bottom: 4px; border-bottom: 1px solid var(--border-color); padding-bottom: 2px;">${monthFullName}</div>
                <div style="display: flex; justify-content: space-between; gap: 12px; color: var(--color-income);">
                  <span>Receitas:</span> <strong>+ ${Utils.formatCurrency(d.income)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 12px; color: var(--color-expense);">
                  <span>Despesas:</span> <strong>- ${Utils.formatCurrency(d.expense)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 12px; margin-top: 2px; font-weight: 600; color: ${netBalance >= 0 ? 'var(--color-income)' : 'var(--color-expense)'};">
                  <span>Saldo:</span> <strong>${Utils.formatCurrency(netBalance)}</strong>
                </div>
              `;
              tooltip.style.left = `${mouseX}px`;
              tooltip.style.top = `${mouseY}px`;
              tooltip.classList.add('visible');
            }
            return;
          }
        }

        draw(-1);
        if (tooltip) tooltip.classList.remove('visible');
      };

      const onMouseLeave = () => {
        draw(-1);
        if (tooltip) tooltip.classList.remove('visible');
      };

      canvas._barMouseHandler = onMouseMove;
      canvas._barLeaveHandler = onMouseLeave;

      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('mouseleave', onMouseLeave);
    },

    renderDonutChart(canvas, items, totalSum) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || canvas.parentElement.clientWidth || 360;
      const height = rect.height || 280;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const textColor = isDark ? '#f8fafc' : '#0f172a';
      const subtextColor = isDark ? '#94a3b8' : '#64748b';

      const centerX = width / 2;
      const centerY = height / 2;
      const baseOuterRadius = Math.min(centerX, centerY) - 22;
      const baseInnerRadius = baseOuterRadius * 0.65;

      let currentAngle = -Math.PI / 2;
      const slices = (items || []).filter(item => item.amount > 0).map(item => {
        const sliceAngle = (item.amount / totalSum) * (Math.PI * 2);
        const s = {
          item,
          startAngle: currentAngle,
          endAngle: currentAngle + sliceAngle
        };
        currentAngle += sliceAngle;
        return s;
      });

      const draw = (hoveredSliceIndex = -1) => {
        ctx.clearRect(0, 0, width, height);

        if (!items || items.length === 0 || totalSum === 0) {
          ctx.fillStyle = subtextColor;
          ctx.font = '500 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Nenhum gasto registrado neste período', width / 2, height / 2);
          return;
        }

        slices.forEach((s, idx) => {
          const isHovered = (idx === hoveredSliceIndex);
          const outerRadius = isHovered ? baseOuterRadius + 8 : baseOuterRadius;
          const innerRadius = isHovered ? baseInnerRadius - 2 : baseInnerRadius;

          ctx.beginPath();
          ctx.arc(centerX, centerY, outerRadius, s.startAngle, s.endAngle);
          ctx.arc(centerX, centerY, innerRadius, s.endAngle, s.startAngle, true);
          ctx.closePath();

          ctx.fillStyle = s.item.color || '#3b82f6';
          ctx.fill();

          ctx.lineWidth = isHovered ? 3 : 2;
          ctx.strokeStyle = isDark ? '#111827' : '#ffffff';
          ctx.stroke();
        });

        if (hoveredSliceIndex >= 0 && slices[hoveredSliceIndex]) {
          const active = slices[hoveredSliceIndex].item;
          ctx.fillStyle = textColor;
          ctx.font = '600 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(`${active.icon} ${active.name}`, centerX, centerY - 2);

          ctx.fillStyle = active.color || textColor;
          ctx.font = '700 15px sans-serif';
          ctx.textBaseline = 'top';
          ctx.fillText(`${Utils.formatCurrency(active.amount)}`, centerX, centerY + 2);
        } else {
          ctx.fillStyle = subtextColor;
          ctx.font = '500 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText('Total Gasto', centerX, centerY - 2);

          ctx.fillStyle = textColor;
          ctx.font = '700 16px sans-serif';
          ctx.textBaseline = 'top';
          ctx.fillText(Utils.formatCurrency(totalSum), centerX, centerY + 2);
        }
      };

      draw(-1);

      const tooltip = this.getTooltip(canvas);

      if (canvas._donutMouseHandler) {
        canvas.removeEventListener('mousemove', canvas._donutMouseHandler);
        canvas.removeEventListener('mouseleave', canvas._donutLeaveHandler);
      }

      const onMouseMove = (e) => {
        if (slices.length === 0) return;
        const cRect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - cRect.left;
        const mouseY = e.clientY - cRect.top;

        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        const dist = Math.hypot(dx, dy);

        if (dist >= baseInnerRadius * 0.7 && dist <= baseOuterRadius + 15) {
          let angle = Math.atan2(dy, dx);
          if (angle < -Math.PI / 2) {
            angle += Math.PI * 2;
          }

          const foundIndex = slices.findIndex(s => angle >= s.startAngle && angle < s.endAngle);
          if (foundIndex >= 0) {
            const hovered = slices[foundIndex].item;
            draw(foundIndex);

            if (tooltip) {
              tooltip.innerHTML = `
                <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; margin-bottom: 2px;">
                  <span style="font-size: 1.1rem;">${hovered.icon}</span>
                  <span>${Utils.escapeHtml(hovered.name)}</span>
                </div>
                <div style="color: ${hovered.color}; font-weight: 700; font-size: 0.95rem;">
                  ${Utils.formatCurrency(hovered.amount)}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">
                  ${hovered.percentage}% de todas as despesas
                </div>
              `;
              tooltip.style.left = `${mouseX}px`;
              tooltip.style.top = `${mouseY}px`;
              tooltip.classList.add('visible');
            }
            return;
          }
        }

        draw(-1);
        if (tooltip) tooltip.classList.remove('visible');
      };

      const onMouseLeave = () => {
        draw(-1);
        if (tooltip) tooltip.classList.remove('visible');
      };

      canvas._donutMouseHandler = onMouseMove;
      canvas._donutLeaveHandler = onMouseLeave;

      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('mouseleave', onMouseLeave);
    },

    drawRoundedRect(ctx, x, y, width, height, radius) {
      if (height < radius) radius = height;
      ctx.beginPath();
      ctx.moveTo(x, y + height);
      ctx.lineTo(x, y + radius);
      ctx.arcTo(x, y, x + radius, y, radius);
      ctx.lineTo(x + width - radius, y);
      ctx.arcTo(x + width, y, x + width, y + radius, radius);
      ctx.lineTo(x + width, y + height);
      ctx.closePath();
      ctx.fill();
    },

    drawChartLegend(ctx, rightX, y, items) {
      let currentX = rightX;
      ctx.font = '11px sans-serif';
      ctx.textBaseline = 'middle';
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const textWidth = ctx.measureText(item.label).width;
        currentX -= textWidth;
        ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#94a3b8' : '#475569';
        ctx.textAlign = 'left';
        ctx.fillText(item.label, currentX, y);

        currentX -= 16;
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(currentX + 6, y, 4, 0, Math.PI * 2);
        ctx.fill();

        currentX -= 14;
      }
    }
  };

// =========================================================================
// MARKET API SERVICE (com Fallback Inteligente, Cache e Preços BRL)
// =========================================================================
const QUOTE_SETTINGS = {
  STALE_AFTER_MS: 60 * 60 * 1000,        // sem confirmação há mais de 1h => "Desatualizada"
  MIN_ASSET_INTERVAL_MS: 60 * 1000,      // cache: não consulta o mesmo ativo mais de 1x por minuto (exceto atualização manual)
  AUTO_REFRESH_MS: 5 * 60 * 1000,        // atualização automática a cada 5 min (aba visível)
  CRYPTO_MAX_PROVIDER_AGE_MS: 6 * 60 * 60 * 1000, // cripto negocia 24h: dado da fonte com mais de 6h é rejeitado
  REQUEST_TIMEOUT_MS: 10000,
  B3_GAP_MS: 300,                         // intervalo entre consultas à brapi (controle de limite)
  BRAPI_DEFAULT_BASE: 'https://brapi.dev/api'
};

const MarketApiService = {
  lastUpdated: null,
  isUpdating: false,
  updatingIds: new Set(),
  timer: null,

  // ---------- utilidades ----------
  async _fetchJson(url) {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), QUOTE_SETTINGS.REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: ctrl.signal, headers: { 'Accept': 'application/json' } });
      let data = null;
      try { data = await res.json(); } catch (_) { /* corpo vazio ou não-JSON */ }
      return { ok: res.ok, status: res.status, data };
    } finally {
      clearTimeout(to);
    }
  },

  _toIso(v) {
    if (v === null || v === undefined || v === '') return null;
    const d = typeof v === 'number' ? new Date(v < 1e12 ? v * 1000 : v) : new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString();
  },

  _friendlyError(e) {
    if (!e) return 'erro desconhecido';
    if (e.name === 'AbortError') return 'tempo de resposta esgotado';
    if (e instanceof TypeError) return 'sem conexão ou consulta bloqueada pelo navegador (CORS)';
    return e.message || String(e);
  },

  _validPrice(v) {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  },

  // ---------- B3 (ações e FIIs) via brapi.dev ----------
  async fetchB3Quote(ticker) {
    const t = String(ticker || '').toUpperCase().trim();
    if (!/^[A-Z]{4}\d{1,2}[A-Z]?$/.test(t)) {
      const err = new Error(`O código "${ticker}" não foi localizado ou não é um ticker válido da B3.`);
      err.code = 'NOT_FOUND';
      throw err;
    }
    const s = Storage.getSettings();
    const base = String(s.brapiBaseUrl || QUOTE_SETTINGS.BRAPI_DEFAULT_BASE).replace(/\/+$/, '');
    const url = `${base}/quote/${encodeURIComponent(t)}` + (s.brapiToken ? `?token=${encodeURIComponent(s.brapiToken)}` : '');
    let r;
    try {
      r = await this._fetchJson(url);
    } catch (netErr) {
      const err = new Error(this._friendlyError(netErr));
      err.code = 'API_UNAVAILABLE';
      throw err;
    }

    const catEntry = TICKER_CATALOG.find(c => (c.type === 'fii' || c.type === 'stock') && c.ticker === t);

    // Se a rota /quote/{ticker} exigir token para ativos como MXRF11, HGLG11, KNRI11,
    // consulta automaticamente o endpoint público de listagem/busca da própria brapi.dev (/quote/list?search=TICKER)
    if ([401, 402, 403].includes(r.status)) {
      let listRes;
      try {
        listRes = await this._fetchJson(`${base}/quote/list?search=${encodeURIComponent(t)}&limit=20`);
      } catch (netErr) {
        const err = new Error(this._friendlyError(netErr));
        err.code = 'API_UNAVAILABLE';
        throw err;
      }
      if (!listRes.ok) {
        const err = new Error(`Serviço de cotações indisponível no momento (HTTP ${listRes.status})`);
        err.code = 'API_UNAVAILABLE';
        throw err;
      }
      const stocks = (listRes.data && Array.isArray(listRes.data.stocks)) ? listRes.data.stocks : [];
      const match = stocks.find(st => String(st.stock || '').toUpperCase() === t);
      if (!match) {
        const err = new Error(`Ativo "${t}" não foi localizado na B3.`);
        err.code = 'NOT_FOUND';
        throw err;
      }
      const price = this._validPrice(match.close);
      if (price === null) {
        const err = new Error(`Cotação indisponível para ${t} no momento.`);
        err.code = 'API_UNAVAILABLE';
        throw err;
      }
      const isFii = catEntry
        ? catEntry.type === 'fii'
        : (String(match.type || '').toLowerCase() === 'fund' || String(match.sector || '').toLowerCase().includes('fii') || (/11B?$/.test(t) && !['TAEE11', 'SANB11', 'KLBN11', 'ALUP11', 'BPAC11', 'ENGI11', 'SAPR11'].includes(t)));
      const cleanProviderName = catEntry ? catEntry.name : (match.name || t);
      const quoteObj = {
        price,
        currency: 'BRL',
        source: 'brapi.dev',
        symbol: t,
        providerName: cleanProviderName,
        detectedType: isFii ? 'fii' : 'stock',
        marketTime: new Date().toISOString()
      };
      Storage.saveCachedQuote(t, quoteObj);
      return quoteObj;
    }

    if (r.status === 404 || (r.status === 400 && r.data && r.data.error)) {
      const err = new Error(`Ativo "${t}" não foi localizado na B3.`);
      err.code = 'NOT_FOUND';
      throw err;
    }
    if (r.status === 429) {
      const err = new Error('Limite de requisições da API atingido. Tente novamente em instantes.');
      err.code = 'API_UNAVAILABLE';
      throw err;
    }
    if (!r.ok) {
      const err = new Error(`API de cotações respondeu HTTP ${r.status}`);
      err.code = 'API_UNAVAILABLE';
      throw err;
    }

    const item = r.data && Array.isArray(r.data.results) ? r.data.results[0] : null;
    if (!item) {
      const err = new Error(`Ativo "${t}" não foi localizado.`);
      err.code = 'NOT_FOUND';
      throw err;
    }
    if (String(item.symbol || '').toUpperCase() !== t) {
      const err = new Error(`A fonte retornou ${item.symbol || '?'} em vez de ${t}`);
      err.code = 'API_UNAVAILABLE';
      throw err;
    }
    if (item.currency && String(item.currency).toUpperCase() !== 'BRL') {
      const err = new Error(`A fonte retornou preço em ${item.currency}, esperado BRL`);
      err.code = 'API_UNAVAILABLE';
      throw err;
    }
    const price = this._validPrice(item.regularMarketPrice);
    if (price === null) {
      const err = new Error('Preço inválido retornado pela API');
      err.code = 'API_UNAVAILABLE';
      throw err;
    }

    const isFii = catEntry
      ? catEntry.type === 'fii'
      : (/11B?$/.test(t) && !['TAEE11', 'SANB11', 'KLBN11', 'ALUP11', 'BPAC11', 'ENGI11', 'SAPR11'].includes(t));
    const quoteObj = {
      price,
      currency: 'BRL',
      source: 'brapi.dev',
      symbol: t,
      providerName: (catEntry && catEntry.name) || item.longName || item.shortName || t,
      detectedType: isFii ? 'fii' : 'stock',
      marketTime: this._toIso(item.regularMarketTime)
    };
    Storage.saveCachedQuote(t, quoteObj);
    return quoteObj;
  },

  // ---------- Criptomoedas (CoinGecko, preço direto em BRL; Binance como reserva) ----------
  async resolveCoingeckoId(inv) {
    if (inv.coingeckoId) return inv.coingeckoId;
    const sym = String(inv.ticker || '').toUpperCase().trim();
    const cat = TICKER_CATALOG.find(c => c.type === 'crypto' && c.ticker === sym && c.coingeckoId);
    if (cat) return cat.coingeckoId;

    let r;
    try {
      r = await this._fetchJson(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(sym)}`);
    } catch (netErr) {
      const err = new Error(this._friendlyError(netErr));
      err.code = 'API_UNAVAILABLE';
      throw err;
    }
    if (r.status === 429) {
      const err = new Error('limite de requisições da CoinGecko atingido');
      err.code = 'API_UNAVAILABLE';
      throw err;
    }
    if (!r.ok) {
      const err = new Error(`CoinGecko respondeu HTTP ${r.status} ao identificar ${sym}`);
      err.code = 'API_UNAVAILABLE';
      throw err;
    }
    const exact = ((r.data && r.data.coins) || []).filter(c => String(c.symbol).toUpperCase() === sym && c.market_cap_rank);
    if (exact.length === 0) {
      const err = new Error(`Criptomoeda "${sym}" não foi localizada.`);
      err.code = 'NOT_FOUND';
      throw err;
    }
    exact.sort((a, b) => (a.market_cap_rank || 999999) - (b.market_cap_rank || 999999));
    inv._resolvedCoinName = exact[0].name || sym;
    return exact[0].id;
  },

  async fetchCoingeckoBatch(ids) {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.map(encodeURIComponent).join(',')}&vs_currencies=brl&include_last_updated_at=true`;
    const r = await this._fetchJson(url);
    if (r.status === 429) throw new Error('limite de requisições da CoinGecko atingido');
    if (!r.ok) throw new Error(`CoinGecko respondeu HTTP ${r.status}`);
    return r.data || {};
  },

  _parseCoingecko(data, id, ticker) {
    const e = data && data[id];
    if (!e) throw new Error(`CoinGecko não retornou o ativo "${id}"`);
    const price = this._validPrice(e.brl);
    if (price === null) throw new Error('preço em BRL inválido retornado pela CoinGecko');
    const marketTime = this._toIso(e.last_updated_at);
    if (marketTime && Date.now() - new Date(marketTime).getTime() > QUOTE_SETTINGS.CRYPTO_MAX_PROVIDER_AGE_MS) {
      throw new Error('a CoinGecko devolveu um preço antigo (mais de 6h)');
    }
    const sym = String(ticker).toUpperCase().trim();
    const cat = TICKER_CATALOG.find(c => c.type === 'crypto' && c.ticker === sym);
    return {
      price,
      currency: 'BRL',
      source: 'CoinGecko',
      symbol: sym,
      providerId: id,
      providerName: cat ? cat.name : null,
      detectedType: 'crypto',
      marketTime
    };
  },

  async fetchBinanceBrl(symbol) {
    const sym = String(symbol).toUpperCase().trim();
    const pair = `${sym}BRL`;
    const r = await this._fetchJson(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
    if (!r.ok || !r.data) throw new Error(`Binance respondeu HTTP ${r.status}`);
    if (r.data.symbol !== pair) throw new Error(`a Binance retornou ${r.data.symbol} e não ${pair}`);
    const price = this._validPrice(r.data.price);
    if (price === null) throw new Error('preço inválido retornado pela Binance');
    const cat = TICKER_CATALOG.find(c => c.type === 'crypto' && c.ticker === sym);
    return {
      price,
      currency: 'BRL',
      source: 'Binance',
      symbol: sym,
      providerId: pair,
      providerName: cat ? cat.name : sym,
      detectedType: 'crypto',
      marketTime: new Date().toISOString()
    };
  },

  // Consulta avulsa (usada no formulário de cadastro e edição)
  async previewQuote(ticker, type) {
    if (type === 'fii' || type === 'stock') return this.fetchB3Quote(ticker);
    if (type === 'crypto') {
      const sym = String(ticker || '').toUpperCase().trim();
      if (!/^[A-Z0-9]{2,12}$/.test(sym)) {
        const err = new Error(`Símbolo "${ticker}" não foi localizado.`);
        err.code = 'NOT_FOUND';
        throw err;
      }
      const cat = TICKER_CATALOG.find(c => c.type === 'crypto' && c.ticker === sym && c.coingeckoId);
      const tempObj = { ticker: sym, coingeckoId: cat ? cat.coingeckoId : null };
      const cgId = await this.resolveCoingeckoId(tempObj);
      try {
        const data = await this.fetchCoingeckoBatch([cgId]);
        const q = this._parseCoingecko(data, cgId, sym);
        if (!q.providerName) q.providerName = (cat && cat.name) || tempObj._resolvedCoinName || sym;
        Storage.saveCachedQuote(sym, q);
        return q;
      } catch (cgErr) {
        try {
          const bq = await this.fetchBinanceBrl(sym);
          if (!bq.providerName) bq.providerName = (cat && cat.name) || tempObj._resolvedCoinName || sym;
          Storage.saveCachedQuote(sym, bq);
          return bq;
        } catch (_) {
          const err = new Error(this._friendlyError(cgErr));
          err.code = 'API_UNAVAILABLE';
          throw err;
        }
      }
    }
    throw new Error('esta classe não possui cotação automática');
  },

  // ---------- estado da cotação de cada ativo ----------
  hasQuote(inv) {
    const q = inv && inv.quote;
    return !!q && Number.isFinite(Number(q.price)) && Number(q.price) > 0;
  },

  getQuoteStatus(inv) {
    if (inv.type === 'fixed') {
      return { status: 'manual', label: 'Sem cotação automática', detail: 'Renda fixa não tem cotação de mercado nesta versão; valores exibidos ao custo.' };
    }
    if (this.updatingIds.has(inv.id)) return { status: 'updating', label: 'Atualizando…', detail: '' };
    if (!this.hasQuote(inv)) {
      return { status: 'unavailable', label: 'Indisponível', detail: inv.quoteError ? inv.quoteError.message : 'Ainda não consultada.' };
    }
    const fetched = new Date(inv.quote.fetchedAt).getTime();
    const failedAfter = !!(inv.quoteError && new Date(inv.quoteError.failedAt).getTime() > fetched);
    const tooOld = !Number.isFinite(fetched) || (Date.now() - fetched) > QUOTE_SETTINGS.STALE_AFTER_MS;
    if (failedAfter || tooOld) {
      return { status: 'stale', label: 'Desatualizada', detail: failedAfter ? inv.quoteError.message : 'Sem confirmação há mais de 1 hora.' };
    }
    return { status: 'ok', label: 'Atualizada', detail: '' };
  },

  _isDue(inv, now, force) {
    if (!['crypto', 'fii', 'stock'].includes(inv.type)) return false;
    if (inv.status === 'closed' || (Number(inv.quantity) || 0) <= 0) return false;
    if (force) return true;
    const lastTry = Math.max(
      inv.quote ? new Date(inv.quote.fetchedAt).getTime() || 0 : 0,
      inv.quoteError ? new Date(inv.quoteError.failedAt).getTime() || 0 : 0
    );
    return (now - lastTry) >= QUOTE_SETTINGS.MIN_ASSET_INTERVAL_MS;
  },

  hasDueAssets() {
    const now = Date.now();
    return Storage.getInvestments().some(inv => this._isDue(inv, now, false));
  },

  ensureQuotes() {
    if (!this.isUpdating && this.hasDueAssets()) {
      setTimeout(() => this.updateAllQuotes(), 0);
    }
  },

  // ---------- atualização ----------
  async updateAllQuotes(options = {}) {
    if (this.isUpdating) return { skipped: true, total: 0, ok: 0, failed: 0, errors: [] };
    const force = !!options.force;
    const summary = { skipped: false, total: 0, ok: 0, failed: 0, errors: [] };
    const results = new Map(); // inv.id -> { quote, coingeckoId } | { error }

    this.isUpdating = true;
    try {
      const now = Date.now();
      const due = Storage.getInvestments().filter(inv => this._isDue(inv, now, force));
      summary.total = due.length;
      if (due.length === 0) return summary;

      due.forEach(inv => this.updatingIds.add(inv.id));
      State.notify('investments_updated');

      // Criptomoedas: identifica o ativo correto, consulta em lote
      const cryptos = due.filter(i => i.type === 'crypto');
      const idOf = new Map();
      for (const inv of cryptos) {
        try { idOf.set(inv.id, await this.resolveCoingeckoId(inv)); }
        catch (e) { results.set(inv.id, { error: this._friendlyError(e) }); }
      }
      const ids = [...new Set(idOf.values())];
      let cgData = null;
      let cgError = null;
      if (ids.length) {
        try { cgData = await this.fetchCoingeckoBatch(ids); }
        catch (e) { cgError = this._friendlyError(e); }
      }
      for (const inv of cryptos) {
        if (!idOf.has(inv.id)) continue;
        const id = idOf.get(inv.id);
        let quote = null;
        let err = cgError;
        if (cgData) {
          try { quote = this._parseCoingecko(cgData, id, inv.ticker); }
          catch (e) { err = this._friendlyError(e); }
        }
        // Reserva (Binance) somente para ativos do catálogo, cuja identidade já é conhecida
        const inCatalog = TICKER_CATALOG.some(c => c.type === 'crypto' && c.ticker === String(inv.ticker).toUpperCase() && c.coingeckoId === id);
        if (!quote && inCatalog) {
          try { quote = await this.fetchBinanceBrl(inv.ticker); }
          catch (e) { err = (err ? err + '; ' : '') + 'Binance: ' + this._friendlyError(e); }
        }
        results.set(inv.id, quote ? { quote, coingeckoId: id } : { error: err || 'cotação indisponível' });
      }

      // Ações e FIIs: uma consulta por ativo, com intervalo entre elas
      const b3 = due.filter(i => i.type === 'fii' || i.type === 'stock');
      for (let i = 0; i < b3.length; i++) {
        const inv = b3[i];
        try { results.set(inv.id, { quote: await this.fetchB3Quote(inv.ticker) }); }
        catch (e) { results.set(inv.id, { error: this._friendlyError(e) }); }
        if (i < b3.length - 1) await new Promise(r => setTimeout(r, QUOTE_SETTINGS.B3_GAP_MS));
      }

      // Aplica os resultados sobre a lista MAIS RECENTE (o usuário pode ter operado durante a consulta)
      const iso = new Date().toISOString();
      const fresh = Storage.getInvestments();
      for (const inv of fresh) {
        const res = results.get(inv.id);
        if (!res) continue;
        if (res.quote) {
          inv.quote = { ...res.quote, fetchedAt: iso };
          inv.currentPrice = res.quote.price;
          if (res.coingeckoId) inv.coingeckoId = res.coingeckoId;
          Storage.saveCachedQuote(inv.ticker, inv.quote);
          delete inv.quoteError;
          summary.ok++;
        } else {
          // Falha: NÃO altera nem zera a última cotação válida; só registra o erro
          inv.quoteError = { failedAt: iso, message: res.error };
          summary.failed++;
          summary.errors.push(`${inv.ticker}: ${res.error}`);
        }
      }
      Storage.saveInvestments(fresh);

      if (summary.ok > 0) {
        this.lastUpdated = new Date();
        Storage.createPortfolioSnapshot();
      }
    } catch (err) {
      console.error('[MarketAPI] Erro global na atualização de cotações:', err);
      summary.failed = summary.total;
      summary.errors.push(this._friendlyError(err));
    } finally {
      this.updatingIds.clear();
      this.isUpdating = false;
      State.notify('investments_updated');
    }
    return summary;
  },

  startAutoRefresh() {
    if (this.timer) return;
    this.updateAllQuotes();
    this.timer = setInterval(() => { if (!document.hidden) this.updateAllQuotes(); }, QUOTE_SETTINGS.AUTO_REFRESH_MS);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.updateAllQuotes(); });
  }
};


// =========================================================================
// LINE CHART ENGINE (Evolução Patrimonial Interativa)
// =========================================================================
Charts.renderLineChart = function(canvas, dataPoints) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || canvas.parentElement.clientWidth || 600;
  const height = rect.height || 260;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)';
  const lineColor = '#3b82f6';
  const fillColor = isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)';

  const padding = { top: 20, right: 25, bottom: 40, left: 65 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  if (!dataPoints || dataPoints.length === 0) {
    ctx.fillStyle = textColor;
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Nenhum dado histórico de investimentos registrado.', width / 2, height / 2);
    return;
  }

  const values = dataPoints.map(p => p.value);
  let minVal = Math.min(...values);
  let maxVal = Math.max(...values);
  if (minVal === maxVal) { minVal = 0; maxVal = maxVal * 1.2 || 1000; }
  minVal = Math.max(0, minVal * 0.95);
  maxVal = maxVal * 1.05;

  const getX = (index) => padding.left + (index / (dataPoints.length - 1 || 1)) * chartW;
  const getY = (val) => padding.top + chartH - ((val - minVal) / (maxVal - minVal || 1)) * chartH;

  const tooltip = Charts.getTooltip(canvas);

  const draw = (hoveredIndex = -1) => {
    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const yVal = minVal + ((maxVal - minVal) / gridSteps) * i;
      const yPos = getY(yVal);
      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(width - padding.right, yPos);
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(Utils.formatCurrency(yVal).replace('R$', '').trim(), padding.left - 8, yPos);
    }

    // Dates on X axis
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const step = Math.max(1, Math.floor(dataPoints.length / 5));
    dataPoints.forEach((p, idx) => {
      if (idx % step === 0 || idx === dataPoints.length - 1) {
        ctx.fillStyle = textColor;
        ctx.fillText(Utils.formatDateShort(p.date), getX(idx), height - padding.bottom + 8);
      }
    });

    // Area fill
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(dataPoints[0].value));
    for (let i = 1; i < dataPoints.length; i++) {
      ctx.lineTo(getX(i), getY(dataPoints[i].value));
    }
    ctx.lineTo(getX(dataPoints.length - 1), height - padding.bottom);
    ctx.lineTo(getX(0), height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(dataPoints[0].value));
    for (let i = 1; i < dataPoints.length; i++) {
      ctx.lineTo(getX(i), getY(dataPoints[i].value));
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Points
    dataPoints.forEach((p, idx) => {
      const x = getX(idx);
      const y = getY(p.value);
      const isHovered = idx === hoveredIndex;

      ctx.beginPath();
      ctx.arc(x, y, isHovered ? 6 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? '#ffffff' : lineColor;
      ctx.fill();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = isHovered ? 3 : 1.5;
      ctx.stroke();
    });
  };

  draw(-1);

  // Mouse interactivity
  if (canvas._lineMouseHandler) {
    canvas.removeEventListener('mousemove', canvas._lineMouseHandler);
    canvas.removeEventListener('mouseleave', canvas._lineLeaveHandler);
  }

  const onMouseMove = (e) => {
    const cRect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - cRect.left;
    const mouseY = e.clientY - cRect.top;

    let closestIdx = -1;
    let closestDist = Infinity;

    dataPoints.forEach((p, idx) => {
      const x = getX(idx);
      const dist = Math.abs(mouseX - x);
      if (dist < closestDist && dist < (chartW / dataPoints.length) + 15) {
        closestDist = dist;
        closestIdx = idx;
      }
    });

    if (closestIdx >= 0) {
      draw(closestIdx);
      if (tooltip) {
        const item = dataPoints[closestIdx];
        tooltip.innerHTML = `
          <div style="font-weight: 700; margin-bottom: 2px;">${Utils.formatDate(item.date)}</div>
          <div style="color: #3b82f6; font-size: 0.95rem; font-weight: 700;">${Utils.formatCurrency(item.value)}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">Patrimônio Total Investido</div>
        `;
        tooltip.style.left = `${getX(closestIdx)}px`;
        tooltip.style.top = `${getY(item.value)}px`;
        tooltip.classList.add('visible');
      }
    } else {
      draw(-1);
      if (tooltip) tooltip.classList.remove('visible');
    }
  };

  const onMouseLeave = () => {
    draw(-1);
    if (tooltip) tooltip.classList.remove('visible');
  };

  canvas._lineMouseHandler = onMouseMove;
  canvas._lineLeaveHandler = onMouseLeave;
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseleave', onMouseLeave);
};




  // =========================================================================
  // 5. TOAST NOTIFICATIONS
  // =========================================================================
  const Toast = {
    container: null,

    init() {
      this.container = document.getElementById('toast-container');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
      }
    },

    show(title, message = '', type = 'success', durationMs = 3500) {
      if (!this.container) this.init();
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;

      let iconHtml = Utils.icons.check;
      if (type === 'error' || type === 'warning') iconHtml = Utils.icons.alertCircle;
      if (type === 'info') iconHtml = Utils.icons.refresh;

      toast.innerHTML = `
        <div class="toast-icon">${iconHtml}</div>
        <div class="toast-content">
          <div class="toast-title">${Utils.escapeHtml(title)}</div>
          ${message ? `<div class="toast-message">${Utils.escapeHtml(message)}</div>` : ''}
        </div>
        <button class="toast-close" title="Fechar">${Utils.icons.close}</button>
      `;

      const dismiss = () => {
        toast.classList.add('hiding');
        setTimeout(() => { if (toast.parentElement) toast.parentElement.removeChild(toast); }, 250);
      };

      toast.querySelector('.toast-close').addEventListener('click', dismiss);
      this.container.appendChild(toast);
      if (durationMs > 0) setTimeout(dismiss, durationMs);
    },

    success(title, message) { this.show(title, message, 'success'); },
    error(title, message) { this.show(title, message, 'error', 4500); },
    info(title, message) { this.show(title, message, 'info'); },
    warning(title, message) { this.show(title, message, 'warning', 4500); }
  };

  // =========================================================================
  // 6. MODALS
  // =========================================================================
  const Modal = {
    backdrop: null,

    init() {
      this.backdrop = document.getElementById('modal-backdrop');
      if (!this.backdrop) {
        this.backdrop = document.createElement('div');
        this.backdrop.id = 'modal-backdrop';
        this.backdrop.className = 'modal-backdrop';
        document.body.appendChild(this.backdrop);
      }
      this.backdrop.addEventListener('click', (e) => {
        if (e.target === this.backdrop) this.close();
      });
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen()) this.close();
      });
    },

    isOpen() {
      return this.backdrop && this.backdrop.classList.contains('active');
    },

    open(contentHtml) {
      if (!this.backdrop) this.init();
      this.backdrop.innerHTML = `<div class="modal-dialog">${contentHtml}</div>`;
      this.backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
      const closeBtn = this.backdrop.querySelector('.modal-close-btn');
      if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    },

    close() {
      if (!this.backdrop) return;
      this.backdrop.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (!this.isOpen()) this.backdrop.innerHTML = '';
      }, 200);
    },

    openTransactionModal(transaction = null, onSave) {
      const isEdit = Boolean(transaction && transaction.id);
      const initialType = transaction ? transaction.type : 'expense';
      const categories = Storage.getCategories();

      const renderCategoryOptions = (currentType, selectedCatId) => {
        return categories.filter(c => c.type === currentType).map(c => `
          <option value="${c.id}" ${c.id === selectedCatId ? 'selected' : ''}>
            ${c.icon} ${Utils.escapeHtml(c.name)}
          </option>
        `).join('');
      };

      const initialDate = transaction ? transaction.date : Utils.getTodayString();
      const initialAmount = transaction ? transaction.amount : '';
      const initialDesc = transaction ? transaction.description : '';
      const initialNotes = transaction ? transaction.notes : '';
      const initialCatId = transaction ? transaction.categoryId : (categories.find(c => c.type === initialType)?.id || '');

      const modalHtml = `
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Editar Movimentação' : 'Nova Movimentação'}</h3>
          <button class="modal-close-btn" type="button" title="Fechar">${Utils.icons.close}</button>
        </div>
        <form id="form-transaction">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Tipo de Movimentação</label>
              <div class="segmented-control">
                <div class="segmented-option type-expense">
                  <input type="radio" id="tx-type-expense" name="txType" value="expense" ${initialType === 'expense' ? 'checked' : ''}>
                  <label for="tx-type-expense">${Utils.icons.trendingDown} Despesa</label>
                </div>
                <div class="segmented-option type-income">
                  <input type="radio" id="tx-type-income" name="txType" value="income" ${initialType === 'income' ? 'checked' : ''}>
                  <label for="tx-type-income">${Utils.icons.trendingUp} Receita</label>
                </div>
              </div>
            </div>

            <div class="form-group" id="group-tx-desc">
              <label class="form-label" for="tx-desc">
                <span>Descrição <span class="required">*</span></span>
              </label>
              <input type="text" id="tx-desc" name="description" placeholder="Ex: Supermercado, Salário, Internet..." value="${Utils.escapeHtml(initialDesc)}" required autocomplete="off">
              <span class="form-error">Por favor, preencha a descrição.</span>
            </div>

            <div class="form-row">
              <div class="form-group" id="group-tx-amount">
                <label class="form-label" for="tx-amount">
                  <span>Valor (R$) <span class="required">*</span></span>
                </label>
                <div class="input-with-prefix">
                  <span class="input-prefix">R$</span>
                  <input type="number" id="tx-amount" name="amount" step="0.01" min="0.01" placeholder="0,00" value="${initialAmount}" required>
                </div>
                <span class="form-error">Informe um valor maior que zero.</span>
              </div>

              <div class="form-group" id="group-tx-date">
                <label class="form-label" for="tx-date">
                  <span>Data <span class="required">*</span></span>
                </label>
                <input type="date" id="tx-date" name="date" value="${initialDate}" required>
                <span class="form-error">Selecione uma data válida.</span>
              </div>
            </div>

            <div class="form-group" id="group-tx-cat">
              <label class="form-label" for="tx-category">
                <span>Categoria <span class="required">*</span></span>
              </label>
              <select id="tx-category" name="categoryId" required>
                ${renderCategoryOptions(initialType, initialCatId)}
              </select>
              <span class="form-error">Selecione uma categoria.</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="tx-notes">Observação (Opcional)</label>
              <textarea id="tx-notes" name="notes" rows="2" placeholder="Detalhes adicionais, forma de pagamento, etc.">${Utils.escapeHtml(initialNotes)}</textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary modal-cancel-btn">Cancelar</button>
            <button type="submit" class="btn btn-primary" id="btn-submit-tx">
              ${isEdit ? 'Salvar Alterações' : 'Adicionar Transação'}
            </button>
          </div>
        </form>
      `;

      this.open(modalHtml);

      const form = document.getElementById('form-transaction');
      const typeRadios = form.querySelectorAll('input[name="txType"]');
      const catSelect = document.getElementById('tx-category');
      form.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());

      typeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
          catSelect.innerHTML = renderCategoryOptions(e.target.value, null);
        });
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const descInput = document.getElementById('tx-desc');
        const amountInput = document.getElementById('tx-amount');
        const dateInput = document.getElementById('tx-date');
        const amountVal = parseFloat(amountInput.value);

        if (!descInput.value.trim() || isNaN(amountVal) || amountVal <= 0 || !dateInput.value || !catSelect.value) {
          Toast.error('Atenção', 'Preencha corretamente todos os campos obrigatórios.');
          return;
        }

        const payload = {
          id: isEdit ? transaction.id : Utils.generateId(),
          description: descInput.value.trim(),
          amount: amountVal,
          type: form.querySelector('input[name="txType"]:checked').value,
          categoryId: catSelect.value,
          date: dateInput.value,
          notes: document.getElementById('tx-notes').value.trim()
        };

        this.close();
        if (onSave) onSave(payload, isEdit);
      });
    },

    openCategoryModal(category = null, onSave) {
      const isEdit = Boolean(category && category.id);
      const initialName = category ? category.name : '';
      const initialType = category ? category.type : 'expense';
      const initialIcon = category ? category.icon : '🏷️';
      const initialColor = category ? category.color : '#3b82f6';

      const iconsList = ['🍔', '🍕', '☕', '🛒', '🚗', '🚌', '✈️', '🏠', '💊', '🏥', '🎓', '📚', '🎮', '🎬', '🛍️', '🎁', '📄', '💡', '🔧', '📦', '💼', '💻', '📈', '💵', '🪙', '💎', '🏋️', '👶', '🐕', '⚡', '🏖️', '❤️'];
      const colorsList = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b'];

      const modalHtml = `
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Editar Categoria' : 'Nova Categoria'}</h3>
          <button class="modal-close-btn" type="button" title="Fechar">${Utils.icons.close}</button>
        </div>
        <form id="form-category">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Tipo de Categoria</label>
              <div class="segmented-control">
                <div class="segmented-option type-expense">
                  <input type="radio" id="cat-type-expense" name="catType" value="expense" ${initialType === 'expense' ? 'checked' : ''}>
                  <label for="cat-type-expense">Despesa</label>
                </div>
                <div class="segmented-option type-income">
                  <input type="radio" id="cat-type-income" name="catType" value="income" ${initialType === 'income' ? 'checked' : ''}>
                  <label for="cat-type-income">Receita</label>
                </div>
              </div>
            </div>

            <div class="form-group" id="group-cat-name">
              <label class="form-label" for="cat-name">
                <span>Nome da Categoria <span class="required">*</span></span>
              </label>
              <input type="text" id="cat-name" placeholder="Ex: Farmácia, Combustível, Bônus..." value="${Utils.escapeHtml(initialName)}" required autocomplete="off">
            </div>

            <div class="form-group">
              <label class="form-label">Escolha um Ícone</label>
              <div class="icon-picker-grid" id="cat-icon-picker">
                ${iconsList.map(ic => `
                  <div class="icon-picker-item ${ic === initialIcon ? 'selected' : ''}" data-icon="${ic}">${ic}</div>
                `).join('')}
              </div>
              <input type="hidden" id="cat-icon-val" value="${initialIcon}">
            </div>

            <div class="form-group">
              <label class="form-label">Escolha uma Cor</label>
              <div class="color-picker-palette" id="cat-color-picker">
                ${colorsList.map(c => `
                  <div class="color-dot-choice ${c.toLowerCase() === initialColor.toLowerCase() ? 'selected' : ''}" style="background-color: ${c};" data-color="${c}"></div>
                `).join('')}
              </div>
              <input type="hidden" id="cat-color-val" value="${initialColor}">
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary modal-cancel-btn">Cancelar</button>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Salvar Categoria' : 'Criar Categoria'}</button>
          </div>
        </form>
      `;

      this.open(modalHtml);
      const form = document.getElementById('form-category');
      form.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());

      const iconItems = form.querySelectorAll('.icon-picker-item');
      const iconHidden = document.getElementById('cat-icon-val');
      iconItems.forEach(item => {
        item.addEventListener('click', () => {
          iconItems.forEach(i => i.classList.remove('selected'));
          item.classList.add('selected');
          iconHidden.value = item.getAttribute('data-icon');
        });
      });

      const colorItems = form.querySelectorAll('.color-dot-choice');
      const colorHidden = document.getElementById('cat-color-val');
      colorItems.forEach(item => {
        item.addEventListener('click', () => {
          colorItems.forEach(i => i.classList.remove('selected'));
          item.classList.add('selected');
          colorHidden.value = item.getAttribute('data-color');
        });
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('cat-name');
        if (!nameInput.value.trim()) return;

        const payload = {
          id: isEdit ? category.id : Utils.generateId(),
          name: nameInput.value.trim(),
          type: form.querySelector('input[name="catType"]:checked').value,
          icon: iconHidden.value || '🏷️',
          color: colorHidden.value || '#3b82f6'
        };

        this.close();
        if (onSave) onSave(payload, isEdit);
      });
    },

    openConfirmModal({
      title = 'Confirmar Ação',
      message = 'Tem certeza que deseja prosseguir?',
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      isDanger = false,
      onConfirm
    }) {
      const modalHtml = `
        <div class="modal-header">
          <h3 class="modal-title">${Utils.escapeHtml(title)}</h3>
          <button class="modal-close-btn" type="button" title="Fechar">${Utils.icons.close}</button>
        </div>
        <div class="modal-body">
          <p style="color: var(--text-primary); font-size: var(--font-size-base);">${message}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary modal-cancel-btn">${Utils.escapeHtml(cancelText)}</button>
          <button type="button" class="btn ${isDanger ? 'btn-danger' : 'btn-primary'}" id="modal-btn-confirm">
            ${Utils.escapeHtml(confirmText)}
          </button>
        </div>
      `;

      this.open(modalHtml);
      this.backdrop.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());
      document.getElementById('modal-btn-confirm').addEventListener('click', () => {
        this.close();
        if (onConfirm) onConfirm();
      });
    },

    openReclassifyCategoryModal(category, affectedCount, otherCategories, onConfirm) {
      const optionsHtml = otherCategories.map(c => `
        <option value="${c.id}">${c.icon} ${Utils.escapeHtml(c.name)}</option>
      `).join('');

      const modalHtml = `
        <div class="modal-header">
          <h3 class="modal-title">Reclassificar e Excluir Categoria</h3>
          <button class="modal-close-btn" type="button" title="Fechar">${Utils.icons.close}</button>
        </div>
        <div class="modal-body">
          <div style="display: flex; gap: var(--spacing-3); align-items: flex-start; margin-bottom: var(--spacing-4);">
            <div style="color: var(--color-expense); font-size: 1.5rem;">⚠️</div>
            <div>
              <p style="color: var(--text-primary); font-weight: var(--font-weight-medium); margin-bottom: 4px;">
                A categoria <strong>"${Utils.escapeHtml(category.name)}"</strong> possui <strong>${affectedCount}</strong> movimentação(ões) vinculada(s).
              </p>
              <p style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                Para não perder o histórico financeiro, transfira essas transações para outra categoria antes de excluir:
              </p>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="reclassify-target-select">Transferir movimentações para:</label>
            <select id="reclassify-target-select">
              ${optionsHtml}
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary modal-cancel-btn">Cancelar</button>
          <button type="button" class="btn btn-danger" id="btn-reclassify-confirm">Reclassificar e Excluir</button>
        </div>
      `;

      this.open(modalHtml);
      this.backdrop.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());
      document.getElementById('btn-reclassify-confirm').addEventListener('click', () => {
        const targetId = document.getElementById('reclassify-target-select').value;
        this.close();
        if (onConfirm) onConfirm(targetId);
      });
    },

    // =========================================================================
    // MODAIS DE CAIXINHAS
    // =========================================================================

    openCaixinhaModal(caixinha = null, onSave) {
      const isEdit = Boolean(caixinha && caixinha.id);
      const initialName = caixinha ? caixinha.name : '';
      const initialDesc = caixinha ? (caixinha.description || '') : '';
      const initialTarget = caixinha ? caixinha.targetAmount : '';
      const initialDeadline = caixinha ? (caixinha.deadline || '') : '';
      const initialIcon = caixinha ? (caixinha.icon || '🎯') : '🎯';
      const initialColor = caixinha ? (caixinha.color || '#10b981') : '#10b981';

      const iconsList = ['🎯','🛡️','✈️','💻','📱','🚗','🏠','🎓','💍','🎮','🏋️','🌎','🎸','📷','🏖️','🎉','🏥','🛒','💰','🌱'];
      const colorsList = ['#10b981','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#ec4899','#06b6d4','#f97316','#14b8a6','#6366f1','#84cc16','#64748b'];
      const suggestions = ['Reserva de emergência','Viagem','Comprar celular','Comprar computador','Comprar carro','Estudos','Objetivos pessoais'];

      const modalHtml = `
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Editar Caixinha' : 'Nova Caixinha'}</h3>
          <button class="modal-close-btn" type="button" title="Fechar">${Utils.icons.close}</button>
        </div>
        <form id="form-caixinha">
          <div class="modal-body">
            ${!isEdit ? `
              <div style="margin-bottom: var(--spacing-4);">
                <label class="form-label" style="margin-bottom: var(--spacing-2);">Sugestões de nomes</label>
                <div class="suggestion-chips">
                  ${suggestions.map(s => `<div class="suggestion-chip" data-name="${Utils.escapeHtml(s)}">${Utils.escapeHtml(s)}</div>`).join('')}
                </div>
              </div>
            ` : ''}

            <div class="form-group" id="group-cax-name">
              <label class="form-label" for="cax-name">Nome da Caixinha <span class="required">*</span></label>
              <input type="text" id="cax-name" placeholder="Ex: Reserva de emergência, Viagem..." value="${Utils.escapeHtml(initialName)}" required autocomplete="off">
              <span class="form-error">Por favor, dê um nome para a caixinha.</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="cax-desc">Descrição (Opcional)</label>
              <input type="text" id="cax-desc" placeholder="Detalhes sobre seu objetivo..." value="${Utils.escapeHtml(initialDesc)}">
            </div>

            <div class="form-row">
              <div class="form-group" id="group-cax-target">
                <label class="form-label" for="cax-target">Valor da Meta (R$) <span class="required">*</span></label>
                <div class="input-with-prefix">
                  <span class="input-prefix">R$</span>
                  <input type="number" id="cax-target" step="0.01" min="0.01" placeholder="5000,00" value="${initialTarget}" required>
                </div>
                <span class="form-error">Informe uma meta maior que zero.</span>
              </div>

              ${!isEdit ? `
                <div class="form-group" id="group-cax-initial">
                  <label class="form-label" for="cax-initial">Valor Inicial (Opcional)</label>
                  <div class="input-with-prefix">
                    <span class="input-prefix">R$</span>
                    <input type="number" id="cax-initial" step="0.01" min="0" placeholder="0,00">
                  </div>
                </div>
              ` : ''}
            </div>

            <div class="form-group">
              <label class="form-label" for="cax-deadline">Data Limite / Prazo (Opcional)</label>
              <input type="date" id="cax-deadline" value="${initialDeadline}">
            </div>

            <div class="form-group">
              <label class="form-label">Escolha um Ícone</label>
              <div class="icon-picker-grid" id="cax-icon-picker">
                ${iconsList.map(ic => `<div class="icon-picker-item ${ic === initialIcon ? 'selected' : ''}" data-icon="${ic}">${ic}</div>`).join('')}
              </div>
              <input type="hidden" id="cax-icon-val" value="${initialIcon}">
            </div>

            <div class="form-group">
              <label class="form-label">Escolha uma Cor</label>
              <div class="color-picker-palette" id="cax-color-picker">
                ${colorsList.map(c => `<div class="color-dot-choice ${c.toLowerCase() === initialColor.toLowerCase() ? 'selected' : ''}" style="background-color: ${c};" data-color="${c}"></div>`).join('')}
              </div>
              <input type="hidden" id="cax-color-val" value="${initialColor}">
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary modal-cancel-btn">Cancelar</button>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Salvar Caixinha' : 'Criar Caixinha'}</button>
          </div>
        </form>
      `;

      this.open(modalHtml);
      const form = document.getElementById('form-caixinha');
      form.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());

      const nameInput = document.getElementById('cax-name');
      form.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          nameInput.value = chip.getAttribute('data-name');
          nameInput.focus();
        });
      });

      const iconItems = form.querySelectorAll('.icon-picker-item');
      const iconHidden = document.getElementById('cax-icon-val');
      iconItems.forEach(item => {
        item.addEventListener('click', () => {
          iconItems.forEach(i => i.classList.remove('selected'));
          item.classList.add('selected');
          iconHidden.value = item.getAttribute('data-icon');
        });
      });

      const colorItems = form.querySelectorAll('.color-dot-choice');
      const colorHidden = document.getElementById('cax-color-val');
      colorItems.forEach(item => {
        item.addEventListener('click', () => {
          colorItems.forEach(i => i.classList.remove('selected'));
          item.classList.add('selected');
          colorHidden.value = item.getAttribute('data-color');
        });
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const targetVal = parseFloat(document.getElementById('cax-target').value);
        if (!nameInput.value.trim() || isNaN(targetVal) || targetVal <= 0) {
          document.getElementById('group-cax-name').classList.toggle('has-error', !nameInput.value.trim());
          document.getElementById('group-cax-target').classList.toggle('has-error', isNaN(targetVal) || targetVal <= 0);
          return;
        }
        const initialVal = !isEdit ? (parseFloat(document.getElementById('cax-initial')?.value) || 0) : 0;
        const payload = {
          id: isEdit ? caixinha.id : Utils.generateId(),
          name: nameInput.value.trim(),
          description: document.getElementById('cax-desc').value.trim(),
          targetAmount: targetVal,
          initialAmount: initialVal,
          deadline: document.getElementById('cax-deadline').value || null,
          icon: iconHidden.value || '🎯',
          color: colorHidden.value || '#10b981'
        };
        this.close();
        if (onSave) onSave(payload, isEdit);
      });
    },

    openDepositCaixinhaModal(caixinha, availableBalance, onConfirm) {
      const modalHtml = `
        <div class="modal-header">
          <h3 class="modal-title">Guardar Dinheiro</h3>
          <button class="modal-close-btn" type="button" title="Fechar">${Utils.icons.close}</button>
        </div>
        <form id="form-deposit-caixinha">
          <div class="modal-body">
            <div class="caixinha-modal-banner" style="border-left: 4px solid ${caixinha.color};">
              <span style="font-size: 1.5rem;">${caixinha.icon}</span>
              <div>
                <strong style="font-size: var(--font-size-md); color: var(--text-primary);">${Utils.escapeHtml(caixinha.name)}</strong>
                <div style="font-size: var(--font-size-xs); color: var(--text-muted);">
                  Saldo guardado: <strong>${Utils.formatCurrency(caixinha.currentAmount)}</strong>
                </div>
              </div>
            </div>

            <div class="caixinha-balance-available-pill">
              <span>Saldo disponível na conta:</span>
              <strong class="${availableBalance > 0 ? 'text-success' : 'text-danger'}">${Utils.formatCurrency(availableBalance)}</strong>
            </div>

            <div class="form-group" id="group-dep-amount">
              <label class="form-label" for="dep-amount">Valor que deseja guardar (R$) <span class="required">*</span></label>
              <div class="input-with-prefix">
                <span class="input-prefix">R$</span>
                <input type="number" id="dep-amount" step="0.01" min="0.01" max="${Math.max(0, availableBalance)}" placeholder="0,00" required autofocus>
              </div>
              <span class="form-error">O valor deve ser maior que zero e não pode exceder o saldo disponível.</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="dep-date">Data da Movimentação</label>
              <input type="date" id="dep-date" value="${Utils.getTodayString()}" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="dep-desc">Descrição (Opcional)</label>
              <input type="text" id="dep-desc" placeholder="Ex: Aporte mensal, Economia da semana...">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary modal-cancel-btn">Cancelar</button>
            <button type="submit" class="btn btn-primary">${Utils.icons.plus} Confirmar Depósito</button>
          </div>
        </form>
      `;

      this.open(modalHtml);
      const form = document.getElementById('form-deposit-caixinha');
      form.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const amountVal = parseFloat(document.getElementById('dep-amount').value);
        if (isNaN(amountVal) || amountVal <= 0 || amountVal > availableBalance) {
          document.getElementById('group-dep-amount').classList.add('has-error');
          return;
        }
        const dateVal = document.getElementById('dep-date').value || Utils.getTodayString();
        const descVal = document.getElementById('dep-desc').value.trim() || 'Depósito na caixinha';
        this.close();
        if (onConfirm) onConfirm(amountVal, dateVal, descVal);
      });
    },

    openWithdrawCaixinhaModal(caixinha, onConfirm) {
      const maxWithdraw = Number(caixinha.currentAmount) || 0;
      const modalHtml = `
        <div class="modal-header">
          <h3 class="modal-title">Retirar Dinheiro da Caixinha</h3>
          <button class="modal-close-btn" type="button" title="Fechar">${Utils.icons.close}</button>
        </div>
        <form id="form-withdraw-caixinha">
          <div class="modal-body">
            <div class="caixinha-modal-banner" style="border-left: 4px solid ${caixinha.color};">
              <span style="font-size: 1.5rem;">${caixinha.icon}</span>
              <div>
                <strong style="font-size: var(--font-size-md); color: var(--text-primary);">${Utils.escapeHtml(caixinha.name)}</strong>
                <div style="font-size: var(--font-size-xs); color: var(--text-muted);">
                  Total disponível para resgate: <strong class="text-primary">${Utils.formatCurrency(maxWithdraw)}</strong>
                </div>
              </div>
            </div>

            <div class="form-group" id="group-with-amount">
              <label class="form-label" for="with-amount">
                <span>Valor que deseja retirar (R$) <span class="required">*</span></span>
                <button type="button" class="btn-text-link" id="btn-withdraw-all">Retirar Tudo</button>
              </label>
              <div class="input-with-prefix">
                <span class="input-prefix">R$</span>
                <input type="number" id="with-amount" step="0.01" min="0.01" max="${maxWithdraw}" placeholder="0,00" required autofocus>
              </div>
              <span class="form-error">Informe um valor entre R$ 0,01 e ${Utils.formatCurrency(maxWithdraw)}.</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="with-date">Data da Movimentação</label>
              <input type="date" id="with-date" value="${Utils.getTodayString()}" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="with-desc">Motivo / Descrição (Opcional)</label>
              <input type="text" id="with-desc" placeholder="Ex: Pagamento imprevisto, Viagem realizada...">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary modal-cancel-btn">Cancelar</button>
            <button type="submit" class="btn btn-primary">Confirmar Resgate</button>
          </div>
        </form>
      `;

      this.open(modalHtml);
      const form = document.getElementById('form-withdraw-caixinha');
      form.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());

      const amountInput = document.getElementById('with-amount');
      const withdrawAllBtn = document.getElementById('btn-withdraw-all');
      if (withdrawAllBtn) {
        withdrawAllBtn.addEventListener('click', () => { amountInput.value = maxWithdraw.toFixed(2); });
      }

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const amountVal = parseFloat(amountInput.value);
        if (isNaN(amountVal) || amountVal <= 0 || amountVal > maxWithdraw) {
          document.getElementById('group-with-amount').classList.add('has-error');
          return;
        }
        const dateVal = document.getElementById('with-date').value || Utils.getTodayString();
        const descVal = document.getElementById('with-desc').value.trim() || 'Resgate para saldo disponível';
        this.close();
        if (onConfirm) onConfirm(amountVal, dateVal, descVal);
      });
    },

    openCaixinhaHistoryModal(caixinha) {
      const history = caixinha.history || [];
      const pct = Math.min(100, Math.round(((caixinha.currentAmount || 0) / (caixinha.targetAmount || 1)) * 100));

      const modalHtml = `
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: var(--spacing-2);">
            <span style="font-size: 1.4rem;">${caixinha.icon}</span>
            <h3 class="modal-title">Histórico: ${Utils.escapeHtml(caixinha.name)}</h3>
          </div>
          <button class="modal-close-btn" type="button" title="Fechar">${Utils.icons.close}</button>
        </div>
        <div class="modal-body">
          <div class="caixinha-history-summary">
            <div>
              <div style="font-size: var(--font-size-xs); color: var(--text-muted);">Saldo Guardado</div>
              <strong style="font-size: var(--font-size-lg); color: var(--text-primary);">${Utils.formatCurrency(caixinha.currentAmount)}</strong>
            </div>
            <div style="text-align: right;">
              <div style="font-size: var(--font-size-xs); color: var(--text-muted);">Meta (${pct}%)</div>
              <strong style="font-size: var(--font-size-lg); color: var(--text-primary);">${Utils.formatCurrency(caixinha.targetAmount)}</strong>
            </div>
          </div>
          <div style="margin-top: var(--spacing-4);">
            <h4 style="font-size: var(--font-size-sm); font-weight: 600; margin-bottom: var(--spacing-3); color: var(--text-secondary);">
              Todas as Movimentações (${history.length})
            </h4>
            ${history.length === 0 ? `
              <div class="empty-state" style="padding: var(--spacing-6);">
                <p class="empty-state-text">Nenhuma movimentação realizada nesta caixinha ainda.</p>
              </div>
            ` : `
              <div class="caixinha-history-list">
                ${history.map(item => {
                  const isDeposit = item.type === 'deposit';
                  return `
                    <div class="caixinha-history-item">
                      <div style="display: flex; align-items: center; gap: var(--spacing-3);">
                        <div class="history-type-icon ${isDeposit ? 'deposit' : 'withdraw'}">${isDeposit ? '➕' : '➖'}</div>
                        <div>
                          <div style="font-weight: 600; font-size: var(--font-size-sm); color: var(--text-primary);">
                            ${Utils.escapeHtml(item.description || (isDeposit ? 'Depósito' : 'Resgate'))}
                          </div>
                          <div style="font-size: var(--font-size-xs); color: var(--text-muted);">${Utils.formatDate(item.date)}</div>
                        </div>
                      </div>
                      <div class="font-bold ${isDeposit ? 'text-success' : 'text-danger'}" style="font-size: var(--font-size-base);">
                        ${isDeposit ? '+' : '-'} ${Utils.formatCurrency(item.amount)}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary modal-cancel-btn">Fechar</button>
        </div>
      `;

      this.open(modalHtml);
      this.backdrop.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());
    }
  };

// =========================================================================
// MODAIS DE INVESTIMENTOS
// =========================================================================
Modal.openInvestmentModal = function(investment = null, onSave) {
  const isEdit = Boolean(investment && investment.id);
  let selectedClass = investment ? investment.type : 'stock';
  let currentQuoteObj = (investment && investment.quote && Number(investment.quote.price) > 0)
    ? { ...investment.quote }
    : (investment && investment.ticker ? Storage.getCachedQuote(investment.ticker) : null);
  let quoteState = currentQuoteObj ? 'ok' : 'idle'; // idle, loading, ok, stale, not_found, unavailable
  let quoteStatusDetail = '';
  let userEditedAvgPrice = isEdit;
  let userEditedName = isEdit && Boolean(investment && investment.name);
  let lastQueriedTicker = investment && investment.ticker ? String(investment.ticker).toUpperCase().trim() : '';

  const initialApplied = (investment && investment.type === 'fixed')
    ? Storage.getAppliedAmount(investment)
    : '';
  const initialYieldType = (investment && (investment.yieldType || investment.benchmark)) || 'CDI';
  const initialAppDate = (investment && investment.applicationDate) || Utils.getTodayString();
  const initialAccYield = (investment && investment.accumulatedYield !== null && investment.accumulatedYield !== undefined)
    ? investment.accumulatedYield
    : '';

  const modalHtml = `
    <div class="modal-header">
      <h3 class="modal-title">${isEdit ? 'Editar Investimento' : 'Adicionar Investimento'}</h3>
      <button class="modal-close-btn" type="button" title="Fechar">${Utils.icons.close}</button>
    </div>
    <form id="form-investment" novalidate>
      <div class="modal-body">
        <label class="form-label">Classe do Investimento</label>
        <div class="inv-class-selector-grid">
          <button type="button" class="inv-class-card-btn ${selectedClass === 'stock' ? 'selected' : ''}" data-class="stock">
            <span style="font-size: 1.5rem;">📈</span>
            <span>Ações (B3)</span>
          </button>
          <button type="button" class="inv-class-card-btn ${selectedClass === 'fii' ? 'selected' : ''}" data-class="fii">
            <span style="font-size: 1.5rem;">🏢</span>
            <span>FIIs</span>
          </button>
          <button type="button" class="inv-class-card-btn ${selectedClass === 'crypto' ? 'selected' : ''}" data-class="crypto">
            <span style="font-size: 1.5rem;">🪙</span>
            <span>Criptomoedas</span>
          </button>
          <button type="button" class="inv-class-card-btn ${selectedClass === 'fixed' ? 'selected' : ''}" data-class="fixed">
            <span style="font-size: 1.5rem;">🏛️</span>
            <span>Renda Fixa</span>
          </button>
        </div>

        <!-- SEÇÃO DINÂMICA: AÇÕES, FIIs e CRIPTOMOEDAS -->
        <div id="inv-variable-section" style="${selectedClass === 'fixed' ? 'display: none;' : 'display: block;'}">
          <div class="form-row">
            <div class="form-group inv-ticker-search-box" id="group-inv-ticker" style="flex: 1;">
              <label class="form-label" for="inv-ticker" id="label-inv-ticker">
                Código de Negociação (Ticker) <span class="required">*</span>
              </label>
              <div style="display: flex; gap: 6px;">
                <input type="text" id="inv-ticker" placeholder="Ex: MXRF11, PETR4, HGLG11..." value="${Utils.escapeHtml(investment && investment.type !== 'fixed' ? (investment.ticker || '') : '')}" autocomplete="off" style="text-transform: uppercase; flex: 1;">
                <button type="button" class="btn btn-outline btn-sm" id="btn-lookup-ticker" title="Consultar cotação na API" style="white-space: nowrap; padding: 0 10px;">
                  ${Utils.icons.refresh}
                </button>
              </div>
              <div class="inv-ticker-results" id="inv-ticker-results"></div>
              <span class="form-error" id="error-inv-ticker">Informe o código ou símbolo do ativo.</span>
            </div>

            <div class="form-group" id="group-inv-var-name" style="flex: 1.8;">
              <label class="form-label" for="inv-var-name" id="label-inv-var-name">
                Nome do Ativo <span class="required">*</span>
              </label>
              <input type="text" id="inv-var-name" placeholder="Preenchido automaticamente ao digitar o ticker..." value="${Utils.escapeHtml(investment && investment.type !== 'fixed' ? (investment.name || '') : '')}">
              <span class="form-error">Informe o nome do ativo.</span>
            </div>
          </div>

          <!-- Card de Cotação Atual Automática -->
          <div class="inv-quote-preview-card" id="inv-quote-preview-card">
            <div class="inv-quote-preview-top">
              <div>
                <div class="inv-quote-preview-label">Cotação Atual Automática ( por <span id="quote-unit-label">ação/cota</span> )</div>
                <div class="inv-quote-preview-price" id="inv-quote-display-price">
                  ${currentQuoteObj ? Utils.formatCurrency(currentQuoteObj.price) : '—'}
                </div>
              </div>
              <span class="inv-quote-status-badge" id="inv-quote-status-badge">
                ${currentQuoteObj ? 'Cotação carregada' : 'Digite o código para consultar'}
              </span>
            </div>
            <div class="inv-quote-preview-meta" id="inv-quote-display-meta">
              ${currentQuoteObj ? `Ativo: ${Utils.escapeHtml(currentQuoteObj.symbol || '')} · Fonte: ${Utils.escapeHtml(currentQuoteObj.source || 'API')}` : 'Ao digitar um ticker (ex.: MXRF11, HGLG11, KNRI11, PETR4), o sistema busca nome e cotação em tempo real.'}
            </div>
          </div>

          <div class="form-row">
            <div class="form-group" id="group-inv-qty">
              <label class="form-label" for="inv-qty" id="label-inv-qty">
                Quantidade de Cotas ou Ações <span class="required">*</span>
              </label>
              <input type="number" id="inv-qty" step="any" min="0.00000001" placeholder="Ex: 100" value="${investment && investment.type !== 'fixed' ? (investment.quantity ?? '') : ''}">
              <span class="form-error">Informe uma quantidade válida maior que zero.</span>
            </div>

            <div class="form-group" id="group-inv-price">
              <label class="form-label" for="inv-price" id="label-inv-price">
                Preço Médio de Compra (R$) <span class="required">*</span>
              </label>
              <div class="input-with-prefix">
                <span class="input-prefix">R$</span>
                <input type="number" id="inv-price" step="0.01" min="0.01" placeholder="0,00" value="${investment && investment.type !== 'fixed' && investment.averagePrice ? Number(investment.averagePrice).toFixed(2) : ''}">
              </div>
              <span class="form-error">Informe o preço médio de compra.</span>
            </div>
          </div>

          <!-- Resumo Automático: Valor Total Investido & Valor da Posição pela Cotação Atual -->
          <div class="inv-calc-summary-grid">
            <div class="inv-calc-summary-box">
              <span class="inv-calc-summary-label">Valor Total Investido (Custo)</span>
              <strong class="inv-calc-summary-value" id="inv-calc-total-invested">R$ 0,00</strong>
              <span class="inv-calc-summary-sub">Quantidade × Preço médio de compra</span>
            </div>
            <div class="inv-calc-summary-box highlight">
              <span class="inv-calc-summary-label">Valor da Posição (Cotação Atual)</span>
              <strong class="inv-calc-summary-value text-primary" id="inv-calc-current-position">—</strong>
              <span class="inv-calc-summary-sub" id="inv-calc-position-sub">Quantidade × Cotação atual automática</span>
            </div>
          </div>
        </div>

        <!-- SEÇÃO DINÂMICA: RENDA FIXA (sem ticker, sem cotação de bolsa) -->
        <div id="inv-fixed-section" style="${selectedClass === 'fixed' ? 'display: block;' : 'display: none;'}">
          <div class="form-row">
            <div class="form-group" id="group-inv-fixed-name" style="flex: 1.5;">
              <label class="form-label" for="inv-fixed-name">
                Nome do Investimento <span class="required">*</span>
              </label>
              <input type="text" id="inv-fixed-name" placeholder="Ex: CDB Banco Inter 110% CDI, Tesouro Selic 2029..." value="${Utils.escapeHtml(investment && investment.type === 'fixed' ? (investment.name || '') : '')}">
              <span class="form-error">Informe o nome do investimento de renda fixa.</span>
            </div>

            <div class="form-group" id="group-inv-fixed-inst" style="flex: 1;">
              <label class="form-label" for="inv-fixed-inst">
                Instituição Financeira <span class="required">*</span>
              </label>
              <input type="text" id="inv-fixed-inst" placeholder="Ex: Banco Inter, XP, Tesouro Direto..." value="${Utils.escapeHtml(investment && investment.type === 'fixed' ? (investment.institution || '') : '')}">
              <span class="form-error">Informe a instituição financeira.</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group" id="group-inv-applied">
              <label class="form-label" for="inv-applied">
                Valor Aplicado (R$) <span class="required">*</span>
              </label>
              <div class="input-with-prefix">
                <span class="input-prefix">R$</span>
                <input type="number" id="inv-applied" step="0.01" min="0.01" placeholder="0,00" value="${initialApplied !== '' ? Number(initialApplied).toFixed(2) : ''}">
              </div>
              <span class="form-error">Informe o valor aplicado maior que zero.</span>
            </div>

            <div class="form-group" id="group-inv-yield-type">
              <label class="form-label" for="inv-yield-type">
                Tipo de Rentabilidade <span class="required">*</span>
              </label>
              <select id="inv-yield-type">
                <option value="CDI" ${initialYieldType === 'CDI' ? 'selected' : ''}>CDI (Pós-fixado)</option>
                <option value="IPCA" ${initialYieldType === 'IPCA' ? 'selected' : ''}>IPCA (Híbrido / Inflação)</option>
                <option value="PREFIXADA" ${initialYieldType === 'PREFIXADA' ? 'selected' : ''}>Prefixada</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group" id="group-inv-rate">
              <label class="form-label" for="inv-rate">
                Taxa Contratada <span class="required">*</span>
              </label>
              <input type="text" id="inv-rate" placeholder="Ex: 110% do CDI, IPCA + 6,5% a.a., 12% a.a." value="${Utils.escapeHtml(investment && investment.type === 'fixed' ? (investment.rateText || '') : '')}">
              <span class="form-error">Informe a taxa contratada.</span>
            </div>

            <div class="form-group" id="group-inv-acc-yield">
              <label class="form-label" for="inv-acc-yield">
                Rentabilidade Acumulada (R$ - quando disponível)
              </label>
              <div class="input-with-prefix">
                <span class="input-prefix">R$</span>
                <input type="number" id="inv-acc-yield" step="0.01" placeholder="Opcional (ex: 320,00)" value="${initialAccYield !== '' ? Number(initialAccYield).toFixed(2) : ''}">
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group" id="group-inv-app-date">
              <label class="form-label" for="inv-app-date">
                Data da Aplicação <span class="required">*</span>
              </label>
              <input type="date" id="inv-app-date" value="${initialAppDate}">
              <span class="form-error">Informe a data da aplicação.</span>
            </div>

            <div class="form-group" id="group-inv-maturity">
              <label class="form-label" for="inv-maturity">
                Data de Vencimento <span class="required">*</span>
              </label>
              <input type="date" id="inv-maturity" value="${investment && investment.type === 'fixed' ? (investment.maturityDate || '') : ''}">
              <span class="form-error">Informe a data de vencimento.</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary modal-cancel-btn">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Salvar Alterações' : 'Confirmar Cadastro'}</button>
      </div>
    </form>
  `;

  this.open(modalHtml);
  const form = document.getElementById('form-investment');
  form.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());

  const varSection = document.getElementById('inv-variable-section');
  const fixedSection = document.getElementById('inv-fixed-section');
  const tickerInput = document.getElementById('inv-ticker');
  const varNameInput = document.getElementById('inv-var-name');
  const qtyInput = document.getElementById('inv-qty');
  const priceInput = document.getElementById('inv-price');
  const resultsBox = document.getElementById('inv-ticker-results');
  const lookupBtn = document.getElementById('btn-lookup-ticker');

  const labelTicker = document.getElementById('label-inv-ticker');
  const labelVarName = document.getElementById('label-inv-var-name');
  const labelQty = document.getElementById('label-inv-qty');
  const quoteUnitLabel = document.getElementById('quote-unit-label');
  const quoteCard = document.getElementById('inv-quote-preview-card');
  const quotePriceEl = document.getElementById('inv-quote-display-price');
  const quoteBadgeEl = document.getElementById('inv-quote-status-badge');
  const quoteMetaEl = document.getElementById('inv-quote-display-meta');
  const calcInvestedEl = document.getElementById('inv-calc-total-invested');
  const calcPositionEl = document.getElementById('inv-calc-current-position');
  const calcPositionSubEl = document.getElementById('inv-calc-position-sub');

  const updateDynamicClassUI = () => {
    form.querySelectorAll('.inv-class-card-btn').forEach(b => {
      b.classList.toggle('selected', b.getAttribute('data-class') === selectedClass);
    });

    if (selectedClass === 'fixed') {
      varSection.style.display = 'none';
      fixedSection.style.display = 'block';
      return;
    }

    varSection.style.display = 'block';
    fixedSection.style.display = 'none';

    if (selectedClass === 'crypto') {
      labelTicker.innerHTML = 'Símbolo <span class="required">*</span>';
      tickerInput.placeholder = 'Ex: BTC, ETH, SOL...';
      labelVarName.innerHTML = 'Nome da Criptomoeda <span class="required">*</span>';
      varNameInput.placeholder = 'Ex: Bitcoin, Ethereum...';
      labelQty.innerHTML = 'Quantidade <span class="required">*</span>';
      qtyInput.placeholder = 'Ex: 0.025';
      quoteUnitLabel.textContent = 'unidade';
    } else if (selectedClass === 'fii') {
      labelTicker.innerHTML = 'Código de Negociação (Ticker) <span class="required">*</span>';
      tickerInput.placeholder = 'Ex: MXRF11, HGLG11, KNRI11...';
      labelVarName.innerHTML = 'Nome do Ativo <span class="required">*</span>';
      varNameInput.placeholder = 'Ex: Maxi Renda FII, CSHG Logística FII...';
      labelQty.innerHTML = 'Quantidade de Cotas <span class="required">*</span>';
      qtyInput.placeholder = 'Ex: 100';
      quoteUnitLabel.textContent = 'cota';
    } else {
      labelTicker.innerHTML = 'Código de Negociação (Ticker) <span class="required">*</span>';
      tickerInput.placeholder = 'Ex: PETR4, VALE3, ITUB4...';
      labelVarName.innerHTML = 'Nome do Ativo <span class="required">*</span>';
      varNameInput.placeholder = 'Ex: Petrobras PN, Vale ON...';
      labelQty.innerHTML = 'Quantidade de Ações <span class="required">*</span>';
      qtyInput.placeholder = 'Ex: 100';
      quoteUnitLabel.textContent = 'ação';
    }
    updateCalculations();
    renderQuoteCard();
  };

  const renderQuoteCard = () => {
    quoteCard.classList.remove('status-ok', 'status-stale', 'status-error', 'status-loading');
    if (quoteState === 'loading') {
      quoteCard.classList.add('status-loading');
      quoteBadgeEl.textContent = 'Consultando API…';
      quoteMetaEl.textContent = `Buscando dados e cotação atual para ${tickerInput.value.toUpperCase().trim()}...`;
      return;
    }
    if (quoteState === 'not_found') {
      quoteCard.classList.add('status-error');
      quotePriceEl.textContent = 'Não encontrado';
      quoteBadgeEl.textContent = 'Ativo não localizado';
      quoteMetaEl.textContent = quoteStatusDetail || 'O ativo informado não foi localizado na base de cotações. Verifique o código digitado.';
      return;
    }
    if (quoteState === 'stale' && currentQuoteObj && Number(currentQuoteObj.price) > 0) {
      quoteCard.classList.add('status-stale');
      quotePriceEl.textContent = Utils.formatCurrency(currentQuoteObj.price);
      quoteBadgeEl.textContent = 'Cotação desatualizada';
      const timeStr = currentQuoteObj.fetchedAt ? new Date(currentQuoteObj.fetchedAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
      quoteMetaEl.textContent = `API indisponível no momento — mantendo último preço válido (${currentQuoteObj.source || 'Cache'}${timeStr ? ' em ' + timeStr : ''}).`;
      return;
    }
    if (quoteState === 'unavailable') {
      quoteCard.classList.add('status-error');
      quotePriceEl.textContent = 'Indisponível';
      quoteBadgeEl.textContent = 'API indisponível';
      quoteMetaEl.textContent = quoteStatusDetail || 'Serviço de cotações indisponível no momento e não há último preço válido salvo para este ativo.';
      return;
    }
    if (currentQuoteObj && Number(currentQuoteObj.price) > 0) {
      quoteCard.classList.add('status-ok');
      quotePriceEl.textContent = Utils.formatCurrency(currentQuoteObj.price);
      quoteBadgeEl.textContent = 'Cotação atual em R$';
      const hh = new Date(currentQuoteObj.fetchedAt || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      quoteMetaEl.textContent = `${currentQuoteObj.providerName ? currentQuoteObj.providerName + ' · ' : ''}Ticker: ${currentQuoteObj.symbol || tickerInput.value.toUpperCase().trim()} · Fonte: ${currentQuoteObj.source || 'API'} (${hh})`;
      return;
    }
    quotePriceEl.textContent = '—';
    quoteBadgeEl.textContent = 'Aguardando código';
    quoteMetaEl.textContent = selectedClass === 'crypto'
      ? 'Digite o símbolo (ex: BTC, ETH) para buscar automaticamente o nome e a cotação atual em reais (R$).'
      : 'Digite o ticker (ex: MXRF11, HGLG11, KNRI11, PETR4) para buscar automaticamente o nome e a cotação atual em reais (R$).';
  };

  const updateCalculations = () => {
    const qty = parseFloat(qtyInput.value);
    const avgPrice = parseFloat(priceInput.value);
    const validQty = Number.isFinite(qty) && qty > 0 ? qty : 0;
    const validAvg = Number.isFinite(avgPrice) && avgPrice > 0 ? avgPrice : 0;

    const totalInvested = validQty * validAvg;
    calcInvestedEl.textContent = Utils.formatCurrency(totalInvested);

    const quotePrice = currentQuoteObj && Number.isFinite(Number(currentQuoteObj.price)) && Number(currentQuoteObj.price) > 0
      ? Number(currentQuoteObj.price)
      : null;

    if (quotePrice !== null && validQty > 0) {
      const posValue = validQty * quotePrice;
      calcPositionEl.textContent = Utils.formatCurrency(posValue);
      calcPositionSubEl.textContent = `${validQty} × ${Utils.formatCurrency(quotePrice)}${quoteState === 'stale' ? ' (última cotação válida)' : ''}`;
    } else if (quotePrice !== null) {
      calcPositionEl.textContent = Utils.formatCurrency(0);
      calcPositionSubEl.textContent = `Informe a quantidade para multiplicar por ${Utils.formatCurrency(quotePrice)}`;
    } else {
      calcPositionEl.textContent = '—';
      calcPositionSubEl.textContent = 'Aguardando cotação válida para calcular posição';
    }
  };

  let lookupSeq = 0;
  let lookupTimer = null;

  const performTickerLookup = async (rawCode, options = {}) => {
    if (selectedClass === 'fixed') return;
    const code = String(rawCode || '').toUpperCase().trim();
    if (!code || code.length < 2) {
      currentQuoteObj = null;
      quoteState = 'idle';
      renderQuoteCard();
      updateCalculations();
      return;
    }

    const seq = ++lookupSeq;
    quoteState = 'loading';
    renderQuoteCard();

    // Verifica catálogo local primeiro para preencher nome rapidamente se ainda estiver vazio
    const catalogMatch = TICKER_CATALOG.find(item => item.ticker === code);
    if (catalogMatch) {
      if (!options.preserveClass && (selectedClass === 'stock' || selectedClass === 'fii') && (catalogMatch.type === 'stock' || catalogMatch.type === 'fii') && selectedClass !== catalogMatch.type) {
        selectedClass = catalogMatch.type;
        updateDynamicClassUI();
      }
      if (!userEditedName || !varNameInput.value.trim() || lastQueriedTicker !== code) {
        varNameInput.value = catalogMatch.name;
      }
    }

    try {
      const queryType = (catalogMatch && (catalogMatch.type === 'fii' || catalogMatch.type === 'stock' || catalogMatch.type === 'crypto'))
        ? catalogMatch.type
        : selectedClass;
      const q = await MarketApiService.previewQuote(code, queryType);
      if (seq !== lookupSeq) return;

      // Atualiza classe automaticamente entre Ação e FII se detectado pela API
      if (q.detectedType && (selectedClass === 'stock' || selectedClass === 'fii') && (q.detectedType === 'stock' || q.detectedType === 'fii') && selectedClass !== q.detectedType) {
        selectedClass = q.detectedType;
      }

      tickerInput.value = q.symbol || code;
      if (q.providerName && (!userEditedName || !varNameInput.value.trim() || lastQueriedTicker !== code)) {
        varNameInput.value = q.providerName;
      }
      lastQueriedTicker = code;

      currentQuoteObj = {
        ...q,
        symbol: q.symbol || code,
        fetchedAt: new Date().toISOString()
      };
      quoteState = 'ok';
      quoteStatusDetail = '';

      // Se for novo cadastro e o usuário ainda não digitou preço médio manualmente, sugere a cotação encontrada
      if (!userEditedAvgPrice && (!priceInput.value || options.autoFillPrice !== false)) {
        priceInput.value = Number(q.price).toFixed(2);
      }

      updateDynamicClassUI();
      document.getElementById('group-inv-ticker').classList.remove('has-error');
      document.getElementById('group-inv-var-name').classList.remove('has-error');
    } catch (err) {
      if (seq !== lookupSeq) return;
      if (err && err.code === 'NOT_FOUND') {
        currentQuoteObj = null;
        quoteState = 'not_found';
        quoteStatusDetail = err.message || `O código "${code}" não foi localizado.`;
      } else {
        // API indisponível: NÃO inventar preço fictício; manter último preço válido se existir
        const fallbackQuote = (investment && String(investment.ticker || '').toUpperCase() === code && Storage.hasMarketQuote(investment))
          ? investment.quote
          : Storage.getCachedQuote(code);
        if (fallbackQuote && Number.isFinite(Number(fallbackQuote.price)) && Number(fallbackQuote.price) > 0) {
          currentQuoteObj = { ...fallbackQuote };
          quoteState = 'stale';
          quoteStatusDetail = MarketApiService._friendlyError(err);
          if (fallbackQuote.providerName && (!userEditedName || !varNameInput.value.trim())) {
            varNameInput.value = fallbackQuote.providerName;
          }
          if (!userEditedAvgPrice && !priceInput.value) {
            priceInput.value = Number(fallbackQuote.price).toFixed(2);
          }
        } else {
          currentQuoteObj = null;
          quoteState = 'unavailable';
          quoteStatusDetail = `API de cotações indisponível (${MarketApiService._friendlyError(err)}) e não há último preço válido salvo para ${code}.`;
        }
      }
      lastQueriedTicker = code;
      renderQuoteCard();
      updateCalculations();
    }
  };

  // Botões de seleção de classe
  form.querySelectorAll('.inv-class-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const newClass = btn.getAttribute('data-class');
      if (newClass === selectedClass) return;
      const prevClass = selectedClass;
      selectedClass = newClass;
      updateDynamicClassUI();

      if (selectedClass !== 'fixed') {
        const curCode = tickerInput.value.toUpperCase().trim();
        if (curCode && ((prevClass === 'crypto') !== (selectedClass === 'crypto'))) {
          performTickerLookup(curCode, { preserveClass: true });
        }
      }
    });
  });

  varNameInput.addEventListener('input', () => {
    userEditedName = Boolean(varNameInput.value.trim());
  });

  priceInput.addEventListener('input', () => {
    userEditedAvgPrice = Boolean(priceInput.value);
    updateCalculations();
  });

  qtyInput.addEventListener('input', () => {
    updateCalculations();
  });

  lookupBtn.addEventListener('click', () => {
    const q = tickerInput.value.toUpperCase().trim();
    if (q) performTickerLookup(q, { autoFillPrice: !userEditedAvgPrice });
  });

  // Autocomplete + busca automática ao digitar o ticker
  tickerInput.addEventListener('input', () => {
    const q = tickerInput.value.toUpperCase().trim();
    clearTimeout(lookupTimer);

    if (!q) {
      resultsBox.style.display = 'none';
      currentQuoteObj = null;
      quoteState = 'idle';
      renderQuoteCard();
      updateCalculations();
      return;
    }

    const allowedTypes = selectedClass === 'crypto' ? ['crypto'] : ['stock', 'fii'];
    const matches = TICKER_CATALOG.filter(item =>
      allowedTypes.includes(item.type) &&
      (item.ticker.includes(q) || item.name.toUpperCase().includes(q))
    ).slice(0, 6);

    if (matches.length > 0) {
      resultsBox.innerHTML = matches.map(m => `
        <div class="inv-ticker-result-item" data-ticker="${m.ticker}" data-name="${Utils.escapeHtml(m.name)}" data-type="${m.type}">
          <div>
            <strong>${m.ticker}</strong> - <span>${Utils.escapeHtml(m.name)}</span>
          </div>
          <span class="badge inv-badge-class ${m.type}">${m.type === 'fii' ? 'FII' : m.type === 'stock' ? 'Ação' : 'Cripto'}</span>
        </div>
      `).join('');
      resultsBox.style.display = 'block';

      resultsBox.querySelectorAll('.inv-ticker-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const pickedTicker = item.getAttribute('data-ticker');
          const pickedName = item.getAttribute('data-name');
          const pickedType = item.getAttribute('data-type');
          clearTimeout(lookupTimer);
          resultsBox.style.display = 'none';

          selectedClass = pickedType;
          tickerInput.value = pickedTicker;
          varNameInput.value = pickedName;
          userEditedName = false;
          updateDynamicClassUI();
          performTickerLookup(pickedTicker, { autoFillPrice: !userEditedAvgPrice });
        });
      });
    } else {
      resultsBox.style.display = 'none';
    }

    // Dispara consulta automática quando o ticker tiver tamanho válido (ex: PETR4, MXRF11, BTC)
    const minLen = selectedClass === 'crypto' ? 2 : 5;
    if (q.length >= minLen) {
      lookupTimer = setTimeout(() => {
        resultsBox.style.display = 'none';
        performTickerLookup(q, { autoFillPrice: !userEditedAvgPrice });
      }, 450);
    }
  });

  tickerInput.addEventListener('blur', () => {
    setTimeout(() => { resultsBox.style.display = 'none'; }, 180);
    const q = tickerInput.value.toUpperCase().trim();
    if (q && q.length >= 2 && (q !== lastQueriedTicker || (!currentQuoteObj && quoteState === 'idle'))) {
      clearTimeout(lookupTimer);
      performTickerLookup(q, { autoFillPrice: !userEditedAvgPrice });
    }
  });

  updateDynamicClassUI();

  // Na edição de ativo variável, atualiza a cotação automaticamente preservando os dados já cadastrados
  if (isEdit && selectedClass !== 'fixed' && investment.ticker) {
    performTickerLookup(investment.ticker, { autoFillPrice: false, preserveClass: true });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (selectedClass === 'fixed') {
      const fixedName = document.getElementById('inv-fixed-name').value.trim();
      const fixedInst = document.getElementById('inv-fixed-inst').value.trim();
      const appliedVal = parseFloat(document.getElementById('inv-applied').value);
      const yieldType = document.getElementById('inv-yield-type').value;
      const rateText = document.getElementById('inv-rate').value.trim();
      const appDate = document.getElementById('inv-app-date').value;
      const maturityDate = document.getElementById('inv-maturity').value;
      const accYieldRaw = document.getElementById('inv-acc-yield').value;
      const accYield = accYieldRaw !== '' && !isNaN(parseFloat(accYieldRaw)) ? parseFloat(accYieldRaw) : null;

      const errName = !fixedName;
      const errInst = !fixedInst;
      const errApplied = isNaN(appliedVal) || appliedVal <= 0;
      const errRate = !rateText;
      const errAppDate = !appDate;
      const errMaturity = !maturityDate;

      document.getElementById('group-inv-fixed-name').classList.toggle('has-error', errName);
      document.getElementById('group-inv-fixed-inst').classList.toggle('has-error', errInst);
      document.getElementById('group-inv-applied').classList.toggle('has-error', errApplied);
      document.getElementById('group-inv-rate').classList.toggle('has-error', errRate);
      document.getElementById('group-inv-app-date').classList.toggle('has-error', errAppDate);
      document.getElementById('group-inv-maturity').classList.toggle('has-error', errMaturity);

      if (errName || errInst || errApplied || errRate || errAppDate || errMaturity) {
        return;
      }

      const payload = {
        id: isEdit ? investment.id : Utils.generateId(),
        type: 'fixed',
        ticker: '',
        name: fixedName,
        institution: fixedInst,
        appliedAmount: appliedVal,
        yieldType,
        benchmark: yieldType,
        rateText,
        applicationDate: appDate,
        maturityDate,
        accumulatedYield: accYield,
        notes: isEdit ? (investment.notes || '') : ''
      };

      this.close();
      if (onSave) onSave(payload, isEdit);
      return;
    }

    // Validação para Ações, FIIs e Criptomoedas
    const ticker = tickerInput.value.toUpperCase().trim();
    const name = varNameInput.value.trim();
    const qty = parseFloat(qtyInput.value);
    let price = parseFloat(priceInput.value);
    if ((isNaN(price) || price <= 0) && currentQuoteObj && Number(currentQuoteObj.price) > 0) {
      price = Number(currentQuoteObj.price);
    }

    if (quoteState === 'not_found') {
      document.getElementById('group-inv-ticker').classList.add('has-error');
      document.getElementById('error-inv-ticker').textContent = 'Ativo não localizado. Verifique o código digitado.';
      Toast.error('Ativo não localizado', `O código "${ticker}" não foi encontrado na base de cotações.`);
      return;
    }

    const errTicker = !ticker;
    const errName = !name;
    const errQty = isNaN(qty) || qty <= 0;
    const errPrice = isNaN(price) || price <= 0;

    document.getElementById('group-inv-ticker').classList.toggle('has-error', errTicker);
    document.getElementById('group-inv-var-name').classList.toggle('has-error', errName);
    document.getElementById('group-inv-qty').classList.toggle('has-error', errQty);
    document.getElementById('group-inv-price').classList.toggle('has-error', errPrice);

    if (errTicker || errName || errQty || errPrice) {
      return;
    }

    const payload = {
      id: isEdit ? investment.id : Utils.generateId(),
      type: selectedClass,
      ticker,
      name,
      institution: isEdit ? (investment.institution || '') : '',
      quantity: qty,
      averagePrice: price,
      fees: 0,
      quote: currentQuoteObj || (isEdit ? investment.quote : null),
      quoteError: quoteState === 'stale' ? { failedAt: new Date().toISOString(), message: quoteStatusDetail || 'Cotação desatualizada' } : null,
      notes: isEdit ? (investment.notes || '') : ''
    };

    this.close();
    if (onSave) onSave(payload, isEdit);
  });
};

Modal.openInvestmentDetailsModal = function(investment, onEdit) {
  if (!investment) return;
  const isFixed = investment.type === 'fixed';
  const trades = Storage.getInvestmentTransactions().filter(t => t.investmentId === investment.id);
  const dividends = Storage.getDividends().filter(d => d.investmentId === investment.id);
  const totalDividends = dividends.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const classNames = {
    stock: 'Ação (B3)',
    fii: 'Fundo Imobiliário (FII)',
    crypto: 'Criptomoeda',
    fixed: 'Renda Fixa'
  };
  const classIcons = {
    stock: '📈',
    fii: '🏢',
    crypto: '🪙',
    fixed: '🏛️'
  };

  let detailsContentHtml = '';
  if (isFixed) {
    const applied = Storage.getAppliedAmount(investment);
    const accYield = Storage.getAccumulatedYield(investment);
    const currentPos = accYield !== null ? applied + accYield : applied;
    detailsContentHtml = `
      <div class="inv-details-grid">
        <div class="inv-details-item">
          <span class="inv-details-label">Nome do Investimento</span>
          <strong class="inv-details-value">${Utils.escapeHtml(investment.name)}</strong>
        </div>
        <div class="inv-details-item">
          <span class="inv-details-label">Instituição Financeira</span>
          <strong class="inv-details-value">${Utils.escapeHtml(investment.institution || 'Não informada')}</strong>
        </div>
        <div class="inv-details-item">
          <span class="inv-details-label">Valor Aplicado</span>
          <strong class="inv-details-value text-primary">${Utils.formatCurrency(applied)}</strong>
        </div>
        <div class="inv-details-item">
          <span class="inv-details-label">Tipo de Rentabilidade</span>
          <strong class="inv-details-value">${Utils.escapeHtml(Storage.getYieldTypeLabel(investment.yieldType || investment.benchmark))}</strong>
        </div>
        <div class="inv-details-item">
          <span class="inv-details-label">Taxa Contratada</span>
          <strong class="inv-details-value">${Utils.escapeHtml(investment.rateText || '—')}</strong>
        </div>
        <div class="inv-details-item">
          <span class="inv-details-label">Data da Aplicação</span>
          <strong class="inv-details-value">${investment.applicationDate ? Utils.formatDate(investment.applicationDate) : '—'}</strong>
        </div>
        <div class="inv-details-item">
          <span class="inv-details-label">Data de Vencimento</span>
          <strong class="inv-details-value">${investment.maturityDate ? Utils.formatDate(investment.maturityDate) : ' Liquidez Diária / Sem vencimento'}</strong>
        </div>
        <div class="inv-details-item">
          <span class="inv-details-label">Rentabilidade Acumulada</span>
          <strong class="inv-details-value ${accYield !== null && accYield >= 0 ? 'text-success' : ''}">
            ${accYield !== null ? `${accYield >= 0 ? '+' : ''}${Utils.formatCurrency(accYield)} (Saldo: ${Utils.formatCurrency(currentPos)})` : 'Não informada'}
          </strong>
        </div>
      </div>
    `;
  } else {
    const qty = Number(investment.quantity) || 0;
    const avg = Number(investment.averagePrice) || 0;
    const totalInvested = Storage.getCostBasis(investment);
    const hasQuote = Storage.hasMarketQuote(investment);
    const quotePrice = Storage.getMarketPrice(investment);
    const marketVal = hasQuote ? qty * quotePrice : null;
    const profit = hasQuote ? marketVal - totalInvested : null;
    const profitPct = (profit !== null && totalInvested > 0) ? (profit / totalInvested) * 100 : null;
    const st = MarketApiService.getQuoteStatus(investment);
    const codeLabel = investment.type === 'crypto' ? 'Símbolo' : 'Código de Negociação (Ticker)';
    const nameLabel = investment.type === 'crypto' ? 'Nome da Criptomoeda' : 'Nome do Ativo';
    const qtyLabel = investment.type === 'stock' ? 'Quantidade de Ações' : investment.type === 'fii' ? 'Quantidade de Cotas' : 'Quantidade';

    detailsContentHtml = `
      <div class="inv-details-grid">
        <div class="inv-details-item">
          <span class="inv-details-label">${nameLabel}</span>
          <strong class="inv-details-value">${Utils.escapeHtml(investment.name)}</strong>
        </div>
        <div class="inv-details-item">
          <span class="inv-details-label">${codeLabel}</span>
          <strong class="inv-details-value">${Utils.escapeHtml(investment.ticker)}</strong>
        </div>
        <div class="inv-details-item">
          <span class="inv-details-label">${qtyLabel}</span>
          <strong class="inv-details-value">${qty}</strong>
        </div>
        <div class="inv-details-item">
          <span class="inv-details-label">Preço Médio de Compra</span>
          <strong class="inv-details-value">${Utils.formatCurrency(avg)}</strong>
        </div>
        <div class="inv-details-item">
          <span class="inv-details-label">Cotação Atual Automática</span>
          <strong class="inv-details-value text-primary">
            ${hasQuote ? Utils.formatCurrency(quotePrice) : 'Indisponível'}
            <span style="font-size: 0.72rem; font-weight: 600; margin-left: 6px; color: var(--text-muted);">(${Utils.escapeHtml(st.label)})</span>
          </strong>
        </div>
        <div class="inv-details-item">
          <span class="inv-details-label">Valor Total Investido</span>
          <strong class="inv-details-value">${Utils.formatCurrency(totalInvested)}</strong>
        </div>
        <div class="inv-details-item">
          <span class="inv-details-label">Valor Atual da Posição</span>
          <strong class="inv-details-value text-primary">${hasQuote ? Utils.formatCurrency(marketVal) : 'Aguardando cotação'}</strong>
        </div>
        <div class="inv-details-item">
          <span class="inv-details-label">Resultado Não Realizado</span>
          <strong class="inv-details-value ${profit !== null ? (profit >= 0 ? 'text-success' : 'text-danger') : ''}">
            ${profit !== null ? `${profit >= 0 ? '+' : ''}${Utils.formatCurrency(profit)} (${profit >= 0 ? '+' : ''}${profitPct.toFixed(2)}%)` : '—'}
          </strong>
        </div>
      </div>
    `;
  }

  const modalHtml = `
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 1.5rem;">${classIcons[investment.type] || '📈'}</span>
        <div>
          <h3 class="modal-title">${isFixed ? Utils.escapeHtml(investment.name) : `${Utils.escapeHtml(investment.ticker)} — ${Utils.escapeHtml(investment.name)}`}</h3>
          <span class="inv-badge-class ${investment.type}">${classNames[investment.type] || investment.type}</span>
        </div>
      </div>
      <button class="modal-close-btn" type="button" title="Fechar">${Utils.icons.close}</button>
    </div>
    <div class="modal-body">
      ${detailsContentHtml}
      ${!isFixed && totalDividends > 0 ? `
        <div style="margin-top: var(--spacing-3); padding: var(--spacing-3); background: var(--bg-surface-secondary); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: var(--font-size-xs); color: var(--text-secondary);">Total de Proventos Recebidos deste Ativo (${dividends.length} registro(s))</span>
          <strong class="text-success">+ ${Utils.formatCurrency(totalDividends)}</strong>
        </div>
      ` : ''}
      ${trades.length > 0 ? `
        <div style="margin-top: var(--spacing-4);">
          <h4 style="font-size: var(--font-size-xs); text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); margin-bottom: var(--spacing-2);">
            Histórico de Movimentações (${trades.length})
          </h4>
          <div style="max-height: 160px; overflow-y: auto; border: 1px solid var(--border-color-subtle); border-radius: var(--radius-md);">
            <table class="inv-table" style="font-size: var(--font-size-xs);">
              <thead>
                <tr>
                  <th style="padding: 6px 10px;">Data</th>
                  <th style="padding: 6px 10px;">Tipo</th>
                  ${!isFixed ? `<th style="padding: 6px 10px;">Qtd.</th><th style="padding: 6px 10px;">Preço Unit.</th>` : ''}
                  <th style="padding: 6px 10px; text-align: right;">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                ${trades.map(t => `
                  <tr>
                    <td style="padding: 6px 10px;">${Utils.formatDate(t.date)}</td>
                    <td style="padding: 6px 10px;"><span class="badge ${t.type === 'buy' ? 'badge-income' : 'badge-expense'}">${t.type === 'buy' ? (isFixed ? 'Aplicação' : 'Compra') : (isFixed ? 'Resgate' : 'Venda')}</span></td>
                    ${!isFixed ? `<td style="padding: 6px 10px;">${t.quantity}</td><td style="padding: 6px 10px;">${Utils.formatCurrency(t.unitPrice)}</td>` : ''}
                    <td style="padding: 6px 10px; text-align: right; font-weight: 600;">${Utils.formatCurrency(t.totalAmount)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary modal-cancel-btn">Fechar</button>
      <button type="button" class="btn btn-primary" id="btn-details-edit-inv">${Utils.icons.edit} Editar Investimento</button>
    </div>
  `;

  this.open(modalHtml);
  this.backdrop.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());
  const editBtn = document.getElementById('btn-details-edit-inv');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      this.close();
      if (onEdit) onEdit(investment);
    });
  }
};

Modal.openTradeModal = function(investment, defaultType = 'buy', onConfirm) {
  const isBuy = defaultType === 'buy';
  const isFixed = investment.type === 'fixed';
  const availableQty = investment.quantity || 0;
  const metrics = State.calculateMetrics(Storage.getTransactions());
  const availableBalance = metrics.balance;
  const unitName = investment.type === 'stock' ? 'ações' : investment.type === 'fii' ? 'cotas' : (investment.ticker || 'unidades');
  const headerDisplay = isFixed
    ? Utils.escapeHtml(investment.name)
    : `${Utils.escapeHtml(investment.ticker)} - ${Utils.escapeHtml(investment.name)}`;

  const modalHtml = `
    <div class="modal-header">
      <h3 class="modal-title">${isBuy ? (isFixed ? 'Novo Aporte em Renda Fixa' : 'Comprar Ativo') : (isFixed ? 'Resgatar Renda Fixa' : 'Vender Ativo')}</h3>
      <button class="modal-close-btn" type="button" title="Fechar">${Utils.icons.close}</button>
    </div>
    <form id="form-trade">
      <div class="modal-body">
        <div class="caixinha-modal-banner" style="border-left: 4px solid var(--color-primary);">
          <span style="font-size: 1.5rem;">${investment.type === 'crypto' ? '🪙' : investment.type === 'fii' ? '🏢' : investment.type === 'stock' ? '📈' : '🏛️'}</span>
          <div>
            <strong style="font-size: var(--font-size-md); color: var(--text-primary);">${headerDisplay}</strong>
            <div style="font-size: var(--font-size-xs); color: var(--text-muted);">
              ${isFixed
                ? `Valor Aplicado Atual: <strong>${Utils.formatCurrency(Storage.getAppliedAmount(investment))}</strong> | Taxa: <strong>${Utils.escapeHtml(investment.rateText || Storage.getYieldTypeLabel(investment.yieldType))}</strong>`
                : `Posição Atual: <strong>${investment.quantity} ${unitName}</strong> | Preço Médio: <strong>${Utils.formatCurrency(investment.averagePrice)}</strong>`}
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Tipo de Operação</label>
          <div class="segmented-control">
            <div class="segmented-option type-income">
              <input type="radio" id="trade-buy" name="tradeType" value="buy" ${isBuy ? 'checked' : ''}>
              <label for="trade-buy">➕ ${isFixed ? 'Aporte' : 'Compra'}</label>
            </div>
            <div class="segmented-option type-expense">
              <input type="radio" id="trade-sell" name="tradeType" value="sell" ${!isBuy ? 'checked' : ''}>
              <label for="trade-sell">➖ ${isFixed ? 'Resgate' : 'Venda'}</label>
            </div>
          </div>
        </div>

        <div class="caixinha-balance-available-pill" id="trade-balance-pill">
          <span>${isBuy ? 'Saldo Disponível na Conta:' : 'Quantidade Disponível para Venda:'}</span>
          <strong class="${isBuy ? 'text-success' : 'text-primary'}">${isBuy ? Utils.formatCurrency(availableBalance) : availableQty + ' ' + unitName}</strong>
        </div>

        <div class="form-row">
          <div class="form-group" id="group-trade-qty">
            <label class="form-label" for="trade-qty">Quantidade <span class="required">*</span></label>
            <input type="number" id="trade-qty" step="any" min="0.00000001" placeholder="Ex: 50" value="${isFixed ? '1' : ''}" required autofocus>
            <span class="form-error">Quantidade inválida ou superior à posição disponível.</span>
          </div>

          <div class="form-group" id="group-trade-price">
            <label class="form-label" for="trade-price">${isFixed ? 'Valor da Operação (R$)' : 'Preço Unitário (R$)'} <span class="required">*</span></label>
            <div class="input-with-prefix">
              <span class="input-prefix">R$</span>
              <input type="number" id="trade-price" step="0.01" min="0.01" placeholder="0,00" value="${Storage.getMarketPrice(investment) ?? ''}" required>
            </div>
            <span class="form-error">Informe o valor unitário da operação.</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="trade-fees">Taxas / Emolumentos (R$)</label>
            <div class="input-with-prefix">
              <span class="input-prefix">R$</span>
              <input type="number" id="trade-fees" step="0.01" min="0" placeholder="0,00" value="0.00">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="trade-date">Data da Operação</label>
            <input type="date" id="trade-date" value="${Utils.getTodayString()}" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="trade-broker">Instituição / Corretora</label>
          <input type="text" id="trade-broker" placeholder="Ex: NuInvest, XP, Binance..." value="${Utils.escapeHtml(investment.institution || '')}">
        </div>

        <div class="form-group">
          <label class="form-label" for="trade-notes">Observações</label>
          <input type="text" id="trade-notes" placeholder="Detalhes da operação...">
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary modal-cancel-btn">Cancelar</button>
        <button type="submit" class="btn btn-primary" id="btn-trade-submit">${isBuy ? 'Confirmar Compra' : 'Confirmar Venda'}</button>
      </div>
    </form>
  `;

  this.open(modalHtml);
  const form = document.getElementById('form-trade');
  form.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());

  const typeRadios = form.querySelectorAll('input[name="tradeType"]');
  const pill = document.getElementById('trade-balance-pill');
  const submitBtn = document.getElementById('btn-trade-submit');

  typeRadios.forEach(r => {
    r.addEventListener('change', (e) => {
      const mode = e.target.value;
      if (mode === 'buy') {
        pill.innerHTML = `<span>Saldo Disponível na Conta:</span><strong class="text-success">${Utils.formatCurrency(availableBalance)}</strong>`;
        submitBtn.textContent = 'Confirmar Compra';
      } else {
        pill.innerHTML = `<span>Quantidade Disponível para Venda:</span><strong class="text-primary">${availableQty} ${unitName}</strong>`;
        submitBtn.textContent = 'Confirmar Venda';
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = form.querySelector('input[name="tradeType"]:checked').value;
    const qty = parseFloat(document.getElementById('trade-qty').value);
    const unitPrice = parseFloat(document.getElementById('trade-price').value);
    const fees = parseFloat(document.getElementById('trade-fees').value) || 0;
    const date = document.getElementById('trade-date').value || Utils.getTodayString();
    const broker = document.getElementById('trade-broker').value.trim();
    const notes = document.getElementById('trade-notes').value.trim();

    if (isNaN(qty) || qty <= 0) {
      document.getElementById('group-trade-qty').classList.add('has-error');
      return;
    }

    if (type === 'sell' && qty > availableQty) {
      document.getElementById('group-trade-qty').classList.add('has-error');
      Toast.error('Quantidade Inválida', `Você possui apenas ${availableQty} ${unitName} disponíveis para venda.`);
      return;
    }

    if (isNaN(unitPrice) || unitPrice <= 0) {
      document.getElementById('group-trade-price').classList.add('has-error');
      return;
    }

    const totalOperation = qty * unitPrice;
    if (type === 'buy' && (totalOperation + fees) > availableBalance) {
      Toast.error('Saldo Insuficiente', `O valor da compra (${Utils.formatCurrency(totalOperation + fees)}) excede o saldo disponível.`);
      return;
    }

    this.close();
    if (onConfirm) onConfirm({ type, quantity: qty, unitPrice, fees, date, broker, notes });
  });
};

Modal.openDividendModal = function(investment = null, onSave) {
  const investments = Storage.getInvestments();
  const selectedInvId = investment ? investment.id : (investments[0]?.id || '');
  const selectedInv = investments.find(i => i.id === selectedInvId);

  const modalHtml = `
    <div class="modal-header">
      <h3 class="modal-title">Registrar Provento / Rendimento</h3>
      <button class="modal-close-btn" type="button" title="Fechar">${Utils.icons.close}</button>
    </div>
    <form id="form-dividend">
      <div class="modal-body">
        <div class="form-group" id="group-div-inv">
          <label class="form-label" for="div-inv">Ativo Referente <span class="required">*</span></label>
          <select id="div-inv" required>
            ${investments.map(inv => `
              <option value="${inv.id}" ${inv.id === selectedInvId ? 'selected' : ''}>
                ${inv.type === 'fixed' ? Utils.escapeHtml(inv.name) : `${Utils.escapeHtml(inv.ticker)} - ${Utils.escapeHtml(inv.name)}`} (${inv.type === 'fixed' ? 'Renda Fixa' : inv.type.toUpperCase()})
              </option>
            `).join('')}
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="div-type">Tipo de Provento</label>
            <select id="div-type">
              <option value="dividend">Dividendo</option>
              <option value="jcp">Juros sobre Capital Próprio (JCP)</option>
              <option value="yield">Rendimento / Aluguel FII</option>
            </select>
          </div>

          <div class="form-group" id="group-div-amount">
            <label class="form-label" for="div-amount">Valor Recebido (R$) <span class="required">*</span></label>
            <div class="input-with-prefix">
              <span class="input-prefix">R$</span>
              <input type="number" id="div-amount" step="0.01" min="0.01" placeholder="0,00" required autofocus>
            </div>
            <span class="form-error">Informe um valor maior que zero.</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="div-date">Data de Pagamento</label>
            <input type="date" id="div-date" value="${Utils.getTodayString()}" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="div-qty">Quantidade na Data-Base (Opcional)</label>
            <input type="number" id="div-qty" placeholder="Ex: 100" value="${selectedInv && selectedInv.type !== 'fixed' ? (selectedInv.quantity || '') : ''}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="div-notes">Observação</label>
          <input type="text" id="div-notes" placeholder="Ex: Rendimento mensal por cota...">
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary modal-cancel-btn">Cancelar</button>
        <button type="submit" class="btn btn-primary">Salvar Provento</button>
      </div>
    </form>
  `;

  this.open(modalHtml);
  const form = document.getElementById('form-dividend');
  form.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const invId = document.getElementById('div-inv').value;
    const inv = investments.find(i => i.id === invId);
    const amount = parseFloat(document.getElementById('div-amount').value);
    const type = document.getElementById('div-type').value;
    const date = document.getElementById('div-date').value || Utils.getTodayString();
    const qtyRef = parseFloat(document.getElementById('div-qty').value) || (inv && inv.type !== 'fixed' ? (inv.quantity || 0) : 0);
    const notes = document.getElementById('div-notes').value.trim();

    if (isNaN(amount) || amount <= 0) {
      document.getElementById('group-div-amount').classList.add('has-error');
      return;
    }

    const payload = {
      id: Utils.generateId(),
      investmentId: invId,
      ticker: inv ? (inv.type === 'fixed' ? inv.name : inv.ticker) : 'PROVENTO',
      type,
      amount,
      quantityRef: qtyRef,
      date,
      notes
    };

    this.close();
    if (onSave) onSave(payload);
  });
};

Modal.openInvestmentGoalModal = function(goal = null, onSave) {
  const isEdit = Boolean(goal && goal.id);

  const modalHtml = `
    <div class="modal-header">
      <h3 class="modal-title">${isEdit ? 'Editar Meta de Investimento' : 'Nova Meta de Investimento'}</h3>
      <button class="modal-close-btn" type="button" title="Fechar">${Utils.icons.close}</button>
    </div>
    <form id="form-inv-goal">
      <div class="modal-body">
        <div class="form-group" id="group-ig-name">
          <label class="form-label" for="ig-name">Nome do Objetivo <span class="required">*</span></label>
          <input type="text" id="ig-name" placeholder="Ex: R$ 50.000 Investidos, R$ 500 em Dividendos..." value="${Utils.escapeHtml(goal?.name || '')}" required>
          <span class="form-error">Informe o nome do objetivo.</span>
        </div>

        <div class="form-row">
          <div class="form-group" id="group-ig-amount">
            <label class="form-label" for="ig-amount">Valor Alvo (R$) <span class="required">*</span></label>
            <div class="input-with-prefix">
              <span class="input-prefix">R$</span>
              <input type="number" id="ig-amount" step="0.01" min="0.01" placeholder="10000,00" value="${goal?.targetAmount || ''}" required>
            </div>
            <span class="form-error">Informe um valor alvo maior que zero.</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="ig-deadline">Prazo Desejado</label>
            <input type="date" id="ig-deadline" value="${goal?.deadline || ''}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="ig-desc">Descrição / Estratégia</label>
          <textarea id="ig-desc" rows="2" placeholder="Ex: Aportes mensais em FIIs para geração de renda passiva...">${Utils.escapeHtml(goal?.description || '')}</textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary modal-cancel-btn">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Salvar Meta' : 'Criar Meta'}</button>
      </div>
    </form>
  `;

  this.open(modalHtml);
  const form = document.getElementById('form-inv-goal');
  form.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('ig-name').value.trim();
    const amount = parseFloat(document.getElementById('ig-amount').value);
    const deadline = document.getElementById('ig-deadline').value || null;
    const desc = document.getElementById('ig-desc').value.trim();

    if (!name || isNaN(amount) || amount <= 0) {
      document.getElementById('group-ig-name').classList.toggle('has-error', !name);
      document.getElementById('group-ig-amount').classList.toggle('has-error', isNaN(amount) || amount <= 0);
      return;
    }

    const payload = {
      id: isEdit ? goal.id : Utils.generateId(),
      name,
      targetAmount: amount,
      deadline,
      description: desc
    };

    this.close();
    if (onSave) onSave(payload, isEdit);
  });
};




  // =========================================================================
  // 7. VIEWS
  // =========================================================================

  // VIEW 1: DASHBOARD
  const DashboardView = {
    container: null,

    init(containerElement) {
      this.container = containerElement;
      this.render();

      State.subscribe((event, payload) => {
        if (['transaction_saved', 'transaction_deleted', 'category_saved', 'category_deleted', 'dashboard_filter_changed', 'balance_visibility_changed', 'theme_changed'].includes(event)) {
          if (event === 'transaction_saved' && payload && payload.date) {
            const parts = payload.date.split('-');
            if (parts.length >= 2) {
              const txYear = parseInt(parts[0], 10);
              const txMonth = parseInt(parts[1], 10);
              if (State.dashboardFilter.year !== txYear) {
                State.dashboardFilter.year = txYear;
              }
              if (State.dashboardFilter.month !== 'all' && State.dashboardFilter.month !== txMonth) {
                State.dashboardFilter.month = txMonth;
              }
            }
          }
          if (State.currentView === 'dashboard') this.render();
        }
      });

      window.addEventListener('resize', () => {
        if (State.currentView === 'dashboard') this.renderCharts();
      });
    },

    render() {
      if (!this.container) return;

      const allTransactions = Storage.getTransactions();
      const categories = Storage.getCategories();
      const catMap = new Map(categories.map(c => [c.id, c]));
      const settings = Storage.getSettings();

      const { month, year } = State.dashboardFilter;
      const filteredTransactions = State.filterByMonthAndYear(allTransactions, month, year);
      const metrics = State.calculateMetrics(filteredTransactions);

      const availableYears = Array.from(new Set(
        allTransactions.map(t => t.date ? parseInt(t.date.split('-')[0], 10) : null).filter(Boolean)
      )).sort((a, b) => b - a);

      if (!availableYears.includes(new Date().getFullYear())) {
        availableYears.unshift(new Date().getFullYear());
      }

      const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));
      const recentTransactions = sortedTransactions.slice(0, 6);
      const privacyClass = settings.hideBalances ? 'privacy-blurred' : '';

      this.container.innerHTML = `
        <div class="dashboard-header-bar">
          <div class="dashboard-greeting">
            <h2>Olá, ${Utils.escapeHtml(settings.userName || 'Usuário')}! 👋</h2>
            <p>Aqui está o resumo completo da sua saúde financeira.</p>
          </div>

          <div class="dashboard-period-filter">
            <label class="sr-only" for="dash-select-month">Filtrar Mês</label>
            <select id="dash-select-month">
              <option value="all" ${month === 'all' ? 'selected' : ''}>Todos os Meses</option>
              ${Array.from({ length: 12 }, (_, i) => `
                <option value="${i + 1}" ${month === (i + 1) ? 'selected' : ''}>${Utils.getMonthName(i)}</option>
              `).join('')}
            </select>

            <span style="color: var(--border-color); font-weight: 300;">|</span>

            <label class="sr-only" for="dash-select-year">Filtrar Ano</label>
            <select id="dash-select-year">
              ${availableYears.map(y => `
                <option value="${y}" ${year === y ? 'selected' : ''}>${y}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="dashboard-metrics-grid">
          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-label">Saldo Disponível</span>
              <div class="metric-icon-wrap balance">${Utils.icons.wallet}</div>
            </div>
            <div class="metric-value ${privacyClass} ${metrics.balance < 0 ? 'text-danger' : 'text-primary'}">
              ${Utils.formatCurrency(metrics.balance)}
            </div>
            <div class="metric-subtext">
              <span>${metrics.balance >= 0 ? '🟢 Saldo positivo' : '🔴 Saldo negativo'}</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-label">Total de Receitas</span>
              <div class="metric-icon-wrap income">${Utils.icons.trendingUp}</div>
            </div>
            <div class="metric-value ${privacyClass} text-success">
              + ${Utils.formatCurrency(metrics.income)}
            </div>
            <div class="metric-subtext">
              <span>Entradas no período</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-label">Total de Despesas</span>
              <div class="metric-icon-wrap expense">${Utils.icons.trendingDown}</div>
            </div>
            <div class="metric-value ${privacyClass} text-danger">
              - ${Utils.formatCurrency(metrics.expense)}
            </div>
            <div class="metric-subtext">
              <span>Saídas e contas pagas</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-label">Taxa de Economia</span>
              <div class="metric-icon-wrap savings">${Utils.icons.piggyBank}</div>
            </div>
            <div class="metric-value">
              ${metrics.savingsRate}%
            </div>
            <div class="metric-subtext">
              <span>${metrics.savingsRate >= 20 ? 'Excelente rendimento!' : 'Meta recomendada: 20%'}</span>
            </div>
            <div class="savings-progress-track">
              <div class="savings-progress-bar" style="width: ${Math.min(100, metrics.savingsRate)}%;"></div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-label">Patrimônio Investido</span>
              <div class="metric-icon-wrap" style="background: rgba(59, 130, 246, 0.12); color: #3b82f6;">${Utils.icons.trendingUp}</div>
            </div>
            <div class="metric-value ${privacyClass} text-primary">
              ${Utils.formatCurrency(metrics.investedWealth)}
            </div>
            <div class="metric-subtext">
              <span>Alocado em Ações, FIIs e Cripto</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-label">Patrimônio Total</span>
              <div class="metric-icon-wrap" style="background: rgba(16, 185, 129, 0.12); color: #10b981;">${Utils.icons.wallet}</div>
            </div>
            <div class="metric-value ${privacyClass} text-success">
              ${Utils.formatCurrency(metrics.totalWealth)}
            </div>
            <div class="metric-subtext">
              <span>Conta + Caixinhas + Investimentos</span>
            </div>
          </div>
        </div>

        <div class="dashboard-charts-grid">
          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Receitas x Despesas</h3>
                <p class="card-subtitle">Evolução mensal ao longo de ${year}</p>
              </div>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <canvas id="chart-monthly-bars"></canvas>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Gastos por Categoria</h3>
                <p class="card-subtitle">${month === 'all' ? `Ano de ${year}` : `${Utils.getMonthName(month - 1)} de ${year}`}</p>
              </div>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <canvas id="chart-categories-donut"></canvas>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Movimentações Recentes</h3>
              <p class="card-subtitle">Últimas transações no período selecionado</p>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="btn-view-all-transactions">
              Ver Todas
            </button>
          </div>
          <div class="card-body" style="padding: 0;">
            ${recentTransactions.length === 0 ? `
              <div class="empty-state">
                <div class="empty-state-icon">${Utils.icons.transactions}</div>
                <h4 class="empty-state-title">Nenhuma transação encontrada</h4>
                <p class="empty-state-text">Você ainda não tem movimentações registradas neste período.</p>
                <button type="button" class="btn btn-primary btn-sm btn-quick-add-dash">
                  ${Utils.icons.plus} Adicionar Movimentação
                </button>
              </div>
            ` : `
              <div class="recent-transactions-list">
                ${recentTransactions.map(t => {
                  const cat = catMap.get(t.categoryId) || { name: 'Geral', icon: '🏷️', color: '#64748b' };
                  const isIncome = t.type === 'income';
                  return `
                    <div class="recent-item" data-id="${t.id}" style="cursor: pointer;" title="Clique para editar">
                      <div class="recent-item-left">
                        <div class="category-icon-bubble" style="background-color: ${cat.color}20; color: ${cat.color};">
                          ${cat.icon}
                        </div>
                        <div class="recent-item-meta">
                          <span class="recent-item-desc">${Utils.escapeHtml(t.description)}</span>
                          <div class="recent-item-sub">
                            <span>${Utils.escapeHtml(cat.name)}</span>
                            <span>•</span>
                            <span>${Utils.formatDate(t.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div class="recent-item-amount ${isIncome ? 'text-success' : 'text-danger'} ${privacyClass}">
                        ${isIncome ? '+' : '-'} ${Utils.formatCurrency(t.amount)}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        </div>
      `;

      const monthSelect = this.container.querySelector('#dash-select-month');
      const yearSelect = this.container.querySelector('#dash-select-year');
      monthSelect.addEventListener('change', (e) => State.setDashboardFilter(e.target.value, yearSelect.value));
      yearSelect.addEventListener('change', (e) => State.setDashboardFilter(monthSelect.value, e.target.value));

      const viewAllBtn = this.container.querySelector('#btn-view-all-transactions');
      if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
          State.setTransactionsFilter({ search: '', type: 'all', categoryId: 'all', period: 'all' });
          if (typeof App !== 'undefined' && App.navigateTo) {
            App.navigateTo('transactions');
          } else {
            State.setView('transactions');
          }
        });
      }

      const quickAddBtn = this.container.querySelector('.btn-quick-add-dash');
      if (quickAddBtn) {
        quickAddBtn.addEventListener('click', () => {
          Modal.openTransactionModal(null, (newTx) => {
            Storage.saveTransaction(newTx);
            Toast.success('Sucesso!', 'Transação adicionada com sucesso.');
            State.notify('transaction_saved', newTx);
          });
        });
      }

      this.container.querySelectorAll('.recent-item').forEach(item => {
        item.addEventListener('click', () => {
          const tx = Storage.getTransactionById(item.getAttribute('data-id'));
          if (tx) {
            Modal.openTransactionModal(tx, (updatedTx) => {
              Storage.updateTransaction(updatedTx);
              Toast.success('Atualizado!', 'Transação alterada com sucesso.');
              State.notify('transaction_saved', updatedTx);
            });
          }
        });
      });

      this.renderCharts(allTransactions, filteredTransactions, year);
    },

    renderCharts(allTransactions = null, filteredTransactions = null, year = null) {
      if (!allTransactions) allTransactions = Storage.getTransactions();
      if (!year) year = State.dashboardFilter.year;
      if (!filteredTransactions) {
        filteredTransactions = State.filterByMonthAndYear(allTransactions, State.dashboardFilter.month, year);
      }

      const barCanvas = document.getElementById('chart-monthly-bars');
      if (barCanvas) {
        Charts.renderBarChart(barCanvas, State.getMonthlyEvolution(allTransactions, year));
      }

      const donutCanvas = document.getElementById('chart-categories-donut');
      if (donutCanvas) {
        const breakdown = State.getCategoryBreakdown(filteredTransactions, 'expense');
        Charts.renderDonutChart(donutCanvas, breakdown.items, breakdown.totalSum);
      }
    }
  };

  // VIEW 2: TRANSAÇÕES
  const TransactionsView = {
    container: null,

    init(containerElement) {
      this.container = containerElement;
      this.render();

      State.subscribe((event) => {
        if (['transaction_saved', 'transaction_deleted', 'category_saved', 'category_deleted', 'transactions_filter_changed', 'balance_visibility_changed'].includes(event)) {
          if (State.currentView === 'transactions') this.render();
        }
      });
    },

    render() {
      if (!this.container) return;

      const allTransactions = Storage.getTransactions();
      const categories = Storage.getCategories();
      const catMap = new Map(categories.map(c => [c.id, c]));
      const settings = Storage.getSettings();
      const privacyClass = settings.hideBalances ? 'privacy-blurred' : '';

      const { search, type, categoryId, period } = State.transactionsFilter;

      let filtered = [...allTransactions];
      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        filtered = filtered.filter(t => {
          const catName = (catMap.get(t.categoryId)?.name || '').toLowerCase();
          return (t.description || '').toLowerCase().includes(q) ||
                 (t.notes || '').toLowerCase().includes(q) ||
                 catName.includes(q);
        });
      }

      if (type !== 'all') filtered = filtered.filter(t => t.type === type);
      if (categoryId !== 'all') filtered = filtered.filter(t => t.categoryId === categoryId);

      const now = new Date();
      const curYear = now.getFullYear();
      const curMonth = now.getMonth() + 1;

      if (period === 'current_month') {
        filtered = filtered.filter(t => {
          if (!t.date) return false;
          const [y, m] = t.date.split('-').map(n => parseInt(n, 10));
          return y === curYear && m === curMonth;
        });
      } else if (period === 'last_month') {
        const prevDate = new Date(curYear, now.getMonth() - 1, 1);
        const prevY = prevDate.getFullYear();
        const prevM = prevDate.getMonth() + 1;
        filtered = filtered.filter(t => {
          if (!t.date) return false;
          const [y, m] = t.date.split('-').map(n => parseInt(n, 10));
          return y === prevY && m === prevM;
        });
      } else if (period === 'this_year') {
        filtered = filtered.filter(t => {
          if (!t.date) return false;
          const [y] = t.date.split('-').map(n => parseInt(n, 10));
          return y === curYear;
        });
      }

      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

      let filteredIncome = 0;
      let filteredExpense = 0;
      filtered.forEach(t => {
        const val = Number(t.amount) || 0;
        if (t.type === 'income') filteredIncome += val;
        if (t.type === 'expense') filteredExpense += val;
      });
      const filteredNet = filteredIncome - filteredExpense;

      this.container.innerHTML = `
        <div class="transactions-toolbar">
          <div class="toolbar-top-row">
            <div class="search-input-wrap">
              ${Utils.icons.search}
              <input type="text" id="tx-search-input" placeholder="Buscar por descrição, anotação..." value="${Utils.escapeHtml(search)}">
            </div>

            <button type="button" class="btn btn-primary" id="btn-add-transaction">
              ${Utils.icons.plus} Nova Movimentação
            </button>
          </div>

          <div class="toolbar-filters-row">
            <select id="filter-select-type" class="filter-select">
              <option value="all" ${type === 'all' ? 'selected' : ''}>Todos os Tipos</option>
              <option value="income" ${type === 'income' ? 'selected' : ''}>Apenas Receitas</option>
              <option value="expense" ${type === 'expense' ? 'selected' : ''}>Apenas Despesas</option>
            </select>

            <select id="filter-select-category" class="filter-select">
              <option value="all" ${categoryId === 'all' ? 'selected' : ''}>Todas as Categorias</option>
              ${categories.map(c => `
                <option value="${c.id}" ${categoryId === c.id ? 'selected' : ''}>
                  ${c.icon} ${Utils.escapeHtml(c.name)} (${c.type === 'income' ? 'Receita' : 'Despesa'})
                </option>
              `).join('')}
            </select>

            <select id="filter-select-period" class="filter-select">
              <option value="all" ${period === 'all' ? 'selected' : ''}>Todas as Datas</option>
              <option value="current_month" ${period === 'current_month' ? 'selected' : ''}>Este Mês</option>
              <option value="last_month" ${period === 'last_month' ? 'selected' : ''}>Mês Passado</option>
              <option value="this_year" ${period === 'this_year' ? 'selected' : ''}>Este Ano (${curYear})</option>
            </select>

            ${(search || type !== 'all' || categoryId !== 'all' || period !== 'all') ? `
              <button type="button" class="btn btn-outline btn-sm" id="btn-reset-filters">
                ${Utils.icons.close} Limpar Filtros
              </button>
            ` : ''}
          </div>
        </div>

        <div class="transactions-stats-strip">
          <div>
            Exibindo <strong>${filtered.length}</strong> ${filtered.length === 1 ? 'movimentação' : 'movimentações'}
          </div>
          <div class="stats-strip-pills">
            <span class="stats-pill text-success ${privacyClass}">
              Receitas: + ${Utils.formatCurrency(filteredIncome)}
            </span>
            <span class="stats-pill text-danger ${privacyClass}">
              Despesas: - ${Utils.formatCurrency(filteredExpense)}
            </span>
            <span class="stats-pill font-bold ${filteredNet >= 0 ? 'text-success' : 'text-danger'} ${privacyClass}">
              Saldo: ${Utils.formatCurrency(filteredNet)}
            </span>
          </div>
        </div>

        <div class="card table-desktop-container">
          <div class="table-responsive">
            ${filtered.length === 0 ? `
              <div class="empty-state">
                <div class="empty-state-icon">${Utils.icons.transactions}</div>
                <h4 class="empty-state-title">Nenhuma movimentação encontrada</h4>
                <p class="empty-state-text">Nenhuma transação corresponde aos critérios de pesquisa ou filtros selecionados.</p>
                <button type="button" class="btn btn-primary btn-sm" id="btn-empty-add-tx">
                  ${Utils.icons.plus} Adicionar Transação
                </button>
              </div>
            ` : `
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 100px;">Tipo</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th style="width: 120px;">Data</th>
                    <th style="text-align: right; width: 140px;">Valor</th>
                    <th>Observação</th>
                    <th style="width: 90px; text-align: center;">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.map(t => {
                    const cat = catMap.get(t.categoryId) || { name: 'Outros', icon: '🏷️', color: '#64748b' };
                    const isIncome = t.type === 'income';
                    return `
                      <tr data-id="${t.id}">
                        <td>
                          <span class="badge ${isIncome ? 'badge-income' : 'badge-expense'}">
                            ${isIncome ? 'Receita' : 'Despesa'}
                          </span>
                        </td>
                        <td class="font-medium">
                          ${Utils.escapeHtml(t.description)}
                        </td>
                        <td>
                          <span class="badge badge-category" style="border-left: 3px solid ${cat.color};">
                            ${cat.icon} ${Utils.escapeHtml(cat.name)}
                          </span>
                        </td>
                        <td class="text-secondary" style="font-size: var(--font-size-sm);">
                          ${Utils.formatDate(t.date)}
                        </td>
                        <td style="text-align: right;">
                          <span class="${isIncome ? 'table-amount-income' : 'table-amount-expense'} ${privacyClass}">
                            ${isIncome ? '+' : '-'} ${Utils.formatCurrency(t.amount)}
                          </span>
                        </td>
                        <td class="text-secondary" style="font-size: var(--font-size-xs); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                          ${Utils.escapeHtml(t.notes || '—')}
                        </td>
                        <td>
                          <div class="table-actions">
                            <button type="button" class="action-btn edit-btn" data-id="${t.id}" title="Editar">
                              ${Utils.icons.edit}
                            </button>
                            <button type="button" class="action-btn delete-btn" data-id="${t.id}" title="Excluir">
                              ${Utils.icons.trash}
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            `}
          </div>
        </div>

        <div class="mobile-transactions-list">
          ${filtered.length === 0 ? `
            <div class="card empty-state">
              <div class="empty-state-icon">${Utils.icons.transactions}</div>
              <h4 class="empty-state-title">Nenhuma transação</h4>
              <p class="empty-state-text">Tente alterar os filtros ou cadastre uma nova movimentação.</p>
            </div>
          ` : filtered.map(t => {
            const cat = catMap.get(t.categoryId) || { name: 'Outros', icon: '🏷️', color: '#64748b' };
            const isIncome = t.type === 'income';
            return `
              <div class="mobile-transaction-card" data-id="${t.id}">
                <div class="mobile-card-header">
                  <span class="badge ${isIncome ? 'badge-income' : 'badge-expense'}">
                    ${isIncome ? 'Receita' : 'Despesa'}
                  </span>
                  <span class="text-secondary" style="font-size: var(--font-size-xs);">
                    ${Utils.formatDate(t.date)}
                  </span>
                </div>
                <div class="mobile-card-body">
                  <div>
                    <div class="font-bold text-primary">${Utils.escapeHtml(t.description)}</div>
                    <div class="text-secondary" style="font-size: var(--font-size-xs); margin-top: 2px;">
                      ${cat.icon} ${Utils.escapeHtml(cat.name)}
                    </div>
                  </div>
                  <div class="${isIncome ? 'table-amount-income' : 'table-amount-expense'} font-bold ${privacyClass}">
                    ${isIncome ? '+' : '-'} ${Utils.formatCurrency(t.amount)}
                  </div>
                </div>
                ${t.notes ? `
                  <div style="font-size: var(--font-size-xs); color: var(--text-muted); background: var(--bg-surface-secondary); padding: 6px 10px; border-radius: var(--radius-sm);">
                    💬 ${Utils.escapeHtml(t.notes)}
                  </div>
                ` : ''}
                <div class="mobile-card-actions">
                  <button type="button" class="btn btn-outline btn-sm action-btn-mobile-edit" data-id="${t.id}">
                    ${Utils.icons.edit} Editar
                  </button>
                  <button type="button" class="btn btn-danger-outline btn-sm action-btn-mobile-delete" data-id="${t.id}">
                    ${Utils.icons.trash} Excluir
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      const searchInput = this.container.querySelector('#tx-search-input');
      const typeSelect = this.container.querySelector('#filter-select-type');
      const catSelect = this.container.querySelector('#filter-select-category');
      const periodSelect = this.container.querySelector('#filter-select-period');
      const resetBtn = this.container.querySelector('#btn-reset-filters');

      let searchTimeout = null;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => State.setTransactionsFilter({ search: e.target.value }), 200);
      });

      typeSelect.addEventListener('change', (e) => State.setTransactionsFilter({ type: e.target.value }));
      catSelect.addEventListener('change', (e) => State.setTransactionsFilter({ categoryId: e.target.value }));
      periodSelect.addEventListener('change', (e) => State.setTransactionsFilter({ period: e.target.value }));

      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          State.setTransactionsFilter({ search: '', type: 'all', categoryId: 'all', period: 'all' });
        });
      }

      const handleAdd = () => {
        Modal.openTransactionModal(null, (newTx) => {
          Storage.saveTransaction(newTx);
          Toast.success('Cadastrado!', 'Transação adicionada com sucesso.');
          State.notify('transaction_saved', newTx);
        });
      };

      const addTxBtn = this.container.querySelector('#btn-add-transaction');
      const emptyAddBtn = this.container.querySelector('#btn-empty-add-tx');
      if (addTxBtn) addTxBtn.addEventListener('click', handleAdd);
      if (emptyAddBtn) emptyAddBtn.addEventListener('click', handleAdd);

      const handleEdit = (id) => {
        const tx = Storage.getTransactionById(id);
        if (tx) {
          Modal.openTransactionModal(tx, (updatedTx) => {
            Storage.updateTransaction(updatedTx);
            Toast.success('Atualizado!', 'Transação alterada com sucesso.');
            State.notify('transaction_saved', updatedTx);
          });
        }
      };

      const handleDelete = (id) => {
        const tx = Storage.getTransactionById(id);
        if (tx) {
          Modal.openConfirmModal({
            title: 'Excluir Movimentação',
            message: `Tem certeza que deseja excluir <strong>"${Utils.escapeHtml(tx.description)}"</strong> no valor de <strong>${Utils.formatCurrency(tx.amount)}</strong>?`,
            confirmText: 'Sim, Excluir',
            isDanger: true,
            onConfirm: () => {
              Storage.deleteTransaction(id);
              Toast.success('Excluído!', 'Transação removida com sucesso.');
              State.notify('transaction_deleted', id);
            }
          });
        }
      };

      this.container.querySelectorAll('.edit-btn, .action-btn-mobile-edit').forEach(btn => {
        btn.addEventListener('click', () => handleEdit(btn.getAttribute('data-id')));
      });

      this.container.querySelectorAll('.delete-btn, .action-btn-mobile-delete').forEach(btn => {
        btn.addEventListener('click', () => handleDelete(btn.getAttribute('data-id')));
      });
    }
  };

  // VIEW 3: RELATÓRIOS
  const ReportsView = {
    container: null,
    investmentClassFilter: 'all', // all, variable, crypto, fixed

    init(containerElement) {
      this.container = containerElement;
      this.render();

      State.subscribe((event) => {
        if (['transaction_saved', 'transaction_deleted', 'category_saved', 'category_deleted', 'reports_filter_changed', 'balance_visibility_changed', 'theme_changed', 'investments_updated'].includes(event)) {
          if (State.currentView === 'reports') this.render();
        }
      });

      window.addEventListener('resize', () => {
        if (State.currentView === 'reports') this.renderCharts();
      });
    },

    renderInvestmentsReportSection(privacyClass) {
      const investments = Storage.getActiveInvestments();
      const clsFilter = this.investmentClassFilter || 'all';
      const variableList = investments.filter(i => i.type === 'stock' || i.type === 'fii');
      const cryptoList = investments.filter(i => i.type === 'crypto');
      const fixedList = investments.filter(i => i.type === 'fixed');

      const showVariable = clsFilter === 'all' || clsFilter === 'variable';
      const showCrypto = clsFilter === 'all' || clsFilter === 'crypto';
      const showFixed = clsFilter === 'all' || clsFilter === 'fixed';

      const renderVarCryptoGroup = (items, title, codeHeader) => {
        if (items.length === 0) return '';
        return `
          <div style="margin-top: var(--spacing-4);">
            <h4 style="margin: 0 0 var(--spacing-2) 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${title} (${items.length})</h4>
            <div class="inv-table-wrap">
              <table class="inv-table">
                <thead>
                  <tr>
                    <th>Nome do Ativo</th>
                    <th>${codeHeader}</th>
                    <th>Classe</th>
                    <th>Quantidade</th>
                    <th>Preço Médio de Compra</th>
                    <th>Cotação Atual Automática</th>
                    <th>Valor Total Investido</th>
                    <th>Posição Atual</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map(inv => {
                    const qty = Number(inv.quantity) || 0;
                    const avg = Number(inv.averagePrice) || 0;
                    const totalInv = Storage.getCostBasis(inv) || (qty * avg);
                    const hasQ = Storage.hasMarketQuote(inv);
                    const curPrice = Storage.getMarketPrice(inv);
                    const posVal = hasQ ? qty * curPrice : null;
                    const typeName = inv.type === 'stock' ? 'Ação' : inv.type === 'fii' ? 'FII' : 'Criptomoeda';
                    return `
                      <tr>
                        <td><strong>${Utils.escapeHtml(inv.name)}</strong></td>
                        <td><span class="inv-badge-class ${inv.type}">${Utils.escapeHtml(inv.ticker)}</span></td>
                        <td>${typeName}</td>
                        <td>${qty}</td>
                        <td class="${privacyClass}">${Utils.formatCurrency(avg)}</td>
                        <td class="${privacyClass}">${hasQ ? Utils.formatCurrency(curPrice) : '<span class="text-muted">Indisponível</span>'}</td>
                        <td class="font-bold ${privacyClass}">${Utils.formatCurrency(totalInv)}</td>
                        <td class="font-bold text-primary ${privacyClass}">${posVal !== null ? Utils.formatCurrency(posVal) : '—'}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      };

      const renderFixedGroup = (items) => {
        if (items.length === 0) return '';
        return `
          <div style="margin-top: var(--spacing-4);">
            <h4 style="margin: 0 0 var(--spacing-2) 0; font-size: var(--font-size-sm); color: var(--text-secondary);">🏛️ Renda Fixa (${items.length})</h4>
            <div class="inv-table-wrap">
              <table class="inv-table">
                <thead>
                  <tr>
                    <th>Nome do Investimento</th>
                    <th>Instituição Financeira</th>
                    <th>Valor Aplicado</th>
                    <th>Tipo de Rentabilidade</th>
                    <th>Taxa Contratada</th>
                    <th>Data da Aplicação</th>
                    <th>Data de Vencimento</th>
                    <th>Rentabilidade Acumulada</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map(inv => {
                    const applied = Storage.getAppliedAmount(inv);
                    const accYield = Storage.getAccumulatedYield(inv);
                    return `
                      <tr>
                        <td><strong>${Utils.escapeHtml(inv.name)}</strong></td>
                        <td>${Utils.escapeHtml(inv.institution || '—')}</td>
                        <td class="font-bold text-primary ${privacyClass}">${Utils.formatCurrency(applied)}</td>
                        <td><span class="inv-badge-class fixed">${Utils.escapeHtml(Storage.getYieldTypeLabel(inv.yieldType))}</span></td>
                        <td>${Utils.escapeHtml(inv.rateText || '—')}</td>
                        <td>${inv.applicationDate || inv.purchaseDate ? Utils.formatDate(inv.applicationDate || inv.purchaseDate) : '—'}</td>
                        <td>${inv.maturityDate ? Utils.formatDate(inv.maturityDate) : 'Sem vencimento'}</td>
                        <td class="${accYield !== null ? 'text-success font-bold' : 'text-muted'} ${privacyClass}">
                          ${accYield !== null ? '+ ' + Utils.formatCurrency(accYield) : 'Não informada'}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      };

      return `
        <div class="card" style="margin-top: var(--spacing-5);">
          <div class="card-header" style="flex-wrap: wrap; gap: var(--spacing-3);">
            <div>
              <h3 class="card-title">Relatório da Carteira de Investimentos por Classe</h3>
              <span style="font-size: var(--font-size-xs); color: var(--text-muted);">
                Campos detalhados dinamicamente conforme a classe do investimento (Ações e FIIs, Criptomoedas e Renda Fixa)
              </span>
            </div>
            <div class="inv-class-pills" style="margin-bottom: 0;">
              <button type="button" class="inv-class-pill btn-report-inv-filter ${clsFilter === 'all' ? 'active' : ''}" data-cls="all">Todas as Classes (${investments.length})</button>
              <button type="button" class="inv-class-pill btn-report-inv-filter ${clsFilter === 'variable' ? 'active' : ''}" data-cls="variable">📈 Ações e FIIs (${variableList.length})</button>
              <button type="button" class="inv-class-pill btn-report-inv-filter ${clsFilter === 'crypto' ? 'active' : ''}" data-cls="crypto">🪙 Criptomoedas (${cryptoList.length})</button>
              <button type="button" class="inv-class-pill btn-report-inv-filter ${clsFilter === 'fixed' ? 'active' : ''}" data-cls="fixed">🏛️ Renda Fixa (${fixedList.length})</button>
            </div>
          </div>
          <div class="card-body">
            ${investments.length === 0 ? `
              <div class="empty-state">
                <p class="empty-state-text">Nenhum investimento cadastrado na carteira.</p>
              </div>
            ` : `
              ${showVariable ? renderVarCryptoGroup(variableList, '📈 Ações e Fundos Imobiliários (FIIs)', 'Código (Ticker)') : ''}
              ${showCrypto ? renderVarCryptoGroup(cryptoList, '🪙 Criptomoedas', 'Símbolo') : ''}
              ${showFixed ? renderFixedGroup(fixedList) : ''}
              ${((showVariable && variableList.length) || (showCrypto && cryptoList.length) || (showFixed && fixedList.length)) ? '' : '<p class="text-muted" style="text-align: center; padding: var(--spacing-4);">Nenhum ativo nesta classe selecionada.</p>'}
            `}
          </div>
        </div>
      `;
    },

    render() {
      if (!this.container) return;

      const allTransactions = Storage.getTransactions();
      const settings = Storage.getSettings();
      const privacyClass = settings.hideBalances ? 'privacy-blurred' : '';

      const { preset, startDate, endDate } = State.reportsFilter;

      const now = new Date();
      const curYear = now.getFullYear();
      const curMonth = now.getMonth();
      const pad = n => String(n).padStart(2, '0');

      let filterStart = null;
      let filterEnd = null;

      if (preset === 'current_month') {
        filterStart = `${curYear}-${pad(curMonth + 1)}-01`;
        const lastDay = new Date(curYear, curMonth + 1, 0).getDate();
        filterEnd = `${curYear}-${pad(curMonth + 1)}-${pad(lastDay)}`;
      } else if (preset === 'last_month') {
        const prevDate = new Date(curYear, curMonth - 1, 1);
        const pY = prevDate.getFullYear();
        const pM = prevDate.getMonth() + 1;
        const lastDay = new Date(pY, pM, 0).getDate();
        filterStart = `${pY}-${pad(pM)}-01`;
        filterEnd = `${pY}-${pad(pM)}-${pad(lastDay)}`;
      } else if (preset === '3months') {
        const startD = new Date(curYear, curMonth - 2, 1);
        filterStart = `${startD.getFullYear()}-${pad(startD.getMonth() + 1)}-01`;
        const lastDay = new Date(curYear, curMonth + 1, 0).getDate();
        filterEnd = `${curYear}-${pad(curMonth + 1)}-${pad(lastDay)}`;
      } else if (preset === '6months') {
        const startD = new Date(curYear, curMonth - 5, 1);
        filterStart = `${startD.getFullYear()}-${pad(startD.getMonth() + 1)}-01`;
        const lastDay = new Date(curYear, curMonth + 1, 0).getDate();
        filterEnd = `${curYear}-${pad(curMonth + 1)}-${pad(lastDay)}`;
      } else if (preset === 'this_year') {
        filterStart = `${curYear}-01-01`;
        filterEnd = `${curYear}-12-31`;
      } else if (preset === 'custom') {
        filterStart = startDate;
        filterEnd = endDate;
      }

      let filtered = [...allTransactions];
      if (filterStart) filtered = filtered.filter(t => t.date >= filterStart);
      if (filterEnd) filtered = filtered.filter(t => t.date <= filterEnd);

      const metrics = State.calculateMetrics(filtered);
      const expenses = filtered.filter(t => t.type === 'expense');
      let maxExpense = 0;
      let maxExpenseDesc = 'Nenhuma';
      expenses.forEach(t => {
        const val = Number(t.amount) || 0;
        if (val > maxExpense) {
          maxExpense = val;
          maxExpenseDesc = t.description;
        }
      });

      let daysCount = 30;
      if (filterStart && filterEnd) {
        const diffTime = Math.abs(new Date(filterEnd) - new Date(filterStart));
        daysCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }
      const dailyAverage = metrics.expense / daysCount;
      const categoryBreakdown = State.getCategoryBreakdown(filtered, 'expense');

      this.container.innerHTML = `
        <div class="dashboard-header-bar">
          <div>
            <h2>Relatórios e Análises</h2>
            <p>Visão aprofundada dos seus hábitos e fluxo de receitas e despesas.</p>
          </div>

          <div style="display: flex; gap: var(--spacing-2); align-items: center; flex-wrap: wrap;">
            <button type="button" class="btn btn-outline btn-sm" id="btn-export-report-csv" title="Exportar dados do relatório em formato CSV">
              ${Utils.icons.download} Exportar CSV
            </button>
            <button type="button" class="btn btn-primary btn-sm" id="btn-export-report-xlsx" title="Exportar planilha formatada em Excel (XLSX)">
              ${Utils.icons.download} Exportar Excel (XLSX)
            </button>
          </div>
        </div>

        <div class="reports-period-tabs">
          <button type="button" class="report-tab-btn ${preset === 'current_month' ? 'active' : ''}" data-preset="current_month">Este Mês</button>
          <button type="button" class="report-tab-btn ${preset === 'last_month' ? 'active' : ''}" data-preset="last_month">Mês Passado</button>
          <button type="button" class="report-tab-btn ${preset === '3months' ? 'active' : ''}" data-preset="3months">Últimos 3 Meses</button>
          <button type="button" class="report-tab-btn ${preset === '6months' ? 'active' : ''}" data-preset="6months">Últimos 6 Meses</button>
          <button type="button" class="report-tab-btn ${preset === 'this_year' ? 'active' : ''}" data-preset="this_year">Este Ano (${curYear})</button>
          <button type="button" class="report-tab-btn ${preset === 'all' ? 'active' : ''}" data-preset="all">Todo o Histórico</button>
          <button type="button" class="report-tab-btn ${preset === 'custom' ? 'active' : ''}" data-preset="custom">Personalizado</button>
        </div>

        <div class="reports-custom-dates-bar ${preset === 'custom' ? 'active' : ''}">
          <div style="display: flex; align-items: center; gap: var(--spacing-2);">
            <label style="font-size: var(--font-size-sm); font-weight: 500;" for="report-custom-start">De:</label>
            <input type="date" id="report-custom-start" value="${startDate || ''}" style="width: auto;">
          </div>
          <div style="display: flex; align-items: center; gap: var(--spacing-2);">
            <label style="font-size: var(--font-size-sm); font-weight: 500;" for="report-custom-end">Até:</label>
            <input type="date" id="report-custom-end" value="${endDate || ''}" style="width: auto;">
          </div>
          <button type="button" class="btn btn-primary btn-sm" id="btn-apply-custom-dates">Aplicar Intervalo</button>
        </div>

        <div class="reports-kpi-grid">
          <div class="report-kpi-card">
            <span class="report-kpi-title">Patrimônio Global Total</span>
            <span class="report-kpi-value text-primary ${privacyClass}">
              ${Utils.formatCurrency(metrics.totalWealth)}
            </span>
          </div>

          <div class="report-kpi-card">
            <span class="report-kpi-title">Patrimônio Investido</span>
            <span class="report-kpi-value text-primary ${privacyClass}">
              ${Utils.formatCurrency(metrics.investedWealth)}
            </span>
          </div>

          <div class="report-kpi-card">
            <span class="report-kpi-title">Total Recebido</span>
            <span class="report-kpi-value text-success ${privacyClass}">
              + ${Utils.formatCurrency(metrics.income)}
            </span>
          </div>

          <div class="report-kpi-card">
            <span class="report-kpi-title">Total Gasto</span>
            <span class="report-kpi-value text-danger ${privacyClass}">
              - ${Utils.formatCurrency(metrics.expense)}
            </span>
          </div>

          <div class="report-kpi-card">
            <span class="report-kpi-title">Saldo Disponível</span>
            <span class="report-kpi-value ${metrics.balance >= 0 ? 'text-success' : 'text-danger'} ${privacyClass}">
              ${Utils.formatCurrency(metrics.balance)}
            </span>
          </div>

          <div class="report-kpi-card">
            <span class="report-kpi-title">Taxa de Poupança</span>
            <span class="report-kpi-value text-primary">
              ${metrics.savingsRate}%
            </span>
          </div>

          <div class="report-kpi-card">
            <span class="report-kpi-title">Média Diária de Gastos</span>
            <span class="report-kpi-value ${privacyClass}">
              ${Utils.formatCurrency(dailyAverage)}
            </span>
          </div>

          <div class="report-kpi-card">
            <span class="report-kpi-title">Maior Despesa</span>
            <span class="report-kpi-value text-danger ${privacyClass}" style="font-size: 1.1rem;">
              ${Utils.formatCurrency(maxExpense)}
            </span>
            <span style="font-size: 0.72rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${Utils.escapeHtml(maxExpenseDesc)}
            </span>
          </div>
        </div>

        <div class="reports-grid-2col">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Comparação Mensal: Receitas vs Despesas</h3>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <canvas id="chart-reports-bars"></canvas>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Distribuição de Despesas</h3>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <canvas id="chart-reports-donut"></canvas>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Ranking de Gastos por Categoria</h3>
            <span style="font-size: var(--font-size-xs); color: var(--text-muted);">
              Ordenado do maior para o menor desembolso
            </span>
          </div>
          <div class="card-body">
            ${categoryBreakdown.items.length === 0 ? `
              <div class="empty-state">
                <p class="empty-state-text">Nenhuma despesa para classificar no período selecionado.</p>
              </div>
            ` : `
              <div class="category-ranking-list">
                ${categoryBreakdown.items.map(item => `
                  <div class="category-ranking-item">
                    <div class="ranking-item-header">
                      <span class="ranking-item-name">
                        <span style="font-size: 1.1rem;">${item.icon}</span>
                        <span>${Utils.escapeHtml(item.name)}</span>
                        <span class="badge badge-category" style="margin-left: 6px;">${item.percentage}%</span>
                      </span>
                      <span class="ranking-item-amount ${privacyClass}">
                        ${Utils.formatCurrency(item.amount)}
                      </span>
                    </div>
                    <div class="ranking-bar-track">
                      <div class="ranking-bar-fill" style="width: ${item.percentage}%; background-color: ${item.color};"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>

        ${this.renderInvestmentsReportSection(privacyClass)}
      `;

      this.container.querySelectorAll('.btn-report-inv-filter').forEach(btn => {
        btn.addEventListener('click', () => {
          this.investmentClassFilter = btn.getAttribute('data-cls') || 'all';
          this.render();
        });
      });

      this.container.querySelectorAll('.report-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const selectedPreset = btn.getAttribute('data-preset');
          if (selectedPreset === 'custom') {
            State.setReportsFilter('custom', startDate || Utils.getTodayString(), endDate || Utils.getTodayString());
          } else {
            State.setReportsFilter(selectedPreset);
          }
        });
      });

      const applyCustomBtn = this.container.querySelector('#btn-apply-custom-dates');
      if (applyCustomBtn) {
        applyCustomBtn.addEventListener('click', () => {
          const sVal = this.container.querySelector('#report-custom-start').value;
          const eVal = this.container.querySelector('#report-custom-end').value;
          State.setReportsFilter('custom', sVal, eVal);
        });
      }

      const getPeriodLabel = () => {
        if (preset === 'current_month') {
          const now = new Date();
          return `${Utils.getMonthName(now.getMonth())} de ${now.getFullYear()}`;
        }
        if (preset === 'last_month') {
          const prev = new Date(curYear, new Date().getMonth() - 1, 1);
          return `${Utils.getMonthName(prev.getMonth())} de ${prev.getFullYear()}`;
        }
        if (preset === '3months') return 'Últimos 3 Meses';
        if (preset === '6months') return 'Últimos 6 Meses';
        if (preset === 'this_year') return `Ano de ${curYear}`;
        if (preset === 'custom' && filterStart && filterEnd) {
          return `${Utils.formatDate(filterStart)} até ${Utils.formatDate(filterEnd)}`;
        }
        return 'Todo o Histórico';
      };

      const exportCsvBtn = this.container.querySelector('#btn-export-report-csv');
      if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', () => {
          Storage.exportToCsv(filtered, getPeriodLabel());
        });
      }

      const exportXlsxBtn = this.container.querySelector('#btn-export-report-xlsx');
      if (exportXlsxBtn) {
        exportXlsxBtn.addEventListener('click', () => {
          Storage.exportToXlsx(filtered, getPeriodLabel());
        });
      }

      this.renderCharts(allTransactions, filtered, curYear);
    },

    renderCharts(allTransactions = null, filtered = null, curYear = null) {
      if (!allTransactions) allTransactions = Storage.getTransactions();
      if (!curYear) curYear = new Date().getFullYear();

      const barCanvas = document.getElementById('chart-reports-bars');
      if (barCanvas) {
        Charts.renderBarChart(barCanvas, State.getMonthlyEvolution(allTransactions, curYear));
      }

      const donutCanvas = document.getElementById('chart-reports-donut');
      if (donutCanvas) {
        if (!filtered) filtered = allTransactions;
        const breakdown = State.getCategoryBreakdown(filtered, 'expense');
        Charts.renderDonutChart(donutCanvas, breakdown.items, breakdown.totalSum);
      }
    }
  };

  // VIEW 4: CATEGORIAS
  const CategoriesView = {
    container: null,
    activeFilter: 'all',

    init(containerElement) {
      this.container = containerElement;
      this.render();

      State.subscribe((event) => {
        if (['category_saved', 'category_deleted', 'transaction_saved', 'transaction_deleted', 'balance_visibility_changed'].includes(event)) {
          if (State.currentView === 'categories') this.render();
        }
      });
    },

    render() {
      if (!this.container) return;

      const allCategories = Storage.getCategories();
      const transactions = Storage.getTransactions();
      const settings = Storage.getSettings();
      const privacyClass = settings.hideBalances ? 'privacy-blurred' : '';

      let filteredCategories = [...allCategories];
      if (this.activeFilter === 'expense') {
        filteredCategories = filteredCategories.filter(c => c.type === 'expense');
      } else if (this.activeFilter === 'income') {
        filteredCategories = filteredCategories.filter(c => c.type === 'income');
      }

      const categoryStats = new Map();
      transactions.forEach(t => {
        const cur = categoryStats.get(t.categoryId) || { count: 0, total: 0 };
        categoryStats.set(t.categoryId, {
          count: cur.count + 1,
          total: cur.total + (Number(t.amount) || 0)
        });
      });

      this.container.innerHTML = `
        <div class="categories-topbar">
          <div>
            <h2>Categorias Financeiras</h2>
            <p>Organize suas receitas e despesas por áreas de interesse.</p>
          </div>

          <div style="display: flex; align-items: center; gap: var(--spacing-3);">
            <div class="category-type-tabs">
              <button type="button" class="cat-tab-btn ${this.activeFilter === 'all' ? 'active' : ''}" data-type="all">Todas</button>
              <button type="button" class="cat-tab-btn ${this.activeFilter === 'expense' ? 'active' : ''}" data-type="expense">Despesas</button>
              <button type="button" class="cat-tab-btn ${this.activeFilter === 'income' ? 'active' : ''}" data-type="income">Receitas</button>
            </div>

            <button type="button" class="btn btn-primary" id="btn-add-category">
              ${Utils.icons.plus} Nova Categoria
            </button>
          </div>
        </div>

        <div class="categories-grid">
          ${filteredCategories.map(cat => {
            const stats = categoryStats.get(cat.id) || { count: 0, total: 0 };
            const isIncome = cat.type === 'income';

            return `
              <div class="category-card" data-id="${cat.id}">
                <div class="category-card-top">
                  <div class="category-card-info">
                    <div class="category-card-icon" style="background-color: ${cat.color}20; color: ${cat.color};">
                      ${cat.icon}
                    </div>
                    <div>
                      <h4 class="category-card-name">${Utils.escapeHtml(cat.name)}</h4>
                      <span class="badge ${isIncome ? 'badge-income' : 'badge-expense'}" style="margin-top: 4px;">
                        ${isIncome ? 'Receita' : 'Despesa'}
                      </span>
                    </div>
                  </div>

                  <div class="table-actions">
                    <button type="button" class="action-btn edit-btn btn-edit-category" data-id="${cat.id}" title="Editar Categoria">
                      ${Utils.icons.edit}
                    </button>
                    <button type="button" class="action-btn delete-btn btn-delete-category" data-id="${cat.id}" title="Excluir Categoria">
                      ${Utils.icons.trash}
                    </button>
                  </div>
                </div>

                <div class="category-card-bottom">
                  <div class="category-card-stats">
                    <span>Movimentações</span>
                    <strong>${stats.count} ${stats.count === 1 ? 'registro' : 'registros'}</strong>
                  </div>
                  <div class="category-card-stats" style="text-align: right;">
                    <span>Total Acumulado</span>
                    <strong class="${isIncome ? 'text-success' : 'text-danger'} ${privacyClass}">
                      ${isIncome ? '+' : '-'} ${Utils.formatCurrency(stats.total)}
                    </strong>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      this.container.querySelectorAll('.cat-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.activeFilter = btn.getAttribute('data-type');
          this.render();
        });
      });

      const addBtn = this.container.querySelector('#btn-add-category');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          Modal.openCategoryModal(null, (newCat) => {
            Storage.saveCategory(newCat);
            Toast.success('Criada!', 'Categoria adicionada com sucesso.');
            State.notify('category_saved', newCat);
          });
        });
      }

      this.container.querySelectorAll('.btn-edit-category').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const cat = Storage.getCategoryById(btn.getAttribute('data-id'));
          if (cat) {
            Modal.openCategoryModal(cat, (updatedCat) => {
              Storage.updateCategory(updatedCat);
              Toast.success('Atualizada!', 'Categoria alterada com sucesso.');
              State.notify('category_saved', updatedCat);
            });
          }
        });
      });

      this.container.querySelectorAll('.btn-delete-category').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const cat = Storage.getCategoryById(id);
          if (!cat) return;

          const count = Storage.countTransactionsByCategory(id);
          if (count > 0) {
            const otherCats = Storage.getCategories().filter(c => c.id !== id && c.type === cat.type);
            if (otherCats.length === 0) {
              Toast.warning('Aviso', 'Crie outra categoria do mesmo tipo antes de excluir esta.');
              return;
            }
            Modal.openReclassifyCategoryModal(cat, count, otherCats, (targetId) => {
              Storage.deleteCategory(id, targetId);
              Toast.success('Excluída!', `Categoria excluída e ${count} transações foram reclassificadas.`);
              State.notify('category_deleted', id);
            });
          } else {
            Modal.openConfirmModal({
              title: 'Excluir Categoria',
              message: `Tem certeza que deseja excluir a categoria <strong>"${Utils.escapeHtml(cat.name)}"</strong>?`,
              confirmText: 'Excluir Categoria',
              isDanger: true,
              onConfirm: () => {
                Storage.deleteCategory(id);
                Toast.success('Excluída!', 'Categoria removida com sucesso.');
                State.notify('category_deleted', id);
              }
            });
          }
        });
      });
    }
  };

  // VIEW 5: CONFIGURAÇÕES
  const SettingsView = {
    container: null,

    init(containerElement) {
      this.container = containerElement;
      this.render();

      State.subscribe((event) => {
        if (['theme_changed', 'balance_visibility_changed'].includes(event)) {
          if (State.currentView === 'settings') this.render();
        }
      });
    },

    render() {
      if (!this.container) return;

      const settings = Storage.getSettings();
      const transactions = Storage.getTransactions();
      const categories = Storage.getCategories();
      const currentTheme = document.documentElement.getAttribute('data-theme') || settings.theme || 'light';

      let storageBytes = 0;
      try {
        storageBytes = (
          (localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '').length +
          (localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '').length +
          (localStorage.getItem(STORAGE_KEYS.SETTINGS) || '').length +
          (localStorage.getItem(STORAGE_KEYS.INVESTMENTS) || '').length
        ) * 2;
      } catch (e) {}
      const storageKb = (storageBytes / 1024).toFixed(2);
      const authUser = (typeof AuthService !== 'undefined' && AuthService.currentUser) ? AuthService.currentUser : null;

      this.container.innerHTML = `
        <div class="dashboard-header-bar">
          <div>
            <h2>Configurações do Sistema</h2>
            <p>Personalize a sua experiência e gerencie a sua conta e os seus dados financeiros.</p>
          </div>
        </div>

        <div class="settings-container">
          <!-- Cartão de Conta do Usuário -->
          <div class="settings-section-card">
            <div class="settings-section-header">
              <div class="settings-section-icon" style="background-color: var(--color-income-bg); color: var(--color-income);">🔐</div>
              <div>
                <h3 class="settings-section-title">Minha Conta</h3>
                <p class="settings-section-desc">Gerencie seu acesso, sincronização em nuvem e segurança da conta.</p>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-4); margin-bottom: var(--spacing-4); padding: var(--spacing-3); background: var(--bg-surface-secondary); border-radius: var(--radius-md); border: 1px solid var(--border-color-subtle);">
              <div>
                <span class="text-muted" style="font-size: var(--font-size-xs); display: block;">Nome</span>
                <strong style="color: var(--text-primary); font-size: var(--font-size-sm);">${Utils.escapeHtml(settings.userName || (typeof AuthService !== 'undefined' ? AuthService.getUserDisplayName() : 'Usuário'))}</strong>
              </div>
              <div>
                <span class="text-muted" style="font-size: var(--font-size-xs); display: block;">E-mail da Conta</span>
                <strong style="color: var(--text-primary); font-size: var(--font-size-sm);">${Utils.escapeHtml(authUser ? authUser.email : '—')}</strong>
              </div>
              <div>
                <span class="text-muted" style="font-size: var(--font-size-xs); display: block;">Sincronização</span>
                <strong class="text-success" style="font-size: var(--font-size-xs);">🟢 Dados salvos na sua conta</strong>
              </div>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-2); align-items: center; justify-content: space-between;">
              <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-2);">
                <button type="button" class="btn btn-outline btn-sm" id="btn-settings-sync-cloud">
                  ${Utils.icons.refresh} Atualizar Dados da Nuvem
                </button>
                <button type="button" class="btn btn-outline btn-sm" id="btn-settings-change-password">
                  🔑 Alterar Senha
                </button>
              </div>
              <button type="button" class="btn btn-danger btn-sm" id="btn-settings-logout">
                Sair da Conta
              </button>
            </div>
          </div>

          <div class="settings-section-card">
            <div class="settings-section-header">
              <div class="settings-section-icon">${Utils.icons.sun}</div>
              <div>
                <h3 class="settings-section-title">Aparência da Interface</h3>
                <p class="settings-section-desc">Alterne entre os modos Claro e Escuro conforme sua preferência visual.</p>
              </div>
            </div>

            <div class="theme-selector-grid">
              <div class="theme-choice-card ${currentTheme === 'light' ? 'selected' : ''}" data-theme="light">
                <div class="theme-choice-preview light-preview">${Utils.icons.sun}</div>
                <div>
                  <strong style="color: var(--text-primary); font-size: var(--font-size-base);">Modo Claro</strong>
                  <p style="font-size: var(--font-size-xs); color: var(--text-muted);">Visual limpo com fundo suave e alto contraste.</p>
                </div>
              </div>

              <div class="theme-choice-card ${currentTheme === 'dark' ? 'selected' : ''}" data-theme="dark">
                <div class="theme-choice-preview dark-preview">${Utils.icons.moon}</div>
                <div>
                  <strong style="color: var(--text-primary); font-size: var(--font-size-base);">Modo Escuro</strong>
                  <p style="font-size: var(--font-size-xs); color: var(--text-muted);">Descanso visual para ambientes com pouca luz.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="settings-section-card">
            <div class="settings-section-header">
              <div class="settings-section-icon">${Utils.icons.settings}</div>
              <div>
                <h3 class="settings-section-title">Preferências do Usuário</h3>
                <p class="settings-section-desc">Configure seu nome de exibição e opções de privacidade de valores.</p>
              </div>
            </div>

            <form id="form-user-prefs">
              <div class="form-group" style="max-width: 400px;">
                <label class="form-label" for="settings-username">Nome de Exibição</label>
                <input type="text" id="settings-username" value="${Utils.escapeHtml(settings.userName || '')}" placeholder="Seu nome ou apelido">
              </div>

              <div style="margin-top: var(--spacing-4);">
                <label style="display: flex; align-items: center; gap: var(--spacing-3); cursor: pointer;">
                  <input type="checkbox" id="settings-hide-balances" ${settings.hideBalances ? 'checked' : ''} style="width: auto; cursor: pointer;">
                  <div>
                    <div style="font-weight: 500; font-size: var(--font-size-sm); color: var(--text-primary);">Ocultar valores monetários por padrão</div>
                    <div style="font-size: var(--font-size-xs); color: var(--text-muted);">Aplica efeito de desfoque nos saldos para maior discrição em público.</div>
                  </div>
                </label>
              </div>

              <div style="margin-top: var(--spacing-5);">
                <button type="submit" class="btn btn-primary btn-sm">Salvar Preferências</button>
              </div>
            </form>
          </div>

          <div class="settings-section-card">
            <div class="settings-section-header">
              <div class="settings-section-icon">${Utils.icons.download}</div>
              <div>
                <h3 class="settings-section-title">Gerenciamento e Backup de Dados</h3>
                <p class="settings-section-desc">Exporte suas movimentações para planilha ou faça backup completo.</p>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: var(--spacing-4);">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--spacing-3); padding-bottom: var(--spacing-4); border-bottom: 1px solid var(--border-color-subtle);">
                <div>
                  <strong style="color: var(--text-primary); font-size: var(--font-size-sm);">Exportar Planilha (CSV)</strong>
                  <p style="font-size: var(--font-size-xs); color: var(--text-muted);">Compatível com Excel e Google Planilhas (formato brasileiro com separador ponto e vírgula).</p>
                </div>
                <div style="display: flex; gap: var(--spacing-2); flex-wrap: wrap;">
                  <button type="button" class="btn btn-outline btn-sm" id="btn-settings-export-csv" title="Baixar todas as movimentações em formato CSV">
                    ${Utils.icons.download} Baixar CSV
                  </button>
                  <button type="button" class="btn btn-outline btn-sm" id="btn-settings-export-xlsx" title="Baixar todas as movimentações em formato Excel (XLSX)">
                    ${Utils.icons.download} Baixar XLSX
                  </button>
                </div>
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--spacing-3); padding-bottom: var(--spacing-4); border-bottom: 1px solid var(--border-color-subtle);">
                <div>
                  <strong style="color: var(--text-primary); font-size: var(--font-size-sm);">Fazer Backup Completo (JSON)</strong>
                  <p style="font-size: var(--font-size-xs); color: var(--text-muted);">Gera um arquivo com todas as transações, categorias e configurações para segurança.</p>
                </div>
                <button type="button" class="btn btn-outline btn-sm" id="btn-settings-export-json">
                  ${Utils.icons.download} Salvar Backup
                </button>
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--spacing-3); padding-bottom: var(--spacing-4); border-bottom: 1px solid var(--border-color-subtle);">
                <div>
                  <strong style="color: var(--text-primary); font-size: var(--font-size-sm);">Restaurar Backup (JSON)</strong>
                  <p style="font-size: var(--font-size-xs); color: var(--text-muted);">Restaura dados a partir de um arquivo de backup previamente exportado.</p>
                </div>
                <label class="btn btn-outline btn-sm" style="margin: 0; cursor: pointer;">
                  ${Utils.icons.upload} Importar JSON
                  <input type="file" id="input-import-backup" accept=".json" style="display: none;">
                </label>
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--spacing-3);">
                <div>
                  <strong style="color: var(--text-primary); font-size: var(--font-size-sm);">Carregar Dados de Demonstração</strong>
                  <p style="font-size: var(--font-size-xs); color: var(--text-muted);">Preenche o aplicativo com transações de exemplo realistas para apresentação ou testes.</p>
                </div>
                <button type="button" class="btn btn-secondary btn-sm" id="btn-settings-load-demo">
                  ${Utils.icons.refresh} Carregar Demo
                </button>
              </div>
            </div>
          </div>

          <div class="settings-section-card danger-zone">
            <div class="settings-section-header">
              <div class="settings-section-icon">${Utils.icons.trash}</div>
              <div>
                <h3 class="settings-section-title" style="color: var(--color-expense);">Zona de Perigo</h3>
                <p class="settings-section-desc">Exclua todas as informações armazenadas localmente de forma definitiva.</p>
              </div>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--spacing-3);">
              <div>
                <strong style="color: var(--color-expense); font-size: var(--font-size-sm);">Limpar Todos os Dados</strong>
                <p style="font-size: var(--font-size-xs); color: var(--text-muted);">Esta ação removerá todas as transações e restaurará as categorias padrão.</p>
              </div>
              <button type="button" class="btn btn-danger btn-sm" id="btn-settings-clear-all">
                ${Utils.icons.trash} Limpar Todos os Dados
              </button>
            </div>
          </div>

          <div class="settings-section-card">
            <div class="settings-section-header">
              <div class="settings-section-icon" style="background-color: var(--bg-surface-secondary); color: var(--text-secondary);">ℹ️</div>
              <div>
                <h3 class="settings-section-title">Sobre o Meu Controle</h3>
                <p class="settings-section-desc">Trabalho de Conclusão de Curso (TCC) – Finanças Pessoais.</p>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-4); font-size: var(--font-size-sm);">
              <div>
                <span class="text-muted" style="font-size: var(--font-size-xs); display: block;">Projeto</span>
                <strong class="text-primary">Meu Controle – Finanças Pessoais</strong>
              </div>
              <div>
                <span class="text-muted" style="font-size: var(--font-size-xs); display: block;">Versão do Sistema</span>
                <strong class="text-primary">v2.0.0 (Moderna & Modular)</strong>
              </div>
              <div>
                <span class="text-muted" style="font-size: var(--font-size-xs); display: block;">Armazenamento Local</span>
                <strong class="text-primary">${storageKb} KB em uso (LocalStorage)</strong>
              </div>
              <div>
                <span class="text-muted" style="font-size: var(--font-size-xs); display: block;">Transações Cadastradas</span>
                <strong class="text-primary">${transactions.length} registros (${categories.length} categorias)</strong>
              </div>
            </div>

            <div style="margin-top: var(--spacing-4); padding-top: var(--spacing-4); border-top: 1px solid var(--border-color-subtle); font-size: var(--font-size-xs); color: var(--text-muted);">
              💡 <strong>Nota de Arquitetura:</strong> Este sistema opera em modo cliente com persistência em LocalStorage, garantindo funcionamento completo sem depender de servidores externos. Sua arquitetura desacoplada em componentes, views e camada de dados está 100% preparada para futura integração com banco de dados PostgreSQL/MySQL e autenticação JWT/OAuth.
            </div>
          </div>
        </div>
      `;

      this.container.querySelectorAll('.theme-choice-card').forEach(card => {
        card.addEventListener('click', () => {
          const selectedTheme = card.getAttribute('data-theme');
          document.documentElement.setAttribute('data-theme', selectedTheme);
          Storage.saveSettings({ theme: selectedTheme });
          Toast.success('Tema Atualizado', `Modo ${selectedTheme === 'dark' ? 'Escuro' : 'Claro'} ativado.`);
          State.notify('theme_changed', selectedTheme);
          this.render();
        });
      });

      const prefsForm = this.container.querySelector('#form-user-prefs');
      if (prefsForm) {
        prefsForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const username = this.container.querySelector('#settings-username').value.trim() || 'Usuário';
          const hideBal = this.container.querySelector('#settings-hide-balances').checked;
          Storage.saveSettings({ userName: username, hideBalances: hideBal });

          const userDisplay = document.querySelector('.user-name');
          if (userDisplay) userDisplay.textContent = username;

          Toast.success('Sucesso!', 'Preferências salvas com sucesso.');
          State.notify('balance_visibility_changed', hideBal);
        });
      }

      const exportCsvBtn = this.container.querySelector('#btn-settings-export-csv');
      if (exportCsvBtn) exportCsvBtn.addEventListener('click', () => Storage.exportToCsv());

      const exportXlsxBtn = this.container.querySelector('#btn-settings-export-xlsx');
      if (exportXlsxBtn) exportXlsxBtn.addEventListener('click', () => Storage.exportToXlsx());

      const exportJsonBtn = this.container.querySelector('#btn-settings-export-json');
      if (exportJsonBtn) exportJsonBtn.addEventListener('click', () => Storage.exportToJson());

      const importInput = this.container.querySelector('#input-import-backup');
      if (importInput) {
        importInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              Storage.importFromJson(event.target.result);
              Toast.success('Restaurado!', 'Backup importado com sucesso.');
              State.notify('transaction_saved');
              State.notify('category_saved');
              this.render();
            } catch (err) {
              Toast.error('Erro na Importação', err.message);
            }
          };
          reader.readAsText(file);
        });
      }

      const loadDemoBtn = this.container.querySelector('#btn-settings-load-demo');
      if (loadDemoBtn) {
        loadDemoBtn.addEventListener('click', () => {
          Modal.openConfirmModal({
            title: 'Carregar Dados de Demonstração',
            message: 'Isso substituirá suas informações atuais por uma massa de dados de exemplo realista para demonstração. Deseja continuar?',
            confirmText: 'Carregar Dados',
            onConfirm: () => {
              Storage.resetToDemo();
              Toast.success('Restaurado!', 'Dados de demonstração carregados com sucesso.');
              State.notify('transaction_saved');
              State.notify('category_saved');
              this.render();
            }
          });
        });
      }

      const clearAllBtn = this.container.querySelector('#btn-settings-clear-all');
      if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
          Modal.openConfirmModal({
            title: 'Limpar Todos os Dados?',
            message: 'ATENÇÃO: Todas as suas movimentações financeiras serão permanentemente apagadas da sua conta e do navegador. Esta operação NÃO poderá ser desfeita!',
            confirmText: 'Sim, Apagar Tudo',
            cancelText: 'Cancelar',
            isDanger: true,
            onConfirm: () => {
              Storage.clearAllData();
              Toast.success('Dados Limpos', 'Todas as informações foram apagadas com sucesso.');
              State.notify('transaction_deleted');
              State.notify('category_deleted');
              this.render();
            }
          });
        });
      }

      const syncCloudBtn = this.container.querySelector('#btn-settings-sync-cloud');
      if (syncCloudBtn && typeof SupabaseSyncService !== 'undefined') {
        syncCloudBtn.addEventListener('click', async () => {
          syncCloudBtn.disabled = true;
          syncCloudBtn.textContent = 'Sincronizando...';
          try {
            await SupabaseSyncService.pushAllLocalToCloud();
            await SupabaseSyncService.pullAllUserData(AuthService.currentUser);
            Toast.success('Sincronização Concluída!', 'Todos os dados foram sincronizados com o Supabase Database.');
            this.render();
          } catch (err) {
            Toast.error('Falha na Sincronização', err.message || 'Verifique a conexão e se o script schema.sql foi executado no Supabase.');
          } finally {
            syncCloudBtn.disabled = false;
            syncCloudBtn.innerHTML = `${Utils.icons.refresh} Sincronizar com Supabase Agora`;
          }
        });
      }

      const changePassBtn = this.container.querySelector('#btn-settings-change-password');
      if (changePassBtn && typeof AuthService !== 'undefined') {
        changePassBtn.addEventListener('click', () => {
          AuthService.openChangePasswordModal();
        });
      }

      const logoutBtn = this.container.querySelector('#btn-settings-logout');
      if (logoutBtn && typeof AuthService !== 'undefined') {
        logoutBtn.addEventListener('click', () => {
          AuthService.confirmAndSignOut();
        });
      }
    }
  };

  // =========================================================================
  // 7b. CAIXINHAS VIEW
  // =========================================================================
  const CaixinhasView = {
    container: null,

    init(containerElement) {
      this.container = containerElement;
      this.render();
      State.subscribe((event) => {
        if (['caixinhas_updated', 'transaction_saved', 'transaction_deleted', 'balance_visibility_changed', 'theme_changed'].includes(event)) {
          if (State.currentView === 'caixinhas') this.render();
        }
      });
    },

    render() {
      if (!this.container) return;

      const caixinhas = Storage.getCaixinhas();
      const allTransactions = Storage.getTransactions();
      const settings = Storage.getSettings();
      const privacyClass = settings.hideBalances ? 'privacy-blurred' : '';

      const metrics = State.calculateMetrics(allTransactions);
      const availableBalance = metrics.balance;
      const totalGuardado = Storage.getTotalInCaixinhas();
      const totalCaixinhas = caixinhas.length;
      const metasAtingidas = caixinhas.filter(c => (Number(c.currentAmount) || 0) >= (Number(c.targetAmount) || 1)).length;
      const totalFaltaGuardar = caixinhas.reduce((sum, c) => {
        const diff = (Number(c.targetAmount) || 0) - (Number(c.currentAmount) || 0);
        return sum + Math.max(0, diff);
      }, 0);

      this.container.innerHTML = `
        <div class="dashboard-header-bar">
          <div>
            <h2>Caixinhas & Metas Financeiras</h2>
            <p>Separe seu dinheiro por objetivos específicos e acompanhe a evolução de cada conquista.</p>
          </div>
          <button type="button" class="btn btn-primary" id="btn-add-caixinha">
            ${Utils.icons.plus} Nova Caixinha
          </button>
        </div>

        <div class="dashboard-metrics-grid" style="margin-bottom: var(--spacing-6);">
          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-label">Total Guardado em Caixinhas</span>
              <div class="metric-icon-wrap savings">${Utils.icons.piggyBank}</div>
            </div>
            <div class="metric-value text-primary ${privacyClass}">${Utils.formatCurrency(totalGuardado)}</div>
            <div class="metric-subtext"><span>Dinheiro reservado para metas</span></div>
          </div>

          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-label">Caixinhas Criadas</span>
              <div class="metric-icon-wrap balance">${Utils.icons.target}</div>
            </div>
            <div class="metric-value text-primary">${totalCaixinhas} ${totalCaixinhas === 1 ? 'objetivo' : 'objetivos'}</div>
            <div class="metric-subtext"><span>Projetos em andamento</span></div>
          </div>

          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-label">Metas Atingidas (100%)</span>
              <div class="metric-icon-wrap income">${Utils.icons.check}</div>
            </div>
            <div class="metric-value text-success">${metasAtingidas} / ${totalCaixinhas}</div>
            <div class="metric-subtext"><span>${metasAtingidas > 0 ? 'Parabéns pelos objetivos alcançados!' : 'Continue guardando para atingir sua meta'}</span></div>
          </div>

          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-label">Falta para Atingir Metas</span>
              <div class="metric-icon-wrap expense">${Utils.icons.trendingUp}</div>
            </div>
            <div class="metric-value text-secondary ${privacyClass}">${Utils.formatCurrency(totalFaltaGuardar)}</div>
            <div class="metric-subtext"><span>Para concluir todos os objetivos</span></div>
          </div>
        </div>

        <div class="caixinha-integration-banner">
          <div style="display: flex; align-items: center; gap: var(--spacing-3);">
            <div style="font-size: 1.4rem;">💡</div>
            <div>
              <div style="font-weight: 600; font-size: var(--font-size-sm); color: var(--text-primary);">
                Saldo Disponível na Conta Principal: <strong class="${availableBalance < 0 ? 'text-danger' : 'text-success'} ${privacyClass}">${Utils.formatCurrency(availableBalance)}</strong>
              </div>
              <div style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 2px;">
                Ao guardar dinheiro em uma caixinha, o valor sai do saldo disponível e fica reservado para sua meta, sem ser contabilizado como despesa.
              </div>
            </div>
          </div>
          <div style="font-size: var(--font-size-xs); color: var(--text-secondary); text-align: right;">
            Patrimônio Total: <strong class="text-primary ${privacyClass}">${Utils.formatCurrency(metrics.balance + totalGuardado)}</strong>
          </div>
        </div>

        ${caixinhas.length === 0 ? `
          <div class="card empty-state" style="margin-top: var(--spacing-6);">
            <div class="empty-state-icon">${Utils.icons.piggyBank}</div>
            <h4 class="empty-state-title">Nenhuma caixinha criada ainda</h4>
            <p class="empty-state-text">Crie sua primeira caixinha para separar dinheiro para viagens, reservas de emergência, compras ou estudos.</p>
            <button type="button" class="btn btn-primary btn-sm" id="btn-empty-add-caixinha">
              ${Utils.icons.plus} Criar Minha Primeira Caixinha
            </button>
          </div>
        ` : `
          <div class="caixinhas-grid">
            ${caixinhas.map(c => {
              const current = Number(c.currentAmount) || 0;
              const target = Number(c.targetAmount) || 1;
              const pct = Math.min(100, Math.round((current / target) * 100));
              const isCompleted = current >= target;
              const remaining = Math.max(0, target - current);
              return `
                <div class="caixinha-card" data-id="${c.id}" style="border-top: 4px solid ${c.color};">
                  <div class="caixinha-card-header">
                    <div class="caixinha-card-title-wrap">
                      <div class="caixinha-icon-bubble" style="background-color: ${c.color}20; color: ${c.color};">${c.icon}</div>
                      <div>
                        <h3 class="caixinha-name">${Utils.escapeHtml(c.name)}</h3>
                        ${c.description ? `<div class="caixinha-desc">${Utils.escapeHtml(c.description)}</div>` : ''}
                      </div>
                    </div>
                    <div class="table-actions">
                      <button type="button" class="action-btn edit-btn btn-edit-caixinha" data-id="${c.id}" title="Editar Caixinha">${Utils.icons.edit}</button>
                      <button type="button" class="action-btn delete-btn btn-delete-caixinha" data-id="${c.id}" title="Excluir Caixinha">${Utils.icons.trash}</button>
                    </div>
                  </div>

                  <div class="caixinha-values-row">
                    <div>
                      <span class="caixinha-val-label">Guardado</span>
                      <div class="caixinha-val-amount ${privacyClass}" style="color: ${c.color};">${Utils.formatCurrency(current)}</div>
                    </div>
                    <div style="text-align: right;">
                      <span class="caixinha-val-label">Meta</span>
                      <div class="caixinha-val-target ${privacyClass}">${Utils.formatCurrency(target)}</div>
                    </div>
                  </div>

                  <div class="caixinha-progress-wrap">
                    <div class="caixinha-progress-meta">
                      <span class="caixinha-pct-badge" style="background-color: ${c.color}15; color: ${c.color}; font-weight: 700;">
                        ${pct}% ${isCompleted ? '✓ Atingida!' : ''}
                      </span>
                      <span class="caixinha-remaining-text">
                        ${isCompleted ? '🎉 Meta conquistada!' : `Faltam ${Utils.formatCurrency(remaining)}`}
                      </span>
                    </div>
                    <div class="caixinha-progress-track">
                      <div class="caixinha-progress-fill" style="width: ${pct}%; background: linear-gradient(90deg, ${c.color}, ${c.color}cc);"></div>
                    </div>
                  </div>

                  <div class="caixinha-deadline-badge">
                    <span>📅 Prazo:</span>
                    <strong>${c.deadline ? Utils.formatDate(c.deadline) : 'Sem data limite'}</strong>
                  </div>

                  <div class="caixinha-actions-footer">
                    <button type="button" class="btn btn-sm btn-primary btn-deposit-caixinha" data-id="${c.id}">
                      ${Utils.icons.plus} Guardar
                    </button>
                    <button type="button" class="btn btn-sm btn-outline btn-withdraw-caixinha" data-id="${c.id}" ${current <= 0 ? 'disabled' : ''}>
                      ${Utils.icons.trendingDown} Retirar
                    </button>
                    <button type="button" class="btn btn-sm btn-secondary btn-history-caixinha" data-id="${c.id}">
                      Histórico
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      `;

      const handleAddCaixinha = () => {
        const curMetrics = State.calculateMetrics(Storage.getTransactions());
        const curAvail = curMetrics.balance;
        Modal.openCaixinhaModal(null, (newCax) => {
          if (newCax.initialAmount > 0 && newCax.initialAmount > curAvail) {
            Toast.error('Saldo Insuficiente', `Você não possui ${Utils.formatCurrency(newCax.initialAmount)} disponível para o depósito inicial.`);
            return;
          }
          Storage.saveCaixinha(newCax);
          Toast.success('Caixinha Criada!', `A caixinha "${newCax.name}" foi criada com sucesso.`);
          State.notify('caixinhas_updated');
        });
      };

      const addBtn = this.container.querySelector('#btn-add-caixinha');
      const emptyAddBtn = this.container.querySelector('#btn-empty-add-caixinha');
      if (addBtn) addBtn.addEventListener('click', handleAddCaixinha);
      if (emptyAddBtn) emptyAddBtn.addEventListener('click', handleAddCaixinha);

      this.container.querySelectorAll('.btn-edit-caixinha').forEach(btn => {
        btn.addEventListener('click', () => {
          const cax = Storage.getCaixinhaById(btn.getAttribute('data-id'));
          if (cax) {
            Modal.openCaixinhaModal(cax, (updatedCax) => {
              Storage.updateCaixinha(updatedCax);
              Toast.success('Caixinha Atualizada!', `Dados da caixinha "${updatedCax.name}" alterados.`);
              State.notify('caixinhas_updated');
            });
          }
        });
      });

      this.container.querySelectorAll('.btn-delete-caixinha').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const cax = Storage.getCaixinhaById(id);
          if (!cax) return;
          const currentVal = Number(cax.currentAmount) || 0;

          if (currentVal > 0) {
            Modal.openConfirmModal({
              title: 'Excluir Caixinha com Dinheiro?',
              message: `Esta caixinha possui <strong>${Utils.formatCurrency(currentVal)}</strong> guardados.<br><br>Ao excluí-la, esse valor retornará automaticamente ao seu <strong>saldo disponível</strong> na conta principal.<br><br>Deseja confirmar a exclusão?`,
              confirmText: 'Sim, Devolver e Excluir',
              isDanger: true,
              onConfirm: () => {
                Storage.deleteCaixinha(id);
                Toast.success('Caixinha Excluída', `O valor de ${Utils.formatCurrency(currentVal)} foi devolvido ao saldo disponível.`);
                State.notify('caixinhas_updated');
              }
            });
          } else {
            Modal.openConfirmModal({
              title: 'Excluir Caixinha',
              message: `Tem certeza que deseja excluir a caixinha <strong>"${Utils.escapeHtml(cax.name)}"</strong>?`,
              confirmText: 'Excluir',
              isDanger: true,
              onConfirm: () => {
                Storage.deleteCaixinha(id);
                Toast.success('Excluída', 'Caixinha removida com sucesso.');
                State.notify('caixinhas_updated');
              }
            });
          }
        });
      });

      this.container.querySelectorAll('.btn-deposit-caixinha').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const cax = Storage.getCaixinhaById(id);
          if (!cax) return;
          const curMetrics = State.calculateMetrics(Storage.getTransactions());
          const curAvail = curMetrics.balance;
          if (curAvail <= 0) {
            Toast.error('Saldo Indisponível', 'Você não possui saldo disponível para guardar no momento.');
            return;
          }
          Modal.openDepositCaixinhaModal(cax, curAvail, (amount, date, description) => {
            try {
              Storage.addFundsToCaixinha(id, amount, date, description);
              Toast.success('Depósito Realizado!', `${Utils.formatCurrency(amount)} guardado na caixinha "${cax.name}".`);
              State.notify('caixinhas_updated');
              State.notify('transaction_saved');
            } catch (err) {
              Toast.error('Erro no Depósito', err.message);
            }
          });
        });
      });

      this.container.querySelectorAll('.btn-withdraw-caixinha').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const cax = Storage.getCaixinhaById(id);
          if (!cax) return;
          if ((Number(cax.currentAmount) || 0) <= 0) {
            Toast.warning('Caixinha Vazia', 'Não há dinheiro guardado nesta caixinha para resgatar.');
            return;
          }
          Modal.openWithdrawCaixinhaModal(cax, (amount, date, description) => {
            try {
              Storage.withdrawFundsFromCaixinha(id, amount, date, description);
              Toast.success('Resgate Realizado!', `${Utils.formatCurrency(amount)} devolvido ao saldo disponível.`);
              State.notify('caixinhas_updated');
              State.notify('transaction_saved');
            } catch (err) {
              Toast.error('Erro no Resgate', err.message);
            }
          });
        });
      });

      this.container.querySelectorAll('.btn-history-caixinha').forEach(btn => {
        btn.addEventListener('click', () => {
          const cax = Storage.getCaixinhaById(btn.getAttribute('data-id'));
          if (cax) Modal.openCaixinhaHistoryModal(cax);
        });
      });
    }
  };

// =========================================================================
// VIEW: INVESTMENTS VIEW (Interface Completa de Investimentos)
// =========================================================================
const InvestmentsView = {
  container: null,
  activeTab: 'dashboard', // dashboard, assets, trades, dividends, goals
  classFilter: 'all',     // all, crypto, fii, stock, fixed
  searchQuery: '',        // texto de filtro por nome, ticker, símbolo ou instituição
  chartPeriod: 'all',     // 7d, 30d, 6m, 1y, all

  init(containerElement) {
    this.container = containerElement || document.getElementById('view-investments');
    this.render();
    MarketApiService.startAutoRefresh();

    State.subscribe((event) => {
      if (['investments_updated', 'transaction_saved', 'transaction_deleted', 'balance_visibility_changed', 'theme_changed'].includes(event)) {
        if (State.currentView === 'investments') {
          this.render();
        }
      }
    });

    window.addEventListener('resize', () => {
      if (State.currentView === 'investments') {
        this.renderCharts();
      }
    });
  },

  formatQuoteTime(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(', ', ' às ');
  },

  reportQuoteResult(r) {
    if (!r || r.skipped) { Toast.info('Aguarde', 'Já existe uma atualização em andamento.'); return; }
    if (r.total === 0) { Toast.info('Nada a atualizar', 'Não há ativos de cripto, ações ou FIIs com cotação automática.'); return; }
    if (r.failed === 0) { Toast.success('Cotações atualizadas', `${r.ok} ativo(s) atualizado(s) com preço de mercado.`); return; }
    Toast.warning(`${r.failed} de ${r.total} sem atualização`, r.errors.slice(0, 2).join(' | ') + ' — as últimas cotações válidas foram mantidas e marcadas como desatualizadas.');
  },

  quoteInfoHtml(inv) {
    const st = MarketApiService.getQuoteStatus(inv);
    const palette = {
      ok: ['var(--color-income-bg)', 'var(--color-income-text)'],
      stale: ['rgba(245, 158, 11, 0.18)', 'var(--color-accent-amber)'],
      unavailable: ['var(--color-expense-bg)', 'var(--color-expense-text)'],
      updating: ['var(--bg-surface-secondary)', 'var(--text-secondary)'],
      manual: ['var(--bg-surface-secondary)', 'var(--text-muted)']
    }[st.status];
    const q = inv.quote;
    const meta = MarketApiService.hasQuote(inv)
      ? `${Utils.escapeHtml(q.source)} · ${this.formatQuoteTime(q.fetchedAt)}`
      : '';
    const tip = [st.detail, q && q.providerName ? `Nome na fonte: ${q.providerName}` : '', q && q.marketTime ? `Horário do preço na fonte: ${this.formatQuoteTime(q.marketTime)}` : '']
      .filter(Boolean).join(' | ');
    return `
      <div style="margin-top: 3px; display: flex; flex-direction: column; gap: 2px; align-items: flex-start;" title="${Utils.escapeHtml(tip)}">
        <span style="font-size: 0.68rem; font-weight: 600; padding: 1px 7px; border-radius: var(--radius-full); background: ${palette[0]}; color: ${palette[1]};">${st.label}</span>
        ${meta ? `<span style="font-size: 0.68rem; color: var(--text-muted);">${meta}</span>` : ''}
      </div>`;
  },

  cfgOpen: false,
  lastDiagnostic: null,
  diagnosticRunning: false,

  diagnosticHtml() {
    if (this.diagnosticRunning) return '<div style="font-size: var(--font-size-xs); margin-top: 6px;">Consultando as fontes…</div>';
    const d = this.lastDiagnostic;
    if (!d) return '';
    const rows = d.rows.map(r => `
      <tr>
        <td style="padding: 3px 8px;"><strong>${Utils.escapeHtml(r.ticker)}</strong></td>
        <td style="padding: 3px 8px;">${r.ok ? Utils.formatCurrency(r.price) : '—'}</td>
        <td style="padding: 3px 8px;">${r.ok ? Utils.escapeHtml(r.source) : '—'}</td>
        <td style="padding: 3px 8px;">${r.ok && r.marketTime ? this.formatQuoteTime(r.marketTime) : (r.ok ? 'não informado pela fonte' : '—')}</td>
        <td style="padding: 3px 8px;">${this.formatQuoteTime(r.checkedAt)}</td>
        <td style="padding: 3px 8px; color: ${r.ok ? 'var(--color-income-text)' : 'var(--color-expense-text)'};">${r.ok ? 'OK' : Utils.escapeHtml(r.error)}</td>
      </tr>`).join('');
    return `
      <div style="margin-top: 8px; overflow-x: auto;">
        <table style="font-size: 0.75rem; width: auto;">
          <thead><tr style="text-align: left; color: var(--text-muted);"><th style="padding: 3px 8px;">Ativo</th><th style="padding: 3px 8px;">Preço (BRL)</th><th style="padding: 3px 8px;">Fonte</th><th style="padding: 3px 8px;">Horário do preço na fonte</th><th style="padding: 3px 8px;">Consultado em</th><th style="padding: 3px 8px;">Resultado</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  },

  async runQuoteDiagnostic() {
    const targets = [
      ['MXRF11', 'fii'], ['HGLG11', 'fii'], ['KNRI11', 'fii'],
      ['PETR4', 'stock'], ['VALE3', 'stock'], ['ITUB4', 'stock'],
      ['BTC', 'crypto'], ['ETH', 'crypto']
    ];
    this.diagnosticRunning = true;
    this.cfgOpen = true;
    this.render();
    const rows = [];
    for (const [ticker, type] of targets) {
      const checkedAt = new Date().toISOString();
      try {
        const q = await MarketApiService.previewQuote(ticker, type);
        rows.push({ ticker, ok: true, price: q.price, source: q.source, marketTime: q.marketTime, checkedAt });
      } catch (e) {
        rows.push({ ticker, ok: false, error: MarketApiService._friendlyError(e), checkedAt });
      }
      await new Promise(r => setTimeout(r, 350));
    }
    this.lastDiagnostic = { rows };
    this.diagnosticRunning = false;
    this.render();
    const okCount = rows.filter(r => r.ok).length;
    if (okCount === rows.length) Toast.success('Validação concluída', `${okCount} cotações consultadas. Compare os valores com a fonte de sua preferência.`);
    else Toast.warning('Validação com falhas', `${rows.length - okCount} de ${rows.length} consultas falharam. Veja os motivos na tabela.`);
  },

  quoteSummaryHtml(investments) {
    const quotable = investments.filter(i => i.type !== 'fixed');
    const counts = { ok: 0, stale: 0, unavailable: 0, updating: 0 };
    quotable.forEach(i => { const s = MarketApiService.getQuoteStatus(i).status; if (counts[s] !== undefined) counts[s]++; });
    const times = quotable.filter(i => MarketApiService.hasQuote(i)).map(i => new Date(i.quote.fetchedAt).getTime()).filter(Number.isFinite);
    const last = times.length ? this.formatQuoteTime(new Date(Math.max(...times)).toISOString()) : 'nenhuma consulta bem-sucedida ainda';
    const healthy = quotable.length > 0 && counts.ok === quotable.length;
    const parts = [];
    if (MarketApiService.isUpdating) parts.push('atualização em andamento');
    parts.push(`${counts.ok} atualizada(s)`);
    if (counts.stale) parts.push(`${counts.stale} desatualizada(s)`);
    if (counts.unavailable) parts.push(`${counts.unavailable} indisponível(is)`);
    const s = Storage.getSettings();
    return `
      <span class="inv-api-status-dot ${healthy ? 'online' : 'offline'}"></span>
      <strong>Cotações de mercado:</strong>
      <span>${parts.join(' · ')}</span>
      <span style="color: var(--text-muted); margin-left: 8px;">(Última atualização: ${last}. Fontes: brapi.dev para B3, CoinGecko/Binance para cripto)</span>
      <details style="margin-top: 6px;" ${this.cfgOpen ? 'open' : ''}>
        <summary style="cursor: pointer; font-size: var(--font-size-xs); color: var(--text-secondary);">Configurar fonte de cotações da B3</summary>
        <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-2); margin-top: 6px; align-items: center;">
          <input type="password" id="cfg-brapi-token" placeholder="Token brapi.dev (gratuito)" value="${Utils.escapeHtml(s.brapiToken || '')}" style="width: 240px;" autocomplete="off">
          <input type="text" id="cfg-brapi-base" placeholder="(opcional) endereço do seu proxy https://..." value="${Utils.escapeHtml(s.brapiBaseUrl || '')}" style="width: 300px;">
          <button type="button" class="btn btn-primary btn-sm" id="btn-save-quote-config">Salvar e atualizar</button>
        </div>
        <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">O token fica apenas neste navegador. Em um site público, use um proxy (ex.: Cloudflare Worker) que guarde o token no servidor.</div>
        <div style="margin-top: 8px;">
          <button type="button" class="btn btn-outline btn-sm" id="btn-run-quote-diagnostic">Validar cotações reais (MXRF11, HGLG11, KNRI11, PETR4, VALE3, ITUB4, BTC, ETH)</button>
          <span style="font-size: 0.7rem; color: var(--text-muted); margin-left: 6px;">Consulta as fontes agora, sem alterar sua carteira. Compare com Google Finance, B3 ou seu app da corretora.</span>
        </div>
        ${this.diagnosticHtml()}
      </details>`;
  },

  render() {
    if (!this.container) this.container = document.getElementById('view-investments');
    if (!this.container) return;

    const allInvestments = Storage.getInvestments();
    const activeInvestments = Storage.getActiveInvestments();
    const investments = activeInvestments;
    const trades = Storage.getInvestmentTransactions();
    const dividends = Storage.getDividends();
    const goals = Storage.getInvestmentGoals();
    const snapshots = Storage.getPortfolioSnapshots();
    const settings = Storage.getSettings();
    const privacyClass = settings.hideBalances ? 'privacy-blurred' : '';

    const invMetrics = State.calculateInvestmentMetrics();
    const mainMetrics = State.calculateMetrics(Storage.getTransactions());

    // Filtrar apenas ativos ATIVOS conforme classFilter e searchQuery
    const qLower = (this.searchQuery || '').trim().toLowerCase();
    const filteredInvestments = activeInvestments.filter(i => {
      if (this.classFilter !== 'all' && i.type !== this.classFilter) return false;
      if (!qLower) return true;
      const hay = [
        i.name || '',
        i.type !== 'fixed' ? (i.ticker || '') : '',
        i.type === 'fixed' ? (i.institution || '') : '',
        i.type === 'fixed' ? (i.yieldType || '') : '',
        i.type === 'fixed' ? (i.rateText || '') : '',
        i.broker || ''
      ].join(' ').toLowerCase();
      return hay.includes(qLower);
    });

    // Identificar Melhores e Piores desempenhos considerando apenas ativos ativos
    const sortedByProfit = activeInvestments.filter(i => MarketApiService.hasQuote(i) && (Number(i.quantity) || 0) > 0).sort((a, b) => {
      const pA = ((Storage.getMarketPrice(a) - a.averagePrice) / (a.averagePrice || 1)) * 100;
      const pB = ((Storage.getMarketPrice(b) - b.averagePrice) / (b.averagePrice || 1)) * 100;
      return pB - pA;
    });
    const bestPerformer = sortedByProfit.length > 0 ? sortedByProfit[0] : null;
    const worstPerformer = sortedByProfit.length > 1 ? sortedByProfit[sortedByProfit.length - 1] : null;

    const lastSyncTime = MarketApiService.lastUpdated
      ? Utils.formatDate(Utils.getTodayString()) + ' às ' + new Date(MarketApiService.lastUpdated).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : 'Cotações em tempo real armazenadas';

    this.container.innerHTML = `
      <div class="investments-container">
        <!-- Top bar com saudação e botões de ação -->
        <div class="dashboard-header-bar">
          <div>
            <h2>Investimentos & Carteira de Ativos</h2>
            <p>Gerencie sua carteira em Cripto, FIIs, Ações e Renda Fixa com cotações automáticas e rentabilidade real.</p>
          </div>

          <div style="display: flex; gap: var(--spacing-2); flex-wrap: wrap;">
            <button type="button" class="btn btn-outline btn-sm" id="btn-sync-quotes" title="Atualizar cotações pelas APIs">
              ${Utils.icons.refresh} <span>${MarketApiService.isUpdating ? 'Atualizando...' : 'Atualizar Cotações'}</span>
            </button>
            <button type="button" class="btn btn-outline btn-sm" id="btn-export-investments-csv" title="Exportar carteira para CSV">
              ${Utils.icons.download} Exportar CSV
            </button>
            <button type="button" class="btn btn-primary" id="btn-add-investment">
              ${Utils.icons.plus} Novo Ativo
            </button>
          </div>
        </div>

        <!-- Banner de Status de Cotação de APIs -->
        <div class="inv-api-banner">
          <div>
            ${this.quoteSummaryHtml(activeInvestments)}
          </div>
          <div style="font-size: var(--font-size-xs); color: var(--text-muted);">
            💡 Rentabilidade calculada pelo custo médio contábil ponderado.
          </div>
        </div>

        <!-- 6 Indicadores Principais da Carteira -->
        <div class="inv-kpi-grid">
          <div class="inv-kpi-card">
            <div class="inv-kpi-top">
              <span class="inv-kpi-label">Valor de Mercado</span>
              <div class="inv-kpi-icon primary">${Utils.icons.wallet}</div>
            </div>
            <div class="inv-kpi-val text-primary ${privacyClass}">
              ${Utils.formatCurrency(invMetrics.totalCurrentValue)}
            </div>
            <div class="inv-kpi-sub">Somente ativos com cotação válida${invMetrics.unquotedCount > 0 ? ` · ${invMetrics.unquotedCount} sem cotação (custo ${Utils.formatCurrency(invMetrics.unquotedCost)})` : ''}${invMetrics.fixedAppliedValue > 0 ? ` · Renda fixa: ${Utils.formatCurrency(invMetrics.fixedAppliedValue)} aplicados (sem rendimento calculado)` : ''}</div>
          </div>

          <div class="inv-kpi-card">
            <div class="inv-kpi-top">
              <span class="inv-kpi-label">Custo Total da Posição</span>
              <div class="inv-kpi-icon purple">${Utils.icons.piggyBank}</div>
            </div>
            <div class="inv-kpi-val ${privacyClass}">
              ${Utils.formatCurrency(invMetrics.totalInvested)}
            </div>
            <div class="inv-kpi-sub">Preço médio × quantidade (com taxas)</div>
          </div>

          <div class="inv-kpi-card">
            <div class="inv-kpi-top">
              <span class="inv-kpi-label">Lucro / Prejuízo Não Realizado</span>
              <div class="inv-kpi-icon ${invMetrics.unrealizedProfit >= 0 ? 'success' : 'danger'}">
                ${invMetrics.unrealizedProfit >= 0 ? Utils.icons.trendingUp : Utils.icons.trendingDown}
              </div>
            </div>
            <div class="inv-kpi-val ${invMetrics.unrealizedProfit >= 0 ? 'text-success' : 'text-danger'} ${privacyClass}">
              ${invMetrics.unrealizedProfit >= 0 ? '+' : ''} ${Utils.formatCurrency(invMetrics.unrealizedProfit)}
            </div>
            <div class="inv-kpi-sub">Valor de mercado − custo (só ativos cotados)</div>
          </div>

          <div class="inv-kpi-card">
            <div class="inv-kpi-top">
              <span class="inv-kpi-label">Lucro Realizado</span>
              <div class="inv-kpi-icon ${invMetrics.realizedProfit >= 0 ? 'success' : 'danger'}">${Utils.icons.check}</div>
            </div>
            <div class="inv-kpi-val ${invMetrics.realizedProfit > 0 ? 'text-success' : invMetrics.realizedProfit < 0 ? 'text-danger' : ''} ${privacyClass}">
              ${invMetrics.realizedProfit > 0 ? '+' : ''} ${Utils.formatCurrency(invMetrics.realizedProfit)}
            </div>
            <div class="inv-kpi-sub">De vendas já feitas (recebido − custo)${invMetrics.realizedHasUnknown ? ' · exclui vendas antigas sem custo registrado' : ''}</div>
          </div>

          <div class="inv-kpi-card">
            <div class="inv-kpi-top">
              <span class="inv-kpi-label">Rentabilidade</span>
              <div class="inv-kpi-icon ${invMetrics.profitPercentage >= 0 ? 'success' : 'danger'}">%</div>
            </div>
            <div class="inv-kpi-val ${invMetrics.profitPercentage >= 0 ? 'text-success' : 'text-danger'}">
              ${invMetrics.profitPercentage >= 0 ? '+' : ''}${invMetrics.profitPercentage.toFixed(2)}%
            </div>
            <div class="inv-kpi-sub">Retorno sobre o capital</div>
          </div>

          <div class="inv-kpi-card">
            <div class="inv-kpi-top">
              <span class="inv-kpi-label">Proventos Recebidos</span>
              <div class="inv-kpi-icon success">${Utils.icons.check}</div>
            </div>
            <div class="inv-kpi-val text-success ${privacyClass}">
              + ${Utils.formatCurrency(invMetrics.totalDividends)}
            </div>
            <div class="inv-kpi-sub">Dividendos e rendimentos</div>
          </div>

          <div class="inv-kpi-card">
            <div class="inv-kpi-top">
              <span class="inv-kpi-label">Ativos em Carteira</span>
              <div class="inv-kpi-icon primary">${Utils.icons.target}</div>
            </div>
            <div class="inv-kpi-val text-primary">
              ${invMetrics.totalAssets} ${invMetrics.totalAssets === 1 ? 'ativo' : 'ativos'}
            </div>
            <div class="inv-kpi-sub">Em 4 classes monitoradas</div>
          </div>
        </div>

        <!-- Abas de Navegação Interna -->
        <div class="inv-nav-tabs">
          <button type="button" class="inv-tab-btn ${this.activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">📊 Visão Geral & Gráficos</button>
          <button type="button" class="inv-tab-btn ${this.activeTab === 'assets' ? 'active' : ''}" data-tab="assets">📑 Meus Ativos (${activeInvestments.length})</button>
          <button type="button" class="inv-tab-btn ${this.activeTab === 'trades' ? 'active' : ''}" data-tab="trades">🔄 Compras e Vendas (${trades.length})</button>
          <button type="button" class="inv-tab-btn ${this.activeTab === 'dividends' ? 'active' : ''}" data-tab="dividends">💰 Proventos (${dividends.length})</button>
          <button type="button" class="inv-tab-btn ${this.activeTab === 'goals' ? 'active' : ''}" data-tab="goals">🎯 Metas (${goals.length})</button>
        </div>

        <!-- CONTEÚDO DA ABA SELECIONADA -->
        ${this.renderTabContent(activeInvestments, trades, dividends, goals, snapshots, invMetrics, filteredInvestments, bestPerformer, worstPerformer, privacyClass, allInvestments)}
      </div>
    `;

    this.bindEvents();
    this.renderCharts(activeInvestments, snapshots);
  },

  renderTabContent(activeInvestments, trades, dividends, goals, snapshots, invMetrics, filteredInvestments, bestPerformer, worstPerformer, privacyClass, allInvestments = null) {
    const allInvs = allInvestments || Storage.getInvestments();

    if (this.activeTab === 'dashboard') {
      if (activeInvestments.length === 0 && (!snapshots || snapshots.length === 0)) {
        return `
          <div class="card empty-state" style="margin-top: var(--spacing-4);">
            <div class="empty-state-icon">${Utils.icons.trendingUp}</div>
            <h4 class="empty-state-title">Sua carteira de investimentos está vazia</h4>
            <p class="empty-state-text">
              Comece cadastrando suas criptomoedas (BTC, ETH), fundos imobiliários (MXRF11, HGLG11), ações da B3 ou títulos de renda fixa (CDB, Tesouro Selic).
            </p>
            <button type="button" class="btn btn-primary" id="btn-empty-add-inv">
              ${Utils.icons.plus} Adicionar Primeiro Investimento
            </button>
          </div>
        `;
      }
      return this.renderDashboardTab(activeInvestments, trades, dividends, invMetrics, bestPerformer, worstPerformer, privacyClass);
    } else if (this.activeTab === 'assets') {
      if (activeInvestments.length === 0) {
        return `
          <div class="card empty-state" style="margin-top: var(--spacing-4);">
            <div class="empty-state-icon">${Utils.icons.trendingUp}</div>
            <h4 class="empty-state-title">Você não possui ativos em carteira no momento</h4>
            <p class="empty-state-text">
              Todas as posições anteriores foram vendidas ou encerradas. Suas movimentações e lucros continuam salvos na aba "Compras e Vendas".
            </p>
            <button type="button" class="btn btn-primary" id="btn-empty-add-inv">
              ${Utils.icons.plus} Novo Aporte / Ativo
            </button>
          </div>
        `;
      }
      return this.renderAssetsTab(filteredInvestments, privacyClass);
    } else if (this.activeTab === 'trades') {
      return this.renderTradesTab(trades, allInvs, privacyClass);
    } else if (this.activeTab === 'dividends') {
      return this.renderDividendsTab(dividends, allInvs, privacyClass);
    } else if (this.activeTab === 'goals') {
      return this.renderGoalsTab(goals, invMetrics, privacyClass);
    }
    return '';
  },

  renderDashboardTab(investments, trades, dividends, invMetrics, bestPerformer, worstPerformer, privacyClass) {
    return `
      <!-- Gráfico de Evolução Patrimonial -->
      <div class="card" style="margin-bottom: var(--spacing-5);">
        <div class="card-header" style="flex-wrap: wrap; gap: var(--spacing-3);">
          <div>
            <h3 class="card-title">Evolução do Patrimônio Investido</h3>
            <span style="font-size: var(--font-size-xs); color: var(--text-muted);">Acompanhamento real com histórico de aportes e valorização</span>
          </div>
          <div class="inv-chart-controls">
            <button type="button" class="inv-chart-filter-btn ${this.chartPeriod === '7d' ? 'active' : ''}" data-period="7d">7 Dias</button>
            <button type="button" class="inv-chart-filter-btn ${this.chartPeriod === '30d' ? 'active' : ''}" data-period="30d">30 Dias</button>
            <button type="button" class="inv-chart-filter-btn ${this.chartPeriod === '6m' ? 'active' : ''}" data-period="6m">6 Meses</button>
            <button type="button" class="inv-chart-filter-btn ${this.chartPeriod === '1y' ? 'active' : ''}" data-period="1y">1 Ano</button>
            <button type="button" class="inv-chart-filter-btn ${this.chartPeriod === 'all' ? 'active' : ''}" data-period="all">Tudo</button>
          </div>
        </div>
        <div class="card-body">
          <div class="chart-container" style="height: 280px;">
            <canvas id="chart-inv-evolution"></canvas>
          </div>
        </div>
      </div>

      <!-- 2 Gráficos de Distribuição da Carteira -->
      <div class="dashboard-charts-grid" style="margin-bottom: var(--spacing-5);">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Distribuição por Classe de Ativos</h3>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="chart-inv-classes"></canvas>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Distribuição por Ativo Individual</h3>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="chart-inv-assets"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Melhores / Piores Desempenhos & Últimas Movimentações -->
      <div class="dashboard-bottom-grid">
        <!-- Destaques de Rentabilidade -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Destaques da Carteira</h3>
            <span style="font-size: var(--font-size-xs); color: var(--text-muted);">Maior e menor rentabilidade percentual</span>
          </div>
          <div class="card-body">
            <div style="display: flex; flex-direction: column; gap: var(--spacing-4);">
              ${bestPerformer ? `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--spacing-3); background: rgba(16, 185, 129, 0.08); border-radius: var(--radius-lg); border-left: 4px solid #10b981;">
                  <div>
                    <span style="font-size: var(--font-size-xs); color: #10b981; font-weight: 700;">🚀 MELHOR DESEMPENHO</span>
                    <div style="font-weight: 700; font-size: var(--font-size-md); color: var(--text-primary); margin-top: 2px;">
                      ${bestPerformer.ticker} - ${Utils.escapeHtml(bestPerformer.name)}
                    </div>
                    <div style="font-size: var(--font-size-xs); color: var(--text-muted);">
                      Preço Médio: ${Utils.formatCurrency(bestPerformer.averagePrice)} | Atual: ${Utils.formatCurrency(Storage.getMarketPrice(bestPerformer))}
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div class="text-success font-bold" style="font-size: 1.2rem;">
                      +${(((Storage.getMarketPrice(bestPerformer) - bestPerformer.averagePrice) / (bestPerformer.averagePrice || 1)) * 100).toFixed(2)}%
                    </div>
                    <div style="font-size: var(--font-size-xs); color: var(--text-muted);" class="${privacyClass}">
                      + ${Utils.formatCurrency((Storage.getMarketPrice(bestPerformer) - bestPerformer.averagePrice) * bestPerformer.quantity)}
                    </div>
                  </div>
                </div>
              ` : ''}

              ${worstPerformer && worstPerformer.id !== bestPerformer?.id ? `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--spacing-3); background: rgba(239, 68, 68, 0.08); border-radius: var(--radius-lg); border-left: 4px solid #ef4444;">
                  <div>
                    <span style="font-size: var(--font-size-xs); color: #ef4444; font-weight: 700;">⚠️ MENOR DESEMPENHO</span>
                    <div style="font-weight: 700; font-size: var(--font-size-md); color: var(--text-primary); margin-top: 2px;">
                      ${worstPerformer.ticker} - ${Utils.escapeHtml(worstPerformer.name)}
                    </div>
                    <div style="font-size: var(--font-size-xs); color: var(--text-muted);">
                      Preço Médio: ${Utils.formatCurrency(worstPerformer.averagePrice)} | Atual: ${Utils.formatCurrency(Storage.getMarketPrice(worstPerformer))}
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div class="text-danger font-bold" style="font-size: 1.2rem;">
                      ${(((Storage.getMarketPrice(worstPerformer) - worstPerformer.averagePrice) / (worstPerformer.averagePrice || 1)) * 100).toFixed(2)}%
                    </div>
                    <div style="font-size: var(--font-size-xs); color: var(--text-muted);" class="${privacyClass}">
                      ${Utils.formatCurrency((Storage.getMarketPrice(worstPerformer) - worstPerformer.averagePrice) * worstPerformer.quantity)}
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Últimos Dividendos & Proventos -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Últimos Proventos Recebidos</h3>
            <button type="button" class="btn btn-outline btn-sm btn-quick-dividend">+ Adicionar Provento</button>
          </div>
          <div class="card-body">
            ${dividends.length === 0 ? `
              <p class="text-muted" style="font-size: var(--font-size-sm); text-align: center; padding: var(--spacing-4);">Nenhum dividendo registrado ainda.</p>
            ` : `
              <div style="display: flex; flex-direction: column; gap: var(--spacing-2);">
                ${dividends.slice(0, 4).map(d => `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--spacing-2) 0; border-bottom: 1px solid var(--border-color-subtle);">
                    <div>
                      <strong style="color: var(--text-primary); font-size: var(--font-size-sm);">${d.ticker}</strong>
                      <span class="badge" style="font-size: 0.65rem; margin-left: 6px;">${d.type === 'dividend' ? 'Dividendo' : d.type === 'jcp' ? 'JCP' : 'Rendimento'}</span>
                      <div style="font-size: var(--font-size-xs); color: var(--text-muted);">${Utils.formatDate(d.date)}</div>
                    </div>
                    <div class="text-success font-bold ${privacyClass}">
                      + ${Utils.formatCurrency(d.amount)}
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  },

  renderAssetsTab(investments, privacyClass) {
    const activeInvs = Storage.getActiveInvestments();
    const counts = {
      all: activeInvs.length,
      stock: activeInvs.filter(i => i.type === 'stock').length,
      fii: activeInvs.filter(i => i.type === 'fii').length,
      crypto: activeInvs.filter(i => i.type === 'crypto').length,
      fixed: activeInvs.filter(i => i.type === 'fixed').length
    };

    const variableAndCrypto = investments.filter(i => i.type !== 'fixed');
    const fixedIncome = investments.filter(i => i.type === 'fixed');

    const showVariableSection = this.classFilter !== 'fixed' && (variableAndCrypto.length > 0 || (this.classFilter !== 'all' && this.classFilter !== 'fixed'));
    const showFixedSection = (this.classFilter === 'all' || this.classFilter === 'fixed') && (fixedIncome.length > 0 || this.classFilter === 'fixed');

    const isCryptoOnly = this.classFilter === 'crypto';
    const isStockOrFiiOnly = this.classFilter === 'stock' || this.classFilter === 'fii';
    const codeColLabel = isCryptoOnly ? 'Símbolo' : isStockOrFiiOnly ? 'Código (Ticker)' : 'Ticker / Símbolo';
    const nameColLabel = isCryptoOnly ? 'Nome da Criptomoeda' : isStockOrFiiOnly ? 'Nome do Ativo' : 'Ativo / Criptomoeda';
    const qtyColLabel = isCryptoOnly ? 'Quantidade' : isStockOrFiiOnly ? 'Qtd. de Cotas / Ações' : 'Quantidade';

    return `
      <!-- Barra de Filtros por Classe e Busca Dinâmica -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--spacing-3); margin-bottom: var(--spacing-4);">
        <div class="inv-class-pills" style="margin-bottom: 0;">
          <button type="button" class="inv-class-pill ${this.classFilter === 'all' ? 'active' : ''}" data-class="all">Todos (${counts.all})</button>
          <button type="button" class="inv-class-pill ${this.classFilter === 'stock' ? 'active' : ''}" data-class="stock">📈 Ações (${counts.stock})</button>
          <button type="button" class="inv-class-pill ${this.classFilter === 'fii' ? 'active' : ''}" data-class="fii">🏢 FIIs (${counts.fii})</button>
          <button type="button" class="inv-class-pill ${this.classFilter === 'crypto' ? 'active' : ''}" data-class="crypto">🪙 Criptomoedas (${counts.crypto})</button>
          <button type="button" class="inv-class-pill ${this.classFilter === 'fixed' ? 'active' : ''}" data-class="fixed">🏛️ Renda Fixa (${counts.fixed})</button>
        </div>
        <div style="min-width: 260px; flex: 1; max-width: 360px;">
          <input type="search" id="inv-assets-search" placeholder="${this.classFilter === 'fixed' ? 'Filtrar por nome, instituição ou indexador...' : 'Filtrar por nome, ticker (ex: MXRF11) ou símbolo...'}" value="${Utils.escapeHtml(this.searchQuery || '')}" style="width: 100%;">
        </div>
      </div>

      ${investments.length === 0 ? `
        <div class="card empty-state" style="margin-bottom: var(--spacing-4);">
          <p class="empty-state-text">Nenhum investimento encontrado para o filtro selecionado.</p>
        </div>
      ` : ''}

      ${showVariableSection && variableAndCrypto.length > 0 ? `
        <!-- Tabela de Ações, FIIs e Criptomoedas -->
        <div style="margin-bottom: var(--spacing-5);">
          ${this.classFilter === 'all' && fixedIncome.length > 0 ? `
            <h4 style="margin: 0 0 var(--spacing-2) 0; font-size: var(--font-size-sm); color: var(--text-secondary);">
              📈 Renda Variável & Criptomoedas (Ações, FIIs e Cripto)
            </h4>
          ` : ''}
          <div class="inv-table-wrap">
            <table class="inv-table">
              <thead>
                <tr>
                  <th>${nameColLabel}</th>
                  <th>${codeColLabel}</th>
                  <th>Classe</th>
                  <th>${qtyColLabel}</th>
                  <th>Preço Médio de Compra</th>
                  <th>Cotação Atual Automática</th>
                  <th>Valor Total Investido</th>
                  <th>Posição Atual / Resultado</th>
                  <th style="text-align: right;">Ações</th>
                </tr>
              </thead>
              <tbody>
                ${variableAndCrypto.map(inv => {
                  const qtyNow = Number(inv.quantity) || 0;
                  const avgPrice = Number(inv.averagePrice) || 0;
                  const hasQuote = Storage.hasMarketQuote(inv);
                  const marketPrice = Storage.getMarketPrice(inv);
                  const currentVal = hasQuote ? qtyNow * marketPrice : null;
                  const costVal = Storage.getCostBasis(inv) || (qtyNow * avgPrice);
                  const profit = hasQuote ? currentVal - costVal : 0;
                  const profitPct = hasQuote && costVal > 0 ? (profit / costVal) * 100 : 0;
                  const isPositive = profit >= 0;
                  const isNeutral = hasQuote && Math.abs(profit) < 0.005;
                  const profitColor = isNeutral ? 'text-muted' : (isPositive ? 'text-success' : 'text-danger');
                  const typeLabel = inv.type === 'stock' ? 'Ação' : inv.type === 'fii' ? 'FII' : 'Cripto';
                  const unitLabel = inv.type === 'crypto' ? inv.ticker : (inv.type === 'stock' ? 'ações' : 'cotas');

                  return `
                    <tr data-id="${inv.id}">
                      <td>
                        <div class="inv-asset-cell">
                          <div class="inv-asset-icon">
                            ${inv.type === 'crypto' ? '🪙' : inv.type === 'fii' ? '🏢' : '📈'}
                          </div>
                          <div>
                            <strong>${Utils.escapeHtml(inv.name)}</strong>
                            ${inv.broker ? `<div style="font-size: var(--font-size-xs); color: var(--text-muted);">${Utils.escapeHtml(inv.broker)}</div>` : ''}
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong style="font-family: monospace; font-size: 0.9rem;">${Utils.escapeHtml(inv.ticker)}</strong>
                      </td>
                      <td>
                        <span class="inv-badge-class ${inv.type}">${typeLabel}</span>
                      </td>
                      <td class="font-medium">
                        ${inv.quantity} <span style="font-size: var(--font-size-xs); color: var(--text-muted);">${Utils.escapeHtml(unitLabel)}</span>
                      </td>
                      <td class="text-secondary ${privacyClass}">
                        ${qtyNow > 0 ? Utils.formatCurrency(avgPrice) : '—'}
                      </td>
                      <td class="font-medium">
                        <div class="${privacyClass}">${hasQuote ? Utils.formatCurrency(marketPrice) : '—'}</div>
                        ${this.quoteInfoHtml(inv)}
                      </td>
                      <td class="font-bold ${privacyClass}">
                        ${Utils.formatCurrency(costVal)}
                      </td>
                      <td>
                        ${qtyNow <= 0 ? '—' : (hasQuote ? `
                          <div class="font-bold text-primary ${privacyClass}">${Utils.formatCurrency(currentVal)}</div>
                          <div style="font-size: 0.72rem;" class="${profitColor} ${privacyClass}">
                            ${profit > 0.005 ? '+' : ''}${Utils.formatCurrency(profit)} (${profit > 0.005 ? '+' : ''}${profitPct.toFixed(2)}%)
                          </div>
                        ` : `<span class="text-muted" title="Sem cotação de mercado válida">Indisponível</span>`)}
                        ${Math.abs(Number(inv.realizedProfit) || 0) >= 0.005 ? `<div style="font-size: 0.7rem; margin-top: 2px;" class="text-muted ${privacyClass}" title="Lucro já realizado com vendas deste ativo">Realizado: ${(Number(inv.realizedProfit) > 0 ? '+' : '')}${Utils.formatCurrency(Number(inv.realizedProfit))}</div>` : ''}
                      </td>
                      <td style="text-align: right;">
                        <div style="display: flex; gap: 4px; justify-content: flex-end;">
                          <button type="button" class="action-btn btn-view-inv" data-id="${inv.id}" title="Visualizar Detalhes">👁️</button>
                          <button type="button" class="btn btn-sm btn-outline btn-trade-inv" data-id="${inv.id}" data-action="buy" title="Comprar mais">+ Comprar</button>
                          <button type="button" class="btn btn-sm btn-outline btn-trade-inv" data-id="${inv.id}" data-action="sell" title="Vender posição">- Vender</button>
                          <button type="button" class="action-btn edit-btn btn-edit-inv" data-id="${inv.id}" title="Editar Ativo">${Utils.icons.edit}</button>
                          <button type="button" class="action-btn delete-btn btn-delete-inv" data-id="${inv.id}" title="Excluir Ativo">${Utils.icons.trash}</button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      ${showFixedSection && fixedIncome.length > 0 ? `
        <!-- Tabela Específica de Renda Fixa (Sem Ticker ou Cotação de Bolsa) -->
        <div style="margin-bottom: var(--spacing-4);">
          ${this.classFilter === 'all' && variableAndCrypto.length > 0 ? `
            <h4 style="margin: 0 0 var(--spacing-2) 0; font-size: var(--font-size-sm); color: var(--text-secondary);">
              🏛️ Títulos e Aplicações de Renda Fixa
            </h4>
          ` : ''}
          <div class="inv-table-wrap">
            <table class="inv-table">
              <thead>
                <tr>
                  <th>Nome do Investimento</th>
                  <th>Instituição Financeira</th>
                  <th>Valor Aplicado</th>
                  <th>Tipo de Rentabilidade</th>
                  <th>Taxa Contratada</th>
                  <th>Data da Aplicação</th>
                  <th>Data de Vencimento</th>
                  <th>Rentabilidade Acumulada</th>
                  <th style="text-align: right;">Ações</th>
                </tr>
              </thead>
              <tbody>
                ${fixedIncome.map(inv => {
                  const applied = Storage.getAppliedAmount(inv);
                  const accYield = Storage.getAccumulatedYield(inv);
                  const appDate = inv.applicationDate || inv.purchaseDate || '';
                  return `
                    <tr data-id="${inv.id}">
                      <td>
                        <div class="inv-asset-cell">
                          <div class="inv-asset-icon">🏛️</div>
                          <div>
                            <strong>${Utils.escapeHtml(inv.name)}</strong>
                            <div style="font-size: var(--font-size-xs); color: var(--text-muted);">Renda Fixa</div>
                          </div>
                        </div>
                      </td>
                      <td class="font-medium">
                        ${Utils.escapeHtml(inv.institution || inv.broker || '—')}
                      </td>
                      <td class="font-bold text-primary ${privacyClass}">
                        ${Utils.formatCurrency(applied)}
                      </td>
                      <td>
                        <span class="inv-badge-class fixed">${Utils.escapeHtml(Storage.getYieldTypeLabel(inv.yieldType))}</span>
                      </td>
                      <td class="font-medium">
                        ${Utils.escapeHtml(inv.rateText || '—')}
                      </td>
                      <td class="text-secondary">
                        ${appDate ? Utils.formatDate(appDate) : '—'}
                      </td>
                      <td class="text-secondary">
                        ${inv.maturityDate ? Utils.formatDate(inv.maturityDate) : '<span class="text-muted">Liquidez / Sem venc.</span>'}
                      </td>
                      <td>
                        ${accYield !== null ? `
                          <span class="text-success font-bold ${privacyClass}">+ ${Utils.formatCurrency(accYield)}</span>
                          <div style="font-size: 0.72rem;" class="text-muted ${privacyClass}">Saldo: ${Utils.formatCurrency(applied + accYield)}</div>
                        ` : `<span class="text-muted">Não informada</span>`}
                      </td>
                      <td style="text-align: right;">
                        <div style="display: flex; gap: 4px; justify-content: flex-end;">
                          <button type="button" class="action-btn btn-view-inv" data-id="${inv.id}" title="Visualizar Detalhes">👁️</button>
                          <button type="button" class="btn btn-sm btn-outline btn-trade-inv" data-id="${inv.id}" data-action="buy" title="Novo Aporte">+ Aportar</button>
                          <button type="button" class="btn btn-sm btn-outline btn-trade-inv" data-id="${inv.id}" data-action="sell" title="Resgatar Valor">- Resgatar</button>
                          <button type="button" class="action-btn edit-btn btn-edit-inv" data-id="${inv.id}" title="Editar Aplicação">${Utils.icons.edit}</button>
                          <button type="button" class="action-btn delete-btn btn-delete-inv" data-id="${inv.id}" title="Excluir Aplicação">${Utils.icons.trash}</button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
    `;
  },

  renderTradesTab(trades, investments, privacyClass) {
    const invMap = new Map(investments.map(i => [i.id, i]));

    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Histórico de Compras e Vendas</h3>
          <span style="font-size: var(--font-size-xs); color: var(--text-muted);">${trades.length} operações registradas</span>
        </div>
        <div class="card-body" style="padding: 0;">
          <div class="inv-table-wrap" style="border: none;">
            <table class="inv-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Operação</th>
                  <th>Ativo</th>
                  <th>Quantidade</th>
                  <th>Preço Unitário</th>
                  <th>Taxas</th>
                  <th>Valor da Operação</th>
                  <th>Custo das Unidades Vendidas</th>
                  <th>Lucro Realizado</th>
                  <th>Corretora</th>
                  <th>Observações</th>
                  <th style="text-align: right;">Ação</th>
                </tr>
              </thead>
              <tbody>
                ${trades.length === 0 ? `
                  <tr><td colspan="12" style="text-align: center; padding: var(--spacing-6); color: var(--text-muted);">Nenhuma negociação realizada ainda.</td></tr>
                ` : trades.map(t => {
                  const inv = invMap.get(t.investmentId);
                  const isBuy = t.type === 'buy';
                  return `
                    <tr>
                      <td>${Utils.formatDate(t.date)}</td>
                      <td>
                        <span class="badge ${isBuy ? 'badge-income' : 'badge-expense'}">
                          ${isBuy ? 'COMPRA' : 'VENDA'}
                        </span>
                      </td>
                      <td><strong>${inv ? Utils.escapeHtml(inv.type === 'fixed' ? inv.name : (inv.ticker || inv.name)) : 'ATIVO'}</strong></td>
                      <td>${t.quantity}</td>
                      <td class="${privacyClass}">${Utils.formatCurrency(t.unitPrice)}</td>
                      <td class="${privacyClass}">${Utils.formatCurrency(t.fees || 0)}</td>
                      <td class="font-bold ${isBuy ? 'text-danger' : 'text-success'} ${privacyClass}">
                        ${isBuy ? '-' : '+'} ${Utils.formatCurrency(t.totalAmount)}
                      </td>
                      <td class="text-secondary ${privacyClass}">${!isBuy && t.costOfSold !== null && t.costOfSold !== undefined ? Utils.formatCurrency(t.costOfSold) : '—'}</td>
                      <td class="font-bold ${privacyClass} ${!isBuy && Number.isFinite(Number(t.realizedProfit)) && t.realizedProfit !== null ? (t.realizedProfit > 0.005 ? 'text-success' : t.realizedProfit < -0.005 ? 'text-danger' : 'text-muted') : 'text-muted'}">
                        ${!isBuy && t.realizedProfit !== null && t.realizedProfit !== undefined ? ((t.realizedProfit > 0.005 ? '+' : '') + Utils.formatCurrency(t.realizedProfit)) : '—'}
                      </td>
                      <td>${Utils.escapeHtml(t.broker || '-')}</td>
                      <td style="font-size: var(--font-size-xs); color: var(--text-muted);">${Utils.escapeHtml(t.notes || '-')}</td>
                      <td style="text-align: right;">
                        <button type="button" class="action-btn delete-btn btn-delete-trade" data-id="${t.id}" title="Excluir Registro">${Utils.icons.trash}</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  renderDividendsTab(dividends, investments, privacyClass) {
    const totalDiv = dividends.reduce((s, d) => s + (Number(d.amount) || 0), 0);

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-4);">
        <div>
          <h3 style="margin: 0; font-size: var(--font-size-lg);">Proventos e Rendimentos Recebidos</h3>
          <p style="margin: 0; font-size: var(--font-size-xs); color: var(--text-muted);">Histórico detalhado de dividendos, JCP e aluguéis de FIIs</p>
        </div>
        <button type="button" class="btn btn-primary btn-sm btn-quick-dividend">
          ${Utils.icons.plus} Registrar Provento
        </button>
      </div>

      <div class="inv-table-wrap">
        <table class="inv-table">
          <thead>
            <tr>
              <th>Data de Pagamento</th>
              <th>Código / Ticker</th>
              <th>Tipo</th>
              <th>Cotas na Base</th>
              <th>Valor Total Recebido</th>
              <th>Observação</th>
              <th style="text-align: right;">Ação</th>
            </tr>
          </thead>
          <tbody>
            ${dividends.length === 0 ? `
              <tr><td colspan="7" style="text-align: center; padding: var(--spacing-6); color: var(--text-muted);">Nenhum provento cadastrado ainda.</td></tr>
            ` : dividends.map(d => `
              <tr>
                <td>${Utils.formatDate(d.date)}</td>
                <td><strong>${d.ticker}</strong></td>
                <td>
                  <span class="badge badge-category">${d.type === 'dividend' ? 'Dividendo' : d.type === 'jcp' ? 'JCP' : 'Rendimento'}</span>
                </td>
                <td>${d.quantityRef || '-'}</td>
                <td class="font-bold text-success ${privacyClass}">
                  + ${Utils.formatCurrency(d.amount)}
                </td>
                <td style="font-size: var(--font-size-xs); color: var(--text-muted);">${Utils.escapeHtml(d.notes || '-')}</td>
                <td style="text-align: right;">
                  <button type="button" class="action-btn delete-btn btn-delete-dividend" data-id="${d.id}" title="Excluir">${Utils.icons.trash}</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  renderGoalsTab(goals, invMetrics, privacyClass) {
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-4);">
        <div>
          <h3 style="margin: 0; font-size: var(--font-size-lg);">Metas de Investimento e Renda Passiva</h3>
          <p style="margin: 0; font-size: var(--font-size-xs); color: var(--text-muted);">Acompanhe objetivos de patrimônio investido ou fluxo de dividendos</p>
        </div>
        <button type="button" class="btn btn-primary btn-sm" id="btn-add-inv-goal">
          ${Utils.icons.plus} Nova Meta
        </button>
      </div>

      <div class="inv-goals-grid">
        ${goals.map(g => {
          const currentVal = invMetrics.totalCurrentValue;
          const target = Number(g.targetAmount) || 1;
          const pct = Math.min(100, Math.round((currentVal / target) * 100));
          const isCompleted = currentVal >= target;

          return `
            <div class="inv-goal-card">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <h4 style="margin: 0; font-size: var(--font-size-base);">${Utils.escapeHtml(g.name)}</h4>
                  <div style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 2px;">
                    ${g.deadline ? '📅 Prazo: ' + Utils.formatDate(g.deadline) : 'Sem data limite'}
                  </div>
                </div>
                <button type="button" class="action-btn delete-btn btn-delete-inv-goal" data-id="${g.id}" title="Excluir">${Utils.icons.trash}</button>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <div>
                  <span style="font-size: var(--font-size-xs); color: var(--text-muted);">Atual</span>
                  <div class="font-bold text-primary ${privacyClass}">${Utils.formatCurrency(currentVal)}</div>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: var(--font-size-xs); color: var(--text-muted);">Alvo</span>
                  <div class="font-bold ${privacyClass}">${Utils.formatCurrency(target)}</div>
                </div>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: var(--font-size-xs); margin-bottom: 4px;">
                  <span class="font-bold text-success">${pct}% Concluído</span>
                  <span>${isCompleted ? '🎉 Meta Atingida!' : `Faltam ${Utils.formatCurrency(Math.max(0, target - currentVal))}`}</span>
                </div>
                <div class="inv-goal-progress-track">
                  <div class="inv-goal-progress-fill" style="width: ${pct}%;"></div>
                </div>
              </div>

              ${g.description ? `
                <div style="font-size: var(--font-size-xs); color: var(--text-muted); border-top: 1px solid var(--border-color-subtle); padding-top: var(--spacing-2);">
                  ${Utils.escapeHtml(g.description)}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  bindEvents() {
    // Tabs click
    this.container.querySelectorAll('.inv-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.getAttribute('data-tab');
        this.render();
      });
    });

    // Class pills click
    this.container.querySelectorAll('.inv-class-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        this.classFilter = btn.getAttribute('data-class');
        this.render();
      });
    });

    // Search input filter
    const searchInput = this.container.querySelector('#inv-assets-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        const pos = e.target.selectionStart;
        this.searchQuery = val;
        this.render();
        const newInput = this.container.querySelector('#inv-assets-search');
        if (newInput) {
          newInput.focus();
          try { newInput.setSelectionRange(pos, pos); } catch (_) {}
        }
      });
    }

    // Period chart filter
    this.container.querySelectorAll('.inv-chart-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.chartPeriod = btn.getAttribute('data-period');
        this.render();
      });
    });

    // Garante cotação para ativos novos / nunca consultados (respeita o cache de 1 min)
    MarketApiService.ensureQuotes();

    // Sync button (atualização manual)
    const syncBtn = this.container.querySelector('#btn-sync-quotes');
    if (syncBtn) {
      syncBtn.addEventListener('click', async () => {
        Toast.info('Consultando cotações...', 'Buscando preços nas fontes de mercado...');
        const r = await MarketApiService.updateAllQuotes({ force: true });
        this.reportQuoteResult(r);
        this.render();
      });
    }

    // Diagnóstico das cotações reais
    const diagBtn = this.container.querySelector('#btn-run-quote-diagnostic');
    if (diagBtn) {
      diagBtn.addEventListener('click', () => { if (!this.diagnosticRunning) this.runQuoteDiagnostic(); });
    }
    const cfgDetails = this.container.querySelector('.inv-api-banner details');
    if (cfgDetails) cfgDetails.addEventListener('toggle', () => { this.cfgOpen = cfgDetails.open; });

    // Configuração da fonte de cotações da B3
    const saveCfgBtn = this.container.querySelector('#btn-save-quote-config');
    if (saveCfgBtn) {
      saveCfgBtn.addEventListener('click', async () => {
        const token = this.container.querySelector('#cfg-brapi-token').value.trim();
        const base = this.container.querySelector('#cfg-brapi-base').value.trim();
        if (base && !/^https:\/\//i.test(base)) {
          Toast.warning('Endereço inválido', 'O endereço do proxy deve começar com https://');
          return;
        }
        Storage.saveSettings({ brapiToken: token, brapiBaseUrl: base });
        Toast.info('Configuração salva', 'Consultando cotações com a nova configuração...');
        const r = await MarketApiService.updateAllQuotes({ force: true });
        this.reportQuoteResult(r);
        this.render();
      });
    }

    // Export CSV
    const exportBtn = this.container.querySelector('#btn-export-investments-csv');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => Storage.exportInvestmentsToCsv());
    }

    // Add Investment
    const addBtn = this.container.querySelector('#btn-add-investment');
    const emptyAddBtn = this.container.querySelector('#btn-empty-add-inv');
    const handleAdd = () => {
      Modal.openInvestmentModal(null, (newInv) => {
        try {
          Storage.saveInvestment(newInv);
          const label = newInv.type === 'fixed' ? newInv.name : `${newInv.ticker} (${newInv.name})`;
          Toast.success('Investimento Cadastrado!', `${label} foi adicionado à sua carteira.`);
          State.notify('investments_updated');
        } catch (err) {
          Toast.error('Erro ao Cadastrar', err.message);
        }
      });
    };
    if (addBtn) addBtn.addEventListener('click', handleAdd);
    if (emptyAddBtn) emptyAddBtn.addEventListener('click', handleAdd);

    // View Investment Details
    this.container.querySelectorAll('.btn-view-inv').forEach(btn => {
      btn.addEventListener('click', () => {
        const inv = Storage.getInvestmentById(btn.getAttribute('data-id'));
        if (inv) {
          Modal.openInvestmentDetailsModal(inv, (toEdit) => {
            Modal.openInvestmentModal(toEdit, (updated) => {
              Storage.updateInvestment(updated);
              const label = updated.type === 'fixed' ? updated.name : updated.ticker;
              Toast.success('Investimento Atualizado!', `Informações de ${label} salvas com sucesso.`);
              State.notify('investments_updated');
            });
          });
        }
      });
    });

    // Edit Investment
    this.container.querySelectorAll('.btn-edit-inv').forEach(btn => {
      btn.addEventListener('click', () => {
        const inv = Storage.getInvestmentById(btn.getAttribute('data-id'));
        if (inv) {
          Modal.openInvestmentModal(inv, (updated) => {
            Storage.updateInvestment(updated);
            const label = updated.type === 'fixed' ? updated.name : updated.ticker;
            Toast.success('Investimento Atualizado!', `Informações de ${label} salvas com sucesso.`);
            State.notify('investments_updated');
          });
        }
      });
    });

    // Delete Investment
    this.container.querySelectorAll('.btn-delete-inv').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const inv = Storage.getInvestmentById(id);
        if (!inv) return;
        const label = inv.type === 'fixed'
          ? Utils.escapeHtml(inv.name)
          : `${Utils.escapeHtml(inv.ticker)} - ${Utils.escapeHtml(inv.name)}`;

        Modal.openConfirmModal({
          title: 'Excluir Investimento da Carteira?',
          message: `Deseja realmente remover a posição de <strong>${label}</strong>?<br><br>As movimentações e proventos vinculados serão removidos do histórico.`,
          confirmText: 'Sim, Excluir',
          isDanger: true,
          onConfirm: () => {
            Storage.deleteInvestment(id);
            Toast.success('Investimento Removido', `${inv.type === 'fixed' ? inv.name : inv.ticker} foi excluído da carteira.`);
            State.notify('investments_updated');
          }
        });
      });
    });

    // Trade (Buy / Sell)
    this.container.querySelectorAll('.btn-trade-inv').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-action');
        const inv = Storage.getInvestmentById(id);
        if (!inv) return;

        Modal.openTradeModal(inv, action, (tradeData) => {
          try {
            Storage.executeInvestmentTrade(id, tradeData);
            const label = inv.type === 'fixed' ? inv.name : inv.ticker;
            Toast.success(tradeData.type === 'buy' ? 'Operação Registrada!' : 'Resgate / Venda Executada!', `Movimentação em ${label} registrada.`);
            State.notify('investments_updated');
          } catch (err) {
            Toast.error('Erro na Operação', err.message);
          }
        });
      });
    });

    // Quick Dividend button
    this.container.querySelectorAll('.btn-quick-dividend').forEach(btn => {
      btn.addEventListener('click', () => {
        Modal.openDividendModal(null, (divData) => {
          Storage.saveDividend(divData);
          Toast.success('Provento Registrado!', `Rendimento de ${Utils.formatCurrency(divData.amount)} adicionado com sucesso.`);
          State.notify('investments_updated');
        });
      });
    });

    // Delete Dividend
    this.container.querySelectorAll('.btn-delete-dividend').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        Modal.openConfirmModal({
          title: 'Excluir Provento?',
          message: 'Deseja remover este provento registrado?',
          confirmText: 'Excluir',
          isDanger: true,
          onConfirm: () => {
            Storage.deleteDividend(id);
            Toast.success('Provento Removido', 'Registro excluído.');
            State.notify('investments_updated');
          }
        });
      });
    });

    // Delete Trade
    this.container.querySelectorAll('.btn-delete-trade').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        Modal.openConfirmModal({
          title: 'Excluir Registro de Negociação?',
          message: 'Deseja apagar este registro do histórico de compras e vendas?',
          confirmText: 'Excluir',
          isDanger: true,
          onConfirm: () => {
            try {
              const r = Storage.deleteInvestmentTransaction(id);
              if (r.recomputed) {
                Toast.success('Registro removido', 'Quantidade, custo, preço médio e lucro realizado foram recalculados. O lançamento em Transações não foi alterado.');
              } else {
                Toast.warning('Registro removido', 'A posição NÃO foi alterada: o histórico deste ativo não é suficiente para recalcular com segurança.');
              }
            } catch (err) {
              Toast.error('Não foi possível excluir', err.message);
            }
            State.notify('investments_updated');
          }
        });
      });
    });

    // Add Goal
    const addGoalBtn = this.container.querySelector('#btn-add-inv-goal');
    if (addGoalBtn) {
      addGoalBtn.addEventListener('click', () => {
        Modal.openInvestmentGoalModal(null, (newGoal) => {
          Storage.saveInvestmentGoal(newGoal);
          Toast.success('Meta Criada!', `Objetivo "${newGoal.name}" cadastrado com sucesso.`);
          State.notify('investments_updated');
        });
      });
    }

    // Delete Goal
    this.container.querySelectorAll('.btn-delete-inv-goal').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        Modal.openConfirmModal({
          title: 'Excluir Meta?',
          message: 'Deseja remover esta meta de investimento?',
          confirmText: 'Excluir',
          isDanger: true,
          onConfirm: () => {
            Storage.deleteInvestmentGoal(id);
            Toast.success('Meta Excluída', 'Objetivo removido.');
            State.notify('investments_updated');
          }
        });
      });
    });
  },

  // Valor usado nas distribuições: valor de mercado (ativo cotado) ou valor aplicado + rentabilidade acumulada (renda fixa). Sem cotação = 0 (fora do gráfico).
  chartValue(inv) {
    if (inv.type === 'fixed') {
      const applied = Storage.getAppliedAmount(inv);
      const acc = Storage.getAccumulatedYield(inv) || 0;
      return applied > 0 ? (applied + acc) : 0;
    }
    const qty = Number(inv.quantity) || 0;
    if (qty <= 0) return 0;
    const p = Storage.getMarketPrice(inv);
    return p === null ? 0 : qty * p;
  },

  renderCharts(investments = null, snapshots = null) {
    if (this.activeTab !== 'dashboard') return;

    if (!investments) investments = Storage.getInvestments();
    if (!snapshots) snapshots = Storage.getPortfolioSnapshots();

    // 1. Gráfico de Linha: Evolução Patrimonial
    const lineCanvas = document.getElementById('chart-inv-evolution');
    if (lineCanvas) {
      // Só entram registros com valor realmente calculado e completo (todos os ativos com cotação válida)
      const valid = snapshots.filter(s => s && s.calculated && s.complete && Number.isFinite(Number(s.value)));
      let filteredSnapshots = [...valid];
      const now = Date.now();
      const days = { '7d': 7, '30d': 30, '6m': 180, '1y': 365 }[this.chartPeriod];
      if (days) {
        const cutoff = now - days * 24 * 3600 * 1000;
        filteredSnapshots = filteredSnapshots.filter(s => new Date(s.date + 'T12:00:00').getTime() >= cutoff);
      }

      const wrap = lineCanvas.parentElement;
      let msg = wrap.querySelector('.inv-evolution-empty');
      if (filteredSnapshots.length < 2) {
        lineCanvas.style.display = 'none';
        if (!msg) {
          msg = document.createElement('div');
          msg.className = 'inv-evolution-empty';
          msg.style.cssText = 'height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; padding: var(--spacing-4); color: var(--text-muted); font-size: var(--font-size-sm); line-height: 1.5;';
          wrap.appendChild(msg);
        }
        msg.style.display = 'flex';
        const incomplete = snapshots.filter(s => s && s.calculated && !s.complete).length;
        let text;
        if (valid.length === 0) {
          text = 'Ainda não existem dados históricos suficientes. O histórico do patrimônio será construído a partir de agora, com um registro por dia em que o app for aberto com cotações válidas. Nenhum valor passado é estimado.';
        } else if (valid.length === 1) {
          text = `Há apenas 1 registro (${Utils.formatDate(valid[0].date)}: ${Utils.formatCurrency(valid[0].value)}). São necessários ao menos 2 dias de registros para desenhar a evolução.`;
        } else {
          text = 'Há poucos registros no período selecionado. Escolha um período maior.';
        }
        if (incomplete > 0) text += ` (${incomplete} registro(s) incompleto(s) por falta de cotação foram ignorados.)`;
        msg.textContent = text;
      } else {
        lineCanvas.style.display = '';
        if (msg) msg.style.display = 'none';
        Charts.renderLineChart(lineCanvas, filteredSnapshots);
      }
    }

    // 2. Gráfico Donut: Distribuição por Classe
    const classCanvas = document.getElementById('chart-inv-classes');
    if (classCanvas) {
      const classTotals = { crypto: 0, fii: 0, stock: 0, fixed: 0 };
      investments.forEach(inv => {
        const val = this.chartValue(inv);
        if (classTotals[inv.type] !== undefined) classTotals[inv.type] += val;
      });

      const totalVal = Object.values(classTotals).reduce((a, b) => a + b, 0);
      const classItems = [
        { name: 'Criptomoedas', icon: '🪙', color: '#f59e0b', amount: classTotals.crypto, percentage: totalVal > 0 ? Math.round((classTotals.crypto / totalVal) * 1000) / 10 : 0 },
        { name: 'FIIs', icon: '🏢', color: '#10b981', amount: classTotals.fii, percentage: totalVal > 0 ? Math.round((classTotals.fii / totalVal) * 1000) / 10 : 0 },
        { name: 'Ações B3', icon: '📈', color: '#3b82f6', amount: classTotals.stock, percentage: totalVal > 0 ? Math.round((classTotals.stock / totalVal) * 1000) / 10 : 0 },
        { name: 'Renda Fixa', icon: '🏛️', color: '#8b5cf6', amount: classTotals.fixed, percentage: totalVal > 0 ? Math.round((classTotals.fixed / totalVal) * 1000) / 10 : 0 }
      ].filter(i => i.amount > 0);

      Charts.renderDonutChart(classCanvas, classItems, totalVal);
    }

    // 3. Gráfico Donut: Distribuição por Ativo Individual
    const assetCanvas = document.getElementById('chart-inv-assets');
    if (assetCanvas) {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1', '#64748b'];
      const totalVal = investments.reduce((s, i) => s + this.chartValue(i), 0);

      const assetItems = investments.filter(inv => this.chartValue(inv) > 0).map((inv, idx) => {
        const val = this.chartValue(inv);
        return {
          name: inv.type === 'fixed' ? inv.name : (inv.ticker || inv.name),
          icon: inv.type === 'crypto' ? '🪙' : inv.type === 'fii' ? '🏢' : inv.type === 'stock' ? '📈' : '🏛️',
          color: colors[idx % colors.length],
          amount: val,
          percentage: totalVal > 0 ? Math.round((val / totalVal) * 1000) / 10 : 0
        };
      }).sort((a, b) => b.amount - a.amount);

      Charts.renderDonutChart(assetCanvas, assetItems, totalVal);
    }
  }
};


  // =========================================================================
  // 7.8 INTELIGÊNCIA FINANCEIRA (Motor Analítico + View Interativa)
  // =========================================================================
  Utils.icons.sparkles = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"></path><path d="M5 3v4"></path><path d="M3 5h4"></path><path d="M19 17v4"></path><path d="M17 19h4"></path></svg>`;

  // Gráficos adicionais no motor Charts para Evolução da Economia e Evolução do Patrimônio Investido
  Charts.renderSavingsEvolutionChart = function (canvas, series) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.parentElement.clientWidth || 500;
    const height = rect.height || 280;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)';
    const zeroLineColor = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(100, 116, 139, 0.35)';
    const posColor = '#10b981';
    const negColor = '#ef4444';

    ctx.clearRect(0, 0, width, height);

    if (!series || series.length === 0) {
      ctx.fillStyle = textColor;
      ctx.font = '500 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Ainda faltam dados de transações para exibir a evolução da economia.', width / 2, height / 2);
      return;
    }

    const padding = { top: 28, right: 24, bottom: 45, left: 72 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    let maxAbs = 0;
    series.forEach(item => {
      const absVal = Math.abs(Number(item.savings) || 0);
      if (absVal > maxAbs) maxAbs = absVal;
    });
    if (maxAbs === 0) maxAbs = 500;
    maxAbs = Math.ceil(maxAbs * 1.2);

    const hasNegative = series.some(item => item.savings < 0);
    const minVal = hasNegative ? -maxAbs : 0;
    const maxVal = maxAbs;
    const totalRange = maxVal - minVal || 1;
    const valueToY = (v) => padding.top + chartH - (((v - minVal) / totalRange) * chartH);
    const zeroY = valueToY(0);

    const draw = (hoveredIdx = -1) => {
      ctx.clearRect(0, 0, width, height);

      const steps = 4;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      for (let i = 0; i <= steps; i++) {
        const val = minVal + (totalRange * (i / steps));
        const y = valueToY(val);
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartW, y);
        ctx.stroke();

        ctx.fillStyle = textColor;
        const abs = Math.abs(val);
        const sign = val < -0.5 ? '-' : '';
        const lbl = abs >= 1000 ? `${sign}R$ ${(abs / 1000).toFixed(1)}k` : `${sign}R$ ${Math.round(abs)}`;
        ctx.fillText(lbl, padding.left - 8, y);
      }

      // Linha de equilíbrio (R$ 0)
      ctx.strokeStyle = zeroLineColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padding.left, zeroY);
      ctx.lineTo(padding.left + chartW, zeroY);
      ctx.stroke();

      const groupWidth = chartW / series.length;
      const barWidth = Math.min(34, Math.max(14, groupWidth * 0.48));

      series.forEach((item, idx) => {
        const centerX = padding.left + (idx * groupWidth) + (groupWidth / 2);
        const val = Number(item.savings) || 0;
        const yVal = valueToY(val);
        const isPos = val >= 0;
        const barTop = isPos ? yVal : zeroY;
        const barH = Math.max(3, Math.abs(zeroY - yVal));

        if (idx === hoveredIdx) {
          ctx.fillStyle = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)';
          this.drawRoundedRect(ctx, padding.left + (idx * groupWidth) + 2, padding.top, groupWidth - 4, chartH, 6);
        }

        ctx.fillStyle = isPos ? posColor : negColor;
        ctx.fillRect(centerX - barWidth / 2, barTop, barWidth, barH);

        ctx.fillStyle = (idx === hoveredIdx) ? (isDark ? '#f8fafc' : '#0f172a') : textColor;
        ctx.font = (idx === hoveredIdx) ? '600 11px sans-serif' : '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(item.label, centerX, padding.top + chartH + 10);
      });

      this.drawChartLegend(ctx, width - padding.right, padding.top - 12, [
        { label: 'Economia (+)', color: posColor },
        { label: 'Déficit (-)', color: negColor }
      ]);
    };

    draw(-1);

    const tooltip = this.getTooltip(canvas);
    if (canvas._savMouseHandler) {
      canvas.removeEventListener('mousemove', canvas._savMouseHandler);
      canvas.removeEventListener('mouseleave', canvas._savLeaveHandler);
    }

    const onMove = (e) => {
      const cRect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - cRect.left;
      const mouseY = e.clientY - cRect.top;
      const groupWidth = chartW / series.length;
      if (mouseX >= padding.left && mouseX <= padding.left + chartW && mouseY >= padding.top && mouseY <= padding.top + chartH + 20) {
        const idx = Math.floor((mouseX - padding.left) / groupWidth);
        if (idx >= 0 && idx < series.length) {
          const d = series[idx];
          draw(idx);
          if (tooltip) {
            const isPos = d.savings >= 0;
            tooltip.innerHTML = `
              <div style="font-weight: 700; margin-bottom: 4px; border-bottom: 1px solid var(--border-color); padding-bottom: 2px;">${Utils.escapeHtml(d.fullLabel || d.label)}</div>
              <div style="display: flex; justify-content: space-between; gap: 12px;">
                <span>Receitas:</span> <strong style="color: var(--color-income);">${Utils.formatCurrency(d.income)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 12px;">
                <span>Despesas:</span> <strong style="color: var(--color-expense);">${Utils.formatCurrency(d.expense)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 12px; margin-top: 2px; font-weight: 700; color: ${isPos ? 'var(--color-income)' : 'var(--color-expense)'};">
                <span>${isPos ? 'Economizado:' : 'Déficit:'}</span> <strong>${Utils.formatCurrency(d.savings)} (${d.savingsRatePct}%)</strong>
              </div>
            `;
            tooltip.style.left = `${mouseX}px`;
            tooltip.style.top = `${mouseY}px`;
            tooltip.classList.add('visible');
          }
          return;
        }
      }
      draw(-1);
      if (tooltip) tooltip.classList.remove('visible');
    };

    const onLeave = () => {
      draw(-1);
      if (tooltip) tooltip.classList.remove('visible');
    };

    canvas._savMouseHandler = onMove;
    canvas._savLeaveHandler = onLeave;
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
  };

  Charts.renderWealthEvolutionChart = function (canvas, points) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.parentElement.clientWidth || 500;
    const height = rect.height || 260;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)';
    const lineColor = '#3b82f6';

    ctx.clearRect(0, 0, width, height);

    if (!points || points.length < 2) {
      ctx.fillStyle = textColor;
      ctx.font = '500 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Ainda faltam registros históricos em datas distintas para traçar a curva de evolução.', width / 2, height / 2);
      return;
    }

    const padding = { top: 24, right: 26, bottom: 42, left: 74 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    let maxVal = 0;
    let minVal = Infinity;
    points.forEach(p => {
      const v = Number(p.value) || 0;
      if (v > maxVal) maxVal = v;
      if (v < minVal) minVal = v;
    });
    if (minVal === Infinity) minVal = 0;
    const topBound = Math.ceil((maxVal || 1000) * 1.12);
    const lowBound = Math.max(0, Math.floor(minVal * 0.85));
    const range = (topBound - lowBound) || 1;

    const getX = (idx) => padding.left + (points.length === 1 ? chartW / 2 : (idx / (points.length - 1)) * chartW);
    const getY = (val) => padding.top + chartH - (((val - lowBound) / range) * chartH);

    const draw = (hoveredIdx = -1) => {
      ctx.clearRect(0, 0, width, height);

      const steps = 4;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let i = 0; i <= steps; i++) {
        const v = lowBound + (range * (i / steps));
        const y = getY(v);
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartW, y);
        ctx.stroke();

        ctx.fillStyle = textColor;
        const lbl = v >= 1000 ? `R$ ${(v / 1000).toFixed(1)}k` : `R$ ${Math.round(v)}`;
        ctx.fillText(lbl, padding.left - 8, y);
      }

      // Área preenchida
      const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      grad.addColorStop(0, 'rgba(59, 130, 246, 0.28)');
      grad.addColorStop(1, 'rgba(59, 130, 246, 0.01)');

      ctx.beginPath();
      points.forEach((p, idx) => {
        const x = getX(idx);
        const y = getY(p.value);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.lineTo(getX(points.length - 1), padding.top + chartH);
      ctx.lineTo(getX(0), padding.top + chartH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Linha principal
      ctx.beginPath();
      points.forEach((p, idx) => {
        const x = getX(idx);
        const y = getY(p.value);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Pontos e rótulos do eixo X
      const labelStep = Math.max(1, Math.ceil(points.length / 6));
      points.forEach((p, idx) => {
        const x = getX(idx);
        const y = getY(p.value);
        const isHov = idx === hoveredIdx;

        ctx.beginPath();
        ctx.arc(x, y, isHov ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = isHov ? '#10b981' : lineColor;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = isDark ? '#111827' : '#ffffff';
        ctx.stroke();

        if (idx % labelStep === 0 || idx === points.length - 1) {
          ctx.fillStyle = textColor;
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(p.label, x, padding.top + chartH + 10);
        }
      });
    };

    draw(-1);
  };

  // =========================================================================
  // MOTOR DE INTELIGÊNCIA FINANCEIRA (Cálculos Reais, Auditáveis e Sem Dados Fictícios)
  // =========================================================================
  const FinancialIntelligenceEngine = {
    analyze(customInput = null) {
      const now = new Date();
      const input = customInput || {};
      const selMonth = input.month !== undefined ? input.month : (State.dashboardFilter.month === 'all' ? (now.getMonth() + 1) : State.dashboardFilter.month);
      const selYear = input.year !== undefined ? parseInt(input.year, 10) : (State.dashboardFilter.year || now.getFullYear());
      const isAllMonths = selMonth === 'all';
      const monthNum = isAllMonths ? null : parseInt(selMonth, 10);

      // Leitura isolada dos dados reais do usuário atual (sem duplicar IDs)
      const rawTransactions = Array.isArray(input.transactions) ? input.transactions : Storage.getTransactions();
      const seenTxIds = new Set();
      const allTransactions = [];
      for (const tx of rawTransactions) {
        if (!tx || !tx.date) continue;
        const txId = tx.id || `${tx.date}_${tx.type}_${tx.amount}_${tx.description}`;
        if (seenTxIds.has(txId)) continue;
        seenTxIds.add(txId);
        const amt = Math.abs(Number(tx.amount) || 0);
        if (amt <= 0) continue;
        allTransactions.push({ ...tx, amount: Math.round(amt * 100) / 100 });
      }

      const categories = Array.isArray(input.categories) ? input.categories : Storage.getCategories();
      const caixinhas = Array.isArray(input.caixinhas) ? input.caixinhas : Storage.getCaixinhas();
      const investments = Array.isArray(input.investments) ? input.investments : Storage.getInvestments();
      const investmentTransactions = Array.isArray(input.investmentTransactions) ? input.investmentTransactions : Storage.getInvestmentTransactions();
      const dividends = Array.isArray(input.dividends) ? input.dividends : Storage.getDividends();
      const investmentGoals = Array.isArray(input.investmentGoals) ? input.investmentGoals : Storage.getInvestmentGoals();
      const portfolioSnapshots = Array.isArray(input.portfolioSnapshots) ? input.portfolioSnapshots : Storage.getPortfolioSnapshots();

      const catMap = new Map(categories.map(c => [c.id, c]));
      const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

      // Agrupamento histórico real por mês (YYYY-MM)
      const monthsMap = new Map();
      for (const tx of allTransactions) {
        const parts = String(tx.date).split('-');
        if (parts.length < 2) continue;
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        if (!y || !m || m < 1 || m > 12) continue;
        const key = `${y}-${String(m).padStart(2, '0')}`;
        if (!monthsMap.has(key)) {
          monthsMap.set(key, {
            key,
            year: y,
            month: m,
            label: `${Utils.getMonthShortName(m - 1)}/${String(y).slice(-2)}`,
            fullLabel: `${Utils.getMonthName(m - 1)} de ${y}`,
            income: 0,
            expense: 0,
            txCount: 0,
            transactions: []
          });
        }
        const bucket = monthsMap.get(key);
        if (tx.type === 'income') bucket.income = r2(bucket.income + tx.amount);
        else if (tx.type === 'expense') bucket.expense = r2(bucket.expense + tx.amount);
        bucket.txCount += 1;
        bucket.transactions.push(tx);
      }

      const activeMonths = Array.from(monthsMap.values())
        .sort((a, b) => a.key.localeCompare(b.key))
        .map(m => {
          const savings = r2(m.income - m.expense);
          const savingsRatePct = m.income > 0 ? Math.round((savings / m.income) * 1000) / 10 : 0;
          return { ...m, savings, savingsRatePct };
        });

      const activeMonthsCount = activeMonths.length;

      // Transações do período selecionado
      const periodTransactions = allTransactions.filter(tx => {
        const [tY, tM] = String(tx.date).split('-').map(n => parseInt(n, 10));
        if (tY !== selYear) return false;
        if (!isAllMonths && tM !== monthNum) return false;
        return true;
      });

      // Mês imediatamente anterior (quando um mês específico está selecionado)
      let prevMonth = null;
      let prevYear = null;
      let prevPeriodTransactions = [];
      let prevPeriodLabel = '';

      if (!isAllMonths) {
        prevMonth = monthNum === 1 ? 12 : monthNum - 1;
        prevYear = monthNum === 1 ? selYear - 1 : selYear;
        prevPeriodLabel = `${Utils.getMonthName(prevMonth - 1)} de ${prevYear}`;
        prevPeriodTransactions = allTransactions.filter(tx => {
          const [tY, tM] = String(tx.date).split('-').map(n => parseInt(n, 10));
          return tY === prevYear && tM === prevMonth;
        });
      } else {
        prevYear = selYear - 1;
        prevPeriodLabel = `Ano de ${prevYear}`;
        prevPeriodTransactions = allTransactions.filter(tx => {
          const [tY] = String(tx.date).split('-').map(n => parseInt(n, 10));
          return tY === prevYear;
        });
      }

      let income = 0;
      let expense = 0;
      let incomeCount = 0;
      let expenseCount = 0;

      for (const tx of periodTransactions) {
        if (tx.type === 'income') {
          income = r2(income + tx.amount);
          incomeCount++;
        } else if (tx.type === 'expense') {
          expense = r2(expense + tx.amount);
          expenseCount++;
        }
      }

      let prevIncome = 0;
      let prevExpense = 0;
      for (const tx of prevPeriodTransactions) {
        if (tx.type === 'income') prevIncome = r2(prevIncome + tx.amount);
        else if (tx.type === 'expense') prevExpense = r2(prevExpense + tx.amount);
      }

      const hasPeriodData = periodTransactions.length > 0 && (income > 0 || expense > 0);
      const hasPreviousMonthData = prevPeriodTransactions.length > 0 && (prevIncome > 0 || prevExpense > 0);

      const monthlySavings = r2(income - expense);
      const savingsRatePct = income > 0 ? Math.round((monthlySavings / income) * 1000) / 10 : (expense > 0 ? -100 : 0);
      const incomeCommitmentPct = income > 0 ? Math.round((expense / income) * 1000) / 10 : (expense > 0 ? null : 0);

      const expenseDelta = hasPreviousMonthData ? r2(expense - prevExpense) : null;
      const expenseDeltaPct = (hasPreviousMonthData && prevExpense > 0)
        ? Math.round(((expense - prevExpense) / prevExpense) * 1000) / 10
        : null;

      const incomeDelta = hasPreviousMonthData ? r2(income - prevIncome) : null;
      const incomeDeltaPct = (hasPreviousMonthData && prevIncome > 0)
        ? Math.round(((income - prevIncome) / prevIncome) * 1000) / 10
        : null;

      // Médias históricas reais nos meses com movimentação
      const avgMonthlyIncome = activeMonthsCount > 0
        ? r2(activeMonths.reduce((s, m) => s + m.income, 0) / activeMonthsCount)
        : 0;
      const avgMonthlyExpense = activeMonthsCount > 0
        ? r2(activeMonths.reduce((s, m) => s + m.expense, 0) / activeMonthsCount)
        : 0;
      const avgMonthlySavings = activeMonthsCount > 0
        ? r2(activeMonths.reduce((s, m) => s + m.savings, 0) / activeMonthsCount)
        : 0;

      // Análise detalhada de despesas por categoria (Período atual vs Período anterior)
      const curCatTotals = new Map();
      const curCatCounts = new Map();
      for (const tx of periodTransactions) {
        if (tx.type !== 'expense') continue;
        const cId = tx.categoryId || 'unknown';
        curCatTotals.set(cId, r2((curCatTotals.get(cId) || 0) + tx.amount));
        curCatCounts.set(cId, (curCatCounts.get(cId) || 0) + 1);
      }

      const prevCatTotals = new Map();
      for (const tx of prevPeriodTransactions) {
        if (tx.type !== 'expense') continue;
        const cId = tx.categoryId || 'unknown';
        prevCatTotals.set(cId, r2((prevCatTotals.get(cId) || 0) + tx.amount));
      }

      const allExpenseCatIds = new Set([...curCatTotals.keys(), ...prevCatTotals.keys()]);
      const categoryComparison = [];

      allExpenseCatIds.forEach(catId => {
        const cat = catMap.get(catId) || { id: catId, name: 'Outros', icon: '🏷️', color: '#64748b' };
        const amount = curCatTotals.get(catId) || 0;
        const prevAmount = prevCatTotals.get(catId) || 0;
        const count = curCatCounts.get(catId) || 0;
        const percentageOfExpense = expense > 0 ? Math.round((amount / expense) * 1000) / 10 : 0;
        const percentageOfIncome = income > 0 ? Math.round((amount / income) * 1000) / 10 : null;
        const delta = hasPreviousMonthData ? r2(amount - prevAmount) : null;
        const deltaPct = (hasPreviousMonthData && prevAmount > 0)
          ? Math.round(((amount - prevAmount) / prevAmount) * 1000) / 10
          : null;

        categoryComparison.push({
          id: catId,
          name: cat.name,
          icon: cat.icon || '🏷️',
          color: cat.color || '#3b82f6',
          amount,
          prevAmount,
          count,
          percentage: percentageOfExpense,
          percentageOfExpense,
          percentageOfIncome,
          delta,
          deltaPct
        });
      });

      const categoryBreakdown = categoryComparison
        .filter(c => c.amount > 0)
        .sort((a, b) => b.amount - a.amount);

      const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

      // Categorias que tiveram aumento de despesas em relação ao período anterior
      const increasedCategories = hasPreviousMonthData
        ? categoryComparison
            .filter(c => c.amount > 0 && c.delta > 0)
            .sort((a, b) => b.delta - a.delta)
        : [];

      // Possíveis gastos excessivos (alta concentração > 35% das despesas, > 30% da renda, ou salto > 25% vs mês anterior)
      const excessiveCategories = categoryBreakdown.filter(c => {
        const highShareOfExpense = categoryBreakdown.length > 1 && c.percentageOfExpense >= 38;
        const highShareOfIncome = c.percentageOfIncome !== null && c.percentageOfIncome >= 32;
        const sharpIncrease = c.deltaPct !== null && c.deltaPct >= 25 && c.delta >= 50;
        return highShareOfExpense || highShareOfIncome || sharpIncrease;
      });

      // Resumo de Caixinhas, Investimentos e Metas
      const totalCaixinhasSaved = r2(caixinhas.reduce((s, c) => s + (Number(c.currentAmount) || 0), 0));
      const totalCaixinhasTarget = r2(caixinhas.reduce((s, c) => s + (Number(c.targetAmount) || 0), 0));
      const caixinhasProgressPct = totalCaixinhasTarget > 0
        ? Math.min(100, Math.round((totalCaixinhasSaved / totalCaixinhasTarget) * 1000) / 10)
        : null;

      let totalInvestedCost = 0;
      let totalInvestmentsValue = 0;
      investments.forEach(inv => {
        if (!inv) return;
        if (inv.status === 'closed') return;
        if (inv.type !== 'fixed' && (Number(inv.quantity) || 0) <= 0) return;
        if (inv.type === 'fixed' && Storage.getAppliedAmount(inv) <= 0) return;
        const cost = Storage.getCostBasis(inv);
        totalInvestedCost = r2(totalInvestedCost + cost);
        if (inv.type === 'fixed') {
          const acc = Storage.getAccumulatedYield(inv);
          totalInvestmentsValue = r2(totalInvestmentsValue + (acc !== null ? cost + acc : cost));
        } else {
          const mv = Storage.getMarketValue(inv);
          totalInvestmentsValue = r2(totalInvestmentsValue + (mv !== null ? mv : cost));
        }
      });

      const periodDividends = r2(
        dividends
          .filter(d => {
            if (!d || !d.date) return false;
            const [dY, dM] = String(d.date).split('-').map(n => parseInt(n, 10));
            return dY === selYear && (isAllMonths || dM === monthNum);
          })
          .reduce((s, d) => s + (Number(d.amount) || 0), 0)
      );

      // Série real para Evolução do Patrimônio Investido (sem inventar dados)
      const wealthSeries = [];
      if (portfolioSnapshots && portfolioSnapshots.length >= 2) {
        const sortedSnaps = [...portfolioSnapshots]
          .filter(s => s && s.date && Number(s.value) > 0)
          .sort((a, b) => String(a.date).localeCompare(String(b.date)));
        sortedSnaps.forEach(s => {
          wealthSeries.push({
            date: s.date,
            label: Utils.formatDateShort(s.date),
            value: r2(s.value)
          });
        });
      } else if (investmentTransactions && investmentTransactions.length >= 2) {
        // Constrói evolução real de aportes acumulados por mês a partir de investment_transactions reais
        const txByMonth = new Map();
        const sortedInvTx = [...investmentTransactions]
          .filter(t => t && t.date && Number(t.totalAmount) > 0)
          .sort((a, b) => String(a.date).localeCompare(String(b.date)));
        let runningInvested = 0;
        sortedInvTx.forEach(t => {
          const [y, m] = String(t.date).split('-').map(n => parseInt(n, 10));
          if (!y || !m) return;
          const key = `${y}-${String(m).padStart(2, '0')}`;
          const delta = t.type === 'sell' ? -(Number(t.costOfSold) || Number(t.totalAmount) || 0) : (Number(t.totalAmount) || 0);
          runningInvested = Math.max(0, r2(runningInvested + delta));
          txByMonth.set(key, {
            date: key,
            label: `${Utils.getMonthShortName(m - 1)}/${String(y).slice(-2)}`,
            value: runningInvested
          });
        });
        if (txByMonth.size >= 2) {
          txByMonth.forEach(v => wealthSeries.push(v));
        }
      }

      // =====================================================================
      // 4. CÁLCULO DO INDICADOR DE SAÚDE FINANCEIRA (0 A 100)
      // =====================================================================
      const health = this._computeHealthScore({
        hasPeriodData,
        income,
        expense,
        monthlySavings,
        savingsRatePct,
        incomeCommitmentPct,
        periodTransactions,
        categoryBreakdown,
        excessiveCategories,
        hasPreviousMonthData,
        expenseDeltaPct,
        caixinhas,
        totalCaixinhasSaved,
        caixinhasProgressPct,
        investments,
        totalInvestmentsValue,
        investmentGoals
      });

      // =====================================================================
      // 3. GERAÇÃO DE INSIGHTS INTELIGENTES (Baseados em Dados Reais)
      // =====================================================================
      const insights = this._generateSmartInsights({
        hasPeriodData,
        isAllMonths,
        selMonth: monthNum,
        selYear,
        prevPeriodLabel,
        income,
        expense,
        monthlySavings,
        savingsRatePct,
        incomeCommitmentPct,
        topCategory,
        increasedCategories,
        excessiveCategories,
        hasPreviousMonthData,
        expenseDelta,
        expenseDeltaPct,
        activeMonthsCount,
        avgMonthlyExpense,
        avgMonthlySavings,
        totalCaixinhasSaved,
        totalInvestmentsValue,
        periodDividends
      });

      // =====================================================================
      // 5. SEÇÃO "O QUE POSSO MELHORAR?" (Recomendações Calculadas)
      // =====================================================================
      const improvements = this._generatePersonalizedImprovements({
        hasPeriodData,
        income,
        expense,
        monthlySavings,
        categoryBreakdown,
        increasedCategories,
        caixinhas,
        investmentGoals,
        totalInvestmentsValue
      });

      // =====================================================================
      // PROJEÇÕES DE ECONOMIA PARA OS PRÓXIMOS MESES (3, 6 e 12 meses)
      // =====================================================================
      const potentialReduction10 = r2(expense * 0.10);
      const potentialReduction15 = r2(expense * 0.15);
      const baseMonthlySavingForProjection = monthlySavings > 0 ? monthlySavings : 0;
      const optimizedMonthlySaving10 = Math.max(0, r2(monthlySavings + potentialReduction10));

      const projections = {
        hasProjectionData: hasPeriodData && (income > 0 || expense > 0),
        currentMonthlySaving: monthlySavings,
        potentialReduction10,
        potentialReduction15,
        optimizedMonthlySaving10,
        horizons: [
          {
            months: 3,
            label: 'Em 3 Meses',
            currentAccumulated: r2(baseMonthlySavingForProjection * 3),
            optimizedAccumulated: r2(optimizedMonthlySaving10 * 3),
            extraSaved: r2(potentialReduction10 * 3)
          },
          {
            months: 6,
            label: 'Em 6 Meses',
            currentAccumulated: r2(baseMonthlySavingForProjection * 6),
            optimizedAccumulated: r2(optimizedMonthlySaving10 * 6),
            extraSaved: r2(potentialReduction10 * 6)
          },
          {
            months: 12,
            label: 'Em 12 Meses (1 Ano)',
            currentAccumulated: r2(baseMonthlySavingForProjection * 12),
            optimizedAccumulated: r2(optimizedMonthlySaving10 * 12),
            extraSaved: r2(potentialReduction10 * 12)
          }
        ]
      };

      // Evolução mensal do ano selecionado para o gráfico de barras Receitas x Despesas
      const yearlyMonthlyEvolution = State.getMonthlyEvolution(allTransactions, selYear);
      const activeMonthsInSelectedYear = yearlyMonthlyEvolution.filter(m => m.income > 0 || m.expense > 0).length;

      return {
        period: {
          month: selMonth,
          year: selYear,
          isAllMonths,
          label: isAllMonths ? `Ano de ${selYear}` : `${Utils.getMonthName(monthNum - 1)} de ${selYear}`,
          prevLabel: prevPeriodLabel
        },
        hasPeriodData,
        hasPreviousMonthData,
        activeMonthsCount,
        activeMonthsInSelectedYear,
        activeMonths,
        yearlyMonthlyEvolution,
        metrics: {
          income,
          expense,
          monthlySavings,
          savingsRatePct,
          incomeCommitmentPct,
          txCount: periodTransactions.length,
          incomeCount,
          expenseCount,
          prevIncome,
          prevExpense,
          expenseDelta,
          expenseDeltaPct,
          incomeDelta,
          incomeDeltaPct,
          avgMonthlyIncome,
          avgMonthlyExpense,
          avgMonthlySavings,
          totalCaixinhasSaved,
          totalCaixinhasTarget,
          caixinhasProgressPct,
          totalInvestedCost,
          totalInvestmentsValue,
          periodDividends
        },
        categoryBreakdown,
        categoryComparison,
        topCategory,
        increasedCategories,
        excessiveCategories,
        wealthSeries,
        health,
        insights,
        improvements,
        projections
      };
    },

    _computeHealthScore(ctx) {
      if (!ctx.hasPeriodData) {
        return {
          hasSufficientData: false,
          score: null,
          classification: 'Dados Insuficientes',
          badgeClass: 'neutral',
          color: '#64748b',
          summaryText: 'Não há receitas ou despesas registradas neste período. Cadastre suas movimentações para que o sistema calcule sua pontuação de saúde financeira com precisão.',
          factors: []
        };
      }

      const {
        income,
        expense,
        monthlySavings,
        savingsRatePct,
        incomeCommitmentPct,
        periodTransactions,
        categoryBreakdown,
        excessiveCategories,
        hasPreviousMonthData,
        expenseDeltaPct,
        caixinhas,
        totalCaixinhasSaved,
        caixinhasProgressPct,
        investments,
        totalInvestmentsValue,
        investmentGoals
      } = ctx;

      const factors = [];

      // 1. Equilíbrio entre receitas e despesas (0 a 30 pontos)
      let balancePts = 0;
      let balanceDesc = '';
      if (income > 0 && expense === 0) {
        balancePts = 30;
        balanceDesc = `Você registrou ${Utils.formatCurrency(income)} em receitas e nenhuma despesa no período.`;
      } else if (income > 0) {
        const ratio = expense / income;
        if (ratio <= 0.65) {
          balancePts = 30;
          balanceDesc = `Excelente equilíbrio: suas despesas consomem apenas ${incomeCommitmentPct}% da sua renda.`;
        } else if (ratio <= 0.80) {
          balancePts = Math.round(30 - ((ratio - 0.65) / 0.15) * 7); // 23..30
          balanceDesc = `Bom equilíbrio: ${incomeCommitmentPct}% da renda está comprometida com despesas.`;
        } else if (ratio <= 1.0) {
          balancePts = Math.round(22 - ((ratio - 0.80) / 0.20) * 14); // 8..22
          balanceDesc = `Orçamento apertado: ${incomeCommitmentPct}% da sua renda foi consumida por despesas.`;
        } else {
          const overRatio = ratio - 1.0;
          balancePts = Math.max(0, Math.round(6 - overRatio * 15));
          balanceDesc = `Déficit no período: as despesas (${Utils.formatCurrency(expense)}) superaram as receitas (${Utils.formatCurrency(income)}) em ${Utils.formatCurrency(expense - income)}.`;
        }
      } else {
        balancePts = 0;
        balanceDesc = `Foram registradas despesas de ${Utils.formatCurrency(expense)}, mas nenhuma receita foi informada neste período.`;
      }
      factors.push({
        id: 'balance',
        name: 'Equilíbrio Receitas x Despesas',
        points: balancePts,
        maxPoints: 30,
        color: balancePts >= 23 ? '#10b981' : balancePts >= 12 ? '#f59e0b' : '#ef4444',
        description: balanceDesc
      });

      // 2. Capacidade de economizar (0 a 25 pontos)
      let savingsPts = 0;
      let savingsDesc = '';
      if (income > 0 && monthlySavings > 0) {
        if (savingsRatePct >= 25) {
          savingsPts = 25;
          savingsDesc = `Taxa de economia exemplar de ${savingsRatePct}% (${Utils.formatCurrency(monthlySavings)} poupados no período).`;
        } else if (savingsRatePct >= 15) {
          savingsPts = Math.round(17 + ((savingsRatePct - 15) / 10) * 8);
          savingsDesc = `Boa capacidade de poupança: você economizou ${savingsRatePct}% da renda (${Utils.formatCurrency(monthlySavings)}).`;
        } else {
          savingsPts = Math.max(4, Math.round((savingsRatePct / 15) * 16));
          savingsDesc = `Economia positiva de ${Utils.formatCurrency(monthlySavings)} (${savingsRatePct}% da renda), mas abaixo da meta recomendada de 20%.`;
        }
      } else if (income > 0 && monthlySavings === 0) {
        savingsPts = 2;
        savingsDesc = 'Todas as receitas do período foram utilizadas, sem sobra para reserva.';
      } else {
        savingsPts = 0;
        savingsDesc = monthlySavings < 0
          ? `Não houve economia neste período devido ao saldo negativo de ${Utils.formatCurrency(monthlySavings)}.`
          : 'Cadastre suas receitas para medir a taxa de economia mensal.';
      }
      factors.push({
        id: 'savings',
        name: 'Capacidade de Economizar',
        points: savingsPts,
        maxPoints: 25,
        color: savingsPts >= 18 ? '#10b981' : savingsPts >= 9 ? '#f59e0b' : '#ef4444',
        description: savingsDesc
      });

      // 3. Controle do orçamento (0 a 20 pontos)
      let budgetPts = 20;
      let budgetDesc = '';
      if (expense === 0) {
        budgetPts = 20;
        budgetDesc = 'Nenhum desvio orçamentário identificado no período.';
      } else {
        if (income > 0 && expense > income) budgetPts -= 10;
        if (excessiveCategories.length > 0) budgetPts -= Math.min(6, excessiveCategories.length * 3);
        if (hasPreviousMonthData && expenseDeltaPct !== null && expenseDeltaPct > 20) budgetPts -= 4;
        budgetPts = Math.max(0, budgetPts);

        if (budgetPts >= 16) {
          budgetDesc = 'Despesas bem distribuídas entre as categorias e dentro do limite da renda.';
        } else if (budgetPts >= 10) {
          budgetDesc = excessiveCategories.length > 0
            ? `Atenção à concentração de gastos em ${excessiveCategories.map(c => c.name).slice(0, 2).join(' e ')}.`
            : 'Houve crescimento relevante nas despesas em relação ao período anterior.';
        } else {
          budgetDesc = 'Orçamento pressionado por gastos acima da receita ou forte concentração em poucas categorias.';
        }
      }
      factors.push({
        id: 'budget',
        name: 'Controle do Orçamento',
        points: budgetPts,
        maxPoints: 20,
        color: budgetPts >= 15 ? '#10b981' : budgetPts >= 9 ? '#f59e0b' : '#ef4444',
        description: budgetDesc
      });

      // 4. Regularidade dos gastos (0 a 15 pontos)
      let regPts = 12;
      let regDesc = '';
      const expenseTxs = periodTransactions.filter(t => t.type === 'expense');
      if (expenseTxs.length === 0) {
        regPts = 15;
        regDesc = 'Sem oscilações atípicas de despesas no período.';
      } else if (expenseTxs.length === 1) {
        regPts = income >= expense ? 13 : 7;
        regDesc = `Apenas 1 despesa registrada (${Utils.formatCurrency(expenseTxs[0].amount)}) no período.`;
      } else {
        const maxSingleExpense = Math.max(...expenseTxs.map(t => t.amount));
        const singleShare = expense > 0 ? (maxSingleExpense / expense) : 0;
        if (singleShare <= 0.45) {
          regPts = 15;
          regDesc = `Boa regularidade ao longo de ${expenseTxs.length} despesas registradas, sem picos isolados extremos.`;
        } else if (singleShare <= 0.70) {
          regPts = 11;
          regDesc = `Uma única transação representou ${Math.round(singleShare * 100)}% do total gasto no período.`;
        } else {
          regPts = 7;
          regDesc = `Alta concentração: um único lançamento absorveu ${Math.round(singleShare * 100)}% das despesas do mês.`;
        }
      }
      factors.push({
        id: 'regularity',
        name: 'Regularidade dos Gastos',
        points: regPts,
        maxPoints: 15,
        color: regPts >= 12 ? '#10b981' : regPts >= 8 ? '#f59e0b' : '#ef4444',
        description: regDesc
      });

      // 5. Cumprimento de metas e construção de patrimônio (0 a 10 pontos)
      let goalsPts = 0;
      let goalsDesc = '';
      const hasCaixinhas = caixinhas.length > 0 && totalCaixinhasSaved > 0;
      const hasInvestments = investments.length > 0 && totalInvestmentsValue > 0;
      const hasGoals = caixinhas.length > 0 || investmentGoals.length > 0;

      if (hasCaixinhas && hasInvestments) {
        goalsPts = 10;
        goalsDesc = `Patrimônio ativo em Caixinhas (${Utils.formatCurrency(totalCaixinhasSaved)}) e Investimentos (${Utils.formatCurrency(totalInvestmentsValue)}).`;
      } else if (hasCaixinhas || hasInvestments) {
        goalsPts = 8;
        goalsDesc = hasCaixinhas
          ? `Você possui ${Utils.formatCurrency(totalCaixinhasSaved)} acumulados em Caixinhas (${caixinhasProgressPct || 0}% das metas).`
          : `Você possui ${Utils.formatCurrency(totalInvestmentsValue)} alocados na carteira de investimentos.`;
      } else if (hasGoals) {
        goalsPts = monthlySavings > 0 ? 5 : 3;
        goalsDesc = 'Você já definiu metas financeiras, mas ainda precisa realizar aportes para avançar nelas.';
      } else {
        goalsPts = monthlySavings > 0 ? 5 : 2;
        goalsDesc = 'Crie metas em Caixinhas ou Investimentos para acompanhar a evolução do seu patrimônio.';
      }
      factors.push({
        id: 'goals',
        name: 'Cumprimento de Metas & Reservas',
        points: goalsPts,
        maxPoints: 10,
        color: goalsPts >= 8 ? '#10b981' : goalsPts >= 5 ? '#3b82f6' : '#f59e0b',
        description: goalsDesc
      });

      const totalScore = Math.max(0, Math.min(100, Math.round(balancePts + savingsPts + budgetPts + regPts + goalsPts)));

      let classification = 'Crítica';
      let badgeClass = 'critical';
      let color = '#ef4444';
      let summaryText = '';

      if (totalScore >= 80) {
        classification = 'Excelente';
        badgeClass = 'excellent';
        color = '#10b981';
        summaryText = 'Suas finanças estão muito bem equilibradas! Suas receitas superam com folga as despesas e você mantém boa margem de economia.';
      } else if (totalScore >= 60) {
        classification = 'Boa';
        badgeClass = 'good';
        color = '#3b82f6';
        summaryText = 'Sua saúde financeira é positiva e as contas estão sob controle, com oportunidades pontuais para ampliar sua taxa de economia.';
      } else if (totalScore >= 40) {
        classification = 'Atenção';
        badgeClass = 'warning';
        color = '#f59e0b';
        summaryText = 'Seu orçamento requer atenção: a margem de economia está baixa ou determinadas categorias estão consumindo grande parte da renda.';
      } else {
        classification = 'Crítica';
        badgeClass = 'critical';
        color = '#ef4444';
        summaryText = 'Alerta financeiro: suas despesas superaram ou comprometeram quase toda a receita do período. Revise os maiores gastos imediatamente.';
      }

      return {
        hasSufficientData: true,
        score: totalScore,
        classification,
        badgeClass,
        color,
        summaryText,
        factors
      };
    },

    _generateSmartInsights(ctx) {
      const insights = [];
      const {
        hasPeriodData,
        selYear,
        prevPeriodLabel,
        income,
        expense,
        monthlySavings,
        savingsRatePct,
        incomeCommitmentPct,
        topCategory,
        increasedCategories,
        excessiveCategories,
        hasPreviousMonthData,
        expenseDelta,
        expenseDeltaPct,
        activeMonthsCount,
        avgMonthlyExpense,
        totalCaixinhasSaved,
        totalInvestmentsValue
      } = ctx;

      if (!hasPeriodData) {
        insights.push({
          type: 'info',
          icon: '📊',
          tag: 'Aguardando Movimentações',
          title: 'Sem transações registradas neste período',
          text: 'Adicione suas receitas e despesas do mês para destravar insights automáticos sobre categorias, comprometimento da renda e projeções.'
        });
        return insights;
      }

      // 1. Categoria em que o usuário mais gasta
      if (topCategory) {
        const incText = topCategory.percentageOfIncome !== null
          ? ` (equivalente a ${topCategory.percentageOfIncome}% da sua receita do período)`
          : '';
        insights.push({
          type: topCategory.percentageOfExpense >= 40 ? 'warning' : 'info',
          icon: topCategory.icon || '🏷️',
          tag: 'Maior Gasto do Período',
          title: `${topCategory.name}: ${Utils.formatCurrency(topCategory.amount)}`,
          text: `Esta é a categoria em que você mais gastou neste período, representando ${topCategory.percentageOfExpense}% de todas as despesas${incText} em ${topCategory.count} lançamento(s).`
        });
      } else {
        insights.push({
          type: 'positive',
          icon: '✨',
          tag: 'Despesas do Período',
          title: 'Nenhuma despesa registrada neste mês',
          text: `Você registrou ${Utils.formatCurrency(income)} em receitas e ainda não lançou despesas neste período.`
        });
      }

      // 2. Quanto da renda está comprometida + Quanto economizou
      if (income > 0) {
        if (monthlySavings >= 0) {
          insights.push({
            type: incomeCommitmentPct <= 75 ? 'positive' : 'warning',
            icon: incomeCommitmentPct <= 75 ? '🛡️' : '⚠️',
            tag: 'Comprometimento da Renda & Economia',
            title: `${incomeCommitmentPct}% da renda comprometida | Economizou ${Utils.formatCurrency(monthlySavings)}`,
            text: `Das suas receitas de ${Utils.formatCurrency(income)}, você utilizou ${Utils.formatCurrency(expense)} em despesas e preservou ${Utils.formatCurrency(monthlySavings)} (${savingsRatePct}% de economia).`
          });
        } else {
          insights.push({
            type: 'danger',
            icon: '🚨',
            tag: 'Comprometimento Acima do Limite',
            title: `${incomeCommitmentPct}% da renda comprometida (Déficit de ${Utils.formatCurrency(Math.abs(monthlySavings))})`,
            text: `Suas despesas (${Utils.formatCurrency(expense)}) ultrapassaram suas receitas (${Utils.formatCurrency(income)}) em ${Utils.formatCurrency(Math.abs(monthlySavings))}. Evite novos gastos não essenciais.`
          });
        }
      } else if (expense > 0) {
        insights.push({
          type: 'warning',
          icon: '💡',
          tag: 'Receitas Não Informadas',
          title: `Gastos de ${Utils.formatCurrency(expense)} sem receita cadastrada no período`,
          text: 'Cadastre seu salário ou entradas do mês para calcular exatamente quanto da sua renda está comprometida.'
        });
      }

      // 3. Comparação dos gastos com o mês anterior
      if (hasPreviousMonthData) {
        if (expenseDelta === 0) {
          insights.push({
            type: 'info',
            icon: '⚖️',
            tag: 'Comparação com Período Anterior',
            title: `Gastos estáveis em relação a ${prevPeriodLabel}`,
            text: `Suas despesas permaneceram exatamente em ${Utils.formatCurrency(expense)}.`
          });
        } else if (expenseDelta > 0) {
          const pctStr = expenseDeltaPct !== null ? ` (+${expenseDeltaPct}%)` : '';
          insights.push({
            type: expenseDeltaPct !== null && expenseDeltaPct > 15 ? 'warning' : 'info',
            icon: '📈',
            tag: 'Comparação com Período Anterior',
            title: `Despesas subiram ${Utils.formatCurrency(expenseDelta)}${pctStr}`,
            text: `Em ${prevPeriodLabel}, seus gastos foram de ${Utils.formatCurrency(ctx.prevExpense || (expense - expenseDelta))}; neste período passaram para ${Utils.formatCurrency(expense)}.`
          });
        } else {
          const absDiff = Math.abs(expenseDelta);
          const pctStr = expenseDeltaPct !== null ? ` (${expenseDeltaPct}%)` : '';
          insights.push({
            type: 'positive',
            icon: '📉',
            tag: 'Comparação com Período Anterior',
            title: `Você reduziu seus gastos em ${Utils.formatCurrency(absDiff)}${pctStr}`,
            text: `Excelente evolução! Suas despesas caíram em comparação a ${prevPeriodLabel}.`
          });
        }
      } else {
        insights.push({
          type: 'info',
          icon: '🗓️',
          tag: 'Histórico Comparativo',
          title: activeMonthsCount <= 1 ? 'Primeiro mês com movimentações registradas' : `Sem registros em ${prevPeriodLabel}`,
          text: activeMonthsCount <= 1
            ? 'Como você possui apenas um mês de histórico cadastrado, a comparação automática com o mês anterior será exibida assim que houver movimentações em mais de um mês.'
            : `Não há transações registradas em ${prevPeriodLabel} para comparação direta mês a mês.`
        });
      }

      // 4. Categorias que tiveram aumento de despesas
      if (hasPreviousMonthData && increasedCategories.length > 0) {
        const topInc = increasedCategories[0];
        const othersCount = increasedCategories.length - 1;
        const pctLabel = topInc.deltaPct !== null ? ` (+${topInc.deltaPct}%)` : ' (sem gasto no mês anterior)';
        insights.push({
          type: 'warning',
          icon: topInc.icon || '⬆️',
          tag: 'Aumento por Categoria',
          title: `${topInc.name} aumentou ${Utils.formatCurrency(topInc.delta)}${pctLabel}`,
          text: `Passou de ${Utils.formatCurrency(topInc.prevAmount)} para ${Utils.formatCurrency(topInc.amount)}.${othersCount > 0 ? ` Outra(s) ${othersCount} categoria(s) também tiveram alta (${increasedCategories.slice(1, 3).map(c => c.name).join(', ')}).` : ''}`
        });
      }

      // 5. Possíveis gastos excessivos ou comparação com média histórica
      if (excessiveCategories.length > 0) {
        const exc = excessiveCategories[0];
        insights.push({
          type: 'danger',
          icon: '🔎',
          tag: 'Possível Gasto Excessivo Detectado',
          title: `Alta concentração em ${exc.name} (${exc.percentageOfExpense}% dos gastos)`,
          text: `O valor de ${Utils.formatCurrency(exc.amount)} em ${exc.name} está pressionando seu orçamento. Reduzir 10% nessa categoria libera ${Utils.formatCurrency(exc.amount * 0.10)}/mês.`
        });
      } else if (activeMonthsCount >= 2 && avgMonthlyExpense > 0 && expense > 0) {
        const diffAvg = expense - avgMonthlyExpense;
        const diffAvgPct = Math.round((diffAvg / avgMonthlyExpense) * 1000) / 10;
        insights.push({
          type: diffAvg <= 0 ? 'positive' : 'info',
          icon: '📊',
          tag: 'Média Histórica Pessoal',
          title: diffAvg <= 0
            ? `Gastos ${Utils.formatCurrency(Math.abs(diffAvg))} abaixo da sua média mensal`
            : `Gastos ${Utils.formatCurrency(diffAvg)} (+${diffAvgPct}%) acima da sua média`,
          text: `Sua média histórica em ${activeMonthsCount} meses ativos é de ${Utils.formatCurrency(avgMonthlyExpense)}/mês em despesas.`
        });
      }

      // 6. Patrimônio & Reservas
      if (totalCaixinhasSaved > 0 || totalInvestmentsValue > 0) {
        const totalPatrimony = totalCaixinhasSaved + totalInvestmentsValue;
        const monthsCoverage = expense > 0 ? (totalPatrimony / expense).toFixed(1).replace('.', ',') : null;
        insights.push({
          type: 'positive',
          icon: '🏦',
          tag: 'Patrimônio & Reserva Financeira',
          title: `${Utils.formatCurrency(totalPatrimony)} acumulados em Reservas e Investimentos`,
          text: monthsCoverage
            ? `Seu patrimônio acumulado (${Utils.formatCurrency(totalCaixinhasSaved)} em Caixinhas + ${Utils.formatCurrency(totalInvestmentsValue)} investidos) equivale a cerca de ${monthsCoverage} vez(es) o seu custo mensal atual.`
            : `Você possui ${Utils.formatCurrency(totalCaixinhasSaved)} em Caixinhas e ${Utils.formatCurrency(totalInvestmentsValue)} em Investimentos.`
        });
      }

      return insights;
    },

    _generatePersonalizedImprovements(ctx) {
      const list = [];
      const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
      const {
        hasPeriodData,
        income,
        expense,
        monthlySavings,
        categoryBreakdown,
        increasedCategories,
        caixinhas,
        investmentGoals,
        totalInvestmentsValue
      } = ctx;

      if (!hasPeriodData || expense === 0) {
        return list;
      }

      // 1. Recomendações calculadas para as maiores categorias de despesa (até 3 categorias principais)
      categoryBreakdown.slice(0, 3).forEach((cat, idx) => {
        const save10 = r2(cat.amount * 0.10);
        const save15 = r2(cat.amount * 0.15);
        const save20 = r2(cat.amount * 0.20);
        const saveYear10 = r2(save10 * 12);

        list.push({
          id: `imp_cat_${cat.id}`,
          icon: cat.icon || '🏷️',
          title: idx === 0 ? `Otimizar ${cat.name} (Seu maior gasto)` : `Reduzir despesas com ${cat.name}`,
          badgeText: `Economize ${Utils.formatCurrency(save10)}/mês`,
          mainMessage: `Você gastou ${Utils.formatCurrency(cat.amount)} com ${cat.name.toLowerCase()} neste período (${cat.percentageOfExpense}% das despesas). Se reduzir esse valor em 10%, poderá economizar ${Utils.formatCurrency(save10)} por mês e acumular ${Utils.formatCurrency(saveYear10)} em 12 meses.`,
          simulations: [
            { label: 'Redução de 10%', value: `${Utils.formatCurrency(save10)}/mês` },
            { label: 'Redução de 15%', value: `${Utils.formatCurrency(save15)}/mês` },
            { label: 'Em 1 Ano (-10%)', value: Utils.formatCurrency(saveYear10) }
          ]
        });
      });

      // 2. Se o usuário gastou mais do que ganhou (Déficit), mostra o plano exato de reequilíbrio
      if (income > 0 && expense > income) {
        const deficit = r2(expense - income);
        const neededCutPct = Math.min(100, Math.round((deficit / expense) * 1000) / 10);
        list.push({
          id: 'imp_deficit_recovery',
          icon: '⚖️',
          title: 'Plano para Eliminar o Déficit do Mês',
          badgeText: `Ajuste necessário: ${Utils.formatCurrency(deficit)}`,
          mainMessage: `Neste período suas despesas superaram suas receitas em ${Utils.formatCurrency(deficit)}. Para fechar no azul mantendo a renda atual de ${Utils.formatCurrency(income)}, você precisa reduzir ${neededCutPct}% das despesas totais.`,
          simulations: [
            { label: 'Déficit Atual', value: Utils.formatCurrency(deficit) },
            { label: 'Corte Necessário', value: `${neededCutPct}%` },
            { label: 'Teto de Gastos', value: Utils.formatCurrency(income) }
          ]
        });
      }

      // 3. Se alguma categoria subiu em relação ao mês anterior e ainda não foi detalhada no retorno ao patamar anterior
      if (increasedCategories.length > 0 && increasedCategories[0].prevAmount > 0) {
        const inc = increasedCategories[0];
        const extraSpent = r2(inc.delta);
        const annualImpact = r2(extraSpent * 12);
        list.push({
          id: `imp_inc_${inc.id}`,
          icon: '📉',
          title: `Retornar ${inc.name} ao patamar do mês anterior`,
          badgeText: `Libera ${Utils.formatCurrency(extraSpent)}/mês`,
          mainMessage: `Seus gastos com ${inc.name.toLowerCase()} subiram de ${Utils.formatCurrency(inc.prevAmount)} para ${Utils.formatCurrency(inc.amount)}. Voltar ao nível do mês anterior economizará ${Utils.formatCurrency(extraSpent)} por mês (${Utils.formatCurrency(annualImpact)} ao ano).`,
          simulations: [
            { label: 'Mês Anterior', value: Utils.formatCurrency(inc.prevAmount) },
            { label: 'Mês Atual', value: Utils.formatCurrency(inc.amount) },
            { label: 'Economia Anual', value: Utils.formatCurrency(annualImpact) }
          ]
        });
      }

      // 4. Aceleração de Meta / Caixinha ativa com base nos dados reais
      const pendingCaixinha = caixinhas.find(c => (Number(c.targetAmount) || 0) > (Number(c.currentAmount) || 0));
      if (pendingCaixinha) {
        const remaining = r2((Number(pendingCaixinha.targetAmount) || 0) - (Number(pendingCaixinha.currentAmount) || 0));
        const save10Total = r2(expense * 0.10);
        const combinedMonthly = monthlySavings > 0 ? r2(monthlySavings + save10Total) : save10Total;
        const monthsWithOptimization = combinedMonthly > 0 ? Math.ceil(remaining / combinedMonthly) : null;

        list.push({
          id: `imp_goal_${pendingCaixinha.id}`,
          icon: pendingCaixinha.icon || '🎯',
          title: `Acelerar meta: ${pendingCaixinha.name}`,
          badgeText: `Faltam ${Utils.formatCurrency(remaining)}`,
          mainMessage: `Faltam ${Utils.formatCurrency(remaining)} para concluir sua caixinha "${pendingCaixinha.name}". Direcionando uma redução de 10% das suas despesas (${Utils.formatCurrency(save10Total)}/mês)${monthlySavings > 0 ? ` somada à sua economia atual de ${Utils.formatCurrency(monthlySavings)}/mês` : ''}, você poderá atingir essa meta em cerca de ${monthsWithOptimization} mês(es).`,
          simulations: [
            { label: 'Falta Guardar', value: Utils.formatCurrency(remaining) },
            { label: '+10% Economia', value: `+${Utils.formatCurrency(save10Total)}/mês` },
            { label: 'Prazo Estimado', value: monthsWithOptimization ? `~${monthsWithOptimization} mês(es)` : '—' }
          ]
        });
      }

      return list;
    },

    // Suíte de validação automatizada dos 5 cenários exigidos
    runSelfTest() {
      const results = [];
      const cats = DEFAULT_CATEGORIES;

      // 1. Usuário que gasta menos do que ganha
      const r1 = this.analyze({
        month: 11,
        year: 2026,
        categories: cats,
        transactions: [
          { id: 't1', description: 'Salário', amount: 6000, type: 'income', categoryId: 'cat_sal', date: '2026-11-05' },
          { id: 't2', description: 'Aluguel', amount: 1500, type: 'expense', categoryId: 'cat_morad', date: '2026-11-06' },
          { id: 't3', description: 'Supermercado', amount: 800, type: 'expense', categoryId: 'cat_alim', date: '2026-11-10' },
          { id: 't4', description: 'Transporte', amount: 300, type: 'expense', categoryId: 'cat_trans', date: '2026-11-12' }
        ],
        caixinhas: [{ id: 'c1', name: 'Reserva', targetAmount: 10000, currentAmount: 3000 }],
        investments: [],
        investmentTransactions: [],
        dividends: [],
        investmentGoals: [],
        portfolioSnapshots: []
      });
      results.push({
        scenario: '1. Usuário que gasta menos do que ganha',
        passed: r1.metrics.monthlySavings === 3400 && r1.health.hasSufficientData && r1.health.score >= 80 && r1.health.classification === 'Excelente' && r1.topCategory.id === 'cat_morad',
        score: r1.health.score,
        classification: r1.health.classification,
        monthlySavings: r1.metrics.monthlySavings
      });

      // 2. Usuário que gasta mais do que ganha
      const r2 = this.analyze({
        month: 11,
        year: 2026,
        categories: cats,
        transactions: [
          { id: 'd1', description: 'Salário', amount: 3000, type: 'income', categoryId: 'cat_sal', date: '2026-11-05' },
          { id: 'd2', description: 'Compras Cartão', amount: 2600, type: 'expense', categoryId: 'cat_comp', date: '2026-11-08' },
          { id: 'd3', description: 'Moradia', amount: 1400, type: 'expense', categoryId: 'cat_morad', date: '2026-11-10' }
        ],
        caixinhas: [],
        investments: [],
        investmentTransactions: [],
        dividends: [],
        investmentGoals: [],
        portfolioSnapshots: []
      });
      results.push({
        scenario: '2. Usuário que gasta mais do que ganha',
        passed: r2.metrics.monthlySavings === -1000 && r2.metrics.incomeCommitmentPct === 133.3 && r2.health.score < 40 && r2.health.classification === 'Crítica' && r2.improvements.some(i => i.id === 'imp_deficit_recovery'),
        score: r2.health.score,
        classification: r2.health.classification,
        monthlySavings: r2.metrics.monthlySavings
      });

      // 3. Usuário sem transações
      const r3 = this.analyze({
        month: 11,
        year: 2026,
        categories: cats,
        transactions: [],
        caixinhas: [],
        investments: [],
        investmentTransactions: [],
        dividends: [],
        investmentGoals: [],
        portfolioSnapshots: []
      });
      results.push({
        scenario: '3. Usuário sem transações',
        passed: r3.hasPeriodData === false && r3.health.hasSufficientData === false && r3.health.score === null && r3.improvements.length === 0,
        score: r3.health.score,
        classification: r3.health.classification
      });

      // 4. Usuário com apenas um mês de histórico
      const r4 = this.analyze({
        month: 11,
        year: 2026,
        categories: cats,
        transactions: [
          { id: 'm1', description: 'Salário', amount: 4500, type: 'income', categoryId: 'cat_sal', date: '2026-11-05' },
          { id: 'm2', description: 'Alimentação', amount: 350, type: 'expense', categoryId: 'cat_alim', date: '2026-11-09' }
        ],
        caixinhas: [],
        investments: [],
        investmentTransactions: [],
        dividends: [],
        investmentGoals: [],
        portfolioSnapshots: []
      });
      results.push({
        scenario: '4. Usuário com apenas um mês de histórico',
        passed: r4.activeMonthsCount === 1 && r4.hasPreviousMonthData === false && r4.metrics.expenseDelta === null && r4.improvements[0].simulations[0].value.includes('35,00'),
        activeMonthsCount: r4.activeMonthsCount,
        hasPreviousMonthData: r4.hasPreviousMonthData
      });

      // 5. Usuário com vários meses de histórico
      const r5 = this.analyze({
        month: 11,
        year: 2026,
        categories: cats,
        transactions: [
          { id: 'h1', description: 'Salário Set', amount: 5000, type: 'income', categoryId: 'cat_sal', date: '2026-09-05' },
          { id: 'h2', description: 'Mercado Set', amount: 600, type: 'expense', categoryId: 'cat_alim', date: '2026-09-10' },
          { id: 'h3', description: 'Salário Out', amount: 5000, type: 'income', categoryId: 'cat_sal', date: '2026-10-05' },
          { id: 'h4', description: 'Mercado Out', amount: 700, type: 'expense', categoryId: 'cat_alim', date: '2026-10-10' },
          { id: 'h5', description: 'Salário Nov', amount: 5200, type: 'income', categoryId: 'cat_sal', date: '2026-11-05' },
          { id: 'h6', description: 'Mercado Nov', amount: 910, type: 'expense', categoryId: 'cat_alim', date: '2026-11-10' }
        ],
        caixinhas: [],
        investments: [],
        investmentTransactions: [],
        dividends: [],
        investmentGoals: [],
        portfolioSnapshots: [
          { date: '2026-09-30', value: 10000 },
          { date: '2026-10-31', value: 11200 },
          { date: '2026-11-03', value: 12500 }
        ]
      });
      results.push({
        scenario: '5. Usuário com vários meses de histórico',
        passed: r5.activeMonthsCount === 3 && r5.hasPreviousMonthData === true && r5.metrics.expenseDelta === 210 && r5.metrics.expenseDeltaPct === 30 && r5.increasedCategories.length === 1 && r5.wealthSeries.length === 3,
        activeMonthsCount: r5.activeMonthsCount,
        expenseDelta: r5.metrics.expenseDelta,
        expenseDeltaPct: r5.metrics.expenseDeltaPct
      });

      return {
        allPassed: results.every(r => r.passed),
        results
      };
    }
  };

  // =========================================================================
  // ASSISTENTE FINANCEIRO COM IA (ETAPA 2 DA INTELIGÊNCIA FINANCEIRA)
  // =========================================================================
  const FinancialAssistantService = {
    STARTER_QUESTIONS: [
      {
        text: 'Quanto posso gastar até o final do mês?',
        icon: '📅',
        category: 'Orçamento Mensal'
      },
      {
        text: 'Qual categoria está consumindo mais dinheiro?',
        icon: '🏷️',
        category: 'Gastos por Categoria'
      },
      {
        text: 'Quanto consegui economizar?',
        icon: '💰',
        category: 'Economia'
      },
      {
        text: 'Como posso economizar R$ 500 por mês?',
        icon: '✂️',
        category: 'Plano Prático'
      },
      {
        text: 'Quanto tempo vou levar para juntar R$ 10.000?',
        icon: '🎯',
        category: 'Meta Financeira'
      },
      {
        text: 'Estou gastando mais do que ganho?',
        icon: '⚖️',
        category: 'Equilíbrio'
      },
      {
        text: 'Como posso organizar melhor minha renda?',
        icon: '📊',
        category: 'Organização'
      }
    ],

    getHistoryStorageKey() {
      return STORAGE_KEYS._prefix() + 'ai_chat_history';
    },

    getHistory() {
      try {
        const raw = localStorage.getItem(this.getHistoryStorageKey());
        const history = raw ? JSON.parse(raw) : [];
        return Array.isArray(history) ? history : [];
      } catch (e) {
        return [];
      }
    },

    saveHistory(messages) {
      const trimmed = Array.isArray(messages) ? messages.slice(-40) : [];
      try {
        localStorage.setItem(this.getHistoryStorageKey(), JSON.stringify(trimmed));
      } catch (e) {}
      return trimmed;
    },

    clearHistory() {
      try {
        localStorage.setItem(this.getHistoryStorageKey(), '[]');
      } catch (e) {}
    },

    /**
     * Monta o contexto mínimo e anonimizado apenas do usuário autenticado atual
     * para enviar à Supabase Edge Function (sem expor dados de terceiros nem PII desnecessário).
     */
    /**
     * Monta o contexto mínimo e anonimizado apenas do usuário autenticado atual
     * para enviar à Supabase Edge Function (sem expor dados de terceiros nem PII desnecessário).
     */
    buildMinimalContext(report) {
      const today = new Date();
      const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const currentDayOfMonth = today.getDate();
      const daysRemainingInMonth = Math.max(1, daysInCurrentMonth - currentDayOfMonth + 1);

      const m = (report && report.metrics) || {};
      const h = (report && report.health) || {};
      const periodLabel = report && report.period ? report.period.label : 'Período Atual';
      const prevPeriodLabel = report && report.period ? report.period.prevLabel : 'Período Anterior';

      const allInvestments = typeof Storage !== 'undefined' ? (Storage.getActiveInvestments() || []) : [];
      const allCaixinhas = typeof Storage !== 'undefined' ? (Storage.getCaixinhas() || []) : [];
      const allTransactions = typeof Storage !== 'undefined' ? (Storage.getTransactions() || []) : [];

      const pMonth = report && report.period ? report.period.month : (today.getMonth() + 1);
      const pYear = report && report.period ? report.period.year : today.getFullYear();
      const isAllMonths = pMonth === 'all';

      const periodTransactions = allTransactions.filter(t => {
        if (!t || !t.date) return false;
        const [tY, tM] = String(t.date).slice(0, 10).split('-').map(n => parseInt(n, 10));
        return tY === pYear && (isAllMonths || tM === Number(pMonth));
      }).map(t => {
        const cat = typeof Storage !== 'undefined' ? Storage.getCategory(t.categoryId) : null;
        return {
          id: t.id,
          description: t.description || '',
          amount: Number(t.amount) || 0,
          type: t.type === 'income' ? 'income' : 'expense',
          date: t.date,
          categoryId: t.categoryId,
          categoryName: cat ? cat.name : 'Outros',
          categoryIcon: cat ? cat.icon : (t.type === 'income' ? '💰' : '🏷️')
        };
      });

      const investmentsList = allInvestments.map(inv => {
        const costBasis = typeof Storage !== 'undefined' ? Storage.getCostBasis(inv) : ((Number(inv.quantity) || 0) * (Number(inv.averagePrice) || 0));
        let currentValue = costBasis;
        if (typeof Storage !== 'undefined') {
          if (inv.type === 'fixed') {
            const acc = Storage.getAccumulatedYield(inv);
            currentValue = acc !== null ? costBasis + acc : costBasis;
          } else {
            const mv = Storage.getMarketValue(inv);
            currentValue = mv !== null ? mv : costBasis;
          }
        }
        return {
          id: inv.id,
          name: inv.name,
          type: inv.type,
          ticker: inv.ticker || '',
          institution: inv.institution || '',
          quantity: Number(inv.quantity) || 0,
          averagePrice: Number(inv.averagePrice) || 0,
          currentPrice: Number(inv.currentPrice) || Number(inv.averagePrice) || 0,
          costBasis,
          currentValue
        };
      });

      const caixinhasList = allCaixinhas.map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon || '🎯',
        currentAmount: Number(c.currentAmount) || 0,
        targetAmount: Number(c.targetAmount) || 0
      }));

      const hasAnyData = Boolean(
        (report && report.hasPeriodData) ||
        (report && report.activeMonthsCount > 0) ||
        (m.totalInvestmentsValue > 0) ||
        (m.totalCaixinhasSaved > 0) ||
        allTransactions.length > 0 ||
        allInvestments.length > 0 ||
        allCaixinhas.length > 0
      );

      return {
        period: {
          month: pMonth,
          year: pYear,
          isAllMonths,
          label: periodLabel,
          prevLabel: prevPeriodLabel
        },
        periodLabel,
        prevPeriodLabel,
        hasAnyData,
        hasPeriodData: Boolean(report && report.hasPeriodData),
        activeMonthsCount: Number(report && report.activeMonthsCount) || 0,
        daysRemainingInMonth,
        currentDayOfMonth,
        daysInCurrentMonth,
        metrics: {
          income: Number(m.income) || 0,
          expense: Number(m.expense) || 0,
          monthlySavings: Number(m.monthlySavings) || 0,
          savingsRatePct: m.savingsRatePct !== null && m.savingsRatePct !== undefined ? Number(m.savingsRatePct) : null,
          incomeCommitmentPct: m.incomeCommitmentPct !== null && m.incomeCommitmentPct !== undefined ? Number(m.incomeCommitmentPct) : null,
          prevIncome: Number(m.prevIncome) || 0,
          prevExpense: Number(m.prevExpense) || 0,
          expenseDelta: m.expenseDelta !== null && m.expenseDelta !== undefined ? Number(m.expenseDelta) : null,
          expenseDeltaPct: m.expenseDeltaPct !== null && m.expenseDeltaPct !== undefined ? Number(m.expenseDeltaPct) : null,
          txCount: Number(m.txCount) || 0,
          incomeCount: Number(m.incomeCount) || 0,
          expenseCount: Number(m.expenseCount) || 0,
          totalTransactionCount: Number(m.totalTransactionCount) || allTransactions.length,
          avgHistoricalIncome: Number(m.avgMonthlyIncome || m.avgHistoricalIncome) || 0,
          avgHistoricalExpense: Number(m.avgMonthlyExpense || m.avgHistoricalExpense) || 0,
          avgHistoricalSavings: Number(m.avgMonthlySavings || m.avgHistoricalSavings) || 0,
          totalAccountBalance: Number(m.totalAccountBalance) || (typeof Storage !== 'undefined' ? Storage.getAccountBalance() : 0),
          totalCaixinhasBalance: Number(m.totalCaixinhasSaved || m.totalCaixinhasBalance) || 0,
          totalCaixinhasTarget: Number(m.totalCaixinhasTarget) || 0,
          caixinhasProgressPct: m.caixinhasProgressPct !== null && m.caixinhasProgressPct !== undefined ? Number(m.caixinhasProgressPct) : null,
          caixinhasCount: allCaixinhas.length,
          totalInvestmentsValue: Number(m.totalInvestmentsValue) || 0,
          totalInvestedCost: Number(m.totalInvestedCost) || 0,
          totalDividends: Number(m.periodDividends || m.totalDividends) || 0,
          investmentsCount: allInvestments.length,
          goalsCount: Number(m.goalsCount) || allCaixinhas.length,
          goalsAchieved: Number(m.goalsAchieved) || 0,
          totalNetWorth: (typeof Storage !== 'undefined' ? Storage.getAccountBalance() : 0) + (Number(m.totalCaixinhasSaved || m.totalCaixinhasBalance) || 0) + (Number(m.totalInvestmentsValue) || 0)
        },
        health: {
          hasSufficientData: Boolean(h.hasSufficientData),
          score: h.score !== null && h.score !== undefined ? Number(h.score) : null,
          classification: h.classification || 'Dados insuficientes'
        },
        categoryBreakdown: (report && report.categoryBreakdown) || [],
        categories: ((report && report.categoryBreakdown) || []).slice(0, 10).map(c => ({
          name: c.name,
          icon: c.icon,
          amount: Number(c.amount) || 0,
          prevAmount: Number(c.prevAmount) || 0,
          delta: Number(c.delta) || 0,
          deltaPct: c.deltaPct !== null && c.deltaPct !== undefined ? Number(c.deltaPct) : null,
          percentageOfExpense: Number(c.percentageOfExpense) || 0,
          percentageOfIncome: c.percentageOfIncome !== null && c.percentageOfIncome !== undefined ? Number(c.percentageOfIncome) : null,
          count: Number(c.count) || 0
        })),
        investmentsList,
        caixinhasList,
        periodTransactions,
        activeMonths: ((report && report.activeMonths) || []).slice(-6).map(am => ({
          label: am.fullLabel || am.label,
          income: Number(am.income) || 0,
          expense: Number(am.expense) || 0,
          savings: Number(am.savings) || 0
        }))
      };
    },

    /**
     * Chama a Supabase Edge Function `financial-ai-assistant` autenticada com a sessão
     * do usuário atual. Caso o dispositivo esteja sem internet no momento, utiliza o
     * mesmo motor analítico determinístico localmente para nunca deixar o usuário sem resposta.
     */
    async askQuestion(question, reportOverride = null) {
      const cleanQuestion = String(question || '').trim();
      if (!cleanQuestion) {
        throw new Error('Digite uma pergunta para consultar o Assistente IA.');
      }

      // 1. Descarrega qualquer sincronização pendente com o Supabase com timeout curto
      if (typeof SupabaseSyncService !== 'undefined' && SupabaseSyncService.flushPendingWrites) {
        try {
          await SupabaseSyncService.flushPendingWrites(600);
        } catch (flushErr) {
          console.warn('[Assistente IA] Sincronização pendente aguardada com timeout:', flushErr);
        }
      }

      // 2. Sempre analisa em tempo real com os dados mais recentes do Storage
      let report;
      try {
        report = FinancialIntelligenceEngine.analyze({
          month: (typeof IntelligenceView !== 'undefined' && IntelligenceView.selectedMonth) ? IntelligenceView.selectedMonth : (new Date().getMonth() + 1),
          year: (typeof IntelligenceView !== 'undefined' && IntelligenceView.selectedYear) ? IntelligenceView.selectedYear : new Date().getFullYear()
        });
      } catch (anaErr) {
        console.warn('[Assistente IA] Falha ao analisar dados financeiros:', anaErr);
        report = { metrics: {}, health: {}, period: { label: 'Período Atual', prevLabel: 'Período Anterior' } };
      }

      if (typeof IntelligenceView !== 'undefined') {
        IntelligenceView.lastReport = report;
      }

      let financialContext;
      try {
        financialContext = this.buildMinimalContext(report);
      } catch (bldErr) {
        console.warn('[Assistente IA] Falha ao montar contexto mínimo:', bldErr);
        financialContext = {
          periodLabel: report.period ? report.period.label : 'Período Atual',
          metrics: report.metrics || {},
          categories: []
        };
      }

      const recentHistory = this.getHistory().slice(-8).map(m => ({
        role: m.role,
        content: m.content
      }));

      // 3. Chamada segura para a Supabase Edge Function com timeout de 4.5 segundos
      const client = typeof SupabaseService !== 'undefined' ? SupabaseService.getClient() : null;
      if (client && client.functions) {
        try {
          const invokePromise = client.functions.invoke('financial-ai-assistant', {
            body: {
              question: cleanQuestion,
              financialContext,
              conversationHistory: recentHistory
            }
          });
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Edge Function timeout')), 4500)
          );
          const { data, error } = await Promise.race([invokePromise, timeoutPromise]);

          if (!error && data && data.answer) {
            return {
              answer: String(data.answer),
              provider: data.provider || 'supabase-edge-ai',
              model: data.model || 'meu-controle-analytical-ai-v2'
            };
          }
        } catch (edgeErr) {
          console.warn('[Assistente IA] Fallback local acionado após falha/timeout na Edge Function:', edgeErr);
        }
      }

      // 4. Fallback determinístico local idêntico ao motor da Edge Function
      const fallbackAnswer = this.generateLocalAnalyticalAnswer(cleanQuestion, financialContext);
      return {
        answer: String(fallbackAnswer || 'Não foi possível analisar sua pergunta no momento. Tente novamente.'),
        provider: 'local-analytical-fallback',
        model: 'meu-controle-analytical-ai-v2'
      };
    },

    /**
     * Motor analítico baseado nos dados reais do usuário (mesma lógica da Edge Function
     * para operação offline e validação imediata de testes).
     */
    generateLocalAnalyticalAnswer(question, ctx) {
      const m = ctx.metrics;
      const cats = ctx.categories || [];
      const topCat = cats.length > 0 ? cats[0] : null;
      const secondCat = cats.length > 1 ? cats[1] : null;
      const thirdCat = cats.length > 2 ? cats[2] : null;
      const fmt = (val) => Utils.formatCurrency(Number(val) || 0);
      const fmtPct = (val) => `${Number(val || 0).toFixed(1).replace('.', ',')}%`;

      const qNorm = String(question || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      const parseMoneyFromQuestion = (q, defaultVal) => {
        const match = q.match(/(?:r\$\s*)?(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?/i);
        if (!match) return defaultVal;
        const intPart = match[1].replace(/\./g, '');
        const decPart = match[2] ? `.${match[2]}` : '';
        const parsed = parseFloat(`${intPart}${decPart}`);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultVal;
      };

      // =========================================================================
      // INTENÇÃO A: Consulta direta sobre DESPESAS ("Quanto tenho de despesas?", "Total de despesas", "Quanto gastei?")
      // =========================================================================
      const isDirectExpenseQuery =
        !qNorm.includes('posso gastar') &&
        !qNorm.includes('mais do que ganho') &&
        !qNorm.includes('mais que ganho') &&
        !qNorm.includes('reduzir') &&
        !qNorm.includes('cortar') &&
        !qNorm.includes('economizar') &&
        (
          qNorm.includes('tenho de despesa') ||
          qNorm.includes('total de despesa') ||
          qNorm.includes('total das despesas') ||
          qNorm.includes('minhas despesas') ||
          qNorm.includes('quais sao minhas despesas') ||
          qNorm.includes('minha despesa') ||
          qNorm.includes('quanto gastei') ||
          qNorm.includes('quanto eu gastei') ||
          qNorm.includes('quanto gastei no mes') ||
          qNorm.includes('gastos do mes') ||
          qNorm.includes('meus gastos') ||
          (qNorm.includes('quanto') && qNorm.includes('despesa'))
        );

      if (isDirectExpenseQuery) {
        const periodTxs = ctx.periodTransactions || [];
        const expenseTxs = periodTxs.filter(t => t.type === 'expense');
        const expenseCount = m.expenseCount || expenseTxs.length;

        if (m.expense <= 0) {
          return [
            `Em **${ctx.periodLabel}**, o total das suas despesas é de **R$ 0,00** (**0 despesas** registradas no período).`,
            ``,
            `**Resumo atual do período (${ctx.periodLabel}):**`,
            `- **Despesas totais:** **R$ 0,00**`,
            `- **Receitas no período:** ${fmt(m.income)}`,
            `- **Saldo líquido do período:** **${fmt(m.monthlySavings)}**`
          ].join('\n');
        }

        const txLines = expenseTxs.slice(0, 8).map(t =>
          `- **${t.description || 'Despesa'}** (${t.categoryIcon || '🏷️'} ${t.categoryName || 'Categoria'}): **${fmt(t.amount)}** em ${Utils.formatDate(t.date)}`
        );
        const catLines = cats.slice(0, 5).map(c =>
          `- **${c.icon || '🏷️'} ${c.name}:** ${fmt(c.amount)} (${fmtPct(c.percentageOfExpense)} das despesas)`
        );

        return [
          `Em **${ctx.periodLabel}**, o total atualizado das suas despesas é de **${fmt(m.expense)}**${expenseCount > 0 ? ` (em **${expenseCount}** lançamento${expenseCount === 1 ? '' : 's'})` : ''}.`,
          ``,
          `**Resumo das suas despesas (${ctx.periodLabel}):**`,
          `- **Total de Despesas:** **${fmt(m.expense)}**`,
          `- **Receitas no período:** ${fmt(m.income)}${m.incomeCommitmentPct !== null ? ` (**${fmtPct(m.incomeCommitmentPct)}** da renda comprometida)` : ''}`,
          `- **Saldo líquido (Receitas - Despesas):** **${fmt(m.monthlySavings)}**`,
          txLines.length > 0 ? `\n**Lançamentos de despesas registrados no período:**\n${txLines.join('\n')}` : '',
          catLines.length > 0 ? `\n**Divisão por categoria:**\n${catLines.join('\n')}` : ''
        ].filter(Boolean).join('\n');
      }

      // =========================================================================
      // INTENÇÃO B: Consulta direta sobre RECEITAS ("Quanto tenho de receitas?", "Qual minha renda?", "Quanto ganhei?")
      // =========================================================================
      const isDirectIncomeQuery =
        !qNorm.includes('organizar') &&
        !qNorm.includes('dividir') &&
        !qNorm.includes('50') &&
        !qNorm.includes('mais do que ganho') &&
        !qNorm.includes('mais que ganho') &&
        (
          qNorm.includes('tenho de receita') ||
          qNorm.includes('total de receita') ||
          qNorm.includes('total das receitas') ||
          qNorm.includes('minhas receitas') ||
          qNorm.includes('quais sao minhas receitas') ||
          qNorm.includes('minha receita') ||
          qNorm.includes('quanto ganhei') ||
          qNorm.includes('quanto eu ganhei') ||
          qNorm.includes('quanto recebi') ||
          qNorm.includes('qual minha renda') ||
          qNorm.includes('qual e a minha renda') ||
          qNorm.includes('qual e minha renda') ||
          (qNorm.includes('quanto') && qNorm.includes('receita'))
        );

      if (isDirectIncomeQuery) {
        const periodTxs = ctx.periodTransactions || [];
        const incomeTxs = periodTxs.filter(t => t.type === 'income');
        const incomeCount = m.incomeCount || incomeTxs.length;

        if (m.income <= 0) {
          return [
            `Em **${ctx.periodLabel}**, o total das suas receitas é de **R$ 0,00** (**0 receitas** registradas no período).`,
            ``,
            `**Resumo atual do período (${ctx.periodLabel}):**`,
            `- **Receitas totais:** **R$ 0,00**`,
            `- **Despesas no período:** ${fmt(m.expense)}`,
            `- **Saldo líquido do período:** **${fmt(m.monthlySavings)}**`
          ].join('\n');
        }

        const incLines = incomeTxs.slice(0, 8).map(t =>
          `- **${t.description || 'Receita'}** (${t.categoryIcon || '💰'} ${t.categoryName || 'Receita'}): **${fmt(t.amount)}** em ${Utils.formatDate(t.date)}`
        );

        return [
          `Em **${ctx.periodLabel}**, o total atualizado das suas receitas é de **${fmt(m.income)}**${incomeCount > 0 ? ` (em **${incomeCount}** lançamento${incomeCount === 1 ? '' : 's'})` : ''}.`,
          ``,
          `**Resumo das suas receitas (${ctx.periodLabel}):**`,
          `- **Total de Receitas:** **${fmt(m.income)}**`,
          `- **Despesas no período:** ${fmt(m.expense)}`,
          `- **Saldo líquido disponível:** **${fmt(m.monthlySavings)}** (${fmtPct(m.savingsRatePct || 0)} de taxa de economia)`,
          incLines.length > 0 ? `\n**Lançamentos de receitas registrados no período:**\n${incLines.join('\n')}` : ''
        ].filter(Boolean).join('\n');
      }

      // =========================================================================
      // INTENÇÃO C: Consulta direta sobre INVESTIMENTOS ("Quanto tenho em investimentos?", "Meus investimentos")
      // =========================================================================
      const isDirectInvestmentQuery =
        !qNorm.includes('quanto tempo') &&
        !qNorm.includes('juntar') &&
        (
          qNorm.includes('investimento') ||
          qNorm.includes('investido') ||
          qNorm.includes('minha carteira') ||
          qNorm.includes('meus ativos') ||
          qNorm.includes('tenho aplicado') ||
          qNorm.includes('valor aplicado') ||
          qNorm.includes('renda fixa')
        );

      if (isDirectInvestmentQuery) {
        const invList = ctx.investmentsList || [];
        const investmentsCount = m.investmentsCount || invList.length;
        const investmentsVal = m.totalInvestmentsValue || 0;
        const investedCost = m.totalInvestedCost || 0;
        const caixinhasSaved = m.totalCaixinhasBalance || 0;
        const totalReserves = caixinhasSaved + investmentsVal;

        if (investmentsCount <= 0 || (investmentsVal <= 0 && investedCost <= 0)) {
          return [
            `Atualmente, você possui **R$ 0,00** em investimentos (**0 ativos** cadastrados na sua carteira).`,
            ``,
            `**Resumo de Patrimônio e Reservas:**`,
            `- **Patrimônio em Investimentos:** **R$ 0,00** (0 ativos)`,
            `- **Custo Total Aplicado:** **R$ 0,00**`,
            `- **Saldo em Caixinhas (${m.caixinhasCount || 0}):** ${fmt(caixinhasSaved)}`
          ].join('\n');
        }

        const typeLabel = (t) =>
          t === 'fixed' ? 'Renda Fixa' : t === 'fii' ? 'FII' : t === 'crypto' ? 'Criptomoeda' : 'Ação';

        const assetLines = invList.map(inv => {
          const label = inv.type === 'fixed'
            ? `**${inv.name}** (${typeLabel(inv.type)}${inv.institution ? ` - ${inv.institution}` : ''})`
            : `**${inv.ticker ? `${inv.ticker} - ` : ''}${inv.name}** (${typeLabel(inv.type)}: ${inv.quantity} un. × PM ${fmt(inv.averagePrice)})`;
          const valDiff = Math.abs((inv.currentValue || 0) - (inv.costBasis || 0)) >= 0.01
            ? ` | Custo aplicado: ${fmt(inv.costBasis)}`
            : '';
          return `- ${label}: **${fmt(inv.currentValue)}**${valDiff}`;
        });

        return [
          `Atualmente, o seu patrimônio atualizado em **Investimentos** é de **${fmt(investmentsVal)}** (com custo total aplicado de **${fmt(investedCost)}** distribuído em **${investmentsCount}** ativo${investmentsCount === 1 ? '' : 's'}).`,
          ``,
          `**Resumo da sua Carteira de Investimentos:**`,
          `- **Posição Atual Total:** **${fmt(investmentsVal)}**`,
          `- **Valor Total Aplicado (Custo):** **${fmt(investedCost)}**`,
          `- **Quantidade de Ativos:** **${investmentsCount}**`,
          `- **Proventos/Dividendos no período:** ${fmt(m.totalDividends || 0)}`,
          assetLines.length > 0 ? `\n**Ativos na sua carteira agora:**\n${assetLines.join('\n')}` : '',
          `\n- **Total somado com Caixinhas (${fmt(caixinhasSaved)}):** **${fmt(totalReserves)}**`
        ].filter(Boolean).join('\n');
      }

      // =========================================================================
      // INTENÇÃO D: Consulta direta sobre CAIXINHAS ("Quanto tenho nas caixinhas?", "Minhas caixinhas")
      // =========================================================================
      if (qNorm.includes('caixinha') || qNorm.includes('reserva de emergencia')) {
        const caxList = ctx.caixinhasList || [];
        const caixinhasCount = m.caixinhasCount || caxList.length;
        const caixinhasSaved = m.totalCaixinhasBalance || 0;
        const caixinhasTarget = m.totalCaixinhasTarget || 0;

        if (caixinhasCount <= 0 && caixinhasSaved <= 0) {
          return `Atualmente, você possui **R$ 0,00** guardados em Caixinhas (**0 caixinhas** cadastradas).`;
        }
        const caxLines = caxList.map(c =>
          `- **${c.icon || '🎯'} ${c.name}:** **${fmt(c.currentAmount)}** de ${fmt(c.targetAmount)}`
        );
        return [
          `Atualmente, você possui **${fmt(caixinhasSaved)}** guardados em **${caixinhasCount}** Caixinha(s) (meta total de **${fmt(caixinhasTarget)}**).`,
          caxLines.length > 0 ? `\n**Suas Caixinhas:**\n${caxLines.join('\n')}` : ''
        ].filter(Boolean).join('\n');
      }

      // Caso 0: Sem nenhum dado financeiro cadastrado
      if (!ctx.hasAnyData || (m.totalTransactionCount === 0 && m.investmentsCount === 0 && m.caixinhasCount === 0)) {
        return [
          `Ainda **não há dados financeiros suficientes** na sua conta para responder a essa pergunta com números reais.`,
          ``,
          `**Situação atual da sua conta:**`,
          `- Movimentações registradas: **0 transações**`,
          `- Caixinhas / Metas cadastradas: **${m.caixinhasCount}**`,
          `- Investimentos cadastrados: **${m.investmentsCount}**`,
          ``,
          `**Como começar para receber análises personalizadas:**`,
          `1. Acesse a aba **Transações** e cadastre suas principais receitas (ex.: salário, renda extra) e despesas do mês.`,
          `2. Classifique cada lançamento em uma **Categoria** (Moradia, Alimentação, Transporte etc.).`,
          `3. Assim que você registrar suas movimentações, poderei calcular quanto você pode gastar por dia, onde economizar e quanto tempo levará para atingir seus objetivos.`
        ].join('\n');
      }

      const effIncome = m.income > 0 ? m.income : m.avgHistoricalIncome;
      const effExpense = m.expense > 0 ? m.expense : m.avgHistoricalExpense;
      const effSavings = (m.income > 0 || m.expense > 0) ? m.monthlySavings : m.avgHistoricalSavings;
      const periodRef = ctx.hasPeriodData ? `em **${ctx.periodLabel}**` : `na sua **média histórica mensal**`;

      // Intenção 1: Quanto posso gastar até o final do mês?
      if (
        (qNorm.includes('quanto') && qNorm.includes('posso gastar')) ||
        qNorm.includes('ate o final do mes') ||
        qNorm.includes('ate o fim do mes') ||
        qNorm.includes('orcamento restante') ||
        qNorm.includes('limite diario')
      ) {
        if (m.income <= 0 && m.expense <= 0) {
          return [
            `Não encontrei receitas ou despesas lançadas em **${ctx.periodLabel}** para calcular o saldo restante deste mês.`,
            ``,
            `- **Saldo geral acumulado em conta:** ${fmt(m.totalAccountBalance)}`,
            `- **Média histórica de receitas:** ${fmt(m.avgHistoricalIncome)}`,
            `- **Média histórica de despesas:** ${fmt(m.avgHistoricalExpense)}`,
            ``,
            `💡 **Próximo passo:** Cadastre sua receita prevista para **${ctx.periodLabel}** na aba **Transações** para que eu calcule seu limite seguro de gastos até o fim do mês.`
          ].join('\n');
        }

        if (m.income <= 0 && m.expense > 0) {
          return [
            `Em **${ctx.periodLabel}**, você já registrou **${fmt(m.expense)}** em despesas, mas ainda **não há receitas cadastradas** neste período.`,
            ``,
            `- **Receitas no período:** ${fmt(0)}`,
            `- **Despesas já realizadas:** ${fmt(m.expense)}`,
            `- **Saldo líquido do período:** ${fmt(-m.expense)}`,
            ``,
            `⚠️ Como não há receita lançada no mês, não é possível definir uma margem segura de gastos adicionais sem comprometer sua reserva. Se você já recebeu sua renda mensal, registre-a em **Transações**.`
          ].join('\n');
        }

        const remainingTotal = m.income - m.expense;
        const recommendedSavingsReserve = m.income * 0.2;
        const safeSpendLimit = Math.max(0, m.income * 0.8 - m.expense);
        const daysLeft = Math.max(1, ctx.daysRemainingInMonth || 10);
        const dailyTotalAllowance = remainingTotal > 0 ? remainingTotal / daysLeft : 0;
        const dailySafeAllowance = safeSpendLimit > 0 ? safeSpendLimit / daysLeft : 0;

        if (remainingTotal <= 0) {
          return [
            `⚠️ **Atenção:** Em **${ctx.periodLabel}**, suas despesas já superaram sua receita em **${fmt(Math.abs(remainingTotal))}**.`,
            ``,
            `**Resumo do seu mês até agora:**`,
            `- **Receitas registradas:** ${fmt(m.income)}`,
            `- **Despesas já realizadas:** ${fmt(m.expense)} (${fmtPct(m.incomeCommitmentPct || 100)} da renda)`,
            `- **Saldo disponível no mês:** **${fmt(remainingTotal)}** (orçamento esgotado)`,
            ``,
            `**Recomendações práticas para os próximos ${daysLeft} dias do mês:**`,
            `- Evite novos gastos não essenciais até a virada do mês.`,
            topCat ? `- Sua maior despesa foi em **${topCat.icon} ${topCat.name}** (${fmt(topCat.amount)}). Segure novas compras nessa categoria.` : `- Priorize apenas despesas básicas inevitáveis.`
          ].join('\n');
        }

        return [
          `Com base nos seus dados reais de **${ctx.periodLabel}**, você ainda possui **${fmt(remainingTotal)}** de saldo livre até o fim do mês:`,
          ``,
          `**Raio-X do seu limite de gastos (${daysLeft} dias restantes no mês):**`,
          `- **Receitas do período:** ${fmt(m.income)}`,
          `- **Despesas já registradas:** ${fmt(m.expense)} (${fmtPct(m.incomeCommitmentPct || 0)} da renda)`,
          `- **Limite máximo (usando 100% da renda):** **${fmt(remainingTotal)}** (cerca de **${fmt(dailyTotalAllowance)}/dia**)`,
          `- **Limite recomendado (preservando 20% = ${fmt(recommendedSavingsReserve)} de economia):** **${fmt(safeSpendLimit)}** (cerca de **${fmt(dailySafeAllowance)}/dia**)`,
          ``,
          topCat
            ? `💡 **Dica prática:** A categoria **${topCat.icon} ${topCat.name}** já consumiu **${fmt(topCat.amount)}** (${fmtPct(topCat.percentageOfExpense)} dos gastos). Manter seus gastos diários próximos de **${fmt(dailySafeAllowance > 0 ? dailySafeAllowance : dailyTotalAllowance)}** garante que você feche o mês no azul.`
            : `💡 **Dica prática:** Tente manter seus gastos diários abaixo de **${fmt(dailySafeAllowance > 0 ? dailySafeAllowance : dailyTotalAllowance)}** para fechar o mês com folga financeira.`
        ].join('\n');
      }

      // Intenção 2: Qual categoria está consumindo mais dinheiro?
      if (
        qNorm.includes('categoria') ||
        qNorm.includes('consumindo mais') ||
        qNorm.includes('onde gasto mais') ||
        qNorm.includes('maior gasto') ||
        qNorm.includes('maiores gastos')
      ) {
        if (!topCat) {
          return [
            `Em **${ctx.periodLabel}**, você ainda **não possui despesas registradas** em nenhuma categoria.`,
            ``,
            `- **Despesas no período:** ${fmt(0)}`,
            `- **Total de transações na conta:** ${m.totalTransactionCount}`,
            ``,
            `Assim que você registrar despesas classificadas por categoria (ou selecionar outro mês no topo da página), mostrarei exatamente quais áreas estão pesando mais no seu orçamento.`
          ].join('\n');
        }

        const rankingLines = cats.slice(0, 5).map((c, idx) => {
          const incShare = c.percentageOfIncome !== null ? ` | ${fmtPct(c.percentageOfIncome)} da sua renda` : '';
          const deltaTxt = c.prevAmount > 0 && c.deltaPct !== null
            ? ` (${c.delta >= 0 ? '+' : ''}${fmtPct(c.deltaPct)} vs. ${ctx.prevPeriodLabel})`
            : '';
          return `${idx + 1}. **${c.icon} ${c.name}:** ${fmt(c.amount)} — **${fmtPct(c.percentageOfExpense)}** das despesas${incShare}${deltaTxt}`;
        });

        const cut15 = topCat.amount * 0.15;
        return [
          `A categoria que está consumindo mais dinheiro em **${ctx.periodLabel}** é **${topCat.icon} ${topCat.name}**, somando **${fmt(topCat.amount)}** (**${fmtPct(topCat.percentageOfExpense)}** de todas as suas despesas).`,
          ``,
          `**Ranking das categorias de maior gasto em ${ctx.periodLabel}:**`,
          ...rankingLines,
          ``,
          `**Oportunidade prática de economia:**`,
          `- Reduzir apenas **15%** nos gastos com **${topCat.name}** liberaria **${fmt(cut15)} por mês** (ou **${fmt(cut15 * 12)} em 12 meses**) sem precisar mexer nas demais categorias.`
        ].join('\n');
      }

      // Intenção 3: Como posso economizar R$ X por mês?
      if (
        (qNorm.includes('como') && qNorm.includes('economizar')) ||
        (qNorm.includes('reduzir') && qNorm.includes('gasto')) ||
        (qNorm.includes('cortar') && qNorm.includes('gasto')) ||
        (qNorm.includes('economizar') && /r\$|\d+/.test(qNorm))
      ) {
        const targetSaving = parseMoneyFromQuestion(qNorm, 500);
        const currentSurplus = Math.max(0, effSavings);
        const additionalNeeded = Math.max(0, targetSaving - currentSurplus);

        if (effExpense <= 0) {
          return [
            `Você ainda não possui despesas registradas ${periodRef} para que eu simule cortes por categoria até atingir **${fmt(targetSaving)}/mês**.`,
            ``,
            `- **Receita identificada:** ${fmt(effIncome)}`,
            `- **Economia atual:** ${fmt(effSavings)}`,
            ``,
            `Registre suas despesas mensais por categoria para receber um plano detalhado de redução de custos.`
          ].join('\n');
        }

        if (currentSurplus >= targetSaving) {
          return [
            `✅ **Excelente notícia!** ${ctx.hasPeriodData ? `Em **${ctx.periodLabel}**` : `Na sua média mensal`}, você já está economizando **${fmt(currentSurplus)}**, o que **supera sua meta de ${fmt(targetSaving)}/mês** em **${fmt(currentSurplus - targetSaving)}**!`,
            ``,
            `**Como garantir e potencializar esse resultado:**`,
            `- **Separe o valor no início do mês:** Transfira **${fmt(targetSaving)}** para uma **Caixinha** ou investimento assim que receber sua renda.`,
            topCat ? `- **Ponto de atenção:** Sua maior categoria de despesa é **${topCat.icon} ${topCat.name}** (${fmt(topCat.amount)}). Se reduzisse 10% nela, sua economia mensal subiria para **${fmt(currentSurplus + topCat.amount * 0.1)}**.` : `- Mantenha o acompanhamento semanal das transações para preservar essa margem.`
          ].join('\n');
        }

        const pctOfTotalExpense = (additionalNeeded / effExpense) * 100;
        const planSteps = [];
        let remainingToCut = additionalNeeded;

        cats.slice(0, 3).forEach((cat) => {
          if (remainingToCut <= 0) return;
          const suggestedCut = Math.min(cat.amount * 0.25, remainingToCut);
          if (suggestedCut >= 10) {
            const cutPct = Math.round((suggestedCut / cat.amount) * 100);
            planSteps.push(`- **${cat.icon} ${cat.name}** (atual: ${fmt(cat.amount)}): reduzir cerca de **${cutPct}%** gera **+${fmt(suggestedCut)}/mês**`);
            remainingToCut -= suggestedCut;
          }
        });

        if (remainingToCut > 10) {
          planSteps.push(`- **Demais despesas / revisão de contratos ou renda extra:** ajuste complementar de **${fmt(remainingToCut)}/mês**`);
        }

        return [
          `Para alcançar uma economia total de **${fmt(targetSaving)} por mês** ${periodRef}, veja o diagnóstico baseado nos seus números:`,
          ``,
          `**Situação atual:**`,
          `- **Economia atual:** ${fmt(effSavings)}/mês`,
          `- **Despesas totais:** ${fmt(effExpense)}/mês`,
          `- **Esforço adicional necessário:** **${fmt(additionalNeeded)}/mês** (equivale a reduzir **${fmtPct(pctOfTotalExpense)}** das suas despesas atuais)`,
          ``,
          `**Plano prático sugerido por categoria:**`,
          ...(planSteps.length > 0 ? planSteps : [`- Reduzir linearmente **${fmtPct(Math.min(100, pctOfTotalExpense))}** nas suas despesas atuais (${fmt(effExpense)}).`]),
          ``,
          `💡 **Impacto em 1 ano:** Economizando **${fmt(targetSaving)}/mês**, você acumulará **${fmt(targetSaving * 12)}** em 12 meses (sem contar eventuais rendimentos).`
        ].join('\n');
      }

      // Intenção 4: Quanto consegui economizar?
      if (
        qNorm.includes('quanto consegui economizar') ||
        qNorm.includes('quanto economizei') ||
        qNorm.includes('minha economia') ||
        qNorm.includes('saldo economizado') ||
        qNorm.includes('quanto poupei')
      ) {
        const savingsMsg = m.monthlySavings > 0
          ? `Em **${ctx.periodLabel}**, você conseguiu economizar **${fmt(m.monthlySavings)}** (**${fmtPct(m.savingsRatePct || 0)}** da sua receita do período).`
          : m.monthlySavings < 0
            ? `Em **${ctx.periodLabel}**, você **não teve economia positiva**: as despesas superaram as receitas em **${fmt(Math.abs(m.monthlySavings))}**.`
            : `Em **${ctx.periodLabel}**, seu saldo entre receitas e despesas ficou em **${fmt(0)}**.`;

        return [
          savingsMsg,
          ``,
          `**Resumo completo da sua economia e reservas:**`,
          `- **Receitas em ${ctx.periodLabel}:** ${fmt(m.income)}`,
          `- **Despesas em ${ctx.periodLabel}:** ${fmt(m.expense)}`,
          `- **Resultado líquido do período:** **${fmt(m.monthlySavings)}**`,
          `- **Média histórica de economia mensal:** ${fmt(m.avgHistoricalSavings)}/mês`,
          `- **Saldo acumulado em Caixinhas (${m.caixinhasCount}):** ${fmt(m.totalCaixinhasBalance)}`,
          `- **Patrimônio em Investimentos (${m.investmentsCount}):** ${fmt(m.totalInvestmentsValue)}`,
          `- **Patrimônio Total Consolidado:** **${fmt(m.totalNetWorth)}**`,
          ``,
          m.monthlySavings > 0
            ? `👏 **Recomendação:** Você está poupando ${fmtPct(m.savingsRatePct || 0)} da renda neste período. Direcione esse excedente para suas Caixinhas ou Investimentos para consolidar sua reserva.`
            : `💡 **Recomendação:** Revise a categoria **${topCat ? `${topCat.icon} ${topCat.name} (${fmt(topCat.amount)})` : 'de maior peso'}** para recuperar sua capacidade de poupança nos próximos meses.`
        ].join('\n');
      }

      // Intenção 5: Quanto tempo vou levar para juntar R$ X?
      if (
        qNorm.includes('quanto tempo') ||
        qNorm.includes('juntar') ||
        qNorm.includes('acumular') ||
        qNorm.includes('atingir') ||
        qNorm.includes('10.000') ||
        qNorm.includes('10000')
      ) {
        const targetGoal = parseMoneyFromQuestion(qNorm, 10000);
        const monthlyPace = m.monthlySavings > 0 ? m.monthlySavings : (m.avgHistoricalSavings > 0 ? m.avgHistoricalSavings : 0);
        const currentReserves = m.totalCaixinhasBalance + m.totalInvestmentsValue;
        const remainingFromReserves = Math.max(0, targetGoal - currentReserves);
        const optimizedPace = monthlyPace + effExpense * 0.1;

        if (monthlyPace <= 0) {
          const sim10PctIncome = effIncome > 0 ? effIncome * 0.1 : 300;
          const sim20PctIncome = effIncome > 0 ? effIncome * 0.2 : 600;
          const monthsAt10 = Math.ceil(targetGoal / sim10PctIncome);
          const monthsAt20 = Math.ceil(targetGoal / sim20PctIncome);

          return [
            `Com o ritmo atual (${fmt(m.monthlySavings)} de saldo em **${ctx.periodLabel}**), **ainda não há sobra mensal positiva** para projetar o prazo até **${fmt(targetGoal)}**.`,
            ``,
            `**Simulação realista caso você ajuste o orçamento:**`,
            `- Economizando **10% da sua renda (${fmt(sim10PctIncome)}/mês):** você juntará **${fmt(targetGoal)}** em cerca de **${monthsAt10} meses** (${(monthsAt10 / 12).toFixed(1).replace('.', ',')} anos).`,
            `- Economizando **20% da sua renda (${fmt(sim20PctIncome)}/mês):** você juntará **${fmt(targetGoal)}** em cerca de **${monthsAt20} meses** (${(monthsAt20 / 12).toFixed(1).replace('.', ',')} anos).`,
            currentReserves > 0
              ? `- **Considerando suas reservas atuais (${fmt(currentReserves)} em Caixinhas + Investimentos):** faltam **${fmt(remainingFromReserves)}** para completar ${fmt(targetGoal)}.`
              : `- *Nota: cálculo baseado exclusivamente em aportes mensais constantes, sem prometer rendimentos futuros.*`
          ].join('\n');
        }

        const monthsFromZero = Math.ceil(targetGoal / monthlyPace);
        const monthsWithReserves = remainingFromReserves > 0 ? Math.ceil(remainingFromReserves / monthlyPace) : 0;
        const monthsOptimized = optimizedPace > 0 ? Math.ceil(targetGoal / optimizedPace) : monthsFromZero;

        return [
          `Mantendo sua capacidade de economia de **${fmt(monthlyPace)} por mês**, você levará **${monthsFromZero} ${monthsFromZero === 1 ? 'mês' : 'meses'}** ${monthsFromZero >= 12 ? `(cerca de **${(monthsFromZero / 12).toFixed(1).replace('.', ',')} anos**)` : ''} para juntar **${fmt(targetGoal)}** começando do zero.`,
          ``,
          `**Cenários detalhados para a sua meta de ${fmt(targetGoal)}:**`,
          `- **No ritmo atual (${fmt(monthlyPace)}/mês partindo do zero):** **${monthsFromZero} meses**`,
          currentReserves > 0
            ? `- **Somando suas reservas atuais (${fmt(currentReserves)} em Caixinhas/Investimentos):** faltam **${fmt(remainingFromReserves)}**, o que leva **${monthsWithReserves} meses**`
            : `- **Reservas atuais em Caixinhas/Investimentos:** ${fmt(0)}`,
          effExpense > 0
            ? `- **Reduzindo 10% das despesas (+${fmt(effExpense * 0.1)}/mês = ${fmt(optimizedPace)}/mês):** o prazo cai para **${monthsOptimized} meses** (${Math.max(0, monthsFromZero - monthsOptimized)} meses mais rápido!)`
            : '',
          ``,
          `*Observação: projeção calculada apenas com seus aportes reais, sem prometer rentabilidades garantidas.*`
        ].filter(Boolean).join('\n');
      }

      // Intenção 6: Estou gastando mais do que ganho?
      if (
        qNorm.includes('gastando mais do que ganho') ||
        qNorm.includes('gasto mais do que ganho') ||
        qNorm.includes('no vermelho') ||
        qNorm.includes('no azul') ||
        qNorm.includes('equilibrio') ||
        qNorm.includes('deficit')
      ) {
        if (m.income <= 0 && m.expense <= 0) {
          return [
            `Em **${ctx.periodLabel}**, ainda não há receitas nem despesas registradas para comparar.`,
            ``,
            `- **Média histórica de receitas:** ${fmt(m.avgHistoricalIncome)}`,
            `- **Média histórica de despesas:** ${fmt(m.avgHistoricalExpense)}`,
            `- **Saldo médio mensal histórico:** ${fmt(m.avgHistoricalSavings)}`
          ].join('\n');
        }

        if (m.expense > m.income) {
          const deficit = m.expense - m.income;
          return [
            `🔴 **Sim.** Em **${ctx.periodLabel}**, você está gastando **${fmt(deficit)} a mais** do que ganha.`,
            ``,
            `**Balanço do período (${ctx.periodLabel}):**`,
            `- **Receitas:** ${fmt(m.income)}`,
            `- **Despesas:** ${fmt(m.expense)}`,
            `- **Déficit no período:** **-${fmt(deficit)}** (${m.income > 0 ? `comprometimento de **${fmtPct(m.incomeCommitmentPct || 0)}** da renda` : 'sem receita registrada no período'})`,
            topCat ? `- **Principal foco de gastos:** **${topCat.icon} ${topCat.name}** com **${fmt(topCat.amount)}** (${fmtPct(topCat.percentageOfExpense)} das despesas)` : '',
            ``,
            `**Como reverter para o azul:**`,
            `1. Estabeleça um teto imediato na categoria **${topCat ? topCat.name : 'de maior gasto'}** para cortar pelo menos **${fmt(Math.min(deficit, topCat ? topCat.amount * 0.3 : deficit))}**.`,
            `2. Evite parcelamentos novos até que as despesas voltem a ficar abaixo de **80% da sua renda (${fmt(m.income * 0.8)})**.`
          ].filter(Boolean).join('\n');
        }

        const commitment = m.incomeCommitmentPct || 0;
        return [
          `🟢 **Não!** Em **${ctx.periodLabel}**, você está vivendo **dentro da sua renda** e com saldo positivo de **${fmt(m.monthlySavings)}**.`,
          ``,
          `**Balanço do período (${ctx.periodLabel}):**`,
          `- **Receitas:** ${fmt(m.income)}`,
          `- **Despesas:** ${fmt(m.expense)} (**${fmtPct(commitment)}** da sua renda)`,
          `- **Sobra líquida (Economia):** **+${fmt(m.monthlySavings)}** (**${fmtPct(m.savingsRatePct || 0)}** da renda poupada)`,
          `- **Nota de Saúde Financeira:** **${ctx.health.score !== null ? `${ctx.health.score}/100 (${ctx.health.classification})` : 'Em formação'}**`,
          ``,
          commitment > 80
            ? `⚠️ **Atenção preventiva:** Apesar de fechar no azul, suas despesas já comprometem **${fmtPct(commitment)}** da renda. Tente ampliar sua margem de segurança para pelo menos 20% da receita.`
            : `✅ **Ótimo controle:** Seu comprometimento de renda está em patamar saudável (abaixo de 80%).`
        ].join('\n');
      }

      // Intenção 7: Como posso organizar melhor minha renda?
      if (
        qNorm.includes('organizar') ||
        qNorm.includes('dividir minha renda') ||
        qNorm.includes('planejar') ||
        qNorm.includes('melhorar minha vida financeira') ||
        qNorm.includes('dica') ||
        qNorm.includes('regra 50') ||
        qNorm.includes('orcamento')
      ) {
        const baseIncome = effIncome > 0 ? effIncome : 0;
        if (baseIncome <= 0) {
          return [
            `Para montar uma distribuição personalizada da sua renda (como o método **50 / 30 / 20**), preciso que você tenha pelo menos uma **receita mensal** cadastrada.`,
            ``,
            `- **Despesas registradas em ${ctx.periodLabel}:** ${fmt(m.expense)}`,
            topCat ? `- **Maior categoria atual:** ${topCat.icon} ${topCat.name} (${fmt(topCat.amount)})` : '',
            ``,
            `Cadastre sua receita mensal na aba **Transações** e pergunte novamente para ver os valores exatos sugeridos para o seu orçamento!`
          ].filter(Boolean).join('\n');
        }

        const idealEssenciais = baseIncome * 0.5;
        const idealEstiloVida = baseIncome * 0.3;
        const idealFuturo = baseIncome * 0.2;

        return [
          `Com base na sua receita de **${fmt(baseIncome)}** (${ctx.hasPeriodData && m.income > 0 ? ctx.periodLabel : 'média histórica'}), veja como organizar sua renda de forma prática usando a metodologia **50 / 30 / 20**:`,
          ``,
          `**1. Divisão ideal sugerida para a sua renda de ${fmt(baseIncome)}:**`,
          `- **50% para Despesas Essenciais (${fmt(idealEssenciais)}):** moradia, contas básicas, supermercado, saúde e transporte.`,
          `- **30% para Estilo de Vida e Variáveis (${fmt(idealEstiloVida)}):** lazer, restaurantes, compras pessoais e assinaturas.`,
          `- **20% para o seu Futuro e Metas (${fmt(idealFuturo)}):** reserva de emergência (Caixinhas) e aportes em Investimentos.`,
          ``,
          `**2. Comparação com a sua realidade atual (${ctx.periodLabel}):**`,
          `- **Gastos totais atuais:** ${fmt(effExpense)} (${effIncome > 0 ? fmtPct((effExpense / baseIncome) * 100) : '—'} da renda vs. 80% recomendados)`,
          `- **Economia atual:** ${fmt(effSavings)} (${effIncome > 0 ? fmtPct((effSavings / baseIncome) * 100) : '—'} da renda vs. 20% recomendados)`,
          topCat ? `- **Categoria que exige mais atenção:** **${topCat.icon} ${topCat.name}** (${fmt(topCat.amount)}${secondCat ? `, seguida por **${secondCat.icon} ${secondCat.name}** com ${fmt(secondCat.amount)}` : ''}).` : '',
          ``,
          `**3. Próximo passo prático:**`,
          effSavings < idealFuturo
            ? `- Para atingir os **20% de poupança (${fmt(idealFuturo)}/mês)**, reduza gradualmente cerca de **${fmt(Math.max(0, idealFuturo - Math.max(0, effSavings)))}** nas suas maiores categorias.`
            : `- Você já poupa acima dos 20% recomendados! Mantenha seus aportes regulares nas abas **Caixinhas** e **Investimentos**.`
        ].filter(Boolean).join('\n');
      }

      // Resposta geral contextualizada para qualquer outra pergunta sobre a conta
      return [
        `Analisei os seus dados financeiros reais em **${ctx.periodLabel}** para responder à sua pergunta:`,
        ``,
        `**Panorama da sua conta (${ctx.periodLabel}):**`,
        `- **Receitas no período:** ${fmt(m.income)}`,
        `- **Despesas no período:** ${fmt(m.expense)}${m.incomeCommitmentPct !== null ? ` (${fmtPct(m.incomeCommitmentPct)} da renda)` : ''}`,
        `- **Economia / Saldo do período:** **${fmt(m.monthlySavings)}**`,
        `- **Saúde Financeira:** ${ctx.health.hasSufficientData ? `**${ctx.health.score}/100 (${ctx.health.classification})**` : 'Aguardando mais lançamentos no período'}`,
        topCat ? `- **Maior gasto do período:** **${topCat.icon} ${topCat.name}** (${fmt(topCat.amount)} — ${fmtPct(topCat.percentageOfExpense)} das despesas)` : '',
        `- **Patrimônio Consolidado:** **${fmt(m.totalNetWorth)}** (Conta: ${fmt(m.totalAccountBalance)} | Caixinhas: ${fmt(m.totalCaixinhasBalance)} | Investimentos: ${fmt(m.totalInvestmentsValue)})`,
        ``,
        `**Recomendações práticas para o seu momento:**`,
        m.monthlySavings < 0
          ? `- Suas despesas superaram as receitas em **${fmt(Math.abs(m.monthlySavings))}**. Priorize reduzir gastos em **${topCat ? topCat.name : 'despesas variáveis'}** para reequilibrar o caixa.`
          : m.monthlySavings > 0
            ? `- Você está com saldo positivo de **${fmt(m.monthlySavings)}**. Considere direcionar parte desse valor para suas **Caixinhas** ou **Investimentos**.`
            : `- Registre novas transações ou selecione uma das perguntas sugeridas para simular metas específicas (ex.: *"Como posso economizar R$ 500 por mês?"*).`
      ].filter(Boolean).join('\n');
    },

    /**
     * Formata markdown simples (negrito, listas com marcadores, listas numeradas e parágrafos)
     * em HTML seguro (com escape de caracteres HTML antes da formatação).
     */
    formatMarkdownToHtml(rawText) {
      if (!rawText) return '';
      const escaped = Utils.escapeHtml(String(rawText));
      const withBold = escaped
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');

      const lines = withBold.split(/\r?\n/);
      const htmlParts = [];
      let inUl = false;
      let inOl = false;

      const closeLists = () => {
        if (inUl) {
          htmlParts.push('</ul>');
          inUl = false;
        }
        if (inOl) {
          htmlParts.push('</ol>');
          inOl = false;
        }
      };

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) {
          closeLists();
          continue;
        }

        const ulMatch = line.match(/^[-•]\s+(.*)$/);
        if (ulMatch) {
          if (inOl) {
            htmlParts.push('</ol>');
            inOl = false;
          }
          if (!inUl) {
            htmlParts.push('<ul>');
            inUl = true;
          }
          htmlParts.push(`<li>${ulMatch[1]}</li>`);
          continue;
        }

        const olMatch = line.match(/^\d+\.\s+(.*)$/);
        if (olMatch) {
          if (inUl) {
            htmlParts.push('</ul>');
            inUl = false;
          }
          if (!inOl) {
            htmlParts.push('<ol>');
            inOl = true;
          }
          htmlParts.push(`<li>${olMatch[1]}</li>`);
          continue;
        }

        closeLists();
        htmlParts.push(`<p>${line}</p>`);
      }

      closeLists();
      return htmlParts.join('');
    },

    /**
     * Executa bateria de testes automatizados nas 3 situações financeiras exigidas:
     * 1. Usuário sem histórico;
     * 2. Usuário endividado (gastando mais do que ganha);
     * 3. Usuário que consegue economizar.
     */
    runSelfTest() {
      const sampleCategories = [
        { id: 'cat-food', name: 'Alimentação', type: 'expense', icon: '🍔', color: '#ef4444' },
        { id: 'cat-home', name: 'Moradia', type: 'expense', icon: '🏠', color: '#3b82f6' },
        { id: 'cat-fun', name: 'Lazer', type: 'expense', icon: '🎬', color: '#8b5cf6' },
        { id: 'cat-sal', name: 'Salário', type: 'income', icon: '💰', color: '#10b981' }
      ];

      // 1. Perfil: Sem histórico
      const emptyReport = FinancialIntelligenceEngine.analyze({
        month: 3,
        year: 2026,
        transactions: [],
        categories: sampleCategories,
        caixinhas: [],
        investments: [],
        investmentTransactions: [],
        dividends: [],
        investmentGoals: [],
        portfolioSnapshots: []
      });
      const emptyCtx = this.buildMinimalContext(emptyReport);

      // 2. Perfil: Endividado (R$ 3.500 receita vs R$ 4.800 despesa)
      const indebtedReport = FinancialIntelligenceEngine.analyze({
        month: 3,
        year: 2026,
        transactions: [
          { id: '1', type: 'income', amount: 3500, categoryId: 'cat-sal', date: '2026-03-05' },
          { id: '2', type: 'expense', amount: 2200, categoryId: 'cat-home', date: '2026-03-08' },
          { id: '3', type: 'expense', amount: 1600, categoryId: 'cat-food', date: '2026-03-14' },
          { id: '4', type: 'expense', amount: 1000, categoryId: 'cat-fun', date: '2026-03-20' }
        ],
        categories: sampleCategories,
        caixinhas: [],
        investments: [],
        investmentTransactions: [],
        dividends: [],
        investmentGoals: [],
        portfolioSnapshots: []
      });
      const indebtedCtx = this.buildMinimalContext(indebtedReport);

      // 3. Perfil: Poupador (R$ 8.000 receita vs R$ 4.500 despesa -> +R$ 3.500 economia)
      const saverReport = FinancialIntelligenceEngine.analyze({
        month: 3,
        year: 2026,
        transactions: [
          { id: '1', type: 'income', amount: 8000, categoryId: 'cat-sal', date: '2026-03-05' },
          { id: '2', type: 'expense', amount: 2200, categoryId: 'cat-home', date: '2026-03-10' },
          { id: '3', type: 'expense', amount: 1500, categoryId: 'cat-food', date: '2026-03-15' },
          { id: '4', type: 'expense', amount: 800, categoryId: 'cat-fun', date: '2026-03-18' }
        ],
        categories: sampleCategories,
        caixinhas: [{ id: 'c1', name: 'Reserva', balance: 4000, target: 10000 }],
        investments: [{ id: 'i1', name: 'Tesouro Selic', quantity: 1, averagePrice: 2000, currentPrice: 2100 }],
        investmentTransactions: [],
        dividends: [],
        investmentGoals: [],
        portfolioSnapshots: []
      });
      const saverCtx = this.buildMinimalContext(saverReport);

      const results = [
        {
          scenario: '1. Usuário sem histórico',
          question: 'Quanto posso gastar até o final do mês?',
          answer: this.generateLocalAnalyticalAnswer('Quanto posso gastar até o final do mês?', emptyCtx),
          passed: this.generateLocalAnalyticalAnswer('Quanto posso gastar até o final do mês?', emptyCtx).includes('não há dados financeiros suficientes')
        },
        {
          scenario: '2. Usuário endividado (R$ 3.500 receita vs R$ 4.800 despesa)',
          question: 'Estou gastando mais do que ganho?',
          answer: this.generateLocalAnalyticalAnswer('Estou gastando mais do que ganho?', indebtedCtx),
          passed:
            this.generateLocalAnalyticalAnswer('Estou gastando mais do que ganho?', indebtedCtx).includes('Sim') &&
            this.generateLocalAnalyticalAnswer('Estou gastando mais do que ganho?', indebtedCtx).includes('1.300,00')
        },
        {
          scenario: '3. Usuário poupador (R$ 8.000 receita vs R$ 4.500 despesa)',
          question: 'Quanto tempo vou levar para juntar R$ 10.000?',
          answer: this.generateLocalAnalyticalAnswer('Quanto tempo vou levar para juntar R$ 10.000?', saverCtx),
          passed:
            this.generateLocalAnalyticalAnswer('Quanto tempo vou levar para juntar R$ 10.000?', saverCtx).includes('3 meses') &&
            this.generateLocalAnalyticalAnswer('Quanto consegui economizar?', saverCtx).includes('3.500,00')
        }
      ];

      return {
        allPassed: results.every(r => r.passed),
        results
      };
    }
  };

  // =========================================================================
  // VIEW: INTELIGÊNCIA FINANCEIRA (DIAGNÓSTICO COMPLETO + ASSISTENTE IA)
  // =========================================================================
  const IntelligenceView = {
    container: null,
    selectedMonth: null,
    selectedYear: null,
    lastReport: null,
    activeTab: 'overview', // 'overview' (Inteligência Financeira) | 'assistant' (Assistente IA)
    isAssistantLoading: false,

    init(containerElement) {
      this.container = containerElement;
      const today = new Date();
      this.selectedMonth = State.dashboardFilter.month || (today.getMonth() + 1);
      this.selectedYear = State.dashboardFilter.year || today.getFullYear();

      State.subscribe((event, payload) => {
        if (['transaction_saved', 'transaction_deleted', 'category_saved', 'category_deleted', 'caixinhas_updated', 'investments_updated', 'balance_visibility_changed', 'theme_changed'].includes(event)) {
          if (event === 'transaction_saved' && payload && payload.date) {
            const parts = String(payload.date).split('-');
            if (parts.length >= 2) {
              this.selectedYear = parseInt(parts[0], 10);
              if (this.selectedMonth !== 'all') {
                this.selectedMonth = parseInt(parts[1], 10);
              }
            }
          }
          if (State.currentView === 'intelligence' || State.currentView === 'assistant') {
            this.render();
          }
        }
      });

      window.addEventListener('resize', () => {
        if ((State.currentView === 'intelligence' || State.currentView === 'assistant') && this.activeTab === 'overview') {
          this.renderCharts();
        }
      });
    },

    /**
     * Alterna entre a página principal de Inteligência Financeira ('overview')
     * e o Assistente IA ('assistant'), sincronizando o menu lateral e o cabeçalho.
     */
    setTab(tabName) {
      const target = tabName === 'assistant' ? 'assistant' : 'overview';
      this.activeTab = target;

      const viewRoute = target === 'assistant' ? 'assistant' : 'intelligence';
      State.setView(viewRoute);

      document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-view') === viewRoute) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      const headerTitle = document.getElementById('header-page-title');
      const headerBreadcrumb = document.getElementById('header-breadcrumb');
      if (target === 'assistant') {
        if (headerTitle) headerTitle.textContent = 'Assistente IA Financeiro';
        if (headerBreadcrumb) headerBreadcrumb.textContent = 'Início / Inteligência Financeira / Assistente IA';
      } else {
        if (headerTitle) headerTitle.textContent = 'Inteligência Financeira';
        if (headerBreadcrumb) headerBreadcrumb.textContent = 'Início / Inteligência Financeira';
      }

      this.render();
    },

    render() {
      if (!this.container) this.container = document.getElementById('view-intelligence');
      if (!this.container) return;

      const allTransactions = Storage.getTransactions();
      const settings = Storage.getSettings();
      const privacyClass = settings.hideBalances ? 'privacy-blurred' : '';

      const today = new Date();
      if (!this.selectedYear) this.selectedYear = today.getFullYear();
      if (!this.selectedMonth) this.selectedMonth = today.getMonth() + 1;

      const availableYears = Array.from(new Set(
        allTransactions.map(t => t.date ? parseInt(t.date.split('-')[0], 10) : null).filter(Boolean)
      )).sort((a, b) => b - a);
      if (!availableYears.includes(today.getFullYear())) {
        availableYears.unshift(today.getFullYear());
      }
      if (!availableYears.includes(this.selectedYear)) {
        availableYears.push(this.selectedYear);
        availableYears.sort((a, b) => b - a);
      }

      const report = FinancialIntelligenceEngine.analyze({
        month: this.selectedMonth,
        year: this.selectedYear
      });
      this.lastReport = report;

      const { health, metrics, period, insights, improvements, projections, categoryBreakdown } = report;

      // Configuração do anel SVG de pontuação (0 a 100)
      const radius = 58;
      const circumference = 2 * Math.PI * radius;
      const pctScore = health.hasSufficientData ? Math.max(0, Math.min(100, health.score)) : 0;
      const dashOffset = circumference - (pctScore / 100) * circumference;

      const commitmentBarWidth = metrics.incomeCommitmentPct !== null
        ? Math.min(100, Math.max(0, metrics.incomeCommitmentPct))
        : (metrics.expense > 0 ? 100 : 0);
      const commitmentColor = metrics.incomeCommitmentPct === null
        ? '#f59e0b'
        : metrics.incomeCommitmentPct <= 70
          ? '#10b981'
          : metrics.incomeCommitmentPct <= 90
            ? '#f59e0b'
            : '#ef4444';

      const chatHistory = FinancialAssistantService.getHistory();

      this.container.innerHTML = `
        <div class="fi-page-container">
          <!-- Cabeçalho Premium de Inteligência Financeira -->
          <div class="fi-hero-banner">
            <div class="fi-hero-left">
              <div class="fi-ai-badge-icon">
                ${Utils.icons.sparkles}
              </div>
              <div>
                <div class="fi-hero-tag">
                  <span>✨ Motor Analítico & Assistente IA</span>
                </div>
                <h2 class="fi-hero-title">Inteligência Financeira</h2>
                <p class="fi-hero-subtitle">
                  Diagnóstico automático da sua saúde financeira, padrões de consumo, simulações de economia e Assistente Financeiro com Inteligência Artificial.
                </p>
              </div>
            </div>

            <div class="fi-period-controls">
              <label class="sr-only" for="fi-select-month">Mês de Análise</label>
              <select id="fi-select-month" title="Selecionar mês de análise">
                <option value="all" ${this.selectedMonth === 'all' ? 'selected' : ''}>Todos os Meses (Ano)</option>
                ${Array.from({ length: 12 }, (_, i) => `
                  <option value="${i + 1}" ${this.selectedMonth === (i + 1) ? 'selected' : ''}>${Utils.getMonthName(i)}</option>
                `).join('')}
              </select>
              <span style="color: rgba(255,255,255,0.35);">|</span>
              <label class="sr-only" for="fi-select-year">Ano de Análise</label>
              <select id="fi-select-year" title="Selecionar ano de análise">
                ${availableYears.map(y => `
                  <option value="${y}" ${this.selectedYear === y ? 'selected' : ''}>${y}</option>
                `).join('')}
              </select>
            </div>
          </div>

          <!-- Sub-navegação: Inteligência Financeira vs Assistente IA -->
          <div class="fi-subnav-bar" role="tablist" aria-label="Áreas da Inteligência Financeira">
            <button
              type="button"
              role="tab"
              id="fi-subtab-overview"
              aria-selected="${this.activeTab === 'overview'}"
              class="fi-subnav-btn ${this.activeTab === 'overview' ? 'active' : ''}"
              data-fi-tab="overview"
            >
              <span>✨</span>
              <span>Inteligência Financeira (Análises & Gráficos)</span>
            </button>
            <button
              type="button"
              role="tab"
              id="fi-subtab-assistant"
              aria-selected="${this.activeTab === 'assistant'}"
              class="fi-subnav-btn ${this.activeTab === 'assistant' ? 'active' : ''}"
              data-fi-tab="assistant"
            >
              <span>🤖</span>
              <span>Assistente IA (Chat Financeiro)</span>
              <span class="fi-subnav-badge">${chatHistory.length > 0 ? `${chatHistory.length}` : 'Novo'}</span>
            </button>
          </div>

          ${this.activeTab === 'assistant'
            ? this.renderAssistantSection(report, privacyClass)
            : `
          <!-- Banner de Acesso Rápido ao Assistente IA -->
          <div class="fi-assistant-promo-banner">
            <div class="fi-assistant-promo-left">
              <div class="fi-assistant-promo-icon">🤖</div>
              <div class="fi-assistant-promo-text">
                <h4>Converse com o seu Assistente Financeiro IA</h4>
                <p>Tire dúvidas em linguagem natural sobre seus gastos em ${Utils.escapeHtml(period.label)}, metas de economia e organização da renda.</p>
                <div class="fi-assistant-promo-quick">
                  <button type="button" class="fi-quick-ask-chip" data-quick-question="Quanto posso gastar até o final do mês?">
                    💬 Quanto posso gastar até o final do mês?
                  </button>
                  <button type="button" class="fi-quick-ask-chip" data-quick-question="Como posso economizar R$ 500 por mês?">
                    💬 Como economizar R$ 500/mês?
                  </button>
                  <button type="button" class="fi-quick-ask-chip" data-quick-question="Qual categoria está consumindo mais dinheiro?">
                    💬 Qual categoria consome mais?
                  </button>
                </div>
              </div>
            </div>
            <button type="button" class="btn btn-primary" id="fi-btn-open-assistant" style="white-space: nowrap;">
              ${Utils.icons.sparkles} Abrir Assistente IA
            </button>
          </div>

          <!-- Indicadores Rápidos do Período (${Utils.escapeHtml(period.label)}) -->
          <div class="fi-kpi-grid">
            <div class="fi-kpi-card">
              <span class="fi-kpi-label">Economia no Período</span>
              <div class="fi-kpi-value ${privacyClass} ${metrics.monthlySavings > 0 ? 'text-success' : metrics.monthlySavings < 0 ? 'text-danger' : ''}">
                ${report.hasPeriodData ? `${metrics.monthlySavings > 0 ? '+' : ''}${Utils.formatCurrency(metrics.monthlySavings)}` : '—'}
              </div>
              <div class="fi-kpi-meta">
                ${!report.hasPeriodData
                  ? '<span>Sem movimentações no período</span>'
                  : metrics.income > 0
                    ? `<span>Taxa de economia: <strong>${metrics.savingsRatePct}%</strong> da renda</span>`
                    : '<span>Cadastre receitas para medir a %</span>'}
              </div>
            </div>

            <div class="fi-kpi-card">
              <span class="fi-kpi-label">Comprometimento da Renda</span>
              <div class="fi-kpi-value" style="color: ${report.hasPeriodData ? commitmentColor : 'var(--text-primary)'};">
                ${!report.hasPeriodData
                  ? '—'
                  : metrics.incomeCommitmentPct !== null
                    ? `${metrics.incomeCommitmentPct}%`
                    : 'Sem receita'}
              </div>
              <div class="fi-kpi-meta">
                <span>${!report.hasPeriodData
                  ? 'Aguardando lançamentos'
                  : metrics.incomeCommitmentPct === null
                    ? `Despesas de ${Utils.formatCurrency(metrics.expense)}`
                    : metrics.incomeCommitmentPct <= 70
                      ? '🟢 Dentro do limite saudável (até 70%)'
                      : metrics.incomeCommitmentPct <= 95
                        ? '🟡 Atenção: margem reduzida'
                        : '🔴 Acima da capacidade mensal'}</span>
              </div>
            </div>

            <div class="fi-kpi-card">
              <span class="fi-kpi-label">Categoria de Maior Gasto</span>
              <div class="fi-kpi-value" style="font-size: 1.18rem; display: flex; align-items: center; gap: 6px;">
                ${report.topCategory
                  ? `<span>${report.topCategory.icon}</span> <span>${Utils.escapeHtml(report.topCategory.name)}</span>`
                  : '—'}
              </div>
              <div class="fi-kpi-meta ${privacyClass}">
                ${report.topCategory
                  ? `<span><strong>${Utils.formatCurrency(report.topCategory.amount)}</strong> (${report.topCategory.percentageOfExpense}% das despesas)</span>`
                  : '<span>Nenhuma despesa registrada no período</span>'}
              </div>
            </div>

            <div class="fi-kpi-card">
              <span class="fi-kpi-label">Variação vs. ${Utils.escapeHtml(period.prevLabel)}</span>
              <div class="fi-kpi-value ${privacyClass} ${metrics.expenseDelta !== null ? (metrics.expenseDelta <= 0 ? 'text-success' : 'text-danger') : ''}">
                ${metrics.expenseDelta !== null
                  ? `${metrics.expenseDelta > 0 ? '+' : ''}${Utils.formatCurrency(metrics.expenseDelta)}`
                  : 'Sem base anterior'}
              </div>
              <div class="fi-kpi-meta">
                ${metrics.expenseDelta !== null
                  ? `<span>${metrics.expenseDeltaPct !== null ? `${metrics.expenseDeltaPct > 0 ? '+' : ''}${metrics.expenseDeltaPct}% nas despesas` : 'Comparado ao período anterior'}</span>`
                  : '<span>Requer dados no período anterior</span>'}
              </div>
            </div>
          </div>

          <!-- Seção 4: Saúde Financeira (0 a 100) + Diagnóstico de Renda e Orçamento -->
          <div class="fi-top-grid">
            <!-- Card de Saúde Financeira -->
            <div class="fi-health-card">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-2);">
                <div>
                  <h3 class="card-title" style="margin: 0;">Indicador de Saúde Financeira</h3>
                  <p class="card-subtitle" style="margin: 2px 0 0 0;">Avaliação de 0 a 100 em ${Utils.escapeHtml(period.label)}</p>
                </div>
                <span class="fi-health-badge ${health.badgeClass}">${Utils.escapeHtml(health.classification)}</span>
              </div>

              ${!health.hasSufficientData ? `
                <div class="empty-state" style="padding: var(--spacing-6) var(--spacing-4);">
                  <div class="empty-state-icon">${Utils.icons.alertCircle}</div>
                  <h4 class="empty-state-title">Nota não exibida: dados insuficientes no período</h4>
                  <p class="empty-state-text" style="max-width: 460px; margin: 0 auto var(--spacing-4) auto;">
                    ${Utils.escapeHtml(health.summaryText)}
                  </p>
                  <button type="button" class="btn btn-primary btn-sm" id="fi-btn-add-tx-empty">
                    ${Utils.icons.plus} Registrar Movimentação
                  </button>
                </div>
              ` : `
                <div class="fi-health-main">
                  <div class="fi-score-ring-wrap">
                    <svg class="fi-score-ring-svg" viewBox="0 0 140 140">
                      <circle class="fi-score-ring-bg" cx="70" cy="70" r="${radius}"></circle>
                      <circle
                        class="fi-score-ring-fill"
                        cx="70"
                        cy="70"
                        r="${radius}"
                        stroke="${health.color}"
                        stroke-dasharray="${circumference.toFixed(2)}"
                        stroke-dashoffset="${dashOffset.toFixed(2)}"
                      ></circle>
                    </svg>
                    <div class="fi-score-center">
                      <span class="fi-score-number" style="color: ${health.color};">${health.score}</span>
                      <span class="fi-score-max">de 100 pts</span>
                    </div>
                  </div>

                  <div class="fi-health-summary">
                    <div class="fi-health-badge ${health.badgeClass}">
                      Classificação: ${Utils.escapeHtml(health.classification)}
                    </div>
                    <p style="font-size: var(--font-size-sm); color: var(--text-primary); font-weight: 500; line-height: 1.55; margin: 0;">
                      ${Utils.escapeHtml(health.summaryText)}
                    </p>
                  </div>
                </div>

                <div class="fi-factors-list">
                  <div style="font-size: var(--font-size-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted);">
                    Fatores que influenciaram sua pontuação
                  </div>
                  ${health.factors.map(f => {
                    const pct = Math.round((f.points / f.maxPoints) * 100);
                    return `
                      <div class="fi-factor-item">
                        <div class="fi-factor-header">
                          <span class="fi-factor-name">${Utils.escapeHtml(f.name)}</span>
                          <span class="fi-factor-pts">${f.points} / ${f.maxPoints} pts</span>
                        </div>
                        <div class="fi-factor-bar-track">
                          <div class="fi-factor-bar-fill" style="width: ${pct}%; background-color: ${f.color};"></div>
                        </div>
                        <span class="fi-factor-desc">${Utils.escapeHtml(f.description)}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              `}
            </div>

            <!-- Card de Comprometimento da Renda & Projeções de Economia -->
            <div class="fi-health-card" style="justify-content: space-between;">
              <div>
                <h3 class="card-title" style="margin: 0;">Raio-X do Orçamento & Projeções</h3>
                <p class="card-subtitle" style="margin: 2px 0 var(--spacing-4) 0;">Distribuição da renda e projeção de economia para os próximos meses</p>

                <!-- Barra de Comprometimento da Renda -->
                <div style="background: var(--bg-surface-secondary); padding: var(--spacing-4); border-radius: var(--radius-lg); margin-bottom: var(--spacing-4);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: var(--font-size-xs);">
                    <span style="font-weight: 600; color: var(--text-secondary);">Comprometimento da Renda pelas Despesas</span>
                    <strong style="color: ${commitmentColor};">
                      ${!report.hasPeriodData
                        ? 'Sem dados'
                        : metrics.incomeCommitmentPct !== null
                          ? `${metrics.incomeCommitmentPct}% da receita`
                          : 'Receita R$ 0,00'}
                    </strong>
                  </div>
                  <div class="caixinha-progress-track" style="height: 12px;">
                    <div class="caixinha-progress-fill" style="width: ${commitmentBarWidth}%; background: ${commitmentColor};"></div>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: var(--font-size-xs); color: var(--text-muted);" class="${privacyClass}">
                    <span>Receitas: <strong class="text-success">${Utils.formatCurrency(metrics.income)}</strong></span>
                    <span>Despesas: <strong class="text-danger">${Utils.formatCurrency(metrics.expense)}</strong></span>
                  </div>
                </div>
              </div>

              <!-- Projeções de Economia para os Próximos Meses -->
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-3);">
                  <span style="font-size: var(--font-size-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted);">
                    Projeções de Economia Futura
                  </span>
                  ${projections.hasProjectionData && projections.potentialReduction10 > 0 ? `
                    <span style="font-size: var(--font-size-xs); color: var(--color-primary); font-weight: 600;">
                      Com redução de 10% nos gastos: +${Utils.formatCurrency(projections.potentialReduction10)}/mês
                    </span>
                  ` : ''}
                </div>

                ${!projections.hasProjectionData ? `
                  <div style="padding: var(--spacing-4); background: var(--bg-surface-secondary); border-radius: var(--radius-lg); font-size: var(--font-size-xs); color: var(--text-muted); text-align: center;">
                    Registre receitas ou despesas neste período para calcular as projeções de economia para 3, 6 e 12 meses.
                  </div>
                ` : `
                  <div class="fi-projection-grid ${privacyClass}">
                    ${projections.horizons.map(h => `
                      <div class="fi-projection-card">
                        <span class="fi-projection-horizon">${h.label}</span>
                        <div class="fi-projection-val" title="Acumulado mantendo o ritmo atual">
                          ${Utils.formatCurrency(h.currentAccumulated)}
                        </div>
                        <span style="font-size: 0.72rem; color: var(--text-muted);">No ritmo atual</span>
                        ${projections.potentialReduction10 > 0 ? `
                          <div class="fi-projection-opt">
                            Otimizado (-10% gastos): ${Utils.formatCurrency(h.optimizedAccumulated)}
                          </div>
                        ` : ''}
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
            </div>
          </div>

          <!-- Seção 3: Insights Inteligentes -->
          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Insights Inteligentes</h3>
                <p class="card-subtitle">Análises automáticas extraídas das suas movimentações em ${Utils.escapeHtml(period.label)}</p>
              </div>
            </div>
            <div class="card-body">
              <div class="fi-insights-grid">
                ${insights.map(item => `
                  <div class="fi-insight-card ${item.type}">
                    <div class="fi-insight-icon">${item.icon}</div>
                    <div class="fi-insight-body">
                      <div class="fi-insight-tag">${Utils.escapeHtml(item.tag)}</div>
                      <h4 class="fi-insight-title ${privacyClass}">${Utils.escapeHtml(item.title)}</h4>
                      <p class="fi-insight-text ${privacyClass}">${Utils.escapeHtml(item.text)}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Seção 5: Recomendações Personalizadas ("O que posso melhorar?") -->
          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">O que posso melhorar?</h3>
                <p class="card-subtitle">Recomendações práticas e simulações reais calculadas a partir dos seus gastos</p>
              </div>
            </div>
            <div class="card-body">
              ${improvements.length === 0 ? `
                <div class="empty-state" style="padding: var(--spacing-6);">
                  <div class="empty-state-icon">💡</div>
                  <h4 class="empty-state-title">Ainda não há despesas para simular reduções neste período</h4>
                  <p class="empty-state-text">
                    Assim que você registrar despesas em ${Utils.escapeHtml(period.label)}, o Meu Controle calculará quanto você pode economizar em cada categoria.
                  </p>
                </div>
              ` : `
                <div class="fi-improve-grid">
                  ${improvements.map(imp => `
                    <div class="fi-improve-card">
                      <div>
                        <div class="fi-improve-header">
                          <div class="fi-improve-cat">
                            <span style="font-size: 1.3rem;">${imp.icon}</span>
                            <span>${Utils.escapeHtml(imp.title)}</span>
                          </div>
                          <span class="fi-improve-saving-pill ${privacyClass}">${Utils.escapeHtml(imp.badgeText)}</span>
                        </div>
                        <p style="font-size: var(--font-size-sm); color: var(--text-secondary); line-height: 1.55; margin: var(--spacing-3) 0 0 0;" class="${privacyClass}">
                          ${Utils.escapeHtml(imp.mainMessage)}
                        </p>
                      </div>

                      <div class="fi-improve-simulation-row ${privacyClass}">
                        ${imp.simulations.map(sim => `
                          <div>
                            <span class="fi-sim-box-label">${Utils.escapeHtml(sim.label)}</span>
                            <span class="fi-sim-box-val">${Utils.escapeHtml(sim.value)}</span>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>

          <!-- Seção 6: Comparação Mensal e Gráficos Reais -->
          <div class="fi-charts-grid">
            <!-- Gráfico 1: Receitas x Despesas por Mês -->
            <div class="card">
              <div class="card-header">
                <div>
                  <h3 class="card-title">Receitas e Despesas por Mês (${this.selectedYear})</h3>
                  <p class="card-subtitle">Comparativo mensal com dados reais do ano selecionado</p>
                </div>
              </div>
              <div class="card-body">
                ${report.activeMonthsInSelectedYear === 0 ? `
                  <div class="empty-state" style="padding: var(--spacing-6);">
                    <p class="empty-state-text">Nenhuma transação registrada em ${this.selectedYear}. Ainda faltam dados para exibir o gráfico mensal.</p>
                  </div>
                ` : `
                  ${report.activeMonthsInSelectedYear === 1 ? `
                    <div style="margin-bottom: var(--spacing-2); font-size: var(--font-size-xs); color: var(--text-muted); background: var(--bg-surface-secondary); padding: 6px 10px; border-radius: var(--radius-md);">
                      ℹ️ Apenas 1 mês possui movimentação registrada em ${this.selectedYear}. Adicione transações em outros meses para comparar a evolução.
                    </div>
                  ` : ''}
                  <div class="chart-container">
                    <canvas id="fi-chart-monthly-bars"></canvas>
                  </div>
                `}
              </div>
            </div>

            <!-- Gráfico 2: Evolução da Economia Mensal -->
            <div class="card">
              <div class="card-header">
                <div>
                  <h3 class="card-title">Evolução da Economia</h3>
                  <p class="card-subtitle">Saldo economizado (Receitas - Despesas) nos meses com registro</p>
                </div>
              </div>
              <div class="card-body">
                ${report.activeMonthsCount === 0 ? `
                  <div class="empty-state" style="padding: var(--spacing-6);">
                    <p class="empty-state-text">Ainda faltam dados históricos de transações para exibir a evolução da economia.</p>
                  </div>
                ` : `
                  ${report.activeMonthsCount === 1 ? `
                    <div style="margin-bottom: var(--spacing-2); font-size: var(--font-size-xs); color: var(--text-muted); background: var(--bg-surface-secondary); padding: 6px 10px; border-radius: var(--radius-md);">
                      ℹ️ Exibindo o único mês com histórico registrado (${Utils.escapeHtml(report.activeMonths[0].fullLabel)}).
                    </div>
                  ` : ''}
                  <div class="chart-container">
                    <canvas id="fi-chart-savings-evolution"></canvas>
                  </div>
                `}
              </div>
            </div>

            <!-- Gráfico 3: Gastos por Categoria no Período -->
            <div class="card">
              <div class="card-header">
                <div>
                  <h3 class="card-title">Gastos por Categoria</h3>
                  <p class="card-subtitle">Distribuição real das despesas em ${Utils.escapeHtml(period.label)}</p>
                </div>
              </div>
              <div class="card-body">
                ${categoryBreakdown.length === 0 ? `
                  <div class="empty-state" style="padding: var(--spacing-6);">
                    <p class="empty-state-text">Nenhuma despesa registrada em ${Utils.escapeHtml(period.label)} para exibir o gráfico por categoria.</p>
                  </div>
                ` : `
                  <div class="chart-container">
                    <canvas id="fi-chart-categories-donut"></canvas>
                  </div>
                `}
              </div>
            </div>

            <!-- Gráfico 4: Evolução do Patrimônio Investido -->
            <div class="card">
              <div class="card-header">
                <div>
                  <h3 class="card-title">Evolução do Patrimônio Investido</h3>
                  <p class="card-subtitle">Histórico real de investimentos e snapshots da carteira</p>
                </div>
              </div>
              <div class="card-body">
                ${report.wealthSeries.length < 2 ? `
                  <div class="empty-state" style="padding: var(--spacing-6);">
                    <p class="empty-state-text">
                      ${metrics.totalInvestmentsValue > 0
                        ? `Seu patrimônio investido atual é de ${Utils.formatCurrency(metrics.totalInvestmentsValue)}, mas ainda faltam registros em datas/meses distintos para traçar o gráfico de evolução.`
                        : 'Você ainda não possui histórico suficiente de investimentos para exibir o gráfico de evolução patrimonial.'}
                    </p>
                  </div>
                ` : `
                  <div class="chart-container">
                    <canvas id="fi-chart-wealth-evolution"></canvas>
                  </div>
                `}
              </div>
            </div>
          </div>
          `}
        </div>
      `;

      this.bindEvents();
      if (this.activeTab === 'overview') {
        requestAnimationFrame(() => this.renderCharts());
      } else {
        this.scrollToBottomOfChat();
      }
    },

    renderAssistantSection(report, privacyClass) {
      const history = FinancialAssistantService.getHistory();
      const { metrics, period, health } = report;

      const welcomeMessageHtml = `
        <div class="fi-chat-row assistant">
          <div class="fi-chat-msg-avatar">🤖</div>
          <div class="fi-chat-bubble-wrap">
            <div class="fi-chat-bubble ${privacyClass}">
              <p>Olá! Eu sou o <strong>Assistente IA do Meu Controle</strong>. Analiso em tempo real suas receitas, despesas, categorias, metas e investimentos de <strong>${Utils.escapeHtml(period.label)}</strong> para responder suas dúvidas com precisão.</p>
              <p>Escolha uma das sugestões de perguntas ou digite sua dúvida abaixo:</p>
            </div>
            <span class="fi-chat-meta">Assistente IA • Dados reais da sua conta</span>
          </div>
        </div>
      `;

      const historyHtml = history.map(msg => {
        const isUser = msg.role === 'user';
        const timeStr = msg.timestamp
          ? new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          : '';
        return `
          <div class="fi-chat-row ${isUser ? 'user' : 'assistant'}">
            <div class="fi-chat-msg-avatar">${isUser ? '👤' : '🤖'}</div>
            <div class="fi-chat-bubble-wrap">
              <div class="fi-chat-bubble ${!isUser ? privacyClass : ''}">
                ${isUser ? `<p>${Utils.escapeHtml(msg.content)}</p>` : FinancialAssistantService.formatMarkdownToHtml(msg.content)}
              </div>
              <span class="fi-chat-meta">${isUser ? 'Você' : 'Assistente IA'}${timeStr ? ` • ${timeStr}` : ''}</span>
            </div>
          </div>
        `;
      }).join('');

      const typingIndicatorHtml = this.isAssistantLoading ? `
        <div class="fi-chat-row assistant" id="fi-chat-typing-row">
          <div class="fi-chat-msg-avatar">🤖</div>
          <div class="fi-chat-bubble-wrap">
            <div class="fi-typing-indicator" aria-live="polite">
              <span class="fi-typing-dots">
                <span class="fi-typing-dot"></span>
                <span class="fi-typing-dot"></span>
                <span class="fi-typing-dot"></span>
              </span>
              <span>Analisando seus dados financeiros de ${Utils.escapeHtml(period.label)}...</span>
            </div>
          </div>
        </div>
      ` : '';

      return `
        <div class="fi-chat-layout">
          <!-- Card Principal do Chat -->
          <div class="fi-chat-card">
            <div class="fi-chat-header">
              <div class="fi-chat-agent-info">
                <div class="fi-chat-agent-avatar">✨</div>
                <div>
                  <h3 class="fi-chat-agent-title">Assistente IA Financeiro</h3>
                  <div class="fi-chat-agent-status">
                    <span class="fi-status-dot"></span>
                    <span>Conectado aos seus dados de ${Utils.escapeHtml(period.label)}</span>
                  </div>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 8px;">
                ${history.length > 0 ? `
                  <button type="button" class="btn btn-secondary btn-sm" id="fi-btn-clear-chat" title="Limpar histórico de conversa">
                    ${Utils.icons.trash} Limpar conversa
                  </button>
                ` : ''}
              </div>
            </div>

            <!-- Histórico de Mensagens -->
            <div class="fi-chat-messages" id="fi-chat-messages-list" role="log" aria-live="polite">
              ${welcomeMessageHtml}
              ${historyHtml}
              ${typingIndicatorHtml}
            </div>

            <!-- Barra rápida de sugestões de perguntas -->
            <div class="fi-chat-suggestions-bar">
              ${FinancialAssistantService.STARTER_QUESTIONS.slice(0, 4).map(q => `
                <button
                  type="button"
                  class="fi-suggestion-pill"
                  data-ask-question="${Utils.escapeHtml(q.text)}"
                  ${this.isAssistantLoading ? 'disabled' : ''}
                >
                  <span>${q.icon}</span>
                  <span>${Utils.escapeHtml(q.text)}</span>
                </button>
              `).join('')}
            </div>

            <!-- Campo de Entrada de Perguntas -->
            <form class="fi-chat-input-area" id="fi-chat-form">
              <div class="fi-chat-input-wrap">
                <input
                  type="text"
                  id="fi-chat-input"
                  class="fi-chat-input"
                  placeholder="Pergunte sobre seus gastos, economia, metas ou investimentos..."
                  autocomplete="off"
                  maxlength="500"
                  ${this.isAssistantLoading ? 'disabled' : ''}
                />
              </div>
              <button
                type="submit"
                class="fi-chat-send-btn"
                id="fi-chat-submit-btn"
                ${this.isAssistantLoading ? 'disabled' : ''}
              >
                <span>${this.isAssistantLoading ? 'Analisando...' : 'Enviar'}</span>
                <span>➤</span>
              </button>
            </form>
          </div>

          <!-- Painel Lateral: Sugestões de Perguntas + Resumo do Contexto Atual -->
          <div class="fi-chat-side-panel">
            <div class="fi-chat-side-card">
              <h4 class="fi-chat-side-title">
                <span>💡</span>
                <span>Sugestões para começar</span>
              </h4>
              <div class="fi-starter-questions-list">
                ${FinancialAssistantService.STARTER_QUESTIONS.map(q => `
                  <button
                    type="button"
                    class="fi-starter-question-btn"
                    data-ask-question="${Utils.escapeHtml(q.text)}"
                    ${this.isAssistantLoading ? 'disabled' : ''}
                  >
                    <span class="fi-starter-q-icon">${q.icon}</span>
                    <span>${Utils.escapeHtml(q.text)}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="fi-chat-side-card">
              <h4 class="fi-chat-side-title">
                <span>🔒</span>
                <span>Base de Dados da Análise (${Utils.escapeHtml(period.label)})</span>
              </h4>
              <div class="fi-context-mini-list ${privacyClass}">
                <div class="fi-context-mini-row">
                  <span>Receitas no período</span>
                  <strong class="text-success">${Utils.formatCurrency(metrics.income)}</strong>
                </div>
                <div class="fi-context-mini-row">
                  <span>Despesas no período</span>
                  <strong class="text-danger">${Utils.formatCurrency(metrics.expense)}</strong>
                </div>
                <div class="fi-context-mini-row">
                  <span>Saldo / Economia</span>
                  <strong class="${metrics.monthlySavings >= 0 ? 'text-success' : 'text-danger'}">${Utils.formatCurrency(metrics.monthlySavings)}</strong>
                </div>
                <div class="fi-context-mini-row">
                  <span>Saúde Financeira</span>
                  <strong>${health.hasSufficientData ? `${health.score}/100 (${Utils.escapeHtml(health.classification)})` : 'Sem nota'}</strong>
                </div>
                <div class="fi-context-mini-row">
                  <span>Caixinhas & Investimentos</span>
                  <strong>${Utils.formatCurrency(metrics.totalCaixinhasBalance + metrics.totalInvestmentsValue)}</strong>
                </div>
              </div>
              <p style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.45; margin: var(--spacing-3) 0 0 0;">
                🔒 Suas perguntas são processadas de forma segura via <strong>Supabase Edge Function</strong> usando exclusivamente os indicadores da sua conta.
              </p>
            </div>
          </div>
        </div>
      `;
    },

    scrollToBottomOfChat() {
      if (!this.container) return;
      const list = this.container.querySelector('#fi-chat-messages-list');
      if (list) {
        list.scrollTop = list.scrollHeight;
      }
    },

    async handleAskQuestion(rawQuestion) {
      const question = String(rawQuestion || '').trim();
      if (!question || this.isAssistantLoading) return;

      // Garante que estamos na aba do Assistente IA e sincroniza menu lateral
      this.activeTab = 'assistant';
      State.setView('assistant');
      document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-view') === 'assistant') {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      const history = FinancialAssistantService.getHistory();
      history.push({
        role: 'user',
        content: question,
        timestamp: new Date().toISOString()
      });
      FinancialAssistantService.saveHistory(history);

      this.isAssistantLoading = true;
      this.render();

      try {
        const response = await FinancialAssistantService.askQuestion(question);
        const answerText = (response && response.answer) || 'Não foi possível gerar a resposta no momento. Tente novamente.';
        const updatedHistory = FinancialAssistantService.getHistory();
        updatedHistory.push({
          role: 'assistant',
          content: answerText,
          provider: response ? response.provider : 'assistente-ia',
          timestamp: new Date().toISOString()
        });
        FinancialAssistantService.saveHistory(updatedHistory);
      } catch (err) {
        console.error('[Assistente IA] Erro ao processar pergunta:', err);
        try {
          const freshReport = FinancialIntelligenceEngine.analyze({
            month: this.selectedMonth || (new Date().getMonth() + 1),
            year: this.selectedYear || new Date().getFullYear()
          });
          this.lastReport = freshReport;
          const fallbackText = FinancialAssistantService.generateLocalAnalyticalAnswer(
            question,
            FinancialAssistantService.buildMinimalContext(freshReport)
          );
          const updatedHistory = FinancialAssistantService.getHistory();
          updatedHistory.push({
            role: 'assistant',
            content: String(fallbackText || 'Ocorreu uma oscilação na resposta. Por favor, tente novamente.'),
            provider: 'local-fallback',
            timestamp: new Date().toISOString()
          });
          FinancialAssistantService.saveHistory(updatedHistory);
        } catch (innerErr) {
          console.error('[Assistente IA] Erro crítico no fallback local:', innerErr);
          const updatedHistory = FinancialAssistantService.getHistory();
          updatedHistory.push({
            role: 'assistant',
            content: 'Desculpe, ocorreu uma instabilidade momentânea na análise das finanças. Por favor, clique novamente na pergunta desejada.',
            provider: 'error-safeguard',
            timestamp: new Date().toISOString()
          });
          FinancialAssistantService.saveHistory(updatedHistory);
        }
      } finally {
        this.isAssistantLoading = false;
        this.render();
        const inputEl = this.container ? this.container.querySelector('#fi-chat-input') : null;
        if (inputEl) inputEl.focus();
      }
    },

    bindEvents() {
      if (!this.container) return;

      const monthSelect = this.container.querySelector('#fi-select-month');
      const yearSelect = this.container.querySelector('#fi-select-year');

      if (monthSelect) {
        monthSelect.addEventListener('change', (e) => {
          this.selectedMonth = e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10);
          this.render();
        });
      }

      if (yearSelect) {
        yearSelect.addEventListener('change', (e) => {
          this.selectedYear = parseInt(e.target.value, 10);
          this.render();
        });
      }

      // Alternância entre subabas ("Inteligência Financeira" vs "Assistente IA")
      this.container.querySelectorAll('[data-fi-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetTab = btn.getAttribute('data-fi-tab');
          if (targetTab && targetTab !== this.activeTab) {
            this.setTab(targetTab);
          }
        });
      });

      const openAssistantBtn = this.container.querySelector('#fi-btn-open-assistant');
      if (openAssistantBtn) {
        openAssistantBtn.addEventListener('click', () => {
          this.setTab('assistant');
          const inputEl = this.container.querySelector('#fi-chat-input');
          if (inputEl) inputEl.focus();
        });
      }

      // Botões de pergunta rápida no banner da visão geral
      this.container.querySelectorAll('[data-quick-question]').forEach(btn => {
        btn.addEventListener('click', () => {
          const q = btn.getAttribute('data-quick-question');
          if (q) this.handleAskQuestion(q);
        });
      });

      // Botões de sugestões de perguntas dentro do Assistente IA
      this.container.querySelectorAll('[data-ask-question]').forEach(btn => {
        btn.addEventListener('click', () => {
          const q = btn.getAttribute('data-ask-question');
          if (q) this.handleAskQuestion(q);
        });
      });

      // Formulário de envio de pergunta do chat
      const chatForm = this.container.querySelector('#fi-chat-form');
      const chatInput = this.container.querySelector('#fi-chat-input');
      if (chatForm && chatInput) {
        chatForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const q = chatInput.value.trim();
          if (q) {
            chatInput.value = '';
            this.handleAskQuestion(q);
          }
        });
      }

      // Limpar histórico de conversa
      const clearChatBtn = this.container.querySelector('#fi-btn-clear-chat');
      if (clearChatBtn) {
        clearChatBtn.addEventListener('click', () => {
          FinancialAssistantService.clearHistory();
          Toast.info('Conversa limpa', 'O histórico de mensagens do Assistente IA foi reiniciado.');
          this.render();
        });
      }

      const addTxBtn = this.container.querySelector('#fi-btn-add-tx-empty');
      if (addTxBtn) {
        addTxBtn.addEventListener('click', () => {
          Modal.openTransactionModal(null, (newTx) => {
            Storage.saveTransaction(newTx);
            Toast.success('Movimentação Registrada!', 'Análise financeira atualizada.');
            State.notify('transaction_saved', newTx);
          });
        });
      }
    },

    renderCharts() {
      if (!this.container || !this.lastReport || this.activeTab !== 'overview') return;
      const report = this.lastReport;

      const barCanvas = this.container.querySelector('#fi-chart-monthly-bars');
      if (barCanvas && report.activeMonthsInSelectedYear > 0) {
        Charts.renderBarChart(barCanvas, report.yearlyMonthlyEvolution);
      }

      const savCanvas = this.container.querySelector('#fi-chart-savings-evolution');
      if (savCanvas && report.activeMonthsCount > 0) {
        Charts.renderSavingsEvolutionChart(savCanvas, report.activeMonths.slice(-12));
      }

      const catCanvas = this.container.querySelector('#fi-chart-categories-donut');
      if (catCanvas && report.categoryBreakdown.length > 0) {
        Charts.renderDonutChart(catCanvas, report.categoryBreakdown, report.metrics.expense);
      }

      const wealthCanvas = this.container.querySelector('#fi-chart-wealth-evolution');
      if (wealthCanvas && report.wealthSeries.length >= 2) {
        Charts.renderWealthEvolutionChart(wealthCanvas, report.wealthSeries);
      }
    }
  };


  // =========================================================================
  // 8. SUPABASE CLIENT, AUTHENTICATION, CLOUD DATABASE SYNC & MIGRATION
  // =========================================================================
  const SUPABASE_PUBLIC_CFG_KEY = 'meu_controle_supabase_public_config';
  const LEGACY_MIGRATED_META_KEY = 'meu_controle_legacy_migrated_meta';
  const LEGACY_ARCHIVE_KEY = 'meu_controle_legacy_archive_backup';

  const SupabaseService = {
    client: null,
    currentConfig: null,

    // Verifica e bloqueia chaves secretas (service_role / sb_secret_) para que nunca sejam usadas no navegador
    isSecretKey(key) {
      if (!key || typeof key !== 'string') return false;
      const trimmed = key.trim();
      if (/^sb_secret_/i.test(trimmed) || /service_role/i.test(trimmed)) return true;
      const parts = trimmed.split('.');
      if (parts.length === 3) {
        try {
          const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
          const payload = JSON.parse(payloadJson);
          if (payload && (payload.role === 'service_role' || payload.role === 'supabase_admin')) {
            return true;
          }
        } catch (_) {}
      }
      return false;
    },

    getConfig() {
      const fileCfg = (typeof window !== 'undefined' && window.MEU_CONTROLE_SUPABASE_CONFIG) || {};
      let storedCfg = {};
      try {
        const raw = localStorage.getItem(SUPABASE_PUBLIC_CFG_KEY);
        if (raw) storedCfg = JSON.parse(raw) || {};
      } catch (_) {}

      const url = String(
        fileCfg.SUPABASE_URL ||
        storedCfg.SUPABASE_URL ||
        'https://ldpiczzupbdbibwlejbf.supabase.co'
      ).trim().replace(/\/+$/, '');
      const anonKey = String(
        fileCfg.SUPABASE_ANON_KEY ||
        storedCfg.SUPABASE_ANON_KEY ||
        'sb_publishable_iQHbtYAzYIi7bSQc0U8Gww_v8eW0dUu'
      ).trim();
      return { url, anonKey };
    },

    isConfigured() {
      const { url, anonKey } = this.getConfig();
      return Boolean(url && /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) && anonKey && !this.isSecretKey(anonKey));
    },

    savePublicConfig(url, anonKey) {
      const cleanUrl = String(url || '').trim().replace(/\/+$/, '');
      const cleanKey = String(anonKey || '').trim();
      if (!cleanUrl || !/^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+/i.test(cleanUrl)) {
        throw new Error('Informe uma URL válida do projeto Supabase (ex: https://seuprojeto.supabase.co).');
      }
      if (!cleanKey) {
        throw new Error('Informe a chave pública (anon / publishable key) do projeto Supabase.');
      }
      if (this.isSecretKey(cleanKey)) {
        throw new Error('Chave secreta (service_role) detectada e bloqueada por segurança! Nunca utilize a chave service_role no navegador. Use apenas a chave pública "anon" / "publishable".');
      }
      localStorage.setItem(SUPABASE_PUBLIC_CFG_KEY, JSON.stringify({
        SUPABASE_URL: cleanUrl,
        SUPABASE_ANON_KEY: cleanKey
      }));
      this.client = null;
      return this.getClient();
    },

    getClient() {
      const { url, anonKey } = this.getConfig();
      if (!url || !anonKey) return null;
      if (this.isSecretKey(anonKey)) {
        console.error('[Segurança] Chave service_role bloqueada no cliente.');
        return null;
      }
      if (this.client && this.currentConfig && this.currentConfig.url === url && this.currentConfig.anonKey === anonKey) {
        return this.client;
      }
      if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        console.error('[SupabaseService] SDK @supabase/supabase-js não carregado.');
        return null;
      }
      this.currentConfig = { url, anonKey };
      const authStorageAdapter = {
        getItem: (key) => {
          try {
            return localStorage.getItem(key) || sessionStorage.getItem(key);
          } catch (_) {
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            const remember = localStorage.getItem('meu_controle_remember_me') !== '0';
            if (remember) {
              localStorage.setItem(key, value);
              sessionStorage.removeItem(key);
            } else {
              sessionStorage.setItem(key, value);
              localStorage.removeItem(key);
            }
          } catch (_) {}
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
          } catch (_) {}
        }
      };
      this.client = window.supabase.createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'meu_controle_supabase_auth_token',
          storage: authStorageAdapter
        }
      });
      return this.client;
    }
  };

  // =========================================================================
  // MIGRAÇÃO SEGURA DOS DADOS EXISTENTES PARA A CONTA INICIAL
  // =========================================================================
  const LegacyMigrationService = {
    getMigratedMeta() {
      try {
        const raw = localStorage.getItem(LEGACY_MIGRATED_META_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (_) {
        return null;
      }
    },

    // Lê os dados existentes nas chaves globais antigas (ou no arquivo de backup legado)
    readLegacySnapshot() {
      try {
        const archivedRaw = localStorage.getItem(LEGACY_ARCHIVE_KEY);
        if (archivedRaw) {
          const parsed = JSON.parse(archivedRaw);
          if (parsed && parsed.payload) return parsed.payload;
        }
      } catch (_) {}

      const readKey = (k) => {
        try {
          const raw = localStorage.getItem(k);
          return raw ? JSON.parse(raw) : null;
        } catch (_) {
          return null;
        }
      };

      const transactions = readKey(LEGACY_STORAGE_KEYS.TRANSACTIONS);
      const categories = readKey(LEGACY_STORAGE_KEYS.CATEGORIES);
      const settings = readKey(LEGACY_STORAGE_KEYS.SETTINGS);
      const caixinhas = readKey(LEGACY_STORAGE_KEYS.CAIXINHAS);
      const investments = readKey(LEGACY_STORAGE_KEYS.INVESTMENTS);
      const investmentTransactions = readKey(LEGACY_STORAGE_KEYS.INVESTMENT_TRANSACTIONS);
      const dividends = readKey(LEGACY_STORAGE_KEYS.DIVIDENDS);
      const investmentGoals = readKey(LEGACY_STORAGE_KEYS.INVESTMENT_GOALS);
      const portfolioSnapshots = readKey(LEGACY_STORAGE_KEYS.PORTFOLIO_SNAPSHOTS);

      const hasAny =
        (Array.isArray(transactions) && transactions.length > 0) ||
        (Array.isArray(investments) && investments.length > 0) ||
        (Array.isArray(caixinhas) && caixinhas.length > 0) ||
        (Array.isArray(dividends) && dividends.length > 0);

      if (!hasAny) return null;

      return {
        transactions: Array.isArray(transactions) ? transactions : [],
        categories: Array.isArray(categories) && categories.length > 0 ? categories : DEFAULT_CATEGORIES,
        settings: settings || DEFAULT_SETTINGS,
        caixinhas: Array.isArray(caixinhas) ? caixinhas : [],
        investments: Array.isArray(investments) ? investments : [],
        investmentTransactions: Array.isArray(investmentTransactions) ? investmentTransactions : [],
        dividends: Array.isArray(dividends) ? dividends : [],
        investmentGoals: Array.isArray(investmentGoals) ? investmentGoals : [],
        portfolioSnapshots: Array.isArray(portfolioSnapshots) ? portfolioSnapshots : []
      };
    },

    hasUnmigratedData() {
      const user = AuthService.currentUser;
      if (!user) return false;
      const meta = this.getMigratedMeta();
      // Se já foi migrado para outro usuário, não exibe para novos usuários (garante isolamento)
      if (meta && meta.migratedToUserId && meta.migratedToUserId !== user.id) return false;
      if (meta && meta.migratedToUserId === user.id && meta.completed) return false;
      const snap = this.readLegacySnapshot();
      return Boolean(snap);
    },

    isDismissedForSession: false,

    renderBannerHtml() {
      if (this.isDismissedForSession || !this.hasUnmigratedData()) return '';
      const snap = this.readLegacySnapshot();
      if (!snap) return '';
      return `
        <div class="migration-banner" id="legacy-migration-banner">
          <div>
            <strong style="color: var(--text-primary); font-size: var(--font-size-sm); display: block;">
              📦 Dados existentes encontrados neste dispositivo
            </strong>
            <span style="font-size: var(--font-size-xs); color: var(--text-secondary);">
              Foram localizados <strong>${snap.transactions.length} transações</strong>, <strong>${snap.investments.length} investimentos</strong> e <strong>${snap.caixinhas.length} caixinhas</strong> do histórico local anterior. Deseja migrá-los para a sua conta autenticada no Supabase?
            </span>
          </div>
          <div style="display: flex; gap: var(--spacing-2); flex-wrap: wrap;">
            <button type="button" class="btn btn-primary btn-sm" id="btn-banner-migrate-now">
              Migrar Dados para Minha Conta
            </button>
            <button type="button" class="btn btn-outline btn-sm" id="btn-banner-dismiss-migrate">
              Agora não
            </button>
          </div>
        </div>
      `;
    },

    bindBannerEvents(container) {
      if (!container) return;
      const migrateBtn = container.querySelector('#btn-banner-migrate-now');
      if (migrateBtn) {
        migrateBtn.addEventListener('click', () => this.openMigrationModal());
      }
      const dismissBtn = container.querySelector('#btn-banner-dismiss-migrate');
      if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
          this.isDismissedForSession = true;
          const banner = container.querySelector('#legacy-migration-banner');
          if (banner) banner.remove();
        });
      }
    },

    // Arquiva e remove as chaves globais sem dono para que nenhuma outra conta no mesmo navegador tenha acesso
    archiveAndCleanGlobalKeys(snapshot, targetUserId) {
      try {
        if (!localStorage.getItem(LEGACY_ARCHIVE_KEY)) {
          localStorage.setItem(LEGACY_ARCHIVE_KEY, JSON.stringify({
            archivedAt: new Date().toISOString(),
            ownerUserId: targetUserId,
            payload: snapshot
          }));
        }
        [
          LEGACY_STORAGE_KEYS.TRANSACTIONS,
          LEGACY_STORAGE_KEYS.CATEGORIES,
          LEGACY_STORAGE_KEYS.SETTINGS,
          LEGACY_STORAGE_KEYS.CAIXINHAS,
          LEGACY_STORAGE_KEYS.INVESTMENTS,
          LEGACY_STORAGE_KEYS.INVESTMENT_TRANSACTIONS,
          LEGACY_STORAGE_KEYS.DIVIDENDS,
          LEGACY_STORAGE_KEYS.INVESTMENT_GOALS,
          LEGACY_STORAGE_KEYS.PORTFOLIO_SNAPSHOTS
        ].forEach(k => localStorage.removeItem(k));
      } catch (e) {
        console.error('[LegacyMigrationService] Falha ao arquivar chaves legadas:', e);
      }
    },

    async migrateToCurrentAccount() {
      const user = AuthService.currentUser;
      if (!user) throw new Error('Faça login em uma conta antes de migrar os dados.');
      const snap = this.readLegacySnapshot();
      if (!snap) throw new Error('Nenhum dado legado pendente de migração foi encontrado.');

      // Mescla com dados já existentes na conta do usuário sem perder nada
      const mergeById = (existingArr, legacyArr) => {
        const map = new Map();
        (legacyArr || []).forEach(item => { if (item && item.id) map.set(item.id, item); });
        (existingArr || []).forEach(item => { if (item && item.id) map.set(item.id, item); });
        return Array.from(map.values());
      };

      const mergedCategories = mergeById(Storage.getCategories(), snap.categories);
      const mergedTransactions = mergeById(Storage.getTransactions(), snap.transactions);
      const mergedCaixinhas = mergeById(Storage.getCaixinhas(), snap.caixinhas);
      const mergedInvestments = mergeById(Storage.getInvestments(), snap.investments);
      const mergedInvTx = mergeById(Storage.getInvestmentTransactions(), snap.investmentTransactions);
      const mergedDividends = mergeById(Storage.getDividends(), snap.dividends);
      const mergedGoals = mergeById(Storage.getInvestmentGoals(), snap.investmentGoals);

      const snapMap = new Map();
      (snap.portfolioSnapshots || []).forEach(s => { if (s && s.date) snapMap.set(s.date, s); });
      (Storage.getPortfolioSnapshots() || []).forEach(s => { if (s && s.date) snapMap.set(s.date, s); });
      const mergedSnapshots = Array.from(snapMap.values()).sort((a, b) => String(a.date).localeCompare(String(b.date)));

      const curSettings = Storage.getSettings();
      const mergedSettings = {
        ...DEFAULT_SETTINGS,
        ...snap.settings,
        ...curSettings,
        userName: AuthService.getUserDisplayName() || (snap.settings && snap.settings.userName) || 'Usuário'
      };

      // Salva no escopo isolado do usuário
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(mergedCategories));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(mergedTransactions));
      localStorage.setItem(STORAGE_KEYS.CAIXINHAS, JSON.stringify(mergedCaixinhas));
      localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(mergedInvestments));
      localStorage.setItem(STORAGE_KEYS.INVESTMENT_TRANSACTIONS, JSON.stringify(mergedInvTx));
      localStorage.setItem(STORAGE_KEYS.DIVIDENDS, JSON.stringify(mergedDividends));
      localStorage.setItem(STORAGE_KEYS.INVESTMENT_GOALS, JSON.stringify(mergedGoals));
      localStorage.setItem(STORAGE_KEYS.PORTFOLIO_SNAPSHOTS, JSON.stringify(mergedSnapshots));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(mergedSettings));

      Storage.normalizeInvestmentFields();

      // Envia tudo para o Supabase Database vinculado ao user_id autenticado
      await SupabaseSyncService.pushAllLocalToCloud({ markMigrated: true });

      // Arquiva e remove as chaves globais antigas para proteger a privacidade
      this.archiveAndCleanGlobalKeys(snap, user.id);
      localStorage.setItem(LEGACY_MIGRATED_META_KEY, JSON.stringify({
        migratedToUserId: user.id,
        migratedToEmail: user.email,
        completed: true,
        migratedAt: new Date().toISOString()
      }));

      State.notify('transaction_saved');
      State.notify('category_saved');
      State.notify('caixinhas_updated');
      State.notify('investments_updated');
      return {
        transactions: mergedTransactions.length,
        investments: mergedInvestments.length,
        caixinhas: mergedCaixinhas.length
      };
    },

    openMigrationModal() {
      const snap = this.readLegacySnapshot();
      if (!snap) {
        Toast.info('Sem Dados Pendentes', 'Não há dados locais antigos pendentes de migração.');
        return;
      }
      const user = AuthService.currentUser;
      Modal.openConfirmModal({
        title: 'Migrar Dados Existentes para sua Conta',
        message: `
          Foram encontrados os seguintes dados salvos anteriormente neste navegador:<br><br>
          • <strong>${snap.transactions.length}</strong> transações (receitas e despesas)<br>
          • <strong>${snap.categories.length}</strong> categorias<br>
          • <strong>${snap.caixinhas.length}</strong> caixinhas / reservas<br>
          • <strong>${snap.investments.length}</strong> ativos de investimento<br>
          • <strong>${snap.investmentTransactions.length}</strong> operações de compra/venda<br>
          • <strong>${snap.dividends.length}</strong> registros de dividendos/proventos<br>
          • <strong>${snap.investmentGoals.length}</strong> metas de investimento<br><br>
          Deseja transferir todos esses registros para a conta <strong>${Utils.escapeHtml(user ? user.email : '')}</strong> no banco de dados Supabase sem perder nenhuma informação?
        `,
        confirmText: 'Sim, Migrar Dados Agora',
        cancelText: 'Depois',
        onConfirm: async () => {
          try {
            Toast.info('Migrando dados...', 'Transferindo registros para sua conta no Supabase...');
            const res = await this.migrateToCurrentAccount();
            Toast.success('Migração Concluída!', `${res.transactions} transações e ${res.investments} investimentos vinculados à sua conta.`);
            App.updateSidebarBadges();
            if (App.views[State.currentView]) App.views[State.currentView].render();
          } catch (err) {
            Toast.error('Erro na Migração', err.message || 'Não foi possível concluir a migração para o Supabase.');
          }
        }
      });
    }
  };

  // =========================================================================
  // SERVIÇO DE SINCRONIZAÇÃO COM SUPABASE DATABASE (PostgreSQL + RLS)
  // =========================================================================
  const SupabaseSyncService = {
    isSyncing: false,
    lastSyncError: null,
    _pendingPromises: new Set(),

    _track(promise) {
      if (!promise || typeof promise.then !== 'function') return promise;
      this._pendingPromises.add(promise);
      promise.finally(() => {
        this._pendingPromises.delete(promise);
      });
      return promise;
    },

    async flushPendingWrites(timeoutMs = 6000) {
      if (this._pendingPromises.size === 0) return true;
      try {
        const raceTimeout = new Promise((resolve) => setTimeout(() => resolve('timeout'), timeoutMs));
        const allDone = Promise.all(Array.from(this._pendingPromises));
        const res = await Promise.race([allDone, raceTimeout]);
        if (res === 'timeout') {
          console.warn('[SupabaseSyncService] flushPendingWrites atingiu timeout parcial');
        }
        return true;
      } catch (err) {
        console.warn('[SupabaseSyncService] Erro ao aguardar escritas pendentes:', err);
        return false;
      }
    },

    updateSyncBadge(state, text) {
      const dot = document.getElementById('sidebar-status-dot');
      const label = document.getElementById('sidebar-status-text');
      if (label) label.textContent = text || 'Supabase Cloud';
      if (dot) {
        dot.style.backgroundColor = state === 'error'
          ? 'var(--color-expense)'
          : state === 'syncing'
            ? '#f59e0b'
            : 'var(--color-income)';
      }
    },

    // Mapeadores JS (camelCase) <-> PostgreSQL (snake_case)
    toDbCategory(c, userId) {
      return {
        user_id: userId,
        id: String(c.id),
        name: String(c.name || 'Categoria').trim(),
        type: c.type === 'income' ? 'income' : 'expense',
        icon: c.icon || '🏷️',
        color: c.color || '#3b82f6'
      };
    },
    fromDbCategory(r) {
      return {
        id: r.id,
        name: r.name,
        type: r.type,
        icon: r.icon || '🏷️',
        color: r.color || '#3b82f6'
      };
    },

    toDbTransaction(t, userId) {
      return {
        user_id: userId,
        id: String(t.id),
        description: String(t.description || '').trim(),
        amount: Number(t.amount) || 0,
        type: t.type === 'income' ? 'income' : 'expense',
        category_id: String(t.categoryId || 'unknown'),
        date: String(t.date || Utils.getTodayString()),
        notes: String(t.notes || '')
      };
    },
    fromDbTransaction(r) {
      return {
        id: r.id,
        description: r.description,
        amount: Number(r.amount) || 0,
        type: r.type,
        categoryId: r.category_id,
        date: r.date,
        notes: r.notes || '',
        createdAt: r.created_at
      };
    },

    toDbCaixinha(c, userId) {
      return {
        user_id: userId,
        id: String(c.id),
        name: String(c.name || '').trim(),
        description: String(c.description || ''),
        target_amount: Number(c.targetAmount) || 0,
        current_amount: Number(c.currentAmount) || 0,
        icon: c.icon || '🎯',
        color: c.color || '#10b981',
        deadline: c.deadline || null,
        history: Array.isArray(c.history) ? c.history : []
      };
    },
    fromDbCaixinha(r) {
      return {
        id: r.id,
        name: r.name,
        description: r.description || '',
        targetAmount: Number(r.target_amount) || 0,
        currentAmount: Number(r.current_amount) || 0,
        icon: r.icon || '🎯',
        color: r.color || '#10b981',
        deadline: r.deadline || null,
        history: Array.isArray(r.history) ? r.history : [],
        createdAt: r.created_at
      };
    },

    toDbInvestment(inv, userId) {
      return {
        user_id: userId,
        id: String(inv.id),
        ticker: String(inv.ticker || ''),
        name: String(inv.name || '').trim(),
        type: inv.type || 'stock',
        institution: String(inv.institution || ''),
        quantity: Number(inv.quantity) || 0,
        average_price: Number(inv.averagePrice) || 0,
        applied_amount: inv.appliedAmount !== undefined && inv.appliedAmount !== null ? Number(inv.appliedAmount) : null,
        current_price: inv.currentPrice !== undefined && inv.currentPrice !== null ? Number(inv.currentPrice) : null,
        quote: inv.quote || null,
        coingecko_id: inv.coingeckoId || null,
        total_invested: Number(inv.totalInvested) || 0,
        cost_basis: Number(inv.costBasis) || 0,
        realized_profit: Number(inv.realizedProfit) || 0,
        realized_legacy_unknown: Boolean(inv.realizedLegacyUnknown),
        yield_type: inv.yieldType || null,
        benchmark: inv.benchmark || null,
        rate_text: String(inv.rateText || ''),
        application_date: inv.applicationDate || null,
        maturity_date: inv.maturityDate || null,
        accumulated_yield: inv.accumulatedYield !== undefined && inv.accumulatedYield !== null ? Number(inv.accumulatedYield) : null,
        notes: String(inv.notes || ''),
        quote_error: inv.quoteError || null,
        last_update: inv.lastUpdate || new Date().toISOString()
      };
    },
    fromDbInvestment(r) {
      const inv = {
        id: r.id,
        ticker: r.ticker || '',
        name: r.name || '',
        type: r.type || 'stock',
        institution: r.institution || '',
        quantity: Number(r.quantity) || 0,
        averagePrice: Number(r.average_price) || 0,
        appliedAmount: r.applied_amount !== null && r.applied_amount !== undefined ? Number(r.applied_amount) : undefined,
        currentPrice: r.current_price !== null && r.current_price !== undefined ? Number(r.current_price) : null,
        quote: r.quote || null,
        coingeckoId: r.coingecko_id || undefined,
        totalInvested: Number(r.total_invested) || 0,
        costBasis: Number(r.cost_basis) || 0,
        realizedProfit: Number(r.realized_profit) || 0,
        realizedLegacyUnknown: Boolean(r.realized_legacy_unknown),
        status: ((Number(r.quantity) || 0) <= 0 && r.type !== 'fixed') || (r.type === 'fixed' && (Number(r.applied_amount || r.quantity || 0) <= 0)) ? 'closed' : 'active',
        yieldType: r.yield_type || undefined,
        benchmark: r.benchmark || undefined,
        rateText: r.rate_text || '',
        applicationDate: r.application_date || null,
        maturityDate: r.maturity_date || null,
        accumulatedYield: r.accumulated_yield !== null && r.accumulated_yield !== undefined ? Number(r.accumulated_yield) : null,
        notes: r.notes || '',
        lastUpdate: r.last_update || r.updated_at || new Date().toISOString()
      };
      if (r.quote_error) inv.quoteError = r.quote_error;
      return inv;
    },

    toDbInvestmentTransaction(t, userId) {
      return {
        user_id: userId,
        id: String(t.id),
        investment_id: String(t.investmentId),
        type: t.type === 'sell' ? 'sell' : 'buy',
        quantity: Number(t.quantity) || 0,
        unit_price: Number(t.unitPrice) || 0,
        fees: Number(t.fees) || 0,
        total_amount: Number(t.totalAmount) || 0,
        cost_of_sold: t.costOfSold !== undefined && t.costOfSold !== null ? Number(t.costOfSold) : null,
        realized_profit: t.realizedProfit !== undefined && t.realizedProfit !== null ? Number(t.realizedProfit) : null,
        date: String(t.date || Utils.getTodayString()),
        broker: String(t.broker || ''),
        notes: String(t.notes || '')
      };
    },
    fromDbInvestmentTransaction(r) {
      return {
        id: r.id,
        investmentId: r.investment_id,
        type: r.type,
        quantity: Number(r.quantity) || 0,
        unitPrice: Number(r.unit_price) || 0,
        fees: Number(r.fees) || 0,
        totalAmount: Number(r.total_amount) || 0,
        costOfSold: r.cost_of_sold !== null && r.cost_of_sold !== undefined ? Number(r.cost_of_sold) : null,
        realizedProfit: r.realized_profit !== null && r.realized_profit !== undefined ? Number(r.realized_profit) : null,
        date: r.date,
        broker: r.broker || '',
        notes: r.notes || ''
      };
    },

    toDbDividend(d, userId) {
      return {
        user_id: userId,
        id: String(d.id),
        investment_id: d.investmentId ? String(d.investmentId) : null,
        ticker: String(d.ticker || 'PROVENTO'),
        type: String(d.type || 'dividend'),
        amount: Number(d.amount) || 0,
        quantity_ref: d.quantityRef !== undefined && d.quantityRef !== null ? Number(d.quantityRef) : 0,
        date: String(d.date || Utils.getTodayString()),
        notes: String(d.notes || '')
      };
    },
    fromDbDividend(r) {
      return {
        id: r.id,
        investmentId: r.investment_id,
        ticker: r.ticker,
        type: r.type || 'dividend',
        amount: Number(r.amount) || 0,
        quantityRef: Number(r.quantity_ref) || 0,
        date: r.date,
        notes: r.notes || ''
      };
    },

    toDbInvestmentGoal(g, userId) {
      return {
        user_id: userId,
        id: String(g.id),
        name: String(g.name || '').trim(),
        target_amount: Number(g.targetAmount) || 0,
        deadline: g.deadline || null,
        description: String(g.description || '')
      };
    },
    fromDbInvestmentGoal(r) {
      return {
        id: r.id,
        name: r.name,
        targetAmount: Number(r.target_amount) || 0,
        deadline: r.deadline || null,
        description: r.description || ''
      };
    },

    toDbPortfolioSnapshot(s, userId) {
      return {
        user_id: userId,
        date: String(s.date),
        value: s.value !== undefined && s.value !== null ? Number(s.value) : 0,
        cost: Number(s.cost) || 0,
        calculated: Boolean(s.calculated),
        complete: Boolean(s.complete),
        positions: Array.isArray(s.positions) ? s.positions : []
      };
    },
    fromDbPortfolioSnapshot(r) {
      return {
        date: r.date,
        value: Number(r.value) || 0,
        cost: Number(r.cost) || 0,
        calculated: Boolean(r.calculated),
        complete: Boolean(r.complete),
        positions: Array.isArray(r.positions) ? r.positions : []
      };
    },

    // Carrega todos os dados do usuário autenticado a partir do Supabase Database (filtrados por RLS)
    async pullAllUserData(user) {
      const client = SupabaseService.getClient();
      if (!client || !user || !user.id) return;

      this.isSyncing = true;
      this.updateSyncBadge('syncing', 'Sincronizando nuvem...');

      try {
        const uid = user.id;
        const [
          profileRes,
          catRes,
          txRes,
          caxRes,
          invRes,
          invTxRes,
          divRes,
          goalRes,
          snapRes
        ] = await Promise.all([
          client.from('user_profiles').select('*').eq('user_id', uid).maybeSingle(),
          client.from('categories').select('*').eq('user_id', uid),
          client.from('transactions').select('*').eq('user_id', uid).order('date', { ascending: false }),
          client.from('caixinhas').select('*').eq('user_id', uid),
          client.from('investments').select('*').eq('user_id', uid),
          client.from('investment_transactions').select('*').eq('user_id', uid).order('date', { ascending: false }),
          client.from('dividends').select('*').eq('user_id', uid).order('date', { ascending: false }),
          client.from('investment_goals').select('*').eq('user_id', uid),
          client.from('portfolio_snapshots').select('*').eq('user_id', uid).order('date', { ascending: true })
        ]);

        // Verifica se alguma tabela retornou erro (ex: schema.sql ainda não executado)
        const firstErr = [profileRes, catRes, txRes, caxRes, invRes, invTxRes, divRes, goalRes, snapRes]
          .map(r => r && r.error).find(Boolean);

        if (firstErr) {
          console.warn('[SupabaseSyncService] Aviso ao consultar tabelas:', firstErr.message);
          this.lastSyncError = firstErr.message;
          this.updateSyncBadge('error', 'Tabelas pendentes (SQL)');
          return;
        }

        const cloudHasCategories = Array.isArray(catRes.data) && catRes.data.length > 0;
        const cloudHasAnyData =
          cloudHasCategories ||
          (Array.isArray(txRes.data) && txRes.data.length > 0) ||
          (Array.isArray(invRes.data) && invRes.data.length > 0) ||
          (Array.isArray(caxRes.data) && caxRes.data.length > 0);

        if (profileRes.data) {
          const prof = profileRes.data;
          const curSettings = Storage.getSettings();
          const mergedSettings = {
            ...DEFAULT_SETTINGS,
            ...curSettings,
            ...(prof.settings || {}),
            userName: prof.full_name || AuthService.getUserDisplayName()
          };
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(mergedSettings));
          document.documentElement.setAttribute('data-theme', mergedSettings.theme || 'light');
        } else {
          // Cria o perfil inicial do usuário no Supabase
          await this.upsertProfileSettings(Storage.getSettings());
        }

        if (cloudHasAnyData) {
          if (cloudHasCategories) {
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(catRes.data.map(r => this.fromDbCategory(r))));
          }
          localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify((txRes.data || []).map(r => this.fromDbTransaction(r))));
          localStorage.setItem(STORAGE_KEYS.CAIXINHAS, JSON.stringify((caxRes.data || []).map(r => this.fromDbCaixinha(r))));
          localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify((invRes.data || []).map(r => this.fromDbInvestment(r))));
          localStorage.setItem(STORAGE_KEYS.INVESTMENT_TRANSACTIONS, JSON.stringify((invTxRes.data || []).map(r => this.fromDbInvestmentTransaction(r))));
          localStorage.setItem(STORAGE_KEYS.DIVIDENDS, JSON.stringify((divRes.data || []).map(r => this.fromDbDividend(r))));
          localStorage.setItem(STORAGE_KEYS.INVESTMENT_GOALS, JSON.stringify((goalRes.data || []).map(r => this.fromDbInvestmentGoal(r))));
          localStorage.setItem(STORAGE_KEYS.PORTFOLIO_SNAPSHOTS, JSON.stringify((snapRes.data || []).map(r => this.fromDbPortfolioSnapshot(r))));
          Storage.normalizeInvestmentFields();
        } else {
          // Conta recém-criada no Supabase: envia as categorias padrão (ou dados locais já no escopo do usuário)
          await this.pushAllLocalToCloud();
        }

        this.lastSyncError = null;
        this.updateSyncBadge('ok', 'Sincronizado (RLS)');
      } catch (err) {
        console.error('[SupabaseSyncService] Erro ao sincronizar:', err);
        this.lastSyncError = err.message;
        this.updateSyncBadge('error', 'Modo Cache Local');
      } finally {
        this.isSyncing = false;
      }
    },

    async pushAllLocalToCloud(options = {}) {
      const client = SupabaseService.getClient();
      const user = AuthService.currentUser;
      if (!client || !user || !user.id) return;
      const uid = user.id;

      this.updateSyncBadge('syncing', 'Salvando na nuvem...');
      const settings = Storage.getSettings();
      const profilePayload = {
        user_id: uid,
        full_name: settings.userName || AuthService.getUserDisplayName(),
        email: user.email,
        settings: settings
      };
      if (options.markMigrated) {
        profilePayload.migrated_legacy_at = new Date().toISOString();
      }

      const categories = Storage.getCategories().map(c => this.toDbCategory(c, uid));
      const transactions = Storage.getTransactions().map(t => this.toDbTransaction(t, uid));
      const caixinhas = Storage.getCaixinhas().map(c => this.toDbCaixinha(c, uid));
      const investments = Storage.getInvestments().map(i => this.toDbInvestment(i, uid));
      const invTx = Storage.getInvestmentTransactions().map(t => this.toDbInvestmentTransaction(t, uid));
      const dividends = Storage.getDividends().map(d => this.toDbDividend(d, uid));
      const goals = Storage.getInvestmentGoals().map(g => this.toDbInvestmentGoal(g, uid));
      const snapshots = Storage.getPortfolioSnapshots().map(s => this.toDbPortfolioSnapshot(s, uid));

      const tasks = [
        client.from('user_profiles').upsert(profilePayload, { onConflict: 'user_id' })
      ];
      if (categories.length) tasks.push(client.from('categories').upsert(categories, { onConflict: 'user_id,id' }));
      if (transactions.length) tasks.push(client.from('transactions').upsert(transactions, { onConflict: 'user_id,id' }));
      if (caixinhas.length) tasks.push(client.from('caixinhas').upsert(caixinhas, { onConflict: 'user_id,id' }));
      if (investments.length) tasks.push(client.from('investments').upsert(investments, { onConflict: 'user_id,id' }));
      if (invTx.length) tasks.push(client.from('investment_transactions').upsert(invTx, { onConflict: 'user_id,id' }));
      if (dividends.length) tasks.push(client.from('dividends').upsert(dividends, { onConflict: 'user_id,id' }));
      if (goals.length) tasks.push(client.from('investment_goals').upsert(goals, { onConflict: 'user_id,id' }));
      if (snapshots.length) tasks.push(client.from('portfolio_snapshots').upsert(snapshots, { onConflict: 'user_id,date' }));

      const results = await Promise.all(tasks);
      const errResult = results.find(r => r && r.error);
      if (errResult && errResult.error) {
        this.updateSyncBadge('error', 'Erro ao sincronizar');
        throw new Error(errResult.error.message);
      }
      this.updateSyncBadge('ok', 'Sincronizado (RLS)');
    },

    async upsertProfileSettings(settings) {
      const p = (async () => {
        const client = SupabaseService.getClient();
        const user = AuthService.currentUser;
        if (!client || !user) return;
        try {
          await client.from('user_profiles').upsert({
            user_id: user.id,
            full_name: settings.userName || AuthService.getUserDisplayName(),
            email: user.email,
            settings
          }, { onConflict: 'user_id' });
        } catch (e) { console.warn('[SupabaseSync] upsertProfileSettings:', e); }
      })();
      return this._track(p);
    },

    async upsertTransaction(tx) {
      const p = (async () => {
        const client = SupabaseService.getClient();
        const user = AuthService.currentUser;
        if (!client || !user) return;
        try {
          this.updateSyncBadge('syncing', 'Salvando...');
          const { error } = await client.from('transactions').upsert(this.toDbTransaction(tx, user.id), { onConflict: 'user_id,id' });
          this.updateSyncBadge(error ? 'error' : 'ok', error ? 'Erro ao salvar' : 'Sincronizado (RLS)');
        } catch (e) { console.warn('[SupabaseSync] upsertTransaction:', e); }
      })();
      return this._track(p);
    },

    async syncAllTransactions(list) {
      const p = (async () => {
        const client = SupabaseService.getClient();
        const user = AuthService.currentUser;
        if (!client || !user || !Array.isArray(list) || !list.length) return;
        try {
          await client.from('transactions').upsert(list.map(t => this.toDbTransaction(t, user.id)), { onConflict: 'user_id,id' });
        } catch (e) { console.warn('[SupabaseSync] syncAllTransactions:', e); }
      })();
      return this._track(p);
    },

    async upsertCategory(cat) {
      const p = (async () => {
        const client = SupabaseService.getClient();
        const user = AuthService.currentUser;
        if (!client || !user) return;
        try {
          await client.from('categories').upsert(this.toDbCategory(cat, user.id), { onConflict: 'user_id,id' });
        } catch (e) { console.warn('[SupabaseSync] upsertCategory:', e); }
      })();
      return this._track(p);
    },

    async upsertCaixinha(cax) {
      const p = (async () => {
        const client = SupabaseService.getClient();
        const user = AuthService.currentUser;
        if (!client || !user) return;
        try {
          await client.from('caixinhas').upsert(this.toDbCaixinha(cax, user.id), { onConflict: 'user_id,id' });
        } catch (e) { console.warn('[SupabaseSync] upsertCaixinha:', e); }
      })();
      return this._track(p);
    },

    async syncAllInvestments(list) {
      const p = (async () => {
        const client = SupabaseService.getClient();
        const user = AuthService.currentUser;
        if (!client || !user || !Array.isArray(list) || !list.length) return;
        try {
          await client.from('investments').upsert(list.map(i => this.toDbInvestment(i, user.id)), { onConflict: 'user_id,id' });
        } catch (e) { console.warn('[SupabaseSync] syncAllInvestments:', e); }
      })();
      return this._track(p);
    },

    async syncAllInvestmentTransactions(list) {
      const p = (async () => {
        const client = SupabaseService.getClient();
        const user = AuthService.currentUser;
        if (!client || !user || !Array.isArray(list) || !list.length) return;
        try {
          await client.from('investment_transactions').upsert(list.map(t => this.toDbInvestmentTransaction(t, user.id)), { onConflict: 'user_id,id' });
        } catch (e) { console.warn('[SupabaseSync] syncAllInvestmentTransactions:', e); }
      })();
      return this._track(p);
    },

    async syncAllDividends(list) {
      const p = (async () => {
        const client = SupabaseService.getClient();
        const user = AuthService.currentUser;
        if (!client || !user || !Array.isArray(list) || !list.length) return;
        try {
          await client.from('dividends').upsert(list.map(d => this.toDbDividend(d, user.id)), { onConflict: 'user_id,id' });
        } catch (e) { console.warn('[SupabaseSync] syncAllDividends:', e); }
      })();
      return this._track(p);
    },

    async syncAllInvestmentGoals(list) {
      const p = (async () => {
        const client = SupabaseService.getClient();
        const user = AuthService.currentUser;
        if (!client || !user || !Array.isArray(list) || !list.length) return;
        try {
          await client.from('investment_goals').upsert(list.map(g => this.toDbInvestmentGoal(g, user.id)), { onConflict: 'user_id,id' });
        } catch (e) { console.warn('[SupabaseSync] syncAllInvestmentGoals:', e); }
      })();
      return this._track(p);
    },

    async syncAllPortfolioSnapshots(list) {
      const p = (async () => {
        const client = SupabaseService.getClient();
        const user = AuthService.currentUser;
        if (!client || !user || !Array.isArray(list) || !list.length) return;
        try {
          await client.from('portfolio_snapshots').upsert(list.map(s => this.toDbPortfolioSnapshot(s, user.id)), { onConflict: 'user_id,date' });
        } catch (e) { console.warn('[SupabaseSync] syncAllPortfolioSnapshots:', e); }
      })();
      return this._track(p);
    },

    async deleteRecord(table, id) {
      const p = (async () => {
        const client = SupabaseService.getClient();
        const user = AuthService.currentUser;
        if (!client || !user || !id) return;
        try {
          await client.from(table).delete().eq('user_id', user.id).eq('id', String(id));
        } catch (e) { console.warn(`[SupabaseSync] deleteRecord(${table}):`, e); }
      })();
      return this._track(p);
    },

    async clearAllCloudUserData() {
      const client = SupabaseService.getClient();
      const user = AuthService.currentUser;
      if (!client || !user) return;
      const uid = user.id;
      try {
        await Promise.all([
          client.from('transactions').delete().eq('user_id', uid),
          client.from('caixinhas').delete().eq('user_id', uid),
          client.from('investment_transactions').delete().eq('user_id', uid),
          client.from('dividends').delete().eq('user_id', uid),
          client.from('investment_goals').delete().eq('user_id', uid),
          client.from('investments').delete().eq('user_id', uid),
          client.from('portfolio_snapshots').delete().eq('user_id', uid)
        ]);
      } catch (e) { console.warn('[SupabaseSync] clearAllCloudUserData:', e); }
    }
  };

  // =========================================================================
  // SERVIÇO DE AUTENTICAÇÃO REAL (Supabase Auth)
  // =========================================================================
  const REMEMBER_ME_STORAGE_KEY = 'meu_controle_remember_session';

  const AuthService = {
    currentUser: null,
    currentSession: null,
    authSubscription: null,
    passwordRecoveryMode: false,

    getRememberMe() {
      const val = localStorage.getItem(REMEMBER_ME_STORAGE_KEY);
      return val === null ? true : val === 'true';
    },

    setRememberMe(remember) {
      localStorage.setItem(REMEMBER_ME_STORAGE_KEY, remember ? 'true' : 'false');
    },

    isAuthenticated() {
      return Boolean(this.currentSession && this.currentUser && this.currentUser.id);
    },

    getUserDisplayName() {
      if (!this.currentUser) return 'Usuário';
      const meta = this.currentUser.user_metadata || {};
      if (meta.full_name && String(meta.full_name).trim()) return String(meta.full_name).trim();
      if (meta.name && String(meta.name).trim()) return String(meta.name).trim();
      if (this.currentUser.email) return this.currentUser.email.split('@')[0];
      return 'Usuário';
    },

    translateAuthError(err) {
      const msg = String((err && (err.message || err.error_description)) || err || '').trim();
      const lower = msg.toLowerCase();
      if (lower.includes('invalid login credentials')) return 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.';
      if (lower.includes('email not confirmed')) return 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.';
      if (lower.includes('user already registered')) return 'Este endereço de e-mail já está cadastrado. Faça login ou recupere sua senha.';
      if (lower.includes('password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.';
      if (lower.includes('rate limit') || lower.includes('too many requests')) return 'Muitas tentativas em sequência. Aguarde alguns instantes e tente novamente.';
      if (lower.includes('unable to validate email address') || lower.includes('invalid email')) return 'Informe um endereço de e-mail válido.';
      if (lower.includes('same_password') || lower.includes('different from the old password')) return 'A nova senha deve ser diferente da senha atual.';
      if (lower.includes('failed to fetch') || lower.includes('network')) return 'Falha de conexão. Verifique sua internet e tente novamente.';
      return msg || 'Não foi possível concluir a autenticação.';
    },

    async signIn(email, password, rememberMe = true) {
      this.setRememberMe(rememberMe);
      const client = SupabaseService.getClient();
      if (!client) throw new Error('Serviço de autenticação indisponível no momento.');
      const { data, error } = await client.auth.signInWithPassword({
        email: String(email || '').trim(),
        password: String(password || '')
      });
      if (error) throw new Error(this.translateAuthError(error));
      return data;
    },

    async signUp(fullName, email, password) {
      this.setRememberMe(true);
      const client = SupabaseService.getClient();
      if (!client) throw new Error('Serviço de autenticação indisponível no momento.');
      const cleanName = String(fullName || '').trim();
      const cleanEmail = String(email || '').trim();
      const cleanPassword = String(password || '');
      const { data, error } = await client.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: { full_name: cleanName }
        }
      });
      if (error) throw new Error(this.translateAuthError(error));

      // Se o projeto retornar o usuário sem sessão ativa imediata, autentica automaticamente para entrar direto no sistema
      if (data && !data.session && data.user) {
        try {
          const signInRes = await client.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPassword
          });
          if (signInRes && signInRes.data && signInRes.data.session) {
            return signInRes.data;
          }
        } catch (_) {}
      }
      return data;
    },

    async sendPasswordResetEmail(email) {
      const client = SupabaseService.getClient();
      if (!client) throw new Error('Serviço de autenticação indisponível no momento.');
      const cleanEmail = String(email || '').trim();
      const redirectUrl = window.location.origin && window.location.origin !== 'null'
        ? (window.location.origin + window.location.pathname)
        : undefined;
      const { data, error } = await client.auth.resetPasswordForEmail(
        cleanEmail,
        redirectUrl ? { redirectTo: redirectUrl } : undefined
      );
      if (error) throw new Error(this.translateAuthError(error));
      return data;
    },

    async updatePassword(newPassword) {
      const client = SupabaseService.getClient();
      if (!client) throw new Error('Serviço de autenticação indisponível no momento.');
      const { data, error } = await client.auth.updateUser({
        password: String(newPassword || '')
      });
      if (error) throw new Error(this.translateAuthError(error));
      this.passwordRecoveryMode = false;
      return data;
    },

    async signOut() {
      const client = SupabaseService.getClient();
      if (MarketApiService && MarketApiService._timer) {
        clearInterval(MarketApiService._timer);
        MarketApiService._timer = null;
      }
      this.currentUser = null;
      this.currentSession = null;
      this.passwordRecoveryMode = false;
      if (client) {
        try { await client.auth.signOut(); } catch (_) {}
      }
      App.enforceAuthGate();
      Toast.info('Sessão Encerrada', 'Você saiu da sua conta com segurança.');
    },

    confirmAndSignOut() {
      const email = this.currentUser ? this.currentUser.email : '';
      Modal.openConfirmModal({
        title: 'Sair da Conta?',
        message: `Deseja encerrar sua sessão atual${email ? ` (<strong>${Utils.escapeHtml(email)}</strong>)` : ''}?<br><br>Seus dados permanecem salvos na sua conta.`,
        confirmText: 'Sair da Conta',
        cancelText: 'Cancelar',
        isDanger: true,
        onConfirm: () => this.signOut()
      });
    },

    openChangePasswordModal() {
      Modal.open({
        title: 'Alterar Senha da Conta',
        bodyHtml: `
          <form id="form-change-password" novalidate>
            <div class="form-group" id="group-cp-pass">
              <label class="form-label" for="cp-new-password">Nova Senha <span class="required">*</span></label>
              <input type="password" id="cp-new-password" placeholder="Mínimo de 6 caracteres" required autocomplete="new-password">
              <span class="form-error">A senha deve possuir no mínimo 6 caracteres.</span>
            </div>
            <div class="form-group" id="group-cp-confirm">
              <label class="form-label" for="cp-confirm-password">Confirmar Nova Senha <span class="required">*</span></label>
              <input type="password" id="cp-confirm-password" placeholder="Repita a nova senha" required autocomplete="new-password">
              <span class="form-error">As senhas não coincidem.</span>
            </div>
          </form>
        `,
        footerHtml: `
          <button type="button" class="btn btn-outline" id="btn-cp-cancel">Cancelar</button>
          <button type="button" class="btn btn-primary" id="btn-cp-save">Atualizar Senha</button>
        `
      });

      document.getElementById('btn-cp-cancel').addEventListener('click', () => Modal.close());
      document.getElementById('btn-cp-save').addEventListener('click', async () => {
        const p1 = document.getElementById('cp-new-password').value;
        const p2 = document.getElementById('cp-confirm-password').value;
        const validLen = p1 && p1.length >= 6;
        const validMatch = p1 === p2;
        document.getElementById('group-cp-pass').classList.toggle('has-error', !validLen);
        document.getElementById('group-cp-confirm').classList.toggle('has-error', !validMatch);
        if (!validLen || !validMatch) return;

        const saveBtn = document.getElementById('btn-cp-save');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Salvando...';
        try {
          await this.updatePassword(p1);
          Modal.close();
          Toast.success('Senha Atualizada!', 'Sua senha foi redefinida com sucesso.');
        } catch (err) {
          Toast.error('Erro ao Atualizar Senha', err.message);
          saveBtn.disabled = false;
          saveBtn.textContent = 'Atualizar Senha';
        }
      });
    }
  };

  // =========================================================================
  // VIEW DE AUTENTICAÇÃO (Simples, Direta e Profissional)
  // =========================================================================
  const AuthView = {
    container: null,
    mode: 'login', // 'login' | 'register' | 'forgot' | 'reset_password'
    alertMessage: null,
    alertType: 'info', // 'info' | 'error' | 'success'
    isSubmitting: false,

    init(containerElement) {
      this.container = containerElement;
    },

    setMode(mode, alertMessage = null, alertType = 'info') {
      this.mode = mode;
      this.alertMessage = alertMessage;
      this.alertType = alertType;
      this.render();
    },

    render() {
      if (!this.container) this.container = document.getElementById('auth-screen-container');
      if (!this.container) return;

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

      this.container.innerHTML = `
        <div class="auth-wrapper">
          <!-- Painel Institucional Lateral -->
          <div class="auth-hero-panel">
            <div>
              <div class="auth-hero-brand">
                <div class="auth-hero-logo">
                  ${Utils.icons.wallet}
                </div>
                <div>
                  <div style="font-weight: 700; font-size: 1.1rem; letter-spacing: -0.02em;">Meu Controle</div>
                  <div style="font-size: 0.72rem; color: rgba(255,255,255,0.75);">Finanças Pessoais & Investimentos</div>
                </div>
              </div>

              <h1 class="auth-hero-title">Organize suas finanças e acompanhe seus investimentos em um só lugar.</h1>
              <p class="auth-hero-subtitle">
                Controle receitas, despesas, caixinhas e sua carteira de Ações, FIIs, Criptomoedas e Renda Fixa de qualquer computador ou celular.
              </p>

              <ul class="auth-feature-list">
                <li class="auth-feature-item">
                  <span class="auth-feature-badge">✓</span>
                  <span><strong>Controle Completo:</strong> Receitas, despesas, categorias, relatórios e metas financeiras.</span>
                </li>
                <li class="auth-feature-item">
                  <span class="auth-feature-badge">✓</span>
                  <span><strong>Carteira de Investimentos:</strong> Cotações automáticas da B3 e Criptomoedas em tempo real.</span>
                </li>
                <li class="auth-feature-item">
                  <span class="auth-feature-badge">✓</span>
                  <span><strong>Sincronização Automática:</strong> Acesse sua conta no computador ou celular com segurança total.</span>
                </li>
              </ul>
            </div>

            <div class="auth-hero-footer">
              <span>🔒 Acesso seguro e dados criptografados</span>
              <span>Meu Controle</span>
            </div>
          </div>

          <!-- Painel de Formulário -->
          <div class="auth-form-panel">
            <div class="auth-top-bar">
              <span style="font-size: var(--font-size-xs); font-weight: 600; color: var(--color-primary); text-transform: uppercase; letter-spacing: 0.05em;">
                ${this.mode === 'login' ? 'Entrar na Conta' : this.mode === 'register' ? 'Criar Conta' : this.mode === 'forgot' ? 'Recuperar Senha' : 'Nova Senha'}
              </span>
              <button type="button" class="header-icon-btn" id="auth-btn-toggle-theme" title="Alternar tema Claro/Escuro" style="width: 34px; height: 34px;">
                ${isDark ? Utils.icons.sun : Utils.icons.moon}
              </button>
            </div>

            ${(this.mode === 'login' || this.mode === 'register') ? `
              <div class="auth-tabs" role="tablist">
                <button type="button" class="auth-tab-btn ${this.mode === 'login' ? 'active' : ''}" data-auth-mode="login">Entrar</button>
                <button type="button" class="auth-tab-btn ${this.mode === 'register' ? 'active' : ''}" data-auth-mode="register">Criar conta</button>
              </div>
            ` : ''}

            ${this.alertMessage ? `
              <div class="auth-alert ${this.alertType}">
                <span>${this.alertType === 'error' ? '⚠️' : this.alertType === 'success' ? '✅' : 'ℹ️'}</span>
                <div>${Utils.escapeHtml(this.alertMessage)}</div>
              </div>
            ` : ''}

            ${this.renderModeFormHtml()}
          </div>
        </div>
      `;

      this.bindEvents();
    },

    renderModeFormHtml() {
      if (this.mode === 'register') {
        return `
          <h2 class="auth-heading">Criar conta</h2>
          <p class="auth-subheading">Preencha seus dados abaixo para começar a usar o Meu Controle.</p>

          <form id="auth-form-register" novalidate>
            <div class="form-group">
              <label class="form-label" for="reg-name">Nome completo <span class="required">*</span></label>
              <input type="text" id="reg-name" placeholder="Seu nome completo" required autocomplete="name">
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-email">E-mail <span class="required">*</span></label>
              <input type="email" id="reg-email" placeholder="seuemail@exemplo.com" required autocomplete="email">
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-password">Senha <span class="required">*</span></label>
              <div class="auth-password-wrap">
                <input type="password" id="reg-password" placeholder="Mínimo de 6 caracteres" required autocomplete="new-password">
                <button type="button" class="auth-password-toggle" data-target="reg-password" title="Mostrar/ocultar senha">${Utils.icons.eye}</button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-password-confirm">Confirmar senha <span class="required">*</span></label>
              <div class="auth-password-wrap">
                <input type="password" id="reg-password-confirm" placeholder="Repita sua senha" required autocomplete="new-password">
                <button type="button" class="auth-password-toggle" data-target="reg-password-confirm" title="Mostrar/ocultar senha">${Utils.icons.eye}</button>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: var(--spacing-2);" ${this.isSubmitting ? 'disabled' : ''}>
              ${this.isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>
        `;
      }

      if (this.mode === 'forgot') {
        return `
          <h2 class="auth-heading">Recuperar senha</h2>
          <p class="auth-subheading">Informe seu e-mail cadastrado para receber o link de redefinição de senha.</p>

          <form id="auth-form-forgot" novalidate>
            <div class="form-group">
              <label class="form-label" for="forgot-email">E-mail <span class="required">*</span></label>
              <input type="email" id="forgot-email" placeholder="seuemail@exemplo.com" required autocomplete="email">
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: var(--spacing-2);" ${this.isSubmitting ? 'disabled' : ''}>
              ${this.isSubmitting ? 'Enviando...' : 'Recuperar senha'}
            </button>

            <div class="auth-links-row" style="justify-content: center; margin-top: var(--spacing-4);">
              <button type="button" class="auth-link-btn" data-auth-mode="login">← Voltar para Entrar</button>
            </div>
          </form>
        `;
      }

      if (this.mode === 'reset_password') {
        return `
          <h2 class="auth-heading">Definir nova senha</h2>
          <p class="auth-subheading">Escolha uma nova senha para acessar sua conta.</p>

          <form id="auth-form-reset" novalidate>
            <div class="form-group">
              <label class="form-label" for="reset-password">Nova senha <span class="required">*</span></label>
              <div class="auth-password-wrap">
                <input type="password" id="reset-password" placeholder="Mínimo de 6 caracteres" required autocomplete="new-password">
                <button type="button" class="auth-password-toggle" data-target="reset-password" title="Mostrar/ocultar senha">${Utils.icons.eye}</button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="reset-password-confirm">Confirmar nova senha <span class="required">*</span></label>
              <div class="auth-password-wrap">
                <input type="password" id="reset-password-confirm" placeholder="Repita a nova senha" required autocomplete="new-password">
                <button type="button" class="auth-password-toggle" data-target="reset-password-confirm" title="Mostrar/ocultar senha">${Utils.icons.eye}</button>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: var(--spacing-2);" ${this.isSubmitting ? 'disabled' : ''}>
              ${this.isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        `;
      }

      // Default: Login
      const rememberChecked = AuthService.getRememberMe() ? 'checked' : '';
      return `
        <h2 class="auth-heading">Bem-vindo de volta!</h2>
        <p class="auth-subheading">Entre com seu e-mail e senha para acessar sua conta.</p>

        <form id="auth-form-login" novalidate>
          <div class="form-group">
            <label class="form-label" for="login-email">E-mail <span class="required">*</span></label>
            <input type="email" id="login-email" placeholder="seuemail@exemplo.com" required autocomplete="email">
          </div>

          <div class="form-group">
            <label class="form-label" for="login-password">Senha <span class="required">*</span></label>
            <div class="auth-password-wrap">
              <input type="password" id="login-password" placeholder="Sua senha" required autocomplete="current-password">
              <button type="button" class="auth-password-toggle" data-target="login-password" title="Mostrar/ocultar senha">${Utils.icons.eye}</button>
            </div>
          </div>

          <div class="auth-links-row" style="margin-bottom: var(--spacing-4);">
            <label style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer; color: var(--text-secondary); font-size: var(--font-size-xs); user-select: none;">
              <input type="checkbox" id="login-remember-me" ${rememberChecked} style="width: 16px; height: 16px; margin: 0; cursor: pointer;">
              <span>Manter conectado</span>
            </label>
            <button type="button" class="auth-link-btn" data-auth-mode="forgot">Recuperar senha</button>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%;" ${this.isSubmitting ? 'disabled' : ''}>
            ${this.isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      `;
    },

    bindEvents() {
      if (!this.container) return;

      // Alternar Tema Claro / Escuro na tela de login
      const themeBtn = this.container.querySelector('#auth-btn-toggle-theme');
      if (themeBtn) {
        themeBtn.addEventListener('click', () => {
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          const newTheme = isDark ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', newTheme);
          this.render();
        });
      }

      // Alternar entre Entrar / Criar conta / Recuperar senha
      this.container.querySelectorAll('[data-auth-mode]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.setMode(btn.getAttribute('data-auth-mode'));
        });
      });

      // Mostrar / Ocultar Senha
      this.container.querySelectorAll('.auth-password-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          const input = document.getElementById(btn.getAttribute('data-target'));
          if (!input) return;
          const isPass = input.type === 'password';
          input.type = isPass ? 'text' : 'password';
          btn.innerHTML = isPass ? Utils.icons.eyeOff : Utils.icons.eye;
        });
      });

      // Submit: Entrar
      const loginForm = this.container.querySelector('#auth-form-login');
      if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = (this.container.querySelector('#login-email')?.value || '').trim();
          const password = this.container.querySelector('#login-password')?.value || '';
          const rememberMe = Boolean(this.container.querySelector('#login-remember-me')?.checked);
          if (!email || !password) {
            this.setMode('login', 'Preencha seu e-mail e sua senha para entrar.', 'error');
            return;
          }
          this.isSubmitting = true;
          this.render();
          try {
            await AuthService.signIn(email, password, rememberMe);
            this.isSubmitting = false;
          } catch (err) {
            this.isSubmitting = false;
            this.setMode('login', err.message, 'error');
          }
        });
      }

      // Submit: Criar conta
      const registerForm = this.container.querySelector('#auth-form-register');
      if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const name = (this.container.querySelector('#reg-name')?.value || '').trim();
          const email = (this.container.querySelector('#reg-email')?.value || '').trim();
          const password = this.container.querySelector('#reg-password')?.value || '';
          const confirm = this.container.querySelector('#reg-password-confirm')?.value || '';

          if (!name) {
            this.setMode('register', 'Informe seu nome completo.', 'error');
            return;
          }
          if (!email || !email.includes('@')) {
            this.setMode('register', 'Informe um endereço de e-mail válido.', 'error');
            return;
          }
          if (!password || password.length < 6) {
            this.setMode('register', 'A senha deve ter no mínimo 6 caracteres.', 'error');
            return;
          }
          if (password !== confirm) {
            this.setMode('register', 'A confirmação de senha não confere com a senha digitada.', 'error');
            return;
          }

          this.isSubmitting = true;
          this.render();
          try {
            const data = await AuthService.signUp(name, email, password);
            this.isSubmitting = false;
            if (data && data.session) {
              Toast.success('Conta Criada!', `Bem-vindo(a), ${name}!`);
            } else {
              this.setMode('login', `Conta criada! Enviamos um link de confirmação para ${email}.`, 'success');
            }
          } catch (err) {
            this.isSubmitting = false;
            this.setMode('register', err.message, 'error');
          }
        });
      }

      // Submit: Recuperação de Senha por E-mail
      const forgotForm = this.container.querySelector('#auth-form-forgot');
      if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = (this.container.querySelector('#forgot-email')?.value || '').trim();
          if (!email || !email.includes('@')) {
            this.setMode('forgot', 'Informe o endereço de e-mail cadastrado na sua conta.', 'error');
            return;
          }
          this.isSubmitting = true;
          this.render();
          try {
            await AuthService.sendPasswordResetEmail(email);
            this.isSubmitting = false;
            this.setMode('forgot', `Enviamos um link de recuperação de senha para ${email}. Verifique sua caixa de entrada.`, 'success');
          } catch (err) {
            this.isSubmitting = false;
            this.setMode('forgot', err.message, 'error');
          }
        });
      }

      // Submit: Redefinição de Nova Senha (PASSWORD_RECOVERY)
      const resetForm = this.container.querySelector('#auth-form-reset');
      if (resetForm) {
        resetForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const p1 = this.container.querySelector('#reset-password')?.value || '';
          const p2 = this.container.querySelector('#reset-password-confirm')?.value || '';
          if (!p1 || p1.length < 6) {
            this.setMode('reset_password', 'A nova senha deve ter no mínimo 6 caracteres.', 'error');
            return;
          }
          if (p1 !== p2) {
            this.setMode('reset_password', 'As senhas informadas não coincidem.', 'error');
            return;
          }
          this.isSubmitting = true;
          this.render();
          try {
            await AuthService.updatePassword(p1);
            this.isSubmitting = false;
            Toast.success('Senha Redefinida!', 'Sua nova senha foi salva com sucesso.');
            App.enforceAuthGate();
          } catch (err) {
            this.isSubmitting = false;
            this.setMode('reset_password', err.message, 'error');
          }
        });
      }
    }
  };

  // =========================================================================
  // 9. APP ORCHESTRATOR (Com Proteção de Rotas e Persistência de Sessão)
  // =========================================================================
  const App = {
    views: {},
    viewsInitialized: false,
    eventsBound: false,

    async init() {
      Modal.init();
      Toast.init();
      AuthView.init(document.getElementById('auth-screen-container'));

      this.views = {
        dashboard: DashboardView,
        transactions: TransactionsView,
        reports: ReportsView,
        categories: CategoriesView,
        caixinhas: CaixinhasView,
        investments: InvestmentsView,
        intelligence: IntelligenceView,
        assistant: IntelligenceView,
        settings: SettingsView
      };

      if (!this.eventsBound) {
        this.bindEvents();
        this.eventsBound = true;
      }

      State.subscribe((event) => {
        if (!AuthService.isAuthenticated()) return;
        if (['transaction_saved', 'transaction_deleted', 'category_saved', 'category_deleted', 'caixinhas_updated', 'investments_updated'].includes(event)) {
          this.updateSidebarBadges();
          if (this.views[State.currentView] && typeof this.views[State.currentView].render === 'function') {
            this.views[State.currentView].render();
          }
        }
      });

      await this.setupAuthListener();
    },

    async setupAuthListener() {
      const client = SupabaseService.getClient();
      if (!client) {
        this.enforceAuthGate();
        return;
      }

      if (AuthService.authSubscription) {
        try { AuthService.authSubscription.unsubscribe(); } catch (_) {}
      }

      // Verifica se a URL possui hash de recuperação de senha do Supabase Auth
      if (window.location.hash && window.location.hash.includes('type=recovery')) {
        AuthService.passwordRecoveryMode = true;
      }

      const { data: sub } = client.auth.onAuthStateChange(async (event, session) => {
        AuthService.currentSession = session || null;
        AuthService.currentUser = (session && session.user) ? session.user : null;

        if (event === 'PASSWORD_RECOVERY') {
          AuthService.passwordRecoveryMode = true;
          this.enforceAuthGate();
          AuthView.setMode('reset_password', 'Identificamos seu link de recuperação. Defina sua nova senha abaixo.', 'info');
          return;
        }

        if (session && session.user) {
          await this.onAuthenticatedSessionReady(session.user);
        } else {
          this.enforceAuthGate();
        }
      });

      AuthService.authSubscription = sub && sub.subscription ? sub.subscription : null;

      // Recupera sessão persistida imediatamente ao abrir o app
      const { data: sessionData } = await client.auth.getSession();
      if (sessionData && sessionData.session && sessionData.session.user) {
        AuthService.currentSession = sessionData.session;
        AuthService.currentUser = sessionData.session.user;
        if (AuthService.passwordRecoveryMode) {
          this.enforceAuthGate();
          AuthView.setMode('reset_password', 'Defina sua nova senha abaixo para concluir a recuperação.', 'info');
        } else {
          await this.onAuthenticatedSessionReady(sessionData.session.user);
        }
      } else {
        this.enforceAuthGate();
      }
    },

    async onAuthenticatedSessionReady(user) {
      if (AuthService.passwordRecoveryMode) {
        this.enforceAuthGate();
        AuthView.setMode('reset_password', 'Defina sua nova senha abaixo.', 'info');
        return;
      }

      // 1. Inicializa o Storage isolado para o user.id autenticado
      Storage.init();

      // 2. Se for a primeira conta neste navegador e houver dados antigos locais, migra silenciosamente antes de sincronizar
      if (LegacyMigrationService.hasUnmigratedData() && Storage.getTransactions().length === 0 && Storage.getInvestments().length === 0) {
        try {
          await LegacyMigrationService.migrateToCurrentAccount();
        } catch (e) {
          console.warn('[LegacyMigrationService] Migração silenciosa:', e);
        }
      }

      // 3. Sincroniza os dados do usuário a partir do Supabase Database (protegido por RLS)
      await SupabaseSyncService.pullAllUserData(user);

      // 4. Aplica tema e informações do perfil na interface
      const settings = Storage.getSettings();
      document.documentElement.setAttribute('data-theme', settings.theme || 'light');
      this.updateSidebarUserCard();

      // 5. Libera e inicializa as telas internas protegidas
      this.enforceAuthGate();

      if (!this.viewsInitialized) {
        DashboardView.init(document.getElementById('view-dashboard'));
        TransactionsView.init(document.getElementById('view-transactions'));
        ReportsView.init(document.getElementById('view-reports'));
        CategoriesView.init(document.getElementById('view-categories'));
        CaixinhasView.init(document.getElementById('view-caixinhas'));
        InvestmentsView.init(document.getElementById('view-investments'));
        IntelligenceView.init(document.getElementById('view-intelligence'));
        SettingsView.init(document.getElementById('view-settings'));
        this.viewsInitialized = true;
      }

      this.updateSidebarBadges();
      this.navigateTo(State.currentView || 'dashboard');
    },

    updateSidebarUserCard() {
      const user = AuthService.currentUser;
      const settings = Storage.getSettings();
      const displayName = settings.userName || AuthService.getUserDisplayName();
      const email = user && user.email ? user.email : '';
      const initials = displayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(p => p[0].toUpperCase())
        .join('') || 'U';

      const avatarEl = document.getElementById('sidebar-user-avatar');
      const nameEl = document.getElementById('sidebar-user-name');
      const emailEl = document.getElementById('sidebar-user-email');

      if (avatarEl) avatarEl.textContent = initials;
      if (nameEl) nameEl.textContent = displayName;
      if (emailEl) emailEl.textContent = email;
    },

    // Proteção rigorosa das páginas internas (Route Guard)
    enforceAuthGate() {
      const authContainer = document.getElementById('auth-screen-container');
      const appContainer = document.getElementById('protected-app-container');

      const canAccessInternal = AuthService.isAuthenticated() && !AuthService.passwordRecoveryMode;

      if (canAccessInternal) {
        if (authContainer) authContainer.classList.add('hidden');
        if (appContainer) appContainer.style.display = '';
      } else {
        if (appContainer) appContainer.style.display = 'none';
        if (authContainer) {
          authContainer.classList.remove('hidden');
          AuthView.render();
        }
      }
    },

    bindEvents() {
      const sidebar = document.querySelector('.app-sidebar');
      const overlay = document.querySelector('.sidebar-overlay');
      const hamburgerBtn = document.querySelector('.hamburger-btn');
      const sidebarCloseBtn = document.querySelector('.sidebar-close-btn');

      const toggleSidebar = () => {
        if (!AuthService.isAuthenticated()) return;
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
      };

      const closeSidebar = () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      };

      if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleSidebar);
      if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
      if (overlay) overlay.addEventListener('click', closeSidebar);

      const brandLink = document.querySelector('.brand-link');
      if (brandLink) {
        brandLink.addEventListener('click', (e) => {
          e.preventDefault();
          if (!AuthService.isAuthenticated()) return;
          this.navigateTo('dashboard');
          closeSidebar();
        });
      }

      document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          if (!AuthService.isAuthenticated()) {
            this.enforceAuthGate();
            return;
          }
          const targetView = item.getAttribute('data-view');
          if (targetView) {
            this.navigateTo(targetView);
            closeSidebar();
          }
        });
      });

      const quickAddBtn = document.getElementById('header-btn-quick-add');
      if (quickAddBtn) {
        quickAddBtn.addEventListener('click', () => {
          if (!AuthService.isAuthenticated()) return;
          Modal.openTransactionModal(null, (newTx) => {
            Storage.saveTransaction(newTx);
            Toast.success('Movimentação Registrada!', 'Transação adicionada com sucesso.');
            State.notify('transaction_saved', newTx);
          });
        });
      }

      const privacyBtn = document.getElementById('header-btn-toggle-privacy');
      if (privacyBtn) {
        this.updatePrivacyIcon(privacyBtn);
        privacyBtn.addEventListener('click', () => {
          if (!AuthService.isAuthenticated()) return;
          const curSettings = Storage.getSettings();
          const newHide = !curSettings.hideBalances;
          Storage.saveSettings({ hideBalances: newHide });
          this.updatePrivacyIcon(privacyBtn);
          State.notify('balance_visibility_changed', newHide);
          Toast.info(newHide ? 'Modo Privado Ativado' : 'Valores Visíveis', newHide ? 'Saldos ocultos para discrição.' : 'Saldos exibidos.');
        });
      }

      const themeBtn = document.getElementById('header-btn-toggle-theme');
      if (themeBtn) {
        this.updateThemeIcon(themeBtn);
        themeBtn.addEventListener('click', () => {
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          const newTheme = isDark ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', newTheme);
          if (AuthService.isAuthenticated()) {
            Storage.saveSettings({ theme: newTheme });
          }
          this.updateThemeIcon(themeBtn);
          State.notify('theme_changed', newTheme);
        });
      }

      // Botões de Logout (Sidebar e Header)
      const sidebarLogoutBtn = document.getElementById('btn-sidebar-logout');
      if (sidebarLogoutBtn) {
        sidebarLogoutBtn.addEventListener('click', () => AuthService.confirmAndSignOut());
      }
      const headerLogoutBtn = document.getElementById('header-btn-logout');
      if (headerLogoutBtn) {
        headerLogoutBtn.addEventListener('click', () => AuthService.confirmAndSignOut());
      }
    },

    navigateTo(viewName) {
      // Bloqueia navegação se não estiver autenticado
      if (!AuthService.isAuthenticated() || AuthService.passwordRecoveryMode) {
        this.enforceAuthGate();
        return;
      }
      if (!this.views[viewName]) return;

      // Sincroniza a subaba de Inteligência Financeira vs Assistente IA ao clicar no menu lateral
      if (viewName === 'intelligence') {
        IntelligenceView.activeTab = 'overview';
      } else if (viewName === 'assistant') {
        IntelligenceView.activeTab = 'assistant';
      }

      State.setView(viewName);

      document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-view') === viewName) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      document.querySelectorAll('.view-section').forEach(section => section.classList.remove('active'));
      const sectionId = viewName === 'assistant' ? 'view-intelligence' : `view-${viewName}`;
      const activeSection = document.getElementById(sectionId);
      if (activeSection) activeSection.classList.add('active');

      const titles = {
        dashboard: { title: 'Visão Geral', breadcrumb: 'Início / Visão Geral' },
        transactions: { title: 'Transações Financeiras', breadcrumb: 'Início / Transações' },
        reports: { title: 'Relatórios & Gráficos', breadcrumb: 'Início / Relatórios' },
        categories: { title: 'Categorias de Gastos e Receitas', breadcrumb: 'Início / Categorias' },
        caixinhas: { title: 'Caixinhas & Metas Financeiras', breadcrumb: 'Início / Caixinhas' },
        investments: { title: 'Investimentos & Carteira', breadcrumb: 'Início / Investimentos' },
        intelligence: { title: 'Inteligência Financeira', breadcrumb: 'Início / Inteligência Financeira' },
        assistant: { title: 'Assistente IA Financeiro', breadcrumb: 'Início / Inteligência Financeira / Assistente IA' },
        settings: { title: 'Configurações do Sistema', breadcrumb: 'Início / Configurações' }
      };

      const headerTitle = document.getElementById('header-page-title');
      const headerBreadcrumb = document.getElementById('header-breadcrumb');
      if (headerTitle && titles[viewName]) headerTitle.textContent = titles[viewName].title;
      if (headerBreadcrumb && titles[viewName]) headerBreadcrumb.textContent = titles[viewName].breadcrumb;

      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Sempre re-renderiza a tela com os dados mais recentes de forma reativa
      if (this.views[viewName] && typeof this.views[viewName].render === 'function') {
        this.views[viewName].render();
      }
    },

    updateSidebarBadges() {
      if (!AuthService.isAuthenticated()) return;
      const txCount = Storage.getTransactions().length;
      const catCount = Storage.getCategories().length;
      const caxCount = Storage.getCaixinhas().length;
      const invCount = Storage.getActiveInvestments().length;
      const txBadge = document.getElementById('nav-badge-transactions');
      const catBadge = document.getElementById('nav-badge-categories');
      const caxBadge = document.getElementById('nav-badge-caixinhas');
      const invBadge = document.getElementById('nav-badge-investments');
      if (txBadge) txBadge.textContent = txCount;
      if (catBadge) catBadge.textContent = catCount;
      if (caxBadge) caxBadge.textContent = caxCount;
      if (invBadge) invBadge.textContent = invCount;
    },

    updatePrivacyIcon(btn) {
      const settings = Storage.getSettings();
      btn.innerHTML = settings.hideBalances ? Utils.icons.eyeOff : Utils.icons.eye;
      btn.title = settings.hideBalances ? 'Mostrar valores monetários' : 'Ocultar valores monetários';
    },

    updateThemeIcon(btn) {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      btn.innerHTML = isDark ? Utils.icons.sun : Utils.icons.moon;
      btn.title = isDark ? 'Ativar Modo Claro' : 'Ativar Modo Escuro';
    }
  };

  // Expõe no escopo global para depuração ou extensões
  window.MeuControle = {
    Utils,
    Storage,
    State,
    Charts,
    Toast,
    Modal,
    DashboardView,
    TransactionsView,
    ReportsView,
    CategoriesView,
    CaixinhasView,
    InvestmentsView,
    FinancialIntelligenceEngine,
    FinancialAssistantService,
    IntelligenceView,
    MarketApiService,
    SettingsView,
    SupabaseService,
    AuthService,
    SupabaseSyncService,
    LegacyMigrationService,
    AuthView,
    App
  };

  // Inicializa a aplicação
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }
})();
