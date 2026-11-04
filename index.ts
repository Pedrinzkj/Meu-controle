import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control, pragma",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "Pragma": "no-cache"
};

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const MONTH_SHORT_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

function r2(n: number): number {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function formatBRL(value: number): string {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

function formatDateBR(dateStr: string): string {
  if (!dateStr) return "";
  const parts = String(dateStr).slice(0, 10).split("-");
  if (parts.length !== 3) return String(dateStr);
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function parseTargetAmountFromQuestion(question: string, defaultVal: number): number {
  const q = String(question || "");
  const milMatch = q.match(/(?:r\$\s*)?(\d+(?:[.,]\d+)?)\s*mil\b/i);
  if (milMatch) {
    const base = parseFloat(milMatch[1].replace(",", "."));
    if (Number.isFinite(base) && base > 0) return r2(base * 1000);
  }
  const currencyMatch = q.match(/r\$\s*([\d.]+(?:,\d{1,2})?)/i);
  if (currencyMatch) {
    const cleaned = currencyMatch[1].replace(/\./g, "").replace(",", ".");
    const val = parseFloat(cleaned);
    if (Number.isFinite(val) && val > 0) return r2(val);
  }
  const numbers = q.match(/\b(\d{1,3}(?:\.\d{3})+|\d{2,7})(?:,\d{1,2})?\b/g);
  if (numbers && numbers.length > 0) {
    for (const raw of numbers) {
      const cleaned = raw.replace(/\./g, "").replace(",", ".");
      const val = parseFloat(cleaned);
      if (Number.isFinite(val) && val > 0 && ![2024, 2025, 2026, 2027, 2028].includes(val)) {
        return r2(val);
      }
    }
  }
  return defaultVal;
}

/**
 * Recalcula todos os indicadores financeiros em tempo real diretamente a partir das
 * tabelas do usuário autenticado no Supabase Database (PostgreSQL com RLS).
 */
function computeRealtimeContextFromSupabase(params: {
  categoriesRows: any[];
  transactionsRows: any[];
  caixinhasRows: any[];
  investmentsRows: any[];
  dividendsRows: any[];
  goalsRows: any[];
  month: number | "all";
  year: number;
  daysRemainingInMonth: number;
}) {
  const {
    categoriesRows,
    transactionsRows,
    caixinhasRows,
    investmentsRows,
    dividendsRows,
    goalsRows,
    month,
    year,
    daysRemainingInMonth
  } = params;

  const isAllMonths = month === "all";
  const monthNum = isAllMonths ? null : Number(month);
  const selYear = Number(year) || new Date().getFullYear();

  const catMap = new Map<string, any>();
  for (const r of categoriesRows || []) {
    if (!r || !r.id) continue;
    catMap.set(String(r.id), {
      id: String(r.id),
      name: String(r.name || "Outros"),
      type: r.type === "income" ? "income" : "expense",
      icon: r.icon || "🏷️",
      color: r.color || "#3b82f6"
    });
  }

  const seenTxIds = new Set<string>();
  const allTransactions: any[] = [];
  for (const r of transactionsRows || []) {
    if (!r || !r.date) continue;
    const txId = String(r.id || `${r.date}_${r.type}_${r.amount}_${r.description}`);
    if (seenTxIds.has(txId)) continue;
    seenTxIds.add(txId);
    const amt = Math.abs(Number(r.amount) || 0);
    if (amt <= 0) continue;
    const catId = String(r.category_id || r.categoryId || "unknown");
    const catObj = catMap.get(catId) || { id: catId, name: "Outros", icon: "🏷️", color: "#64748b" };
    allTransactions.push({
      id: txId,
      description: String(r.description || "").trim(),
      amount: r2(amt),
      type: r.type === "income" ? "income" : "expense",
      categoryId: catId,
      categoryName: catObj.name,
      categoryIcon: catObj.icon,
      date: String(r.date).slice(0, 10),
      notes: String(r.notes || "")
    });
  }

  let totalHistoricalIncome = 0;
  let totalHistoricalExpense = 0;
  const monthsMap = new Map<string, any>();

  for (const tx of allTransactions) {
    if (tx.type === "income") totalHistoricalIncome = r2(totalHistoricalIncome + tx.amount);
    else totalHistoricalExpense = r2(totalHistoricalExpense + tx.amount);

    const parts = String(tx.date).split("-");
    if (parts.length < 2) continue;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!y || !m || m < 1 || m > 12) continue;
    const key = `${y}-${String(m).padStart(2, "0")}`;
    if (!monthsMap.has(key)) {
      monthsMap.set(key, {
        key,
        year: y,
        month: m,
        label: `${MONTH_SHORT_NAMES[m - 1]}/${String(y).slice(-2)}`,
        fullLabel: `${MONTH_NAMES[m - 1]} de ${y}`,
        income: 0,
        expense: 0,
        txCount: 0
      });
    }
    const bucket = monthsMap.get(key);
    if (tx.type === "income") bucket.income = r2(bucket.income + tx.amount);
    else bucket.expense = r2(bucket.expense + tx.amount);
    bucket.txCount += 1;
  }

  const activeMonths = Array.from(monthsMap.values())
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((m) => ({
      ...m,
      savings: r2(m.income - m.expense)
    }));
  const activeMonthsCount = activeMonths.length;

  const periodTransactions = allTransactions.filter((tx) => {
    const [tY, tM] = String(tx.date).split("-").map((n) => parseInt(n, 10));
    if (tY !== selYear) return false;
    if (!isAllMonths && tM !== monthNum) return false;
    return true;
  });

  let prevMonth: number | null = null;
  let prevYear: number = selYear - 1;
  let prevPeriodLabel = `Ano de ${prevYear}`;
  let prevPeriodTransactions: any[] = [];

  if (!isAllMonths && monthNum) {
    prevMonth = monthNum === 1 ? 12 : monthNum - 1;
    prevYear = monthNum === 1 ? selYear - 1 : selYear;
    prevPeriodLabel = `${MONTH_NAMES[prevMonth - 1]} de ${prevYear}`;
    prevPeriodTransactions = allTransactions.filter((tx) => {
      const [tY, tM] = String(tx.date).split("-").map((n) => parseInt(n, 10));
      return tY === prevYear && tM === prevMonth;
    });
  } else {
    prevPeriodTransactions = allTransactions.filter((tx) => {
      const [tY] = String(tx.date).split("-").map((n) => parseInt(n, 10));
      return tY === prevYear;
    });
  }

  let income = 0;
  let expense = 0;
  let incomeCount = 0;
  let expenseCount = 0;
  for (const tx of periodTransactions) {
    if (tx.type === "income") {
      income = r2(income + tx.amount);
      incomeCount++;
    } else {
      expense = r2(expense + tx.amount);
      expenseCount++;
    }
  }

  let prevIncome = 0;
  let prevExpense = 0;
  for (const tx of prevPeriodTransactions) {
    if (tx.type === "income") prevIncome = r2(prevIncome + tx.amount);
    else prevExpense = r2(prevExpense + tx.amount);
  }

  const hasPeriodData = periodTransactions.length > 0 && (income > 0 || expense > 0);
  const hasPreviousMonthData = prevPeriodTransactions.length > 0 && (prevIncome > 0 || prevExpense > 0);

  const monthlySavings = r2(income - expense);
  const savingsRatePct = income > 0 ? Math.round((monthlySavings / income) * 1000) / 10 : (expense > 0 ? -100 : 0);
  const incomeCommitmentPct = income > 0 ? Math.round((expense / income) * 1000) / 10 : null;

  const expenseDelta = hasPreviousMonthData ? r2(expense - prevExpense) : null;
  const expenseDeltaPct = hasPreviousMonthData && prevExpense > 0
    ? Math.round(((expense - prevExpense) / prevExpense) * 1000) / 10
    : null;

  const avgMonthlyIncome = activeMonthsCount > 0
    ? r2(activeMonths.reduce((s, m) => s + m.income, 0) / activeMonthsCount)
    : 0;
  const avgMonthlyExpense = activeMonthsCount > 0
    ? r2(activeMonths.reduce((s, m) => s + m.expense, 0) / activeMonthsCount)
    : 0;
  const avgMonthlySavings = activeMonthsCount > 0
    ? r2(activeMonths.reduce((s, m) => s + m.savings, 0) / activeMonthsCount)
    : 0;

  // Categorias de despesa no período
  const curCatTotals = new Map<string, number>();
  const curCatCounts = new Map<string, number>();
  for (const tx of periodTransactions) {
    if (tx.type !== "expense") continue;
    const cId = tx.categoryId || "unknown";
    curCatTotals.set(cId, r2((curCatTotals.get(cId) || 0) + tx.amount));
    curCatCounts.set(cId, (curCatCounts.get(cId) || 0) + 1);
  }

  const prevCatTotals = new Map<string, number>();
  for (const tx of prevPeriodTransactions) {
    if (tx.type !== "expense") continue;
    const cId = tx.categoryId || "unknown";
    prevCatTotals.set(cId, r2((prevCatTotals.get(cId) || 0) + tx.amount));
  }

  const allExpenseCatIds = new Set([...curCatTotals.keys(), ...prevCatTotals.keys()]);
  const categoryComparison: any[] = [];
  allExpenseCatIds.forEach((catId) => {
    const cat = catMap.get(catId) || { id: catId, name: "Outros", icon: "🏷️", color: "#64748b" };
    const amount = curCatTotals.get(catId) || 0;
    const prevAmount = prevCatTotals.get(catId) || 0;
    const count = curCatCounts.get(catId) || 0;
    const percentageOfExpense = expense > 0 ? Math.round((amount / expense) * 1000) / 10 : 0;
    const percentageOfIncome = income > 0 ? Math.round((amount / income) * 1000) / 10 : null;
    const delta = hasPreviousMonthData ? r2(amount - prevAmount) : null;
    const deltaPct = hasPreviousMonthData && prevAmount > 0
      ? Math.round(((amount - prevAmount) / prevAmount) * 1000) / 10
      : null;

    categoryComparison.push({
      id: catId,
      name: cat.name,
      icon: cat.icon || "🏷️",
      amount,
      prevAmount,
      count,
      percentageOfExpense,
      percentageOfIncome,
      delta,
      deltaPct
    });
  });

  const categoryBreakdown = categoryComparison
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const increasedCategories = hasPreviousMonthData
    ? categoryComparison.filter((c) => c.amount > 0 && (c.delta || 0) > 0).sort((a, b) => (b.delta || 0) - (a.delta || 0))
    : [];

  // Caixinhas
  const caixinhasList = (caixinhasRows || []).map((c) => ({
    id: String(c.id),
    name: String(c.name || "Caixinha"),
    icon: String(c.icon || "🎯"),
    currentAmount: r2(Number(c.current_amount ?? c.currentAmount) || 0),
    targetAmount: r2(Number(c.target_amount ?? c.targetAmount) || 0)
  }));
  const totalCaixinhasSaved = r2(caixinhasList.reduce((s, c) => s + c.currentAmount, 0));
  const totalCaixinhasTarget = r2(caixinhasList.reduce((s, c) => s + c.targetAmount, 0));
  const caixinhasProgressPct = totalCaixinhasTarget > 0
    ? Math.min(100, Math.round((totalCaixinhasSaved / totalCaixinhasTarget) * 1000) / 10)
    : null;

  // Investimentos
  let totalInvestedCost = 0;
  let totalInvestmentsValue = 0;
  const investmentsList: any[] = [];

  for (const rawInv of investmentsRows || []) {
    if (!rawInv) continue;
    const type = String(rawInv.type || "stock");
    const qty = Number(rawInv.quantity) || 0;
    if (type !== "fixed" && qty <= 0) continue;
    const avgPrice = Number(rawInv.average_price ?? rawInv.averagePrice) || 0;
    const appliedAmount = rawInv.applied_amount !== null && rawInv.applied_amount !== undefined
      ? Number(rawInv.applied_amount)
      : (rawInv.appliedAmount !== undefined ? Number(rawInv.appliedAmount) : null);
    const rawCost = Number(rawInv.cost_basis ?? rawInv.costBasis);
    const totalInvField = Number(rawInv.total_invested ?? rawInv.totalInvested);

    let cost = 0;
    if (type === "fixed") {
      cost = Number.isFinite(appliedAmount) && appliedAmount! >= 0
        ? appliedAmount!
        : (Number.isFinite(rawCost) && rawCost >= 0 ? rawCost : (Number.isFinite(totalInvField) && totalInvField >= 0 ? totalInvField : qty * avgPrice));
    } else {
      cost = Number.isFinite(rawCost) && rawCost >= 0 ? rawCost : qty * avgPrice;
    }
    cost = r2(cost);

    let curVal = cost;
    if (type === "fixed") {
      const accYieldRaw = rawInv.accumulated_yield ?? rawInv.accumulatedYield;
      const accYield = accYieldRaw !== null && accYieldRaw !== undefined && accYieldRaw !== "" ? Number(accYieldRaw) : null;
      curVal = r2(accYield !== null && Number.isFinite(accYield) ? cost + accYield : cost);
    } else {
      const quotePrice = rawInv.quote && Number.isFinite(Number(rawInv.quote.price)) && Number(rawInv.quote.price) > 0
        ? Number(rawInv.quote.price)
        : (Number.isFinite(Number(rawInv.current_price ?? rawInv.currentPrice)) && Number(rawInv.current_price ?? rawInv.currentPrice) > 0
          ? Number(rawInv.current_price ?? rawInv.currentPrice)
          : null);
      curVal = r2(quotePrice !== null && qty > 0 ? qty * quotePrice : cost);
    }

    if (cost <= 0 && curVal <= 0 && qty <= 0) continue;

    totalInvestedCost = r2(totalInvestedCost + cost);
    totalInvestmentsValue = r2(totalInvestmentsValue + curVal);

    investmentsList.push({
      id: String(rawInv.id),
      name: String(rawInv.name || rawInv.ticker || "Ativo").trim(),
      ticker: String(rawInv.ticker || "").trim(),
      type,
      institution: String(rawInv.institution || "").trim(),
      quantity: type === "fixed" ? 1 : qty,
      averagePrice: type === "fixed" ? cost : r2(avgPrice),
      costBasis: cost,
      currentValue: curVal,
      rateText: String(rawInv.rate_text ?? rawInv.rateText ?? "").trim()
    });
  }

  const totalDividends = r2(
    (dividendsRows || []).reduce((s, d) => s + (Number(d?.amount) || 0), 0)
  );
  const periodDividends = r2(
    (dividendsRows || [])
      .filter((d) => {
        if (!d || !d.date) return false;
        const [dY, dM] = String(d.date).split("-").map((n) => parseInt(n, 10));
        return dY === selYear && (isAllMonths || dM === monthNum);
      })
      .reduce((s, d) => s + (Number(d.amount) || 0), 0)
  );

  const goalsList = (goalsRows || []).map((g) => ({
    id: String(g.id),
    name: String(g.name || "Meta"),
    targetAmount: r2(Number(g.target_amount ?? g.targetAmount) || 0)
  }));
  const goalsAchieved = goalsList.filter((g) => g.targetAmount > 0 && totalInvestmentsValue >= g.targetAmount).length;

  const totalAccountBalance = r2(totalHistoricalIncome - totalHistoricalExpense);
  const totalNetWorth = r2(totalAccountBalance + totalCaixinhasSaved + totalInvestmentsValue);

  // Nota simplificada de saúde financeira
  let healthScore: number | null = null;
  let healthClass = "Dados insuficientes";
  if (hasPeriodData) {
    let pts = 0;
    if (income > 0 && expense < income) pts += 25;
    else if (income > 0 && expense === income) pts += 12;
    if (savingsRatePct >= 20) pts += 25;
    else if (savingsRatePct >= 10) pts += 18;
    else if (savingsRatePct > 0) pts += 10;
    if (incomeCommitmentPct !== null && incomeCommitmentPct <= 70) pts += 20;
    else if (incomeCommitmentPct !== null && incomeCommitmentPct <= 85) pts += 12;
    else if (incomeCommitmentPct !== null && incomeCommitmentPct <= 100) pts += 5;
    if (totalCaixinhasSaved > 0 || totalInvestmentsValue > 0) pts += 15;
    if (periodTransactions.length >= 2) pts += 15;
    healthScore = Math.max(0, Math.min(100, pts));
    healthClass = healthScore >= 80 ? "Excelente" : healthScore >= 60 ? "Boa" : healthScore >= 40 ? "Em Atenção" : "Crítica";
  }

  const periodLabel = isAllMonths
    ? `Ano de ${selYear}`
    : `${MONTH_NAMES[(monthNum || 1) - 1]} de ${selYear}`;

  return {
    source: "supabase-realtime-db",
    period: {
      month: isAllMonths ? "all" : monthNum,
      year: selYear,
      isAllMonths,
      label: periodLabel,
      prevLabel: prevPeriodLabel
    },
    periodLabel,
    prevPeriodLabel,
    hasAnyData: Boolean(
      hasPeriodData ||
      activeMonthsCount > 0 ||
      allTransactions.length > 0 ||
      investmentsList.length > 0 ||
      caixinhasList.length > 0
    ),
    hasPeriodData,
    hasPreviousMonthData,
    activeMonthsCount,
    daysRemainingInMonth,
    metrics: {
      income,
      expense,
      monthlySavings,
      savingsRatePct,
      incomeCommitmentPct,
      txCount: periodTransactions.length,
      incomeCount,
      expenseCount,
      totalTransactionCount: allTransactions.length,
      prevIncome,
      prevExpense,
      expenseDelta,
      expenseDeltaPct,
      avgMonthlyIncome,
      avgMonthlyExpense,
      avgMonthlySavings,
      avgHistoricalIncome: avgMonthlyIncome,
      avgHistoricalExpense: avgMonthlyExpense,
      avgHistoricalSavings: avgMonthlySavings,
      totalAccountBalance,
      totalCaixinhasSaved,
      totalCaixinhasBalance: totalCaixinhasSaved,
      totalCaixinhasTarget,
      caixinhasProgressPct,
      caixinhasCount: caixinhasList.length,
      totalInvestedCost,
      totalInvestmentsValue,
      periodDividends,
      totalDividends,
      investmentsCount: investmentsList.length,
      goalsCount: goalsList.length,
      goalsAchieved,
      totalNetWorth
    },
    health: {
      hasSufficientData: hasPeriodData,
      score: healthScore,
      classification: healthClass
    },
    categoryBreakdown,
    categories: categoryBreakdown,
    increasedCategories,
    periodTransactions: periodTransactions.slice(0, 25),
    investmentsList,
    caixinhasList,
    activeMonths: activeMonths.slice(-6)
  };
}

/**
 * Normaliza qualquer contexto enviado pelo cliente para garantir compatibilidade total de campos.
 */
function normalizeContext(ctx: any) {
  const m = ctx?.metrics || {};
  const cats = Array.isArray(ctx?.categoryBreakdown) && ctx.categoryBreakdown.length > 0
    ? ctx.categoryBreakdown
    : (Array.isArray(ctx?.categories) ? ctx.categories : []);
  const periodLabel = ctx?.period?.label || ctx?.periodLabel || "período selecionado";
  const prevPeriodLabel = ctx?.period?.prevLabel || ctx?.prevPeriodLabel || "período anterior";
  const caixinhasSaved = Number(m.totalCaixinhasSaved ?? m.totalCaixinhasBalance) || 0;
  const investmentsVal = Number(m.totalInvestmentsValue) || 0;
  const investedCost = Number(m.totalInvestedCost ?? m.totalInvestmentsValue) || 0;
  const avgIncome = Number(m.avgMonthlyIncome ?? m.avgHistoricalIncome) || 0;
  const avgExpense = Number(m.avgMonthlyExpense ?? m.avgHistoricalExpense) || 0;
  const avgSavings = Number(m.avgMonthlySavings ?? m.avgHistoricalSavings) || 0;
  const activeMonthsCount = Number(ctx?.activeMonthsCount) || (Array.isArray(ctx?.activeMonths) ? ctx.activeMonths.length : 0);
  const investmentsList = Array.isArray(ctx?.investmentsList) ? ctx.investmentsList : [];
  const caixinhasList = Array.isArray(ctx?.caixinhasList) ? ctx.caixinhasList : [];
  const periodTransactions = Array.isArray(ctx?.periodTransactions) ? ctx.periodTransactions : [];
  const income = Number(m.income) || 0;
  const expense = Number(m.expense) || 0;
  const hasPeriodData = Boolean(ctx?.hasPeriodData || income > 0 || expense > 0 || periodTransactions.length > 0);
  const hasAnyData = Boolean(
    ctx?.hasAnyData ||
    hasPeriodData ||
    activeMonthsCount > 0 ||
    (Number(m.totalTransactionCount) || 0) > 0 ||
    investmentsVal > 0 ||
    investmentsList.length > 0 ||
    caixinhasSaved > 0 ||
    caixinhasList.length > 0
  );

  return {
    ...ctx,
    period: {
      ...(ctx?.period || {}),
      label: periodLabel,
      prevLabel: prevPeriodLabel
    },
    periodLabel,
    prevPeriodLabel,
    hasAnyData,
    hasPeriodData,
    activeMonthsCount,
    categoryBreakdown: cats,
    categories: cats,
    investmentsList,
    caixinhasList,
    periodTransactions,
    metrics: {
      ...m,
      income,
      expense,
      monthlySavings: Number(m.monthlySavings ?? (income - expense)) || 0,
      savingsRatePct: Number(m.savingsRatePct) || 0,
      incomeCommitmentPct: m.incomeCommitmentPct !== null && m.incomeCommitmentPct !== undefined ? Number(m.incomeCommitmentPct) : (income > 0 ? Math.round((expense / income) * 1000) / 10 : null),
      avgMonthlyIncome: avgIncome,
      avgMonthlyExpense: avgExpense,
      avgMonthlySavings: avgSavings,
      avgHistoricalIncome: avgIncome,
      avgHistoricalExpense: avgExpense,
      avgHistoricalSavings: avgSavings,
      totalCaixinhasSaved: caixinhasSaved,
      totalCaixinhasBalance: caixinhasSaved,
      totalInvestedCost: investedCost,
      totalInvestmentsValue: investmentsVal,
      investmentsCount: Number(m.investmentsCount ?? investmentsList.length) || 0,
      caixinhasCount: Number(m.caixinhasCount ?? caixinhasList.length) || 0
    }
  };
}

/**
 * Constrói o System Prompt estruturado para provedores LLM (Gemini / OpenAI / Groq)
 * garantindo que os dados em tempo real do Supabase prevaleçam sobre qualquer mensagem antiga do chat.
 */
function buildSystemPrompt(financialContext: any): string {
  return `Você é o Assistente Financeiro com Inteligência Artificial oficial do sistema "Meu Controle – Finanças Pessoais".
Sua missão é responder à pergunta do usuário com base EXCLUSIVAMENTE nos dados financeiros reais e ATUALIZADOS EM TEMPO REAL fornecidos no JSON abaixo.

REGRAS OBRIGATÓRIAS E INEGOCIÁVEIS:
1. ATUALIZAÇÃO EM TEMPO REAL: O usuário pode ter acabado de adicionar, editar ou excluir receitas, despesas, categorias, caixinhas ou investimentos. Os valores presentes no JSON abaixo representam o estado ATUAL do banco de dados Supabase neste exato instante.
2. NUNCA reutilize valores numéricos de mensagens anteriores do histórico de conversa caso sejam diferentes dos valores presentes no JSON abaixo. O JSON abaixo SEMPRE prevalece!
3. NUNCA invente transações, saldos, categorias, rendimentos ou investimentos que não estejam nos dados abaixo.
4. Se não houver dados suficientes, explique isso de forma clara e informe os valores atuais (ex: R$ 0,00).
5. Apresente cálculos exatos em Reais (R$), utilizando formatação clara com tópicos e negrito (**texto**).
6. Responda sempre em Português do Brasil (pt-BR).

DADOS FINANCEIROS EM TEMPO REAL DO USUÁRIO AUTENTICADO (SUPABASE DATABASE):
${JSON.stringify(financialContext, null, 2)}`;
}

async function callGeminiAPI(apiKey: string, systemPrompt: string, question: string, ctx: any, history: any[]): Promise<string | null> {
  const contents: any[] = [];
  const recentHistory = Array.isArray(history) ? history.slice(-4) : [];
  for (const msg of recentHistory) {
    if (!msg || !msg.content) continue;
    contents.push({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: String(msg.content) }]
    });
  }
  const m = ctx?.metrics || {};
  const realtimeHeader = `[DADOS ATUAIS DO SUPABASE EM TEMPO REAL (${ctx.periodLabel}): Receitas=${formatBRL(m.income)} (${m.incomeCount || 0} lançamentos) | Despesas=${formatBRL(m.expense)} (${m.expenseCount || 0} lançamentos) | Saldo=${formatBRL(m.monthlySavings)} | Investimentos=${formatBRL(m.totalInvestmentsValue)} (${m.investmentsCount || 0} ativos, custo=${formatBRL(m.totalInvestedCost)}) | Caixinhas=${formatBRL(m.totalCaixinhasSaved)}]\nUse EXCLUSIVAMENTE estes números atualizados:\n\nPergunta: ${question}`;
  contents.push({
    role: "user",
    parts: [{ text: realtimeHeader }]
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.15,
        maxOutputTokens: 1024
      }
    })
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return typeof text === "string" && text.trim().length > 0 ? text.trim() : null;
}

