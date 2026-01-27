// JavaScript para a Calculadora de Renda de Estádio
console.log('Calculadora de Renda de Estádio - inicializado');

// Dados carregados
let teams = [];
let cities = [];
let stadiums = [];
let selectedVisitor = null;
let currentHomeIndex = null;
let selectedStadium = null;
let rentalPrice = 0;
let isRentalStadium = false;

// Preços de REFERÊNCIA para estádio BOM (Multiplicador 1.0)
const STD_PRICES = Object.freeze({
  popular: 25,       // Mantém acessível
  intermediario: 50, // Reduzido de 60
  premium: 80,      // Reduzido de 150
  camarote: 160      // Reduzido drasticamente de 500
});

// Custo Fixo Base (para estádio BOM)
const STD_FIXED_COST = 50000;

// Custo Variável Base por Torcedor (para estádio BOM - Multiplicador 1.0)
const STD_VARIABLE_COST = 10;

// Momento do time (últimos 5 jogos geral e casa) -> valores possíveis: 3 (V), 1 (E), 0 (D)
let last5General = [1,1,1,1,1];
let last5Home = [1,1,1,1,1];

// Momento do visitante (últimos 5 jogos geral e fora)
let last5VisitorGeneral = [1,1,1,1,1];
let last5VisitorAway = [1,1,1,1,1];

/**
 * Determina a faixa de engajamento com base no total de fãs
 */
function getEngagementBand(totalFans) {
  if (totalFans <= 5000) return { name: 'Micro', color: 'success', multiplier: '1.0 (100%)' };
  if (totalFans <= 10000) return { name: 'Pequeno', color: 'info', multiplier: '0.85 (85%)' };
  if (totalFans <= 50000) return { name: 'Médio', color: 'warning', multiplier: '0.65 (65%)' };
  if (totalFans <= 100000) return { name: 'Grande', color: 'warning', multiplier: '0.45 (45%)' };
  if (totalFans <= 300000) return { name: 'Gigante', color: 'danger', multiplier: '0.2 (20%)' };
  if (totalFans <= 500000) return { name: 'Monumental', color: 'danger', multiplier: '0.1 (10%)' };
  return { name: 'Colossal', color: 'danger', multiplier: '0.03 (3%)' };
}

/**
 * Retorna o ícone do setor
 */
function getSectorIcon(sectorKey) {
  const iconMap = {
    popular: 'bi-people-fill',
    intermediario: 'bi-person-badge',
    premium: 'bi-star-fill',
    camarote: 'bi-gem'
  };
  return iconMap[sectorKey] || 'bi-ticket-fill';
}

/**
 * Formata um número com classe de cor baseada em valor/limite
 */
function formatNumberColored(value, max) {
  const pct = (value / max) * 100;
  if (pct >= 95) return `<span class="text-success fw-bold">${formatNumber(value)}</span>`;
  if (pct >= 80) return `<span class="text-info">${formatNumber(value)}</span>`;
  if (pct >= 50) return `<span class="text-warning">${formatNumber(value)}</span>`;
  return `<span class="text-secondary">${formatNumber(value)}</span>`;
}


/**
 * Calcula o fator de fase com base nas arrays last5General e last5Home
 * - Pontos máximos por conjunto: 15
 * - Aproveitamento = pontos / 15
 * - Resultado final = (AprovGeral * 0.7) + (AprovCasa * 0.3)
 * - PISO MÍNIMO = 0.1
 */
function calculatePhaseFactor() {
  const isAuto = document.getElementById('switch-home-phase')?.checked;

  if (!isAuto) {
    const val = Number(document.getElementById('input-home-phase')?.value) || 0;
    return Math.min(100, Math.max(0, val)) / 100;
  }

  const pointsGen = last5General.reduce((a, b) => a + (Number(b) || 0), 0);
  const pointsHome = last5Home.reduce((a, b) => a + (Number(b) || 0), 0);
  const factor = ((pointsGen / 15) * 0.7) + ((pointsHome / 15) * 0.3);

  const display = document.getElementById('phase-factor-display');
  if (display) display.textContent = (factor * 100).toFixed(0) + '%';

  return Math.max(0.1, factor);
}

/**
 * Calcula o fator de fase do visitante com base nas arrays last5VisitorGeneral e last5VisitorAway
 */
function calculateVisitorPhaseFactor() {
  const isAuto = document.getElementById('switch-visitor-phase')?.checked;

  if (!isAuto) {
    const val = Number(document.getElementById('input-visitor-phase')?.value) || 0;
    return Math.min(100, Math.max(0, val)) / 100;
  }

  const pointsGen = last5VisitorGeneral.reduce((a, b) => a + (Number(b) || 0), 0);
  const pointsAway = last5VisitorAway.reduce((a, b) => a + (Number(b) || 0), 0);
  const factor = ((pointsGen / 15) * 0.7) + ((pointsAway / 15) * 0.3);

  const display = document.getElementById('visitor-phase-factor-display');
  if (display) display.textContent = (factor * 100).toFixed(0) + '%';

  return Math.max(0.1, factor);
}

// Utilitários de formatação
function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function formatNumber(value) {
  return Number(value).toLocaleString('pt-BR');
}

