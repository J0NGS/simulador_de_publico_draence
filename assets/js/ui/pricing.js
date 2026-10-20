/**
 * ============================================
 * DRAENCE — PASSO 4: PREÇOS POR SETOR
 * ============================================
 * Um card por setor com preço (campo + slider), aviso de preço,
 * e o passo a passo do cálculo. O setor visitante espelha o intermediário.
 */
import { $, h, icon, clamp } from './dom.js';
import {
  SECTORS, SECTOR_META, PRICE_CHAIN_FACTOR, PRICE_THRESHOLDS, PRICE_SLIDER
} from '../core/config.js';
import {
  formatCurrency, formatNumber, formatDecimal, formatPercent, parseCurrency
} from '../core/format.js';

const FLAGS = {
  cheap: { text: 'Promoção', icon: 'tag' },
  expensive: { text: 'Preço alto', icon: 'info' },
  abusive: { text: 'Preço exagerado', icon: 'triangle-alert' }
};

function getFlag(price, basePrice) {
  if (price < basePrice * PRICE_THRESHOLDS.cheap) return 'cheap';
  if (price > basePrice * PRICE_THRESHOLDS.abusive) return 'abusive';
  if (price > basePrice * PRICE_THRESHOLDS.expensive) return 'expensive';
  return null;
}

