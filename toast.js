/**
 * MEU CONTROLE - TOAST NOTIFICATION SYSTEM
 * Mensagens de sucesso, erro, alerta e informação
 */

import { Utils } from '../utils.js';

export const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  /**
   * Exibe uma notificação toast
   * @param {string} title
   * @param {string} message
   * @param {'success'|'error'|'info'|'warning'} type
   * @param {number} durationMs
   */
  show(title, message = '', type = 'success', durationMs = 3500) {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconHtml = Utils.icons.check;
    if (type === 'error') iconHtml = Utils.icons.alertCircle;
    if (type === 'warning') iconHtml = Utils.icons.alertCircle;
    if (type === 'info') iconHtml = Utils.icons.refresh;

    toast.innerHTML = `
      <div class="toast-icon">${iconHtml}</div>
      <div class="toast-content">
        <div class="toast-title">${Utils.escapeHtml(title)}</div>
        ${message ? `<div class="toast-message">${Utils.escapeHtml(message)}</div>` : ''}
      </div>
      <button class="toast-close" title="Fechar">${Utils.icons.close}</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
      toast.classList.add('hiding');
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 250);
    };

    closeBtn.addEventListener('click', dismiss);

    this.container.appendChild(toast);

    if (durationMs > 0) {
      setTimeout(dismiss, durationMs);
    }
  },

  success(title, message) {
    this.show(title, message, 'success');
  },

  error(title, message) {
    this.show(title, message, 'error', 4500);
  },

  info(title, message) {
    this.show(title, message, 'info');
  },

  warning(title, message) {
    this.show(title, message, 'warning', 4500);
  }
};
