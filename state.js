/**
 * MEU CONTROLE - REACTIVE STATE MANAGEMENT & FINANCIAL ENGINE
 * Gerencia o estado global, eventos e cálculos financeiros precisos.
 */

import { Storage } from './storage.js';

class StateStore {
  constructor() {
    this.subscribers = [];
    this.currentView = 'dashboard';
    
    // Filtros atuais do Dashboard
    const today = new Date();
    this.dashboardFilter = {
      month: today.getMonth() + 1, // 1-12
      year: today.getFullYear()
    };

    // Filtros de Transações
    this.transactionsFilter = {
      search: '',
      type: 'all',         // 'all', 'income', 'expense'
      categoryId: 'all',
      period: 'all'        // 'all', 'current_month', 'last_month', 'this_year'
    };

    // Filtros de Relatórios
    this.reportsFilter = {
      preset: 'current_month', // 'current_month', 'last_month', '3months', '6months', 'this_year', 'custom'
      startDate: null,
      endDate: null
    };
  }

  /**
   * Inscreve um ouvinte para alterações de estado
   * @param {Function} callback
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(fn => fn !== callback);
    };
  }

  /**
   * Notifica todos os ouvintes sobre mudanças
   * @param {string} eventName
   * @param {any} payload
   */
  notify(eventName, payload = null) {
    this.subscribers.forEach(fn => {
      try {
        fn(eventName, payload);
      } catch (err) {
        console.error('Erro no ouvinte de estado:', err);
      }
    });
  }

  // ==========================================
  // VIEW NAVIGATION
  // ==========================================

  setView(viewName) {
    this.currentView = viewName;
    this.notify('view_changed', viewName);
  }

  // ==========================================
  // FILTERS
  // ==========================================

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

  // ==========================================
  // FINANCIAL CALCULATIONS ENGINE
  // ==========================================

  /**
   * Filtra transações pelo mês e ano especificados
   * @param {Array} transactions
   * @param {number|'all'} month
   * @param {number} year
   */
  filterByMonthAndYear(transactions, month, year) {
    return transactions.filter(t => {
      if (!t.date) return false;
      const [tY, tM] = t.date.split('-').map(n => parseInt(n, 10));
      if (year && tY !== year) return false;
      if (month !== 'all' && tM !== month) return false;
      return true;
    });
  }

  /**
   * Calcula as 4 métricas essenciais de um conjunto de transações:
   * 1. Saldo disponível (Receitas - Despesas)
   * 2. Total de receitas
   * 3. Total de despesas
   * 4. Taxa de economia (% poupada)
   */
  calculateMetrics(transactions) {
    let income = 0;
    let expense = 0;

    for (const t of transactions) {
      const val = Math.abs(Number(t.amount) || 0);
      if (t.type === 'income') {
        income += val;
      } else if (t.type === 'expense') {
        expense += val;
      }
    }

    const reservedInCaixinhas = Storage.getTotalInCaixinhas();
    const balance = income - expense - reservedInCaixinhas;
    const totalWealth = balance + reservedInCaixinhas;

    // Taxa de economia = (Patrimônio Total / Receitas) * 100
    let savingsRate = 0;
    if (income > 0) {
      savingsRate = Math.max(0, Math.round((totalWealth / income) * 100));
    }

    return {
      balance,
      income,
      expense,
      reservedInCaixinhas,
      totalWealth,
      savingsRate
    };
  }

  /**
   * Agrupa transações por categoria com soma total, percentual e metadados
   * @param {Array} transactions
   * @param {'expense'|'income'} type
   */
  getCategoryBreakdown(transactions, type = 'expense') {
    const categories = Storage.getCategories();
    const catMap = new Map(categories.map(c => [c.id, c]));

    const filtered = transactions.filter(t => t.type === type);
    const totals = new Map();
    let totalSum = 0;

    for (const t of filtered) {
      const catId = t.categoryId;
      const current = totals.get(catId) || 0;
      const val = Number(t.amount) || 0;
      totals.set(catId, current + val);
      totalSum += val;
    }

    const result = [];
    totals.forEach((amount, catId) => {
      const cat = catMap.get(catId) || {
        id: catId,
        name: 'Outros',
        icon: '🏷️',
        color: '#94a3b8'
      };
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

    // Ordena do maior para o menor
    result.sort((a, b) => b.amount - a.amount);
    return {
      items: result,
      totalSum
    };
  }

  /**
   * Agrupa receitas e despesas por mês para gráficos de evolução no ano
   * @param {Array} transactions
   * @param {number} year
   */
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
        if (t.type === 'income') {
          months[idx].income += val;
        } else if (t.type === 'expense') {
          months[idx].expense += val;
        }
      }
    }

    return months;
  }
}

export const State = new StateStore();