async function callOpenAICompatibleAPI(
  baseUrl: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  question: string,
  ctx: any,
  history: any[]
): Promise<string | null> {
  const messages: any[] = [{ role: "system", content: systemPrompt }];
  const recentHistory = Array.isArray(history) ? history.slice(-4) : [];
  for (const msg of recentHistory) {
    if (!msg || !msg.content) continue;
    messages.push({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: String(msg.content)
    });
  }
  const m = ctx?.metrics || {};
  const realtimeHeader = `[DADOS ATUAIS DO SUPABASE EM TEMPO REAL (${ctx.periodLabel}): Receitas=${formatBRL(m.income)} | Despesas=${formatBRL(m.expense)} | Saldo=${formatBRL(m.monthlySavings)} | Investimentos=${formatBRL(m.totalInvestmentsValue)} (${m.investmentsCount || 0} ativos) | Caixinhas=${formatBRL(m.totalCaixinhasSaved)}]\nUse EXCLUSIVAMENTE estes números atualizados.\n\nPergunta: ${question}`;
  messages.push({ role: "user", content: realtimeHeader });

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.15,
      max_tokens: 1024
    })
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  return typeof text === "string" && text.trim().length > 0 ? text.trim() : null;
}

/**
 * Motor Analítico NLG Server-Side do Meu Controle com suporte em tempo real para:
 * - Consultas diretas de Despesas, Receitas, Investimentos, Caixinhas e Saldo;
 * - Todas as 7 perguntas sugeridas e simulações financeiras;
 * - Respostas baseadas 100% nos dados atuais do usuário autenticado.
 */
