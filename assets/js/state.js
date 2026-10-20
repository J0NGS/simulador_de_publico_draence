/**
 * ============================================
 * DRAENCE — ESTADO DA TELA
 * ============================================
 * Fonte única da verdade: os controles apenas refletem este objeto
 * e `simulate()` lê dele para calcular o resultado.
 */
import { DEFAULT_IMPORTANCE } from './core/config.js';
import { createPhaseState } from './core/phase.js';

export const state = {
  // Dados carregados dos JSON
  teams: [],
  cities: [],
  stadiums: [],

  // Escolhas do usuário
  home: null,
  visitor: null,
  stadium: null,
  isRental: false,
  rentalPrice: 0,
  importance: DEFAULT_IMPORTANCE,
  phases: { home: createPhaseState(), visitor: createPhaseState() },
  prices: {} // preço por setor; vazio/0 → preço base
};

export const cityName = (id) => state.cities.find((c) => c._id == id)?.city || '';
