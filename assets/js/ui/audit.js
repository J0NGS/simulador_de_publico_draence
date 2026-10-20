/**
 * ============================================
 * DRAENCE — AUDITORIA DO CÁLCULO
 * ============================================
 * Memória de cálculo: capacidade ativa (α), fator de evento (Φ),
 * eficiência (λ) e a tabela de demanda por setor.
 */
import { $, icon } from './dom.js';
import { SECTORS, SECTOR_META } from '../core/config.js';
import { formatNumber, formatDecimal, formatPercent } from '../core/format.js';

const EMPTY = '<p class="audit__empty">Escolha o mandante para ver a análise detalhada.</p>';

const sectorRow = (key, cells, extraClass = '') => `
  <tr data-sector="${key}"${extraClass ? ` class="${extraClass}"` : ''}>
    <th scope="row">${SECTOR_META[key].label}</th>
    ${cells.map((c) => `<td>${c}</td>`).join('')}
  </tr>`;

export function initAudit() {
  const content = $('#auditoriaConteudo');

  return {
    clear() {
      content.innerHTML = EMPTY;
    },

    render(result) {
      const { fans, context, shortage, sectors, visitor } = result;
      const lack = shortage.applied;

      const rows = SECTORS.map((key) => {
        const s = sectors[key];
        return sectorRow(key, [
          formatNumber(Math.round(s.interest)),
          formatNumber(s.cap),
          `${formatDecimal(s.basePrice / s.price)}× <small>(k=${formatDecimal(s.elasticity)})</small>`,
          formatNumber(Math.round(s.rawDemand)),
          `<strong>${formatNumber(s.attendance)}</strong>`
        ]);
      }).join('') + sectorRow('visitante', [
        formatNumber(Math.round(visitor.interest)),
        formatNumber(visitor.cap),
        `${formatDecimal(visitor.basePrice / visitor.price)}× <small>(k=${formatDecimal(visitor.elasticity)})</small>`,
        formatNumber(Math.round(visitor.rawDemand)),
        `<strong>${formatNumber(visitor.attendance)}</strong>`
      ], 'is-aside');

      content.innerHTML = `
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-card__label">${icon('users')}Capacidade ativa (α)</div>
            <div class="kpi-card__value">${formatNumber(fans.active)} <small>fãs</small></div>
            <dl class="kpi-card__rows">
              <div><dt>Engajamento (η)</dt><dd>${formatPercent(fans.engagement, 1)}</dd></div>
              <div><dt>Perfil</dt><dd><span class="tag">${fans.band.name}</span></dd></div>
            </dl>
          </div>

          <div class="kpi-card">
            <div class="kpi-card__label">${icon('zap')}Fator de evento (Φ)</div>
            <div class="kpi-card__value">${formatDecimal(context.phi)} <small>×</small></div>
            <dl class="kpi-card__rows">
              <div><dt>Fórmula</dt><dd>Φ = f · i · β</dd></div>
              <div><dt>Valores</dt><dd>f ${formatDecimal(context.homePhase)} · i ${formatDecimal(context.importance)} · β ${formatDecimal(context.aptitude)}</dd></div>
            </dl>
          </div>

          <div class="kpi-card${lack ? ' is-warning' : ''}">
            <div class="kpi-card__label">${icon(lack ? 'circle-alert' : 'circle-check')}Eficiência (λ)</div>
            <div class="kpi-card__value">${formatPercent(shortage.factor)}</div>
            <p class="kpi-card__note">${lack
              ? `<strong>Escassez detectada:</strong> a demanda física superou em ${formatPercent(1 / shortage.factor - 1)} o pool de fãs ativos.`
              : '<strong>Sistema equilibrado:</strong> todos os torcedores interessados foram alocados.'}</p>
          </div>
        </div>

        <div class="audit-table-wrap">
          <table class="audit-table">
            <thead>
              <tr>
                <th scope="col">Setor</th>
                <th scope="col">Interesse bruto</th>
                <th scope="col">Cap. física</th>
                <th scope="col">Impacto do preço</th>
                <th scope="col">Demanda ajustada</th>
                <th scope="col">Final</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        ${lack ? `<p class="audit__alert">${icon('triangle-alert')}Ajuste de escassez global de ${formatPercent(1 - shortage.factor, 1)} aplicado para respeitar o teto de torcedores ativos.</p>` : ''}
        <p class="audit__foot">O setor visitante tem demanda própria e não entra no ajuste de escassez do mandante.</p>`;
    }
  };
}
