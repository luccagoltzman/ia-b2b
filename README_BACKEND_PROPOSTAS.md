# 📋 PROMPT PARA ATUALIZAÇÃO DO BACKEND - PROPOSTAS COMERCIAIS DETALHADAS

Copie e cole o texto abaixo em um novo chat para atualizar o backend com as novas funcionalidades de propostas comerciais:

---

## PROMPT PARA ATUALIZAÇÃO DO BACKEND - PROPOSTAS COMERCIAIS MELHORADAS

Preciso atualizar o backend existente para incluir campos muito mais detalhados nas propostas comerciais, tornando-as adequadas para representantes comerciais B2B que negociam com grandes redes de supermercados.

### Contexto

O frontend foi completamente atualizado para incluir um formulário muito mais robusto e detalhado de propostas comerciais, com campos específicos para:
- Informações detalhadas do produto
- Valores unitários e quantidades
- Estratégias de representação
- Condições comerciais
- Diferenciais competitivos

### NOVA ESTRUTURA DE DADOS - PROPOSTAS

#### Interface TypeScript Completa

```typescript
interface Proposta {
  id: string
  cliente: string
  valor: number // Valor total (calculado ou manual)
  status: string
  dataCriacao: string (ISO date)
  dataVencimento: string (ISO date)
  
  // Campos existentes (manter)
  descricao?: string // Descrição geral da proposta
  observacoes?: string // Observações adicionais
  
  // NOVOS CAMPOS - Informações do Produto
  produto?: string // Nome do produto sendo vendido
  marca?: string // Marca do produto
  categoria?: string // Categoria do produto (ex: Alimentos, Bebidas, Limpeza)
  unidadeMedida?: string // Unidade de medida (ver valores válidos abaixo)
  
  // NOVOS CAMPOS - Valores e Quantidades
  valorUnitario?: number // Valor unitário do produto
  quantidade?: number // Quantidade do produto
  desconto?: number // Valor do desconto
  descontoTipo?: 'percentual' | 'valor' // Tipo de desconto: percentual (%) ou valor fixo (R$)
  
  // NOVOS CAMPOS - Condições Comerciais
  condicoesPagamento?: string // Ex: "30/60/90 dias", "Boleto", "Cartão"
  prazoEntrega?: string // Ex: "15 dias", "Imediato", "30 dias"
  
  // NOVOS CAMPOS - Estratégia de Representação
  estrategiaRepresentacao?: string // Estratégia que será adotada para representar o produto
  publicoAlvo?: string // Público-alvo do produto
  diferenciaisCompetitivos?: string // Diferenciais em relação à concorrência
  
  // Sistema de checkpoints (já implementado)
  checkpoints?: Checkpoint[]
}

interface Checkpoint {
  id: string
  status: string
  label: string
  descricao?: string
  data: string (ISO date)
  usuario?: string
}
```

### VALORES VÁLIDOS PARA CAMPOS

#### Unidade de Medida (`unidadeMedida`)
O frontend envia um dos seguintes valores:
- `"unidade"` (padrão)
- `"kg"` - Quilograma
- `"g"` - Grama
- `"litro"` - Litro
- `"ml"` - Mililitro
- `"caixa"` - Caixa
- `"pacote"` - Pacote
- `"fardo"` - Fardo
- `"duzia"` - Dúzia
- `"metro"` - Metro
- `"outro"` - Outro

#### Tipo de Desconto (`descontoTipo`)
- `"percentual"` - Desconto em percentual (%)
- `"valor"` - Desconto em valor fixo (R$)

#### Status (já implementado, manter)
- `"rascunho"`, `"pendente"`, `"enviada"`
- `"em_analise_gerente_compras"`, `"em_analise_diretoria"`
- `"aprovada"`, `"rejeitada"`, `"cancelada"`

### LÓGICA DE CÁLCULO DO VALOR TOTAL

O frontend calcula automaticamente o valor total quando `valorUnitario` e `quantidade` são informados:

```
Valor Total = (Valor Unitário × Quantidade) - Desconto
```

**Se descontoTipo = "percentual":**
```
Valor Total = (Valor Unitário × Quantidade) × (1 - Desconto / 100)
```

**Se descontoTipo = "valor":**
```
Valor Total = (Valor Unitário × Quantidade) - Desconto
```

**IMPORTANTE:**
- O backend deve validar que se `valorUnitario` e `quantidade` forem fornecidos, o cálculo deve ser consistente
- O campo `valor` pode ser enviado manualmente pelo usuário OU calculado automaticamente
- Se o usuário editar o `valor` manualmente, ele tem prioridade sobre o cálculo

