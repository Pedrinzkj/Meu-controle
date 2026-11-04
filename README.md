# Meu Controle – Sistema de Controle Financeiro Pessoal

> **Trabalho de Conclusão de Curso (TCC)**  
> **Nome do Sistema:** Meu Controle  
> **Subtítulo:** Finanças Pessoais  
> **Versão:** 2.0.0 (Moderna, Responsiva & Modular)

---

## 📌 1. Visão Geral do Projeto

O **Meu Controle** é uma aplicação web completa desenvolvida para proporcionar controle financeiro pessoal moderno, intuitivo, seguro e eficiente. O projeto foi recriado e aprimorado com base na proposta original do Trabalho de Conclusão de Curso, trazendo código limpo, arquitetura desacoplada, alta responsividade e identidade visual sóbria e profissional inspirada nos principais aplicativos fintech do mercado.

---

## ✨ 2. Principais Funcionalidades

### 🏠 Visão Geral (Dashboard)
- **Cards de Métricas em Tempo Real:**
  - **Saldo Disponível:** calculado dinamicamente (`Receitas - Despesas`).
  - **Total de Receitas:** soma de todas as entradas no período ativo.
  - **Total de Despesas:** soma de todas as saídas no período ativo.
  - **Taxa de Economia:** cálculo percentual automático de poupança com barra de progresso visual.
- **Gráficos Interativos (Canvas Engine):**
  - Gráfico de barras comparativo: evolução de Receitas vs Despesas mês a mês.
  - Gráfico de rosca (Donut): distribuição percentual de gastos por categoria.
- **Movimentações Recentes:** lista das transações mais recentes com ícones coloridos por categoria e atalho para edição rápida.
- **Filtro Mensal e Anual:** seleção instantânea por mês específico ou ano completo.

### 💳 Transações
- **CRUD Completo:**
  - Cadastro de novas receitas e despesas.
  - Edição de movimentações existentes com preenchimento automático.
  - Exclusão com janela modal de confirmação para evitar perdas acidentais.
- **Campos Detalhados:** Descrição, Valor em Reais (R$), Tipo (Receita ou Despesa), Categoria, Data (formato DD/MM/AAAA) e Observações opcionais.
- **Filtros e Busca em Tempo Real:**
  - Busca textual instantânea por descrição, observação ou categoria.
  - Filtro por Tipo: Todas, Receitas ou Despesas.
  - Filtro por Categoria: seleção dinâmica entre todas as categorias ativas.
  - Filtro por Período: Todas as datas, Este Mês, Mês Passado e Este Ano.
- **Faixa de Resumo:** contagem de itens filtrados, somatório de receitas, despesas e saldo líquido do resultado da busca.
- **Layout Adaptativo:** tabela estruturada para computadores e cards táteis para dispositivos móveis.

### 📊 Relatórios & Gráficos
- **Análises Aprofundadas:**
  - Comparativo anual de entradas vs saídas.
  - Gráfico de distribuição de despesas.
  - Ranking detalhado de gastos por categoria com barras de preenchimento percentual.
- **Indicadores Chave:**
  - Total recebido e total gasto.
  - Saldo líquido e taxa de poupança.
  - Média diária de gastos no período.
  - Maior despesa individual registrada.
- **Filtros de Período Flexíveis:**
  - Botões pré-definidos: Este Mês, Mês Passado, Últimos 3 Meses, Últimos 6 Meses, Este Ano e Todo o Histórico.
  - Modo Personalizado com seleção livre de data inicial e data final.
- **Exportação:** botão direto para exportar os dados do relatório em CSV.

### 🏷️ Categorias
- **Categorias Pré-configuradas:**
  - **Despesas:** Alimentação 🍔, Transporte 🚗, Moradia 🏠, Saúde 💊, Educação 🎓, Lazer 🎮, Compras 🛍️, Contas 📄, Outros 📦.
  - **Receitas:** Salário 💼, Freelance 💻, Investimentos 📈, Vendas 🏷️, Outros 💵.
- **Personalização Completa:**
  - Criação de novas categorias com seletor de emojis/ícones e paleta de cores.
  - Edição de nome, ícone e cor.
  - **Regra de Proteção (Segurança de Dados):** o sistema impede a exclusão de qualquer categoria que possua transações vinculadas sem que o usuário escolha para qual outra categoria deseja reclassificar as movimentações existentes!

