/**
 * MEU CONTROLE - MAIN APPLICATION ORCHESTRATOR
 * Inicialização, roteamento SPA sem recarregar a página, sidebar responsiva,
 * botões de cabeçalho e sincronização de eventos.
 */

import { Utils } from './utils.js';
import { Storage } from './storage.js';
import { State } from './state.js';
import { Modal } from './components/modal.js';
import { Toast } from './components/toast.js';

// Importa as 5 Views
import { DashboardView } from './views/dashboardView.js';
import { TransactionsView } from './views/transactionsView.js';
import { ReportsView } from './views/reportsView.js';
import { CategoriesView } from './views/categoriesView.js';
import { SettingsView } from './views/settingsView.js';

const App = {
  views: {},

  init() {
    console.log('Inicializando Meu Controle - Finanças Pessoais...');

    // 1. Inicializa o armazenamento local
    Storage.init();

    // 2. Aplica tema e configurações salvas
    const settings = Storage.getSettings();
    document.documentElement.setAttribute('data-theme', settings.theme || 'light');

    // 3. Inicializa componentes globais (Modal e Toast)
    Modal.init();
    Toast.init();

    // 4. Registra e inicializa as Views
    this.views = {
      dashboard: DashboardView,
      transactions: TransactionsView,
      reports: ReportsView,
      categories: CategoriesView,
      settings: SettingsView
    };

    DashboardView.init(document.getElementById('view-dashboard'));
    TransactionsView.init(document.getElementById('view-transactions'));
    ReportsView.init(document.getElementById('view-reports'));
    CategoriesView.init(document.getElementById('view-categories'));
    SettingsView.init(document.getElementById('view-settings'));

    // 5. Configura navegação e eventos de interface
    this.bindEvents();

    // 6. Atualiza contadores dos badges na barra lateral
    this.updateSidebarBadges();

    // 7. Define a view inicial (Dashboard)
    this.navigateTo('dashboard');

    // Ouve alterações no estado para atualizar contadores e re-renderizar a view ativa
    State.subscribe((event, payload) => {
      if (['transaction_saved', 'transaction_deleted', 'category_saved', 'category_deleted'].includes(event)) {
        this.updateSidebarBadges();
        // Garante atualização visual imediata sem necessidade de F5
        if (this.views[State.currentView] && typeof this.views[State.currentView].render === 'function') {
          this.views[State.currentView].render();
        }
      }
    });

    console.log('Meu Controle carregado com sucesso!');
  },

  /**
   * Vincula ouvintes de eventos da barra lateral, cabeçalho e botões globais
   */
  bindEvents() {
    const sidebar = document.querySelector('.app-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const sidebarCloseBtn = document.querySelector('.sidebar-close-btn');

    // Controle do menu hambúrguer no mobile
    const toggleSidebar = () => {
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

    // Clique no Logo "Meu Controle" (volta para Visão Geral)
    const brandLink = document.querySelector('.brand-link');
    if (brandLink) {
      brandLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo('dashboard');
        closeSidebar();
      });
    }

    // Links de navegação da Sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = item.getAttribute('data-view');
        if (targetView) {
          this.navigateTo(targetView);
          closeSidebar();
        }
      });
    });

    // Botão Rápido "+ Nova Movimentação" no Topbar
    const quickAddBtn = document.getElementById('header-btn-quick-add');
    if (quickAddBtn) {
      quickAddBtn.addEventListener('click', () => {
        Modal.openTransactionModal(null, (newTx) => {
          Storage.saveTransaction(newTx);
          Toast.success('Movimentação Registrada!', 'Transação adicionada com sucesso.');
          State.notify('transaction_saved', newTx);
        });
      });
    }

    // Botão de Privacidade de Valores (Olhinho)
    const privacyBtn = document.getElementById('header-btn-toggle-privacy');
    if (privacyBtn) {
      this.updatePrivacyIcon(privacyBtn);
      privacyBtn.addEventListener('click', () => {
        const curSettings = Storage.getSettings();
        const newHide = !curSettings.hideBalances;
        Storage.saveSettings({ hideBalances: newHide });
        this.updatePrivacyIcon(privacyBtn);
        State.notify('balance_visibility_changed', newHide);
        Toast.info(newHide ? 'Modo Privado Ativado' : 'Valores Visíveis', newHide ? 'Saldos ocultos para maior discrição.' : 'Saldos exibidos normalmente.');
      });
    }

    // Botão de Troca Rápida de Tema (Sol / Lua no Header)
    const themeBtn = document.getElementById('header-btn-toggle-theme');
    if (themeBtn) {
      this.updateThemeIcon(themeBtn);
      themeBtn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        Storage.saveSettings({ theme: newTheme });
        this.updateThemeIcon(themeBtn);
        State.notify('theme_changed', newTheme);
      });
    }
  },

  /**
   * Navega entre as páginas do sistema sem recarregar
   * @param {string} viewName
   */
  navigateTo(viewName) {
    if (!this.views[viewName]) return;

    // Atualiza estado
    State.setView(viewName);

    // Atualiza classes ativas na Sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Oculta todas as views e exibe a selecionada
    document.querySelectorAll('.view-section').forEach(section => {
      section.classList.remove('active');
    });

    const activeSection = document.getElementById(`view-${viewName}`);
    if (activeSection) {
      activeSection.classList.add('active');
    }

    // Atualiza título e breadcrumb no Header
    const titles = {
      dashboard: { title: 'Visão Geral', breadcrumb: 'Início / Visão Geral' },
      transactions: { title: 'Transações Financeiras', breadcrumb: 'Início / Transações' },
      reports: { title: 'Relatórios & Gráficos', breadcrumb: 'Início / Relatórios' },
      categories: { title: 'Categorias de Gastos e Receitas', breadcrumb: 'Início / Categorias' },
      settings: { title: 'Configurações do Sistema', breadcrumb: 'Início / Configurações' }
    };

    const headerTitle = document.getElementById('header-page-title');
    const headerBreadcrumb = document.getElementById('header-breadcrumb');

    if (headerTitle && titles[viewName]) {
      headerTitle.textContent = titles[viewName].title;
    }
    if (headerBreadcrumb && titles[viewName]) {
      headerBreadcrumb.textContent = titles[viewName].breadcrumb;
    }

    // Rola para o topo suavemente
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Sempre re-renderiza a tela com os dados mais recentes de forma reativa
    if (this.views[viewName] && typeof this.views[viewName].render === 'function') {
      this.views[viewName].render();
    }
  },

  /**
   * Atualiza os números nos badges da barra lateral
   */
  updateSidebarBadges() {
    const txCount = Storage.getTransactions().length;
    const catCount = Storage.getCategories().length;

    const txBadge = document.getElementById('nav-badge-transactions');
    const catBadge = document.getElementById('nav-badge-categories');

    if (txBadge) txBadge.textContent = txCount;
    if (catBadge) catBadge.textContent = catCount;
  },

  /**
   * Atualiza o ícone do botão de privacidade
   */
  updatePrivacyIcon(btn) {
    const settings = Storage.getSettings();
    btn.innerHTML = settings.hideBalances ? Utils.icons.eyeOff : Utils.icons.eye;
    btn.title = settings.hideBalances ? 'Mostrar valores monetários' : 'Ocultar valores monetários';
  },

  /**
   * Atualiza o ícone do botão de tema
   */
  updateThemeIcon(btn) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.innerHTML = isDark ? Utils.icons.sun : Utils.icons.moon;
    btn.title = isDark ? 'Ativar Modo Claro' : 'Ativar Modo Escuro';
  }
};

// Inicializa a aplicação assim que o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
