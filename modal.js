/**
 * MEU CONTROLE - MODALS COMPONENT
 * Gerenciamento centralizado de janelas modais com validação, acessibilidade e confirmação.
 */

import { Utils } from '../utils.js';
import { Storage } from '../storage.js';

export const Modal = {
  backdrop: null,
  activeCloseHandler: null,

  init() {
    this.backdrop = document.getElementById('modal-backdrop');
    if (!this.backdrop) {
      this.backdrop = document.createElement('div');
      this.backdrop.id = 'modal-backdrop';
      this.backdrop.className = 'modal-backdrop';
      document.body.appendChild(this.backdrop);
    }

    // Fecha ao clicar fora ou apertar ESC
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) {
        this.close();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
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
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
  },

  close() {
    if (!this.backdrop) return;
    this.backdrop.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!this.isOpen()) {
        this.backdrop.innerHTML = '';
      }
    }, 200);
  },

  // =========================================================================
  // MODAL DE TRANSAÇÃO (Adicionar / Editar)
  // =========================================================================

  openTransactionModal(transaction = null, onSave) {
    const isEdit = Boolean(transaction && transaction.id);
    const initialType = transaction ? transaction.type : 'expense';
    const categories = Storage.getCategories();

    const renderCategoryOptions = (currentType, selectedCatId) => {
      const filtered = categories.filter(c => c.type === currentType);
      return filtered.map(c => `
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
          <!-- Tipo: Receita ou Despesa -->
          <div class="form-group">
            <label class="form-label">Tipo de Movimentação</label>
            <div class="segmented-control">
              <div class="segmented-option type-expense">
                <input type="radio" id="tx-type-expense" name="txType" value="expense" ${initialType === 'expense' ? 'checked' : ''}>
                <label for="tx-type-expense">
                  ${Utils.icons.trendingDown} Despesa
                </label>
              </div>
              <div class="segmented-option type-income">
                <input type="radio" id="tx-type-income" name="txType" value="income" ${initialType === 'income' ? 'checked' : ''}>
                <label for="tx-type-income">
                  ${Utils.icons.trendingUp} Receita
                </label>
              </div>
            </div>
          </div>

          <!-- Descrição -->
          <div class="form-group" id="group-tx-desc">
            <label class="form-label" for="tx-desc">
              <span>Descrição <span class="required">*</span></span>
            </label>
            <input type="text" id="tx-desc" name="description" placeholder="Ex: Supermercado, Salário, Internet..." value="${Utils.escapeHtml(initialDesc)}" required autocomplete="off">
            <span class="form-error">Por favor, preencha a descrição.</span>
          </div>

          <!-- Valor e Data (Linha dupla) -->
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

          <!-- Categoria -->
          <div class="form-group" id="group-tx-cat">
            <label class="form-label" for="tx-category">
              <span>Categoria <span class="required">*</span></span>
            </label>
            <select id="tx-category" name="categoryId" required>
              ${renderCategoryOptions(initialType, initialCatId)}
            </select>
            <span class="form-error">Selecione uma categoria.</span>
          </div>

          <!-- Observação (Opcional) -->
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
    const cancelBtn = form.querySelector('.modal-cancel-btn');

    cancelBtn.addEventListener('click', () => this.close());

    // Ao mudar o tipo (Receita / Despesa), atualiza dinamicamente as categorias disponíveis
    typeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const selectedType = e.target.value;
        catSelect.innerHTML = renderCategoryOptions(selectedType, null);
      });
    });

    // Submissão do formulário
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let hasError = false;
      const descInput = document.getElementById('tx-desc');
      const amountInput = document.getElementById('tx-amount');
      const dateInput = document.getElementById('tx-date');
      const selectedType = form.querySelector('input[name="txType"]:checked').value;
      const categoryId = catSelect.value;
      const notes = document.getElementById('tx-notes').value;

      // Validação
      if (!descInput.value.trim()) {
        document.getElementById('group-tx-desc').classList.add('has-error');
        hasError = true;
      } else {
        document.getElementById('group-tx-desc').classList.remove('has-error');
      }

      const amountVal = parseFloat(amountInput.value);
      if (isNaN(amountVal) || amountVal <= 0) {
        document.getElementById('group-tx-amount').classList.add('has-error');
        hasError = true;
      } else {
        document.getElementById('group-tx-amount').classList.remove('has-error');
      }

      if (!dateInput.value) {
        document.getElementById('group-tx-date').classList.add('has-error');
        hasError = true;
      } else {
        document.getElementById('group-tx-date').classList.remove('has-error');
      }

      if (!categoryId) {
        document.getElementById('group-tx-cat').classList.add('has-error');
        hasError = true;
      } else {
        document.getElementById('group-tx-cat').classList.remove('has-error');
      }

      if (hasError) return;

      const payload = {
        id: isEdit ? transaction.id : Utils.generateId(),
        description: descInput.value.trim(),
        amount: amountVal,
        type: selectedType,
        categoryId: categoryId,
        date: dateInput.value,
        notes: notes.trim()
      };

      this.close();
      if (onSave) onSave(payload, isEdit);
    });
  },

  // =========================================================================
  // MODAL DE CATEGORIA (Adicionar / Editar)
  // =========================================================================

  openCategoryModal(category = null, onSave) {
    const isEdit = Boolean(category && category.id);
    const initialName = category ? category.name : '';
    const initialType = category ? category.type : 'expense';
    const initialIcon = category ? category.icon : '🏷️';
    const initialColor = category ? category.color : '#3b82f6';

    const iconsList = [
      '🍔', '🍕', '☕', '🛒', '🚗', '🚌', '✈️', '🏠',
      '💊', '🏥', '🎓', '📚', '🎮', '🎬', '🛍️', '🎁',
      '📄', '💡', '🔧', '📦', '💼', '💻', '📈', '💵',
      '🪙', '💎', '🏋️', '👶', '🐕', '⚡', '🏖️', '❤️'
    ];

    const colorsList = [
      '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
      '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b'
    ];

    const modalHtml = `
      <div class="modal-header">
        <h3 class="modal-title">${isEdit ? 'Editar Categoria' : 'Nova Categoria'}</h3>
        <button class="modal-close-btn" type="button" title="Fechar">${Utils.icons.close}</button>
      </div>
      <form id="form-category">
        <div class="modal-body">
          <!-- Tipo -->
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

          <!-- Nome -->
          <div class="form-group" id="group-cat-name">
            <label class="form-label" for="cat-name">
              <span>Nome da Categoria <span class="required">*</span></span>
            </label>
            <input type="text" id="cat-name" placeholder="Ex: Farmácia, Combustível, Bônus..." value="${Utils.escapeHtml(initialName)}" required autocomplete="off">
            <span class="form-error">Por favor, informe o nome da categoria.</span>
          </div>

          <!-- Escolha de Ícone -->
          <div class="form-group">
            <label class="form-label">Escolha um Ícone</label>
            <div class="icon-picker-grid" id="cat-icon-picker">
              ${iconsList.map(ic => `
                <div class="icon-picker-item ${ic === initialIcon ? 'selected' : ''}" data-icon="${ic}">${ic}</div>
              `).join('')}
            </div>
            <input type="hidden" id="cat-icon-val" value="${initialIcon}">
          </div>

          <!-- Escolha de Cor -->
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
    const cancelBtn = form.querySelector('.modal-cancel-btn');
    cancelBtn.addEventListener('click', () => this.close());

    // Seletor de Ícone
    const iconItems = form.querySelectorAll('.icon-picker-item');
    const iconHidden = document.getElementById('cat-icon-val');
    iconItems.forEach(item => {
      item.addEventListener('click', () => {
        iconItems.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        iconHidden.value = item.getAttribute('data-icon');
      });
    });

    // Seletor de Cor
    const colorItems = form.querySelectorAll('.color-dot-choice');
    const colorHidden = document.getElementById('cat-color-val');
    colorItems.forEach(item => {
      item.addEventListener('click', () => {
        colorItems.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        colorHidden.value = item.getAttribute('data-color');
      });
    });

    // Submissão
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('cat-name');
      if (!nameInput.value.trim()) {
        document.getElementById('group-cat-name').classList.add('has-error');
        return;
      }

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

  // =========================================================================
  // MODAL DE CONFIRMAÇÃO GENÉRICO
  // =========================================================================

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

    const cancelBtn = this.backdrop.querySelector('.modal-cancel-btn');
    const confirmBtn = document.getElementById('modal-btn-confirm');

    cancelBtn.addEventListener('click', () => this.close());
    confirmBtn.addEventListener('click', () => {
      this.close();
      if (onConfirm) onConfirm();
    });
  },

  // =========================================================================
  // MODAL DE EXCLUSÃO COM RECLASSIFICAÇÃO DE CATEGORIA (Requisito da Seção 6)
  // "Não permita excluir uma categoria que esteja sendo utilizada sem antes
  // oferecer uma forma de reclassificar suas transações."
  // =========================================================================

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
              Para não perder o histórico das suas movimentações, escolha para qual categoria você deseja transferi-las antes de excluir:
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

    const cancelBtn = this.backdrop.querySelector('.modal-cancel-btn');
    const confirmBtn = document.getElementById('btn-reclassify-confirm');
    const targetSelect = document.getElementById('reclassify-target-select');

    cancelBtn.addEventListener('click', () => this.close());
    confirmBtn.addEventListener('click', () => {
      const targetId = targetSelect.value;
      this.close();
      if (onConfirm) onConfirm(targetId);
    });
  },

  // =========================================================================
  // MODAIS DE CAIXINHAS (Criar, Editar, Depositar, Resgatar, Histórico)
  // =========================================================================

  openCaixinhaModal(caixinha = null, onSave) {
    const isEdit = Boolean(caixinha && caixinha.id);
    const initialName = caixinha ? caixinha.name : '';
    const initialDesc = caixinha ? caixinha.description : '';
    const initialTarget = caixinha ? caixinha.targetAmount : '';
    const initialDeadline = caixinha ? (caixinha.deadline || '') : '';
    const initialIcon = caixinha ? caixinha.icon : '🎯';
    const initialColor = caixinha ? caixinha.color : '#10b981';

    const suggestions = [
      'Reserva de emergência',
      'Viagem',
      'Comprar celular',
      'Comprar computador',
      'Comprar carro',
      'Estudos',
      'Objetivos pessoais'
    ];

    const iconsList = [
      '🎯', '🛡️', '✈️', '🚗', '💻', '📱', '🏠', '🎓',
      '🏖️', '💰', '💎', '🪙', '🎁', '👶', '🐕', '🏋️',
      '📚', '🛵', '🎮', '🚲', '🎸', '⌚', '💍', '🚀'
    ];

    const colorsList = [
      '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
      '#ef4444', '#06b6d4', '#14b8a6', '#6366f1', '#64748b'
    ];

    const modalHtml = `
      <div class="modal-header">
        <h3 class="modal-title">${isEdit ? 'Editar Caixinha' : 'Nova Caixinha de Metas'}</h3>
        <button class="modal-close-btn" type="button" title="Fechar">${Utils.icons.close}</button>
      </div>
      <form id="form-caixinha">
        <div class="modal-body">
          <!-- Sugestões de nomes -->
          <div class="form-group">
            <label class="form-label">Sugestões de Objetivos</label>
            <div class="suggestion-chips" id="caixinha-suggestions">
              ${suggestions.map(s => `
                <button type="button" class="suggestion-chip" data-name="${s}">${s}</button>
              `).join('')}
            </div>
          </div>

          <!-- Nome da Caixinha -->
          <div class="form-group" id="group-cax-name">
            <label class="form-label" for="cax-name">
              <span>Nome do Objetivo <span class="required">*</span></span>
            </label>
            <input type="text" id="cax-name" placeholder="Ex: Viagem de Férias, Reserva de Emergência..." value="${Utils.escapeHtml(initialName)}" required autocomplete="off">
            <span class="form-error">Por favor, informe o nome da caixinha.</span>
          </div>

          <!-- Descrição Opcional -->
          <div class="form-group">
            <label class="form-label" for="cax-desc">Descrição / Motivação (Opcional)</label>
            <textarea id="cax-desc" rows="2" placeholder="Ex: Guardar 6 meses de gastos essenciais">${Utils.escapeHtml(initialDesc)}</textarea>
          </div>

          <!-- Valor da Meta e Valor Inicial -->
          <div class="form-row">
            <div class="form-group" id="group-cax-target">
              <label class="form-label" for="cax-target">
                <span>Valor da Meta (R$) <span class="required">*</span></span>
              </label>
              <div class="input-with-prefix">
                <span class="input-prefix">R$</span>
                <input type="number" id="cax-target" step="0.01" min="0.01" placeholder="5000,00" value="${initialTarget}" required>
              </div>
              <span class="form-error">Informe uma meta maior que zero.</span>
            </div>

            ${!isEdit ? `
              <div class="form-group" id="group-cax-initial">
                <label class="form-label" for="cax-initial">
                  <span>Valor Inicial (Opcional)</span>
                </label>
                <div class="input-with-prefix">
                  <span class="input-prefix">R$</span>
                  <input type="number" id="cax-initial" step="0.01" min="0" placeholder="0,00">
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Prazo / Data Limite -->
          <div class="form-group">
            <label class="form-label" for="cax-deadline">Data Limite / Prazo (Opcional)</label>
            <input type="date" id="cax-deadline" value="${initialDeadline}">
          </div>

          <!-- Escolha de Ícone -->
          <div class="form-group">
            <label class="form-label">Escolha um Ícone</label>
            <div class="icon-picker-grid" id="cax-icon-picker">
              ${iconsList.map(ic => `
                <div class="icon-picker-item ${ic === initialIcon ? 'selected' : ''}" data-icon="${ic}">${ic}</div>
              `).join('')}
            </div>
            <input type="hidden" id="cax-icon-val" value="${initialIcon}">
          </div>

          <!-- Escolha de Cor -->
          <div class="form-group">
            <label class="form-label">Escolha uma Cor</label>
            <div class="color-picker-palette" id="cax-color-picker">
              ${colorsList.map(c => `
                <div class="color-dot-choice ${c.toLowerCase() === initialColor.toLowerCase() ? 'selected' : ''}" style="background-color: ${c};" data-color="${c}"></div>
              `).join('')}
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

    // Sugestão de chips
    const nameInput = document.getElementById('cax-name');
    form.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        nameInput.value = chip.getAttribute('data-name');
        nameInput.focus();
      });
    });

    // Seletor de Ícone
    const iconItems = form.querySelectorAll('.icon-picker-item');
    const iconHidden = document.getElementById('cax-icon-val');
    iconItems.forEach(item => {
      item.addEventListener('click', () => {
        iconItems.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        iconHidden.value = item.getAttribute('data-icon');
      });
    });

    // Seletor de Cor
    const colorItems = form.querySelectorAll('.color-dot-choice');
    const colorHidden = document.getElementById('cax-color-val');
    colorItems.forEach(item => {
      item.addEventListener('click', () => {
        colorItems.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        colorHidden.value = item.getAttribute('data-color');
      });
    });

    // Submissão
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
                Saldo guardado nesta caixinha: <strong>${Utils.formatCurrency(caixinha.currentAmount)}</strong>
              </div>
            </div>
          </div>

          <div class="caixinha-balance-available-pill">
            <span>Saldo Disponível na Conta:</span>
            <strong class="text-success">${Utils.formatCurrency(availableBalance)}</strong>
          </div>

          <div class="form-group" id="group-dep-amount">
            <label class="form-label" for="dep-amount">
              <span>Valor que deseja guardar (R$) <span class="required">*</span></span>
            </label>
            <div class="input-with-prefix">
              <span class="input-prefix">R$</span>
              <input type="number" id="dep-amount" step="0.01" min="0.01" max="${Math.max(0, availableBalance)}" placeholder="0,00" required autofocus>
            </div>
            <span class="form-error">O valor deve ser maior que zero e menor ou igual ao saldo disponível.</span>
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
      withdrawAllBtn.addEventListener('click', () => {
        amountInput.value = maxWithdraw.toFixed(2);
      });
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
            Todas as Movimentações da Caixinha (${history.length})
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
                      <div class="history-type-icon ${isDeposit ? 'deposit' : 'withdraw'}">
                        ${isDeposit ? '➕' : '➖'}
                      </div>
                      <div>
                        <div style="font-weight: 600; font-size: var(--font-size-sm); color: var(--text-primary);">
                          ${Utils.escapeHtml(item.description || (isDeposit ? 'Depósito' : 'Resgate'))}
                        </div>
                        <div style="font-size: var(--font-size-xs); color: var(--text-muted);">
                          ${Utils.formatDate(item.date)}
                        </div>
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
