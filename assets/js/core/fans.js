/**
 * ============================================
 * DRAENCE — TORCIDA
 * ============================================
 * Total de torcedores, curva de engajamento e torcida visitante.
 */

/** Faixas de engajamento: quanto maior a torcida, menor a fração que vai ao estádio. */
const ENGAGEMENT_BANDS = Object.freeze([
  { upTo: 5000, name: 'Micro', multiplier: 1 },
  { upTo: 10000, name: 'Pequeno', multiplier: 0.85 },
  { upTo: 50000, name: 'Médio', multiplier: 0.65 },
  { upTo: 100000, name: 'Grande', multiplier: 0.45 },
  { upTo: 300000, name: 'Gigante', multiplier: 0.2 },
  { upTo: 500000, name: 'Monumental', multiplier: 0.1 },
  { upTo: Infinity, name: 'Colossal', multiplier: 0.03 }
]);

export function getEngagementBand(totalFans) {
  return ENGAGEMENT_BANDS.find((band) => totalFans <= band.upTo);
}

/** Soma a torcida de um time espalhada pelas cidades (com fallback para a capacidade). */
export function sumTeamFans(team) {
  if (!team) return 0;
  if (Array.isArray(team.fans) && team.fans.length > 0) {
    return team.fans.reduce((acc, f) => (
      acc + (typeof f === 'number' ? f : (f.fans || f.count || f.value || 0))
    ), 0);
  }
  if (typeof team.fanBase === 'number') return team.fanBase;
  return Number.isFinite(team.stadiumCapacity) ? Math.round(team.stadiumCapacity * 1.25) : 10000;
}

/**
 * Torcida ativa: aplica a curva de engajamento ao total de torcedores.
 * Piso de 1.000 (ou o total, se menor) e teto no próprio total.
 */
export function calculateEffectiveFanBase(totalFans) {
  const fans = Number(totalFans) || 0;
  if (fans <= 0) return 0;

  const { multiplier } = getEngagementBand(fans);
  const calculated = Math.round(fans * multiplier);
  const floor = fans > 1000 ? 1000 : fans;
  return Math.min(fans, Math.max(floor, calculated));
}

/** Torcida total do visitante e a parcela que já vive na cidade do mandante. */
export function getVisitorFanData(visitorTeam, homeCityId) {
  if (!visitorTeam) return { total: 0, local: 0 };

  const total = sumTeamFans(visitorTeam);
  let local = 0;

  if (Array.isArray(visitorTeam.fans) && visitorTeam.fans.length > 0) {
    const inCity = visitorTeam.fans.find((f) => f.cityId == homeCityId);
    if (inCity) local = inCity.fans || inCity.count || inCity.value || 0;
  } else if (visitorTeam.cityId == homeCityId) {
    local = Math.round(total * 0.3);
  }

  return { total, local };
}
