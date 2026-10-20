/**
 * ============================================
 * DRAENCE — FASE (MOMENTO) DO TIME
 * ============================================
 * Fator entre 0 e 1 que mede a fase recente do time.
 * Automático: últimos 5 jogos no geral (70%) e na condição do jogo (30%).
 * Manual: força informada de 0 a 100.
 */
import { PHASE_FLOOR, RESULT_CYCLE } from './config.js';

const MAX_POINTS = 15;

/** Estado inicial de um time: cinco empates em cada lista. */
export const createPhaseState = () => ({
  mode: 'auto',
  general: [1, 1, 1, 1, 1],
  venue: [1, 1, 1, 1, 1],
  manual: 50
});

const sum = (list) => list.reduce((a, b) => a + (Number(b) || 0), 0);

export function calculatePhase({ mode, general, venue, manual }) {
  if (mode === 'manual') {
    return Math.min(100, Math.max(0, Number(manual) || 0)) / 100;
  }
  const factor = (sum(general) / MAX_POINTS) * 0.7 + (sum(venue) / MAX_POINTS) * 0.3;
  return Math.max(PHASE_FLOOR, factor);
}

/** V (3) → E (1) → D (0) → V. */
export function cycleResult(points) {
  const i = RESULT_CYCLE.indexOf(Number(points));
  return RESULT_CYCLE[(i + 1) % RESULT_CYCLE.length];
}
