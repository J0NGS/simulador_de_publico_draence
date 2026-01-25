/*
 * Funções de lógica matemática para a Calculadora de Renda de Estádio
 * - `StadiumQuality`: distribuição percentual por qualidade do estádio
 * - `calculateSectorDistribution(totalCapacity, quality)`: converte porcentagens em cadeiras inteiras
 * - `calculateDemand(params)`: calcula demanda por setor a partir da fórmula dada
 *
 * Observações:
 * - Todas as funções são escritas em JS puro e não conectam ao DOM diretamente.
 * - Exportadas em `window.Logic` para fácil reutilização/depuração no console.
 */

// Enum/objeto que define a distribuição percentual por setor (valores somam 1.0)
const StadiumQuality = Object.freeze({
  RUIM: {
    popular: 0.50,
    intermediario: 0.20,
    premium: 0.08,
    camarote: 0.02,
    visitante: 0.20
  },
  REGULAR: {
    popular: 0.40,
    intermediario: 0.25,
    premium: 0.10,
    camarote: 0.05,
    visitante: 0.20
  },
  BOM: {
    popular: 0.35,
    intermediario: 0.28,
    premium: 0.12,
    camarote: 0.05,
    visitante: 0.20
  },
  OTIMO: {
    popular: 0.32,
    intermediario: 0.30,
    premium: 0.14,
    camarote: 0.04,
    visitante: 0.20
  },
  EXCELENTE: {
    popular: 0.28,
    intermediario: 0.30,
    premium: 0.18,
    camarote: 0.04,
    visitante: 0.20
  }
});

// Multiplicador de Qualidade (Q) - Afeta Preço Base e Custo Fixo
const QualityMultiplier = Object.freeze({
  RUIM: 0.6,
  REGULAR: 0.8,
  BOM: 1.0,
  OTIMO: 1.25, // Ajuste fino para não pular demais
  EXCELENTE: 1.5
});

// Elasticidades por setor (constantes k fornecidas) - recalibradas para maior sensibilidade
const SectorElasticity = Object.freeze({
  popular: 6,       // Aumentado de 2.0. Torcida popular não aceita aumento.
  intermediario: 2.5, // Aumentado de 1.2. Classe média sensível.
  premium: 2,       // Aumentado de 0.7. Rico aceita pagar, mas não o dobro.
  camarote: 1.8,      // Aumentado de 0.3. Corporativo ainda é inelástico.
  visitante: 2.5      // Acompanha o intermediário.
});

// Pesos de Interesse da Torcida (w) - Representa a vontade natural da torcida por cada setor
const InterestWeights = Object.freeze({
  popular: 0.60,
  intermediario: 0.25,
  premium: 0.10,
  camarote: 0.05,
  visitante: 1.0 // Calculado à parte
});

/**
 * Normaliza uma string de qualidade removendo acentos e formatando para uppercase
 * Retorna a chave compatível com `StadiumQuality` (fallback para 'BOM')
 */
function normalizeQuality(quality) {
  if (!quality && quality !== 0) return 'BOM';
  const s = String(quality).normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase().trim();
  if (StadiumQuality[s]) return s;
  const condensed = s.replace(/\s+/g, '');
  if (StadiumQuality[condensed]) return condensed;
  return 'BOM';
}

/**
 * Calcula a distribuição inteira de cadeiras por setor a partir da capacidade total e da qualidade
 * Utiliza o método do "maior resto" (Largest Remainder Method) para distribuir os assentos remanescentes
 *
 * @param {number} totalCapacity - capacidade total do estádio (número inteiro positivo)
 * @param {string} quality - uma das chaves de StadiumQuality (ex: 'OTIMO', 'RUIM') ou uma string com acentos
 * @returns {Object} mapa { popular, intermediario, premium, camarote, visitante } com números inteiros de cadeiras
 */
