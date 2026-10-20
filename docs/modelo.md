# 📐 Modelo Técnico - Simulador de Público Draence

## Visão Geral

Documento técnico que descreve o modelo implementado em `assets/js/core/logic.js` e utilizado por `assets/js/` (módulos `core/` e `ui/`).

**Objetivo:** Simular demanda por setor e resultado financeiro (receita bruta, custos, lucro) considerando:
- Curvas de engajamento (Torcida Ativa)
- Elasticidade-preço por setor
- Multiplicadores de qualidade do estádio
- Multiplicadores de aluguel para estádios neutros
- Restrições de capacidade
- Escada de valores (40% entre setores)

---

## Conjuntos e Nomenclatura

### Setores
```
popular      → Arquibancada geral (maior volume, menor preço)
intermediario → Setores intermediários (balanço)
premium      → Assentos especiais (menos volume, mais caro)
camarote     → Camarotes VIP (máximo preço, mínimo volume)
visitante    → Setor visitante (controlado)
```

### Séries
```
A → Divisão principal
B → Divisão intermediária
C → Divisão inferior
```

---

## Parâmetros Implementados

### Tabelas de Preços Base
```javascript
STD_PRICES = {
  popular:       25,
  intermediario: 50,
  premium:       80,
  camarote:      160,
  visitante:     35
}
```

### Custos Fixos e Variáveis
```javascript
STD_FIXED_COST      = 250.000    // Base operacional do estádio
STD_VARIABLE_COST   = 20         // Por cabeça (água, segurança, etc.)

// Ajustados pelo multiplicador de qualidade
Custo Final = Base × multiplicadorQualidade
```

### Elasticidade-Preço por Setor
```javascript
SectorElasticity = {
  popular:       2.8   // Muito sensível a preço
  intermediario: 1.8   // Sensível
  premium:       1.2   // Moderadamente sensível
  camarote:      0.6   // Pouco sensível (clientela premium)
  visitante:     1.8   // Sensível
}

// Fórmula: demand ∝ (precoBase / precoAtual) ^ elasticity
```

### Pesos de Interesse por Setor (InterestWeights)
```javascript
InterestWeights = {
  popular:       0.40   // 40% da base natural
  intermediario: 0.35   // 35%
  premium:       0.15   // 15%
  camarote:      0.05   // 5%
  visitante:     0.05   // 5%
}

// Nota: Σ weights = 1.0 (distribuição probabilística)
```

### Multiplicadores de Qualidade
```javascript
getQualityMultiplier(quality) → {
  "RUIM":       0.70  // Reduz preços/custos 30%
  "NORMAL":     0.85  // Reduz 15%
  "BOM":        1.00  // Referência
  "EXCELENTE":  1.30  // Aumenta 30%
}
```

### Multiplicador de Aluguel
```javascript
isRentalStadium = true  →  multiplicador = 2.0x
isRentalStadium = false →  multiplicador = 1.0x

// Aplica-se ao preço base: basePrice_final = basePrice × multiplier
```

---

## Curva de Torcida Ativa (homeFanBase)

Implementado em `calculateEffectiveFanBase(totalFans)`:

```javascript
// Regra: nem todos os fãs frequentam estádios
// Distribui em 3 faixas com taxas de conversão decrescentes

Se totalFans ≤ 30.000:
  homeFanBase = totalFans × 0.15     // 15% conversão
  
Senão se totalFans ≤ 300.000:
  homeFanBase = 30.000 × 0.15 + (totalFans - 30.000) × 0.04
  homeFanBase = 4.500 + (totalFans - 30.000) × 0.04
  
Senão:
  homeFanBase = 30.000 × 0.15 + 270.000 × 0.04 + (totalFans - 300.000) × 0.008
  homeFanBase = 4.500 + 10.800 + (totalFans - 300.000) × 0.008
```

**Exemplo Prático:**
```
Flamengo: 2.000.000 fãs
homeFanBase = 4.500 + 10.800 + (2.000.000 - 300.000) × 0.008
homeFanBase = 4.500 + 10.800 + 13.600
homeFanBase = 28.900 fãs ativos

Interpretação: De 2 milhões de fãs, apenas ~29k frequentam estádios
```

---

## Fator de Fase (f) e Importância (i)

### Fator de Fase
```javascript
// Calculado a partir dos últimos 5 jogos (geral e mandante)
// Escala: [0.1, 1.0]

0.1  → Time em má forma (0-1 vitória em 5)
0.4  → Time inconsistente
0.6  → Time na média
0.8  → Time em boa forma (4+ vitórias)
1.0  → Time em excelente forma
```

