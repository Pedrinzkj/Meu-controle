/**
 * MEU CONTROLE - CANVAS CHART ENGINE (INTERATIVO COM TOOLTIPS)
 * Motor gráfico nativo em HTML5 Canvas, de alto desempenho, responsivo,
 * com suporte a HiDPI (Retina), modo escuro automático e tooltips interativos
 * com valores ao passar o mouse por cima das barras e das fatias de pizza/rosca.
 */

import { Utils } from './utils.js';

export const Charts = {
  /**
   * Helper para obter ou criar o tooltip flutuante no container
   */
  getTooltip(canvas) {
    const container = canvas.parentElement;
    if (!container) return null;
    let tip = container.querySelector('.chart-tooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'chart-tooltip';
      container.appendChild(tip);
    }
    return tip;
  },

  /**
   * Renderiza gráfico de barras comparativo: Receitas vs Despesas por mês
   * com suporte a passagem de mouse (hover) e exibição de valores em tooltip.
   */
  renderBarChart(canvas, data, options = {}) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.parentElement.clientWidth || 500;
    const height = rect.height || 280;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)';
    const highlightBg = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.03)';
    const incomeColor = '#10b981';
    const expenseColor = '#ef4444';

    const padding = { top: 25, right: 20, bottom: 45, left: 65 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    let maxVal = 0;
    data.forEach(d => {
      if (d.income > maxVal) maxVal = d.income;
      if (d.expense > maxVal) maxVal = d.expense;
    });
    if (maxVal === 0) maxVal = 1000;
    maxVal = Math.ceil(maxVal * 1.15);

    const groupCount = data.length;
    const groupWidth = chartW / groupCount;
    const barWidth = Math.min(22, (groupWidth - 10) / 2);

    const draw = (hoveredIndex = -1) => {
      ctx.clearRect(0, 0, width, height);

      const hasData = data.some(d => d.income > 0 || d.expense > 0);
      if (!hasData) {
        ctx.fillStyle = textColor;
        ctx.font = '500 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Nenhuma movimentação registrada no período', width / 2, height / 2);
        return;
      }

      // Linhas de grade horizontais e rótulos do eixo Y
      const gridSteps = 4;
      ctx.lineWidth = 1;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      for (let i = 0; i <= gridSteps; i++) {
        const yVal = (maxVal / gridSteps) * i;
        const yPos = padding.top + chartH - (chartH * (i / gridSteps));

        ctx.strokeStyle = gridColor;
        ctx.beginPath();
        ctx.moveTo(padding.left, yPos);
        ctx.lineTo(padding.left + chartW, yPos);
        ctx.stroke();

        ctx.fillStyle = textColor;
        const label = yVal >= 1000 ? `R$ ${(yVal / 1000).toFixed(1)}k` : `R$ ${Math.round(yVal)}`;
        ctx.fillText(label, padding.left - 8, yPos);
      }

      // Desenha cada grupo de mês
      data.forEach((d, idx) => {
        const groupLeft = padding.left + (idx * groupWidth);
        const groupCenterX = groupLeft + (groupWidth / 2);

        // Se estiver em foco pelo mouse, desenha coluna destacada
        if (idx === hoveredIndex) {
          ctx.fillStyle = highlightBg;
          this.drawRoundedRect(ctx, groupLeft + 2, padding.top, groupWidth - 4, chartH, 6);
        }

        const incomeH = (d.income / maxVal) * chartH;
        const expenseH = (d.expense / maxVal) * chartH;

        // Barra de Receita
        if (incomeH > 0) {
          ctx.fillStyle = incomeColor;
          this.drawRoundedRect(ctx, groupCenterX - barWidth - 2, padding.top + chartH - incomeH, barWidth, incomeH, 4);
        }

        // Barra de Despesa
        if (expenseH > 0) {
          ctx.fillStyle = expenseColor;
          this.drawRoundedRect(ctx, groupCenterX + 2, padding.top + chartH - expenseH, barWidth, expenseH, 4);
        }

        // Rótulo do Eixo X
        ctx.fillStyle = (idx === hoveredIndex) ? (isDark ? '#f8fafc' : '#0f172a') : textColor;
        ctx.font = (idx === hoveredIndex) ? '600 11px sans-serif' : '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(Utils.getMonthShortName(d.monthIndex), groupCenterX, padding.top + chartH + 10);
      });

      // Legenda no topo
      this.drawChartLegend(ctx, width - padding.right, padding.top - 12, [
        { label: 'Receitas', color: incomeColor },
        { label: 'Despesas', color: expenseColor }
      ]);
    };

    draw(-1);

    // Configura eventos de interação com o mouse
    const tooltip = this.getTooltip(canvas);

    // Remove ouvintes anteriores para evitar vazamento de memória
    if (canvas._barMouseHandler) {
      canvas.removeEventListener('mousemove', canvas._barMouseHandler);
      canvas.removeEventListener('mouseleave', canvas._barLeaveHandler);
    }

    const onMouseMove = (e) => {
      const cRect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - cRect.left;
      const mouseY = e.clientY - cRect.top;

      if (mouseX >= padding.left && mouseX <= padding.left + chartW && mouseY >= padding.top && mouseY <= padding.top + chartH + 20) {
        const idx = Math.floor((mouseX - padding.left) / groupWidth);
        if (idx >= 0 && idx < data.length) {
          const d = data[idx];
          draw(idx);

          if (tooltip) {
            const monthFullName = Utils.getMonthName(d.monthIndex);
            const netBalance = d.income - d.expense;
            tooltip.innerHTML = `
              <div style="font-weight: 700; margin-bottom: 4px; border-bottom: 1px solid var(--border-color); padding-bottom: 2px;">${monthFullName}</div>
              <div style="display: flex; justify-content: space-between; gap: 12px; color: var(--color-income);">
                <span>Receitas:</span> <strong>+ ${Utils.formatCurrency(d.income)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 12px; color: var(--color-expense);">
                <span>Despesas:</span> <strong>- ${Utils.formatCurrency(d.expense)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 12px; margin-top: 2px; font-weight: 600; color: ${netBalance >= 0 ? 'var(--color-income)' : 'var(--color-expense)'};">
                <span>Saldo:</span> <strong>${Utils.formatCurrency(netBalance)}</strong>
              </div>
            `;
            tooltip.style.left = `${mouseX}px`;
            tooltip.style.top = `${mouseY}px`;
            tooltip.classList.add('visible');
          }
          return;
        }
      }

      draw(-1);
      if (tooltip) tooltip.classList.remove('visible');
    };

    const onMouseLeave = () => {
      draw(-1);
      if (tooltip) tooltip.classList.remove('visible');
    };

    canvas._barMouseHandler = onMouseMove;
    canvas._barLeaveHandler = onMouseLeave;

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
  },

  /**
   * Renderiza gráfico de Rosca (Donut Chart) com fatias interativas
   * Ao passar o mouse sobre uma fatia, ela se expande e exibe o nome,
   * ícone, valor em reais e percentual em um tooltip interativo e no centro.
   */
  renderDonutChart(canvas, items, totalSum) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.parentElement.clientWidth || 360;
    const height = rect.height || 280;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#f8fafc' : '#0f172a';
    const subtextColor = isDark ? '#94a3b8' : '#64748b';

    const centerX = width / 2;
    const centerY = height / 2;
    const baseOuterRadius = Math.min(centerX, centerY) - 22;
    const baseInnerRadius = baseOuterRadius * 0.65;

    // Calcula ângulos de cada fatia
    let currentAngle = -Math.PI / 2;
    const slices = (items || []).filter(item => item.amount > 0).map(item => {
      const sliceAngle = (item.amount / totalSum) * (Math.PI * 2);
      const s = {
        item,
        startAngle: currentAngle,
        endAngle: currentAngle + sliceAngle
      };
      currentAngle += sliceAngle;
      return s;
    });

    const draw = (hoveredSliceIndex = -1) => {
      ctx.clearRect(0, 0, width, height);

      if (!items || items.length === 0 || totalSum === 0) {
        ctx.fillStyle = subtextColor;
        ctx.font = '500 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Nenhum gasto registrado neste período', width / 2, height / 2);
        return;
      }

      slices.forEach((s, idx) => {
        const isHovered = (idx === hoveredSliceIndex);
        const outerRadius = isHovered ? baseOuterRadius + 8 : baseOuterRadius;
        const innerRadius = isHovered ? baseInnerRadius - 2 : baseInnerRadius;

        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, s.startAngle, s.endAngle);
        ctx.arc(centerX, centerY, innerRadius, s.endAngle, s.startAngle, true);
        ctx.closePath();

        ctx.fillStyle = s.item.color || '#3b82f6';
        ctx.fill();

        ctx.lineWidth = isHovered ? 3 : 2;
        ctx.strokeStyle = isDark ? '#111827' : '#ffffff';
        ctx.stroke();
      });

      // Texto no centro do Donut
      if (hoveredSliceIndex >= 0 && slices[hoveredSliceIndex]) {
        const active = slices[hoveredSliceIndex].item;
        ctx.fillStyle = textColor;
        ctx.font = '600 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${active.icon} ${active.name}`, centerX, centerY - 2);

        ctx.fillStyle = active.color || textColor;
        ctx.font = '700 15px sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillText(`${Utils.formatCurrency(active.amount)}`, centerX, centerY + 2);
      } else {
        ctx.fillStyle = subtextColor;
        ctx.font = '500 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('Total Gasto', centerX, centerY - 2);

        ctx.fillStyle = textColor;
        ctx.font = '700 16px sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillText(Utils.formatCurrency(totalSum), centerX, centerY + 2);
      }
    };

    draw(-1);

    // Eventos de passagem de mouse para as fatias da rosca
    const tooltip = this.getTooltip(canvas);

    if (canvas._donutMouseHandler) {
      canvas.removeEventListener('mousemove', canvas._donutMouseHandler);
      canvas.removeEventListener('mouseleave', canvas._donutLeaveHandler);
    }

    const onMouseMove = (e) => {
      if (slices.length === 0) return;
      const cRect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - cRect.left;
      const mouseY = e.clientY - cRect.top;

      const dx = mouseX - centerX;
      const dy = mouseY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist >= baseInnerRadius * 0.7 && dist <= baseOuterRadius + 15) {
        let angle = Math.atan2(dy, dx);
        if (angle < -Math.PI / 2) {
          angle += Math.PI * 2;
        }

        const foundIndex = slices.findIndex(s => angle >= s.startAngle && angle < s.endAngle);
        if (foundIndex >= 0) {
          const hovered = slices[foundIndex].item;
          draw(foundIndex);

          if (tooltip) {
            tooltip.innerHTML = `
              <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; margin-bottom: 2px;">
                <span style="font-size: 1.1rem;">${hovered.icon}</span>
                <span>${Utils.escapeHtml(hovered.name)}</span>
              </div>
              <div style="color: ${hovered.color}; font-weight: 700; font-size: 0.95rem;">
                ${Utils.formatCurrency(hovered.amount)}
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">
                ${hovered.percentage}% de todas as despesas
              </div>
            `;
            tooltip.style.left = `${mouseX}px`;
            tooltip.style.top = `${mouseY}px`;
            tooltip.classList.add('visible');
          }
          return;
        }
      }

      draw(-1);
      if (tooltip) tooltip.classList.remove('visible');
    };

    const onMouseLeave = () => {
      draw(-1);
      if (tooltip) tooltip.classList.remove('visible');
    };

    canvas._donutMouseHandler = onMouseMove;
    canvas._donutLeaveHandler = onMouseLeave;

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
  },

  drawRoundedRect(ctx, x, y, width, height, radius) {
    if (height < radius) radius = height;
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height);
    ctx.closePath();
    ctx.fill();
  },

  drawChartLegend(ctx, rightX, y, items) {
    let currentX = rightX;
    ctx.font = '11px sans-serif';
    ctx.textBaseline = 'middle';

    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      const textWidth = ctx.measureText(item.label).width;
      currentX -= textWidth;
      ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#94a3b8' : '#475569';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, currentX, y);

      currentX -= 16;
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(currentX + 6, y, 4, 0, Math.PI * 2);
      ctx.fill();

      currentX -= 14;
    }
  }
};
