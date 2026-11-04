/**
 * MEU CONTROLE - STORAGE & DATA LAYER
 * Gerenciamento de persistência local (LocalStorage), dados padrão,
 * integridade referencial de categorias e exportação/importação.
 */

import { Utils } from './utils.js';

const STORAGE_KEYS = {
  TRANSACTIONS: 'meu_controle_transactions',
  CATEGORIES: 'meu_controle_categories',
  SETTINGS: 'meu_controle_settings',
  CAIXINHAS: 'meu_controle_caixinhas'
};

// Caixinhas padrão (Metas financeiras de demonstração)
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

// Categorias padrão solicitadas no requisito
const DEFAULT_CATEGORIES = [
  // Despesas
  { id: 'cat_alim', name: 'Alimentação', type: 'expense', icon: '🍔', color: '#ef4444' },
  { id: 'cat_trans', name: 'Transporte', type: 'expense', icon: '🚗', color: '#f97316' },
  { id: 'cat_morad', name: 'Moradia', type: 'expense', icon: '🏠', color: '#eab308' },
  { id: 'cat_saude', name: 'Saúde', type: 'expense', icon: '💊', color: '#ec4899' },
  { id: 'cat_educ', name: 'Educação', type: 'expense', icon: '🎓', color: '#8b5cf6' },
  { id: 'cat_lazer', name: 'Lazer', type: 'expense', icon: '🎮', color: '#06b6d4' },
  { id: 'cat_comp', name: 'Compras', type: 'expense', icon: '🛍️', color: '#3b82f6' },
  { id: 'cat_cont', name: 'Contas', type: 'expense', icon: '📄', color: '#64748b' },
  { id: 'cat_out_desp', name: 'Outros', type: 'expense', icon: '📦', color: '#78716c' },

  // Receitas
  { id: 'cat_sal', name: 'Salário', type: 'income', icon: '💼', color: '#10b981' },
  { id: 'cat_free', name: 'Freelance', type: 'income', icon: '💻', color: '#059669' },
  { id: 'cat_inv', name: 'Investimentos', type: 'income', icon: '📈', color: '#14b8a6' },
  { id: 'cat_vend', name: 'Vendas', type: 'income', icon: '🏷️', color: '#6366f1' },
  { id: 'cat_out_rec', name: 'Outros', type: 'income', icon: '💵', color: '#84cc16' }
];

// Configurações padrão
const DEFAULT_SETTINGS = {
  userName: 'Pedro Henrique',
  theme: 'light',
  hideBalances: false,
  currency: 'BRL',
  createdAt: new Date().toISOString()
};

/**
 * Gera transações de demonstração realistas brasileiras para o mês atual e anterior
 */
