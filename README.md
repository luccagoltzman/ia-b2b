# 🚀 IA B2B - Sistema Inteligente para Representantes Comerciais

<div align="center">

**Plataforma completa de gestão comercial B2B com inteligência artificial integrada**

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.8-646CFF?logo=vite)](https://vitejs.dev/)
[![SCSS](https://img.shields.io/badge/SCSS-1.69.5-CC6699?logo=sass)](https://sass-lang.com/)

</div>

---

## 📋 Sobre o Projeto

**IA B2B** é uma plataforma moderna e inteligente desenvolvida especificamente para representantes comerciais que negociam com grandes redes de supermercados. O sistema combina **inteligência artificial** com **análise de dados** para otimizar processos comerciais, aumentar a taxa de conversão e reduzir o esforço operacional.

### 🎯 Objetivos Principais

- ✅ **Decisão Orientada a Dados**: Análises inteligentes geradas por IA para insights acionáveis
- ✅ **Redução de Esforço Operacional**: Automação de processos repetitivos e gestão centralizada
- ✅ **Aumento da Taxa de Conversão**: Acompanhamento detalhado de propostas e visitas com checkpoints
- ✅ **Experiência Moderna**: Interface clean, responsiva e otimizada para mobile

---

## ✨ Funcionalidades

### 📊 Dashboard Inteligente
- Visão geral com métricas de performance em tempo real
- Estatísticas de visitas, conversões e receita
- Atividades recentes com timeline visual
- Ações rápidas para operações frequentes

### 🤖 Análises com IA
- **Análise de Performance**: Avaliação de dados de vendas e conversões
- **Análise de Concorrência**: Comparação com mercado e concorrentes
- **Análise de Tendências**: Identificação de padrões e projeções futuras
- **Identificação de Oportunidades**: Sugestões estratégicas baseadas em dados

### 📝 Gestão de Propostas
- CRUD completo de propostas comerciais
- Sistema de **checkpoints/timeline** para rastreamento de status
- Status granulares: rascunho, pendente, enviada, em análise (gerente/diretoria), aprovada, rejeitada, cancelada
- Visualização detalhada com histórico completo de mudanças
- Cards responsivos para mobile, tabela otimizada para desktop

### 📍 Gestão de Visitas
- Agendamento e acompanhamento de visitas comerciais
- Status detalhados: agendada, confirmada, em andamento, realizada, cancelada, reagendada
- Timeline de checkpoints para rastreamento completo
- Interface adaptada para dispositivos móveis

### 🎨 Design System
- Interface moderna com glassmorphism e gradientes sutis
- Design responsivo com menu bottom para mobile
- Animações suaves e microinterações
- Paleta de cores profissional e tipografia otimizada

---

## 🛠️ Stack Tecnológica

### Core
- **React 18.2.0** - Biblioteca UI moderna e performática
- **TypeScript 5.2.2** - Tipagem estática para maior segurança
- **Vite 5.0.8** - Build tool ultra-rápido
- **React Router 6.20.0** - Roteamento declarativo

### Estilização
- **SCSS 1.69.5** - Pré-processador CSS com variáveis e mixins
- **Design System** - Variáveis centralizadas, componentes reutilizáveis
- **Responsive Design** - Mobile-first com breakpoints bem definidos

### Comunicação
- **Axios 1.6.2** - Cliente HTTP com interceptors configurados
- **API RESTful** - Integração com backend separado

---

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passos

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd ia-b2b
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente** (opcional)
   ```bash
   # Crie um arquivo .env na raiz do projeto
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Execute o projeto**
   ```bash
   npm run dev
   ```

5. **Acesse no navegador**
   ```
   http://localhost:3000
   ```

---

## 🏗️ Arquitetura do Projeto

```
ia-b2b/
├── src/
│   ├── components/              # Componentes reutilizáveis
│   │   ├── Layout/             # Layout principal (Sidebar + Header)
│   │   ├── BottomNav/          # Menu bottom para mobile
│   │   ├── Header/             # Cabeçalho da aplicação
│   │   ├── Sidebar/            # Menu lateral (desktop)
│   │   ├── StatCard/           # Cards de estatísticas
│   │   ├── RecentActivity/      # Timeline de atividades
│   │   ├── QuickActions/       # Botões de ação rápida
│   │   ├── AnaliseForm/        # Formulário de análise
│   │   ├── AnaliseResult/      # Exibição de resultados
│   │   ├── PropostaForm/       # Formulário de proposta
│   │   ├── PropostaList/       # Lista de propostas (tabela/cards)
│   │   ├── PropostaDetail/     # Modal de detalhes
│   │   ├── PropostaTimeline/   # Timeline de checkpoints
│   │   ├── VisitaForm/         # Formulário de visita
│   │   └── VisitaList/         # Lista de visitas
│   ├── pages/                   # Páginas da aplicação
│   │   ├── Dashboard/           # Dashboard principal
│   │   ├── Analises/            # Página de análises
│   │   ├── Propostas/           # Página de propostas
│   │   ├── Visitas/             # Página de visitas
│   │   └── Configuracoes/       # Configurações
│   ├── services/                # Serviços de API
│   │   └── apiService.ts        # Cliente HTTP centralizado
│   ├── styles/                  # Estilos globais
│   │   ├── _variables.scss      # Variáveis SCSS (cores, espaçamentos, etc)
│   │   ├── _reset.scss          # Reset CSS
│   │   ├── _base.scss           # Estilos base e utilitários
│   │   ├── _components.scss     # Estilos de componentes globais
│   │   └── main.scss            # Arquivo principal
│   ├── App.tsx                  # Componente raiz
│   └── main.tsx                 # Entry point
├── public/                      # Arquivos estáticos
├── index.html                   # HTML principal
├── vite.config.ts              # Configuração do Vite
├── tsconfig.json               # Configuração TypeScript
└── package.json                # Dependências e scripts
```

### Princípios de Organização

- **Separação de Responsabilidades**: Cada componente tem seu próprio arquivo `.tsx` e `.scss`
- **Reutilização**: Componentes modulares e configuráveis
- **Type Safety**: Interfaces TypeScript para todos os dados
- **Design System**: Variáveis centralizadas para consistência visual

---

## 🔌 Integração com Backend

### Configuração

O frontend se comunica com o backend através da variável de ambiente `VITE_API_URL`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Estrutura de Comunicação

Todas as requisições são feitas através do serviço `apiService.ts`, que utiliza Axios com:
- Interceptors para autenticação (se necessário)
- Tratamento centralizado de erros
- Headers configurados automaticamente

### Endpoints Implementados

#### 📊 Dashboard
- `GET /api/dashboard/stats` - Estatísticas agregadas
- `GET /api/dashboard/activities` - Atividades recentes

#### 🤖 Análises
- `POST /api/analises/gerar` - Geração de análises com IA
  ```typescript
  Body: {
    tipo: "performance" | "concorrencia" | "tendencia" | "oportunidade"
    dados: string
  }
  Response: {
    resultado: string
  }
  ```

#### 📝 Propostas
- `GET /api/propostas` - Lista todas as propostas
- `GET /api/propostas/:id` - Detalhes com checkpoints
- `POST /api/propostas` - Criar nova proposta
- `PUT /api/propostas/:id` - Atualizar proposta
- `POST /api/propostas/:id/status` - Atualizar status (cria checkpoint)
- `DELETE /api/propostas/:id` - Deletar proposta

#### 📍 Visitas
- `GET /api/visitas` - Lista todas as visitas
- `GET /api/visitas/:id` - Detalhes com checkpoints
- `POST /api/visitas` - Criar nova visita
- `PUT /api/visitas/:id` - Atualizar visita
- `POST /api/visitas/:id/status` - Atualizar status (cria checkpoint)
- `DELETE /api/visitas/:id` - Deletar visita

### Formato de Status

**⚠️ IMPORTANTE**: O frontend envia status em **snake_case, tudo minúsculas**:

**Propostas:**
- `rascunho`, `pendente`, `enviada`
- `em_analise_gerente_compras`, `em_analise_diretoria`
- `aprovada`, `rejeitada`, `cancelada`

**Visitas:**
- `agendada`, `confirmada`, `em_andamento`
- `realizada`, `cancelada`, `reagendada`

---

## 📱 Responsividade

### Desktop (≥ 1024px)
- Sidebar fixa com navegação completa
- Tabelas otimizadas para visualização de dados
- Layout espaçoso e profissional

### Mobile (< 1024px)
- Menu bottom fixo para navegação rápida
- Cards ao invés de tabelas
- Interface touch-friendly
- Sidebar oculta automaticamente

---

## 🎨 Design System

### Cores
- **Primária**: `#4f46e5` (Índigo)
- **Secundária**: `#059669` (Verde)
- **Neutras**: Escala de cinzas profissional
- **Status**: Cores semânticas para feedback visual

### Tipografia
- **Fonte**: Inter (Google Fonts)
- **Hierarquia**: Tamanhos bem definidos (0.75rem a 2.5rem)
- **Pesos**: 400, 500, 600, 700, 800

### Componentes
- Cards com glassmorphism
- Botões com estados hover/active
- Badges para status
- Inputs com feedback visual
- Animações suaves (cubic-bezier)

---

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento (porta 3000)

# Build
npm run build        # Gera build de produção
npm run preview      # Preview do build de produção

# Qualidade
npm run lint         # Executa ESLint
```

---

## 📚 Documentação Adicional

### Para Desenvolvedores

- **Estrutura de Componentes**: Cada componente segue o padrão de arquivo único (`.tsx` + `.scss`)
- **TypeScript**: Interfaces definidas para todos os dados
- **SCSS**: Variáveis centralizadas em `_variables.scss`
- **API Service**: Cliente HTTP centralizado com tratamento de erros

### Para Backend

Consulte o arquivo de documentação do backend para implementação completa da API.

---

## 🔒 Segurança

- Validação de inputs no frontend
- Sanitização de dados antes do envio
- Headers de segurança configurados
- Tratamento seguro de tokens (se implementado)

---

## 📈 Performance

- **Vite**: Build extremamente rápido
- **Code Splitting**: Carregamento otimizado de rotas
- **Lazy Loading**: Componentes carregados sob demanda
- **Otimizações**: Imagens e assets otimizados

---

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.

---

## 👥 Contato

Para dúvidas ou suporte, entre em contato através dos canais oficiais.

---

<div align="center">

**Desenvolvido com exelência para representantes comerciais B2B**

</div>
