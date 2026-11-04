/**
 * MEU CONTROLE - CAIXINHAS VIEW (Metas Financeiras e Poupança Reservada)
 * Gestão de caixinhas para objetivos, aportes (guardar), resgates (retirar),
 * histórico individual e integração total com o saldo disponível e patrimônio.
 */

import { Utils } from '../utils.js';
import { Storage } from '../storage.js';
import { State } from '../state.js';
import { Modal } from '../components/modal.js';
import { Toast } from '../components/toast.js';

export const CaixinhasView = {
  container: null,

  init(containerElement) {
    this.container = containerElement;
    this.render();

    State.subscribe((event) => {
      if (['caixinhas_updated', 'transaction_saved', 'transaction_deleted', 'balance_visibility_changed', 'theme_changed'].includes(event)) {
        if (State.currentView === 'caixinhas') {
          this.render();
        }
      }
    });
  },

  render() {
    if (!this.container) return;

    const caixinhas = Storage.getCaixinhas();
    const allTransactions = Storage.getTransactions();
    const settings = Storage.getSettings();
    const privacyClass = settings.hideBalances ? 'privacy-blurred' : '';

    // Calcula saldo disponível atual da conta principal
    const metrics = State.calculateMetrics(allTransactions);
    const availableBalance = metrics.balance;

    // Métricas do Dashboard de Caixinhas
    const totalGuardado = Storage.getTotalInCaixinhas();
    const totalCaixinhas = caixinhas.length;
    const metasAtingidas = caixinhas.filter(c => (Number(c.currentAmount) || 0) >= (Number(c.targetAmount) || 1)).length;
    const totalFaltaGuardar = caixinhas.reduce((sum, c) => {
      const diff = (Number(c.targetAmount) || 0) - (Number(c.currentAmount) || 0);
      return sum + Math.max(0, diff);
    }, 0);

    this.container.innerHTML = `
      <!-- Cabeçalho do Módulo de Caixinhas -->
      <div class="dashboard-header-bar">
        <div>
          <h2>Caixinhas & Metas Financeiras</h2>
          <p>Separe seu dinheiro por objetivos específicos e acompanhe a evolução de cada conquista.</p>
        </div>

        <button type="button" class="btn btn-primary" id="btn-add-caixinha">
          ${Utils.icons.plus} Nova Caixinha
        </button>
      </div>

      <!-- 4 Cards Superiores de Resumo das Caixinhas -->
      <div class="dashboard-metrics-grid" style="margin-bottom: var(--spacing-6);">
        <!-- 1. Total Guardado -->
        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-label">Total Guardado em Caixinhas</span>
            <div class="metric-icon-wrap savings">
              ${Utils.icons.piggyBank}
            </div>
          </div>
          <div class="metric-value text-primary ${privacyClass}">
            ${Utils.formatCurrency(totalGuardado)}
          </div>
          <div class="metric-subtext">
            <span>Dinheiro reservado para metas</span>
          </div>
        </div>

        <!-- 2. Caixinhas Criadas -->
        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-label">Caixinhas Criadas</span>
            <div class="metric-icon-wrap balance">
              ${Utils.icons.target}
            </div>
          </div>
          <div class="metric-value text-primary">
            ${totalCaixinhas} ${totalCaixinhas === 1 ? 'objetivo' : 'objetivos'}
          </div>
          <div class="metric-subtext">
            <span>Projetos em andamento</span>
          </div>
        </div>

        <!-- 3. Metas Atingidas -->
        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-label">Metas Atingidas (100%)</span>
            <div class="metric-icon-wrap income">
              ${Utils.icons.check}
            </div>
          </div>
          <div class="metric-value text-success">
            ${metasAtingidas} / ${totalCaixinhas}
          </div>
          <div class="metric-subtext">
            <span>${metasAtingidas > 0 ? 'Parabéns pelos objetivos alcançados!' : 'Continue guardando para atingir sua meta'}</span>
          </div>
        </div>

        <!-- 4. Total que Falta Guardar -->
        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-label">Falta para Atingir Metas</span>
            <div class="metric-icon-wrap expense">
              ${Utils.icons.trendingUp}
            </div>
          </div>
          <div class="metric-value text-secondary ${privacyClass}">
            ${Utils.formatCurrency(totalFaltaGuardar)}
          </div>
          <div class="metric-subtext">
            <span>Para concluir todos os objetivos</span>
          </div>
        </div>
      </div>

      <!-- Barra de Resumo de Integração com o Saldo Disponível -->
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
          Patrimônio Total: <strong class="text-primary ${privacyClass}">${Utils.formatCurrency(metrics.totalWealth)}</strong>
        </div>
      </div>

      <!-- Grade de Cards Individuais de Caixinhas -->
      ${caixinhas.length === 0 ? `
        <div class="card empty-state" style="margin-top: var(--spacing-6);">
          <div class="empty-state-icon">${Utils.icons.piggyBank}</div>
          <h4 class="empty-state-title">Nenhuma caixinha criada ainda</h4>
          <p class="empty-state-text">
            Crie sua primeira caixinha para separar dinheiro da sua conta principal para viagens, reservas de emergência, compras ou estudos.
          </p>
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
                    <div class="caixinha-icon-bubble" style="background-color: ${c.color}20; color: ${c.color};">
                      ${c.icon}
                    </div>
                    <div>
                      <h3 class="caixinha-name">${Utils.escapeHtml(c.name)}</h3>
                      ${c.description ? `
                        <div class="caixinha-desc">${Utils.escapeHtml(c.description)}</div>
                      ` : ''}
                    </div>
                  </div>

                  <!-- Ações (Editar e Excluir) -->
                  <div class="table-actions">
                    <button type="button" class="action-btn edit-btn btn-edit-caixinha" data-id="${c.id}" title="Editar Caixinha">
                      ${Utils.icons.edit}
                    </button>
                    <button type="button" class="action-btn delete-btn btn-delete-caixinha" data-id="${c.id}" title="Excluir Caixinha">
                      ${Utils.icons.trash}
                    </button>
                  </div>
                </div>

                <!-- Valores e Progresso -->
                <div class="caixinha-values-row">
                  <div>
                    <span class="caixinha-val-label">Guardado</span>
                    <div class="caixinha-val-amount ${privacyClass}" style="color: ${c.color};">
                      ${Utils.formatCurrency(current)}
                    </div>
                  </div>

                  <div style="text-align: right;">
                    <span class="caixinha-val-label">Meta</span>
                    <div class="caixinha-val-target ${privacyClass}">
                      ${Utils.formatCurrency(target)}
                    </div>
                  </div>
                </div>

                <!-- Barra de Progresso com Percentual -->
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

                <!-- Prazo (se definido) -->
                <div class="caixinha-deadline-badge">
                  <span>📅 Prazo:</span>
                  <strong>${c.deadline ? Utils.formatDate(c.deadline) : 'Sem data limite'}</strong>
                </div>

                <!-- Botões de Ação na Caixinha -->
                <div class="caixinha-actions-footer">
                  <button type="button" class="btn btn-sm btn-primary btn-deposit-caixinha" data-id="${c.id}">
                    ${Utils.icons.plus} Guardar
                  </button>

                  <button type="button" class="btn btn-sm btn-outline btn-withdraw-caixinha" data-id="${c.id}" ${current <= 0 ? 'disabled' : ''}>
                    ${Utils.icons.trendingDown} Retirar
                  </button>

                  <button type="button" class="btn btn-sm btn-secondary btn-history-caixinha" data-id="${c.id}" title="Ver Histórico">
                    Histórico
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;

    // Evento de Criar Nova Caixinha
    const handleAddCaixinha = () => {
      Modal.openCaixinhaModal(null, (newCax) => {
        // Se informou valor inicial, verifica se há saldo disponível
        if (newCax.initialAmount > 0) {
          if (newCax.initialAmount > availableBalance) {
            Toast.error('Saldo Insuficiente', `Você não possui ${Utils.formatCurrency(newCax.initialAmount)} de saldo disponível para o depósito inicial.`);
            return;
          }
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

    // Eventos de cada card
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

    // Exclusão com Devolução de Saldo
    this.container.querySelectorAll('.btn-delete-caixinha').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const cax = Storage.getCaixinhaById(id);
        if (!cax) return;

        const currentVal = Number(cax.currentAmount) || 0;

        if (currentVal > 0) {
          Modal.openConfirmModal({
            title: 'Excluir Caixinha com Dinheiro?',
            message: `Esta caixinha possui <strong>${Utils.formatCurrency(currentVal)}</strong> guardados.<br><br>Ao excluí-la, o valor total de <strong>${Utils.formatCurrency(currentVal)}</strong> retornará automaticamente ao seu <strong>saldo disponível</strong> na conta principal.<br><br>Deseja confirmar a exclusão?`,
            confirmText: 'Sim, Devolver Dinheiro e Excluir',
            isDanger: true,
            onConfirm: () => {
              Storage.deleteCaixinha(id, true);
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
              Storage.deleteCaixinha(id, false);
              Toast.success('Excluída', 'Caixinha removida com sucesso.');
              State.notify('caixinhas_updated');
            }
          });
        }
      });
    });

    // Guardar Dinheiro
    this.container.querySelectorAll('.btn-deposit-caixinha').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const cax = Storage.getCaixinhaById(id);
        if (!cax) return;

        // Recalcula saldo disponível atual
        const curMetrics = State.calculateMetrics(Storage.getTransactions());
        const curAvail = curMetrics.balance;

        if (curAvail <= 0) {
          Toast.error('Saldo Indisponível', 'Você não possui saldo disponível na conta principal para guardar no momento.');
          return;
        }

        Modal.openDepositCaixinhaModal(cax, curAvail, (amount, date, description) => {
          try {
            Storage.addFundsToCaixinha(id, amount, date, description);
            Toast.success('Depósito Realizado!', `${Utils.formatCurrency(amount)} guardado com sucesso na caixinha "${cax.name}".`);
            State.notify('caixinhas_updated');
          } catch (err) {
            Toast.error('Erro no Depósito', err.message);
          }
        });
      });
    });

    // Retirar Dinheiro
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
            Toast.success('Resgate Realizado!', `${Utils.formatCurrency(amount)} devolvido ao saldo disponível da conta.`);
            State.notify('caixinhas_updated');
          } catch (err) {
            Toast.error('Erro no Resgate', err.message);
          }
        });
      });
    });

    // Ver Histórico
    this.container.querySelectorAll('.btn-history-caixinha').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const cax = Storage.getCaixinhaById(id);
        if (cax) {
          Modal.openCaixinhaHistoryModal(cax);
        }
      });
    });
  }
};
