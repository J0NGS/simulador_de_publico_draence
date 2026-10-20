/**
 * ============================================
 * DRAENCE — PASSO 3: ESTÁDIO
 * ============================================
 * Escolha do estádio, resumo (qualidade, capacidade, vínculo)
 * e preço de aluguel quando o estádio é neutro.
 */
import { $, h, clamp } from './dom.js';
import { RENTAL } from '../core/config.js';
import { formatNumber, formatDecimal, parseCurrency, escapeHtml } from '../core/format.js';

const QUALITY_LABEL = { RUIM: 'Ruim', REGULAR: 'Regular', BOM: 'Bom', OTIMO: 'Ótimo', EXCELENTE: 'Excelente' };

export function initStadium({ onStadium, onRental }) {
  const select = $('#selectEstadio');
  const info = $('#estadioInfo');
  const rental = $('#aluguel');
  const rentalInput = $('#aluguelValor');
  const rentalSlider = $('#aluguelSlider');

  Object.assign(rentalSlider, { min: RENTAL.min, max: RENTAL.max, step: RENTAL.step });

  select.addEventListener('change', () => onStadium(select.value));

  function setRental(value) {
    const v = clamp(Math.round(value), RENTAL.min, RENTAL.max);
    rentalSlider.value = v;
    rentalInput.value = formatNumber(v);
    return v;
  }

  rentalSlider.addEventListener('input', () => {
    rentalInput.value = formatNumber(rentalSlider.value);
    onRental(Number(rentalSlider.value));
  });
  rentalInput.addEventListener('input', () => {
    const parsed = parseCurrency(rentalInput.value);
    if (!Number.isFinite(parsed)) return;
    rentalSlider.value = clamp(Math.round(parsed), RENTAL.min, RENTAL.max);
    onRental(clamp(parsed, RENTAL.min, RENTAL.max));
  });
  rentalInput.addEventListener('focus', () => {
    const parsed = parseCurrency(rentalInput.value);
    if (Number.isFinite(parsed)) rentalInput.value = String(Math.round(parsed));
    setTimeout(() => rentalInput.select(), 0);
  });
  rentalInput.addEventListener('blur', () => {
    const parsed = parseCurrency(rentalInput.value);
    onRental(setRental(Number.isFinite(parsed) ? parsed : RENTAL.initial));
  });

  return {
    /** `options`: [{ id, label }]; seleciona `selectedId`. */
    populate(options, selectedId) {
      select.replaceChildren(
        h('option', { value: '' }, 'Selecione o estádio'),
        ...options.map(({ id, label }) => h('option', { value: id }, label))
      );
      select.value = selectedId ?? '';
      select.disabled = false;
    },

    reset() {
      select.replaceChildren(h('option', { value: '' }, 'Escolha o mandante primeiro'));
      select.disabled = true;
      this.hideDetails();
    },

    hideDetails() {
      info.hidden = true;
      rental.hidden = true;
    },

    renderInfo({ stadium, isRental, multiplier, city }) {
      const rows = [
        ['Estádio', escapeHtml(stadium.name || 'N/D')],
        ['Cidade', escapeHtml(city || 'N/D')],
        ['Qualidade', `<span class="tag">${QUALITY_LABEL[String(stadium.quality).toUpperCase()] || escapeHtml(stadium.quality)}</span>`],
        ['Capacidade', formatNumber(stadium.capacity)],
        ['Vínculo', isRental ? '<span class="tag tag--accent">Neutro · aluguel</span>' : '<span class="tag">Próprio</span>'],
        ['Preços e custos', `×${formatDecimal(multiplier)}`]
      ];
      info.innerHTML = rows.map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`).join('');
      info.hidden = false;
    },

    showRental(visible, value = RENTAL.initial) {
      rental.hidden = !visible;
      if (visible) setRental(value);
    }
  };
}
