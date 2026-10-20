/**
 * ============================================
 * DRAENCE — FORMATAÇÃO
 * ============================================
 */

const nfCurrency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const nfInteger = new Intl.NumberFormat('pt-BR');
const nfDecimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

export const formatCurrency = (value) => nfCurrency.format(Number(value) || 0);
export const formatNumber = (value) => nfInteger.format(Number(value) || 0);
export const formatDecimal = (value) => nfDecimal.format(Number(value) || 0);

/** 0.734 → "73%" */
export const formatPercent = (ratio, digits = 0) => `${((Number(ratio) || 0) * 100).toFixed(digits).replace('.', ',')}%`;

/**
 * Converte texto digitado ("R$ 1.234,56", "1234.56", "1234,56") em número.
 * Retorna NaN quando não houver número válido.
 */
export function parseCurrency(text) {
  if (text === undefined || text === null) return NaN;
  let s = String(text).replace(/R\$|\s|€/g, '');
  if (s === '') return NaN;
  if (s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else {
    s = s.replace(/,/g, '');
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

/** Escapa texto vindo dos dados antes de entrar em innerHTML. */
export function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
