/**
 * ============================================
 * DRAENCE — SIMULADOR DE PÚBLICO (ENTRADA)
 * ============================================
 * Liga o estado da tela, os controles e a simulação.
 * Fluxo: evento do usuário → atualiza `state` → `render()` recalcula e redesenha.
 */
import { state, cityName } from './state.js';
import { loadData } from './data.js';
import { RENTAL } from './core/config.js';
import { calculateSectorDistribution } from './core/logic.js';
import { getBasePrices, getPriceMultiplier, simulate } from './core/simulation.js';
import { formatNumber } from './core/format.js';
import { $ } from './ui/dom.js';
import { initMatchup } from './ui/matchup.js';
import { initPhasePanels } from './ui/phasePanel.js';
import { initStadium } from './ui/stadium.js';
import { initPricing } from './ui/pricing.js';
import { initResults } from './ui/results.js';
import { initAudit } from './ui/audit.js';

const OWN_STADIUM_ID = 'proprio';
let stadiumsById = new Map();

const errorBox = $('#erroDados');
const showError = (message) => {
  errorBox.textContent = message;
  errorBox.classList.add('show');
};
const clearError = () => errorBox.classList.remove('show');

// ---------- Renderização ----------

function render() {
  if (!state.home || !state.stadium) {
    results.clear();
    audit.clear();
    phases.clearFactors();
    return;
  }

  let result;
  try {
    result = simulate({
      home: state.home,
      visitor: state.visitor,
      stadium: state.stadium,
      isRental: state.isRental,
      rentalPrice: state.rentalPrice,
      importance: state.importance,
      phases: state.phases,
      prices: state.prices
    });
  } catch (err) {
    console.error(err);
    showError('Não foi possível calcular a simulação com os dados atuais.');
    return;
  }

  clearError();
  pricing.update(result);
  phases.showFactors(result.context, Boolean(state.visitor));
  results.render(result);
  audit.render(result);
}

// ---------- Ações do usuário ----------

/** Estádios que o mandante pode usar: o próprio e os neutros (sem dono). */
function stadiumsFor(team) {
  const list = state.stadiums.filter((s) => s.owner === team._id || s.owner === null);
  if (!list.some((s) => s.owner === team._id)) {
    // O time não tem estádio cadastrado: usa os dados do próprio time
    list.unshift({
      _id: OWN_STADIUM_ID, name: team.stadium, quality: team.stadiumQuality,
      capacity: team.stadiumCapacity, owner: team._id, city: team.cityId
    });
  }
  return list;
}

function stadiumLabel(stadium, team) {
  const city = cityName(stadium.city);
  const link = stadium.owner === team._id ? 'Próprio' : 'Neutro';
  return `${stadium.name}${city ? ` — ${city}` : ''} — ${stadium.quality} (${formatNumber(stadium.capacity)}) · ${link}`;
}

function applyStadium(id) {
  const stadium = stadiumsById.get(String(id));
  if (!stadium) {
    // Usuário voltou para "Selecione o estádio"
    state.stadium = null;
    state.isRental = false;
    state.rentalPrice = 0;
    stadiumUi.hideDetails();
    pricing.clear();
    render();
    return;
  }

  state.stadium = stadium;
  state.isRental = stadium.owner === null;
  state.rentalPrice = state.isRental ? RENTAL.initial : 0;

  stadiumUi.renderInfo({
    stadium,
    isRental: state.isRental,
    multiplier: getPriceMultiplier(stadium, state.isRental),
    city: cityName(stadium.city)
  });
  stadiumUi.showRental(state.isRental, state.rentalPrice);

  // Preços base e capacidades mudam com o estádio: recria os cards de setor
  pricing.build({
    capacities: calculateSectorDistribution(stadium.capacity, stadium.quality),
    base: getBasePrices(stadium, state.isRental)
  });
  render();
}

function selectHome(index) {
  if (index === null) {
    state.home = null;
    state.stadium = null;
    state.isRental = false;
    state.rentalPrice = 0;
    stadiumsById = new Map();
    phases.setTeam('home', '');
    stadiumUi.reset();
    pricing.clear();
    render();
    return;
  }

  state.home = state.teams[index];
  phases.reset('home');
  phases.setTeam('home', state.home.name);

  const available = stadiumsFor(state.home);
  stadiumsById = new Map(available.map((s) => [String(s._id), s]));
  const own = available.find((s) => s.owner === state.home._id);

  stadiumUi.populate(
    available.map((s) => ({ id: s._id, label: stadiumLabel(s, state.home) })),
    own?._id
  );
  applyStadium(own?._id);
}

function selectVisitor(index) {
  state.visitor = index === null ? null : state.teams[index];
  phases.reset('visitor');
  phases.setTeam('visitor', state.visitor?.name || '');

  const serie = state.visitor?.currentSeries;
  matchup.setVisitorHint(serie ? `Série ${serie}${serie === 'A' ? ' · time de elite' : ''}` : '');
  render();
}

// ---------- Inicialização ----------

const matchup = initMatchup({
  onHome: selectHome,
  onVisitor: selectVisitor,
  onImportance: (value) => { state.importance = value; render(); }
});
const phases = initPhasePanels({ state, onChange: render });
const stadiumUi = initStadium({
  onStadium: applyStadium,
  onRental: (value) => { state.rentalPrice = value; render(); }
});
const pricing = initPricing({ state, onPrice: render });
const results = initResults();
const audit = initAudit();

$('#ano').textContent = new Date().getFullYear();

(async function start() {
  try {
    Object.assign(state, await loadData());
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    showError('Não foi possível carregar os dados dos times e estádios. Abra o simulador por um servidor web (por exemplo, o GitHub Pages) e tente novamente.');
    return;
  }

  matchup.populateTeams(state.teams.map((team) => {
    const own = state.stadiums.find((s) => s.owner === team._id);
    const city = cityName(own?.city);
    return { label: city ? `${team.name} — ${city}` : team.name };
  }));
  phases.setTeam('home', '');
  render();
})();
