
const covid19ImpactEstimator = (data) => {
  const {
    reportedCases,
    timeToElapse,
    periodType,
    totalHospitalBeds,
    region
  } = data;
  const result = {
    data,
    impact: {},
    severeImpact: {}
  };


  // calculate the number of currently infected for both impact and severe impact
  const currentlyInfected = (factor) => reportedCases * factor;
  const infectionsByRequestedTime = (time) => {
    let t = time;
    switch (periodType) {
      case 'days':
        t *= 1;
        break;
      case 'weeks':
        t *= 7;
        break;
      case 'months':
        t *= 30;
        break;
      default:
        break;
    }
    const dollarMultiplierTIme = t;
    const multiplier = 2 ** Math.floor(t / 3);
    return { multiplier, dollarMultiplierTIme };
  };
  result.impact.currentlyInfected = currentlyInfected(10);
  result.severeImpact.currentlyInfected = currentlyInfected(50);
  result.impact.infectionsByRequestedTime = (
    result.impact.currentlyInfected * infectionsByRequestedTime(timeToElapse).multiplier
  );
  result.severeImpact.infectionsByRequestedTime = (
    result.severeImpact.currentlyInfected * infectionsByRequestedTime(timeToElapse).multiplier
  );
  result.impact.severeCasesByRequestedTime = Math.ceil(
    result.impact.infectionsByRequestedTime * 0.15
  );
  result.severeImpact.severeCasesByRequestedTime = Math.ceil(
    result.severeImpact.infectionsByRequestedTime * 0.15
  );
  result.impact.hospitalBedsByRequestedTime = Math.ceil(
    Math.ceil(0.35 * totalHospitalBeds) - result.impact.severeCasesByRequestedTime
  );
  result.severeImpact.hospitalBedsByRequestedTime = Math.ceil(
    Math.ceil(0.35 * totalHospitalBeds) - result.severeImpact.severeCasesByRequestedTime
  );
  result.impact.casesForICUByRequestedTime = Math.floor(
    result.impact.infectionsByRequestedTime * 0.05
  );
  result.severeImpact.casesForICUByRequestedTime = Math.floor(
    result.severeImpact.infectionsByRequestedTime * 0.05
  );
  result.impact.casesForVentilatorsByRequestedTime = (
    Math.floor(result.impact.infectionsByRequestedTime * 0.02)
  );
  result.severeImpact.casesForVentilatorsByRequestedTime = (
    Math.floor(result.severeImpact.infectionsByRequestedTime * 0.02)
  );
  result.impact.dollarsInFlight = Math.floor(
    (result.impact.infectionsByRequestedTime * region.avgDailyIncomePopulation
      * region.avgDailyIncomeInUSD) / infectionsByRequestedTime(timeToElapse).dollarMultiplierTIme
  );
  result.severeImpact.dollarsInFlight = Math.floor(
    (result.severeImpact.infectionsByRequestedTime * region.avgDailyIncomePopulation
        * region.avgDailyIncomeInUSD) / infectionsByRequestedTime(timeToElapse).dollarMultiplierTIme
  );
  // console.log(result);
  return result;
};

module.exports = covid19ImpactEstimator;