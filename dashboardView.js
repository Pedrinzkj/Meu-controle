/**
 * MEU CONTROLE - DASHBOARD VIEW (Visão Geral)
 * Métricas em tempo real, gráficos de receitas/despesas, donut de categorias,
 * movimentações recentes e filtro mensal/anual.
 */

import { Utils } from '../utils.js';
import { Storage } from '../storage.js';
import { State } from '../state.js';
import { Charts } from '../charts.js';
import { Modal } from '../components/modal.js';
import { Toast } from '../components/toast.js';

export const DashboardView = {
  container: null,

  init(containerElement) {
    this.container = containerElement;
    this.render();

    // Re-renderiza quando houver alterações em transações, categorias, caixinhas ou filtros
    State.subscribe((event, payload) => {
      if (['transaction_saved', 'transaction_deleted', 'category_saved', 'category_deleted', 'caixinhas_updated', 'dashboard_filter_changed', 'balance_visibility_changed', 'theme_changed'].includes(event)) {
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
        if (State.currentView === 'dashboard') {
          this.render();
        }
      }
    });

    // Re-renderiza gráficos quando a janela é redimensionada
    window.addEventListener('resize', () => {
      if (State.currentView === 'dashboard') {
        this.renderCharts();
      }
    });
  },

  render() {
    if (!this.container) return;

    const allTransactions = Storage.getTransactions();
    const categories = Storage.getCategories();
    const caixinhas = Storage.getCaixinhas();
    const catMap = new Map(categories.map(c => [c.id, c]));
    const settings = Storage.getSettings();

    // Top 3 caixinhas com maior progresso
    const sortedCaixinhas = [...caixinhas].sort((a, b) => {
      const pctA = (Number(a.currentAmount) || 0) / (Number(a.targetAmount) || 1);
      const pctB = (Number(b.currentAmount) || 0) / (Number(b.targetAmount) || 1);
      return pctB - pctA;
    });
    const topCaixinhas = sortedCaixinhas.slice(0, 3);

    // Filtro atual
    const { month, year } = State.dashboardFilter;
    const filteredTransactions = State.filterByMonthAndYear(allTransactions, month, year);

    // Métricas calculadas dinamicamente
    const metrics = State.calculateMetrics(filteredTransactions);

    // Anos disponíveis nas transações para o filtro
    const availableYears = Array.from(new Set(
      allTransactions
        .map(t => t.date ? parseInt(t.date.split('-')[0], 10) : null)
        .filter(Boolean)
    )).sort((a, b) => b - a);

    if (!availableYears.includes(new Date().getFullYear())) {
      availableYears.unshift(new Date().getFullYear());
    }

    // Movimentações recentes (ordenadas por data decrescente)
    const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentTransactions = sortedTransactions.slice(0, 6);

    const privacyClass = settings.hideBalances ? 'privacy-blurred' : '';

    this.container.innerHTML = `
      <!-- Cabeçalho do Dashboard com Saudação e Filtro -->
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

      <!-- 4 Cards de Métricas Principais -->
      <div class="dashboard-metrics-grid">
        <!-- 1. Saldo Disponível -->
        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-label">Saldo Disponível</span>
            <div class="metric-icon-wrap balance">
              ${Utils.icons.wallet}
            </div>
          </div>
          <div class="metric-value ${privacyClass} ${metrics.balance < 0 ? 'text-danger' : 'text-primary'}">
            ${Utils.formatCurrency(metrics.balance)}
          </div>
          <div class="metric-subtext">
            <span>${metrics.balance >= 0 ? '🟢 Saldo positivo' : '🔴 Saldo negativo'}</span>
          </div>
        </div>

        <!-- 2. Total de Receitas -->
        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-label">Total de Receitas</span>
            <div class="metric-icon-wrap income">
              ${Utils.icons.trendingUp}
            </div>
          </div>
          <div class="metric-value ${privacyClass} text-success">
            + ${Utils.formatCurrency(metrics.income)}
          </div>
          <div class="metric-subtext">
            <span>Entradas no período</span>
          </div>
        </div>

        <!-- 3. Total de Despesas -->
        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-label">Total de Despesas</span>
            <div class="metric-icon-wrap expense">
              ${Utils.icons.trendingDown}
            </div>
          </div>
          <div class="metric-value ${privacyClass} text-danger">
            - ${Utils.formatCurrency(metrics.expense)}
          </div>
          <div class="metric-subtext">
            <span>Saídas e pagamentos</span>
          </div>
        </div>

        <!-- 4. Dinheiro Guardado em Caixinhas -->
        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-label">Dinheiro Guardado</span>
            <div class="metric-icon-wrap" style="background-color: rgba(16, 185, 129, 0.15); color: var(--color-primary);">
              ${Utils.icons.caixinhas}
            </div>
          </div>
          <div class="metric-value text-primary ${privacyClass}">
            ${Utils.formatCurrency(metrics.reservedInCaixinhas)}
          </div>
          <div class="metric-subtext">
            <span>Reservado em ${caixinhas.length} ${caixinhas.length === 1 ? 'caixinha' : 'caixinhas'}</span>
          </div>
        </div>

        <!-- 5. Taxa de Economia -->
        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-label">Taxa de Economia</span>
            <div class="metric-icon-wrap savings">
              ${Utils.icons.piggyBank}
            </div>
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
      </div>

      <!-- Grade de Gráficos (Receitas vs Despesas + Distribuição por Categoria) -->
      <div class="dashboard-charts-grid">
        <!-- Gráfico 1: Comparativo Receitas x Despesas -->
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

        <!-- Gráfico 2: Despesas por Categoria -->
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

      <!-- Histórico de Movimentações Recentes -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Movimentações Recentes</h3>
            <p class="card-subtitle">Últimas transações registradas no período selecionado</p>
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

      <!-- Seção Minhas Caixinhas (Top 3 Caixinhas com Maior Progresso) -->
      <div class="card" style="margin-top: var(--spacing-6);">
        <div class="card-header">
          <div>
            <h3 class="card-title">${Utils.icons.caixinhas} Minhas Caixinhas & Metas</h3>
            <p class="card-subtitle">Objetivos financeiros com maior progresso de conclusão</p>
          </div>
          <button type="button" class="btn btn-outline btn-sm" id="btn-view-all-caixinhas">
            Ver Todas (${caixinhas.length})
          </button>
        </div>
        <div class="card-body">
          ${topCaixinhas.length === 0 ? `
            <div class="empty-state" style="padding: var(--spacing-6);">
              <p class="empty-state-text">Você ainda não tem caixinhas criadas. Crie sua primeira caixinha para separar dinheiro dos seus objetivos!</p>
              <button type="button" class="btn btn-primary btn-sm" id="btn-dash-create-caixinha">
                ${Utils.icons.plus} Criar Caixinha
              </button>
            </div>
          ` : `
            <div class="dashboard-caixinhas-preview-grid">
              ${topCaixinhas.map(c => {
                const current = Number(c.currentAmount) || 0;
                const target = Number(c.targetAmount) || 1;
                const pct = Math.min(100, Math.round((current / target) * 100));
                const isCompleted = current >= target;
                return `
                  <div class="dash-caixinha-item" style="border-left: 4px solid ${c.color};">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-2);">
                      <div style="display: flex; align-items: center; gap: var(--spacing-2);">
                        <span style="font-size: 1.3rem;">${c.icon}</span>
                        <strong style="color: var(--text-primary); font-size: var(--font-size-sm);">${Utils.escapeHtml(c.name)}</strong>
                      </div>
                      <span class="badge" style="background-color: ${c.color}18; color: ${c.color}; font-weight: 700;">
                        ${pct}% ${isCompleted ? '✓ Concluída' : ''}
                      </span>
                    </div>

                    <div style="display: flex; justify-content: space-between; font-size: var(--font-size-xs); color: var(--text-muted); margin-bottom: 6px;">
                      <span>Guardado: <strong class="text-primary ${privacyClass}">${Utils.formatCurrency(current)}</strong></span>
                      <span>Meta: ${Utils.formatCurrency(target)}</span>
                    </div>

                    <div class="savings-progress-track">
                      <div class="savings-progress-bar" style="width: ${pct}%; background: linear-gradient(90deg, ${c.color}, ${c.color}cc);"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    // Eventos de Filtro
    const monthSelect = this.container.querySelector('#dash-select-month');
    const yearSelect = this.container.querySelector('#dash-select-year');

    monthSelect.addEventListener('change', (e) => {
      State.setDashboardFilter(e.target.value, yearSelect.value);
    });

    yearSelect.addEventListener('change', (e) => {
      State.setDashboardFilter(monthSelect.value, e.target.value);
    });

    // Botão Ver Todas as Transações
    const viewAllBtn = this.container.querySelector('#btn-view-all-transactions');
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => {
        State.setView('transactions');
      });
    }

    // Botões para ir para Caixinhas
    const viewAllCaxBtn = this.container.querySelector('#btn-view-all-caixinhas');
    if (viewAllCaxBtn) {
      viewAllCaxBtn.addEventListener('click', () => {
        State.setView('caixinhas');
      });
    }

    const createCaxBtn = this.container.querySelector('#btn-dash-create-caixinha');
    if (createCaxBtn) {
      createCaxBtn.addEventListener('click', () => {
        State.setView('caixinhas');
      });
    }

    // Botão Adicionar Movimentação no empty state
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

    // Clique em item recente para editar
    const items = this.container.querySelectorAll('.recent-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        const tx = Storage.getTransactionById(id);
        if (tx) {
          Modal.openTransactionModal(tx, (updatedTx) => {
            Storage.updateTransaction(updatedTx);
            Toast.success('Atualizado!', 'Transação alterada com sucesso.');
            State.notify('transaction_saved', updatedTx);
          });
        }
      });
    });

    // Renderiza gráficos via Canvas
    this.renderCharts(allTransactions, filteredTransactions, year);
  },

  renderCharts(allTransactions = null, filteredTransactions = null, year = null) {
    if (!allTransactions) allTransactions = Storage.getTransactions();
    if (!year) year = State.dashboardFilter.year;
    if (!filteredTransactions) {
      filteredTransactions = State.filterByMonthAndYear(allTransactions, State.dashboardFilter.month, year);
    }

    // 1. Gráfico de Barras Mensais (Evolução no ano)
    const barCanvas = document.getElementById('chart-monthly-bars');
    if (barCanvas) {
      const monthlyData = State.getMonthlyEvolution(allTransactions, year);
      Charts.renderBarChart(barCanvas, monthlyData);
    }

    // 2. Gráfico Donut de Despesas por Categoria
    const donutCanvas = document.getElementById('chart-categories-donut');
    if (donutCanvas) {
      const breakdown = State.getCategoryBreakdown(filteredTransactions, 'expense');
      Charts.renderDonutChart(donutCanvas, breakdown.items, breakdown.totalSum);
    }
  }
};