### Fator de Importância
```javascript
// Multiplicador contextual
// Padrão: 1.0 (jogo regular)

1.3  → Jogo de importância (semifinal, playoff)
2.0  → Clássico local
2.5  → Final de campeonato
```

### Fator de Aptidão (β)
```javascript
// Baseado na série do adversário
// Matriz:

        A      B      C
A    1.00   1.15   1.30   (séries mais fracas = mais atrativos)
B    0.87   1.00   1.15
C    0.77   0.87   1.00   (séries mais fortes = menos ingressos)
```

---

## Função de Demanda por Setor

### Assinatura
```javascript
calculateDemand({
  torcidaBase,                // homeFanBase (torcida ativa)
  fase,                       // Fator de fase [0.1-1.0]
  importancia,                // Multiplicador contextual
  pesoSetor,                  // InterestWeights[sector]
  precoBase,                  // STD_PRICES[sector] × multipliers
  precoAtual,                 // Preço ajustado pelo usuário
  atratividadeAdversario,     // Match aptitude (β)
  sector                      // Nome do setor
}) → demand (número de ingressos)
```

### Algoritmo

```
1. Demanda Potencial:
   potencial = torcidaBase × pesoSetor × fase × importancia × atratividadeAdversario
   
2. Razão de Preço:
   precoRatio = precoBase / precoAtual
   
3. Impacto Elasticidade:
   impactoPreco = precoRatio ^ SectorElasticity[sector]
   
4. Demanda Final:
   demanda = potencial × impactoPreco
   
5. Aplicar Capacidade:
   demandaEfetiva = min(demanda, capacidadeSetor)
```

### Exemplo Completo

```
ENTRADA:
  torcidaBase = 28.900
  fase = 0.80 (boa forma)
  importancia = 1.30 (jogo importante)
  pesoSetor = 0.40 (popular)
  precoBase = 25 (STD_PRICES)
  precoAtual = 35 (usuário aumentou)
  atratividadeAdversario = 1.00 (série A vs A)
  sector = 'popular'

CÁLCULO:

1. potencial = 28.900 × 0.40 × 0.80 × 1.30 × 1.00
             = 12.019

2. precoRatio = 25 / 35 = 0.714

3. elasticidade[popular] = 2.8
   impactoPreco = 0.714 ^ 2.8 = 0.427

4. demanda = 12.019 × 0.427 = 5.130 ingressos

5. capacidadePopular = 20.000
   demandaEfetiva = min(5.130, 20.000) = 5.130

SAÍDA: 5.130 ingressos potenciais para popular
```

---

## Pipeline de Cálculo Completo (computeAndRender)

```
INPUT VALIDATION
    ↓
NORMALIZATION
  • homeFanBase = calculateEffectiveFanBase(totalFans)
  • multiplicadorQualidade = getQualityMultiplier(quality)
  • multiplicadorAluguel = isRentalStadium ? 2.0 : 1.0
  • basePrice_final = STD_PRICES × multiplicadorQualidade × multiplicadorAluguel
    ↓
FIRST PASS: GROSS DEMAND
  Para cada setor:
  • demanda = calculateDemand(params)
  • demandaEfetiva = min(demanda, capacidadeSetor)
  • somaAtendimentoPossivel += demandaEfetiva
  • somaDemandaMandanteRaw += demanda (sem cap)
    ↓
EFFICIENCY CALCULATION (λ)
  Se somaAtendimentoPossivel > homeFanBase:
    λ = homeFanBase / somaAtendimentoPossivel
    Mensagem: "⚠️ Escassez detectada"
  Senão:
    λ = 1.0
    Mensagem: "✓ Sistema equilibrado"
    ↓
SECOND PASS: FINAL ALLOCATION
  Para cada setor:
  • publicoFinal = demandaEfetiva × λ
  • receita = publicoFinal × preçoAtual
  • custoVariavel = publicoFinal × STD_VARIABLE_COST
    ↓
AGGREGATE RESULTS
  • ReceitaBruta = Σ receita
  • CustoFixo = STD_FIXED_COST × multiplicadorQualidade
  • CustoVariávelTotal = Σ custoVariavel
  • LucroLíquido = ReceitaBruta - CustoFixo - CustoVariávelTotal
    ↓
PRICE CHAIN VALIDATION (40%)
  • Para cada par (sector[i], sector[i+1]):
    Se preço[i+1] < preço[i] × 1.4:
      preço[i+1] = preço[i] × 1.4
      updateSlider()
      recomputeAndRender()
    ↓
RENDER DASHBOARD
  • Barras de progresso (público/capacidade)
  • KPI cards (α, Φ, λ)
  • Tabela auditoria (setor, público, preço, receita, % ocupação)
  • Fórmulas visíveis: Φ = f·i·β
```