function generateDemoTransactions() {
  const today = new Date();
  const curY = today.getFullYear();
  const curM = today.getMonth() + 1;
  const pad = n => String(n).padStart(2, '0');

  // Mês atual
  const mCur = `${curY}-${pad(curM)}`;
  // Mês anterior
  const prevDate = new Date(curY, today.getMonth() - 1, 1);
  const mPrev = `${prevDate.getFullYear()}-${pad(prevDate.getMonth() + 1)}`;

  return [
    // Receitas do mês atual
    {
      id: 'tx_demo_1',
      description: 'Salário Mensal',
      amount: 4500.00,
      type: 'income',
      categoryId: 'cat_sal',
      date: `${mCur}-05`,
      notes: 'Depósito em conta corrente da empresa'
    },
    {
      id: 'tx_demo_2',
      description: 'Projeto Freelance Website',
      amount: 1400.00,
      type: 'income',
      categoryId: 'cat_free',
      date: `${mCur}-12`,
      notes: 'Desenvolvimento de landing page responsiva'
    },
    {
      id: 'tx_demo_3',
      description: 'Rendimento CDB e Dividendos',
      amount: 280.50,
      type: 'income',
      categoryId: 'cat_inv',
      date: `${mCur}-15`,
      notes: 'Investimentos de renda fixa'
    },

    // Despesas do mês atual
    {
      id: 'tx_demo_4',
      description: 'Aluguel do Apartamento',
      amount: 1250.00,
      type: 'expense',
      categoryId: 'cat_morad',
      date: `${mCur}-06`,
      notes: 'Aluguel e taxa condominial'
    },
    {
      id: 'tx_demo_5',
      description: 'Supermercado Mensal',
      amount: 685.40,
      type: 'expense',
      categoryId: 'cat_alim',
      date: `${mCur}-08`,
      notes: 'Compras gerais de mantimentos'
    },
    {
      id: 'tx_demo_6',
      description: 'Combustível Posto Ipiranga',
      amount: 220.00,
      type: 'expense',
      categoryId: 'cat_trans',
      date: `${mCur}-10`,
      notes: 'Tanque cheio do veículo'
    },
    {
      id: 'tx_demo_7',
      description: 'Conta de Luz e Energia',
      amount: 175.30,
      type: 'expense',
      categoryId: 'cat_cont',
      date: `${mCur}-11`,
      notes: 'Fatura mensal de eletricidade'
    },
    {
      id: 'tx_demo_8',
      description: 'Internet Fibra Óptica',
      amount: 119.90,
      type: 'expense',
      categoryId: 'cat_cont',
      date: `${mCur}-13`,
      notes: 'Plano 500 Mega'
    },
    {
      id: 'tx_demo_9',
      description: 'Jantar Restaurante Italiano',
      amount: 165.00,
      type: 'expense',
      categoryId: 'cat_lazer',
      date: `${mCur}-14`,
      notes: 'Confraternização de final de semana'
    },
    {
      id: 'tx_demo_10',
      description: 'Farmácia e Vitaminas',
      amount: 98.70,
      type: 'expense',
      categoryId: 'cat_saude',
      date: `${mCur}-16`,
      notes: 'Medicamentos e suplementos'
    },
    {
      id: 'tx_demo_11',
      description: 'Curso de Especialização Online',
      amount: 249.90,
      type: 'expense',
      categoryId: 'cat_educ',
      date: `${mCur}-18`,
      notes: 'Mensalidade curso de tecnologia'
    },

    // Transações do mês anterior (para gráficos comparativos)
    {
      id: 'tx_demo_prev_1',
      description: 'Salário Mensal',
      amount: 4500.00,
      type: 'income',
      categoryId: 'cat_sal',
      date: `${mPrev}-05`,
      notes: 'Salário anterior'
    },
    {
      id: 'tx_demo_prev_2',
      description: 'Venda de Equipamento Usado',
      amount: 600.00,
      type: 'income',
      categoryId: 'cat_vend',
      date: `${mPrev}-10`,
      notes: 'Monitor secundário'
    },
    {
      id: 'tx_demo_prev_3',
      description: 'Aluguel do Apartamento',
      amount: 1250.00,
      type: 'expense',
      categoryId: 'cat_morad',
      date: `${mPrev}-06`,
      notes: 'Aluguel anterior'
    },
    {
      id: 'tx_demo_prev_4',
      description: 'Supermercado e Feira',
      amount: 720.50,
      type: 'expense',
      categoryId: 'cat_alim',
      date: `${mPrev}-09`,
      notes: 'Compras mês anterior'
    },
    {
      id: 'tx_demo_prev_5',
      description: 'Manutenção do Carro',
      amount: 450.00,
      type: 'expense',
      categoryId: 'cat_trans',
      date: `${mPrev}-15`,
      notes: 'Troca de óleo e filtros'
    },
    {
      id: 'tx_demo_prev_6',
      description: 'Contas de Água e Luz',
      amount: 235.80,
      type: 'expense',
      categoryId: 'cat_cont',
      date: `${mPrev}-12`,
      notes: 'Faturas anteriores'
    }
  ];
}

