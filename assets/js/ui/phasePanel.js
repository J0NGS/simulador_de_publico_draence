/**
 * ============================================
 * DRAENCE — PASSO 2: MOMENTO DAS EQUIPES
 * ============================================
 * Um painel por time: cinco últimos jogos (geral e em casa/fora)
 * no modo automático, ou a força do time informada no modo manual.
 */
import { $, h } from './dom.js';
import { RESULT } from '../core/config.js';
import { cycleResult } from '../core/phase.js';
import { formatPercent } from '../core/format.js';

const SIDES = {
  home: { title: 'Mandante', venue: 'em casa' },
  visitor: { title: 'Visitante', venue: 'fora' }
};

const RESULT_BY_POINTS = new Map(Object.entries(RESULT).map(([name, r]) => [r.points, { name, ...r }]));

function paintMoment(button, points, index) {
  const result = RESULT_BY_POINTS.get(points) || RESULT.draw;
  button.dataset.result = RESULT_BY_POINTS.get(points)?.name || 'draw';
  button.textContent = result.letter;
  button.setAttribute('aria-label', `Jogo ${index + 1}: ${result.label}. Clique para alternar.`);
  button.title = result.label;
}

export function initPhasePanels({ state, onChange }) {
  const root = $('#painelFase');
  const panels = {};

  function buildMomentRow(side, listName, label) {
    const phase = state.phases[side];
    const buttons = phase[listName].map((points, index) => {
      const button = h('button', { type: 'button', class: 'moment-btn' });
      paintMoment(button, points, index);
      button.addEventListener('click', () => {
        phase[listName][index] = cycleResult(phase[listName][index]);
        paintMoment(button, phase[listName][index], index);
        onChange();
      });
      return button;
    });
    return {
      node: h('div', { class: 'moment-row' },
        h('span', { class: 'moment-row__label' }, label),
        h('div', { class: 'moment-list' }, buttons)),
      buttons
    };
  }

  function buildPanel(side) {
    const { title, venue } = SIDES[side];
    const phase = state.phases[side];

    const general = buildMomentRow(side, 'general', 'Últimos 5 jogos · geral');
    const venueRow = buildMomentRow(side, 'venue', `Últimos 5 jogos · ${venue}`);

    const manualInput = h('input', {
      type: 'number', id: `faseManual-${side}`, min: 0, max: 100, step: 1,
      inputmode: 'numeric', value: phase.manual
    });
    const manualBox = h('div', { class: 'phase-manual form-group', hidden: true },
      h('label', { for: `faseManual-${side}` }, 'Força do time (0 a 100)'),
      manualInput);

    const autoBox = h('div', { class: 'phase-auto' }, general.node, venueRow.node);

    const modeButtons = ['auto', 'manual'].map((mode) => h('button', {
      type: 'button',
      class: 'seg__btn',
      'data-mode': mode,
      onclick: () => setMode(mode)
    }, mode === 'auto' ? 'Automático' : 'Manual'));

    const teamName = h('span', { class: 'phase-panel__team' });
    const readout = h('strong', { class: 'phase-panel__value' }, '—');

    const node = h('div', { class: 'phase-panel', 'data-side': side },
      h('div', { class: 'phase-panel__head' },
        h('div', { class: 'phase-panel__who' }, h('h3', {}, title), teamName),
        h('div', { class: 'seg', role: 'group', 'aria-label': `Modo do momento do ${title.toLowerCase()}` }, modeButtons)),
      autoBox,
      manualBox,
      h('div', { class: 'phase-panel__foot' }, 'Fase calculada', readout));

    function setMode(mode) {
      phase.mode = mode;
      autoBox.hidden = mode !== 'auto';
      manualBox.hidden = mode !== 'manual';
      modeButtons.forEach((b) => {
        const active = b.dataset.mode === mode;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      onChange();
    }

    manualInput.addEventListener('input', () => {
      phase.manual = Number(manualInput.value) || 0;
      onChange();
    });
    manualInput.addEventListener('blur', () => {
      const clamped = Math.min(100, Math.max(0, Number(manualInput.value) || 0));
      phase.manual = clamped;
      manualInput.value = clamped;
      onChange();
    });

    panels[side] = { node, teamName, readout, buttons: [general.buttons, venueRow.buttons], setMode };
    root.append(node);
    // Estado visual inicial (sem disparar onChange)
    autoBox.hidden = phase.mode !== 'auto';
    manualBox.hidden = phase.mode !== 'manual';
    modeButtons.forEach((b) => {
      const active = b.dataset.mode === phase.mode;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    });
  }

  Object.keys(SIDES).forEach(buildPanel);
  panels.visitor.node.classList.add('is-idle');

  return {
    /** Volta os cinco jogos de cada lista para empate (mantém modo e força manual). */
    reset(side) {
      const phase = state.phases[side];
      [phase.general, phase.venue].forEach((list, li) => {
        list.fill(RESULT.draw.points);
        panels[side].buttons[li].forEach((button, i) => paintMoment(button, list[i], i));
      });
    },

    setTeam(side, name) {
      panels[side].teamName.textContent = name || '';
      if (side === 'visitor') panels.visitor.node.classList.toggle('is-idle', !name);
    },

    /** Atualiza a fase exibida em cada painel. */
    showFactors({ homePhase, visitorPhase }, hasVisitor) {
      panels.home.readout.textContent = formatPercent(homePhase);
      panels.visitor.readout.textContent = hasVisitor ? formatPercent(visitorPhase) : '—';
    },

    clearFactors() {
      panels.home.readout.textContent = '—';
      panels.visitor.readout.textContent = '—';
    }
  };
}