---

## Validações

### Restrições de Preço

```javascript
if (precoAtual < basePrice × 0.5)
  // Promoção exagerada
  input.style.color = 'green'
  
else if (precoAtual > basePrice × 3.0)
  // Preço abusivo
  input.style.color = 'red'
  feedback: "Preço exagerado - reduz demanda significativamente"
  
else if (precoAtual > basePrice × 1.5)
  // Preço elevado
  input.style.color = 'orange'
  
else
  // Preço normal
  input.style.color = 'default'
```

### Escada de Valores (40%)

```javascript
enforcePriceChain() {
  sectors = ['popular', 'intermediario', 'premium', 'camarote']
  
  para i = 0 até 2:
    precoMinimo = preço[i] × 1.4
    
    se preço[i+1] < precoMinimo:
      preço[i+1] = precoMinimo
      updateSlider(sector[i+1])
      recompute()
}
```

---

## Estrutura de Dados

### JSON: Teams
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

### JSON: Stadiums
```json
{
  "_id": "1",
  "name": "Maracanã",
  "city": "Rio de Janeiro",
  "capacity": 80000,
  "quality": "BOM",
  "owner": "1"        // null = estádio neutro/alugável
}
```

### JSON: Cities
```json
{
  "_id": "1",
  "city": "Rio de Janeiro",
  "state": "RJ",
  "population": 6700000
}
```

---

## Distribuição de Setores por Qualidade

```
QUALIDADE: RUIM
  popular:       60%
  intermediario: 20%
  premium:       10%
  camarote:      5%
  visitante:     5%

QUALIDADE: NORMAL
  popular:       50%
  intermediario: 25%
  premium:       15%
  camarote:      5%
  visitante:     5%

QUALIDADE: BOM
  popular:       40%
  intermediario: 30%
  premium:       20%
  camarote:      5%
  visitante:     5%

QUALIDADE: EXCELENTE
  popular:       35%
  intermediario: 30%
  premium:       25%
  camarote:      5%
  visitante:     5%
```

---

## Notas de Implementação

### Performance
- Cálculos O(n) onde n=5 setores → negligenciável
- DOM batch updates com `requestAnimationFrame`
- Memory footprint ~5MB

### Compatibilidade
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile: iOS 12+, Android 6+

---

**Versão**: 2.1.0  
**Última Atualização**: Janeiro 2025
3. Aplicação da elasticidade: `fatorPreco = priceRatio ^ k(sector)`.
4. Demanda ajustada: `demanda = potencial * fatorPreco`.
5. Proteção contra preços abusivos: se `precoAtual` excede muito `precoBase`, aplica-se penalidade adicional (reduz `fatorPreco`) para evitar exploits.
6. Capacidade: `publicoFinal = min(capacidadeSetor, round(demanda))`.

Observação: `visitante` utiliza `precoAtual = preco(intermediario)` por regra funcional do app.

### Regras operacionais implementadas
- Enforce price chain: ao editar preços o sistema aplica uma restrição encadeada (cada próximo setor deve ser >= 1.5x do setor anterior) para manter coerência de faixas.
- Limites de sanity: valores mínimos e máximos são validados no front-end (ex.: preços não nulos, sliders limitados entre `0.5*P_base` e `3.0*P_base`).

### Custos e resultado financeiro
- `fixedCostReal = STD_FIXED_COST * multiplier`.
- `costPerHead = Math.round(STD_VARIABLE_COST * multiplier)`.
- `variableCostReal = costPerHead * totalAttendance`.
- `grossRevenue = sum( publicoFinal(s) * precoAtual(s) )`.
- `netProfit = grossRevenue - (fixedCostReal + variableCostReal)`.

### Notas de auditoria e transparência
- Tooltips na interface exibem a fórmula aplicada por setor e os valores intermediários (potencial, fator preço, elasticidade, resultado), permitindo auditoria manual dos cálculos.

### Compatibilidade com código existente
- Este documento reflete o comportamento atual de `assets/js/` (módulos `core/` e `ui/`) e `assets/js/core/logic.js`. Qualquer alteração nos nomes (`STD_PRICES`, `STD_VARIABLE_COST`, `SectorElasticity`, `calculateEffectiveFanBase`, `calculateDemand`) deve ser refletida aqui e no código.

---
Referências rápidas (variáveis no código): `STD_PRICES`, `STD_FIXED_COST`, `STD_VARIABLE_COST`, `calculateEffectiveFanBase()`, `calculatePhaseFactor()`, `calculateDemand()`, `enforcePriceChain()`.