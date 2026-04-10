/**
 * FESTIVAL SERVICE — Sacred Festival Calendar & Crowd Predictions
 * All festivals for all 6 sacred hubs with predicted crowd intensity.
 */

const FESTIVALS = [
  // TIRUPATI (Sector 01)
  { id: 'brahmotsavam_2026', sector: 'tirupati', name: 'Brahmotsavam', date: '2026-09-22', endDate: '2026-09-30', crowd: 'CRITICAL', intensity: 1.0, desc: '9-day annual festival. Highest footfall of the year. Up to 5 lakh pilgrims/day.', mantra: 'Om Namo Venkatesaya' },
  { id: 'vaikunta_ekadasi_2026', sector: 'tirupati', name: 'Vaikunta Ekadasi', date: '2027-01-02', crowd: 'CRITICAL', intensity: 0.95, desc: 'Sacred 11th day. Vaikunta Dwaram opens. 3 lakh+ pilgrims expected.' },
  { id: 'rathasaptami_2026', sector: 'tirupati', name: 'Rathasaptami', date: '2026-02-04', crowd: 'HIGH', intensity: 0.75, desc: 'Sun festival. Chariot procession. Significant crowd expected.' },
  { id: 'ugadi_tirupati', sector: 'tirupati', name: 'Ugadi (New Year)', date: '2026-03-30', crowd: 'HIGH', intensity: 0.70, desc: 'Telugu New Year. Increased footfall.' },

  // VIJAYAWADA (Sector 02)
  { id: 'dussehra_2026', sector: 'vijayawada', name: 'Dussehra (Vijayawada)', date: '2026-10-02', endDate: '2026-10-11', crowd: 'CRITICAL', intensity: 0.98, desc: 'Navratri festival. 10-day event. Over 10 lakh pilgrims expected at Indrakeeladri.' },
  { id: 'ugadi_vjw', sector: 'vijayawada', name: 'Ugadi Celebrations', date: '2026-03-30', crowd: 'HIGH', intensity: 0.65, desc: 'Major festival at Kanaka Durga temple.' },
  { id: 'karthika_masam_vjw', sector: 'vijayawada', name: 'Karthika Masam', date: '2026-11-01', endDate: '2026-11-30', crowd: 'MODERATE', intensity: 0.55, desc: 'Holy month of Karthika. Daily evening visits spike.' },

  // SRISAILAM (Sector 03)
  { id: 'mahashivratri_2026', sector: 'srisailam', name: 'Mahashivratri', date: '2026-02-26', crowd: 'CRITICAL', intensity: 0.97, desc: 'Biggest Jyotirlinga festival. Forest gates may restrict entry. Advance booking essential.' },
  { id: 'ugadi_srisailam', sector: 'srisailam', name: 'Ugadi', date: '2026-03-30', crowd: 'HIGH', intensity: 0.68, desc: 'New Year pilgrimages to Srisailam surge.' },
  { id: 'karthika_deepotsavam', sector: 'srisailam', name: 'Karthika Deepotsavam', date: '2026-11-15', crowd: 'HIGH', intensity: 0.72, desc: 'Lamp festival at Pathala Ganga ghats. Spectacular visuals.' },

  // SIMHACHALAM (Sector 04)
  { id: 'chandanotsavam_2026', sector: 'simhachalam', name: 'Chandanotsavam', date: '2026-05-08', crowd: 'CRITICAL', intensity: 0.92, desc: 'Sandalwood festival. God\'s idol covered in sandalwood paste. Massive crowd.' },
  { id: 'kalyanotsavam_simha', sector: 'simhachalam', name: 'Kalyanotsavam', date: '2026-04-14', crowd: 'MODERATE', intensity: 0.55, desc: 'Divine wedding ceremony. Moderate crowd.' },
  { id: 'narasimha_jayanti', sector: 'simhachalam', name: 'Narasimha Jayanti', date: '2026-05-20', crowd: 'HIGH', intensity: 0.78, desc: 'Birth anniversary of Lord Narasimha.' },

  // ANNAVARAM (Sector 05)
  { id: 'satyanarayana_pooja_jan', sector: 'annavaram', name: 'Monthly Satyanarayana Pooja', date: '2026-05-17', crowd: 'HIGH', intensity: 0.70, desc: 'Monthly Vratam ceremony. Auspicious full moon day. Large batch participation.' },
  { id: 'karthika_annavaram', sector: 'annavaram', name: 'Karthika Masam Vratam', date: '2026-11-01', endDate: '2026-11-30', crowd: 'HIGH', intensity: 0.75, desc: 'Holy month. Daily Satyanarayan Pooja. Batch sizes double.' },
  { id: 'ugadi_annavaram', sector: 'annavaram', name: 'Ugadi Vratam', date: '2026-03-30', crowd: 'HIGH', intensity: 0.65, desc: 'New Year Satyanarayana Vratam batches increase.' },

  // SABARIMALA (Sector 06)
  { id: 'mandalam_2026', sector: 'sabarimala', name: 'Mandalam Season', date: '2026-12-02', endDate: '2027-01-14', crowd: 'CRITICAL', intensity: 1.0, desc: '41-day seasonal pilgrimage. 50-80 lakh pilgrims total. Virtual queue mandatory. Irumudikettu required.' },
  { id: 'makaravilakku_2027', sector: 'sabarimala', name: 'Makaravilakku (Makara Jyothi)', date: '2027-01-14', crowd: 'CRITICAL', intensity: 1.0, desc: 'Most sacred day. Celestial star appears at Sannidhanam. All-time peak footfall. Book months in advance.' },
  { id: 'meenam_pooja', sector: 'sabarimala', name: 'Meenam Seasonal Opening', date: '2026-03-15', endDate: '2026-03-21', crowd: 'MODERATE', intensity: 0.50, desc: '7-day off-season opening. Ideal for peaceful darshan.' },
  { id: 'vishu_sabarimala', sector: 'sabarimala', name: 'Vishu Vilakku', date: '2026-04-14', endDate: '2026-04-16', crowd: 'MODERATE', intensity: 0.55, desc: 'Malayalam New Year. 3-day special opening.' }
];

/**
 * Get all upcoming festivals from today, sorted by date.
 */
export const getUpcomingFestivals = (daysAhead = 180) => {
  const today = new Date();
  const cutoff = new Date();
  cutoff.setDate(today.getDate() + daysAhead);

  return FESTIVALS
    .filter(f => new Date(f.date) >= today && new Date(f.date) <= cutoff)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * Get upcoming festivals for a specific sector.
 */
export const getFestivalsForSector = (sector, daysAhead = 180) => {
  return getUpcomingFestivals(daysAhead).filter(f => f.sector === sector);
};

/**
 * Get the crowd level color class for a given intensity.
 */
export const getCrowdColor = (crowd) => {
  const map = {
    CRITICAL: { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', light: 'bg-red-50' },
    HIGH: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-400', light: 'bg-orange-50' },
    MODERATE: { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-400', light: 'bg-yellow-50' },
    LOW: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-400', light: 'bg-emerald-50' }
  };
  return map[crowd] || map.MODERATE;
};

/**
 * Format festival date nicely.
 */
export const formatFestivalDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/**
 * Get days until a festival.
 */
export const getDaysUntil = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diff;
};
