# 📋 PROMPT PARA CONSTRUÇÃO DO BACKEND

Copie e cole o texto abaixo em um novo chat para construir o backend:

---

## PROMPT INICIAL PARA BACKEND

Preciso construir um backend completo para um sistema B2B de representantes comerciais que negociam com grandes redes de supermercados. O frontend já está pronto e espera se comunicar com este backend.

### Contexto do Projeto

O sistema visa:
- **Decisão orientada a dados** através de análises inteligentes
- **Redução de esforço operacional** com automações
- **Aumento da taxa de conversão** por visita

### Requisitos Técnicos

1. **Stack Tecnológica**
   - Use Node.js com Express ou Python com FastAPI (escolha a melhor opção)
   - Banco de dados: PostgreSQL ou MongoDB (sua escolha)
   - Integração com OpenAI API (ChatGPT) para funcionalidades de IA
   - CORS configurado para aceitar requisições de `http://localhost:3000`

2. **Estrutura de Dados**

   **Propostas:**
   ```typescript
   {
     id: string
     cliente: string
     valor: number
     status: 'pendente' | 'aprovada' | 'rejeitada' | 'enviada'
     dataCriacao: string (ISO date)
     dataVencimento: string (ISO date)
     descricao?: string
     observacoes?: string
   }
   ```

   **Visitas:**
   ```typescript
   {
     id: string
     cliente: string
     data: string (ISO date)
     hora: string
     status: 'agendada' | 'realizada' | 'cancelada' | 'reagendada'
     endereco?: string
     observacoes?: string
   }
   ```

   **Atividades:**
   ```typescript
   {
     id: string
     type: 'visita' | 'proposta' | 'analise'
     description: string
     timestamp: string (ISO date)
     status: string
   }
   ```

3. **Endpoints Necessários**

   **Dashboard:**
   - `GET /api/dashboard/stats`
     - Retorna estatísticas agregadas:
       ```json
       {
         "totalVisitas": number,
         "taxaConversao": number,
         "propostasPendentes": number,
         "receitaMensal": number
       }
       ```
   
   - `GET /api/dashboard/activities`
     - Retorna últimas 10 atividades recentes
     - Array de objetos Activity

   **Análises com IA:**
   - `POST /api/analises/gerar`
     - Body: `{ "tipo": string, "dados": string }`
     - Tipos: "performance", "concorrencia", "tendencia", "oportunidade"
     - Deve usar OpenAI API para gerar análises inteligentes baseadas nos dados fornecidos
     - Retorna: `{ "resultado": string }` (análise gerada pela IA)
     - **IMPORTANTE:** Use prompts específicos para cada tipo de análise:
       - Performance: Analisar dados de vendas, visitas, conversões
       - Concorrência: Comparar com mercado e concorrentes
       - Tendências: Identificar padrões e tendências futuras
       - Oportunidades: Sugerir oportunidades de negócio

   **Propostas:**
   - `GET /api/propostas` - Lista todas as propostas
   - `POST /api/propostas` - Cria nova proposta
   - `PUT /api/propostas/:id` - Atualiza proposta existente
   - `DELETE /api/propostas/:id` - Deleta proposta

   **Visitas:**
   - `GET /api/visitas` - Lista todas as visitas
   - `POST /api/visitas` - Cria nova visita
   - `PUT /api/visitas/:id` - Atualiza visita existente
   - `DELETE /api/visitas/:id` - Deleta visita

4. **Integração com OpenAI**

   - Configure a API Key do ChatGPT através de variável de ambiente: `OPENAI_API_KEY`
   - Crie um serviço/module para comunicação com OpenAI
   - Para análises, use o modelo `gpt-4` ou `gpt-3.5-turbo`
   - Crie prompts contextuais específicos para cada tipo de análise
   - Exemplo de prompt para análise de performance:
     ```
     "Você é um especialista em análise comercial B2B. Analise os seguintes dados de um representante comercial que negocia com redes de supermercados e forneça insights acionáveis sobre performance, pontos fortes, áreas de melhoria e recomendações estratégicas. Dados: {dados}"
     ```

5. **Funcionalidades Adicionais Desejadas**

   - **Geração de Propostas com IA:** Endpoint adicional `POST /api/propostas/gerar-com-ia` que recebe dados básicos e gera uma proposta completa usando IA
   - **Sugestões Inteligentes:** Endpoint `GET /api/dashboard/sugestoes` que retorna sugestões baseadas em dados históricos
   - **Validações:** Valide todos os inputs (valores, datas, etc.)
   - **Tratamento de Erros:** Retorne erros formatados: `{ "error": "mensagem", "code": "CODIGO" }`

6. **Configuração**

   - Porta padrão: `5000`
   - Base URL da API: `/api`
   - Variáveis de ambiente necessárias:
     - `OPENAI_API_KEY` (obrigatória)
     - `DATABASE_URL` (se usar banco de dados)
     - `PORT` (opcional, padrão 5000)

7. **Estrutura de Código**

   Organize o código seguindo boas práticas:
   - Separação de responsabilidades (controllers, services, models)
   - Middleware para validação e tratamento de erros
   - Configuração centralizada
   - Documentação clara do código

8. **Dados Mock (Opcional)**

   Se preferir começar sem banco de dados, pode usar dados em memória para desenvolvimento inicial, mas deixe preparado para migração para banco de dados real.

### Entregáveis Esperados

1. Código backend completo e funcional
2. README.md com instruções de instalação e execução
3. Arquivo `.env.example` com variáveis de ambiente necessárias
4. Estrutura de pastas organizada
5. Tratamento de erros robusto
6. Integração funcional com OpenAI API

### Observações Importantes

- O frontend já está pronto e fazendo requisições para esses endpoints
- Use TypeScript se possível (ou tipagem adequada)
- Siga as melhores práticas de segurança (validação de inputs, sanitização, etc.)
- O sistema deve ser escalável e fácil de manter
- Documente bem o código

Por favor, construa este backend completo seguindo essas especificações. Se tiver dúvidas sobre algum endpoint ou funcionalidade, pergunte antes de implementar.

---

**FIM DO PROMPT**

