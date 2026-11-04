/**
 * MEU CONTROLE - INVESTMENTS SERVICE & VIEWS
 * Suporte completo a Criptomoedas, FIIs, Ações e Renda Fixa,
 * Integração com APIs externas (CoinGecko, Binance, Yahoo Finance, BCB),
 * Preço médio ponderado, lucros realizados e não-realizados,
 * Proventos, Metas, Histórico patrimonial e Integração total com Saldo Disponível.
 */

// =========================================================================
// DEFAULT DATA & CONSTANTS
// =========================================================================
const DEFAULT_INVESTMENTS = [
  {
    id: 'inv_btc',
    ticker: 'BTC',
    name: 'Bitcoin',
    type: 'crypto', // crypto, fii, stock, fixed
    institution: 'Binance',
    quantity: 0.015,
    averagePrice: 320000.00,
    currentPrice: 420000.00,
    totalInvested: 4800.00,
    lastUpdate: new Date().toISOString(),
    notes: 'Reserva descentralizada e reserva de valor global'
  },
  {
    id: 'inv_mxrf',
    ticker: 'MXRF11',
    name: 'Maxi Renda FII',
    type: 'fii',
    institution: 'XP Investimentos',
    quantity: 250,
    averagePrice: 10.15,
    currentPrice: 10.35,
    totalInvested: 2537.50,
    lastUpdate: new Date().toISOString(),
    notes: 'Fundo de papel diversificado com foco em dividendos mensais'
  },
  {
    id: 'inv_petr',
    ticker: 'PETR4',
    name: 'Petrobras PN',
    type: 'stock',
    institution: 'BTG Pactual',
    quantity: 60,
    averagePrice: 34.50,
    currentPrice: 38.20,
    totalInvested: 2070.00,
    lastUpdate: new Date().toISOString(),
    notes: 'Posição em dividendos e setor de energia'
  },
  {
    id: 'inv_cdb',
    ticker: 'CDB-DI-110',
    name: 'CDB Banco Inter 110% CDI',
    type: 'fixed',
    institution: 'Banco Inter',
    quantity: 1,
    averagePrice: 5000.00,
    currentPrice: 5320.00,
    totalInvested: 5000.00,
    rateText: '110% do CDI',
    benchmark: 'CDI',
    rateValue: 110,
    liquidity: 'Diária',
    maturityDate: '2027-12-15',
    lastUpdate: new Date().toISOString(),
    notes: 'Reserva de liquidez com rendimento acima da Selic'
  }
];

const DEFAULT_INVESTMENT_TRANSACTIONS = [
  {
    id: 'itx_1',
    investmentId: 'inv_btc',
    type: 'buy', // buy, sell
    quantity: 0.015,
    unitPrice: 320000.00,
    fees: 0.00,
    totalAmount: 4800.00,
    date: '2026-08-10',
    broker: 'Binance',
    notes: 'Primeiro aporte em Bitcoin'
  },
  {
    id: 'itx_2',
    investmentId: 'inv_mxrf',
    type: 'buy',
    quantity: 250,
    unitPrice: 10.15,
    fees: 0.00,
    totalAmount: 2537.50,
    date: '2026-09-05',
    broker: 'XP Investimentos',
    notes: 'Montagem de posição em fundos imobiliários'
  },
  {
    id: 'itx_3',
    investmentId: 'inv_petr',
    type: 'buy',
    quantity: 60,
    unitPrice: 34.50,
    fees: 0.00,
    totalAmount: 2070.00,
    date: '2026-09-18',
    broker: 'BTG Pactual',
    notes: 'Compra de ações'
  },
  {
    id: 'itx_4',
    investmentId: 'inv_cdb',
    type: 'buy',
    quantity: 1,
    unitPrice: 5000.00,
    fees: 0.00,
    totalAmount: 5000.00,
    date: '2026-07-01',
    broker: 'Banco Inter',
    notes: 'Aplicação em renda fixa pós-fixada'
  }
];

const DEFAULT_DIVIDENDS = [
  {
    id: 'div_1',
    investmentId: 'inv_mxrf',
    ticker: 'MXRF11',
    type: 'dividend', // dividend, jcp, yield
    amount: 25.00,
    quantityRef: 250,
    date: '2026-10-15',
    notes: 'Rendimento mensal MXRF11 (R$ 0,10 por cota)'
  },
  {
    id: 'div_2',
    investmentId: 'inv_petr',
    ticker: 'PETR4',
    type: 'dividend',
    amount: 68.40,
    quantityRef: 60,
    date: '2026-10-20',
    notes: 'Dividendos extraordinários Petrobras'
  }
];

const DEFAULT_INVESTMENT_GOALS = [
  {
    id: 'ig_1',
    name: 'Alcançar R$ 25.000 Investidos',
    targetAmount: 25000.00,
    deadline: '2027-06-30',
    description: 'Meta geral de patrimônio alocado em ativos geradores de renda'
  },
  {
    id: 'ig_2',
    name: 'Receber R$ 300/mês em Dividendos',
    targetAmount: 300.00,
    deadline: '2027-12-31',
    description: 'Renda passiva mensal gerada por FIIs e Ações'
  }
];

// Catálogo de sugestões rápidas para pesquisa por Ticker
const TICKER_CATALOG = [
  // Cripto
  { ticker: 'BTC', name: 'Bitcoin', type: 'crypto', defaultPrice: 420000.00, coingeckoId: 'bitcoin' },
  { ticker: 'ETH', name: 'Ethereum', type: 'crypto', defaultPrice: 12500.00, coingeckoId: 'ethereum' },
  { ticker: 'SOL', name: 'Solana', type: 'crypto', defaultPrice: 510.00, coingeckoId: 'solana' },
  { ticker: 'USDT', name: 'Tether USD', type: 'crypto', defaultPrice: 5.60, coingeckoId: 'tether' },
  { ticker: 'ADA', name: 'Cardano', type: 'crypto', defaultPrice: 2.10, coingeckoId: 'cardano' },
  // FIIs
  { ticker: 'MXRF11', name: 'Maxi Renda FII', type: 'fii', defaultPrice: 10.35 },
  { ticker: 'HGLG11', name: 'CSHG Logística FII', type: 'fii', defaultPrice: 162.50 },
  { ticker: 'KNRI11', name: 'Kinea Renda Imobiliária', type: 'fii', defaultPrice: 158.00 },
  { ticker: 'XPLG11', name: 'XP Log FII', type: 'fii', defaultPrice: 108.40 },
  { ticker: 'VISC11', name: 'Vinci Shopping Centers', type: 'fii', defaultPrice: 118.20 },
  { ticker: 'HGRU11', name: 'CSHG Renda Urbana', type: 'fii', defaultPrice: 126.80 },
  { ticker: 'BTLG11', name: 'BTG Pactual Logística', type: 'fii', defaultPrice: 101.50 },
  { ticker: 'CPTS11', name: 'Capitânia Securities II', type: 'fii', defaultPrice: 8.20 },
  // Ações
  { ticker: 'PETR4', name: 'Petrobras PN', type: 'stock', defaultPrice: 38.20 },
  { ticker: 'VALE3', name: 'Vale ON', type: 'stock', defaultPrice: 62.80 },
  { ticker: 'ITUB4', name: 'Itaú Unibanco PN', type: 'stock', defaultPrice: 35.10 },
  { ticker: 'BBAS3', name: 'Banco do Brasil ON', type: 'stock', defaultPrice: 27.90 },
  { ticker: 'WEGE3', name: 'WEG ON', type: 'stock', defaultPrice: 52.40 },
  { ticker: 'BBDC4', name: 'Bradesco PN', type: 'stock', defaultPrice: 14.80 },
  { ticker: 'ABEV3', name: 'Ambev ON', type: 'stock', defaultPrice: 12.30 },
  { ticker: 'RENT3', name: 'Localiza ON', type: 'stock', defaultPrice: 48.60 },
  // Renda Fixa
  { ticker: 'TESOURO-SELIC', name: 'Tesouro Selic 2029', type: 'fixed', defaultPrice: 14850.00 },
  { ticker: 'TESOURO-IPCA', name: 'Tesouro IPCA+ 2035', type: 'fixed', defaultPrice: 3200.00 },
  { ticker: 'CDB-100-CDI', name: 'CDB 100% CDI Liquidez Diária', type: 'fixed', defaultPrice: 1000.00 },
  { ticker: 'LCI-90-CDI', name: 'LCI 90% CDI Isento de IR', type: 'fixed', defaultPrice: 1000.00 }
];