function generateServerAnalyticalResponse(question: string, rawCtx: any): string {
  const ctx = normalizeContext(rawCtx);
  const q = String(question || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const periodLabel = ctx.periodLabel;
  const hasPeriodData = Boolean(ctx.hasPeriodData);
  const activeMonthsCount = Number(ctx.activeMonthsCount) || 0;
  const m = ctx.metrics || {};
  const income = Number(m.income) || 0;
  const expense = Number(m.expense) || 0;
  const incomeCount = Number(m.incomeCount) || 0;
  const expenseCount = Number(m.expenseCount) || 0;
  const savings = Number(m.monthlySavings) || 0;
  const savingsRatePct = Number(m.savingsRatePct) || 0;
  const commitmentPct = m.incomeCommitmentPct !== null && m.incomeCommitmentPct !== undefined ? Number(m.incomeCommitmentPct) : null;
  const avgIncome = Number(m.avgMonthlyIncome) || 0;
  const avgExpense = Number(m.avgMonthlyExpense) || 0;
  const avgSavings = Number(m.avgMonthlySavings) || 0;
  const caixinhasSaved = Number(m.totalCaixinhasSaved) || 0;
  const caixinhasTarget = Number(m.totalCaixinhasTarget) || 0;
  const caixinhasCount = Number(m.caixinhasCount) || 0;
  const investmentsVal = Number(m.totalInvestmentsValue) || 0;
  const investedCost = Number(m.totalInvestedCost) || 0;
  const investmentsCount = Number(m.investmentsCount) || 0;
  const totalReserves = r2(caixinhasSaved + investmentsVal);
  const categories = Array.isArray(ctx.categoryBreakdown) ? ctx.categoryBreakdown : [];
  const topCat = categories.length > 0 ? categories[0] : null;
  const increasedCats = Array.isArray(ctx.increasedCategories) ? ctx.increasedCategories : [];
  const investmentsList = Array.isArray(ctx.investmentsList) ? ctx.investmentsList : [];
  const caixinhasList = Array.isArray(ctx.caixinhasList) ? ctx.caixinhasList : [];
  const periodTransactions = Array.isArray(ctx.periodTransactions) ? ctx.periodTransactions : [];
  const health = ctx.health || {};
  const daysRemaining = Math.max(1, Number(ctx.daysRemainingInMonth) || 10);

  // =========================================================================
  // INTENÇÃO A: Consulta direta sobre DESPESAS ("Quanto tenho de despesas?", "Minhas despesas", "Quanto gastei?")
  // =========================================================================
  const isDirectExpenseQuery =
    !q.includes("posso gastar") &&
    !q.includes("mais do que ganho") &&
    !q.includes("mais que ganho") &&
    !q.includes("como posso economizar") &&
    !q.includes("qual categoria") &&
    (
      q.includes("tenho de despesa") ||
      q.includes("total de despesa") ||
      q.includes("total das despesas") ||
      q.includes("total das minhas despesas") ||
      q.includes("valor das despesas") ||
      q.includes("valor das minhas despesas") ||
      q.includes("minhas despesas") ||
      q.includes("quais sao minhas despesas") ||
      q.includes("quanto gastei") ||
      q.includes("quanto eu gastei") ||
      q.includes("quanto estou gastando") ||
      q.includes("qual minha despesa") ||
      q.includes("quais minhas despesas") ||
      (q.includes("quanto") && q.includes("despesa"))
    );

  if (isDirectExpenseQuery) {
    const expenseTxs = periodTransactions.filter((t: any) => t.type === "expense");
    if (expense <= 0) {
      return [
        `Em **${periodLabel}**, o total das suas despesas é de **R$ 0,00** (**0 despesas** registradas no período).`,
        ``,
        `**Resumo atual do período (${periodLabel}):**`,
        `- **Despesas totais:** **R$ 0,00**`,
        `- **Receitas no período:** ${formatBRL(income)}`,
        `- **Saldo líquido do período:** **${formatBRL(savings)}**`,
        !ctx.hasAnyData ? `\n*Nota: ainda não há dados financeiros suficientes para análises adicionais — adicione movimentações em Transações.*` : ``
      ].filter(Boolean).join("\n");
    }

    const txLines = expenseTxs.slice(0, 8).map((t: any) =>
      `- **${t.description || "Despesa"}** (${t.categoryIcon || "🏷️"} ${t.categoryName || "Categoria"}): **${formatBRL(t.amount)}** em ${formatDateBR(t.date)}`
    );
    const catLines = categories.slice(0, 5).map((c: any) =>
      `- **${c.icon || "🏷️"} ${c.name}:** ${formatBRL(c.amount)} (${c.percentageOfExpense}% das despesas)`
    );

    return [
      `Em **${periodLabel}**, o total atualizado das suas despesas é de **${formatBRL(expense)}**${expenseCount > 0 ? ` (em **${expenseCount}** lançamento${expenseCount === 1 ? "" : "s"})` : ""}.`,
      ``,
      `**Resumo das suas despesas (${periodLabel}):**`,
      `- **Total de Despesas:** **${formatBRL(expense)}**`,
      `- **Receitas no período:** ${formatBRL(income)}${commitmentPct !== null ? ` (**${commitmentPct}%** da renda comprometida)` : ""}`,
      `- **Saldo líquido (Receitas - Despesas):** **${formatBRL(savings)}**`,
      txLines.length > 0 ? `\n**Lançamentos de despesas registrados no período:**\n${txLines.join("\n")}` : "",
      catLines.length > 0 ? `\n**Divisão por categoria:**\n${catLines.join("\n")}` : ""
    ].filter(Boolean).join("\n");
  }

  // =========================================================================
  // INTENÇÃO B: Consulta direta sobre RECEITAS ("Quanto tenho de receitas?", "Qual minha renda?", "Quanto ganhei?")
  // =========================================================================
  const isDirectIncomeQuery =
    !q.includes("organizar") &&
    !q.includes("dividir") &&
    !q.includes("50") &&
    !q.includes("mais do que ganho") &&
    !q.includes("mais que ganho") &&
    (
      q.includes("tenho de receita") ||
      q.includes("total de receita") ||
      q.includes("total das receitas") ||
      q.includes("total das minhas receitas") ||
      q.includes("valor das receitas") ||
      q.includes("valor das minhas receitas") ||
      q.includes("minhas receitas") ||
      q.includes("quais sao minhas receitas") ||
      q.includes("minha receita") ||
      q.includes("quanto ganhei") ||
      q.includes("quanto eu ganhei") ||
      q.includes("quanto recebi") ||
      q.includes("qual minha renda") ||
      q.includes("qual e a minha renda") ||
      q.includes("qual e minha renda") ||
      (q.includes("quanto") && q.includes("receita"))
    );

  if (isDirectIncomeQuery) {
    const incomeTxs = periodTransactions.filter((t: any) => t.type === "income");
    if (income <= 0) {
      return [
        `Em **${periodLabel}**, o total das suas receitas é de **R$ 0,00** (**0 receitas** registradas no período).`,
        ``,
        `**Resumo atual do período (${periodLabel}):**`,
        `- **Receitas totais:** **R$ 0,00**`,
        `- **Despesas no período:** ${formatBRL(expense)}`,
        `- **Saldo líquido do período:** **${formatBRL(savings)}**`
      ].join("\n");
    }

    const incLines = incomeTxs.slice(0, 8).map((t: any) =>
      `- **${t.description || "Receita"}** (${t.categoryIcon || "💰"} ${t.categoryName || "Receita"}): **${formatBRL(t.amount)}** em ${formatDateBR(t.date)}`
    );

    return [
      `Em **${periodLabel}**, o total atualizado das suas receitas é de **${formatBRL(income)}**${incomeCount > 0 ? ` (em **${incomeCount}** lançamento${incomeCount === 1 ? "" : "s"})` : ""}.`,
      ``,
      `**Resumo das suas receitas (${periodLabel}):**`,
      `- **Total de Receitas:** **${formatBRL(income)}**`,
      `- **Despesas no período:** ${formatBRL(expense)}`,
      `- **Saldo líquido disponível:** **${formatBRL(savings)}** (${savingsRatePct}% de taxa de economia)`,
      incLines.length > 0 ? `\n**Lançamentos de receitas registrados no período:**\n${incLines.join("\n")}` : ""
    ].filter(Boolean).join("\n");
  }

  // =========================================================================
  // INTENÇÃO C: Consulta direta sobre INVESTIMENTOS ("Quanto tenho em investimentos?", "Meus investimentos")
  // =========================================================================
  const isDirectInvestmentQuery =
    !q.includes("quanto tempo") &&
    !q.includes("juntar") &&
    (
      q.includes("investimento") ||
      q.includes("investido") ||
      q.includes("minha carteira") ||
      q.includes("meus ativos") ||
      q.includes("tenho aplicado") ||
      q.includes("valor aplicado") ||
      q.includes("renda fixa")
    );

  if (isDirectInvestmentQuery) {
    if (investmentsCount <= 0 || (investmentsVal <= 0 && investedCost <= 0)) {
      return [
        `Atualmente, você possui **R$ 0,00** em investimentos (**0 ativos** cadastrados na sua carteira).`,
        ``,
        `**Resumo de Patrimônio e Reservas:**`,
        `- **Patrimônio em Investimentos:** **R$ 0,00** (0 ativos)`,
        `- **Custo Total Aplicado:** **R$ 0,00**`,
        `- **Saldo em Caixinhas (${caixinhasCount}):** ${formatBRL(caixinhasSaved)}`
      ].join("\n");
    }

    const typeLabel = (t: string) =>
      t === "fixed" ? "Renda Fixa" : t === "fii" ? "FII" : t === "crypto" ? "Criptomoeda" : "Ação";

    const assetLines = investmentsList.map((inv: any) => {
      const label = inv.type === "fixed"
        ? `**${inv.name}** (${typeLabel(inv.type)}${inv.institution ? ` - ${inv.institution}` : ""})`
        : `**${inv.ticker ? `${inv.ticker} - ` : ""}${inv.name}** (${typeLabel(inv.type)}: ${inv.quantity} un. × PM ${formatBRL(inv.averagePrice)})`;
      const valDiff = Math.abs((inv.currentValue || 0) - (inv.costBasis || 0)) >= 0.01
        ? ` | Custo aplicado: ${formatBRL(inv.costBasis)}`
        : "";
      return `- ${label}: **${formatBRL(inv.currentValue)}**${valDiff}`;
    });

    return [
      `Atualmente, o seu patrimônio atualizado em **Investimentos** é de **${formatBRL(investmentsVal)}** (com custo total aplicado de **${formatBRL(investedCost)}** distribuído em **${investmentsCount}** ativo${investmentsCount === 1 ? "" : "s"}).`,
      ``,
      `**Resumo da sua Carteira de Investimentos:**`,
      `- **Posição Atual Total:** **${formatBRL(investmentsVal)}**`,
      `- **Valor Total Aplicado (Custo):** **${formatBRL(investedCost)}**`,
      `- **Quantidade de Ativos:** **${investmentsCount}**`,
      `- **Proventos/Dividendos no período:** ${formatBRL(Number(m.periodDividends) || 0)}`,
      assetLines.length > 0 ? `\n**Ativos na sua carteira agora:**\n${assetLines.join("\n")}` : "",
      `\n- **Total somado com Caixinhas (${formatBRL(caixinhasSaved)}):** **${formatBRL(totalReserves)}**`
    ].filter(Boolean).join("\n");
  }

  // =========================================================================
  // INTENÇÃO D: Consulta direta sobre CAIXINHAS ("Quanto tenho nas caixinhas?", "Minhas caixinhas")
  // =========================================================================
  if (q.includes("caixinha") || q.includes("reserva de emergencia")) {
    if (caixinhasCount <= 0 && caixinhasSaved <= 0) {
      return `Atualmente, você possui **R$ 0,00** guardados em Caixinhas (**0 caixinhas** cadastradas).`;
    }
    const caxLines = caixinhasList.map((c: any) =>
      `- **${c.icon || "🎯"} ${c.name}:** **${formatBRL(c.currentAmount)}** de ${formatBRL(c.targetAmount)}`
    );
    return [
      `Atualmente, você possui **${formatBRL(caixinhasSaved)}** guardados em **${caixinhasCount}** Caixinha(s) (meta total de **${formatBRL(caixinhasTarget)}**).`,
      caxLines.length > 0 ? `\n**Suas Caixinhas:**\n${caxLines.join("\n")}` : ""
    ].filter(Boolean).join("\n");
  }

  // =========================================================================
  // Caso 0: Usuário sem nenhuma transação no período e sem histórico
  // =========================================================================
  if (!hasPeriodData && activeMonthsCount === 0) {
    return `Ainda **não há dados financeiros suficientes** na sua conta para responder a essa pergunta com precisão.\n\nAtualmente você possui **0 transações registradas** em **${periodLabel}** (Receitas: **R$ 0,00** | Despesas: **R$ 0,00**)${totalReserves > 0 ? `, embora possua **${formatBRL(totalReserves)}** cadastrados entre Caixinhas (${formatBRL(caixinhasSaved)}) e Investimentos (${formatBRL(investmentsVal)})` : ""}.\n\n**O que fazer agora:**\n- Clique em **"+ Nova Movimentação"** para registrar suas receitas (ex: salário, ganhos) e suas despesas do mês;\n- Assim que houver movimentações reais cadastradas, calcularei automaticamente seu limite de gastos, sua capacidade de economia e seus planos personalizados.`;
  }

  // Caso 0.1: Sem dados no mês selecionado, mas possui histórico em outros meses
  if (!hasPeriodData && activeMonthsCount > 0) {
    return `No período selecionado (**${periodLabel}**), você ainda **não registrou receitas nem despesas** (Receitas: **R$ 0,00** | Despesas: **R$ 0,00**).\n\nPorém, analisando o seu histórico real de **${activeMonthsCount} mês(es) com movimentação**:\n- **Média de Receitas:** ${formatBRL(avgIncome)}/mês\n- **Média de Despesas:** ${formatBRL(avgExpense)}/mês\n- **Saldo Médio Mensal:** ${formatBRL(avgSavings)}/mês\n\nSelecione um mês com movimentações no filtro superior ou cadastre os lançamentos de **${periodLabel}** para obter a análise detalhada deste mês.`;
  }

  // 1. Pergunta: "Quanto posso gastar até o final do mês?" / limite de gastos / orçamento restante
  if (q.includes("quanto posso gastar") || q.includes("final do mes") || q.includes("ate o fim do mes") || q.includes("limite de gasto") || q.includes("orcamento restante") || q.includes("limite diario")) {
    if (income <= 0) {
      return `Em **${periodLabel}**, você registrou **${formatBRL(expense)}** em despesas, mas **ainda não cadastrou nenhuma receita** (**R$ 0,00**).\n\nSem uma receita informada neste mês, não é possível calcular um saldo disponível seguro para novos gastos. Cadastre suas entradas do mês para que eu calcule exatamente quanto você pode gastar por dia até o fim do mês.`;
    }
    if (expense >= income) {
      const deficit = r2(expense - income);
      return `⚠️ **Atenção: Você já atingiu o limite da sua renda em ${periodLabel}.**\n\n- **Receitas registradas:** ${formatBRL(income)}\n- **Despesas acumuladas:** ${formatBRL(expense)} (**${commitmentPct}%** da renda)\n- **Situação atual:** ${deficit > 0 ? `Déficit de **-${formatBRL(deficit)}**` : "Saldo zerado (**R$ 0,00**)"}\n\n**Recomendação prática:**\n- Seu orçamento disponível para novos gastos não essenciais até o final do mês é de **R$ 0,00**.\n- Priorize apenas compromissos inadiáveis e, se possível, reduza gastos variáveis em **${topCat ? topCat.name : "suas maiores categorias"}**${topCat ? ` (atualmente em **${formatBRL(topCat.amount)}**)` : ""} para reequilibrar o caixa.`;
    }

    const totalRemaining = r2(income - expense);
    const recommendedReserve20 = r2(income * 0.20);
    const safeToSpend = Math.max(0, r2(income - recommendedReserve20 - expense));
    const dailyMax = r2(totalRemaining / daysRemaining);
    const dailySafe = r2(safeToSpend / daysRemaining);

    return `Com base nos seus dados reais de **${periodLabel}**, aqui está o seu limite para os próximos **${daysRemaining} dia(s)** do mês:\n\n- **Receitas do mês:** ${formatBRL(income)}\n- **Despesas já realizadas:** ${formatBRL(expense)} (**${commitmentPct}%** da renda)\n- **Saldo total restante:** **${formatBRL(totalRemaining)}** (máximo de **${formatBRL(dailyMax)}/dia** sem entrar no vermelho)\n\n**💡 Recomendação Inteligente (Preservando 20% de economia):**\n- Para garantir uma reserva saudável de **${formatBRL(recommendedReserve20)}** (20% da sua renda), seu **limite seguro de gastos** até o fim do mês é de **${formatBRL(safeToSpend)}** (cerca de **${formatBRL(dailySafe)} por dia**).`;
  }

  // 2. Pergunta: "Qual categoria está consumindo mais dinheiro?" / maiores gastos / onde gasto mais
  if (q.includes("qual categoria") || q.includes("categoria") || q.includes("consumindo mais") || q.includes("gasto mais") || q.includes("maior gasto") || q.includes("maiores despesas")) {
    if (!topCat || categories.length === 0) {
      return `Em **${periodLabel}**, você ainda **não possui despesas registradas** em nenhuma categoria (total gasto: **R$ 0,00**).`;
    }
    const top3 = categories.slice(0, 5);
    const save10Top = r2(topCat.amount * 0.10);
    let response = `A categoria que está consumindo mais dinheiro em **${periodLabel}** é **${topCat.icon || "🏷️"} ${topCat.name}**:\n\n`;
    response += `- **Valor gasto em ${topCat.name}:** **${formatBRL(topCat.amount)}** em ${topCat.count || 1} lançamento(s)\n`;
    response += `- **Peso nas despesas:** **${topCat.percentageOfExpense}%** de tudo o que você gastou no período (${formatBRL(expense)})\n`;
    if (topCat.percentageOfIncome !== null) {
      response += `- **Peso na sua renda:** **${topCat.percentageOfIncome}%** das suas receitas do mês (${formatBRL(income)})\n`;
    }
    if (topCat.delta !== null && topCat.prevAmount > 0) {
      const sign = topCat.delta > 0 ? "+" : "";
      response += `- **Comparação com o mês anterior:** ${sign}${formatBRL(topCat.delta)} (${sign}${topCat.deltaPct}% vs. ${formatBRL(topCat.prevAmount)})\n`;
    }
    if (top3.length > 1) {
      response += `\n**Ranking das suas maiores categorias no período:**\n`;
      top3.forEach((c: any, idx: number) => {
        response += `${idx + 1}. **${c.icon || ""} ${c.name}:** ${formatBRL(c.amount)} (${c.percentageOfExpense}% dos gastos)\n`;
      });
    }
    response += `\n**💡 Dica prática:** Uma redução de **10%** apenas em **${topCat.name}** liberaria **${formatBRL(save10Top)}/mês** (**${formatBRL(save10Top * 12)}/ano**).`;
    return response;
  }

  // 3. Pergunta: "Quanto tempo vou levar para juntar R$ 10.000?" / juntar X / atingir meta
  if (q.includes("quanto tempo") || q.includes("juntar") || q.includes("alcancar") || q.includes("acumular") || q.includes("atingir")) {
    const targetAmount = parseTargetAmountFromQuestion(question, 10000);
    const save10Cut = r2(expense * 0.10);
    const remainingConsideringReserves = Math.max(0, r2(targetAmount - totalReserves));

    if (savings <= 0) {
      const required12m = r2(targetAmount / 12);
      const required24m = r2(targetAmount / 24);
      return `Para juntar **${formatBRL(targetAmount)}**, precisamos primeiro equilibrar o fluxo mensal, pois em **${periodLabel}** você está com saldo de **${formatBRL(savings)}** (Receitas: ${formatBRL(income)} | Despesas: ${formatBRL(expense)}).\n\n**O que os seus números mostram:**\n- Mantendo o saldo atual (${formatBRL(savings)}/mês), não há sobra mensal para acumular esse valor.\n${totalReserves > 0 ? `- Você já possui **${formatBRL(totalReserves)}** acumulados (Caixinhas + Investimentos), faltando **${formatBRL(remainingConsideringReserves)}** para chegar a ${formatBRL(targetAmount)}.\n` : ""}- **Para juntar ${formatBRL(targetAmount)} em 12 meses:** você precisará poupar **${formatBRL(required12m)}/mês**.\n- **Para juntar ${formatBRL(targetAmount)} em 24 meses:** você precisará poupar **${formatBRL(required24m)}/mês**.\n${save10Cut > 0 ? `\n**💡 Primeiro passo:** Reduzindo **10%** das despesas atuais, você já libera **${formatBRL(save10Cut)}/mês**.` : ""}`;
    }

    const monthsFromZero = Math.ceil(targetAmount / savings);
    const optimizedSavings = r2(savings + save10Cut);
    const monthsOptimizedFromZero = optimizedSavings > 0 ? Math.ceil(targetAmount / optimizedSavings) : monthsFromZero;
    const monthsRemainingWithReserves = remainingConsideringReserves > 0 ? Math.ceil(remainingConsideringReserves / savings) : 0;

    let reply = `Com base na sua economia real de **${formatBRL(savings)}/mês** em **${periodLabel}** (${savingsRatePct}% da sua renda):\n\n`;
    reply += `- **Partindo do zero no ritmo atual (${formatBRL(savings)}/mês):** você levará aproximadamente **${monthsFromZero} ${monthsFromZero === 1 ? "mês" : "meses"}**${monthsFromZero >= 12 ? ` (~${(monthsFromZero / 12).toFixed(1).replace(".", ",")} anos)` : ""} para juntar **${formatBRL(targetAmount)}**.\n`;
    if (save10Cut > 0 && monthsOptimizedFromZero < monthsFromZero) {
      reply += `- **Reduzindo 10% das despesas (+${formatBRL(save10Cut)}/mês → ${formatBRL(optimizedSavings)}/mês):** o prazo cai para **${monthsOptimizedFromZero} ${monthsOptimizedFromZero === 1 ? "mês" : "meses"}** (economia de **${monthsFromZero - monthsOptimizedFromZero} ${monthsFromZero - monthsOptimizedFromZero === 1 ? "mês" : "meses"}**!).\n`;
    }
    if (totalReserves > 0) {
      reply += `- **Considerando seu patrimônio já guardado (${formatBRL(totalReserves)} em Caixinhas e Investimentos):** ${remainingConsideringReserves === 0 ? `você **já superou** a marca de ${formatBRL(targetAmount)}!` : `faltam apenas **${formatBRL(remainingConsideringReserves)}**, o que levará cerca de **${monthsRemainingWithReserves} ${monthsRemainingWithReserves === 1 ? "mês" : "meses"}** no ritmo atual.`}\n`;
    }
    reply += `\n*Nota: Cálculo baseado exclusivamente na sua capacidade de poupança mensal, sem considerar juros ou rendimentos futuros variáveis.*`;
    return reply;
  }

  // 4. Pergunta: "Como posso economizar R$ 500 por mês?" / economizar X por mês
  if (q.includes("como posso economizar") || (q.includes("como") && q.includes("economizar")) || (q.includes("economizar") && /\d/.test(q)) || q.includes("reduzir gastos") || q.includes("cortar gastos")) {
    const targetSave = parseTargetAmountFromQuestion(question, 500);
    if (expense <= 0) {
      return `Você ainda não possui despesas cadastradas em **${periodLabel}** (**R$ 0,00**) para simular cortes de **${formatBRL(targetSave)}/mês**. Registre seus gastos por categoria para que eu monte um plano detalhado.`;
    }

    const pctOfTotalExpense = Math.round((targetSave / expense) * 1000) / 10;
    let reply = `Para economizar **${formatBRL(targetSave)} por mês** a partir dos seus dados reais de **${periodLabel}** (Receitas: **${formatBRL(income)}** | Despesas: **${formatBRL(expense)}**):\n\n`;

    if (savings >= targetSave) {
      reply += `✅ **Boa notícia:** Neste período você já conseguiu economizar **${formatBRL(savings)}** (acima da meta de ${formatBRL(targetSave)}!).\n\n`;
    } else if (savings > 0) {
      const additionalNeeded = r2(targetSave - savings);
      reply += `Atualmente você já economiza **${formatBRL(savings)}/mês**. Para chegar a **${formatBRL(targetSave)}/mês**, faltam apenas **${formatBRL(additionalNeeded)}/mês** em redução de despesas.\n\n`;
    } else {
      const totalTurnaround = r2(Math.abs(savings) + targetSave);
      reply += `Como este mês está com saldo de **${formatBRL(savings)}**, atingir uma sobra líquida de **${formatBRL(targetSave)}/mês** exige ajustar **${formatBRL(totalTurnaround)}** no orçamento (ou cortar **${formatBRL(targetSave)}** diretamente das despesas atuais).\n\n`;
    }

    if (targetSave > expense) {
      reply += `⚠️ O valor de **${formatBRL(targetSave)}** é maior do que todas as suas despesas registradas no mês (**${formatBRL(expense)}**). Portanto, além de reduzir gastos, será necessário aumentar as receitas mensais.`;
      return reply;
    }

    reply += `**Plano prático de redução nas suas maiores categorias (${pctOfTotalExpense}% das despesas totais):**\n`;
    const topCats = categories.slice(0, 3);
    const topSum = topCats.reduce((s: number, c: any) => s + (Number(c.amount) || 0), 0) || 1;
    topCats.forEach((c: any) => {
      const shareCut = r2((c.amount / topSum) * targetSave);
      const cutPctCat = Math.min(100, Math.round((shareCut / c.amount) * 1000) / 10);
      const newLimit = Math.max(0, r2(c.amount - shareCut));
      reply += `- **${c.icon || "🏷️"} ${c.name}** (atual: ${formatBRL(c.amount)}): reduzir **${formatBRL(shareCut)}** (-${cutPctCat}%), definindo teto de **${formatBRL(newLimit)}/mês**\n`;
    });
    reply += `\nEm **12 meses**, guardar **${formatBRL(targetSave)}/mês** acumulará **${formatBRL(targetSave * 12)}** na sua reserva!`;
    return reply;
  }

  // 5. Pergunta: "Estou gastando mais do que ganho?" / déficit / equilíbrio
  if (q.includes("gastando mais do que ganho") || q.includes("gasto mais do que ganho") || q.includes("gasto mais que ganho") || q.includes("no vermelho") || q.includes("endividado") || q.includes("equilibrio") || q.includes("deficit")) {
    if (income > 0 && expense > income) {
      const deficit = r2(expense - income);
      return `🚨 **Sim. Em ${periodLabel}, você está gastando mais do que ganha.**\n\n- **Total de Receitas:** ${formatBRL(income)}\n- **Total de Despesas:** ${formatBRL(expense)}\n- **Déficit do período:** **-${formatBRL(deficit)}** (suas despesas consumiram **${commitmentPct}%** da sua renda)\n- **Nota de Saúde Financeira:** **${health.score ?? "—"}/100 (${health.classification || "Crítica"})**\n\n**Principais responsáveis pelo excesso:**\n${categories.slice(0, 3).map((c: any) => `- **${c.icon || ""} ${c.name}:** ${formatBRL(c.amount)} (${c.percentageOfExpense}% dos gastos)`).join("\n")}\n\n**Como reverter:** Para fechar o mês no zero a zero sem novas receitas, você precisa reduzir **${Math.round((deficit / expense) * 1000) / 10}%** das despesas atuais (${formatBRL(deficit)}).`;
    }
    if (income === 0 && expense > 0) {
      return `⚠️ **Sim.** Em **${periodLabel}**, você registrou **${formatBRL(expense)}** em despesas e **R$ 0,00** em receitas.\n\nComo não há receitas cadastradas no mês, o fluxo do período está negativo em **-${formatBRL(expense)}**. Se você já recebeu seu salário ou outras entradas, cadastre-as em **Transações** para atualizar o cálculo.`;
    }
    return `✅ **Não! Em ${periodLabel}, você está gastando menos do que ganha.**\n\n- **Total de Receitas:** ${formatBRL(income)}\n- **Total de Despesas:** ${formatBRL(expense)} (**${commitmentPct ?? 0}%** da renda comprometida)\n- **Saldo Economizado:** **+${formatBRL(savings)}** (taxa de economia de **${savingsRatePct}%**)\n- **Saúde Financeira:** **${health.score ?? "—"}/100 (${health.classification || "Boa"})**\n\nVocê está com superávit no período! ${savingsRatePct >= 20 ? "Sua taxa de economia supera a meta recomendada de 20%." : `Se elevar sua economia de ${savingsRatePct}% para 20%, você poupará ${formatBRL(income * 0.20)}/mês.`}`;
  }

  // 6. Pergunta: "Quanto consegui economizar?" / minha economia / quanto guardei
  if (q.includes("quanto consegui economizar") || q.includes("quanto economizei") || q.includes("minha economia") || q.includes("quanto poupei") || q.includes("saldo economizado")) {
    let reply = `Aqui está o balanço real da sua economia em **${periodLabel}**:\n\n`;
    if (savings > 0) {
      reply += `- **Economia líquida no período:** **+${formatBRL(savings)}** (**${savingsRatePct}%** das suas receitas de ${formatBRL(income)})\n`;
    } else if (savings === 0) {
      reply += `- **Economia líquida no período:** **R$ 0,00** (Receitas: ${formatBRL(income)} | Despesas: ${formatBRL(expense)})\n`;
    } else {
      reply += `- **Resultado no período:** Não houve economia neste mês — ocorreu um déficit de **-${formatBRL(Math.abs(savings))}** (Despesas: ${formatBRL(expense)} vs. Receitas: ${formatBRL(income)})\n`;
    }
    reply += `- **Receitas em ${periodLabel}:** ${formatBRL(income)}\n`;
    reply += `- **Despesas em ${periodLabel}:** ${formatBRL(expense)}\n`;
    if (activeMonthsCount > 1) {
      reply += `- **Sua média histórica (${activeMonthsCount} meses ativos):** ${formatBRL(avgSavings)}/mês\n`;
    }
    reply += `- **Saldo guardado em Caixinhas (${caixinhasCount}):** ${formatBRL(caixinhasSaved)}\n`;
    reply += `- **Patrimônio em Investimentos (${investmentsCount}):** ${formatBRL(investmentsVal)}\n`;
    reply += `- **Patrimônio Acumulado (Caixinhas + Investimentos):** **${formatBRL(totalReserves)}**`;
    return reply;
  }

  // 7. Pergunta: "Como posso organizar melhor minha renda?" / regra 50 30 20 / organizar orçamento
  if (q.includes("organizar") || q.includes("50") || q.includes("planejar") || q.includes("dividir minha renda") || q.includes("orcamento")) {
    const baseIncome = income > 0 ? income : avgIncome;
    if (baseIncome <= 0) {
      return `Para montar uma distribuição personalizada da sua renda em **${periodLabel}**, primeiro cadastre o valor da sua receita mensal (ex: salário ou proventos) em **Nova Movimentação**. Atualmente suas receitas registradas no período são de **R$ 0,00** e despesas de **${formatBRL(expense)}**.`;
    }
    const ideal50 = r2(baseIncome * 0.50);
    const ideal30 = r2(baseIncome * 0.30);
    const ideal20 = r2(baseIncome * 0.20);

    return `Com base na sua receita de **${formatBRL(baseIncome)}**, veja como organizar sua renda pelo método **50 / 30 / 20** comparado à sua situação atual em **${periodLabel}**:\n\n` +
      `1. **50% para Gastos Essenciais (${formatBRL(ideal50)}):**\n   Moradia, alimentação básica, saúde, transporte e contas fixas.\n` +
      `2. **30% para Estilo de Vida & Flexíveis (${formatBRL(ideal30)}):**\n   Lazer, compras pessoais, restaurantes e assinaturas.\n` +
      `3. **20% para o seu Futuro e Metas (${formatBRL(ideal20)}):**\n   Aportes mensais nas suas **Caixinhas** e **Investimentos**.\n\n` +
      `**📊 Seu diagnóstico atual em ${periodLabel}:**\n` +
      `- **Total gasto atualmente (Essenciais + Estilo de Vida):** ${formatBRL(expense)} (${commitmentPct !== null ? `${commitmentPct}% da renda — o ideal combinado é até 80%` : "—"})\n` +
      `- **Poupado para o futuro neste período:** ${formatBRL(Math.max(0, savings))} (${savingsRatePct}% da renda — meta ideal: **${formatBRL(ideal20)}** / 20%)\n` +
      `${topCat ? `- **Prioridade nº 1 de ajuste:** Sua maior despesa hoje é **${topCat.name}** (**${formatBRL(topCat.amount)}**). Reduzir 10% nela já libera **${formatBRL(topCat.amount * 0.10)}/mês**.` : ""}`;
  }

  // Resposta consultiva geral completa para qualquer outra pergunta sobre as finanças do usuário
  return `Analisei os seus dados financeiros reais em **${periodLabel}** (Saúde Financeira: **${health.score !== null && health.score !== undefined ? `${health.score}/100 — ${health.classification}` : "Sem nota"}**):\n\n` +
    `- **Receitas no período:** ${formatBRL(income)} (${incomeCount} lançamento${incomeCount === 1 ? "" : "s"})\n` +
    `- **Despesas no período:** ${formatBRL(expense)} (${expenseCount} lançamento${expenseCount === 1 ? "" : "s"})${commitmentPct !== null ? ` — **${commitmentPct}%** da renda comprometida` : ""}\n` +
    `- **Resultado (Economia / Saldo):** **${savings >= 0 ? "+" : ""}${formatBRL(savings)}** (${savingsRatePct}% da renda)\n` +
    `${topCat ? `- **Categoria de maior gasto:** **${topCat.icon || ""} ${topCat.name}** com **${formatBRL(topCat.amount)}** (${topCat.percentageOfExpense}% das despesas)\n` : ""}` +
    `${increasedCats.length > 0 ? `- **Categoria que mais subiu vs. mês anterior:** **${increasedCats[0].name}** (+${formatBRL(increasedCats[0].delta)})\n` : ""}` +
    `- **Reservas & Investimentos:** **${formatBRL(caixinhasSaved)}** em Caixinhas (${caixinhasCount}) e **${formatBRL(investmentsVal)}** em Investimentos (${investmentsCount} ativo${investmentsCount === 1 ? "" : "s"}) — Total: **${formatBRL(totalReserves)}**\n\n` +
    `**💡 Recomendação personalizada:** ${topCat ? `Você gastou **${formatBRL(topCat.amount)}** com **${topCat.name}** neste período. Reduzindo apenas **10%** desse valor, você economiza **${formatBRL(topCat.amount * 0.10)}/mês** (**${formatBRL(topCat.amount * 1.2)}/ano**).` : "Continue registrando todas as movimentações para acompanhar sua evolução mês a mês."}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const body = await req.json();
    const question = String(body?.question || "").trim();
    const clientContext = body?.financialContext || {};
    const history = Array.isArray(body?.conversationHistory)
      ? body.conversationHistory
      : (Array.isArray(body?.history) ? body.history : []);

    if (!question) {
      return new Response(
        JSON.stringify({ error: "Informe uma pergunta para o Assistente IA." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Identifica o usuário autenticado via JWT do Supabase Auth
    let verifiedUserId: string | null = null;
    let realtimeDbContext: any = null;

    if (supabaseUrl && supabaseAnonKey && authHeader) {
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      });

      const { data: userData } = await supabaseClient.auth.getUser();
      if (userData?.user?.id) {
        verifiedUserId = userData.user.id;

        // 2. Busca os dados financeiros MAIS RECENTES diretamente no Supabase Database para esse usuário
        const [catRes, txRes, caxRes, invRes, divRes, goalRes] = await Promise.all([
          supabaseClient.from("categories").select("*").eq("user_id", verifiedUserId),
          supabaseClient.from("transactions").select("*").eq("user_id", verifiedUserId).order("date", { ascending: false }),
          supabaseClient.from("caixinhas").select("*").eq("user_id", verifiedUserId),
          supabaseClient.from("investments").select("*").eq("user_id", verifiedUserId),
          supabaseClient.from("dividends").select("*").eq("user_id", verifiedUserId).order("date", { ascending: false }),
          supabaseClient.from("investment_goals").select("*").eq("user_id", verifiedUserId)
        ]);

        const dbQuerySucceeded = !catRes.error && !txRes.error && !caxRes.error && !invRes.error;
        if (dbQuerySucceeded) {
          const now = new Date();
          const reqMonth = clientContext?.period?.month ?? (now.getMonth() + 1);
          const reqYear = Number(clientContext?.period?.year) || now.getFullYear();
          const daysRemaining = Number(clientContext?.daysRemainingInMonth) ||
            Math.max(1, new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate() + 1);

          const dbHasAnyRows =
            (Array.isArray(txRes.data) && txRes.data.length > 0) ||
            (Array.isArray(invRes.data) && invRes.data.length > 0) ||
            (Array.isArray(caxRes.data) && caxRes.data.length > 0);

          // Usa os dados em tempo real do banco sempre que a conta estiver sincronizada ou possuir dados no Supabase
          if (clientContext?.syncedWithCloud !== false || dbHasAnyRows) {
            realtimeDbContext = computeRealtimeContextFromSupabase({
              categoriesRows: catRes.data || [],
              transactionsRows: txRes.data || [],
              caixinhasRows: caxRes.data || [],
              investmentsRows: invRes.data || [],
              dividendsRows: divRes.data || [],
              goalsRows: goalRes.data || [],
              month: reqMonth,
              year: reqYear,
              daysRemainingInMonth: daysRemaining
            });
          }
        }
      }
    }

    // 3. Seleciona o contexto recalculado em tempo real (priorizando a consulta direta ao Supabase)
    const activeContext = normalizeContext(realtimeDbContext || clientContext);
    const safeContext = {
      ...activeContext,
      authenticatedUserId: verifiedUserId || "authenticated_session",
      dataSource: realtimeDbContext ? "supabase-realtime-database" : "client-realtime-recalculated",
      calculatedAt: new Date().toISOString()
    };

    const systemPrompt = buildSystemPrompt(safeContext);

    const geminiKey = Deno.env.get("GEMINI_API_KEY") || "";
    const openaiKey = Deno.env.get("OPENAI_API_KEY") || "";
    const groqKey = Deno.env.get("GROQ_API_KEY") || "";

    let answer: string | null = null;
    let provider = "supabase-edge-ai";

    if (geminiKey) {
      answer = await callGeminiAPI(geminiKey, systemPrompt, question, safeContext, history);
      if (answer) provider = "google-gemini-2.5-flash";
    }

    if (!answer && openaiKey) {
      answer = await callOpenAICompatibleAPI("https://api.openai.com/v1", openaiKey, "gpt-4o-mini", systemPrompt, question, safeContext, history);
      if (answer) provider = "openai-gpt-4o-mini";
    }

    if (!answer && groqKey) {
      answer = await callOpenAICompatibleAPI("https://api.groq.com/openai/v1", groqKey, "llama-3.3-70b-versatile", systemPrompt, question, safeContext, history);
      if (answer) provider = "groq-llama-3.3-70b";
    }

    if (!answer) {
      answer = generateServerAnalyticalResponse(question, safeContext);
      provider = "supabase-edge-analytical-ai";
    }

    return new Response(
      JSON.stringify({
        answer,
        provider,
        dataSource: safeContext.dataSource,
        snapshotMetrics: {
          income: safeContext.metrics.income,
          expense: safeContext.metrics.expense,
          monthlySavings: safeContext.metrics.monthlySavings,
          totalInvestmentsValue: safeContext.metrics.totalInvestmentsValue,
          totalInvestedCost: safeContext.metrics.totalInvestedCost,
          totalCaixinhasSaved: safeContext.metrics.totalCaixinhasSaved
        },
        llmSecretConfigured: Boolean(geminiKey || openaiKey || groqKey),
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Erro interno ao processar pergunta no Assistente IA." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
