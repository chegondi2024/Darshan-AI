/**
 * SACRED ROUTE ENGINE (OSRM Integration)
 * Fetches high-fidelity road-following paths for pilgrimage navigation.
 */

export const fetchRoadRoute = async (start, end, mode = 'driving') => {
  const profile = mode === 'bike' ? 'cycling' : mode === 'trek' ? 'walking' : 'driving';
  const url = `https://router.project-osrm.org/route/v1/${profile}/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.code !== 'Ok') throw new Error('Route not found');

    const route = data.routes[0];
    const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
    const distance = (route.distance / 1000).toFixed(1); // KM
    const duration = Math.round(route.duration / 60); // Minutes

    const formattedDuration = duration > 60 
      ? `${Math.floor(duration / 60)} hr ${duration % 60} min` 
      : `${duration} min`;

    return {
      coordinates,
      distance,
      duration: formattedDuration,
      steps: route.legs[0].steps,
      summary: route.legs[0].summary
    };
  } catch (error) {
    console.error('OSRM Fetch Error:', error);
    return null;
  }
};