// =========================================================================
// MARKET API SERVICE (com Fallback Inteligente, Cache e Preços BRL)
// =========================================================================
const MarketApiService = {
  lastUpdated: null,
  isUpdating: false,
  apiStatus: 'online', // 'online', 'cached'

  async fetchCryptoPrice(coingeckoId, symbol) {
    try {
      // 1. Tentar Binance para pares BRL
      if (symbol) {
        const binanceSymbol = (symbol.toUpperCase() === 'BTC' ? 'BTCBRL' :
                               symbol.toUpperCase() === 'ETH' ? 'ETHBRL' :
                               symbol.toUpperCase() === 'SOL' ? 'SOLBRL' : null);
        if (binanceSymbol) {
          const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`);
          if (res.ok) {
            const data = await res.json();
            const p = parseFloat(data.price);
            if (!isNaN(p) && p > 0) return p;
          }
        }
      }

      // 2. Tentar CoinGecko
      if (coingeckoId) {
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=brl`);
        if (res.ok) {
          const data = await res.json();
          if (data[coingeckoId] && data[coingeckoId].brl) {
            return Number(data[coingeckoId].brl);
          }
        }
      }
    } catch (e) {
      console.warn(`[MarketAPI] Falha ao obter cotação de ${symbol}:`, e.message);
    }
    return null;
  },

  async fetchB3Price(ticker) {
    try {
      const cleanTicker = ticker.toUpperCase().trim();
      const symbol = cleanTicker.endsWith('.SA') ? cleanTicker : `${cleanTicker}.SA`;
      
      // Yahoo Finance v8 chart endpoint (disponível publicamente sem credencial)
      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
      if (res.ok) {
        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        const p = meta?.regularMarketPrice;
        if (p && !isNaN(p) && p > 0) return Number(p);
      }
    } catch (e) {
      console.warn(`[MarketAPI] Falha ao consultar Yahoo Finance para ${ticker}:`, e.message);
    }
    return null;
  },

  async updateAllQuotes() {
    if (this.isUpdating) return;
    this.isUpdating = true;

    try {
      const investments = Storage.getInvestments();
      let updatedCount = 0;

      for (const inv of investments) {
        let newPrice = null;

        if (inv.type === 'crypto') {
          const found = TICKER_CATALOG.find(t => t.ticker === inv.ticker);
          const cId = found ? found.coingeckoId : (inv.ticker.toLowerCase() === 'btc' ? 'bitcoin' : inv.ticker.toLowerCase() === 'eth' ? 'ethereum' : 'solana');
          newPrice = await this.fetchCryptoPrice(cId, inv.ticker);
        } else if (inv.type === 'fii' || inv.type === 'stock') {
          newPrice = await this.fetchB3Price(inv.ticker);
        } else if (inv.type === 'fixed') {
          // Renda fixa: simula atualização baseada no CDI (aprox. 0.04% ao dia útil) se não for atualizado manualmente
          const daysPassed = Math.max(1, Math.floor((Date.now() - new Date(inv.lastUpdate || Date.now()).getTime()) / (1000 * 60 * 60 * 24)));
          if (daysPassed >= 1) {
            const dailyRate = (0.1075 / 252) * ((inv.rateValue || 100) / 100);
            newPrice = (inv.currentPrice || inv.averagePrice) * Math.pow(1 + dailyRate, daysPassed);
          }
        }

        if (newPrice !== null && !isNaN(newPrice) && newPrice > 0) {
          inv.currentPrice = Math.round(newPrice * 100) / 100;
          inv.lastUpdate = new Date().toISOString();
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        Storage.saveInvestments(investments);
        this.apiStatus = 'online';
      } else {
        this.apiStatus = 'cached';
      }

      this.lastUpdated = new Date();
      Storage.createPortfolioSnapshot();
      State.notify('investments_updated');
    } catch (err) {
      console.error('[MarketAPI] Erro global na atualização de cotações:', err);
      this.apiStatus = 'cached';
    } finally {
      this.isUpdating = false;
    }
  }
};


// =========================================================================
// LINE CHART ENGINE (Evolução Patrimonial Interativa)
// =========================================================================
Charts.renderLineChart = function(canvas, dataPoints) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || canvas.parentElement.clientWidth || 600;
  const height = rect.height || 260;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)';
  const lineColor = '#3b82f6';
  const fillColor = isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)';

  const padding = { top: 20, right: 25, bottom: 40, left: 65 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  if (!dataPoints || dataPoints.length === 0) {
    ctx.fillStyle = textColor;
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Nenhum dado histórico de investimentos registrado.', width / 2, height / 2);
    return;
  }

  const values = dataPoints.map(p => p.value);
  let minVal = Math.min(...values);
  let maxVal = Math.max(...values);
  if (minVal === maxVal) { minVal = 0; maxVal = maxVal * 1.2 || 1000; }
  minVal = Math.max(0, minVal * 0.95);
  maxVal = maxVal * 1.05;

  const getX = (index) => padding.left + (index / (dataPoints.length - 1 || 1)) * chartW;
  const getY = (val) => padding.top + chartH - ((val - minVal) / (maxVal - minVal || 1)) * chartH;

  const tooltip = Charts.getTooltip(canvas);

  const draw = (hoveredIndex = -1) => {
    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const yVal = minVal + ((maxVal - minVal) / gridSteps) * i;
      const yPos = getY(yVal);
      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(width - padding.right, yPos);
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(Utils.formatCurrency(yVal).replace('R$', '').trim(), padding.left - 8, yPos);
    }

    // Dates on X axis
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const step = Math.max(1, Math.floor(dataPoints.length / 5));
    dataPoints.forEach((p, idx) => {
      if (idx % step === 0 || idx === dataPoints.length - 1) {
        ctx.fillStyle = textColor;
        ctx.fillText(Utils.formatDateShort(p.date), getX(idx), height - padding.bottom + 8);
      }
    });

    // Area fill
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(dataPoints[0].value));
    for (let i = 1; i < dataPoints.length; i++) {
      ctx.lineTo(getX(i), getY(dataPoints[i].value));
    }
    ctx.lineTo(getX(dataPoints.length - 1), height - padding.bottom);
    ctx.lineTo(getX(0), height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(dataPoints[0].value));
    for (let i = 1; i < dataPoints.length; i++) {
      ctx.lineTo(getX(i), getY(dataPoints[i].value));
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Points
    dataPoints.forEach((p, idx) => {
      const x = getX(idx);
      const y = getY(p.value);
      const isHovered = idx === hoveredIndex;

      ctx.beginPath();
      ctx.arc(x, y, isHovered ? 6 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? '#ffffff' : lineColor;
      ctx.fill();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = isHovered ? 3 : 1.5;
      ctx.stroke();
    });
  };

  draw(-1);

  // Mouse interactivity
  if (canvas._lineMouseHandler) {
    canvas.removeEventListener('mousemove', canvas._lineMouseHandler);
    canvas.removeEventListener('mouseleave', canvas._lineLeaveHandler);
  }

  const onMouseMove = (e) => {
    const cRect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - cRect.left;
    const mouseY = e.clientY - cRect.top;

    let closestIdx = -1;
    let closestDist = Infinity;

    dataPoints.forEach((p, idx) => {
      const x = getX(idx);
      const dist = Math.abs(mouseX - x);
      if (dist < closestDist && dist < (chartW / dataPoints.length) + 15) {
        closestDist = dist;
        closestIdx = idx;
      }
    });

    if (closestIdx >= 0) {
      draw(closestIdx);
      if (tooltip) {
        const item = dataPoints[closestIdx];
        tooltip.innerHTML = `
          <div style="font-weight: 700; margin-bottom: 2px;">${Utils.formatDate(item.date)}</div>
          <div style="color: #3b82f6; font-size: 0.95rem; font-weight: 700;">${Utils.formatCurrency(item.value)}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">Patrimônio Total Investido</div>
        `;
        tooltip.style.left = `${getX(closestIdx)}px`;
        tooltip.style.top = `${getY(item.value)}px`;
        tooltip.classList.add('visible');
      }
    } else {
      draw(-1);
      if (tooltip) tooltip.classList.remove('visible');
    }
  };

  const onMouseLeave = () => {
    draw(-1);
    if (tooltip) tooltip.classList.remove('visible');
  };

  canvas._lineMouseHandler = onMouseMove;
  canvas._lineLeaveHandler = onMouseLeave;
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseleave', onMouseLeave);
};


