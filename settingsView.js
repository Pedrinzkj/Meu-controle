/**
 * MEU CONTROLE - SETTINGS VIEW (Configurações)
 * Modo claro/escuro, personalização do usuário, exportação em CSV/JSON,
 * importação, carregamento de dados de demonstração e limpeza de dados.
 */

import { Utils } from '../utils.js';
import { Storage } from '../storage.js';
import { State } from '../state.js';
import { Modal } from '../components/modal.js';
import { Toast } from '../components/toast.js';

export const SettingsView = {
  container: null,

  init(containerElement) {
    this.container = containerElement;
    this.render();

    State.subscribe((event) => {
      if (['theme_changed', 'balance_visibility_changed'].includes(event)) {
        if (State.currentView === 'settings') {
          this.render();
        }
      }
    });
  },

  render() {
    if (!this.container) return;

    const settings = Storage.getSettings();
    const transactions = Storage.getTransactions();
    const categories = Storage.getCategories();
    const currentTheme = document.documentElement.getAttribute('data-theme') || settings.theme || 'light';

    // Estimativa de espaço usado no localStorage
    let storageBytes = 0;
    try {
      storageBytes = (
        (localStorage.getItem('meu_controle_transactions') || '').length +
        (localStorage.getItem('meu_controle_categories') || '').length +
        (localStorage.getItem('meu_controle_settings') || '').length
      ) * 2; // UTF-16
    } catch (e) {}
    const storageKb = (storageBytes / 1024).toFixed(2);

    this.container.innerHTML = `
      <div class="dashboard-header-bar">
        <div>
          <h2>Configurações do Sistema</h2>
          <p>Personalize a sua experiência e gerencie os seus dados financeiros.</p>
        </div>
      </div>

      <div class="settings-container">
        <!-- 1. APARÊNCIA E TEMA -->
        <div class="settings-section-card">
          <div class="settings-section-header">
            <div class="settings-section-icon">
              ${Utils.icons.sun}
            </div>
            <div>
              <h3 class="settings-section-title">Aparência da Interface</h3>
              <p class="settings-section-desc">Alterne entre os modos Claro e Escuro conforme sua preferência visual.</p>
            </div>
          </div>

          <div class="theme-selector-grid">
            <div class="theme-choice-card ${currentTheme === 'light' ? 'selected' : ''}" data-theme="light">
              <div class="theme-choice-preview light-preview">
                ${Utils.icons.sun}
              </div>
              <div>
                <strong style="color: var(--text-primary); font-size: var(--font-size-base);">Modo Claro</strong>
                <p style="font-size: var(--font-size-xs); color: var(--text-muted);">Visual limpo com fundo suave e alto contraste.</p>
              </div>
            </div>

            <div class="theme-choice-card ${currentTheme === 'dark' ? 'selected' : ''}" data-theme="dark">
              <div class="theme-choice-preview dark-preview">
                ${Utils.icons.moon}
              </div>
              <div>
                <strong style="color: var(--text-primary); font-size: var(--font-size-base);">Modo Escuro</strong>
                <p style="font-size: var(--font-size-xs); color: var(--text-muted);">Descanso visual para ambientes com pouca luz.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. PREFERÊNCIAS DO USUÁRIO -->
        <div class="settings-section-card">
          <div class="settings-section-header">
            <div class="settings-section-icon">
              ${Utils.icons.settings}
            </div>
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

        <!-- 3. GERENCIAMENTO DE DADOS (Exportar, Backup, Restaurar Demo) -->
        <div class="settings-section-card">
          <div class="settings-section-header">
            <div class="settings-section-icon">
              ${Utils.icons.download}
            </div>
            <div>
              <h3 class="settings-section-title">Gerenciamento e Backup de Dados</h3>
              <p class="settings-section-desc">Exporte suas movimentações para planilha ou faça backup completo.</p>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--spacing-4);">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--spacing-3); padding-bottom: var(--spacing-4); border-bottom: 1px solid var(--border-color-subtle);">
              <div>
                <strong style="color: var(--text-primary); font-size: var(--font-size-sm);">Exportar Planilha (CSV)</strong>
                <p style="font-size: var(--font-size-xs); color: var(--text-muted);">Compatível com Excel, Google Planilhas e LibreOffice (formato brasileiro com separador ponto e vírgula).</p>
              </div>
              <button type="button" class="btn btn-outline btn-sm" id="btn-settings-export-csv">
                ${Utils.icons.download} Baixar CSV
              </button>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--spacing-3); padding-bottom: var(--spacing-4); border-bottom: 1px solid var(--border-color-subtle);">
              <div>
                <strong style="color: var(--text-primary); font-size: var(--font-size-sm);">Fazer Backup Completo (JSON)</strong>
                <p style="font-size: var(--font-size-xs); color: var(--text-muted);">Gera um arquivo com todas as suas transações, categorias e configurações para segurança.</p>
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

        <!-- 4. ZONA DE PERIGO (Limpar Dados com Confirmação) -->
        <div class="settings-section-card danger-zone">
          <div class="settings-section-header">
            <div class="settings-section-icon">
              ${Utils.icons.trash}
            </div>
            <div>
              <h3 class="settings-section-title" style="color: var(--color-expense);">Zona de Perigo</h3>
              <p class="settings-section-desc">Exclua todas as informações armazenadas localmente de forma definitiva.</p>
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--spacing-3);">
            <div>
              <strong style="color: var(--color-expense); font-size: var(--font-size-sm);">Limpar Todos os Dados</strong>
              <p style="font-size: var(--font-size-xs); color: var(--text-muted);">Esta ação removerá todas as transações e categorias criadas. Esta operação não pode ser desfeita.</p>
            </div>
            <button type="button" class="btn btn-danger btn-sm" id="btn-settings-clear-all">
              ${Utils.icons.trash} Limpar Todos os Dados
            </button>
          </div>
        </div>

        <!-- 5. INFORMAÇÕES DO SISTEMA (TCC) -->
        <div class="settings-section-card">
          <div class="settings-section-header">
            <div class="settings-section-icon" style="background-color: var(--bg-surface-secondary); color: var(--text-secondary);">
              ℹ️
            </div>
            <div>
              <h3 class="settings-section-title">Sobre o Meu Controle</h3>
              <p class="settings-section-desc">Informações do projeto de Trabalho de Conclusão de Curso (TCC).</p>
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

    // Eventos do seletor de tema
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

    // Evento de salvar preferências do usuário
    const prefsForm = this.container.querySelector('#form-user-prefs');
    if (prefsForm) {
      prefsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = this.container.querySelector('#settings-username').value.trim() || 'Usuário';
        const hideBal = this.container.querySelector('#settings-hide-balances').checked;

        Storage.saveSettings({
          userName: username,
          hideBalances: hideBal
        });

        // Atualiza saudação no header
        const userDisplay = document.querySelector('.user-name');
        if (userDisplay) userDisplay.textContent = username;

        Toast.success('Sucesso!', 'Preferências salvas com sucesso.');
        State.notify('balance_visibility_changed', hideBal);
      });
    }

    // Exportar CSV
    const exportCsvBtn = this.container.querySelector('#btn-settings-export-csv');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        Storage.exportToCsv();
        Toast.success('Exportado!', 'Planilha CSV gerada com sucesso.');
      });
    }

    // Exportar JSON
    const exportJsonBtn = this.container.querySelector('#btn-settings-export-json');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => {
        Storage.exportToJson();
        Toast.success('Backup Realizado!', 'Arquivo JSON salvo com sucesso.');
      });
    }

    // Importar JSON
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

    // Restaurar Demonstração
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

    // Limpar Todos os Dados (Zona de Perigo com Confirmação Reforçada)
    const clearAllBtn = this.container.querySelector('#btn-settings-clear-all');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        Modal.openConfirmModal({
          title: 'Limpar Todos os Dados?',
          message: 'ATENÇÃO: Todas as suas movimentações financeiras serão permanentemente apagadas do navegador. Esta operação NÃO poderá ser desfeita!',
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
  }
};