export const Storage = {
  /**
   * Inicializa o armazenamento caso seja a primeira vez abrindo o sistema
   */
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(generateDemoTransactions()));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CAIXINHAS)) {
      localStorage.setItem(STORAGE_KEYS.CAIXINHAS, JSON.stringify(DEFAULT_CAIXINHAS));
    }
  },

  // ==========================================
  // TRANSAÇÕES
  // ==========================================

  getTransactions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Erro ao ler transações do LocalStorage:', e);
      return [];
    }
  },

  getTransactionById(id) {
    const list = this.getTransactions();
    return list.find(t => t.id === id) || null;
  },

  saveTransaction(transaction) {
    const list = this.getTransactions();
    const newTx = {
      id: transaction.id || Utils.generateId(),
      description: transaction.description.trim(),
      amount: Number(transaction.amount),
      type: transaction.type, // 'income' ou 'expense'
      categoryId: transaction.categoryId,
      date: transaction.date,
      notes: (transaction.notes || '').trim(),
      createdAt: transaction.createdAt || new Date().toISOString()
    };
    list.unshift(newTx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
    return newTx;
  },

  updateTransaction(transaction) {
    const list = this.getTransactions();
    const index = list.findIndex(t => t.id === transaction.id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      description: transaction.description.trim(),
      amount: Number(transaction.amount),
      type: transaction.type,
      categoryId: transaction.categoryId,
      date: transaction.date,
      notes: (transaction.notes || '').trim(),
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
    return list[index];
  },

  deleteTransaction(id) {
    const list = this.getTransactions();
    const filtered = list.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filtered));
    return true;
  },

  // ==========================================
  // CATEGORIAS
  // ==========================================

  getCategories() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch (e) {
      console.error('Erro ao ler categorias do LocalStorage:', e);
      return DEFAULT_CATEGORIES;
    }
  },

  getCategoryById(id) {
    const list = this.getCategories();
    return list.find(c => c.id === id) || {
      id: 'unknown',
      name: 'Sem Categoria',
      icon: '❓',
      color: '#94a3b8',
      type: 'expense'
    };
  },

  saveCategory(category) {
    const list = this.getCategories();
    const newCat = {
      id: category.id || Utils.generateId(),
      name: category.name.trim(),
      type: category.type, // 'income' ou 'expense'
      icon: category.icon || '🏷️',
      color: category.color || '#3b82f6'
    };
    list.push(newCat);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
    return newCat;
  },

  updateCategory(category) {
    const list = this.getCategories();
    const index = list.findIndex(c => c.id === category.id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      name: category.name.trim(),
      type: category.type,
      icon: category.icon,
      color: category.color
    };

    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
    return list[index];
  },

  /**
   * Verifica se uma categoria está sendo usada por transações
   * @param {string} categoryId
   * @returns {number} Quantidade de transações vinculadas
   */
  countTransactionsByCategory(categoryId) {
    const transactions = this.getTransactions();
    return transactions.filter(t => t.categoryId === categoryId).length;
  },

  /**
   * Exclui categoria, opcionalmente reclassificando suas transações
   * Conforme especificação: não permitir excluir se estiver em uso sem reclassificar.
   */
  deleteCategory(categoryId, reclassifyToId = null) {
    const count = this.countTransactionsByCategory(categoryId);
    if (count > 0 && !reclassifyToId) {
      throw new Error(`Esta categoria está em uso por ${count} transações. Selecione uma categoria de destino.`);
    }

    // Se houver categoria de destino, reclassifica
    if (reclassifyToId) {
      const transactions = this.getTransactions();
      const updatedTx = transactions.map(t => {
        if (t.categoryId === categoryId) {
          return { ...t, categoryId: reclassifyToId };
        }
        return t;
      });
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTx));
    }

    // Remove categoria
    const list = this.getCategories();
    const filtered = list.filter(c => c.id !== categoryId);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
    return true;
  },

  // ==========================================
  // CAIXINHAS (Metas e Poupança Reservada)
  // ==========================================

  getCaixinhas() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CAIXINHAS);
      return data ? JSON.parse(data) : DEFAULT_CAIXINHAS;
    } catch (e) {
      console.error('Erro ao ler caixinhas do LocalStorage:', e);
      return DEFAULT_CAIXINHAS;
    }
  },

  getCaixinhaById(id) {
    const list = this.getCaixinhas();
    return list.find(c => c.id === id) || null;
  },

  /**
   * Retorna a soma de todo o dinheiro reservado em todas as caixinhas
   */
  getTotalInCaixinhas() {
    const list = this.getCaixinhas();
    return list.reduce((sum, c) => sum + (Number(c.currentAmount) || 0), 0);
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
        date: data.date || Utils.getTodayString(),
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
    return newCaixinha;
  },

  updateCaixinha(data) {
    const list = this.getCaixinhas();
    const index = list.findIndex(c => c.id === data.id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      name: data.name.trim(),
      description: (data.description || '').trim(),
      targetAmount: Math.max(0.01, Number(data.targetAmount) || 0),
      deadline: data.deadline || null,
      icon: data.icon || list[index].icon,
      color: data.color || list[index].color,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.CAIXINHAS, JSON.stringify(list));
    return list[index];
  },

  deleteCaixinha(id, returnFunds = true) {
    const list = this.getCaixinhas();
    const caixinha = list.find(c => c.id === id);
    if (!caixinha) return false;

    // Se returnFunds for true, o valor que estava guardado na caixinha deixa de estar reservado
    // e assim volta automaticamente ao saldo disponível (conforme a fórmula: Saldo = Receitas - Despesas - Caixinhas).
    const filtered = list.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CAIXINHAS, JSON.stringify(filtered));
    return true;
  },

  /**
   * Adiciona dinheiro à caixinha (Depósito)
   */
  addFundsToCaixinha(id, amount, date, description) {
    const val = Number(amount);
    if (isNaN(val) || val <= 0) {
      throw new Error('Informe um valor válido e positivo para guardar.');
    }

    const list = this.getCaixinhas();
    const index = list.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Caixinha não encontrada.');

    const caixinha = list[index];
    caixinha.currentAmount = (Number(caixinha.currentAmount) || 0) + val;

    if (!caixinha.history) caixinha.history = [];
    caixinha.history.unshift({
      id: Utils.generateId(),
      type: 'deposit',
      amount: val,
      date: date || Utils.getTodayString(),
      description: (description || 'Depósito na caixinha').trim(),
      createdAt: new Date().toISOString()
    });

    localStorage.setItem(STORAGE_KEYS.CAIXINHAS, JSON.stringify(list));
    return caixinha;
  },

  /**
   * Retira dinheiro da caixinha (Resgate para o saldo disponível)
   */
  withdrawFundsFromCaixinha(id, amount, date, description) {
    const val = Number(amount);
    if (isNaN(val) || val <= 0) {
      throw new Error('Informe um valor válido e positivo para resgatar.');
    }

    const list = this.getCaixinhas();
    const index = list.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Caixinha não encontrada.');

    const caixinha = list[index];
    const cur = Number(caixinha.currentAmount) || 0;
    if (val > cur) {
      throw new Error(`Saldo insuficiente na caixinha. Você possui apenas ${Utils.formatCurrency(cur)} guardados.`);
    }

    caixinha.currentAmount = cur - val;

    if (!caixinha.history) caixinha.history = [];
    caixinha.history.unshift({
      id: Utils.generateId(),
      type: 'withdraw',
      amount: val,
      date: date || Utils.getTodayString(),
      description: (description || 'Resgate para saldo disponível').trim(),
      createdAt: new Date().toISOString()
    });

    localStorage.setItem(STORAGE_KEYS.CAIXINHAS, JSON.stringify(list));
    return caixinha;
  },

  // ==========================================
  // CONFIGURAÇÕES E PREFERÊNCIAS
  // ==========================================

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
    return merged;
  },

  // ==========================================
  // EXPORTAÇÃO, IMPORTAÇÃO E RESET
  // ==========================================

  /**
   * Exporta os dados para arquivo CSV no formato brasileiro (ponto e vírgula com UTF-8 BOM)
   */
  exportToCsv() {
    const transactions = this.getTransactions();
    const categoriesMap = new Map(this.getCategories().map(c => [c.id, c.name]));

    const headers = ['ID;Data;Tipo;Categoria;Descricao;Valor (R$);Observacao'];
    const rows = transactions.map(t => {
      const catName = categoriesMap.get(t.categoryId) || 'Outros';
      const typeStr = t.type === 'income' ? 'Receita' : 'Despesa';
      const valStr = t.amount.toFixed(2).replace('.', ',');
      const desc = (t.description || '').replace(/;/g, ' ');
      const notes = (t.notes || '').replace(/;/g, ' ');
      return `${t.id};${Utils.formatDate(t.date)};${typeStr};${catName};${desc};${valStr};${notes}`;
    });

    const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
    const filename = `meu_controle_transacoes_${Utils.getTodayString()}.csv`;
    Utils.downloadFile(csvContent, filename, 'text/csv;charset=utf-8');
  },

  /**
   * Exporta backup completo em JSON
   */
  exportToJson() {
    const data = {
      version: '2.1.0',
      exportDate: new Date().toISOString(),
      transactions: this.getTransactions(),
      categories: this.getCategories(),
      caixinhas: this.getCaixinhas(),
      settings: this.getSettings()
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const filename = `meu_controle_backup_${Utils.getTodayString()}.json`;
    Utils.downloadFile(jsonStr, filename, 'application/json;charset=utf-8');
  },

  /**
   * Importa backup completo em JSON
   */
  importFromJson(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data.transactions || !data.categories) {
        throw new Error('Arquivo de backup inválido: campos essenciais ausentes.');
      }
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
      if (data.caixinhas) {
        localStorage.setItem(STORAGE_KEYS.CAIXINHAS, JSON.stringify(data.caixinhas));
      }
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      return true;
    } catch (e) {
      throw new Error('Não foi possível ler o arquivo de backup: ' + e.message);
    }
  },

  /**
   * Restaura os dados para a demonstração inicial
   */
  resetToDemo() {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(generateDemoTransactions()));
    localStorage.setItem(STORAGE_KEYS.CAIXINHAS, JSON.stringify(DEFAULT_CAIXINHAS));
  },

  /**
   * Limpa todas as movimentações e redefine as categorias e caixinhas para o padrão
   */
  clearAllData() {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.CAIXINHAS, JSON.stringify([]));
  }
};
