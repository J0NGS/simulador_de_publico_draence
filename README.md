# ⚽ Simulador de Público Draence

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34C26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![JSON](https://img.shields.io/badge/JSON-000000?style=for-the-badge&logo=json&logoColor=white)

**Ferramenta interativa para simulação e análise de receita em estádios de futebol**

[Sobre o Projeto](#-sobre-o-projeto) •
[Características](#-características) •
[Arquitetura](#-arquitetura) •
[Como Usar](#-como-usar) •
[Tecnologias](#-tecnologias)

</div>

---

## 📋 Sobre o Projeto

**Simulador de Público Draência** é uma aplicação web moderna e interativa que simula a demanda de público em estádios de futebol, calculando receitas, custos e lucratividade com base em múltiplos fatores econômicos e comportamentais.

A ferramenta utiliza **algoritmos avançados de elasticidade de preço**, **fator de fase dos times** e **análise de engajamento de torcedores** para oferecer simulações realistas e educativas.

### 🎯 Propósito

O simulador permite:
- 📊 Análise de **demanda por setor** (Popular, Intermediário, Premium, Camarote)
- 💰 Cálculo de **receita bruta** e **lucro líquido**
- 🏟️ Seleção de **estádios neutros ou próprios** com variação de capacidade e qualidade
- 📈 Ajuste de **preços de ingressos** com feedback visual em tempo real
- 🎬 Simulação do **impacto da fase do time** no público
- ⚡ Variação de **importância do jogo** (Campeonato, Clássico, Amistoso)
- 🔍 Dashboard **Enterprise** com análise detalhada de demanda
- 👥 Cálculo automático de **torcida ativa** baseado em perfil de engajamento

### 👨‍💻 Desenvolvedor

**João Gonçalo (J0NGS)**
- 📧 Email: jnetogoncalo@gmail.com
- 🔗 GitHub: [@J0NGS](https://github.com/J0NGS)

---

## 🌟 Características

### 📌 Funcionalidades Principais

✅ **Seleção de Times**
- Escolha mandante e visitante de um banco de times draence
- Integração com dados de torcida e performance

✅ **Gerenciamento de Estádios**
- Seleção entre estádio próprio e neutro
- Preço de aluguel para estádios neutros
- Filtros por qualidade (Ruim, Normal, Bom, Excelente)
- Visualização de capacidade e localização

✅ **Precificação Dinâmica**
- Slider + input para ajuste de preços por setor
- Escada de valores com validação (40% entre setores)
- Feedback visual (Promoção, Preço Alto, Preço Exagerado)
- Sincronização automática slider ↔ input

✅ **Análise de Demanda**
- Cálculo de demanda bruta por setor
- Aplicação de fator de escassez global
- Dashboard analítico com tabelas de auditoria
- Fórmulas matemáticas visíveis: **Φ = f · i · β**

✅ **KPIs Financeiros**
- Receita bruta por setor
- Custos fixos + variáveis
- Lucro líquido com indicador de cor
- Detalhamento de ocupação por setor

---

## 🏗️ Arquitetura

### 📁 Estrutura de Diretórios

```
simulador_de_publico_draence/
│
├── 📄 index.html                    # Interface principal
├── 📄 modelo.md                     # Documentação técnica
├── 📄 README.md                     # Este arquivo
│
├── 📁 css/
│   └── styles.css                   # Estilos com tema orgânico (Mantine)
│
├── 📁 js/
│   ├── app.js                       # Lógica principal da aplicação
│   ├── Logic.js                     # Engine de cálculo de demanda
│   └── [Outras dependências]
│
├── 📁 data/
│   ├── mongo_teams_drae_data.json   # Times brasileiros
│   ├── mongo_cities_drae_data.json  # Cidades brasileiras
│   ├── mongo_stadiuns_drae_data.json # Estádios
│   └── Draence_Distribution_by_City_Team.csv
│
├── 📁 public/                       # Arquivos estáticos
│
├── 📁 scripts/
│   ├── generate_stadiums.py         # Script para gerar dados de estádios
│   ├── update_teams_from_csv.py     # Script para atualizar times
│   └── debug_city_team_mapping.py   # Script de debug
│
└── 📁 monitoring/
    └── prometheus.yml               # (Futuro) Métricas da aplicação
```

### 🔧 Fluxo de Dados

```
┌─────────────────────────────────────────────────────┐
│  1. ENTRADA DE DADOS                                │
│  • Seleção: Mandante, Visitante, Estádio           │
│  • Fase do Time (Auto ou Manual)                    │
│  • Importância do Jogo                              │
│  • Preços por Setor                                 │
└────────────────┬────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────┐
│  2. CÁLCULO DE DEMANDA (Logic.js)                   │
│  • Torcida Ativa (α) → Engajamento (η)             │
│  • Fator de Evento (Φ) = f · i · β                 │
│  • Demanda por Setor com Elasticidade              │
│  • Soma de Demanda Efetiva                          │
└────────────────┬────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────┐
│  3. AJUSTE DE FIDELIDADE                            │
│  • Se demanda > torcida ativa:                      │
│    λ = α / Σ(demanda efetiva)                       │
│  • Aplica fator de escassez global                  │
└────────────────┬────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────┐
│  4. RENDERIZAÇÃO E ANÁLISE                          │
│  • Atualizar barras de progresso                    │
│  • Calcular Receita Bruta                           │
│  • Calcular Custos (Fixo + Variável)               │
│  • Exibir Lucro e Dashboard Enterprise              │
└─────────────────────────────────────────────────────┘
```

### 📐 Componentes Principais

| Componente | Responsabilidade |
|-----------|-----------------|
| `app.js` | Orquestração, renderização, event listeners |
| `Logic.js` | Motor de cálculo, fórmulas, elasticidade |
| `styles.css` | Design responsivo, tema Mantine personalizado |
| `index.html` | Estrutura HTML, layout Bootstrap |

---

## 💻 Tecnologias

### Core

- **HTML5** - Estrutura semântica
- **CSS3** - Layout responsivo (Grid, Flexbox)
- **JavaScript (ES6+)** - Lógica interativa
- **Bootstrap 5** - Framework CSS
- **Bootstrap Icons** - Ícones vetoriais

### Integrações

- **JSON** - Armazenamento de dados (times, cidades, estádios)
- **Python** - Scripts de geração de dados

### Design System

- **Paleta Mantine** - Cores harmônicas e orgânicas
- **Variáveis CSS** - Tema customizável
- **Badges Bootstrap** - Indicadores visuais
- **Tooltips Bootstrap** - Ajuda contextual

---

### 📖 Guia de Uso

#### 1️⃣ Seleção de Times

```
Mandante (Casa)      → Escolha o time que joga em casa
Visitante (Fora)     → Escolha o time adversário
```

#### 2️⃣ Configuração de Estádio

```
Selecione o Estádio  → Próprio (dono) ou Neutro (aluguel)
                        ↓
Se Neutro:
  - Defina preço de aluguel
  - Preço base aumenta em 100%
  
Qualidade:           → Ruim | Normal | Bom | Excelente
Capacidade:          → Automática por qualidade
```

#### 3️⃣ Ajuste de Fase e Importância

```
Fase do Time         → Automática (últimos 5 jogos)
                     → Ou manual (0-100%)
                     
Importância          → Amistoso (0.8x) | Campeonato (1.0x) | Clássico (1.3x)
```

#### 4️⃣ Precificação por Setor

```
Popular              → Base de preço mais baixa
  ↓
Intermediário        → +40% (escada de valores)
  ↓
Premium              → +40% do intermediário
  ↓
Camarote             → +40% do premium
  ↓
Visitante            → Igual ao Intermediário (automático)
```

**Dicas:**
- 🎚️ Use o slider para ajustes rápidos
- 📝 Digite valores exatos no input
- 🔴 Vermelho = Preço exagerado
- 🟡 Amarelo = Preço acima da média
- 🟢 Verde = Promoção

#### 5️⃣ Analisar Resultados

```
Dashboard Enterprise (seção "Memória de Cálculo"):

📊 Cards de KPI:
   • CAPACIDADE ATIVA (α)   → Torcida que vai ao estádio
   • FATOR DE EVENTO (Φ)    → Multiplicador de contexto
   • EFICIÊNCIA (λ)         → % de aproveitamento

📈 Tabela de Auditoria:
   • Por setor: interesse bruto, capacidade, demanda ajustada
   • Status de escassez (se houver)

💰 Resumo Financeiro:
   • Total Bruto → Demanda antes do ajuste
   • Teto Real  → Limite de torcedores ativos
   • Aproveitamento → % ocupação média
```

---

## 🧮 Fórmulas Matemáticas

### Torcida Ativa (α)

```
α = rawFans × getBand(rawFans)

Bandas de Engajamento:
  ≤ 5k      → 1.00 (100%)  [Micro]
  ≤ 10k     → 0.85 (85%)   [Pequeno]
  ≤ 50k     → 0.65 (65%)   [Médio]
  ≤ 100k    → 0.45 (45%)   [Grande]
  ≤ 300k    → 0.20 (20%)   [Gigante]
  ≤ 500k    → 0.10 (10%)   [Monumental]
  > 500k    → 0.03 (3%)    [Colossal]
```

### Fator de Evento (Φ)

```
Φ = f · i · β

f  = Fase do Time           [0.1 - 1.0]
i  = Importância do Jogo    [0.8 - 1.3]
β  = Aptidão (A vs B/C)     [0.7 - 1.5]
```

### Demanda por Setor

```
D_setor = α · w · Φ · (1 + elasticidade)

w   = Peso do Setor (preferência natural)
k   = Elasticidade (sensibilidade ao preço)

Elasticidade:
  Popular       → k = 1.2 (sensível)
  Intermediário → k = 0.9 (médio)
  Premium       → k = 0.6 (insensível)
  Camarote      → k = 0.4 (muito insensível)
```

### Eficiência (λ)

```
Se Σ(demanda_efetiva) > α:
  λ = α / Σ(demanda_efetiva)
  
Senão:
  λ = 1.0 (sem escassez)
```

---

## 📝 Estrutura de Dados

### Times (mongo_teams_drae_data.json)

```json
{
  "_id": "1",
  "name": "Flamengo",
  "city_id": "1",
  "current_series": "A",
  "stadium": "Maracanã",
  "stadium_capacity": 80000,
  "stadium_quality": "BOM",
  "fans": {
    "city": 2000000,
    "region": 3500000,
    "national": 5000000
  }
}
```

### Estádios (mongo_stadiuns_drae_data.json)

```json
{
  "_id": "1",
  "name": "Maracanã",
  "city": "1",
  "capacity": 80000,
  "quality": "BOM",
  "owner": "1"
}
```

### Cidades (mongo_cities_drae_data.json)

```json
{
  "_id": "1",
  "city": "Rio de Janeiro",
  "state": "RJ",
  "population": 6700000
}
```

---

## 🎨 Customização

### Alterar Paleta de Cores

Edite `css/styles.css`:

```css
:root {
  --brand-7: #576352;      /* Cor principal */
  --accent: #C88D56;       /* Accent color */
  --color-profit: #27ae60; /* Lucro */
  --color-loss: #e74c3c;   /* Prejuízo */
}
```

### Ajustar Valores Base

Edite `js/app.js`:

```javascript
const STD_PRICES = {
  popular: 25,
  intermediario: 50,
  premium: 80,
  camarote: 160
};

const STD_FIXED_COST = 50000;
const STD_VARIABLE_COST = 10;
```

---

## 📚 Referências e Documentação

- 📄 [Modelo Técnico Detalhado](./modelo.md)
- 🔗 [Bootstrap Documentation](https://getbootstrap.com)
- 📊 [Mantine Design System](https://mantine.dev)
- 💜 [Bootstrap Icons](https://icons.getbootstrap.com)

---

## 📄 Licença

Copyright (c) 2025 João Gonçalo (J0NGS). Todos os direitos reservados.

---

## 📞 Contato

**João Gonçalo (J0NGS)**
- 📧 Email: jnetogoncalo@gmail.com
- 🔗 GitHub: [@J0NGS](https://github.com/J0NGS)

---

<div align="center">

**Desenvolvido com ❤️ usando JavaScript Vanilla e boas práticas de UX**

*Versão 2.1.0 - Janeiro 2025*

</div>