// =========================================================================
// MODAIS DE INVESTIMENTOS
// =========================================================================
Modal.openInvestmentModal = function(investment = null, onSave) {
  const isEdit = Boolean(investment && investment.id);
  let selectedClass = investment ? investment.type : 'stock';

  const modalHtml = `
    <div class="modal-header">
      <h3 class="modal-title">${isEdit ? 'Editar Ativo' : 'Adicionar Investimento'}</h3>
      <button class="modal-close-btn" type="button" title="Fechar">${Utils.icons.close}</button>
    </div>
    <form id="form-investment">
      <div class="modal-body">
        ${!isEdit ? `
          <label class="form-label">Classe do Investimento</label>
          <div class="inv-class-selector-grid">
            <button type="button" class="inv-class-card-btn ${selectedClass === 'crypto' ? 'selected' : ''}" data-class="crypto">
              <span style="font-size: 1.5rem;">🪙</span>
              <span>Criptomoeda</span>
            </button>
            <button type="button" class="inv-class-card-btn ${selectedClass === 'fii' ? 'selected' : ''}" data-class="fii">
              <span style="font-size: 1.5rem;">🏢</span>
              <span>Fundo Imobiliário</span>
            </button>
            <button type="button" class="inv-class-card-btn ${selectedClass === 'stock' ? 'selected' : ''}" data-class="stock">
              <span style="font-size: 1.5rem;">📈</span>
              <span>Ação (B3)</span>
            </button>
            <button type="button" class="inv-class-card-btn ${selectedClass === 'fixed' ? 'selected' : ''}" data-class="fixed">
              <span style="font-size: 1.5rem;">🏛️</span>
              <span>Renda Fixa</span>
            </button>
          </div>
        ` : ''}

        <div class="form-row">
          <div class="form-group inv-ticker-search-box" id="group-inv-ticker" style="flex: 1;">
            <label class="form-label" for="inv-ticker">Código / Ticker <span class="required">*</span></label>
            <input type="text" id="inv-ticker" placeholder="Ex: PETR4, MXRF11, BTC..." value="${Utils.escapeHtml(investment?.ticker || '')}" required autocomplete="off" style="text-transform: uppercase;">
            <div class="inv-ticker-results" id="inv-ticker-results"></div>
            <span class="form-error">Informe o ticker ou código.</span>
          </div>

          <div class="form-group" style="flex: 2;">
            <label class="form-label" for="inv-name">Nome do Ativo <span class="required">*</span></label>
            <input type="text" id="inv-name" placeholder="Ex: Petrobras PN, Bitcoin..." value="${Utils.escapeHtml(investment?.name || '')}" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="inv-institution">Instituição / Corretora</label>
            <input type="text" id="inv-institution" placeholder="Ex: NuInvest, XP, Binance..." value="${Utils.escapeHtml(investment?.institution || '')}">
          </div>

          <div class="form-group" id="group-inv-qty">
            <label class="form-label" for="inv-qty">Quantidade Inicial <span class="required">*</span></label>
            <input type="number" id="inv-qty" step="any" min="0.00000001" placeholder="Ex: 100" value="${investment?.quantity || ''}" required ${isEdit ? 'disabled' : ''}>
            <span class="form-error">Informe uma quantidade válida.</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group" id="group-inv-price">
            <label class="form-label" for="inv-price">Preço Unitário de Compra (R$) <span class="required">*</span></label>
            <div class="input-with-prefix">
              <span class="input-prefix">R$</span>
              <input type="number" id="inv-price" step="0.01" min="0.01" placeholder="0,00" value="${investment?.averagePrice || ''}" required ${isEdit ? 'disabled' : ''}>
            </div>
            <span class="form-error">Informe o preço unitário.</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="inv-fees">Taxas / Custos (R$)</label>
            <div class="input-with-prefix">
              <span class="input-prefix">R$</span>
              <input type="number" id="inv-fees" step="0.01" min="0" placeholder="0,00" value="0.00" ${isEdit ? 'disabled' : ''}>
            </div>
          </div>
        </div>

        <div id="inv-fixed-fields" style="${selectedClass === 'fixed' ? 'display: block;' : 'display: none;'}">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="inv-rate">Taxa Contratada</label>
              <input type="text" id="inv-rate" placeholder="Ex: 110% do CDI, IPCA + 6%" value="${Utils.escapeHtml(investment?.rateText || '')}">
            </div>
            <div class="form-group">
              <label class="form-label" for="inv-maturity">Data de Vencimento</label>
              <input type="date" id="inv-maturity" value="${investment?.maturityDate || ''}">
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="inv-notes">Observações</label>
          <input type="text" id="inv-notes" placeholder="Estratégia, objetivo, prazo..." value="${Utils.escapeHtml(investment?.notes || '')}">
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary modal-cancel-btn">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Salvar Alterações' : 'Cadastrar Investimento'}</button>
      </div>
    </form>
  `;

  this.open(modalHtml);
  const form = document.getElementById('form-investment');
  form.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());

  // Class selection buttons
  form.querySelectorAll('.inv-class-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      form.querySelectorAll('.inv-class-card-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedClass = btn.getAttribute('data-class');
      const fixedFields = document.getElementById('inv-fixed-fields');
      if (fixedFields) fixedFields.style.display = selectedClass === 'fixed' ? 'block' : 'none';
    });
  });

  // Ticker autocomplete search
  const tickerInput = document.getElementById('inv-ticker');
  const nameInput = document.getElementById('inv-name');
  const priceInput = document.getElementById('inv-price');
  const resultsBox = document.getElementById('inv-ticker-results');

  tickerInput.addEventListener('input', () => {
    const q = tickerInput.value.toUpperCase().trim();
    if (!q) { resultsBox.style.display = 'none'; return; }

    const matches = TICKER_CATALOG.filter(item =>
      item.ticker.includes(q) || item.name.toUpperCase().includes(q)
    ).slice(0, 5);

    if (matches.length > 0) {
      resultsBox.innerHTML = matches.map(m => `
        <div class="inv-ticker-result-item" data-ticker="${m.ticker}" data-name="${m.name}" data-type="${m.type}" data-price="${m.defaultPrice}">
          <div>
            <strong>${m.ticker}</strong> - <span>${m.name}</span>
          </div>
          <span class="badge inv-badge-class ${m.type}">${m.type}</span>
        </div>
      `).join('');
      resultsBox.style.display = 'block';

      resultsBox.querySelectorAll('.inv-ticker-result-item').forEach(item => {
        item.addEventListener('click', () => {
          tickerInput.value = item.getAttribute('data-ticker');
          nameInput.value = item.getAttribute('data-name');
          const tType = item.getAttribute('data-type');
          const p = item.getAttribute('data-price');
          if (p && !priceInput.value) priceInput.value = p;

          selectedClass = tType;
          form.querySelectorAll('.inv-class-card-btn').forEach(b => {
            b.classList.toggle('selected', b.getAttribute('data-class') === tType);
          });
          const fixedFields = document.getElementById('inv-fixed-fields');
          if (fixedFields) fixedFields.style.display = selectedClass === 'fixed' ? 'block' : 'none';

          resultsBox.style.display = 'none';
        });
      });
    } else {
      resultsBox.style.display = 'none';
    }
  });

  document.addEventListener('click', (e) => {
    if (!resultsBox.contains(e.target) && e.target !== tickerInput) {
      resultsBox.style.display = 'none';
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ticker = tickerInput.value.toUpperCase().trim();
    const name = nameInput.value.trim();
    const qty = parseFloat(document.getElementById('inv-qty').value);
    const price = parseFloat(priceInput.value);
    const fees = parseFloat(document.getElementById('inv-fees').value) || 0;

    if (!ticker || !name || isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) {
      document.getElementById('group-inv-ticker').classList.toggle('has-error', !ticker);
      document.getElementById('group-inv-qty').classList.toggle('has-error', isNaN(qty) || qty <= 0);
      document.getElementById('group-inv-price').classList.toggle('has-error', isNaN(price) || price <= 0);
      return;
    }

    const payload = {
      id: isEdit ? investment.id : Utils.generateId(),
      ticker,
      name,
      type: selectedClass,
      institution: document.getElementById('inv-institution').value.trim(),
      quantity: qty,
      averagePrice: price,
      fees,
      rateText: document.getElementById('inv-rate')?.value.trim() || '',
      maturityDate: document.getElementById('inv-maturity')?.value || null,
      notes: document.getElementById('inv-notes').value.trim()
    };

    this.close();
    if (onSave) onSave(payload, isEdit);
  });
};