const calcList = (items) => items
  .map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`)
  .join('');

export function initPricing({ state, onPrice }) {
  const grid = $('#setores');
  const empty = $('#setoresVazio');
  let cards = {};
  let visitorCard = null;
  let basePrices = {};

  /** Preço efetivo: o digitado, ou o base se estiver vazio/inválido. */
  const effective = (key) => (Number(state.prices[key]) > 0 ? Number(state.prices[key]) : basePrices[key]);

  function writePrice(key, { keepInput = false } = {}) {
    const { input, slider } = cards[key];
    const price = effective(key);
    if (!keepInput) input.value = formatDecimal(price);
    slider.value = clamp(Math.round(price), Number(slider.min), Number(slider.max));
  }

  /**
   * Escada de valor: cada setor custa ao menos 40% mais que o anterior.
   * Enquanto o usuário digita (`typingKey`), o próprio campo não é reescrito.
   */
  function enforceChain(typingKey = null) {
    for (let i = 0; i < SECTORS.length - 1; i += 1) {
      const next = SECTORS[i + 1];
      const minNext = Math.ceil(effective(SECTORS[i]) * PRICE_CHAIN_FACTOR);
      if (effective(next) < minNext && next !== typingKey) {
        state.prices[next] = minNext;
        writePrice(next);
      }
    }
  }

  function buildSectorCard(key, capacity) {
    const meta = SECTOR_META[key];
    const base = basePrices[key];

    const input = h('input', {
      type: 'text', id: `preco-${key}`, class: 'input-money', inputmode: 'decimal',
      autocomplete: 'off', 'aria-label': `Preço do setor ${meta.label}`
    });
    const slider = h('input', {
      type: 'range', class: 'range', 'aria-label': `Ajuste de preço do setor ${meta.label}`,
      min: Math.max(1, Math.round(base * PRICE_SLIDER.min)),
      max: Math.max(2, Math.round(base * PRICE_SLIDER.max)),
      step: 1
    });
    const field = h('div', { class: 'money-field money-field--boxed' },
      h('span', { class: 'money-prefix' }, 'R$'), input);
    const flag = h('span', { class: 'price-flag' });
    const details = h('dl', { class: 'calc-list' });

    const node = h('article', { class: 'sector-card', 'data-sector': key },
      h('header', { class: 'sector-card__head' },
        h('h3', {}, h('span', { class: 'sector-card__icon', innerHTML: icon(meta.icon) }), meta.label),
        h('span', { class: 'sector-card__cap' }, 'Capacidade ', h('strong', {}, formatNumber(capacity)))),
      field,
      slider,
      h('div', { class: 'sector-card__foot' },
        flag,
        h('span', { class: 'sector-card__base' }, 'Base ', h('strong', {}, formatCurrency(base)))),
      h('details', { class: 'sector-card__details' }, h('summary', {}, 'Ver cálculo'), details));

    input.addEventListener('focus', () => {
      const parsed = parseCurrency(input.value);
      if (Number.isFinite(parsed)) input.value = String(parsed).replace('.', ',');
      setTimeout(() => input.select(), 0);
    });
    input.addEventListener('input', () => {
      const parsed = parseCurrency(input.value);
      state.prices[key] = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
      writePrice(key, { keepInput: true });
      enforceChain(key);
      onPrice();
    });
    input.addEventListener('blur', () => {
      const parsed = parseCurrency(input.value);
      state.prices[key] = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
      enforceChain();
      SECTORS.forEach((k) => writePrice(k));
      onPrice();
    });
    slider.addEventListener('input', () => {
      state.prices[key] = Number(slider.value);
      writePrice(key);
      enforceChain();
      onPrice();
    });

    return { node, input, slider, field, flag, details };
  }

  function buildVisitorCard(capacity) {
    const price = h('strong', { class: 'sector-card__mirror' });
    const details = h('dl', { class: 'calc-list' });
    const cap = h('strong', {}, formatNumber(capacity));
    const node = h('article', { class: 'sector-card sector-card--visitor', 'data-sector': 'visitante' },
      h('header', { class: 'sector-card__head' },
        h('h3', {}, h('span', { class: 'sector-card__icon', innerHTML: icon(SECTOR_META.visitante.icon) }), 'Visitante'),
        h('span', { class: 'sector-card__cap' }, 'Capacidade ', cap)),
      h('div', { class: 'mirror' },
        h('span', { class: 'mirror__label' }, 'Preço (igual ao intermediário)'),
        price),
      h('details', { class: 'sector-card__details' }, h('summary', {}, 'Ver cálculo'), details));
    return { node, price, details };
  }

  return {
    /** Recria os cards para um novo estádio e redefine os preços para o valor base. */
    build({ capacities, base }) {
      basePrices = base;
      state.prices = { ...base };
      cards = {};
      grid.replaceChildren();

      SECTORS.forEach((key) => {
        cards[key] = buildSectorCard(key, capacities[key] || 0);
        grid.append(cards[key].node);
        writePrice(key);
      });
      visitorCard = buildVisitorCard(capacities.visitante || 0);
      grid.append(visitorCard.node);
      empty.hidden = true;
    },

    clear() {
      cards = {};
      visitorCard = null;
      state.prices = {};
      grid.replaceChildren();
      empty.hidden = false;
    },

    /** Atualiza avisos de preço e o detalhamento a partir do resultado da simulação. */
    update(result) {
      if (!visitorCard) return;
      const { aptitude, homePhase, importance } = result.context;

      SECTORS.forEach((key) => {
        const s = result.sectors[key];
        const { field, flag, details } = cards[key];
        const flagKey = getFlag(s.price, s.basePrice);

        field.dataset.flag = flagKey || '';
        flag.dataset.flag = flagKey || '';
        flag.innerHTML = flagKey ? `${icon(FLAGS[flagKey].icon)}${FLAGS[flagKey].text}` : '';

        details.innerHTML = calcList([
          ['Potencial', `${formatNumber(Math.round(s.interest))} pessoas`],
          ['Composição', `${formatNumber(result.fans.active)} fãs × interesse ${formatPercent(s.weight)} × fase ${formatDecimal(homePhase)} × importância ${formatDecimal(importance)} × prestígio ${formatDecimal(aptitude)}`],
          ['Impacto do preço', `×${formatDecimal(s.priceFactor)} (sensibilidade ${formatDecimal(s.elasticity)})`],
          ['Resultado', `${formatNumber(Math.round(s.rawDemand))} ingressos · ${formatNumber(s.attendance)} ocupados de ${formatNumber(s.cap)}`]
        ]);
      });

      const v = result.visitor;
      visitorCard.price.textContent = formatCurrency(v.price);
      visitorCard.details.innerHTML = calcList([
        ['Potencial', `${formatNumber(Math.round(v.potential))} pessoas`],
        ['Composição', `${formatNumber(Math.round(v.demandBase))} fãs × fase ${formatPercent(v.phase)} × importância ${formatDecimal(importance)}`],
        ['Impacto do preço', `×${formatDecimal(v.priceFactor)} (sensibilidade ${formatDecimal(v.elasticity)})`],
        ['Resultado', `${formatNumber(Math.round(v.rawDemand))} ingressos · ${formatNumber(v.attendance)} ocupados de ${formatNumber(v.cap)}`]
      ]);
    }
  };
}
