/**
 * SLOT ALERT SERVICE — Real-time Darshan Slot Scanner
 * Simulates checking ticket availability every few seconds.
 */

const SLOT_CONFIG = {
  tirupati: [
    { id: 'sed_300', label: '₹300 Special Entry', checkInterval: 3000, baseAvail: 0.15, booking_url: 'https://ttdsevaonline.com/' },
    { id: 'ssd', label: 'SSD Token', checkInterval: 5000, baseAvail: 0.25, booking_url: 'https://ttdsevaonline.com/' },
  ],
  vijayawada: [
    { id: 'special_vjw', label: 'Priority Darshan', checkInterval: 6000, baseAvail: 0.35, booking_url: 'https://kanakadurgamma.org/' },
  ],
  srisailam: [
    { id: 'athiseeghra', label: 'Athiseeghra Darshan', checkInterval: 5000, baseAvail: 0.30, booking_url: 'https://srisailamdvb.net/' },
  ],
  simhachalam: [
    { id: 'special_simha', label: 'Special Darshan Ticket', checkInterval: 6000, baseAvail: 0.40, booking_url: 'https://simhachalam.in/' },
  ],
  annavaram: [
    { id: 'antaralayam_anna', label: 'Antaralayam Darshan', checkInterval: 5000, baseAvail: 0.45, booking_url: 'https://annavaram.in/' },
  ],
  sabarimala: [
    { id: 'virtual_queue', label: 'Virtual Queue Token', checkInterval: 4000, baseAvail: 0.20, booking_url: 'https://sabarimalaonline.org/' },
    { id: 'special_saba', label: 'Special Entry Pass', checkInterval: 7000, baseAvail: 0.15, booking_url: 'https://sabarimalaonline.org/' },
  ],
};

/**
 * Simulates checking slot availability using a drift function.
 */
const checkSlotAvailability = (config) => {
  const seed = Math.floor(Date.now() / config.checkInterval);
  const noise = Math.sin(seed * 7.3 + config.id.length) * 0.3;
  const isAvailable = (config.baseAvail + noise) > 0.2;
  return {
    ...config,
    available: isAvailable,
    count: isAvailable ? Math.max(1, Math.floor((config.baseAvail + noise) * 50)) : 0,
    checkedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
};

/**
 * Get current slot status for a sector.
 */
export const getSectorSlots = (sector) => {
  const configs = SLOT_CONFIG[sector] || [];
  return configs.map(checkSlotAvailability);
};

/**
 * Start a polling loop and call onAlert when a slot opens.
 * Returns a cleanup function.
 */
export const startSlotWatcher = (sector, onAlert, onUpdate) => {
  const configs = SLOT_CONFIG[sector] || [];
  const intervals = [];
  const lastStatus = {};

  configs.forEach(config => {
    const tick = () => {
      const result = checkSlotAvailability(config);
      onUpdate(result);

      // Fire alert only when state transitions from unavailable → available
      if (result.available && !lastStatus[config.id]) {
        onAlert({
          ...result,
          sector,
          message: `🔔 ${result.label} NOW AVAILABLE! ${result.count} slots open.`,
          timestamp: new Date().toLocaleTimeString()
        });
      }
      lastStatus[config.id] = result.available;
    };

    tick(); // immediate first check
    const id = setInterval(tick, config.checkInterval);
    intervals.push(id);
  });

  return () => intervals.forEach(clearInterval);
};
