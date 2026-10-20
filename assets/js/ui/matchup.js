/**
 * ============================================
 * DRAENCE — PASSO 1: CONFRONTO
 * ============================================
 * Seleção de mandante, visitante e importância do jogo.
 */
import { $, h } from './dom.js';
import { IMPORTANCE_OPTIONS, DEFAULT_IMPORTANCE } from '../core/config.js';

const toIndex = (value) => (value === '' ? null : Number(value));

export function initMatchup({ onHome, onVisitor, onImportance }) {
  const home = $('#selectMandante');
  const visitor = $('#selectVisitante');
  const importance = $('#selectImportancia');
  const visitorHint = $('#visitanteSerie');

  IMPORTANCE_OPTIONS.forEach(({ value, label }) => {
    importance.append(h('option', { value, selected: value === DEFAULT_IMPORTANCE }, label));
  });

  home.addEventListener('change', () => onHome(toIndex(home.value)));
  visitor.addEventListener('change', () => onVisitor(toIndex(visitor.value)));
  importance.addEventListener('change', () => onImportance(Number(importance.value) || DEFAULT_IMPORTANCE));

  return {
    /** Preenche os dois selects com `[{ label }]`; o valor de cada opção é o índice. */
    populateTeams(options) {
      [[home, 'Selecione o mandante'], [visitor, 'Sem visitante']].forEach(([select, placeholder]) => {
        select.replaceChildren(
          h('option', { value: '' }, placeholder),
          ...options.map(({ label }, index) => h('option', { value: index }, label))
        );
        select.disabled = false;
      });
    },

    /** Mostra a série do visitante abaixo do select (ou esconde quando não há visitante). */
    setVisitorHint(text) {
      visitorHint.hidden = !text;
      visitorHint.textContent = text || '';
    }
  };
}
