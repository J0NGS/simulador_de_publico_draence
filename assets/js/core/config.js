/**
 * ============================================
 * DRAENCE — CONFIGURAÇÃO DO SIMULADOR
 * ============================================
 * Constantes de negócio e metadados de exibição.
 * Os parâmetros do modelo de demanda ficam em `logic.js`.
 */

/** Setores com preço editável (o setor visitante espelha o intermediário). */
export const SECTORS = Object.freeze(['popular', 'intermediario', 'premium', 'camarote']);

/** Todos os setores do estádio, na ordem de exibição. */
export const ALL_SECTORS = Object.freeze([...SECTORS, 'visitante']);

export const SECTOR_META = Object.freeze({
  popular: { label: 'Popular', icon: 'users' },
  intermediario: { label: 'Intermediário', icon: 'ticket' },
  premium: { label: 'Premium', icon: 'star' },
  camarote: { label: 'Camarote', icon: 'gem' },
  visitante: { label: 'Visitante', icon: 'map-pin' }
});

/** Preços de referência para estádio de qualidade BOM (multiplicador 1.0). */
export const STD_PRICES = Object.freeze({
  popular: 25,
  intermediario: 50,
  premium: 80,
  camarote: 160
});

/** Custo fixo base (estádio BOM). */
export const STD_FIXED_COST = 50000;

/** Custo variável base por torcedor (estádio BOM). */
export const STD_VARIABLE_COST = 10;

/** Estádio sem dono: preços e custos escalam por este fator. */
export const RENTAL_PRICE_FACTOR = 2;

/** Aluguel de estádio neutro (R$). */
export const RENTAL = Object.freeze({ min: 10000, max: 500000, step: 5000, initial: 50000 });

/** Cada setor deve custar ao menos 40% a mais que o anterior (escada de valor). */
export const PRICE_CHAIN_FACTOR = 1.4;

/** Limiares (relativos ao preço base) do aviso de preço. */
export const PRICE_THRESHOLDS = Object.freeze({ cheap: 0.8, expensive: 1.5, abusive: 2.2 });

/** Faixa do slider de preço, relativa ao preço base. */
export const PRICE_SLIDER = Object.freeze({ min: 0.5, max: 3 });

/** Quanto da torcida visitante total viaja para o jogo. */
export const VISITOR_TRAVEL_SHARE = 0.1;

/** Piso da fase calculada automaticamente e teto da fase do visitante. */
export const PHASE_FLOOR = 0.1;
export const VISITOR_PHASE_CAP = 1.1;

/** Resultado de cada jogo do momento: pontos ganhos. */
export const RESULT = Object.freeze({
  win: { points: 3, letter: 'V', label: 'Vitória' },
  draw: { points: 1, letter: 'E', label: 'Empate' },
  loss: { points: 0, letter: 'D', label: 'Derrota' }
});

/** Ordem em que o clique alterna o resultado: V → E → D → V. */
export const RESULT_CYCLE = Object.freeze([3, 1, 0]);

export const IMPORTANCE_OPTIONS = Object.freeze([
  { value: 0.5, label: 'Amistoso irrelevante (×0,5)' },
  { value: 0.75, label: 'Jogo de cumprir tabela (×0,75)' },
  { value: 1, label: 'Campeonato regular (×1,0)' },
  { value: 1.25, label: 'Clássico / jogo importante (×1,25)' },
  { value: 1.5, label: 'Mata-mata / decisivo (×1,5)' },
  { value: 1.75, label: 'Semifinal / jogo do título (×1,75)' },
  { value: 2, label: 'Grande final (×2,0)' }
]);

export const DEFAULT_IMPORTANCE = 1;
