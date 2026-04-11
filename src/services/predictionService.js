/**
 * SACRED GRID PREDICTION ENGINE (SGPE)
 * Predicts darshan wait times based on historical peak patterns, live health, and time of day.
 */

const SECTOR_CONFIGS = {
  tirupati: { baseWait: 12, peakWeight: 1.8, shoulderWeight: 1.2 },
  vijayawada: { baseWait: 3, peakWeight: 1.5, shoulderWeight: 1.1 },
  srisailam: { baseWait: 5, peakWeight: 1.6, shoulderWeight: 1.2 },
  simhachalam: { baseWait: 2, peakWeight: 1.4, shoulderWeight: 1.1 },
  annavaram: { baseWait: 2, peakWeight: 1.3, shoulderWeight: 1.0 }
};

/**
 * Calculates crowd intensity for a given hour (0-23).
 * 0.0 = Empty, 1.0 = Critical Capacity
 */
export const calculateHourIntensity = (hour, dayOfWeek = new Date().getDay(), sector = 'tirupati', weatherFactor = 1.0) => {
  const cfg = SECTOR_CONFIGS[sector] || SECTOR_CONFIGS.tirupati;
  
  // Base hourly pattern (Gaussian-like peaks at 10 AM and 6 PM)
  let intensity = 0.3; // Baseline
  
  // Morning Peak (7 AM - 12 PM)
  if (hour >= 7 && hour <= 12) {
    const dist = Math.abs(hour - 10);
    intensity += (0.5 * Math.exp(-(dist * dist) / 4)) * cfg.peakWeight;
  }
  
  // Evening Peak (5 PM - 9 PM)
  if (hour >= 17 && hour <= 21) {
    const dist = Math.abs(hour - 19);
    intensity += (0.4 * Math.exp(-(dist * dist) / 3)) * cfg.peakWeight;
  }

  // Weekend Multiplier (Fri, Sat, Sun)
  if (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) {
    intensity *= 1.4;
  }

  // Meteorological Multiplier
  intensity *= weatherFactor;

  return Math.min(1.0, intensity);
};

/**
 * Returns a 24-hour forecast starting from now.
 */
export const get24HourForecast = (sector = 'tirupati', weatherFactor = 1.0) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();
  
  const forecast = [];
  for (let i = 0; i < 24; i++) {
    const targetHour = (currentHour + i) % 24;
    const targetDay = (currentDay + (currentHour + i >= 24 ? 1 : 0)) % 7;
    forecast.push({
      hour: targetHour,
      intensity: calculateHourIntensity(targetHour, targetDay, sector, weatherFactor),
      displayHour: `${targetHour % 12 || 12}${targetHour >= 12 ? 'PM' : 'AM'}`
    });
  }
  return forecast;
};

/**
 * Identifies the 3-hour window with the lowest average intensity.
 */
export const getOptimalVisitWindow = (sector = 'tirupati') => {
  const forecast = get24HourForecast(sector);
  let bestAvg = 2.0;
  let bestIdx = 0;

  for (let i = 0; i < 20; i++) {
    const avg = (forecast[i].intensity + forecast[i+1].intensity + forecast[i+2].intensity) / 3;
    if (avg < bestAvg) {
      bestAvg = avg;
      bestIdx = i;
    }
  }

  const start = forecast[bestIdx];
  const end = forecast[bestIdx + 2];
  
  // Calculate potential time saving (Compared to peak)
  const peakIntensity = 0.9;
  const savingPercent = Math.round((peakIntensity - bestAvg) * 100);

  return {
    startTime: start.displayHour,
    endTime: end.displayHour,
    intensity: bestAvg,
    savingPercent: Math.max(10, savingPercent),
    status: bestAvg < 0.3 ? 'OPTIMAL' : bestAvg < 0.6 ? 'MODERATE' : 'HEAVY'
  };
};

/**
 * Predicts absolute wait time in hours.
 */
export const predictWaitTimeHours = (hourOffset = 0, currentGridHealth = 100, sector = 'tirupati') => {
  const forecast = get24HourForecast(sector);
  const data = forecast[hourOffset];
  const cfg = SECTOR_CONFIGS[sector] || SECTOR_CONFIGS.tirupati;
  
  // Health impact: lower health = higher multiplier
  const healthMultiplier = 1 + ((100 - currentGridHealth) / 50);
  
  const baseWait = cfg.baseWait * data.intensity * healthMultiplier;
  
  // Minimum wait 
  return Math.max(0.5, parseFloat(baseWait.toFixed(1)));
};
