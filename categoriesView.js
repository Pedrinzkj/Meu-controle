/**
 * MEU CONTROLE - CATEGORIES VIEW (Categorias)
 * Gestão completa de categorias de Receitas e Despesas, criação com ícones/cores,
 * edição e proteção contra exclusão sem reclassificação de transações.
 */

import { Utils } from '../utils.js';
import { Storage } from '../storage.js';
import { State } from '../state.js';
import { Modal } from '../components/modal.js';
import { Toast } from '../components/toast.js';

export const CategoriesView = {
  container: null,
  activeFilter: 'all', // 'all', 'expense', 'income'

  init(containerElement) {
    this.container = containerElement;
    this.render();

    State.subscribe((event) => {
      if (['category_saved', 'category_deleted', 'transaction_saved', 'transaction_deleted', 'balance_visibility_changed'].includes(event)) {
        if (State.currentView === 'categories') {
          this.render();
        }
      }
    });
  },

  render() {
    if (!this.container) return;

    const allCategories = Storage.getCategories();
    const transactions = Storage.getTransactions();
    const settings = Storage.getSettings();
    const privacyClass = settings.hideBalances ? 'privacy-blurred' : '';

    // Filtra as categorias conforme aba ativa
    let filteredCategories = [...allCategories];
    if (this.activeFilter === 'expense') {
      filteredCategories = filteredCategories.filter(c => c.type === 'expense');
    } else if (this.activeFilter === 'income') {
      filteredCategories = filteredCategories.filter(c => c.type === 'income');
    }

    // Calcula uso de cada categoria (qtd de transações e valor acumulado)
    const categoryStats = new Map();
    transactions.forEach(t => {
      const cur = categoryStats.get(t.categoryId) || { count: 0, total: 0 };
      categoryStats.set(t.categoryId, {
        count: cur.count + 1,
        total: cur.total + (Number(t.amount) || 0)
      });
    });

    this.container.innerHTML = `
      <!-- Barra Superior de Categorias -->
      <div class="categories-topbar">
        <div>
          <h2>Categorias Financeiras</h2>
          <p>Organize suas receitas e despesas por áreas de interesse.</p>
        </div>

        <div style="display: flex; align-items: center; gap: var(--spacing-3);">
          <!-- Abas de Tipo -->
          <div class="category-type-tabs">
            <button type="button" class="cat-tab-btn ${this.activeFilter === 'all' ? 'active' : ''}" data-type="all">Todas</button>
            <button type="button" class="cat-tab-btn ${this.activeFilter === 'expense' ? 'active' : ''}" data-type="expense">Despesas</button>
            <button type="button" class="cat-tab-btn ${this.activeFilter === 'income' ? 'active' : ''}" data-type="income">Receitas</button>
          </div>

          <!-- Botão Nova Categoria -->
          <button type="button" class="btn btn-primary" id="btn-add-category">
            ${Utils.icons.plus} Nova Categoria
          </button>
        </div>
      </div>

      <!-- Grade de Cards de Categorias -->
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

                <!-- Ações -->
                <div class="table-actions">
                  <button type="button" class="action-btn edit-btn btn-edit-category" data-id="${cat.id}" title="Editar Categoria">
                    ${Utils.icons.edit}
                  </button>
                  <button type="button" class="action-btn delete-btn btn-delete-category" data-id="${cat.id}" title="Excluir Categoria">
                    ${Utils.icons.trash}
                  </button>
                </div>
              </div>

              <!-- Rodapé do Card com Estatísticas de Uso -->
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

    // Eventos das abas de filtro
    this.container.querySelectorAll('.cat-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeFilter = btn.getAttribute('data-type');
        this.render();
      });
    });

    // Botão Adicionar Categoria
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

    // Edição de Categoria
    this.container.querySelectorAll('.btn-edit-category').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const cat = Storage.getCategoryById(id);
        if (cat) {
          Modal.openCategoryModal(cat, (updatedCat) => {
            Storage.updateCategory(updatedCat);
            Toast.success('Atualizada!', 'Categoria alterada com sucesso.');
            State.notify('category_saved', updatedCat);
          });
        }
      });
    });

    // Exclusão de Categoria com Reclassificação Obrigatória (Requisito Chave)
    this.container.querySelectorAll('.btn-delete-category').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const cat = Storage.getCategoryById(id);
        if (!cat) return;

        const count = Storage.countTransactionsByCategory(id);

        if (count > 0) {
          // A categoria está em uso! Oferece reclassificação obrigatória.
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
          // Nenhuma transação associada: confirmação simples
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