// Converte uma string formatada (ex: "R$ 1.234,56" ou "1234.56" ou "1234,56") para Number
function parseCurrencyFromInput(str) {
  if (str === undefined || str === null) return NaN;
  let s = String(str).trim();
  if (s === '') return NaN;
  // Remove símbolo de moeda e espaços
  s = s.replace(/R\$|\s|€/g, '');
  // Se contém vírgula, assume formatação pt-BR (milhares com ponto)
  if (s.indexOf(',') > -1) {
    s = s.replace(/\./g, ''); // remove separador de milhares
    s = s.replace(',', '.');
  } else {
    // remove possíveis outros separadores
    s = s.replace(/,/g, '');
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

async function loadData() {
  try {
    const [teamsRes, citiesRes, stadiumsRes] = await Promise.all([
      fetch('data/mongo_teams_drae_data.json'),
      fetch('data/mongo_cities_drae_data.json'),
      fetch('data/mongo_stadiuns_drae_data.json')
    ]);

    if (!teamsRes.ok || !citiesRes.ok || !stadiumsRes.ok) {
      throw new Error('Falha ao obter os arquivos JSON (verifique caminhos e permissões)');
    }

    teams = await teamsRes.json();
    cities = await citiesRes.json();
    stadiums = await stadiumsRes.json();

    populateTeamSelects();
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    alert('Erro ao carregar dados. Veja o console para detalhes.');
  }
}

function populateTeamSelects() {
  const selHome = document.getElementById('select-mandante');
  const selAway = document.getElementById('select-visitante');
  if (!selHome || !selAway) return;

  selHome.innerHTML = '<option value="">Selecione o Mandante</option>';
  selAway.innerHTML = '<option value="">Selecione o Visitante</option>';

  teams.forEach((team, idx) => {
    const stadium = stadiums.find(s => s.owner === team._id);
    const cityName = getCityNameById(stadium?.city) || '';
    const text = cityName ? `${team.name} — ${cityName}` : `${team.name}`;

    const optHome = document.createElement('option');
    optHome.value = String(idx);
    optHome.textContent = text;
    selHome.appendChild(optHome);

    const optAway = optHome.cloneNode(true);
    selAway.appendChild(optAway);
  });

  selHome.addEventListener('change', onMandanteChange);
  selAway.addEventListener('change', onVisitanteChange);

  // Re-render quando fase/importância mudarem
  const selPhase = document.getElementById('select-phase');
  const selImportance = document.getElementById('select-importance');
  if (selPhase) selPhase.addEventListener('change', computeAndRender);
  if (selImportance) selImportance.addEventListener('change', computeAndRender);
}

function populateStadiumSelect() {
  const selStadium = document.getElementById('select-stadium');
  if (!selStadium || currentHomeIndex === null || currentHomeIndex === undefined) return;

  const homeTeam = teams[currentHomeIndex];
  if (!homeTeam) return;

  const homeTeamId = Number(homeTeam._id);

  const availableStadiums = stadiums.filter(s => {
    // Estádio do time dono ou estádios sem dono
    return Number(s.owner) === homeTeamId || s.owner === null;
  });

  console.log(`[Stadium Debug] Time: ${homeTeam.name} (ID: ${homeTeamId}), Estádios disponíveis: ${availableStadiums.length}`);

  selStadium.innerHTML = '<option value="">Selecione o Estádio</option>';
  
  availableStadiums.forEach((stadium) => {
    const ownerType = Number(stadium.owner) === homeTeamId ? '(Dono)' : '(Neutro)';
    const cityName = getCityNameById(stadium.city);
    const cityLabel = cityName ? ` — ${cityName}` : '';
    const opt = document.createElement('option');
    opt.value = stadium._id;
    opt.textContent = `${stadium.name}${cityLabel} — ${stadium.quality} (Cap: ${formatNumber(stadium.capacity)}) ${ownerType}`;
    selStadium.appendChild(opt);
  });

  selStadium.addEventListener('change', onStadiumChange);
}

function onStadiumChange(event) {
  const stadiumId = event.target.value;
  if (!stadiumId) {
    selectedStadium = null;
    isRentalStadium = false;
    rentalPrice = 0;
    document.getElementById('rental-price-section').classList.add('d-none');
    computeAndRender();
    return;
  }

  selectedStadium = stadiums.find(s => s._id === Number(stadiumId));
  isRentalStadium = selectedStadium?.owner === null;

  if (isRentalStadium) {
    document.getElementById('rental-price-section').classList.remove('d-none');
    rentalPrice = 50000; // Default rental price
    document.getElementById('rental-price-slider').value = rentalPrice;
    document.getElementById('rental-price-input').value = formatCurrency(rentalPrice);
    attachRentalPriceListeners();
  } else {
    document.getElementById('rental-price-section').classList.add('d-none');
    rentalPrice = 0;
  }

  computeAndRender();
}

function attachRentalPriceListeners() {
  const slider = document.getElementById('rental-price-slider');
  const input = document.getElementById('rental-price-input');

  if (slider) {
    slider.addEventListener('input', (e) => {
      rentalPrice = Number(e.target.value);
      input.value = formatCurrency(rentalPrice);
      computeAndRender();
    });
  }

  if (input) {
    input.addEventListener('change', (e) => {
      rentalPrice = parseCurrencyFromInput(e.target.value) || 50000;
      rentalPrice = Math.max(10000, Math.min(500000, rentalPrice));
      slider.value = rentalPrice;
      input.value = formatCurrency(rentalPrice);
      computeAndRender();
    });
  }
}

function getCityNameById(id) {
  if (id === undefined || id === null) return '';
  const c = cities.find(ct => ct._id == id);
  return c ? c.city : '';
}

function sumTeamFans(team) {
  // Tenta somar arrays de torcida, ou propriedades alternativas; fallback para capacidade
  if (!team) return 0;
  if (Array.isArray(team.fans) && team.fans.length > 0) {
    // se for array de objetos com propriedade 'fans'
    if (typeof team.fans[0] === 'object' && team.fans[0].fans !== undefined) {
      return team.fans.reduce((acc, f) => acc + (f.fans || 0), 0);
    }
    // se for array de números
    if (typeof team.fans[0] === 'number') return team.fans.reduce((a, b) => a + b, 0);
    // se for array de objetos com count
    return team.fans.reduce((acc, f) => acc + (f.count || f.value || 0), 0);
  }
  if (typeof team.fanBase === 'number') return team.fanBase;
  // fallback: 1.25x da capacidade (potencial de mercado)
  const fallback = (team.stadiumCapacity && Number.isFinite(team.stadiumCapacity)) ? Math.round(team.stadiumCapacity * 1.25) : 10000;
  return fallback;
}

/**
 * Curva de Engajamento Dinâmica
 * Times pequenos tém engajamento altíssimo (fidelidade local).
 * Times grandes tém engajamento menor (massa mais dispersa).
 */
function calculateEffectiveFanBase(totalFans) {
  const fans = Number(totalFans) || 0;
  if (fans <= 0) return 0;

  let multiplier;
  
  if (fans <= 5000) {
    multiplier = 1; 
  } else if (fans <= 10000) {
    multiplier = 0.85;
  } else if (fans <= 50000) {
    multiplier = 0.65;
  } else if (fans <= 100000) {
    multiplier = 0.45;
  } else if (fans <= 300000) {
    multiplier = 0.2;
  } else if (fans <= 500000) {
    multiplier = 0.1;
  } else {
    multiplier = 0.03;
  }

  const calculated = Math.round(fans * multiplier);
  
  // Piso: se time tem >1000 fans, piso é 1000; senão, é a torcida total
  const floor = fans > 1000 ? 1000 : fans;
  
  // Retorna sempre capped ao total
  return Math.min(fans, Math.max(floor, calculated));
}

/**
 * Calcula dados de torcida do visitante considerando viagem e torcedores locais
 * @param {Object} visitorTeam - Time visitante
 * @param {string|number} homeCityId - ID da cidade do jogo
 * @returns {Object} - {totalFans, localFans}
 */
function getVisitorFanData(visitorTeam, homeCityId) {
  if (!visitorTeam) return { total: 0, local: 0 };

  const total = sumTeamFans(visitorTeam);

  // Calcula torcedores locais (na cidade do jogo)
  let local = 0;
  if (Array.isArray(visitorTeam.fans) && visitorTeam.fans.length > 0) {
    // Se fans for array de objetos com cityId
    const localFanData = visitorTeam.fans.find(f => f.cityId == homeCityId);
    if (localFanData) {
      local = localFanData.fans || localFanData.count || localFanData.value || 0;
    }
  } else if (visitorTeam.cityId == homeCityId) {
    // Se o time é da mesma cidade, considera uma porcentagem dos torcedores totais
    local = Math.round(total * 0.3); // 30% são locais
  }

  return { total, local };
}

function onMandanteChange(event) {
  const idx = event.target.value;
  const infoBlock = document.getElementById('mandante-stadium-info');

  if (idx === '') {
    infoBlock.classList.add('d-none');
    currentHomeIndex = null;
    document.getElementById('sectors-container').innerHTML = '';
    document.getElementById('progress-container').innerHTML = '';
    document.getElementById('select-stadium').innerHTML = '<option value="">Carregando estádios...</option>';
    selectedStadium = null;
    isRentalStadium = false;
    rentalPrice = 0;
    computeAndRender();
    return;
  }

  const team = teams[Number(idx)];
  currentHomeIndex = Number(idx);

  const stadiumNameEl = document.getElementById('stadium-name');
  const stadiumQualityEl = document.getElementById('stadium-quality');
  const stadiumCapacityEl = document.getElementById('stadium-capacity');

  stadiumNameEl.textContent = team.stadium || 'N/A';
  stadiumQualityEl.textContent = team.stadiumQuality || 'N/A';
  const cap = team.stadiumCapacity;
  stadiumCapacityEl.textContent = (typeof cap === 'number') ? cap.toLocaleString('pt-BR') : (cap || 'N/A');

  infoBlock.classList.remove('d-none');

  // Reset momento do time para padrão (poderíamos mapear por time se tivéssemos dados)
  last5General = [1,1,1,1,1];
  last5Home = [1,1,1,1,1];
  renderMomentButtons();

  // Renderiza cards por setor para o mandante
  renderSectorCards(team);
  
  // Popula seleção de estádios
  populateStadiumSelect();
  
  computeAndRender();
}

function onVisitanteChange(event) {
  const idx = event.target.value;
  if (idx === '') {
    selectedVisitor = null;
    computeAndRender();
    return;
  }
  selectedVisitor = teams[Number(idx)];

  // Reset momento do visitante para padrão
  last5VisitorGeneral = [1,1,1,1,1];
  last5VisitorAway = [1,1,1,1,1];
  renderMomentButtons();
  calculateVisitorPhaseFactor();

  computeAndRender();
}

function renderSectorCards(team) {
  const container = document.getElementById('sectors-container');
  const progressContainer = document.getElementById('progress-container');
  container.innerHTML = '';
  progressContainer.innerHTML = '';

  // Usar dados do estádio selecionado, ou do time padrão
  let stadium = selectedStadium || stadiums.find(s => s.owner === team._id);
  if (!stadium) stadium = { name: team.stadium, quality: team.stadiumQuality, capacity: team.stadiumCapacity, owner: team._id };

  const quality = (window.Logic && window.Logic.normalizeQuality) ? window.Logic.normalizeQuality(stadium.quality || 'BOM') : ((stadium.quality || 'BOM').toUpperCase());
  
  // 1. PEGA O MULTIPLICADOR DE QUALIDADE
  let qualityMultiplier = window.Logic.getQualityMultiplier(quality);
  
  // 2. APLICA MULTIPLICADOR DE 100% PARA ESTÁDIOS SEM DONO (MULTIPLICAÇÃO DO PREÇO)
  let priceMultiplier = qualityMultiplier;
  if (isRentalStadium) {
    priceMultiplier = qualityMultiplier * 2; // 100% de aumento
  }
  
  const sectorCaps = window.Logic.calculateSectorDistribution(stadium.capacity, quality);
  const sectors = ['popular', 'intermediario', 'premium', 'camarote'];

  sectors.forEach(sectorKey => {
    const cap = sectorCaps[sectorKey] || 0;

    // 2. CALCULA O PREÇO BASE AJUSTADO (COM MULTIPLICADOR DE ALUGUEL SE APLICÁVEL)
    const basePrice = Math.round(STD_PRICES[sectorKey] * priceMultiplier);

    // Card
    const col = document.createElement('div');
    col.className = 'col-md-6';

    const card = document.createElement('div');
    card.className = 'card card-dark pricing-card';

    const body = document.createElement('div');
    body.className = 'card-body';

    const title = document.createElement('h6');
    title.className = 'card-subtitle mb-2 text-capitalize';
    // Add sector icon
    const iconMap = {
      popular: 'bi-people-fill',
      intermediario: 'bi-person-badge',
      premium: 'bi-star-fill',
      camarote: 'bi-gem'
    };
    const icon = document.createElement('i');
    icon.className = `bi ${iconMap[sectorKey] || 'bi-ticket-fill'} me-2`;
    title.appendChild(icon);
    title.appendChild(document.createTextNode(`${sectorKey} — Capacidade: ${formatNumber(cap)}`));

    // Slider (range) acima do input
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = `slider-${sectorKey}`;
    slider.className = 'form-range';
    slider.setAttribute('min', Math.max(1, Math.round(basePrice * 0.5)));
    slider.setAttribute('max', Math.max(2, Math.round(basePrice * 3.0)));
    slider.setAttribute('step', '1');
    slider.value = basePrice;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control mt-2';
    input.id = `price-${sectorKey}`;
    input.value = formatCurrency(basePrice);
    input.setAttribute('data-sector', sectorKey);

    // Warning placeholder
    const warning = document.createElement('div');
    warning.id = `warning-${sectorKey}`;
    warning.className = 'small mt-1';

    // Formatação ao focar/desfocar e listener de input
    input.addEventListener('focus', (e) => {
      const n = parseCurrencyFromInput(input.value);
      if (Number.isFinite(n)) {
        input.value = String(Math.round(n));
      }
      setTimeout(() => { try { input.select(); } catch (err) {} }, 0);
    });
    input.addEventListener('blur', () => {
      const n = parseCurrencyFromInput(input.value);
      input.value = Number.isFinite(n) ? formatCurrency(n) : '';
      enforcePriceChain();
      computeAndRender();
    });
    // Input: atualiza slider em tempo real
    input.addEventListener('input', () => {
      const parsed = parseCurrencyFromInput(input.value);
      if (Number.isFinite(parsed) && slider) {
        const clamped = Math.min(Number(slider.max), Math.max(Number(slider.min), Math.round(parsed)));
        slider.value = clamped;
      }
      // Atualiza visor do visitante baseado no intermediário
      const interEl = document.getElementById('price-intermediario');
      if (interEl) {
        const parsedInter = parseCurrencyFromInput(interEl.value);
        const display = document.getElementById('visitor-price-display');
        if (display) {
          const qualityKey = (window.Logic && window.Logic.normalizeQuality) ? window.Logic.normalizeQuality(team.stadiumQuality || 'BOM') : 'BOM';
          const fallbackPrice = Math.round(STD_PRICES.intermediario * window.Logic.getQualityMultiplier(qualityKey));
          const valToShow = Number.isFinite(parsedInter) ? parsedInter : fallbackPrice;
          display.textContent = formatCurrency(valToShow);
        }
      }
      enforcePriceChain();
      computeAndRender();
    });

    // Slider -> input sync
    slider.addEventListener('input', () => {
      input.value = String(Math.round(Number(slider.value)));
      enforcePriceChain();
      computeAndRender();
    });

    const suggested = document.createElement('small');
    suggested.className = 'text-muted d-block mt-2';
    suggested.id = `base-price-display-${sectorKey}`;
    suggested.setAttribute('data-sector', sectorKey);
    suggested.setAttribute('data-std-price', STD_PRICES[sectorKey]);
    suggested.innerHTML = `
      <div class="d-flex align-items-center mt-2">
        <small class="text-muted me-1">Base: <span id="base-value-${sectorKey}">${formatCurrency(basePrice)}</span></small>
        <i class="bi bi-info-circle text-secondary" 
           style="font-size: 0.8rem; cursor: help;"
           data-bs-toggle="tooltip" 
           data-bs-html="true"
           title="Valor calculado com base no multiplicador de qualidade do estádio sobre a tabela padrão.">
        </i>
      </div>
    `;

    body.appendChild(title);
    body.appendChild(slider);
    body.appendChild(input);
    body.appendChild(warning);
    body.appendChild(suggested);
    card.appendChild(body);
    col.appendChild(card);
    container.appendChild(col);

    // Re-init tooltips após inserir elementos dinâmicos
    try { initTooltips(); } catch(e) {}

    // Progress bar item (initial)
    const progWrap = document.createElement('div');
    progWrap.className = 'mb-2';
    progWrap.id = `progress-wrap-${sectorKey}`;
    progWrap.innerHTML = `
      <div class="d-flex justify-content-between">
        <span class="small text-muted text-capitalize">${sectorKey}</span>
        <span id="label-count-${sectorKey}" class="small fw-bold">--</span>
      </div>
      <div class="progress" style="height:18px">
        <div id="bar-${sectorKey}" class="progress-bar bg-info" role="progressbar" style="width:0%">0%</div>
      </div>
    `;
    progressContainer.appendChild(progWrap);
  });

  // Visitor sector display (price is equal to intermediario and not editable)
  const visitorCap = sectorCaps.visitante || 0;
  const visitorCol = document.createElement('div');
  visitorCol.className = 'col-12 mt-2';
  visitorCol.innerHTML = `
    <div class="card card-dark pricing-card p-3">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <div class="small text-muted">Visitante</div>
          <div class="fw-semibold">Capacidade: ${formatNumber(visitorCap)}</div>
        </div>
        <div>
          <div class="small text-muted">Preço (igual ao Intermediário)</div>
          <div class="fw-semibold" id="visitor-price-display">${formatCurrency(Math.round(STD_PRICES.intermediario * priceMultiplier))}</div>
        </div>
      </div>
    </div>
  `;
  container.appendChild(visitorCol);

  // Also add visitor progress bar
  const visitorProg = document.createElement('div');
  visitorProg.className = 'mb-2';
  visitorProg.id = 'progress-wrap-visitante';
  visitorProg.innerHTML = `
    <div class="d-flex justify-content-between">
      <span class="small text-muted">visitante</span>
      <span id="label-count-visitante" class="small fw-bold">--</span>
    </div>
    <div class="progress" style="height:18px">
      <div id="bar-visitante" class="progress-bar bg-warning" role="progressbar" style="width:0%">0%</div>
    </div>
  `;
  progressContainer.appendChild(visitorProg);

  // Setup listeners
  setupPriceListeners();
}

function setupPriceListeners() {
  // Listeners are attached inline during renderSectorCards to preserve UX behavior
  // This function intentionally left minimal to avoid double-binding handlers.
}

// Atualiza display do preço base de todos os setores quando o estádio muda
function updateBasePriceDisplays() {
  if (currentHomeIndex === null || currentHomeIndex === undefined) return;
  
  const home = teams[currentHomeIndex];
  let stadium = selectedStadium || stadiums.find(s => s.owner === home._id);
  if (!stadium) stadium = { name: home.stadium, quality: home.stadiumQuality, capacity: home.stadiumCapacity, owner: home._id };
  
  const quality = (window.Logic && window.Logic.normalizeQuality) ? window.Logic.normalizeQuality(stadium.quality || 'BOM') : ((stadium.quality || 'BOM').toUpperCase());
  let qualityMultiplier = window.Logic.getQualityMultiplier(quality);
  let priceMultiplier = qualityMultiplier;
  if (isRentalStadium) {
    priceMultiplier = qualityMultiplier * 2;
  }
  
  const sectors = ['popular', 'intermediario', 'premium', 'camarote'];
  sectors.forEach(sectorKey => {
    const basePrice = Math.round(STD_PRICES[sectorKey] * priceMultiplier);
    const displayEl = document.getElementById(`base-value-${sectorKey}`);
    if (displayEl) {
      displayEl.textContent = formatCurrency(basePrice);
    }
  });
}

// Garante uma hierarquia lógica de preços (Escada de Valor)
function enforcePriceChain() {
  const sectors = ['popular', 'intermediario', 'premium', 'camarote'];
  const multiplier = 1.4; // Cada setor deve ser pelo menos 40% mais caro que o anterior

  for (let i = 0; i < sectors.length - 1; i++) {
    const currentEl = document.getElementById(`price-${sectors[i]}`);
    const nextEl = document.getElementById(`price-${sectors[i + 1]}`);
    const nextSlider = document.getElementById(`slider-${sectors[i + 1]}`);

    if (!currentEl || !nextEl) continue;

    const currentVal = parseCurrencyFromInput(currentEl.value) || 0;
    const nextVal = parseCurrencyFromInput(nextEl.value) || 0;

    const minAllowedNext = Math.ceil(currentVal * multiplier);

    // Se o próximo setor estiver muito barato em relação ao anterior
    if (nextVal < minAllowedNext) {
      nextEl.value = formatCurrency(minAllowedNext);
      
      // Sincroniza o slider do próximo setor
      if (nextSlider) {
        nextSlider.value = Math.min(Number(nextSlider.max), Math.max(Number(nextSlider.min), minAllowedNext));
      }
      
      // Efeito cascata: verifica o próximo da lista
      console.log(`[Pricing] Ajustando ${sectors[i+1]} para R$ ${minAllowedNext} para manter a hierarquia.`);
    }
  }
}

/**
 * Renderiza os botões de Momento do Time com base em last5General e last5Home
 * Também registra os listeners que alternam o estado ao clicar (V->E->D->V)
 */
function renderMomentButtons() {
  const genContainer = document.getElementById('moment-general');
  const homeContainer = document.getElementById('moment-home');
  const visitorGenContainer = document.getElementById('moment-visitor-general');
  const visitorAwayContainer = document.getElementById('moment-visitor-away');
  if (!genContainer || !homeContainer || !visitorGenContainer || !visitorAwayContainer) return;

  // Garante que os botões existam e estão sincronizados com os arrays
  const genButtons = Array.from(genContainer.querySelectorAll('.moment-btn'));
  const homeButtons = Array.from(homeContainer.querySelectorAll('.moment-btn'));
  const visitorGenButtons = Array.from(visitorGenContainer.querySelectorAll('.moment-btn'));
  const visitorAwayButtons = Array.from(visitorAwayContainer.querySelectorAll('.moment-btn'));

  genButtons.forEach((btn, i) => {
    const val = last5General[i] || 1;
    btn.setAttribute('data-value', String(val));
    updateMomentButtonVisual(btn, val);
    btn.onclick = () => {
      const newVal = cycleResult(valFromBtn(btn));
      last5General[i] = newVal;
      btn.setAttribute('data-value', String(newVal));
      updateMomentButtonVisual(btn, newVal);
      calculatePhaseFactor();
      computeAndRender();
    };
  });

  homeButtons.forEach((btn, i) => {
    const val = last5Home[i] || 1;
    btn.setAttribute('data-value', String(val));
    updateMomentButtonVisual(btn, val);
    btn.onclick = () => {
      const newVal = cycleResult(valFromBtn(btn));
      last5Home[i] = newVal;
      btn.setAttribute('data-value', String(newVal));
      updateMomentButtonVisual(btn, newVal);
      calculatePhaseFactor();
      computeAndRender();
    };
  });

  visitorGenButtons.forEach((btn, i) => {
    const val = last5VisitorGeneral[i] || 1;
    btn.setAttribute('data-value', String(val));
    updateMomentButtonVisual(btn, val);
    btn.onclick = () => {
      const newVal = cycleResult(valFromBtn(btn));
      last5VisitorGeneral[i] = newVal;
      btn.setAttribute('data-value', String(newVal));
      updateMomentButtonVisual(btn, newVal);
      calculateVisitorPhaseFactor();
      computeAndRender();
    };
  });

  visitorAwayButtons.forEach((btn, i) => {
    const val = last5VisitorAway[i] || 1;
    btn.setAttribute('data-value', String(val));
    updateMomentButtonVisual(btn, val);
    btn.onclick = () => {
      const newVal = cycleResult(valFromBtn(btn));
      last5VisitorAway[i] = newVal;
      btn.setAttribute('data-value', String(newVal));
      updateMomentButtonVisual(btn, newVal);
      calculateVisitorPhaseFactor();
      computeAndRender();
    };
  });

  // Atualiza valor inicial exibido
  calculatePhaseFactor();
  calculateVisitorPhaseFactor();
}

function valFromBtn(btn){ return Number(btn.getAttribute('data-value')) || 0; }

function updateMomentButtonVisual(btn, value) {
  btn.classList.remove('state-win','state-draw','state-loss');
  if (value === 3) btn.classList.add('state-win');
  else if (value === 1) btn.classList.add('state-draw');
  else btn.classList.add('state-loss');
}

function onPriceInputChange() {
  // Atualiza visor do preço visitante (espelho do intermediario) sem aplicar trava
  const interInput = document.getElementById('price-intermediario');
  const visitorDisplay = document.getElementById('visitor-price-display');
  if (interInput && visitorDisplay) {
    const parsed = parseCurrencyFromInput(interInput.value);
    const val = Number.isFinite(parsed) ? parsed : STD_PRICES.intermediario;
    visitorDisplay.textContent = formatCurrency(val);
  }
  computeAndRender();
}

function updateProgressBar(id, val, max) {
    const bar = document.getElementById(`bar-${id}`);
    const label = document.getElementById(`label-count-${id}`);
    if (bar) {
        const pct = max > 0 ? (val / max) * 100 : 0;
        bar.style.width = `${Math.min(100, pct)}%`;
        bar.textContent = `${Math.round(pct)}%`;
        // Muda cor se lotar
        if(pct >= 95) bar.classList.replace('bg-info', 'bg-success');
    }
    if (label) {
        label.textContent = formatNumber(val);
    }
}

function computeAndRender() {
  // Ensure a home team is selected
  if (currentHomeIndex === null || currentHomeIndex === undefined) {
    // Clear bars and KPIs
    ['popular','intermediario','premium','camarote','visitante'].forEach(k => {
      const bar = document.getElementById(`bar-${k}`);
      if (bar) { bar.style.width = '0%'; bar.textContent = '0%'; }
    });
    document.getElementById('gross-revenue').textContent = 'R$ --';
    document.getElementById('net-profit').textContent = 'R$ --';
    const smallRev = document.getElementById('gross-revenue-small'); if (smallRev) smallRev.textContent = '--.--';
    const smallProfit = document.getElementById('net-profit-small'); if (smallProfit) smallProfit.textContent = '--.--';
    return;
  }

  const home = teams[currentHomeIndex];
  
  // Usar dados do estádio selecionado ou do time padrão
  let stadium = selectedStadium || stadiums.find(s => s.owner === home._id);
  if (!stadium) stadium = { name: home.stadium, quality: home.stadiumQuality, capacity: home.stadiumCapacity, owner: home._id };
  
  const quality = (window.Logic && window.Logic.normalizeQuality) ? window.Logic.normalizeQuality(stadium.quality || 'BOM') : ((stadium.quality || 'BOM').toUpperCase());
  
  // 1. MULTIPLICADOR DE QUALIDADE
  let multiplier = window.Logic.getQualityMultiplier(quality);
  
  // Aplica multiplicador de 100% para estádios sem dono
  if (isRentalStadium) {
    multiplier = multiplier * 2;
  }

  const sectorDistribution = window.Logic.calculateSectorDistribution(stadium.capacity, quality);
  const distPercentages = window.Logic.StadiumQuality[quality];

  // 2. FATORES DE DEMANDA
  const faseMandante = calculatePhaseFactor();
  // faseVisitante será calculada abaixo dependendo se há visitante selecionado
  let faseVisitante = 0.5;
  const importancia = Number(document.getElementById('select-importance')?.value) || 1;

  // 3. BASES DE TORCIDA
  const rawHomeFans = sumTeamFans(home); // Torcida total bruta
  const homeFanBase = calculateEffectiveFanBase(rawHomeFans); // Torcida útil após curva de engajamento
  const activeRate = ((homeFanBase / rawHomeFans) * 100).toFixed(1);
  console.log(`Time: ${home.name} | Torcida: ${formatNumber(rawHomeFans)} | Ativa: ${formatNumber(homeFanBase)} (${activeRate}%)`);

  // Exibe card explicativo da torcida (Total vs Ativa)
  try {
    const kpiSummary = document.getElementById('kpi-summary');
    if (kpiSummary) {
      let fanSummary = document.getElementById('fan-summary');
      if (!fanSummary) {
        fanSummary = document.createElement('div');
        fanSummary.id = 'fan-summary';
        // insert before kpiSummary
        kpiSummary.parentNode.insertBefore(fanSummary, kpiSummary);
      }
      fanSummary.innerHTML = `
        <div class="alert alert-dark border-secondary d-flex align-items-center gap-2 py-2 mb-3">
          <i class="bi bi-graph-up-arrow text-accent"></i>
          <div class="small">
            <div>Torcida Total: <strong>${formatNumber(rawHomeFans)}</strong></div>
            <div class="text-muted" style="font-size:0.9em">
              Torcida Ativa (Engajada): <strong>${formatNumber(homeFanBase)}</strong>
              <i class="bi bi-info-circle ms-1" data-bs-toggle="tooltip" title="Apenas uma fração da torcida total frequenta estádios. O cálculo usa a Torcida Ativa."></i>
            </div>
          </div>
        </div>
      `;
    }
  } catch (e) {}

  // Lógica de Visitante
  let visitorDemandBase = 0;
  faseVisitante = 0.5; // Valor neutro/baixo por padrão

  if (selectedVisitor) {
    // Só calcula se tiver visitante selecionado
    const visData = getVisitorFanData(selectedVisitor, home.cityId);
    
    // Aplica curva de engajamento (suavizada)
    const effectiveLocalVis = calculateEffectiveFanBase(visData.local);
    const effectiveTotalVis = calculateEffectiveFanBase(visData.total);
    
    visitorDemandBase = effectiveLocalVis + (effectiveTotalVis * 0.10); 
    
    // Calcula fase (Auto ou Manual)
    faseVisitante = calculateVisitorPhaseFactor(); 
  } else {
    // SE NÃO TIVER VISITANTE: ZERA TUDO
    visitorDemandBase = 0;
    faseVisitante = 0;
  }

  // Determina séries e aptidão do confronto (prestígio)
  const homeSerie = (home && home.currentSeries) ? home.currentSeries : 'A';
  const awaySerie = selectedVisitor ? (selectedVisitor.currentSeries || homeSerie) : homeSerie;
  const matchAptitude = (window.Logic && window.Logic.getMatchAptitude) ? window.Logic.getMatchAptitude(homeSerie, awaySerie) : 1.0;
  
  // DEBUG: Log detalhado do multiplicador de confronto
  const matchKey = ((homeSerie || '') + (awaySerie || '')).toUpperCase();
  console.log(`[DEBUG] Série Casa: ${homeSerie} | Série Visitante: ${awaySerie} | Chave: ${matchKey} | Multiplicador: ${matchAptitude}`);
  
  // Exibe badge simples perto do seletor do visitante se for Série A
  try {
    const selVisit = document.getElementById('select-visitante');
    if (selVisit) {
      let badge = document.getElementById('visitor-badge');
      if (!badge) {
        badge = document.createElement('div');
        badge.id = 'visitor-badge';
        badge.className = 'small text-muted mt-1';
        selVisit.parentNode.insertBefore(badge, selVisit.nextSibling);
      }
      if (awaySerie === 'A') {
        badge.innerHTML = `<span class="badge bg-warning text-dark">Time de Elite (Série A)</span>`;
      } else {
        badge.innerHTML = '';
      }
    }
  } catch (e) {}

  const sectors = ['popular', 'intermediario', 'premium', 'camarote'];
  let totalAttendance = 0;
  let homeAttendance = 0;
  let visitorAttendance = 0;
  let grossRevenue = 0;

  // Para memória de cálculo
  const sectorData = {};
  let somaAtendimentoPossivel = 0;
  let somaDemandaMandanteRaw = 0;
  let fatorCorrecao = 1.0;

  // --- TRECHO DE CÁLCULO DE DEMANDA CORRIGIDO ---
  
  // PRIMEIRA PASSADA: Calcula o que cada setor CONSEGUE atender fisicamente
  sectors.forEach(sectorKey => {
    const cap = sectorDistribution[sectorKey] || 0;
    const peso = window.Logic.InterestWeights[sectorKey] || 0;
    const precoBase = Math.round(STD_PRICES[sectorKey] * multiplier);
    
    const inputEl = document.getElementById(`price-${sectorKey}`);
    const precoAtual = inputEl ? (parseCurrencyFromInput(inputEl.value) || precoBase) : precoBase;

    const res = window.Logic.calculateDemand({
      torcidaBase: homeFanBase,
      fase: faseMandante,
      importancia: importancia,
      pesoSetor: peso,
      precoBase: precoBase,
      precoAtual: precoAtual,
      sector: sectorKey,
      atratividadeAdversario: matchAptitude
    });

    const demandaRaw = res.demand || 0;
    // O pulo do gato: A demanda que entra na disputa é limitada pela capacidade do setor
    const demandaEfetivaSetor = Math.min(cap, demandaRaw);

    sectorData[sectorKey] = {
      cap, peso, precoBase, precoAtual, demandaRaw, 
      demandaEfetivaSetor, 
      usedDynamicElasticity: res.dynamicElasticity
    };
    
    somaAtendimentoPossivel += demandaEfetivaSetor;
    somaDemandaMandanteRaw += demandaRaw;
  });

  // Fator de Fidelidade: Se o total de interessados que cabem no estádio 
  // ultrapassa a torcida ativa, escalonamos proporcionalmente.
  fatorCorrecao = somaAtendimentoPossivel > homeFanBase ? (homeFanBase / somaAtendimentoPossivel) : 1.0;

  // SEGUNDA PASSADA: Renderização final
  sectors.forEach(sectorKey => {
    const data = sectorData[sectorKey];
    const publicoFinal = Math.round(data.demandaEfetivaSetor * fatorCorrecao);
    
    totalAttendance += publicoFinal;
    homeAttendance += publicoFinal;
    grossRevenue += publicoFinal * data.precoAtual;

    updateProgressBar(sectorKey, publicoFinal, data.cap);
  })

  // Complementar sincronização e feedback visual após primeira passada
  sectors.forEach(sectorKey => {
    const { cap, peso, precoBase, precoAtual, demandaRaw: demandaRawOrig, usedDynamicElasticity } = sectorData[sectorKey];
    const inputEl = document.getElementById(`price-${sectorKey}`);
    const sliderEl = document.getElementById(`slider-${sectorKey}`);

    // Sincroniza slider (se existir) com o valor atual
    if (sliderEl) {
      const min = Number(sliderEl.min);
      const max = Number(sliderEl.max);
      const v = Math.min(max, Math.max(min, Math.round(precoAtual)));
      sliderEl.value = v;
    }

    // Feedback visual de preço (cheap / expensive / abusive)
    try {
      if (inputEl) {
        inputEl.classList.remove('price-cheap','price-expensive','price-abusive');
        const cheapT = precoBase * 0.8;
        const expT = precoBase * 1.5;
        const abusiveT = precoBase * 2.2;
        const warnEl = document.getElementById(`warning-${sectorKey}`);
        if (precoAtual < cheapT) {
          inputEl.classList.add('price-cheap');
          if (warnEl) warnEl.innerHTML = `<span class="text-success"><i class="bi bi-tag-fill me-1"></i> Promoção</span>`;
        } else if (precoAtual > abusiveT) {
          inputEl.classList.add('price-abusive');
          if (warnEl) warnEl.innerHTML = `<span class="text-danger"><i class="bi bi-exclamation-triangle-fill me-1"></i> Preço exagerado</span>`;
        } else if (precoAtual > expT) {
          inputEl.classList.add('price-expensive');
          if (warnEl) warnEl.innerHTML = `<span class="text-warning"><i class="bi bi-info-circle-fill me-1"></i> Preço alto</span>`;
        } else {
          if (warnEl) warnEl.innerHTML = '';
        }
      }
    } catch (e) {}

    try {
      const progWrap = document.getElementById(`progress-wrap-${sectorKey}`);
      if (progWrap) {
        // Remove a div de detalhes antiga se existir
        let detailsDiv = progWrap.querySelector('.demand-details');
        if (detailsDiv) {
          detailsDiv.remove();
        }
        
        // Cria nova div de detalhes
        detailsDiv = document.createElement('div');
        detailsDiv.className = 'demand-details';
        
        const elasticity = usedDynamicElasticity || window.Logic.SectorElasticity[sectorKey] || 1.0;
        const priceRatio = precoBase / precoAtual;
        const fatorPreco = Math.pow(priceRatio, elasticity).toFixed(2);
        const demandaPotencial = Math.round(homeFanBase * peso * faseMandante * importancia);
        
        const toggleDiv = document.createElement('div');
        toggleDiv.className = 'small text-muted cursor-pointer d-flex justify-content-between align-items-center mt-1';
        toggleDiv.innerHTML = `<span>Detalhes do cálculo</span><i class="bi bi-chevron-down"></i>`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'mt-1 text-light small p-2 bg-dark border border-secondary-50 d-none';
        contentDiv.style.fontSize = '0.85rem';
        contentDiv.innerHTML = `
          <strong>Potencial:</strong> ${formatNumber(demandaPotencial)} pessoas<br>
          (Base: ${formatNumber(homeFanBase)} × Interesse: ${(peso*100).toFixed(0)}% × Fase: ${faseMandante.toFixed(2)} × Prestígio: ${matchAptitude}x)<br><br>
          <strong>Impacto do Preço:</strong> ×${fatorPreco}<br>
          (Sensibilidade: ${elasticity.toFixed(2)})<br><br>
          <strong>Resultado:</strong> ${formatNumber(Math.round(demandaRaw))} ingressos (${formatNumber(publicoFinal)} ocupados de ${formatNumber(cap)})
        `;
        
        detailsDiv.appendChild(toggleDiv);
        detailsDiv.appendChild(contentDiv);
        progWrap.appendChild(detailsDiv);
        
        // Adiciona event listener para toggle
        toggleDiv.addEventListener('click', () => {
          contentDiv.classList.toggle('d-none');
          const icon = toggleDiv.querySelector('i');
          icon.classList.toggle('bi-chevron-down');
          icon.classList.toggle('bi-chevron-up');
        });
      }
      
      // Mantém tooltip também
      const bar = document.getElementById(`bar-${sectorKey}`);
      if (bar) {
        const elasticity = usedDynamicElasticity || window.Logic.SectorElasticity[sectorKey] || 1.0;
        const priceRatio = precoBase / precoAtual;
        const fatorPreco = Math.pow(priceRatio, elasticity).toFixed(2);
        const demandaPotencial = Math.round(homeFanBase * peso * faseMandante * importancia);
        const textoExplicativo = `CÁLCULO DE DEMANDA:\n` +
                                `1. Potencial: ${formatNumber(demandaPotencial)} pessoas\n` +
                                `   (Base: ${formatNumber(homeFanBase)} x Interesse: ${(peso*100).toFixed(0)}% x Fase: ${faseMandante.toFixed(2)})\n` +
              `2. Impacto do Preço: x${fatorPreco}\n` +
              `   (Sensibilidade efetiva do setor: ${elasticity.toFixed(2)})\n` +
                       `Prestígio do Confronto: ${homeSerie} vs ${awaySerie} (aptidão ${matchAptitude}x)\n\n` +
              `Resultado Final: ${formatNumber(Math.round(demandaRaw))} ingressos`;
        bar.setAttribute('title', textoExplicativo);
      }
    } catch (e) {}
  });


  // 5. SETOR VISITANTE
  const capVis = sectorDistribution.visitante || 0;
  // Regra: Preço do visitante = Preço do Intermediário
  const precoBaseVis = Math.round(STD_PRICES.intermediario * multiplier);
  const interEl = document.getElementById('price-intermediario');
  const parsedInter = interEl ? parseCurrencyFromInput(interEl.value) : NaN;
  const precoAtualVis = Number.isFinite(parsedInter) ? parsedInter : precoBaseVis;
  
  // Demanda Visitante
  let demandaVisRaw = 0;
  let visitorDynamicElasticity = window.Logic.SectorElasticity['visitante'] || 1.5;
  try {
    const resVis = window.Logic.calculateDemand({
      torcidaBase: visitorDemandBase, // Base calculada (Local + Viagem)
      fase: Math.min(faseVisitante, 1.1), // Amortecedor: máximo 1.1
      importancia: importancia,      // Importância do jogo
      pesoSetor: 1.0,                // Peso 1.0 pois visitorDemandBase já é o público alvo total
      precoBase: precoBaseVis,
      precoAtual: precoAtualVis,
      sector: 'visitante',
      atratividadeAdversario: matchAptitude
    });
    if (resVis && typeof resVis === 'object' && 'demand' in resVis) {
      demandaVisRaw = resVis.demand;
      visitorDynamicElasticity = resVis.dynamicElasticity || visitorDynamicElasticity;
    } else {
      demandaVisRaw = Number(resVis) || 0;
    }
  } catch (err) {
    console.error('Error calculating visitor demand', err);
  }

  const publicoVis = Math.min(capVis, Math.round(demandaVisRaw));
  totalAttendance += publicoVis;
  visitorAttendance += publicoVis;
  grossRevenue += publicoVis * precoAtualVis;
  
  // Atualiza barra de visitante e cria div expansível
  updateProgressBar('visitante', publicoVis, capVis);
  try {
    const progWrapVis = document.getElementById('progress-wrap-visitante');
    if (progWrapVis) {
      // Remove a div de detalhes antiga se existir
      let detailsDiv = progWrapVis.querySelector('.demand-details');
      if (detailsDiv) {
        detailsDiv.remove();
      }
      
      // Cria nova div de detalhes
      detailsDiv = document.createElement('div');
      detailsDiv.className = 'demand-details';
      
      const priceRatioVis = precoBaseVis / precoAtualVis;
      const fatorPrecoVis = Math.pow(priceRatioVis, visitorDynamicElasticity).toFixed(2);
      const demandaVisConstante = Math.round(visitorDemandBase * faseVisitante * importancia);
      
      const toggleDiv = document.createElement('div');
      toggleDiv.className = 'small text-muted cursor-pointer d-flex justify-content-between align-items-center mt-1';
      toggleDiv.innerHTML = `<span>Detalhes do cálculo</span><i class="bi bi-chevron-down"></i>`;
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'mt-1 text-light small p-2 bg-dark border border-secondary-50 d-none';
      contentDiv.style.fontSize = '0.85rem';
      contentDiv.innerHTML = `
        <strong>Potencial:</strong> ${formatNumber(demandaVisConstante)} pessoas<br>
        (Base: ${formatNumber(Math.round(visitorDemandBase))} × Fase: ${(faseVisitante * 100).toFixed(0)}% × Prestígio: ${matchAptitude}x)<br><br>
        <strong>Impacto do Preço:</strong> ×${fatorPrecoVis}<br>
        (Sensibilidade: ${visitorDynamicElasticity.toFixed(2)})<br><br>
        <strong>Resultado:</strong> ${formatNumber(Math.round(demandaVisRaw))} ingressos (${formatNumber(publicoVis)} ocupados de ${formatNumber(capVis)})
      `;
      
      detailsDiv.appendChild(toggleDiv);
      detailsDiv.appendChild(contentDiv);
      progWrapVis.appendChild(detailsDiv);
      
      // Adiciona event listener para toggle
      toggleDiv.addEventListener('click', () => {
        contentDiv.classList.toggle('d-none');
        const icon = toggleDiv.querySelector('i');
        icon.classList.toggle('bi-chevron-down');
        icon.classList.toggle('bi-chevron-up');
      });
    }
    
    // Mantém tooltip também
    const barVis = document.getElementById('bar-visitante');
    if (barVis) {
      const priceRatioVis = precoBaseVis / precoAtualVis;
      const fatorPrecoVis = Math.pow(priceRatioVis, visitorDynamicElasticity).toFixed(2);
      const breakdownVis = `\nFORMULA DA DEMANDA (Visitante):\n-------------------\n` +
               `1. Base Visitante: ${formatNumber(Math.round(visitorDemandBase))}\n` +
               `2. Fase: ${(faseVisitante * 100).toFixed(0)}% x Importancia: ${importancia}x\n` +
               `-------------------\n` +
               `POTENCIAL VISITANTE: ${formatNumber(Math.round(visitorDemandBase * faseVisitante * importancia))} pessoas\n` +
               `-------------------\n` +
               `AJUSTE DE PRECO (R$ ${precoAtualVis}): Preco Base R$ ${precoBaseVis} vs Atual = Ratio ${priceRatioVis.toFixed(2)}\n` +
               `Impacto do Preço: x${fatorPrecoVis} (elasticidade efetiva: ${visitorDynamicElasticity.toFixed(2)})\n` +
               `Prestígio do Confronto: ${homeSerie} vs ${awaySerie} (aptidão ${matchAptitude}x)`;
      barVis.setAttribute('title', breakdownVis);
    }
  } catch (e) {}

  // 6. CUSTOS E LUCROS
  // Custo Fixo escala com a qualidade do estádio
  let fixedCostReal = STD_FIXED_COST * multiplier;
  
  // Adiciona custo de aluguel se for estádio sem dono
  if (isRentalStadium && rentalPrice > 0) {
    fixedCostReal += rentalPrice;
  }
  
  // Custo Variável escala com a qualidade (Ex: Excelente = 1.5x mais caro por pessoa)
  const costPerHead = Math.round(STD_VARIABLE_COST * multiplier);
  const variableCostReal = costPerHead * totalAttendance;

  const totalCosts = fixedCostReal + variableCostReal;
  const netProfit = grossRevenue - totalCosts;

// 7. MEMÓRIA DE CÁLCULO (Enterprise Dashboard Refinado)
  if (currentHomeIndex !== null) {
    const ctxTotal = (faseMandante * importancia * matchAptitude).toFixed(2);
    const engagementBand = getEngagementBand(rawHomeFans);
    const shortageApplied = fatorCorrecao < 1.0;
    
    mathExplanation = `
      <div class="audit-report p-3">
        <div class="row g-3 mb-4">
          
          <div class="col-md-4">
            <div class="kpi-audit-card border-top border-primary border-4 shadow-sm">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="label text-primary fw-bold">CAPACIDADE ATIVA (α)</span>
                <i class="bi bi-people text-primary opacity-50"></i>
              </div>
              <div class="value-container mb-2">
                <span class="value display-6 fw-bold text-dark">${formatNumber(homeFanBase)}</span>
                <span class="unit text-muted small ms-1">fãs</span>
              </div>
              <div class="sub-info d-flex flex-column gap-1">
                <div class="d-flex align-items-center justify-content-between">
                  <span class="text-secondary small">Engajamento (η):</span>
                  <span class="badge bg-secondary">${((homeFanBase/rawHomeFans)*100).toFixed(1)}%</span>
                </div>
                <div class="d-flex align-items-center justify-content-between">
                  <span class="text-secondary small">Perfil:</span>
                  <span class="var-badge text-uppercase">${engagementBand.name}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="kpi-audit-card border-top border-indigo border-4 shadow-sm" style="border-top-color: #4c6ef5 !important;">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="label fw-bold" style="color: #4c6ef5;">FATOR DE EVENTO (Φ)</span>
                <i class="bi bi-lightning-charge text-indigo opacity-50" style="color: #4c6ef5;"></i>
              </div>
              <div class="value-container mb-2">
                <span class="value display-6 fw-bold text-dark">${ctxTotal}</span>
                <span class="unit text-muted small ms-1">x</span>
              </div>
              <div class="sub-info small text-secondary">
                <div class="mb-1 d-flex justify-content-between">
                  <span>Multiplicador Base:</span>
                  <span class="fw-bold">Φ = f · i · β</span>
                </div>
                <div class="bg-light p-1 px-2 rounded-pill border d-flex justify-content-around font-monospace" style="font-size: 0.75rem;">
                  <span>f:${faseMandante.toFixed(2)}</span>
                  <span>i:${importancia}</span>
                  <span>β:${matchAptitude}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="kpi-audit-card border-top border-${shortageApplied ? 'danger' : 'success'} border-4 shadow-sm">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="label text-${shortageApplied ? 'danger' : 'success'} fw-bold">EFICIÊNCIA (λ)</span>
                <i class="bi bi-${shortageApplied ? 'exclamation-circle' : 'check-circle'} text-${shortageApplied ? 'danger' : 'success'} opacity-50"></i>
              </div>
              <div class="value-container mb-2">
                <span class="value display-6 fw-bold text-dark">${(fatorCorrecao * 100).toFixed(0)}%</span>
              </div>
              <div class="sub-info">
                <p class="mb-0 text-secondary" style="font-size: 0.8rem; line-height: 1.2;">
                  ${shortageApplied 
                    ? `<strong>Escassez detectada:</strong> A demanda física superou em ${((1/fatorCorrecao - 1)*100).toFixed(0)}% o pool de fãs ativos.` 
                    : `<strong>Sistema equilibrado:</strong> Todos os torcedores interessados foram alocados.`}
                </p>
              </div>
            </div>
          </div>

        </div>

        <div class="audit-table-wrapper shadow-sm rounded">
          <table class="audit-table">
            <thead>
              <tr>
                <th>Setor</th>
                <th>Interesse Bruto</th>
                <th>Cap. Física</th>
                <th>Impacto Preço</th>
                <th>Demanda Ajustada</th>
                <th>Final</th>
              </tr>
            </thead>
            <tbody>
              ${sectors.map(s => {
                const d = sectorData[s];
                const ratio = (d.precoBase / d.precoAtual).toFixed(2);
                const final = Math.round(d.demandaEfetivaSetor * fatorCorrecao);
                return `
                  <tr class="indicator-${s}">
                    <td><strong>${s.toUpperCase()}</strong></td>
                    <td>${formatNumber(Math.round(homeFanBase * d.peso * faseMandante * importancia * matchAptitude))}</td>
                    <td>${formatNumber(d.cap)}</td>
                    <td>${ratio}x (k=${d.usedDynamicElasticity.toFixed(1)})</td>
                    <td>${formatNumber(Math.round(d.demandaRaw))}</td>
                    <td class="fw-bold text-dark">${formatNumber(final)}</td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
          ${fatorCorrecao < 1 ? `
            <div class="p-2 bg-danger bg-opacity-10 text-danger small fw-bold text-center border-top border-danger border-opacity-25">
              ⚠️ Ajuste de escassez global de ${((1 - fatorCorrecao) * 100).toFixed(1)}% aplicado para respeitar o teto de torcedores ativos.
            </div>` : ''}
        </div>
      </div>
    `;
  }

  // Exibe na seção de Memória de Cálculo
  const mathContent = document.getElementById('math-explanation-content');
  if (mathContent) {
    mathContent.innerHTML = mathExplanation || '<div class="empty-state"><div class="empty-icon" style="font-size: 2rem; margin-bottom: 1rem;">—</div><div class="empty-text">Selecione um time para ver a análise detalhada</div></div>';
  }

  // 8. EXIBIÇÃO KPIs
  const grossRevenueEl = document.getElementById('gross-revenue');
  if (grossRevenueEl) grossRevenueEl.textContent = formatCurrency(grossRevenue);

  const totalAttendanceEl = document.getElementById('total-attendance');
  if (totalAttendanceEl) totalAttendanceEl.textContent = formatNumber(totalAttendance);

  const totalCostsEl = document.getElementById('total-costs');
  if (totalCostsEl) totalCostsEl.textContent = formatCurrency(totalCosts);

  const profitEl = document.getElementById('net-profit');
  if (profitEl) {
    profitEl.textContent = formatCurrency(netProfit);
    // Cor do lucro (Verde ou Vermelho)
    profitEl.style.color = netProfit >= 0 ? 'var(--brand-primary)' : '#d68585';
  }

  const smallRev = document.getElementById('gross-revenue-small'); 
  if (smallRev) smallRev.textContent = formatCurrency(grossRevenue);
  
  const smallProfit = document.getElementById('net-profit-small'); 
  if (smallProfit) smallProfit.textContent = formatCurrency(netProfit);

  // 9. DETALHAMENTO NOS COLLAPSES
  const attendanceDetails = document.getElementById('attendance-details');
  if (attendanceDetails) {
    attendanceDetails.innerHTML = `Mandante: ${formatNumber(homeAttendance)} + Visitante: ${formatNumber(visitorAttendance)}`;
  }

  const costDetails = document.getElementById('cost-details');
  if (costDetails) {
    costDetails.innerHTML = `
      <div class="mt-2 border-start border-secondary ps-2">
        <div>Custo Fixo: ${formatCurrency(fixedCostReal)}</div>
        <small class="text-muted d-block mb-1">Manutenção predial e staff base.</small>
        
        <div>Custo Variável: ${formatCurrency(variableCostReal)}</div>
        <small class="text-muted d-block">
          ${formatNumber(totalAttendance)} pagantes x ${formatCurrency(costPerHead)}
          (Limpeza, segurança e consumo per capita).
        </small>
      </div>
    `;
  }

  // Receita - cria elemento de detalhamento se não existir
  const kpi = document.getElementById('kpi-summary');
  if (kpi) {
    let revenueDetails = document.getElementById('revenue-details');
    if (!revenueDetails) {
      revenueDetails = document.createElement('div');
      revenueDetails.id = 'revenue-details';
      revenueDetails.className = 'small text-muted mt-2';
      kpi.appendChild(revenueDetails);
    }
    const avgTicket = totalAttendance > 0 ? (grossRevenue / totalAttendance) : 0;
    revenueDetails.innerHTML = `
      <div class="small text-muted mt-2 border-start border-3 border-success ps-2">
        <strong>Receita Bruta:</strong> ${formatCurrency(grossRevenue)} <br>
        <span class="text-secondary" style="font-size:0.85em">Média por ingresso: ${formatCurrency(avgTicket)}</span>
      </div>
    `;
  }

  // Re-init tooltips para garantir que títulos/tooltips novos sejam aplicados
  try { initTooltips(); } catch (e) {}

  // Atualiza o display do preço base (soluciona bug de atualização)
  updateBasePriceDisplays();

  // Popula o detalhamento de demanda
  const demandListEl = document.getElementById('demand-list-html');
  if (demandListEl) {
    demandListEl.innerHTML = breakdownHTML || '<p class="text-muted">Selecione um time para ver o detalhamento.</p>';
  }

  // Inicializa tooltips diretamente para elementos atuais (considera elementos dinâmicos)
  try {
    if (typeof bootstrap !== 'undefined') {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
      // armazenar referência caso queira destruir depois
      window._initialBootstrapTooltips = tooltipList;
    }
  } catch (e) { console.warn('Tooltip init explicit failed', e); }
}

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
  loadData();
  // Garante que os botões de Momento do Time existam e tenham listeners desde o início
  renderMomentButtons();
  renderVisitorMomentButtons(); // Visitante (NOVO)
  
  // Configura switches Auto/Manual e inputs manuais
  const swHome = document.getElementById('switch-home-phase');
  const swVisitor = document.getElementById('switch-visitor-phase');
  const homeAutoDiv = document.getElementById('home-phase-auto');
  const homeManualDiv = document.getElementById('home-phase-manual');
  const visitorAutoDiv = document.getElementById('visitor-phase-auto');
  const visitorManualDiv = document.getElementById('visitor-phase-manual');
  const inputHome = document.getElementById('input-home-phase');
  const inputVisitor = document.getElementById('input-visitor-phase');

  function applyHomeMode() {
    const isAuto = swHome ? swHome.checked : true;
    if (homeAutoDiv && homeManualDiv) {
      homeAutoDiv.classList.toggle('d-none', !isAuto);
      homeManualDiv.classList.toggle('d-none', isAuto);
    }
    calculatePhaseFactor();
    computeAndRender();
  }

  function applyVisitorMode() {
    const isAuto = swVisitor ? swVisitor.checked : true;
    if (visitorAutoDiv && visitorManualDiv) {
      visitorAutoDiv.classList.toggle('d-none', !isAuto);
      visitorManualDiv.classList.toggle('d-none', isAuto);
    }
    calculateVisitorPhaseFactor();
    computeAndRender();
  }

  if (swHome) swHome.addEventListener('change', applyHomeMode);
  if (swVisitor) swVisitor.addEventListener('change', applyVisitorMode);
  if (inputHome) inputHome.addEventListener('input', computeAndRender);
  if (inputVisitor) inputVisitor.addEventListener('input', computeAndRender);

  // Aplica estado inicial
  applyHomeMode();
  applyVisitorMode();
  // Ativar Tooltips (Bootstrap)
  if (typeof bootstrap !== 'undefined') {
    try {
      // initialize any existing tooltips
      initTooltips();
    } catch (err) {
      console.warn('Tooltip init failed', err);
    }
  }
});

/**
 * Renderiza e ativa os botões de momento do visitante
 */
function renderVisitorMomentButtons() {
  const genContainer = document.getElementById('moment-visitor-general');
  const awayContainer = document.getElementById('moment-visitor-away');
  if (!genContainer || !awayContainer) return; // Proteção caso o HTML não exista

  const setupBtn = (btn, arr, idx) => {
    const val = arr[idx] || 1; // Default Empate
    btn.setAttribute('data-value', String(val));
    updateMomentButtonVisual(btn, val);
    
    // Remove listeners antigos para evitar duplicação (cloneNode truque) ou apenas reatribui onclick
    btn.onclick = () => {
      const newVal = cycleResult(valFromBtn(btn));
      arr[idx] = newVal;
      btn.setAttribute('data-value', String(newVal));
      updateMomentButtonVisual(btn, newVal);
      // Recalcula fase e renderiza tudo
      calculateVisitorPhaseFactor();
      computeAndRender();
    };
  };

  const genBtns = Array.from(genContainer.querySelectorAll('.moment-btn'));
  const awayBtns = Array.from(awayContainer.querySelectorAll('.moment-btn'));

  genBtns.forEach((btn, i) => setupBtn(btn, last5VisitorGeneral, i));
  awayBtns.forEach((btn, i) => setupBtn(btn, last5VisitorAway, i));
}

// Inicializa (ou reinicializa) tooltips do Bootstrap para elementos dinâmicos
function initTooltips() {
  if (typeof bootstrap === 'undefined') return;
  // Destrói instâncias antigas, se houver
  if (window._bootstrapTooltips && Array.isArray(window._bootstrapTooltips)) {
    window._bootstrapTooltips.forEach(t => { try { t.dispose(); } catch (e) {} });
  }
  window._bootstrapTooltips = [];
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  window._bootstrapTooltips = [...tooltipTriggerList].map(el => new bootstrap.Tooltip(el));
}