/**
 * MEU CONTROLE - REPORTS VIEW (Relatórios e Análises Financeiras)
 * Gráficos comparativos, distribuição de gastos, taxa de poupança,
 * ranking detalhado de despesas e filtros de período flexíveis.
 */

import { Utils } from '../utils.js';
import { Storage } from '../storage.js';
import { State } from '../state.js';
import { Charts } from '../charts.js';

export const ReportsView = {
  container: null,
  investmentClassFilter: 'all',

  init(containerElement) {
    this.container = containerElement;
    this.render();

    State.subscribe((event) => {
      if (['transaction_saved', 'transaction_deleted', 'category_saved', 'category_deleted', 'reports_filter_changed', 'balance_visibility_changed', 'theme_changed', 'investments_updated'].includes(event)) {
        if (State.currentView === 'reports') {
          this.render();
        }
      }
    });

    window.addEventListener('resize', () => {
      if (State.currentView === 'reports') {
        this.renderCharts();
      }
    });
  },

  renderInvestmentsReportSection(privacyClass) {
    const investments = typeof Storage.getInvestments === 'function' ? Storage.getInvestments() : [];
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
                  const totalInv = typeof Storage.getCostBasis === 'function' ? (Storage.getCostBasis(inv) || (qty * avg)) : (qty * avg);
                  const hasQ = typeof Storage.hasMarketQuote === 'function' ? Storage.hasMarketQuote(inv) : false;
                  const curPrice = typeof Storage.getMarketPrice === 'function' ? Storage.getMarketPrice(inv) : null;
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
                  const applied = typeof Storage.getAppliedAmount === 'function' ? Storage.getAppliedAmount(inv) : (Number(inv.appliedAmount) || 0);
                  const accYield = typeof Storage.getAccumulatedYield === 'function' ? Storage.getAccumulatedYield(inv) : null;
                  const yieldLabel = typeof Storage.getYieldTypeLabel === 'function' ? Storage.getYieldTypeLabel(inv.yieldType) : (inv.yieldType || 'CDI');
                  return `
                    <tr>
                      <td><strong>${Utils.escapeHtml(inv.name)}</strong></td>
                      <td>${Utils.escapeHtml(inv.institution || '—')}</td>
                      <td class="font-bold text-primary ${privacyClass}">${Utils.formatCurrency(applied)}</td>
                      <td><span class="inv-badge-class fixed">${Utils.escapeHtml(yieldLabel)}</span></td>
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

    // Determina o intervalo de datas baseado no preset
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth(); // 0-11
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

    // Filtra as transações
    let filtered = [...allTransactions];
    if (filterStart) {
      filtered = filtered.filter(t => t.date >= filterStart);
    }
    if (filterEnd) {
      filtered = filtered.filter(t => t.date <= filterEnd);
    }

    // Métricas
    const metrics = State.calculateMetrics(filtered);

    // Maior despesa individual do período
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

    // Média diária de gastos
    let daysCount = 30;
    if (filterStart && filterEnd) {
      const diffTime = Math.abs(new Date(filterEnd) - new Date(filterStart));
      daysCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }
    const dailyAverage = metrics.expense / daysCount;

    // Breakdown de despesas por categoria
    const categoryBreakdown = State.getCategoryBreakdown(filtered, 'expense');

    this.container.innerHTML = `
      <!-- Cabeçalho e Seleção de Período -->
      <div class="dashboard-header-bar">
        <div>
          <h2>Relatórios e Análises</h2>
          <p>Visão aprofundada dos seus hábitos e fluxo de receitas e despesas.</p>
        </div>

        <button type="button" class="btn btn-outline btn-sm" id="btn-export-report-csv">
          ${Utils.icons.download} Exportar Dados (CSV)
        </button>
      </div>

      <!-- Abas de Filtros de Período -->
      <div class="reports-period-tabs">
        <button type="button" class="report-tab-btn ${preset === 'current_month' ? 'active' : ''}" data-preset="current_month">Este Mês</button>
        <button type="button" class="report-tab-btn ${preset === 'last_month' ? 'active' : ''}" data-preset="last_month">Mês Passado</button>
        <button type="button" class="report-tab-btn ${preset === '3months' ? 'active' : ''}" data-preset="3months">Últimos 3 Meses</button>
        <button type="button" class="report-tab-btn ${preset === '6months' ? 'active' : ''}" data-preset="6months">Últimos 6 Meses</button>
        <button type="button" class="report-tab-btn ${preset === 'this_year' ? 'active' : ''}" data-preset="this_year">Este Ano (${curYear})</button>
        <button type="button" class="report-tab-btn ${preset === 'all' ? 'active' : ''}" data-preset="all">Todo o Histórico</button>
        <button type="button" class="report-tab-btn ${preset === 'custom' ? 'active' : ''}" data-preset="custom">Personalizado</button>
      </div>

      <!-- Barra de Período Personalizado -->
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

      <!-- KPIs Resumo Financeiro do Período -->
      <div class="reports-kpi-grid">
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
          <span class="report-kpi-title">Saldo Líquido</span>
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

      <!-- Gráficos de Análise -->
      <div class="reports-grid-2col">
        <!-- Gráfico 1: Comparativo no Ano -->
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

        <!-- Gráfico 2: Despesas por Categoria -->
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

      <!-- Ranking Detalhado de Gastos por Categoria -->
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

      // Eventos das Abas de Período
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

    // Botão Aplicar Intervalo Personalizado
    const applyCustomBtn = this.container.querySelector('#btn-apply-custom-dates');
    if (applyCustomBtn) {
      applyCustomBtn.addEventListener('click', () => {
        const sVal = this.container.querySelector('#report-custom-start').value;
        const eVal = this.container.querySelector('#report-custom-end').value;
        State.setReportsFilter('custom', sVal, eVal);
      });
    }

    // Botão Exportar CSV
    const exportBtn = this.container.querySelector('#btn-export-report-csv');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        Storage.exportToCsv();
      });
    }

    this.renderCharts(allTransactions, filtered, curYear);
  },

  renderCharts(allTransactions = null, filtered = null, curYear = null) {
    if (!allTransactions) allTransactions = Storage.getTransactions();
    if (!curYear) curYear = new Date().getFullYear();

    // Gráfico de Barras (Histórico do ano)
    const barCanvas = document.getElementById('chart-reports-bars');
    if (barCanvas) {
      const monthlyData = State.getMonthlyEvolution(allTransactions, curYear);
      Charts.renderBarChart(barCanvas, monthlyData);
    }

    // Gráfico Donut de Despesas
    const donutCanvas = document.getElementById('chart-reports-donut');
    if (donutCanvas) {
      if (!filtered) filtered = allTransactions;
      const breakdown = State.getCategoryBreakdown(filtered, 'expense');
      Charts.renderDonutChart(donutCanvas, breakdown.items, breakdown.totalSum);
    }
  }
};
