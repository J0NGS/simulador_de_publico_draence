/**
 * ============================================
 * DRAENCE — RESULTADO (COLUNA DIREITA)
 * ============================================
 * Lucro líquido, resumo financeiro, ocupação por setor e torcida.
 */
import { $, icon } from './dom.js';
import { ALL_SECTORS, SECTOR_META } from '../core/config.js';
import { formatCurrency, formatNumber, formatPercent } from '../core/format.js';

const FULL_THRESHOLD = 0.95;

export function initResults() {
  const section = $('#resultado');
  const scoreboard = $('#placarLucro');
  const list = $('#ocupacao');
  const text = (id, value) => { $(id).textContent = value; };

  // Uma linha de ocupação por setor, criada uma vez e só atualizada depois
  const rows = {};
  list.innerHTML = ALL_SECTORS.map((key) => `
    <li class="occ-row" data-sector="${key}">
      <div class="occ-row__head">
        <span class="occ-row__name">${icon(SECTOR_META[key].icon)}${SECTOR_META[key].label}</span>
        <span class="occ-row__count"><strong></strong> <small></small></span>
      </div>
      <div class="occ-bar" role="progressbar" aria-label="Ocupação do setor ${SECTOR_META[key].label}" aria-valuemin="0" aria-valuemax="100">
        <span class="occ-bar__fill"></span>
      </div>
      <span class="occ-row__pct"></span>
    </li>`).join('');
  ALL_SECTORS.forEach((key) => {
    const row = list.querySelector(`[data-sector="${key}"]`);
    rows[key] = {
      row,
      count: row.querySelector('strong'),
      cap: row.querySelector('small'),
      bar: row.querySelector('.occ-bar'),
      fill: row.querySelector('.occ-bar__fill'),
      pct: row.querySelector('.occ-row__pct')
    };
  });

  function setOccupancy(key, attendance, capacity) {
    const r = rows[key];
    const ratio = capacity > 0 ? attendance / capacity : 0;
    r.count.textContent = formatNumber(attendance);
    r.cap.textContent = `/ ${formatNumber(capacity)}`;
    r.fill.style.width = `${Math.min(100, ratio * 100)}%`;
    r.bar.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
    r.pct.textContent = formatPercent(ratio);
    r.row.classList.toggle('is-full', ratio >= FULL_THRESHOLD);
  }

  return {
    clear() {
      section.classList.remove('show');
    },

    render(result) {
      const { totals, fans, sectors, visitor } = result;
      const loss = totals.profit < 0;

      section.classList.add('show');
      scoreboard.classList.toggle('is-loss', loss);

      text('#lucroSelo', loss ? 'Prejuízo' : 'Lucro');
      text('#lucroValor', formatCurrency(totals.profit));
      text('#lucroFormula', `Receita ${formatCurrency(totals.revenue)} − custos ${formatCurrency(totals.totalCosts)}`);

      const margin = $('#lucroMargem');
      margin.textContent = totals.revenue > 0 ? formatPercent(totals.margin, 1) : '';
      margin.classList.toggle('aumentou', totals.revenue > 0 && !loss);
      margin.classList.toggle('diminuiu', loss);

      text('#publicoTotal', formatNumber(totals.attendance));
      text('#publicoDetalhe', `Mandante ${formatNumber(totals.homeAttendance)} + visitante ${formatNumber(totals.visitorAttendance)}`);
      text('#receitaBruta', formatCurrency(totals.revenue));
      text('#ingressoMedio', `Média por ingresso ${formatCurrency(totals.averageTicket)}`);
      text('#custoFixo', formatCurrency(totals.fixedCost));
      text('#custoFixoNota', totals.rental > 0
        ? `Inclui aluguel de ${formatCurrency(totals.rental)}`
        : 'Manutenção predial e staff base');
      text('#custoVariavel', formatCurrency(totals.variableCost));
      text('#custoVariavelNota', `${formatNumber(totals.attendance)} pagantes × ${formatCurrency(totals.costPerHead)}`);

      Object.entries(sectors).forEach(([key, s]) => setOccupancy(key, s.attendance, s.cap));
      setOccupancy('visitante', visitor.attendance, visitor.cap);

      text('#torcidaTotal', formatNumber(fans.raw));
      text('#torcidaAtiva', formatNumber(fans.active));
      text('#torcidaPerfil', `Perfil ${fans.band.name} · engajamento ${formatPercent(fans.engagement, 1)}`);
    }
  };
}
