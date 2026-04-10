export const tirupatiNodes = [
  // CORE TEMPLE & SACRED FLOW (TIRUMALA)
  { id: 'temple', name: 'Srivari Temple', coords: [13.6833, 79.3474], type: 'core', info: 'Main Darshanam Hub', significance: 'The world-renowned abode of Lord Venkateswara.' },
  { id: 'varahaswamy', name: 'Varahaswamy Temple', coords: [13.6840, 79.3470], type: 'core' },
  { id: 'pushkarini', name: 'Swami Pushkarini', coords: [13.6845, 79.3472], type: 'core', info: 'Sacred Water Tank', significance: 'Adjacent to the temple; holy dip site.' },
  { id: 'mahadwaram', name: 'Mahadwaram', coords: [13.6831, 79.3476], type: 'indoor' },
  { id: 'bangaru_vakili', name: 'Bangaru Vakili', coords: [13.6833, 79.3473], type: 'indoor' },
  { id: 'hundi', name: 'Srivari Hundi', coords: [13.6835, 79.3475], type: 'service' },
  { id: 'ladoo', name: 'Ladoo Counter', coords: [13.6835, 79.3470], type: 'service' },
  
  // SEVA & MUNDAN (ALMS & RITUALS)
  { id: 'kalyanakatta', name: 'Main Kalyanakatta', coords: [13.6838, 79.3495], type: 'service', info: 'Official Tonsuring Center', significance: 'Where devotees offer their hair (Mundan).' },
  { id: 'seva_sadan', name: 'Srivari Seva Sadan', coords: [13.6825, 79.3440], type: 'support', info: 'Volunteer Reporting Hub', significance: 'Headquarters for Srivari Sevaks (Volunteers).' },

  // SURROUNDING TEMPLES (GUIDE LAYER)
  { id: 'padmavathi', name: 'Padmavathi Temple', coords: [13.6078, 79.4511], type: 'core' },
  { id: 'kapila_theertham', name: 'Kapila Theertham', coords: [13.6566, 79.4211], type: 'core' },
  { id: 'govindaraja', name: 'Govindaraja Temple', coords: [13.6295, 79.4180], type: 'core' },
  { id: 'srinivasa_mangapuram', name: 'Kalyana Venkateswara', coords: [13.6083, 79.3416], type: 'core' },

  // LOGISTICS & QUEUE
  { id: 'vqc_sustenance_v2', name: 'VQC-2 Refreshments', coords: [13.6852, 79.3482], type: 'service' },
  { id: 'vqc2', name: 'VQC-2 (General)', coords: [13.6850, 79.3480], type: 'queue' },
  { id: 'pac5', name: 'PAC-5 (Venkatadri Nilayam)', coords: [13.6870, 79.3450], type: 'amenity' },

  // HEALTH & SUPPORT
  { id: 'ashwini_hospital', name: 'Ashwini Hospital', coords: [13.6820, 79.3490], type: 'support' },
  { id: 'mayuri_help', name: 'Mayuri Help Desk', coords: [13.6842, 79.3458], type: 'support' }
];

export const mockStats = {
  global: { weather: 'THUNDERSTORMS', temp: '22°C', rainfall: 'Moderate' },
  vishnu: { ssd: 1150, max: 1500, wait: 45, status: 'NOMINAL', occupancy: 0.45 },
  vqc2: { status: 'HIGH', halls_filled: 28, wait_hours: 12, occupancy: 0.95 },
  alipiri: { flow: 'CAUTION', weather: 'WET', occupancy: 0.60, headcount: 2200, stair_progress: 1250 },
  kalyanakatta: { wait: 35, status: 'NOMINAL', occupancy: 0.50 },
  seva_sadan: { status: 'ACTIVE', reporting_time: '08:00 AM' },
  ladoo: { status: 'ACTIVE', queue: 280, wait: 12, occupancy: 0.92 }
};