### ENDPOINTS QUE PRECISAM SER ATUALIZADOS

#### 1. POST /api/propostas (Criar Proposta)

**Body esperado:**
```json
{
  "cliente": "string (obrigatório)",
  "produto": "string (opcional)",
  "marca": "string (opcional)",
  "categoria": "string (opcional)",
  "unidadeMedida": "string (opcional, padrão: 'unidade')",
  "valorUnitario": "number (opcional)",
  "quantidade": "number (opcional)",
  "valor": "number (obrigatório)",
  "desconto": "number (opcional)",
  "descontoTipo": "'percentual' | 'valor' (opcional, padrão: 'percentual')",
  "condicoesPagamento": "string (opcional)",
  "prazoEntrega": "string (opcional)",
  "dataVencimento": "string ISO date (obrigatório)",
  "estrategiaRepresentacao": "string (opcional)",
  "publicoAlvo": "string (opcional)",
  "diferenciaisCompetitivos": "string (opcional)",
  "descricao": "string (opcional)",
  "observacoes": "string (opcional)"
}
```

**Resposta:**
```json
{
  "id": "string",
  "cliente": "string",
  "produto": "string",
  "marca": "string",
  "categoria": "string",
  "unidadeMedida": "string",
  "valorUnitario": "number",
  "quantidade": "number",
  "valor": "number",
  "desconto": "number",
  "descontoTipo": "string",
  "condicoesPagamento": "string",
  "prazoEntrega": "string",
  "status": "string (padrão: 'rascunho' ou 'pendente')",
  "dataCriacao": "ISO date",
  "dataVencimento": "ISO date",
  "estrategiaRepresentacao": "string",
  "publicoAlvo": "string",
  "diferenciaisCompetitivos": "string",
  "descricao": "string",
  "observacoes": "string",
  "checkpoints": [
    {
      "id": "string",
      "status": "string",
      "label": "string",
      "descricao": "string",
      "data": "ISO date",
      "usuario": "string"
    }
  ]
}
```

#### 2. PUT /api/propostas/:id (Atualizar Proposta)

**Body:** Mesma estrutura do POST /api/propostas

**Resposta:** Proposta atualizada com todos os campos

#### 3. GET /api/propostas/:id (Detalhes da Proposta)

**Resposta:** Proposta completa com todos os novos campos e checkpoints

#### 4. GET /api/propostas (Listar Propostas)

**Resposta:** Array de propostas. Decidir se retorna todos os campos ou apenas os principais para performance.

**Sugestão:** Retornar todos os campos, mas se houver muitas propostas, considerar paginação.

### VALIDAÇÕES NECESSÁRIAS

1. **Campos Obrigatórios:**
   - `cliente` (string, não vazio)
   - `valor` (number, >= 0)
   - `dataVencimento` (ISO date válida)

2. **Validações de Tipos:**
   - `unidadeMedida` deve estar na lista de valores válidos
   - `descontoTipo` deve ser 'percentual' ou 'valor'
   - `valorUnitario`, `quantidade`, `desconto` devem ser números >= 0 (se fornecidos)

3. **Validações de Lógica:**
   - Se `valorUnitario` e `quantidade` forem fornecidos, validar que o cálculo está correto (ou permitir diferença pequena por arredondamento)
   - Se `desconto` for fornecido, `descontoTipo` também deve ser fornecido
   - `dataVencimento` deve ser uma data futura (ou permitir datas passadas dependendo da regra de negócio)

4. **Validações de Formato:**
   - Todos os campos string devem ser sanitizados (remover espaços extras, etc)
   - Campos numéricos devem ser validados como números válidos

### MIGRAÇÃO DE DADOS EXISTENTES

Se já existem propostas no banco de dados:

1. **Adicionar novos campos como opcionais (nullable)**
2. **Não quebrar propostas existentes** - elas devem continuar funcionando mesmo sem os novos campos
3. **Valores padrão:**
   - `unidadeMedida`: `"unidade"` se não especificado
   - `descontoTipo`: `"percentual"` se não especificado
   - Todos os outros campos opcionais podem ser `null` ou `undefined`

