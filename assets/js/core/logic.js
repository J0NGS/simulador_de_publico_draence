/*
 * Funções de lógica matemática para a Calculadora de Renda de Estádio
 * - `StadiumQuality`: distribuição percentual por qualidade do estádio
 * - `calculateSectorDistribution(totalCapacity, quality)`: converte porcentagens em cadeiras inteiras
 * - `calculateDemand(params)`: calcula demanda por setor a partir da fórmula dada
 *
 * Observações:
 * - Todas as funções são escritas em JS puro e não conectam ao DOM diretamente.
 * - Exportadas como módulo ES (`import { calculateDemand } from './logic.js'`).
 */

// Enum/objeto que define a distribuição percentual por setor (valores somam 1.0)
export const StadiumQuality = Object.freeze({
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
export const QualityMultiplier = Object.freeze({
  RUIM: 0.6,
  REGULAR: 0.8,
  BOM: 1.0,
  OTIMO: 1.25, // Ajuste fino para não pular demais
  EXCELENTE: 1.5
});

// Elasticidades por setor (valores base para importancia = 1.0)
export const SectorElasticity = Object.freeze({
  popular: 2.8,
  intermediario: 1.5,
  premium: 1.1,
  camarote: 0.6,
  visitante: 1.5
});

// Pesos de Interesse da Torcida (w) - Representa a vontade natural da torcida por cada setor
// Reequilíbrio para estádios de elite: maior propensão a setores superiores em jogos importantes
export const InterestWeights = Object.freeze({
  popular: 1.0,
  intermediario: 0.6,
  premium: 0.25,
  camarote: 0.05,
  visitante: 1.0 // Calculado à parte
});

// Multiplicador de atratividade do adversário por Série (influencia público visitante/geral)
export const SeriesMultiplier = Object.freeze({
  A: 1.2,
  B: 0.6,
  C: 0.3
});

// Matriz de prestígio do confronto (MandanteSerie+VisitanteSerie)
export const PrestigeMatrix = {
  AA: 1.5, AB: 0.7, AC: 0.4,
  BA: 1.5, BB: 1.0, BC: 0.6,
  CA: 2.2, CB: 1.3, CC: 0.8
};

export function getMatchAptitude(homeSerie, awaySerie) {
  const key = ((homeSerie || '') + (awaySerie || '')).toUpperCase();
  return PrestigeMatrix[key] || 0.5;
}

/**
 * Normaliza uma string de qualidade removendo acentos e formatando para uppercase
 * Retorna a chave compatível com `StadiumQuality` (fallback para 'BOM')
 */
export function normalizeQuality(quality) {
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
export function calculateSectorDistribution(totalCapacity, quality) {
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
export function calculateDemand({ torcidaBase = 0, fase = 1, importancia = 1, pesoSetor = 1, precoBase = 1, precoAtual = 1, sector = 'popular', atratividadeAdversario = 1 } = {}) {
  // Validações básicas
  if (precoAtual <= 0) {
    throw new Error('precoAtual deve ser > 0');
  }

  const elasticity = SectorElasticity[sector];
  if (elasticity === undefined) {
    throw new Error(`Setor desconhecido para elasticidade: ${sector}`);
  }

  let baseComponent = torcidaBase * fase * importancia * pesoSetor * atratividadeAdversario;

  // Camarote: comportamento exclusivo — muito sensível ao evento
  if (sector === 'camarote') {
    baseComponent = baseComponent * Math.pow(importancia, 2);
  }

  // Razão de Preço (Base / Atual)
  // Se Preço Atual é o dobro do Base, ratio é 0.5
  const ratio = precoBase / precoAtual;
  // Ajuste dinâmico da elasticidade com base na importância
  // Quanto maior a importância, menor a sensibilidade (elasticidade reduz).
  // Usamos 1 / sqrt(importancia) para criar uma relação inversa suave.
  const dynamicElasticity = elasticity * (1 / Math.sqrt(Math.max(0.001, importancia)));

  // Penalidade anti-abuso (suavizada): somente aplica quando o preço ultrapassa um limiar
  // Se ratio >= 0.45 (preço até ~2.22x o base), penalty = 1 (neutro).
  // Se ratio < 0.45, aplicamos uma redução exponencial suave para desincentivar abusos.
  let penalty = 1.0;
  if (ratio < 0.45) {
    // expoente negativo para reduzir a demanda conforme o ratio diminui
    // parâmetro 4 faz a curva cair de forma adequada (ajustável)
    penalty = Math.exp((ratio - 0.45) * 4);
  }

  // Aplica a elasticidade dinâmica e a penalidade
  const demand = baseComponent * Math.pow(ratio, dynamicElasticity) * penalty;

  // Retorna objeto com demanda calculada e elasticidade efetiva para auditoria
  return { demand: Math.max(0, demand), dynamicElasticity };
}

/**
 * Retorna o multiplicador numérico baseado na string de qualidade
 */
export function getQualityMultiplier(qualityString) {
  const q = normalizeQuality(qualityString); // Garante que é maiúsculo e válido
  return QualityMultiplier[q] || 1.0;
}
