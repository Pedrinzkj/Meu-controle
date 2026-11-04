/**
 * MEU CONTROLE - TRANSACTIONS VIEW (Transações)
 * Listagem completa, busca textual, filtros múltiplos, criação, edição,
 * exclusão com confirmação e responsividade para celular e desktop.
 */

import { Utils } from '../utils.js';
import { Storage } from '../storage.js';
import { State } from '../state.js';
import { Modal } from '../components/modal.js';
import { Toast } from '../components/toast.js';

export const TransactionsView = {
  container: null,

  init(containerElement) {
    this.container = containerElement;
    this.render();

    // Re-renderiza quando houver alterações em transações, categorias ou filtros
    State.subscribe((event) => {
      if (['transaction_saved', 'transaction_deleted', 'category_saved', 'category_deleted', 'transactions_filter_changed', 'balance_visibility_changed'].includes(event)) {
        if (State.currentView === 'transactions') {
          this.render();
        }
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

    // Filtros atuais
    const { search, type, categoryId, period } = State.transactionsFilter;

    // Aplicação dos Filtros
    let filtered = [...allTransactions];

    // 1. Busca por texto
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(t => {
        const catName = (catMap.get(t.categoryId)?.name || '').toLowerCase();
        return (t.description || '').toLowerCase().includes(q) ||
               (t.notes || '').toLowerCase().includes(q) ||
               catName.includes(q);
      });
    }

    // 2. Filtro por Tipo (Receita / Despesa)
    if (type !== 'all') {
      filtered = filtered.filter(t => t.type === type);
    }

    // 3. Filtro por Categoria
    if (categoryId !== 'all') {
      filtered = filtered.filter(t => t.categoryId === categoryId);
    }

    // 4. Filtro por Período
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

    // Ordenação por data decrescente (mais recente primeiro)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Cálculos de resumo do conjunto filtrado
    let filteredIncome = 0;
    let filteredExpense = 0;
    filtered.forEach(t => {
      const val = Number(t.amount) || 0;
      if (t.type === 'income') filteredIncome += val;
      if (t.type === 'expense') filteredExpense += val;
    });
    const filteredNet = filteredIncome - filteredExpense;

    this.container.innerHTML = `
      <!-- Barra Superior de Ferramentas e Filtros -->
      <div class="transactions-toolbar">
        <div class="toolbar-top-row">
          <!-- Campo de Busca em Tempo Real -->
          <div class="search-input-wrap">
            ${Utils.icons.search}
            <input type="text" id="tx-search-input" placeholder="Buscar por descrição, anotação..." value="${Utils.escapeHtml(search)}">
          </div>

          <!-- Botão Nova Transação -->
          <button type="button" class="btn btn-primary" id="btn-add-transaction">
            ${Utils.icons.plus} Nova Movimentação
          </button>
        </div>

        <!-- Linha de Filtros Secundários -->
        <div class="toolbar-filters-row">
          <!-- Tipo -->
          <select id="filter-select-type" class="filter-select">
            <option value="all" ${type === 'all' ? 'selected' : ''}>Todos os Tipos</option>
            <option value="income" ${type === 'income' ? 'selected' : ''}>Apenas Receitas</option>
            <option value="expense" ${type === 'expense' ? 'selected' : ''}>Apenas Despesas</option>
          </select>

          <!-- Categoria -->
          <select id="filter-select-category" class="filter-select">
            <option value="all" ${categoryId === 'all' ? 'selected' : ''}>Todas as Categorias</option>
            ${categories.map(c => `
              <option value="${c.id}" ${categoryId === c.id ? 'selected' : ''}>
                ${c.icon} ${Utils.escapeHtml(c.name)} (${c.type === 'income' ? 'Receita' : 'Despesa'})
              </option>
            `).join('')}
          </select>

          <!-- Período -->
          <select id="filter-select-period" class="filter-select">
            <option value="all" ${period === 'all' ? 'selected' : ''}>Todas as Datas</option>
            <option value="current_month" ${period === 'current_month' ? 'selected' : ''}>Este Mês</option>
            <option value="last_month" ${period === 'last_month' ? 'selected' : ''}>Mês Passado</option>
            <option value="this_year" ${period === 'this_year' ? 'selected' : ''}>Este Ano (${curYear})</option>
          </select>

          <!-- Limpar Filtros -->
          ${(search || type !== 'all' || categoryId !== 'all' || period !== 'all') ? `
            <button type="button" class="btn btn-outline btn-sm" id="btn-reset-filters">
              ${Utils.icons.close} Limpar Filtros
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Faixa de Estatísticas do Filtro -->
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

      <!-- Tabela para Desktop -->
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

      <!-- Lista de Cards para Mobile -->
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

    // Eventos de Filtro
    const searchInput = this.container.querySelector('#tx-search-input');
    const typeSelect = this.container.querySelector('#filter-select-type');
    const catSelect = this.container.querySelector('#filter-select-category');
    const periodSelect = this.container.querySelector('#filter-select-period');
    const resetBtn = this.container.querySelector('#btn-reset-filters');

    // Debounced search
    let searchTimeout = null;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        State.setTransactionsFilter({ search: e.target.value });
      }, 250);
    });

    typeSelect.addEventListener('change', (e) => {
      State.setTransactionsFilter({ type: e.target.value });
    });

    catSelect.addEventListener('change', (e) => {
      State.setTransactionsFilter({ categoryId: e.target.value });
    });

    periodSelect.addEventListener('change', (e) => {
      State.setTransactionsFilter({ period: e.target.value });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        State.setTransactionsFilter({
          search: '',
          type: 'all',
          categoryId: 'all',
          period: 'all'
        });
      });
    }

    // Botão Adicionar Nova Transação
    const addTxBtn = this.container.querySelector('#btn-add-transaction');
    const emptyAddBtn = this.container.querySelector('#btn-empty-add-tx');

    const handleAdd = () => {
      Modal.openTransactionModal(null, (newTx) => {
        Storage.saveTransaction(newTx);
        Toast.success('Cadastrado!', 'Transação adicionada com sucesso.');
        State.notify('transaction_saved', newTx);
      });
    };

    if (addTxBtn) addTxBtn.addEventListener('click', handleAdd);
    if (emptyAddBtn) emptyAddBtn.addEventListener('click', handleAdd);

    // Edição e Exclusão (Desktop)
    this.container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
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

    this.container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const tx = Storage.getTransactionById(id);
        if (tx) {
          Modal.openConfirmModal({
            title: 'Excluir Movimentação',
            message: `Tem certeza que deseja excluir a movimentação <strong>"${Utils.escapeHtml(tx.description)}"</strong> no valor de <strong>${Utils.formatCurrency(tx.amount)}</strong>?`,
            confirmText: 'Sim, Excluir',
            cancelText: 'Cancelar',
            isDanger: true,
            onConfirm: () => {
              Storage.deleteTransaction(id);
              Toast.success('Excluído!', 'Transação removida com sucesso.');
              State.notify('transaction_deleted', id);
            }
          });
        }
      });
    });

    // Edição e Exclusão (Mobile)
    this.container.querySelectorAll('.action-btn-mobile-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
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

    this.container.querySelectorAll('.action-btn-mobile-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const tx = Storage.getTransactionById(id);
        if (tx) {
          Modal.openConfirmModal({
            title: 'Excluir Movimentação',
            message: `Deseja realmente remover esta movimentação?`,
            confirmText: 'Excluir',
            isDanger: true,
            onConfirm: () => {
              Storage.deleteTransaction(id);
              Toast.success('Excluído!', 'Transação removida com sucesso.');
              State.notify('transaction_deleted', id);
            }
          });
        }
      });
    });
  }
};