Modal.openTradeModal = function(investment, defaultType = 'buy', onConfirm) {
  const isBuy = defaultType === 'buy';
  const availableQty = investment.quantity || 0;
  const metrics = State.calculateMetrics(Storage.getTransactions());
  const availableBalance = metrics.balance;

  const modalHtml = `
    <div class="modal-header">
      <h3 class="modal-title">${isBuy ? 'Comprar Ativo' : 'Vender Ativo'}</h3>
      <button class="modal-close-btn" type="button" title="Fechar">${Utils.icons.close}</button>
    </div>
    <form id="form-trade">
      <div class="modal-body">
        <div class="caixinha-modal-banner" style="border-left: 4px solid var(--color-primary);">
          <span style="font-size: 1.5rem;">${investment.type === 'crypto' ? '🪙' : investment.type === 'fii' ? '🏢' : investment.type === 'stock' ? '📈' : '🏛️'}</span>
          <div>
            <strong style="font-size: var(--font-size-md); color: var(--text-primary);">${investment.ticker} - ${Utils.escapeHtml(investment.name)}</strong>
            <div style="font-size: var(--font-size-xs); color: var(--text-muted);">
              Posição Atual: <strong>${investment.quantity} cotas</strong> | Preço Médio: <strong>${Utils.formatCurrency(investment.averagePrice)}</strong>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Tipo de Operação</label>
          <div class="segmented-control">
            <div class="segmented-option type-income">
              <input type="radio" id="trade-buy" name="tradeType" value="buy" ${isBuy ? 'checked' : ''}>
              <label for="trade-buy">➕ Compra</label>
            </div>
            <div class="segmented-option type-expense">
              <input type="radio" id="trade-sell" name="tradeType" value="sell" ${!isBuy ? 'checked' : ''}>
              <label for="trade-sell">➖ Venda</label>
            </div>
          </div>
        </div>

        <div class="caixinha-balance-available-pill" id="trade-balance-pill">
          <span>${isBuy ? 'Saldo Disponível na Conta:' : 'Quantidade Disponível para Venda:'}</span>
          <strong class="${isBuy ? 'text-success' : 'text-primary'}">${isBuy ? Utils.formatCurrency(availableBalance) : availableQty + ' cotas'}</strong>
        </div>

        <div class="form-row">
          <div class="form-group" id="group-trade-qty">
            <label class="form-label" for="trade-qty">Quantidade <span class="required">*</span></label>
            <input type="number" id="trade-qty" step="any" min="0.00000001" placeholder="Ex: 50" required autofocus>
            <span class="form-error">Quantidade inválida ou superior à posição disponível.</span>
          </div>

          <div class="form-group" id="group-trade-price">
            <label class="form-label" for="trade-price">Preço Unitário (R$) <span class="required">*</span></label>
            <div class="input-with-prefix">
              <span class="input-prefix">R$</span>
              <input type="number" id="trade-price" step="0.01" min="0.01" placeholder="0,00" value="${investment.currentPrice || investment.averagePrice}" required>
            </div>
            <span class="form-error">Informe o preço unitário da operação.</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="trade-fees">Taxas / Emolumentos (R$)</label>
            <div class="input-with-prefix">
              <span class="input-prefix">R$</span>
              <input type="number" id="trade-fees" step="0.01" min="0" placeholder="0,00" value="0.00">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="trade-date">Data da Operação</label>
            <input type="date" id="trade-date" value="${Utils.getTodayString()}" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="trade-broker">Corretora / Plataforma</label>
          <input type="text" id="trade-broker" placeholder="Ex: NuInvest, XP, Binance..." value="${Utils.escapeHtml(investment.institution || '')}">
        </div>

        <div class="form-group">
          <label class="form-label" for="trade-notes">Observações</label>
          <input type="text" id="trade-notes" placeholder="Detalhes da operação...">
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary modal-cancel-btn">Cancelar</button>
        <button type="submit" class="btn btn-primary" id="btn-trade-submit">${isBuy ? 'Confirmar Compra' : 'Confirmar Venda'}</button>
      </div>
    </form>
  `;

  this.open(modalHtml);
  const form = document.getElementById('form-trade');
  form.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());

  const typeRadios = form.querySelectorAll('input[name="tradeType"]');
  const pill = document.getElementById('trade-balance-pill');
  const submitBtn = document.getElementById('btn-trade-submit');

  typeRadios.forEach(r => {
    r.addEventListener('change', (e) => {
      const mode = e.target.value;
      if (mode === 'buy') {
        pill.innerHTML = `<span>Saldo Disponível na Conta:</span><strong class="text-success">${Utils.formatCurrency(availableBalance)}</strong>`;
        submitBtn.textContent = 'Confirmar Compra';
      } else {
        pill.innerHTML = `<span>Quantidade Disponível para Venda:</span><strong class="text-primary">${availableQty} cotas</strong>`;
        submitBtn.textContent = 'Confirmar Venda';
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = form.querySelector('input[name="tradeType"]:checked').value;
    const qty = parseFloat(document.getElementById('trade-qty').value);
    const unitPrice = parseFloat(document.getElementById('trade-price').value);
    const fees = parseFloat(document.getElementById('trade-fees').value) || 0;
    const date = document.getElementById('trade-date').value || Utils.getTodayString();
    const broker = document.getElementById('trade-broker').value.trim();
    const notes = document.getElementById('trade-notes').value.trim();

    if (isNaN(qty) || qty <= 0) {
      document.getElementById('group-trade-qty').classList.add('has-error');
      return;
    }

    if (type === 'sell' && qty > availableQty) {
      document.getElementById('group-trade-qty').classList.add('has-error');
      Toast.error('Quantidade Inválida', `Você possui apenas ${availableQty} cotas disponíveis para venda.`);
      return;
    }

    if (isNaN(unitPrice) || unitPrice <= 0) {
      document.getElementById('group-trade-price').classList.add('has-error');
      return;
    }

    const totalOperation = qty * unitPrice;
    if (type === 'buy' && (totalOperation + fees) > availableBalance) {
      Toast.error('Saldo Insuficiente', `O valor da compra (${Utils.formatCurrency(totalOperation + fees)}) excede o saldo disponível.`);
      return;
    }

    this.close();
    if (onConfirm) onConfirm({ type, quantity: qty, unitPrice, fees, date, broker, notes });
  });
};

Modal.openDividendModal = function(investment = null, onSave) {
  const investments = Storage.getInvestments();
  const selectedInvId = investment ? investment.id : (investments[0]?.id || '');
  const selectedInv = investments.find(i => i.id === selectedInvId);

  const modalHtml = `
    <div class="modal-header">
      <h3 class="modal-title">Registrar Provento / Rendimento</h3>
      <button class="modal-close-btn" type="button" title="Fechar">${Utils.icons.close}</button>
    </div>
    <form id="form-dividend">
      <div class="modal-body">
        <div class="form-group" id="group-div-inv">
          <label class="form-label" for="div-inv">Ativo Referente <span class="required">*</span></label>
          <select id="div-inv" required>
            ${investments.map(inv => `
              <option value="${inv.id}" ${inv.id === selectedInvId ? 'selected' : ''}>
                ${inv.ticker} - ${Utils.escapeHtml(inv.name)} (${inv.type.toUpperCase()})
              </option>
            `).join('')}
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="div-type">Tipo de Provento</label>
            <select id="div-type">
              <option value="dividend">Dividendo</option>
              <option value="jcp">Juros sobre Capital Próprio (JCP)</option>
              <option value="yield">Rendimento Extraordinário</option>
            </select>
          </div>

          <div class="form-group" id="group-div-amount">
            <label class="form-label" for="div-amount">Valor Recebido (R$) <span class="required">*</span></label>
            <div class="input-with-prefix">
              <span class="input-prefix">R$</span>
              <input type="number" id="div-amount" step="0.01" min="0.01" placeholder="0,00" required autofocus>
            </div>
            <span class="form-error">Informe um valor maior que zero.</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="div-date">Data de Pagamento</label>
            <input type="date" id="div-date" value="${Utils.getTodayString()}" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="div-qty">Cotas na Data-Base (Opcional)</label>
            <input type="number" id="div-qty" placeholder="Ex: 100" value="${selectedInv?.quantity || ''}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="div-notes">Observação</label>
          <input type="text" id="div-notes" placeholder="Ex: Rendimento do mês de Outubro...">
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary modal-cancel-btn">Cancelar</button>
        <button type="submit" class="btn btn-primary">Salvar Provento</button>
      </div>
    </form>
  `;

  this.open(modalHtml);
  const form = document.getElementById('form-dividend');
  form.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const invId = document.getElementById('div-inv').value;
    const inv = investments.find(i => i.id === invId);
    const amount = parseFloat(document.getElementById('div-amount').value);
    const type = document.getElementById('div-type').value;
    const date = document.getElementById('div-date').value || Utils.getTodayString();
    const qtyRef = parseFloat(document.getElementById('div-qty').value) || (inv?.quantity || 0);
    const notes = document.getElementById('div-notes').value.trim();

    if (isNaN(amount) || amount <= 0) {
      document.getElementById('group-div-amount').classList.add('has-error');
      return;
    }

    const payload = {
      id: Utils.generateId(),
      investmentId: invId,
      ticker: inv ? inv.ticker : 'PROVENTO',
      type,
      amount,
      quantityRef: qtyRef,
      date,
      notes
    };

    this.close();
    if (onSave) onSave(payload);
  });
};

Modal.openInvestmentGoalModal = function(goal = null, onSave) {
  const isEdit = Boolean(goal && goal.id);

  const modalHtml = `
    <div class="modal-header">
      <h3 class="modal-title">${isEdit ? 'Editar Meta de Investimento' : 'Nova Meta de Investimento'}</h3>
      <button class="modal-close-btn" type="button" title="Fechar">${Utils.icons.close}</button>
    </div>
    <form id="form-inv-goal">
      <div class="modal-body">
        <div class="form-group" id="group-ig-name">
          <label class="form-label" for="ig-name">Nome do Objetivo <span class="required">*</span></label>
          <input type="text" id="ig-name" placeholder="Ex: R$ 50.000 Investidos, R$ 500 em Dividendos..." value="${Utils.escapeHtml(goal?.name || '')}" required>
          <span class="form-error">Informe o nome do objetivo.</span>
        </div>

        <div class="form-row">
          <div class="form-group" id="group-ig-amount">
            <label class="form-label" for="ig-amount">Valor Alvo (R$) <span class="required">*</span></label>
            <div class="input-with-prefix">
              <span class="input-prefix">R$</span>
              <input type="number" id="ig-amount" step="0.01" min="0.01" placeholder="10000,00" value="${goal?.targetAmount || ''}" required>
            </div>
            <span class="form-error">Informe um valor alvo maior que zero.</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="ig-deadline">Prazo Desejado</label>
            <input type="date" id="ig-deadline" value="${goal?.deadline || ''}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="ig-desc">Descrição / Estratégia</label>
          <textarea id="ig-desc" rows="2" placeholder="Ex: Aportes mensais em FIIs para geração de renda passiva...">${Utils.escapeHtml(goal?.description || '')}</textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary modal-cancel-btn">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Salvar Meta' : 'Criar Meta'}</button>
      </div>
    </form>
  `;

  this.open(modalHtml);
  const form = document.getElementById('form-inv-goal');
  form.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('ig-name').value.trim();
    const amount = parseFloat(document.getElementById('ig-amount').value);
    const deadline = document.getElementById('ig-deadline').value || null;
    const desc = document.getElementById('ig-desc').value.trim();

    if (!name || isNaN(amount) || amount <= 0) {
      document.getElementById('group-ig-name').classList.toggle('has-error', !name);
      document.getElementById('group-ig-amount').classList.toggle('has-error', isNaN(amount) || amount <= 0);
      return;
    }

    const payload = {
      id: isEdit ? goal.id : Utils.generateId(),
      name,
      targetAmount: amount,
      deadline,
      description: desc
    };

    this.close();
    if (onSave) onSave(payload, isEdit);
  });
};


