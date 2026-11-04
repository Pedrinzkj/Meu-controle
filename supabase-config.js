/**
 * MEU CONTROLE – FINANÇAS PESSOAIS
 * Configuração Pública do Supabase (Auth + Database)
 *
 * IMPORTANTE DE SEGURANÇA:
 * - Este arquivo contém APENAS a URL pública do projeto e a chave publicável (Publishable / Anon Key).
 * - NUNCA coloque chaves secretas ("service_role" / "sb_secret_") no frontend.
 * - O isolamento e a segurança dos dados de cada usuário são garantidos pelo Supabase Auth + políticas RLS no PostgreSQL.
 */
(function () {
  'use strict';

  const DEFAULT_CONFIG = {
    SUPABASE_URL: 'https://ldpiczzupbdbibwlejbf.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_iQHbtYAzYIi7bSQc0U8Gww_v8eW0dUu'
  };

  window.MEU_CONTROLE_SUPABASE_CONFIG = DEFAULT_CONFIG;
})();
