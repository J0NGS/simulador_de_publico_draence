/**
 * ============================================
 * DRAENCE — SIMULAÇÃO
 * ============================================
 * Função pura: recebe o estado escolhido na tela e devolve público,
 * receita, custos e a memória de cálculo. Não toca no DOM.
 */
import {
  SECTORS, STD_PRICES, STD_FIXED_COST, STD_VARIABLE_COST,
  RENTAL_PRICE_FACTOR, VISITOR_TRAVEL_SHARE, VISITOR_PHASE_CAP
} from './config.js';
import {
  StadiumQuality, InterestWeights, SectorElasticity,
  calculateDemand, calculateSectorDistribution, getMatchAptitude,
  getQualityMultiplier, normalizeQuality
} from './logic.js';
import {
  calculateEffectiveFanBase, getEngagementBand, getVisitorFanData, sumTeamFans
} from './fans.js';
import { calculatePhase } from './phase.js';

/** Multiplicador de preço/custo: qualidade do estádio × aluguel (se neutro). */
export function getPriceMultiplier(stadium, isRental) {
  const quality = normalizeQuality(stadium?.quality || 'BOM');
  const base = getQualityMultiplier(quality);
  return isRental ? base * RENTAL_PRICE_FACTOR : base;
}

/** Preço base de cada setor para o estádio escolhido. */
export function getBasePrices(stadium, isRental) {
  const multiplier = getPriceMultiplier(stadium, isRental);
  const prices = {};
  SECTORS.forEach((key) => { prices[key] = Math.round(STD_PRICES[key] * multiplier); });
  return prices;
}

/**
 * @param {object} input
 * @param {object} input.home        time mandante
 * @param {object|null} input.visitor time visitante (ou null)
 * @param {object} input.stadium     { name, quality, capacity, owner }
 * @param {boolean} input.isRental   estádio sem dono
 * @param {number} input.rentalPrice aluguel (R$), usado se isRental
 * @param {number} input.importance  multiplicador de importância do jogo
 * @param {object} input.phases      { home, visitor } no formato de phase.js
 * @param {object} input.prices      preço digitado por setor (vazio → preço base)
 */
export function simulate({ home, visitor, stadium, isRental, rentalPrice, importance, phases, prices }) {
  const quality = normalizeQuality(stadium.quality || 'BOM');
  const multiplier = getPriceMultiplier(stadium, isRental);
  const capacities = calculateSectorDistribution(stadium.capacity, quality);

  const homePhase = calculatePhase(phases.home);
  const visitorPhase = visitor ? calculatePhase(phases.visitor) : 0;

  // Torcida do mandante
  const rawFans = sumTeamFans(home);
  const activeFans = calculateEffectiveFanBase(rawFans);

  // Torcida do visitante: moradores da cidade + fração que viaja
  let visitorDemandBase = 0;
  if (visitor) {
    const data = getVisitorFanData(visitor, home.cityId);
    visitorDemandBase = calculateEffectiveFanBase(data.local)
      + calculateEffectiveFanBase(data.total) * VISITOR_TRAVEL_SHARE;
  }

  // Prestígio do confronto
  const homeSerie = home.currentSeries || 'A';
  const awaySerie = visitor ? (visitor.currentSeries || homeSerie) : homeSerie;
  const aptitude = getMatchAptitude(homeSerie, awaySerie);

  // 1ª passada: o que cada setor consegue atender fisicamente
  const sectors = {};
  let possibleTotal = 0;
  SECTORS.forEach((key) => {
    const cap = capacities[key] || 0;
    const weight = InterestWeights[key] || 0;
    const basePrice = Math.round(STD_PRICES[key] * multiplier);
    const price = Number(prices[key]) > 0 ? Number(prices[key]) : basePrice;

    const { demand, dynamicElasticity } = calculateDemand({
      torcidaBase: activeFans,
      fase: homePhase,
      importancia: importance,
      pesoSetor: weight,
      precoBase: basePrice,
      precoAtual: price,
      sector: key,
      atratividadeAdversario: aptitude
    });

    const effective = Math.min(cap, demand);
    possibleTotal += effective;
    sectors[key] = {
      cap,
      weight,
      basePrice,
      price,
      rawDemand: demand,
      effective,
      elasticity: dynamicElasticity,
      priceFactor: Math.pow(basePrice / price, dynamicElasticity),
      interest: activeFans * weight * homePhase * importance * aptitude
    };
  });

  // Escassez: se os interessados que cabem superam a torcida ativa, escala proporcionalmente
  const shortageFactor = possibleTotal > activeFans ? activeFans / possibleTotal : 1;

  let homeAttendance = 0;
  let revenue = 0;
  SECTORS.forEach((key) => {
    const s = sectors[key];
    s.attendance = Math.round(s.effective * shortageFactor);
    homeAttendance += s.attendance;
    revenue += s.attendance * s.price;
  });

  // Setor visitante: preço igual ao intermediário
  const visitorCap = capacities.visitante || 0;
  const visitorBasePrice = Math.round(STD_PRICES.intermediario * multiplier);
  const visitorPrice = sectors.intermediario.price;
  const visitorPhaseUsed = Math.min(visitorPhase, VISITOR_PHASE_CAP);

  const visitorDemand = calculateDemand({
    torcidaBase: visitorDemandBase,
    fase: visitorPhaseUsed,
    importancia: importance,
    pesoSetor: 1,
    precoBase: visitorBasePrice,
    precoAtual: visitorPrice,
    sector: 'visitante',
    atratividadeAdversario: aptitude
  });
  const visitorAttendance = Math.min(visitorCap, Math.round(visitorDemand.demand));
  revenue += visitorAttendance * visitorPrice;

  const visitorSector = {
    cap: visitorCap,
    basePrice: visitorBasePrice,
    price: visitorPrice,
    rawDemand: visitorDemand.demand,
    attendance: visitorAttendance,
    elasticity: visitorDemand.dynamicElasticity || SectorElasticity.visitante,
    priceFactor: Math.pow(visitorBasePrice / visitorPrice, visitorDemand.dynamicElasticity),
    demandBase: visitorDemandBase,
    phase: visitorPhaseUsed,
    interest: visitorDemandBase * visitorPhaseUsed * importance * aptitude,
    potential: visitorDemandBase * visitorPhase * importance
  };

  // Custos
  const attendance = homeAttendance + visitorAttendance;
  const rental = isRental && rentalPrice > 0 ? rentalPrice : 0;
  const fixedCost = STD_FIXED_COST * multiplier + rental;
  const costPerHead = Math.round(STD_VARIABLE_COST * multiplier);
  const variableCost = costPerHead * attendance;
  const totalCosts = fixedCost + variableCost;
  const profit = revenue - totalCosts;

  return {
    quality,
    multiplier,
    distribution: StadiumQuality[quality],
    fans: {
      raw: rawFans,
      active: activeFans,
      engagement: rawFans > 0 ? activeFans / rawFans : 0,
      band: getEngagementBand(rawFans)
    },
    context: { homePhase, visitorPhase, importance, aptitude, homeSerie, awaySerie, phi: homePhase * importance * aptitude },
    sectors,
    visitor: visitorSector,
    shortage: { factor: shortageFactor, applied: shortageFactor < 1, possibleTotal },
    totals: {
      attendance,
      homeAttendance,
      visitorAttendance,
      revenue,
      fixedCost,
      rental,
      costPerHead,
      variableCost,
      totalCosts,
      profit,
      averageTicket: attendance > 0 ? revenue / attendance : 0,
      margin: revenue > 0 ? profit / revenue : 0
    }
  };
}