// =========================================================================
// VIEW: INVESTMENTS VIEW (Interface Completa de Investimentos)
// =========================================================================
const InvestmentsView = {
  container: null,
  activeTab: 'dashboard', // dashboard, assets, trades, dividends, goals
  classFilter: 'all',     // all, crypto, fii, stock, fixed
  chartPeriod: 'all',     // 7d, 30d, 6m, 1y, all

  init(containerElement) {
    this.container = containerElement;
    this.render();

    State.subscribe((event) => {
      if (['investments_updated', 'transaction_saved', 'transaction_deleted', 'balance_visibility_changed', 'theme_changed'].includes(event)) {
        if (State.currentView === 'investments') {
          this.render();
        }
      }
    });

    window.addEventListener('resize', () => {
      if (State.currentView === 'investments') {
        this.renderCharts();
      }
    });
  },

  render() {
    if (!this.container) return;

    const investments = Storage.getInvestments();
    const trades = Storage.getInvestmentTransactions();
    const dividends = Storage.getDividends();
    const goals = Storage.getInvestmentGoals();
    const snapshots = Storage.getPortfolioSnapshots();
    const settings = Storage.getSettings();
    const privacyClass = settings.hideBalances ? 'privacy-blurred' : '';

    const invMetrics = State.calculateInvestmentMetrics();
    const mainMetrics = State.calculateMetrics(Storage.getTransactions());

    // Filtrar ativos conforme classFilter
    const filteredInvestments = this.classFilter === 'all'
      ? investments
      : investments.filter(i => i.type === this.classFilter);

    // Identificar Melhores e Piores desempenhos
    const sortedByProfit = [...investments].sort((a, b) => {
      const pA = ((a.currentPrice - a.averagePrice) / (a.averagePrice || 1)) * 100;
      const pB = ((b.currentPrice - b.averagePrice) / (b.averagePrice || 1)) * 100;
      return pB - pA;
    });
    const bestPerformer = sortedByProfit.length > 0 ? sortedByProfit[0] : null;
    const worstPerformer = sortedByProfit.length > 1 ? sortedByProfit[sortedByProfit.length - 1] : null;

    const lastSyncTime = MarketApiService.lastUpdated
      ? Utils.formatDate(Utils.getTodayString()) + ' às ' + new Date(MarketApiService.lastUpdated).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : 'Cotações em tempo real armazenadas';

    this.container.innerHTML = `
      <div class="investments-container">
        <!-- Top bar com saudação e botões de ação -->
        <div class="dashboard-header-bar">
          <div>
            <h2>Investimentos & Carteira de Ativos</h2>
            <p>Gerencie sua carteira em Cripto, FIIs, Ações e Renda Fixa com cotações automáticas e rentabilidade real.</p>
          </div>

          <div style="display: flex; gap: var(--spacing-2); flex-wrap: wrap;">
            <button type="button" class="btn btn-outline btn-sm" id="btn-sync-quotes" title="Atualizar cotações pelas APIs">
              ${Utils.icons.refresh} <span>${MarketApiService.isUpdating ? 'Atualizando...' : 'Atualizar Cotações'}</span>
            </button>
            <button type="button" class="btn btn-outline btn-sm" id="btn-export-investments-csv" title="Exportar carteira para CSV">
              ${Utils.icons.download} Exportar CSV
            </button>
            <button type="button" class="btn btn-primary" id="btn-add-investment">
              ${Utils.icons.plus} Novo Ativo
            </button>
          </div>
        </div>

        <!-- Banner de Status de Cotação de APIs -->
        <div class="inv-api-banner">
          <div>
            <span class="inv-api-status-dot ${MarketApiService.apiStatus === 'online' ? 'online' : 'offline'}"></span>
            <strong>Status das APIs de Mercado:</strong> 
            <span>${MarketApiService.apiStatus === 'online' ? 'Conectado a CoinGecko, Binance e B3' : 'Operando com cache seguro de cotações'}</span>
            <span style="color: var(--text-muted); margin-left: 8px;">(Última atualização: ${lastSyncTime})</span>
          </div>
          <div style="font-size: var(--font-size-xs); color: var(--text-muted);">
            💡 Rentabilidade calculada pelo custo médio contábil ponderado.
          </div>
        </div>

        <!-- 6 Indicadores Principais da Carteira -->
        <div class="inv-kpi-grid">
          <div class="inv-kpi-card">
            <div class="inv-kpi-top">
              <span class="inv-kpi-label">Patrimônio Investido</span>
              <div class="inv-kpi-icon primary">${Utils.icons.wallet}</div>
            </div>
            <div class="inv-kpi-val text-primary ${privacyClass}">
              ${Utils.formatCurrency(invMetrics.totalCurrentValue)}
            </div>
            <div class="inv-kpi-sub">Valor de mercado atual</div>
          </div>

          <div class="inv-kpi-card">
            <div class="inv-kpi-top">
              <span class="inv-kpi-label">Total Aportado</span>
              <div class="inv-kpi-icon purple">${Utils.icons.piggyBank}</div>
            </div>
            <div class="inv-kpi-val ${privacyClass}">
              ${Utils.formatCurrency(invMetrics.totalInvested)}
            </div>
            <div class="inv-kpi-sub">Custo de aquisição</div>
          </div>

          <div class="inv-kpi-card">
            <div class="inv-kpi-top">
              <span class="inv-kpi-label">Lucro / Prejuízo</span>
              <div class="inv-kpi-icon ${invMetrics.unrealizedProfit >= 0 ? 'success' : 'danger'}">
                ${invMetrics.unrealizedProfit >= 0 ? Utils.icons.trendingUp : Utils.icons.trendingDown}
              </div>
            </div>
            <div class="inv-kpi-val ${invMetrics.unrealizedProfit >= 0 ? 'text-success' : 'text-danger'} ${privacyClass}">
              ${invMetrics.unrealizedProfit >= 0 ? '+' : ''} ${Utils.formatCurrency(invMetrics.unrealizedProfit)}
            </div>
            <div class="inv-kpi-sub">Não-realizado da carteira</div>
          </div>

          <div class="inv-kpi-card">
            <div class="inv-kpi-top">
              <span class="inv-kpi-label">Rentabilidade</span>
              <div class="inv-kpi-icon ${invMetrics.profitPercentage >= 0 ? 'success' : 'danger'}">%</div>
            </div>
            <div class="inv-kpi-val ${invMetrics.profitPercentage >= 0 ? 'text-success' : 'text-danger'}">
              ${invMetrics.profitPercentage >= 0 ? '+' : ''}${invMetrics.profitPercentage.toFixed(2)}%
            </div>
            <div class="inv-kpi-sub">Retorno sobre o capital</div>
          </div>

          <div class="inv-kpi-card">
            <div class="inv-kpi-top">
              <span class="inv-kpi-label">Proventos Recebidos</span>
              <div class="inv-kpi-icon success">${Utils.icons.check}</div>
            </div>
            <div class="inv-kpi-val text-success ${privacyClass}">
              + ${Utils.formatCurrency(invMetrics.totalDividends)}
            </div>
            <div class="inv-kpi-sub">Dividendos e rendimentos</div>
          </div>

          <div class="inv-kpi-card">
            <div class="inv-kpi-top">
              <span class="inv-kpi-label">Ativos em Carteira</span>
              <div class="inv-kpi-icon primary">${Utils.icons.target}</div>
            </div>
            <div class="inv-kpi-val text-primary">
              ${invMetrics.totalAssets} ${invMetrics.totalAssets === 1 ? 'ativo' : 'ativos'}
            </div>
            <div class="inv-kpi-sub">Em 4 classes monitoradas</div>
          </div>
        </div>

        <!-- Abas de Navegação Interna -->
        <div class="inv-nav-tabs">
          <button type="button" class="inv-tab-btn ${this.activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">📊 Visão Geral & Gráficos</button>
          <button type="button" class="inv-tab-btn ${this.activeTab === 'assets' ? 'active' : ''}" data-tab="assets">📑 Meus Ativos (${investments.length})</button>
          <button type="button" class="inv-tab-btn ${this.activeTab === 'trades' ? 'active' : ''}" data-tab="trades">🔄 Compras e Vendas (${trades.length})</button>
          <button type="button" class="inv-tab-btn ${this.activeTab === 'dividends' ? 'active' : ''}" data-tab="dividends">💰 Proventos (${dividends.length})</button>
          <button type="button" class="inv-tab-btn ${this.activeTab === 'goals' ? 'active' : ''}" data-tab="goals">🎯 Metas (${goals.length})</button>
        </div>

        <!-- CONTEÚDO DA ABA SELECIONADA -->
        ${this.renderTabContent(investments, trades, dividends, goals, snapshots, invMetrics, filteredInvestments, bestPerformer, worstPerformer, privacyClass)}
      </div>
    `;

    this.bindEvents();
    this.renderCharts(investments, snapshots);
  },

  renderTabContent(investments, trades, dividends, goals, snapshots, invMetrics, filteredInvestments, bestPerformer, worstPerformer, privacyClass) {
    if (investments.length === 0 && this.activeTab !== 'goals') {
      return `
        <div class="card empty-state" style="margin-top: var(--spacing-4);">
          <div class="empty-state-icon">${Utils.icons.trendingUp}</div>
          <h4 class="empty-state-title">Sua carteira de investimentos está vazia</h4>
          <p class="empty-state-text">
            Comece cadastrando suas criptomoedas (BTC, ETH), fundos imobiliários (MXRF11, HGLG11), ações da B3 ou títulos de renda fixa (CDB, Tesouro Selic).
          </p>
          <button type="button" class="btn btn-primary" id="btn-empty-add-inv">
            ${Utils.icons.plus} Adicionar Primeiro Investimento
          </button>
        </div>
      `;
    }

    if (this.activeTab === 'dashboard') {
      return this.renderDashboardTab(investments, trades, dividends, invMetrics, bestPerformer, worstPerformer, privacyClass);
    } else if (this.activeTab === 'assets') {
      return this.renderAssetsTab(filteredInvestments, privacyClass);
    } else if (this.activeTab === 'trades') {
      return this.renderTradesTab(trades, investments, privacyClass);
    } else if (this.activeTab === 'dividends') {
      return this.renderDividendsTab(dividends, investments, privacyClass);
    } else if (this.activeTab === 'goals') {
      return this.renderGoalsTab(goals, invMetrics, privacyClass);
    }
    return '';
  },

  renderDashboardTab(investments, trades, dividends, invMetrics, bestPerformer, worstPerformer, privacyClass) {
    return `
      <!-- Gráfico de Evolução Patrimonial -->
      <div class="card" style="margin-bottom: var(--spacing-5);">
        <div class="card-header" style="flex-wrap: wrap; gap: var(--spacing-3);">
          <div>
            <h3 class="card-title">Evolução do Patrimônio Investido</h3>
            <span style="font-size: var(--font-size-xs); color: var(--text-muted);">Acompanhamento real com histórico de aportes e valorização</span>
          </div>
          <div class="inv-chart-controls">
            <button type="button" class="inv-chart-filter-btn ${this.chartPeriod === '7d' ? 'active' : ''}" data-period="7d">7 Dias</button>
            <button type="button" class="inv-chart-filter-btn ${this.chartPeriod === '30d' ? 'active' : ''}" data-period="30d">30 Dias</button>
            <button type="button" class="inv-chart-filter-btn ${this.chartPeriod === '6m' ? 'active' : ''}" data-period="6m">6 Meses</button>
            <button type="button" class="inv-chart-filter-btn ${this.chartPeriod === '1y' ? 'active' : ''}" data-period="1y">1 Ano</button>
            <button type="button" class="inv-chart-filter-btn ${this.chartPeriod === 'all' ? 'active' : ''}" data-period="all">Tudo</button>
          </div>
        </div>
        <div class="card-body">
          <div class="chart-container" style="height: 280px;">
            <canvas id="chart-inv-evolution"></canvas>
          </div>
        </div>
      </div>

      <!-- 2 Gráficos de Distribuição da Carteira -->
      <div class="dashboard-charts-grid" style="margin-bottom: var(--spacing-5);">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Distribuição por Classe de Ativos</h3>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="chart-inv-classes"></canvas>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Distribuição por Ativo Individual</h3>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="chart-inv-assets"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Melhores / Piores Desempenhos & Últimas Movimentações -->
      <div class="dashboard-bottom-grid">
        <!-- Destaques de Rentabilidade -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Destaques da Carteira</h3>
            <span style="font-size: var(--font-size-xs); color: var(--text-muted);">Maior e menor rentabilidade percentual</span>
          </div>
          <div class="card-body">
            <div style="display: flex; flex-direction: column; gap: var(--spacing-4);">
              ${bestPerformer ? `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--spacing-3); background: rgba(16, 185, 129, 0.08); border-radius: var(--radius-lg); border-left: 4px solid #10b981;">
                  <div>
                    <span style="font-size: var(--font-size-xs); color: #10b981; font-weight: 700;">🚀 MELHOR DESEMPENHO</span>
                    <div style="font-weight: 700; font-size: var(--font-size-md); color: var(--text-primary); margin-top: 2px;">
                      ${bestPerformer.ticker} - ${Utils.escapeHtml(bestPerformer.name)}
                    </div>
                    <div style="font-size: var(--font-size-xs); color: var(--text-muted);">
                      Preço Médio: ${Utils.formatCurrency(bestPerformer.averagePrice)} | Atual: ${Utils.formatCurrency(bestPerformer.currentPrice)}
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div class="text-success font-bold" style="font-size: 1.2rem;">
                      +${(((bestPerformer.currentPrice - bestPerformer.averagePrice) / (bestPerformer.averagePrice || 1)) * 100).toFixed(2)}%
                    </div>
                    <div style="font-size: var(--font-size-xs); color: var(--text-muted);" class="${privacyClass}">
                      + ${Utils.formatCurrency((bestPerformer.currentPrice - bestPerformer.averagePrice) * bestPerformer.quantity)}
                    </div>
                  </div>
                </div>
              ` : ''}

              ${worstPerformer && worstPerformer.id !== bestPerformer?.id ? `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--spacing-3); background: rgba(239, 68, 68, 0.08); border-radius: var(--radius-lg); border-left: 4px solid #ef4444;">
                  <div>
                    <span style="font-size: var(--font-size-xs); color: #ef4444; font-weight: 700;">⚠️ MENOR DESEMPENHO</span>
                    <div style="font-weight: 700; font-size: var(--font-size-md); color: var(--text-primary); margin-top: 2px;">
                      ${worstPerformer.ticker} - ${Utils.escapeHtml(worstPerformer.name)}
                    </div>
                    <div style="font-size: var(--font-size-xs); color: var(--text-muted);">
                      Preço Médio: ${Utils.formatCurrency(worstPerformer.averagePrice)} | Atual: ${Utils.formatCurrency(worstPerformer.currentPrice)}
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div class="text-danger font-bold" style="font-size: 1.2rem;">
                      ${(((worstPerformer.currentPrice - worstPerformer.averagePrice) / (worstPerformer.averagePrice || 1)) * 100).toFixed(2)}%
                    </div>
                    <div style="font-size: var(--font-size-xs); color: var(--text-muted);" class="${privacyClass}">
                      ${Utils.formatCurrency((worstPerformer.currentPrice - worstPerformer.averagePrice) * worstPerformer.quantity)}
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Últimos Dividendos & Proventos -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Últimos Proventos Recebidos</h3>
            <button type="button" class="btn btn-outline btn-sm btn-quick-dividend">+ Adicionar Provento</button>
          </div>
          <div class="card-body">
            ${dividends.length === 0 ? `
              <p class="text-muted" style="font-size: var(--font-size-sm); text-align: center; padding: var(--spacing-4);">Nenhum dividendo registrado ainda.</p>
            ` : `
              <div style="display: flex; flex-direction: column; gap: var(--spacing-2);">
                ${dividends.slice(0, 4).map(d => `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--spacing-2) 0; border-bottom: 1px solid var(--border-color-subtle);">
                    <div>
                      <strong style="color: var(--text-primary); font-size: var(--font-size-sm);">${d.ticker}</strong>
                      <span class="badge" style="font-size: 0.65rem; margin-left: 6px;">${d.type === 'dividend' ? 'Dividendo' : d.type === 'jcp' ? 'JCP' : 'Rendimento'}</span>
                      <div style="font-size: var(--font-size-xs); color: var(--text-muted);">${Utils.formatDate(d.date)}</div>
                    </div>
                    <div class="text-success font-bold ${privacyClass}">
                      + ${Utils.formatCurrency(d.amount)}
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  },

  renderAssetsTab(investments, privacyClass) {
    return `
      <!-- Filtros por Classe de Ativos -->
      <div class="inv-class-pills">
        <button type="button" class="inv-class-pill ${this.classFilter === 'all' ? 'active' : ''}" data-class="all">Todos os Ativos</button>
        <button type="button" class="inv-class-pill ${this.classFilter === 'crypto' ? 'active' : ''}" data-class="crypto">🪙 Criptomoedas</button>
        <button type="button" class="inv-class-pill ${this.classFilter === 'fii' ? 'active' : ''}" data-class="fii">🏢 FIIs</button>
        <button type="button" class="inv-class-pill ${this.classFilter === 'stock' ? 'active' : ''}" data-class="stock">📈 Ações</button>
        <button type="button" class="inv-class-pill ${this.classFilter === 'fixed' ? 'active' : ''}" data-class="fixed">🏛️ Renda Fixa</button>
      </div>

      <!-- Tabela de Posições -->
      <div class="inv-table-wrap">
        <table class="inv-table">
          <thead>
            <tr>
              <th>Ativo / Código</th>
              <th>Classe</th>
              <th>Quantidade</th>
              <th>Preço Médio</th>
              <th>Cotação Atual</th>
              <th>Total Investido</th>
              <th>Posição Atual</th>
              <th>Resultado</th>
              <th style="text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${investments.map(inv => {
              const currentVal = inv.quantity * (inv.currentPrice || inv.averagePrice);
              const costVal = inv.quantity * inv.averagePrice;
              const profit = currentVal - costVal;
              const profitPct = costVal > 0 ? (profit / costVal) * 100 : 0;
              const isPositive = profit >= 0;

              return `
                <tr data-id="${inv.id}">
                  <td>
                    <div class="inv-asset-cell">
                      <div class="inv-asset-icon">
                        ${inv.type === 'crypto' ? '🪙' : inv.type === 'fii' ? '🏢' : inv.type === 'stock' ? '📈' : '🏛️'}
                      </div>
                      <div>
                        <strong>${inv.ticker}</strong>
                        <div style="font-size: var(--font-size-xs); color: var(--text-muted);">${Utils.escapeHtml(inv.name)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="inv-badge-class ${inv.type}">${inv.type}</span>
                  </td>
                  <td class="font-medium">
                    ${inv.quantity} ${inv.type === 'crypto' ? inv.ticker : 'cotas'}
                  </td>
                  <td class="text-secondary ${privacyClass}">
                    ${Utils.formatCurrency(inv.averagePrice)}
                  </td>
                  <td class="font-medium ${privacyClass}">
                    ${Utils.formatCurrency(inv.currentPrice || inv.averagePrice)}
                  </td>
                  <td class="text-secondary ${privacyClass}">
                    ${Utils.formatCurrency(costVal)}
                  </td>
                  <td class="font-bold text-primary ${privacyClass}">
                    ${Utils.formatCurrency(currentVal)}
                  </td>
                  <td>
                    <span class="${isPositive ? 'text-success' : 'text-danger'} font-bold ${privacyClass}">
                      ${isPositive ? '+' : ''}${Utils.formatCurrency(profit)}
                    </span>
                    <div style="font-size: 0.72rem;" class="${isPositive ? 'text-success' : 'text-danger'}">
                      (${isPositive ? '+' : ''}${profitPct.toFixed(2)}%)
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: flex; gap: 4px; justify-content: flex-end;">
                      <button type="button" class="btn btn-sm btn-outline btn-trade-inv" data-id="${inv.id}" data-action="buy" title="Comprar mais">+ Comprar</button>
                      <button type="button" class="btn btn-sm btn-outline btn-trade-inv" data-id="${inv.id}" data-action="sell" title="Vender posição">- Vender</button>
                      <button type="button" class="action-btn edit-btn btn-edit-inv" data-id="${inv.id}" title="Editar Ativo">${Utils.icons.edit}</button>
                      <button type="button" class="action-btn delete-btn btn-delete-inv" data-id="${inv.id}" title="Excluir Ativo">${Utils.icons.trash}</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  renderTradesTab(trades, investments, privacyClass) {
    const invMap = new Map(investments.map(i => [i.id, i]));

    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Histórico de Compras e Vendas</h3>
          <span style="font-size: var(--font-size-xs); color: var(--text-muted);">${trades.length} operações registradas</span>
        </div>
        <div class="card-body" style="padding: 0;">
          <div class="inv-table-wrap" style="border: none;">
            <table class="inv-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Operação</th>
                  <th>Ativo</th>
                  <th>Quantidade</th>
                  <th>Preço Unitário</th>
                  <th>Taxas</th>
                  <th>Total Líquido</th>
                  <th>Corretora</th>
                  <th>Observações</th>
                  <th style="text-align: right;">Ação</th>
                </tr>
              </thead>
              <tbody>
                ${trades.length === 0 ? `
                  <tr><td colspan="10" style="text-align: center; padding: var(--spacing-6); color: var(--text-muted);">Nenhuma negociação realizada ainda.</td></tr>
                ` : trades.map(t => {
                  const inv = invMap.get(t.investmentId);
                  const isBuy = t.type === 'buy';
                  return `
                    <tr>
                      <td>${Utils.formatDate(t.date)}</td>
                      <td>
                        <span class="badge ${isBuy ? 'badge-income' : 'badge-expense'}">
                          ${isBuy ? 'COMPRA' : 'VENDA'}
                        </span>
                      </td>
                      <td><strong>${inv?.ticker || 'ATIVO'}</strong></td>
                      <td>${t.quantity}</td>
                      <td class="${privacyClass}">${Utils.formatCurrency(t.unitPrice)}</td>
                      <td class="${privacyClass}">${Utils.formatCurrency(t.fees || 0)}</td>
                      <td class="font-bold ${isBuy ? 'text-danger' : 'text-success'} ${privacyClass}">
                        ${isBuy ? '-' : '+'} ${Utils.formatCurrency(t.totalAmount)}
                      </td>
                      <td>${Utils.escapeHtml(t.broker || '-')}</td>
                      <td style="font-size: var(--font-size-xs); color: var(--text-muted);">${Utils.escapeHtml(t.notes || '-')}</td>
                      <td style="text-align: right;">
                        <button type="button" class="action-btn delete-btn btn-delete-trade" data-id="${t.id}" title="Excluir Registro">${Utils.icons.trash}</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  renderDividendsTab(dividends, investments, privacyClass) {
    const totalDiv = dividends.reduce((s, d) => s + (Number(d.amount) || 0), 0);

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-4);">
        <div>
          <h3 style="margin: 0; font-size: var(--font-size-lg);">Proventos e Rendimentos Recebidos</h3>
          <p style="margin: 0; font-size: var(--font-size-xs); color: var(--text-muted);">Histórico detalhado de dividendos, JCP e aluguéis de FIIs</p>
        </div>
        <button type="button" class="btn btn-primary btn-sm btn-quick-dividend">
          ${Utils.icons.plus} Registrar Provento
        </button>
      </div>

      <div class="inv-table-wrap">
        <table class="inv-table">
          <thead>
            <tr>
              <th>Data de Pagamento</th>
              <th>Código / Ticker</th>
              <th>Tipo</th>
              <th>Cotas na Base</th>
              <th>Valor Total Recebido</th>
              <th>Observação</th>
              <th style="text-align: right;">Ação</th>
            </tr>
          </thead>
          <tbody>
            ${dividends.length === 0 ? `
              <tr><td colspan="7" style="text-align: center; padding: var(--spacing-6); color: var(--text-muted);">Nenhum provento cadastrado ainda.</td></tr>
            ` : dividends.map(d => `
              <tr>
                <td>${Utils.formatDate(d.date)}</td>
                <td><strong>${d.ticker}</strong></td>
                <td>
                  <span class="badge badge-category">${d.type === 'dividend' ? 'Dividendo' : d.type === 'jcp' ? 'JCP' : 'Rendimento'}</span>
                </td>
                <td>${d.quantityRef || '-'}</td>
                <td class="font-bold text-success ${privacyClass}">
                  + ${Utils.formatCurrency(d.amount)}
                </td>
                <td style="font-size: var(--font-size-xs); color: var(--text-muted);">${Utils.escapeHtml(d.notes || '-')}</td>
                <td style="text-align: right;">
                  <button type="button" class="action-btn delete-btn btn-delete-dividend" data-id="${d.id}" title="Excluir">${Utils.icons.trash}</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  renderGoalsTab(goals, invMetrics, privacyClass) {
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-4);">
        <div>
          <h3 style="margin: 0; font-size: var(--font-size-lg);">Metas de Investimento e Renda Passiva</h3>
          <p style="margin: 0; font-size: var(--font-size-xs); color: var(--text-muted);">Acompanhe objetivos de patrimônio investido ou fluxo de dividendos</p>
        </div>
        <button type="button" class="btn btn-primary btn-sm" id="btn-add-inv-goal">
          ${Utils.icons.plus} Nova Meta
        </button>
      </div>

      <div class="inv-goals-grid">
        ${goals.map(g => {
          const currentVal = invMetrics.totalCurrentValue;
          const target = Number(g.targetAmount) || 1;
          const pct = Math.min(100, Math.round((currentVal / target) * 100));
          const isCompleted = currentVal >= target;

          return `
            <div class="inv-goal-card">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <h4 style="margin: 0; font-size: var(--font-size-base);">${Utils.escapeHtml(g.name)}</h4>
                  <div style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 2px;">
                    ${g.deadline ? '📅 Prazo: ' + Utils.formatDate(g.deadline) : 'Sem data limite'}
                  </div>
                </div>
                <button type="button" class="action-btn delete-btn btn-delete-inv-goal" data-id="${g.id}" title="Excluir">${Utils.icons.trash}</button>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <div>
                  <span style="font-size: var(--font-size-xs); color: var(--text-muted);">Atual</span>
                  <div class="font-bold text-primary ${privacyClass}">${Utils.formatCurrency(currentVal)}</div>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: var(--font-size-xs); color: var(--text-muted);">Alvo</span>
                  <div class="font-bold ${privacyClass}">${Utils.formatCurrency(target)}</div>
                </div>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: var(--font-size-xs); margin-bottom: 4px;">
                  <span class="font-bold text-success">${pct}% Concluído</span>
                  <span>${isCompleted ? '🎉 Meta Atingida!' : `Faltam ${Utils.formatCurrency(Math.max(0, target - currentVal))}`}</span>
                </div>
                <div class="inv-goal-progress-track">
                  <div class="inv-goal-progress-fill" style="width: ${pct}%;"></div>
                </div>
              </div>

              ${g.description ? `
                <div style="font-size: var(--font-size-xs); color: var(--text-muted); border-top: 1px solid var(--border-color-subtle); padding-top: var(--spacing-2);">
                  ${Utils.escapeHtml(g.description)}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  bindEvents() {
    // Tabs click
    this.container.querySelectorAll('.inv-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.getAttribute('data-tab');
        this.render();
      });
    });

    // Class pills click
    this.container.querySelectorAll('.inv-class-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        this.classFilter = btn.getAttribute('data-class');
        this.render();
      });
    });

    // Period chart filter
    this.container.querySelectorAll('.inv-chart-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.chartPeriod = btn.getAttribute('data-period');
        this.render();
      });
    });

    // Sync button
    const syncBtn = this.container.querySelector('#btn-sync-quotes');
    if (syncBtn) {
      syncBtn.addEventListener('click', async () => {
        Toast.info('Consultando Cotações...', 'Buscando preços em tempo real via APIs de mercado...');
        await MarketApiService.updateAllQuotes();
        Toast.success('Cotações Atualizadas!', 'Valores de mercado e rentabilidades recalculados.');
        this.render();
      });
    }

    // Export CSV
    const exportBtn = this.container.querySelector('#btn-export-investments-csv');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => Storage.exportInvestmentsToCsv());
    }

    // Add Investment
    const addBtn = this.container.querySelector('#btn-add-investment');
    const emptyAddBtn = this.container.querySelector('#btn-empty-add-inv');
    const handleAdd = () => {
      Modal.openInvestmentModal(null, (newInv) => {
        try {
          Storage.saveInvestment(newInv);
          Toast.success('Ativo Cadastrado!', `${newInv.ticker} foi adicionado à sua carteira.`);
          State.notify('investments_updated');
        } catch (err) {
          Toast.error('Erro ao Cadastrar', err.message);
        }
      });
    };
    if (addBtn) addBtn.addEventListener('click', handleAdd);
    if (emptyAddBtn) emptyAddBtn.addEventListener('click', handleAdd);

    // Edit Investment
    this.container.querySelectorAll('.btn-edit-inv').forEach(btn => {
      btn.addEventListener('click', () => {
        const inv = Storage.getInvestmentById(btn.getAttribute('data-id'));
        if (inv) {
          Modal.openInvestmentModal(inv, (updated) => {
            Storage.updateInvestment(updated);
            Toast.success('Ativo Atualizado!', `Informações de ${updated.ticker} salvas com sucesso.`);
            State.notify('investments_updated');
          });
        }
      });
    });

    // Delete Investment
    this.container.querySelectorAll('.btn-delete-inv').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const inv = Storage.getInvestmentById(id);
        if (!inv) return;

        Modal.openConfirmModal({
          title: 'Excluir Ativo da Carteira?',
          message: `Deseja realmente remover a posição de <strong>${inv.ticker} - ${Utils.escapeHtml(inv.name)}</strong>?<br><br>As compras, vendas e proventos vinculados serão removidos do histórico.`,
          confirmText: 'Sim, Excluir',
          isDanger: true,
          onConfirm: () => {
            Storage.deleteInvestment(id);
            Toast.success('Ativo Removido', `${inv.ticker} foi excluído da carteira.`);
            State.notify('investments_updated');
          }
        });
      });
    });

    // Trade (Buy / Sell)
    this.container.querySelectorAll('.btn-trade-inv').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-action');
        const inv = Storage.getInvestmentById(id);
        if (!inv) return;

        Modal.openTradeModal(inv, action, (tradeData) => {
          try {
            Storage.executeInvestmentTrade(id, tradeData);
            Toast.success(tradeData.type === 'buy' ? 'Compra Executada!' : 'Venda Executada!', `Operação em ${inv.ticker} registrada.`);
            State.notify('investments_updated');
          } catch (err) {
            Toast.error('Erro na Operação', err.message);
          }
        });
      });
    });

    // Quick Dividend button
    this.container.querySelectorAll('.btn-quick-dividend').forEach(btn => {
      btn.addEventListener('click', () => {
        Modal.openDividendModal(null, (divData) => {
          Storage.saveDividend(divData);
          Toast.success('Provento Registrado!', `Rendimento de ${Utils.formatCurrency(divData.amount)} adicionado com sucesso.`);
          State.notify('investments_updated');
        });
      });
    });

    // Delete Dividend
    this.container.querySelectorAll('.btn-delete-dividend').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        Modal.openConfirmModal({
          title: 'Excluir Provento?',
          message: 'Deseja remover este provento registrado?',
          confirmText: 'Excluir',
          isDanger: true,
          onConfirm: () => {
            Storage.deleteDividend(id);
            Toast.success('Provento Removido', 'Registro excluído.');
            State.notify('investments_updated');
          }
        });
      });
    });

    // Delete Trade
    this.container.querySelectorAll('.btn-delete-trade').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        Modal.openConfirmModal({
          title: 'Excluir Registro de Negociação?',
          message: 'Deseja apagar este registro do histórico de compras e vendas?',
          confirmText: 'Excluir',
          isDanger: true,
          onConfirm: () => {
            Storage.deleteInvestmentTransaction(id);
            Toast.success('Registro Removido', 'Operação apagada.');
            State.notify('investments_updated');
          }
        });
      });
    });

    // Add Goal
    const addGoalBtn = this.container.querySelector('#btn-add-inv-goal');
    if (addGoalBtn) {
      addGoalBtn.addEventListener('click', () => {
        Modal.openInvestmentGoalModal(null, (newGoal) => {
          Storage.saveInvestmentGoal(newGoal);
          Toast.success('Meta Criada!', `Objetivo "${newGoal.name}" cadastrado com sucesso.`);
          State.notify('investments_updated');
        });
      });
    }

    // Delete Goal
    this.container.querySelectorAll('.btn-delete-inv-goal').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        Modal.openConfirmModal({
          title: 'Excluir Meta?',
          message: 'Deseja remover esta meta de investimento?',
          confirmText: 'Excluir',
          isDanger: true,
          onConfirm: () => {
            Storage.deleteInvestmentGoal(id);
            Toast.success('Meta Excluída', 'Objetivo removido.');
            State.notify('investments_updated');
          }
        });
      });
    });
  },

  renderCharts(investments = null, snapshots = null) {
    if (this.activeTab !== 'dashboard') return;

    if (!investments) investments = Storage.getInvestments();
    if (!snapshots) snapshots = Storage.getPortfolioSnapshots();

    // 1. Gráfico de Linha: Evolução Patrimonial
    const lineCanvas = document.getElementById('chart-inv-evolution');
    if (lineCanvas) {
      let filteredSnapshots = [...snapshots];
      const now = Date.now();

      if (this.chartPeriod === '7d') {
        const cutoff = now - 7 * 24 * 3600 * 1000;
        filteredSnapshots = filteredSnapshots.filter(s => new Date(s.date).getTime() >= cutoff);
      } else if (this.chartPeriod === '30d') {
        const cutoff = now - 30 * 24 * 3600 * 1000;
        filteredSnapshots = filteredSnapshots.filter(s => new Date(s.date).getTime() >= cutoff);
      } else if (this.chartPeriod === '6m') {
        const cutoff = now - 180 * 24 * 3600 * 1000;
        filteredSnapshots = filteredSnapshots.filter(s => new Date(s.date).getTime() >= cutoff);
      } else if (this.chartPeriod === '1y') {
        const cutoff = now - 365 * 24 * 3600 * 1000;
        filteredSnapshots = filteredSnapshots.filter(s => new Date(s.date).getTime() >= cutoff);
      }

      if (filteredSnapshots.length === 0) {
        filteredSnapshots = [{ date: Utils.getTodayString(), value: Storage.getTotalInInvestments() }];
      }

      Charts.renderLineChart(lineCanvas, filteredSnapshots);
    }

    // 2. Gráfico Donut: Distribuição por Classe
    const classCanvas = document.getElementById('chart-inv-classes');
    if (classCanvas) {
      const classTotals = { crypto: 0, fii: 0, stock: 0, fixed: 0 };
      investments.forEach(inv => {
        const val = inv.quantity * (inv.currentPrice || inv.averagePrice);
        if (classTotals[inv.type] !== undefined) classTotals[inv.type] += val;
      });

      const totalVal = Object.values(classTotals).reduce((a, b) => a + b, 0);
      const classItems = [
        { name: 'Criptomoedas', icon: '🪙', color: '#f59e0b', amount: classTotals.crypto, percentage: totalVal > 0 ? Math.round((classTotals.crypto / totalVal) * 1000) / 10 : 0 },
        { name: 'FIIs', icon: '🏢', color: '#10b981', amount: classTotals.fii, percentage: totalVal > 0 ? Math.round((classTotals.fii / totalVal) * 1000) / 10 : 0 },
        { name: 'Ações B3', icon: '📈', color: '#3b82f6', amount: classTotals.stock, percentage: totalVal > 0 ? Math.round((classTotals.stock / totalVal) * 1000) / 10 : 0 },
        { name: 'Renda Fixa', icon: '🏛️', color: '#8b5cf6', amount: classTotals.fixed, percentage: totalVal > 0 ? Math.round((classTotals.fixed / totalVal) * 1000) / 10 : 0 }
      ].filter(i => i.amount > 0);

      Charts.renderDonutChart(classCanvas, classItems, totalVal);
    }

    // 3. Gráfico Donut: Distribuição por Ativo Individual
    const assetCanvas = document.getElementById('chart-inv-assets');
    if (assetCanvas) {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1', '#64748b'];
      const totalVal = investments.reduce((s, i) => s + (i.quantity * (i.currentPrice || i.averagePrice)), 0);

      const assetItems = investments.map((inv, idx) => {
        const val = inv.quantity * (inv.currentPrice || inv.averagePrice);
        return {
          name: inv.ticker,
          icon: inv.type === 'crypto' ? '🪙' : inv.type === 'fii' ? '🏢' : inv.type === 'stock' ? '📈' : '🏛️',
          color: colors[idx % colors.length],
          amount: val,
          percentage: totalVal > 0 ? Math.round((val / totalVal) * 1000) / 10 : 0
        };
      }).sort((a, b) => b.amount - a.amount);

      Charts.renderDonutChart(assetCanvas, assetItems, totalVal);
    }
  }
};