### ⚙️ Configurações & Preferências
- **Modo Escuro / Claro:** alternância instantânea com persistência de preferência e suporte a variáveis CSS.
- **Modo Privacidade:** botão de "olho" no cabeçalho e opção de configuração para ocultar/desfocar os valores em público.
- **Perfil do Usuário:** personalização do nome de exibição na saudação inicial.
- **Exportação e Backup:**
  - Exportação para planilha **CSV** (formato brasileiro com separador `;` e codificação UTF-8 BOM para Excel e Google Planilhas).
  - Backup completo em **JSON** para restauração futura.
  - Restauração de backup a partir de arquivo JSON.
- **Dados de Demonstração:** botão para carregar dados fictícios realistas e completos para apresentações.
- **Zona de Perigo:** limpeza completa de dados com confirmação de segurança.

---

## 📂 3. Estrutura e Organização do Código

O código foi arquitetado com base em boas práticas de engenharia de software, separando responsabilidades de forma clara e modular:

```
Tcc fim/
├── index.html               # Estrutura semântica HTML5 principal
├── abrir_sistema.bat        # Inicializador rápido com 1 clique para Windows
├── README.md                # Documentação técnica e guia do TCC
│
├── css/
│   ├── variables.css        # Design tokens, variáveis CSS, temas claro e escuro
│   ├── base.css             # Reset CSS, tipografia, scrollbars e utilitários
│   ├── layout.css           # Grid geral, sidebar responsiva, topbar e drawer mobile
│   ├── components.css       # Cards, botões, formulários, tabelas, modais e badges
│   └── views.css            # Estilos específicos para Dashboard, Transações, Relatórios, etc.
│
├── js/
│   ├── bundle.js            # Pacote standalone universal (compatível com duplo clique direto)
│   ├── app.js               # Orquestrador principal da aplicação e rotas SPA
│   ├── utils.js             # Formatação monetária (BRL), datas (DD/MM/AAAA) e biblioteca SVG
│   ├── storage.js           # Camada de persistência (LocalStorage), dados padrão e exportação
│   ├── state.js             # Gerenciamento de estado reativo e motor de cálculos financeiros
│   ├── charts.js            # Motor gráfico nativo em Canvas HTML5 (Zero dependências externas)
│   │
│   ├── components/
│   │   ├── modal.js         # Sistema de janelas modais acessíveis e reclassificação
│   │   └── toast.js         # Notificações visuais flutuantes (sucesso, erro, info, alerta)
│   │
│   └── views/
│       ├── dashboardView.js # Lógica e renderização da Visão Geral
│       ├── transactionsView.js # Lógica e renderização das Transações
│       ├── reportsView.js   # Lógica e renderização dos Relatórios
│       ├── categoriesView.js # Lógica e renderização das Categorias
│       └── settingsView.js  # Lógica e renderização das Configurações
```

---

## 🚀 4. Como Executar o Sistema

Não é necessária nenhuma instalação de dependências, Node.js, compiladores ou servidores complexos.

### Opção 1: Duplo Clique Direto (Mais Fácil)
1. Dê um duplo clique no arquivo `abrir_sistema.bat` ou abra diretamente o arquivo `index.html` em qualquer navegador moderno (**Google Chrome**, **Microsoft Edge**, **Mozilla Firefox**, **Safari**, **Opera**).

### Opção 2: Servidor Local (Python)
Se desejar rodar via HTTP local:
```bash
python -m http.server 8000
```
Em seguida, acesse no navegador: `http://localhost:8000`.

---

## 🔒 5. Armazenamento e Integridade dos Dados

- Os dados são salvos no **LocalStorage** do navegador.
- Ao atualizar a página (`F5`) ou fechar o navegador, todas as receitas, despesas, categorias personalizadas e preferências permanecem salvas.
- Funciona **100% offline**, ideal para apresentações de TCC sem risco de falha de conexão com a internet.
- A estrutura do projeto foi planejada para que, caso seja desejado no futuro, a camada `js/storage.js` possa ser substituída por chamadas a uma API REST com Node.js/Python/Java e banco de dados relacional sem alterar as telas e componentes.

---

## 👨‍💻 6. Identificação do Projeto

- **Curso:** Trabalho de Conclusão de Curso (TCC)
- **Tema:** Sistema Web de Controle Financeiro Pessoal
- **Desenvolvido por:** Pedro Henrique
