-- =============================================================================
-- MEU CONTROLE – FINANÇAS PESSOAIS
-- Schema PostgreSQL + Políticas de Segurança Row Level Security (RLS) no Supabase
-- =============================================================================

-- Função utilitária para atualizar automaticamente a coluna updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =============================================================================
-- 1. TABELA DE PERFIL E PREFERÊNCIAS DO USUÁRIO (user_profiles)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Usuário',
  email TEXT,
  settings JSONB NOT NULL DEFAULT '{"theme": "light", "currency": "BRL", "hideBalances": false}'::jsonb,
  migrated_legacy_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger para confirmar automaticamente o e-mail no cadastro (login automático após criar conta)
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := NOW();
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.auto_confirm_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_new_user();

-- Trigger automática para criar o perfil ao cadastrar conta no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), split_part(NEW.email, '@', 1), 'Usuário'),
    NEW.email
  )
  ON CONFLICT (user_id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = NOW();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 2. TABELA DE CATEGORIAS (categories)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT NOT NULL DEFAULT '🏷️',
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);

DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.categories;
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 3. TABELA DE TRANSAÇÕES - RECEITAS E DESPESAS (transactions)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id TEXT NOT NULL,
  date TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);

DROP TRIGGER IF EXISTS trg_transactions_updated_at ON public.transactions;
CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 4. TABELA DE CAIXINHAS E RESERVAS (caixinhas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.caixinhas (
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  target_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  icon TEXT NOT NULL DEFAULT '🎯',
  color TEXT NOT NULL DEFAULT '#10b981',
  deadline TEXT,
  history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_caixinhas_user_id ON public.caixinhas(user_id);

DROP TRIGGER IF EXISTS trg_caixinhas_updated_at ON public.caixinhas;
CREATE TRIGGER trg_caixinhas_updated_at
  BEFORE UPDATE ON public.caixinhas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 5. TABELA DE INVESTIMENTOS (investments)
-- Suporta Ações (stock), FIIs (fii), Criptomoedas (crypto) e Renda Fixa (fixed)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.investments (
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  ticker TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('stock', 'fii', 'crypto', 'fixed')),
  institution TEXT NOT NULL DEFAULT '',
  quantity NUMERIC(20, 8) NOT NULL DEFAULT 0,
  average_price NUMERIC(18, 6) NOT NULL DEFAULT 0,
  applied_amount NUMERIC(18, 2),
  current_price NUMERIC(18, 6),
  quote JSONB,
  coingecko_id TEXT,
  total_invested NUMERIC(18, 2) NOT NULL DEFAULT 0,
  cost_basis NUMERIC(18, 2) NOT NULL DEFAULT 0,
  realized_profit NUMERIC(18, 2) NOT NULL DEFAULT 0,
  realized_legacy_unknown BOOLEAN NOT NULL DEFAULT FALSE,
  yield_type TEXT,
  benchmark TEXT,
  rate_text TEXT NOT NULL DEFAULT '',
  application_date TEXT,
  maturity_date TEXT,
  accumulated_yield NUMERIC(18, 2),
  notes TEXT NOT NULL DEFAULT '',
  quote_error TEXT,
  last_update TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments(user_id);

DROP TRIGGER IF EXISTS trg_investments_updated_at ON public.investments;
CREATE TRIGGER trg_investments_updated_at
  BEFORE UPDATE ON public.investments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 6. TABELA DE HISTÓRICO DE COMPRAS, VENDAS, APORTES E RESGATES
--    (investment_transactions)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.investment_transactions (
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  investment_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  quantity NUMERIC(20, 8) NOT NULL DEFAULT 0,
  unit_price NUMERIC(18, 6) NOT NULL DEFAULT 0,
  fees NUMERIC(18, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  cost_of_sold NUMERIC(18, 2),
  realized_profit NUMERIC(18, 2),
  date TEXT NOT NULL,
  broker TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_inv_tx_user_date ON public.investment_transactions(user_id, date DESC);

DROP TRIGGER IF EXISTS trg_inv_tx_updated_at ON public.investment_transactions;
CREATE TRIGGER trg_inv_tx_updated_at
  BEFORE UPDATE ON public.investment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 7. TABELA DE PROVENTOS / DIVIDENDOS (dividends)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.dividends (
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  investment_id TEXT,
  ticker TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'dividend',
  amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  quantity_ref NUMERIC(20, 8),
  date TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_dividends_user_date ON public.dividends(user_id, date DESC);

DROP TRIGGER IF EXISTS trg_dividends_updated_at ON public.dividends;
CREATE TRIGGER trg_dividends_updated_at
  BEFORE UPDATE ON public.dividends
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 8. TABELA DE METAS DE INVESTIMENTO (investment_goals)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.investment_goals (
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  deadline TEXT,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_inv_goals_user_id ON public.investment_goals(user_id);

DROP TRIGGER IF EXISTS trg_inv_goals_updated_at ON public.investment_goals;
CREATE TRIGGER trg_inv_goals_updated_at
  BEFORE UPDATE ON public.investment_goals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 9. TABELA DE HISTÓRICO DIÁRIO DO PATRIMÔNIO (portfolio_snapshots)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.portfolio_snapshots (
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  value NUMERIC(18, 2),
  cost NUMERIC(18, 2) NOT NULL DEFAULT 0,
  calculated BOOLEAN NOT NULL DEFAULT FALSE,
  complete BOOLEAN NOT NULL DEFAULT FALSE,
  positions JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_date ON public.portfolio_snapshots(user_id, date DESC);

DROP TRIGGER IF EXISTS trg_portfolio_snapshots_updated_at ON public.portfolio_snapshots;
CREATE TRIGGER trg_portfolio_snapshots_updated_at
  BEFORE UPDATE ON public.portfolio_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 10. PERMISSÕES E POLÍTICAS DE SEGURANÇA ROW LEVEL SECURITY (RLS)
-- Garante que cada usuário autenticado ((select auth.uid()) = user_id) só possa
-- visualizar, inserir, atualizar e excluir os seus próprios registros.
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;

-- Habilitar e forçar RLS em todas as tabelas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories FORCE ROW LEVEL SECURITY;

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.caixinhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caixinhas FORCE ROW LEVEL SECURITY;

ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments FORCE ROW LEVEL SECURITY;

ALTER TABLE public.investment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_transactions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividends FORCE ROW LEVEL SECURITY;

ALTER TABLE public.investment_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_goals FORCE ROW LEVEL SECURITY;

ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_snapshots FORCE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Políticas: user_profiles
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
CREATE POLICY "user_profiles_select_own" ON public.user_profiles
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
CREATE POLICY "user_profiles_insert_own" ON public.user_profiles
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
CREATE POLICY "user_profiles_update_own" ON public.user_profiles
  FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_profiles_delete_own" ON public.user_profiles;
CREATE POLICY "user_profiles_delete_own" ON public.user_profiles
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- Políticas: categories
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "categories_select_own" ON public.categories;
CREATE POLICY "categories_select_own" ON public.categories
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "categories_insert_own" ON public.categories;
CREATE POLICY "categories_insert_own" ON public.categories
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "categories_update_own" ON public.categories;
CREATE POLICY "categories_update_own" ON public.categories
  FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "categories_delete_own" ON public.categories;
CREATE POLICY "categories_delete_own" ON public.categories
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- Políticas: transactions
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "transactions_select_own" ON public.transactions;
CREATE POLICY "transactions_select_own" ON public.transactions
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "transactions_insert_own" ON public.transactions;
CREATE POLICY "transactions_insert_own" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "transactions_update_own" ON public.transactions;
CREATE POLICY "transactions_update_own" ON public.transactions
  FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "transactions_delete_own" ON public.transactions;
CREATE POLICY "transactions_delete_own" ON public.transactions
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- Políticas: caixinhas
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "caixinhas_select_own" ON public.caixinhas;
CREATE POLICY "caixinhas_select_own" ON public.caixinhas
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "caixinhas_insert_own" ON public.caixinhas;
CREATE POLICY "caixinhas_insert_own" ON public.caixinhas
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "caixinhas_update_own" ON public.caixinhas;
CREATE POLICY "caixinhas_update_own" ON public.caixinhas
  FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "caixinhas_delete_own" ON public.caixinhas;
CREATE POLICY "caixinhas_delete_own" ON public.caixinhas
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- Políticas: investments
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "investments_select_own" ON public.investments;
CREATE POLICY "investments_select_own" ON public.investments
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "investments_insert_own" ON public.investments;
CREATE POLICY "investments_insert_own" ON public.investments
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "investments_update_own" ON public.investments;
CREATE POLICY "investments_update_own" ON public.investments
  FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "investments_delete_own" ON public.investments;
CREATE POLICY "investments_delete_own" ON public.investments
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- Políticas: investment_transactions
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "investment_transactions_select_own" ON public.investment_transactions;
CREATE POLICY "investment_transactions_select_own" ON public.investment_transactions
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "investment_transactions_insert_own" ON public.investment_transactions;
CREATE POLICY "investment_transactions_insert_own" ON public.investment_transactions
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "investment_transactions_update_own" ON public.investment_transactions;
CREATE POLICY "investment_transactions_update_own" ON public.investment_transactions
  FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "investment_transactions_delete_own" ON public.investment_transactions;
CREATE POLICY "investment_transactions_delete_own" ON public.investment_transactions
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- Políticas: dividends
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "dividends_select_own" ON public.dividends;
CREATE POLICY "dividends_select_own" ON public.dividends
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "dividends_insert_own" ON public.dividends;
CREATE POLICY "dividends_insert_own" ON public.dividends
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "dividends_update_own" ON public.dividends;
CREATE POLICY "dividends_update_own" ON public.dividends
  FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "dividends_delete_own" ON public.dividends;
CREATE POLICY "dividends_delete_own" ON public.dividends
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- Políticas: investment_goals
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "investment_goals_select_own" ON public.investment_goals;
CREATE POLICY "investment_goals_select_own" ON public.investment_goals
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "investment_goals_insert_own" ON public.investment_goals;
CREATE POLICY "investment_goals_insert_own" ON public.investment_goals
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "investment_goals_update_own" ON public.investment_goals;
CREATE POLICY "investment_goals_update_own" ON public.investment_goals
  FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "investment_goals_delete_own" ON public.investment_goals;
CREATE POLICY "investment_goals_delete_own" ON public.investment_goals
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- Políticas: portfolio_snapshots
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "portfolio_snapshots_select_own" ON public.portfolio_snapshots;
CREATE POLICY "portfolio_snapshots_select_own" ON public.portfolio_snapshots
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "portfolio_snapshots_insert_own" ON public.portfolio_snapshots;
CREATE POLICY "portfolio_snapshots_insert_own" ON public.portfolio_snapshots
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "portfolio_snapshots_update_own" ON public.portfolio_snapshots;
CREATE POLICY "portfolio_snapshots_update_own" ON public.portfolio_snapshots
  FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "portfolio_snapshots_delete_own" ON public.portfolio_snapshots;
CREATE POLICY "portfolio_snapshots_delete_own" ON public.portfolio_snapshots
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);
