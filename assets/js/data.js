/**
 * ============================================
 * DRAENCE — CARGA DE DADOS
 * ============================================
 */
const FILES = {
  teams: 'data/mongo_teams_drae_data.json',
  cities: 'data/mongo_cities_drae_data.json',
  stadiums: 'data/mongo_stadiuns_drae_data.json'
};

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao carregar ${url} (HTTP ${res.status})`);
  return res.json();
}

export async function loadData() {
  const [teams, cities, stadiums] = await Promise.all([
    fetchJson(FILES.teams),
    fetchJson(FILES.cities),
    fetchJson(FILES.stadiums)
  ]);
  return { teams, cities, stadiums };
}