### EXEMPLO DE PROPOSTA COMPLETA

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "cliente": "Mateus Supermercados",
  "produto": "Sorvete Premium",
  "marca": "Quick",
  "categoria": "Alimentos",
  "unidadeMedida": "caixa",
  "valorUnitario": 45.50,
  "quantidade": 120,
  "valor": 4914.00,
  "desconto": 5,
  "descontoTipo": "percentual",
  "condicoesPagamento": "30/60/90 dias",
  "prazoEntrega": "15 dias úteis",
  "dataVencimento": "2025-12-31T00:00:00.000Z",
  "status": "pendente",
  "dataCriacao": "2025-12-29T10:00:00.000Z",
  "estrategiaRepresentacao": "Ações promocionais em pontos estratégicos, parcerias com eventos locais, degustações em lojas",
  "publicoAlvo": "Famílias classe A/B, jovens adultos",
  "diferenciaisCompetitivos": "Produto premium com qualidade superior, embalagem atrativa, sabor único no mercado",
  "descricao": "Proposta de venda de sorvetes da marca Quick para o Mateus Supermercados",
  "observacoes": "O cliente compra bastante e tem boa relação comercial",
  "checkpoints": [
    {
      "id": "checkpoint-1",
      "status": "pendente",
      "label": "Pendente",
      "descricao": "Proposta criada",
      "data": "2025-12-29T10:00:00.000Z",
      "usuario": "sistema"
    }
  ]
}
```

### OBSERVAÇÕES IMPORTANTES

1. **Compatibilidade Retroativa:**
   - Propostas antigas sem os novos campos devem continuar funcionando
   - Todos os novos campos são opcionais
   - O sistema deve funcionar mesmo se apenas `cliente`, `valor` e `dataVencimento` forem fornecidos

2. **Performance:**
   - Se houver muitas propostas, considerar índices nos campos mais consultados:
     - `cliente`
     - `status`
     - `dataVencimento`
     - `categoria` (se usado para filtros)

3. **Busca e Filtros (Futuro):**
   - Considerar implementar filtros por:
     - Categoria
     - Marca
     - Faixa de valor
     - Status
     - Cliente
   - Busca por texto em: produto, marca, descrição

4. **Relatórios (Futuro):**
   - Com esses novos campos, será possível gerar relatórios mais ricos:
     - Produtos mais vendidos
     - Marcas mais representadas
     - Categorias com maior volume
     - Análise de descontos aplicados
     - Performance por estratégia de representação

### TESTES SUGERIDOS

1. **Criar proposta completa** com todos os campos
2. **Criar proposta mínima** apenas com campos obrigatórios
3. **Atualizar proposta** adicionando novos campos
4. **Validar cálculo** de valor total com desconto percentual
5. **Validar cálculo** de valor total com desconto em valor
6. **Validar** que propostas antigas continuam funcionando
7. **Testar** todos os valores válidos de `unidadeMedida`
8. **Testar** validações de campos obrigatórios
9. **Testar** endpoint de detalhes retornando todos os campos
10. **Testar** listagem de propostas com novos campos

### ESTRUTURA DE BANCO DE DADOS SUGERIDA

**Se usar SQL (PostgreSQL, MySQL, etc):**

```sql
ALTER TABLE propostas ADD COLUMN IF NOT EXISTS produto VARCHAR(255);
ALTER TABLE propostas ADD COLUMN IF NOT EXISTS marca VARCHAR(255);
ALTER TABLE propostas ADD COLUMN IF NOT EXISTS categoria VARCHAR(100);
ALTER TABLE propostas ADD COLUMN IF NOT EXISTS unidade_medida VARCHAR(50) DEFAULT 'unidade';
ALTER TABLE propostas ADD COLUMN IF NOT EXISTS valor_unitario DECIMAL(10, 2);
ALTER TABLE propostas ADD COLUMN IF NOT EXISTS quantidade DECIMAL(10, 2);
ALTER TABLE propostas ADD COLUMN IF NOT EXISTS desconto DECIMAL(10, 2);
ALTER TABLE propostas ADD COLUMN IF NOT EXISTS desconto_tipo VARCHAR(20) DEFAULT 'percentual';
ALTER TABLE propostas ADD COLUMN IF NOT EXISTS condicoes_pagamento VARCHAR(255);
ALTER TABLE propostas ADD COLUMN IF NOT EXISTS prazo_entrega VARCHAR(100);
ALTER TABLE propostas ADD COLUMN IF NOT EXISTS estrategia_representacao TEXT;
ALTER TABLE propostas ADD COLUMN IF NOT EXISTS publico_alvo VARCHAR(255);
ALTER TABLE propostas ADD COLUMN IF NOT EXISTS diferenciais_competitivos TEXT;

-- Índices sugeridos
CREATE INDEX IF NOT EXISTS idx_propostas_categoria ON propostas(categoria);
CREATE INDEX IF NOT EXISTS idx_propostas_marca ON propostas(marca);
```

**Se usar NoSQL (MongoDB, etc):**
- Adicionar os novos campos ao schema/documento
- Todos os campos opcionais podem ser omitidos do documento

---

**FIM DO PROMPT**

