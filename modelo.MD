## Modelo técnico (atualizado)

Documento técnico curto que descreve o modelo implementado em `js/logic.js` e utilizado por `js/app.js`.

Objetivo: simular demanda por setor e resultado financeiro (receita bruta, custos, lucro) considerando:
- curvas de engajamento (Torcida Ativa),
- elasticidade-preço por setor,
- multiplicador de qualidade do estádio,
- restrições de capacidade e proteções contra preços abusivos.

### Conjuntos e nomenclatura
- Setores: `popular`, `intermediario`, `premium`, `camarote`, `visitante`.

### Parâmetros implementados
- `STD_PRICES`: tabela base (ex.: popular: 25, intermediario:50, premium:80, camarote:160).
- `STD_FIXED_COST`: custo fixo base (ex.: 250000) — escala com multiplicador de qualidade.
- `STD_VARIABLE_COST`: custo variável por torcedor (ex.: 20) — escala com multiplicador de qualidade.
- `SectorElasticity`: elasticidades aplicadas no código (valores atuais):
	- `popular`: 2.8
	- `intermediario`: 1.8
	- `premium`: 1.2
	- `camarote`: 0.6
	- `visitante`: 1.8
- `InterestWeights` (w): pesos de interesse por setor (definem distribuição natural de preferência).
- `StadiumQuality` / `getQualityMultiplier()`: mapeamento de níveis de qualidade para multiplicadores de preço e custo.

### Curva de Torcida Ativa (implementada em `calculateEffectiveFanBase`)
Dividida em três faixas:
- Núcleo duro: até 30.000 torcedores → 15% de conversão.
- Torcida ativa: próximos 270.000 (30k–300k) → 4% de conversão.
- Massa: acima de 300k → 0.8% de conversão.

Resultado: `homeFanBase = calculateEffectiveFanBase(totalFans)`.

### Fator de fase (Alfa) e importância
- `faseMandante` e `faseVisitante` são calculados a partir dos últimos 5 jogos (geral e casa/fora) ou via input manual (modo Auto/Manual). Retornam valores normalizados entre 0.1 e 1.0.
- `importancia` é um multiplicador (ex.: 1.0 para jogo regular, até 2.0 para final).

### Função de demanda por setor (implementada em `calculateDemand`)
Entrada principal:
- `torcidaBase` (homeFanBase)
- `fase` (fator de fase)
- `importancia`
- `pesoSetor` (weight w)
- `precoBase` e `precoAtual`
- `sector` (nome do setor)

Passos resumidos:
1. Demanda potencial: `potencial = torcidaBase * pesoSetor * fase * importancia`.
2. Ajuste de preço: `priceRatio = precoBase / precoAtual`.
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
- Este documento reflete o comportamento atual de `js/app.js` e `js/logic.js`. Qualquer alteração nos nomes (`STD_PRICES`, `STD_VARIABLE_COST`, `SectorElasticity`, `calculateEffectiveFanBase`, `calculateDemand`) deve ser refletida aqui e no código.

---
Referências rápidas (variáveis no código): `STD_PRICES`, `STD_FIXED_COST`, `STD_VARIABLE_COST`, `calculateEffectiveFanBase()`, `calculatePhaseFactor()`, `calculateDemand()`, `enforcePriceChain()`.