function calculateSectorDistribution(totalCapacity, quality) {
  if (!Number.isFinite(totalCapacity) || totalCapacity <= 0) {
    throw new Error('totalCapacity deve ser um número maior que zero');
  }

  const key = normalizeQuality(quality);
  const dist = StadiumQuality[key];
  if (!dist) {
    throw new Error(`Qualidade desconhecida (após normalizar): ${quality} -> ${key}`);
  }

  // Cálculo inicial (valores exatos)
  const exact = {};
  Object.keys(dist).forEach(key => {
    exact[key] = dist[key] * totalCapacity;
  });

  // Arredonda para baixo e calcula resto
  const floored = {};
  const remainders = [];
  let allocated = 0;

  Object.keys(exact).forEach(key => {
    const f = Math.floor(exact[key]);
    floored[key] = f;
    allocated += f;
    remainders.push({ key, remainder: exact[key] - f });
  });

  // Distribui os assentos que faltam conforme maiores restos
  let remaining = totalCapacity - allocated;
  remainders.sort((a, b) => b.remainder - a.remainder);

  let i = 0;
  while (remaining > 0) {
    const key = remainders[i % remainders.length].key;
    floored[key] += 1;
    remaining -= 1;
    i += 1;
  }

  return floored;
}

/**
 * Calcula a demanda esperada para um setor com base na fórmula fornecida:
 * Demanda = (TorcidaBase * Fase * Importancia * PesoSetor) * (PrecoBase / PrecoAtual)^Elasticidade
 *
 * Parâmetros esperados (objeto):
 * - torcidaBase: número base de torcedores (ex: tamanho da torcida do time no setor)
 * - fase: fator numérico representando fase do time (ex: 1, 1.1, 1.5)
 * - importancia: fator numérico representando importância do jogo (ex: 1 a 2)
 * - pesoSetor: peso do setor para transformação de torcida base (ex: fração entre 0 e 1)
 * - precoBase: preço de referência (número positivo)
 * - precoAtual: preço aplicado atualmente (número positivo)
 * - sector: string indicando o setor ('popular','intermediario','premium','camarote','visitante')
 *
 * Retorna um número >= 0 (não arredonda internamente; o chamador decide arredondar ou limitar)
 */
function calculateDemand({ torcidaBase = 0, fase = 1, importancia = 1, pesoSetor = 1, precoBase = 1, precoAtual = 1, sector = 'popular' } = {}) {
  // Validações básicas
  if (precoAtual <= 0) {
    throw new Error('precoAtual deve ser > 0');
  }

  const elasticity = SectorElasticity[sector];
  if (elasticity === undefined) {
    throw new Error(`Setor desconhecido para elasticidade: ${sector}`);
  }

  const baseComponent = torcidaBase * fase * importancia * pesoSetor;

  // Razão de Preço (Base / Atual)
  // Se Preço Atual é o dobro do Base, ratio é 0.5
  const ratio = precoBase / precoAtual;
  
  // Fator de Penalidade Extra para Preços Abusivos
  // Se o preço cobrado for mais que o dobro do base (ratio < 0.5), puna a demanda
  let penalty = 1.0;
  if (ratio < 0.5) { 
     // Ex: Se cobrar 3x o preço (ratio 0.33), penalty será ~0.55
     penalty = Math.pow(ratio * 2, 2); 
  }

  // Aplica a elasticidade E a penalidade
  const demand = baseComponent * Math.pow(ratio, elasticity) * penalty;

  // Demanda não pode ser negativa (proteção extra)
  return Math.max(0, demand);
}

/**
 * Retorna o multiplicador numérico baseado na string de qualidade
 */
function getQualityMultiplier(qualityString) {
  const q = normalizeQuality(qualityString); // Garante que é maiúsculo e válido
  return QualityMultiplier[q] || 1.0;
}

// Export para uso/interação futura (sem conectar ao DOM diretamente aqui)
if (typeof window !== 'undefined') {
  window.Logic = window.Logic || {};
  window.Logic.StadiumQuality = StadiumQuality;
  window.Logic.calculateSectorDistribution = calculateSectorDistribution;
  window.Logic.calculateDemand = calculateDemand;
  window.Logic.SectorElasticity = SectorElasticity;
  window.Logic.normalizeQuality = normalizeQuality;
  window.Logic.getQualityMultiplier = getQualityMultiplier; // NOVO
  window.Logic.QualityMultiplier = QualityMultiplier; // NOVO
  window.Logic.InterestWeights = InterestWeights; // NOVO
}

// Exports (para ambientes module-aware, caso futuramente migremos)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StadiumQuality, calculateSectorDistribution, calculateDemand, SectorElasticity };
}