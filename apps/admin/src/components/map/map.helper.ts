function calculateViewState(data: any) {
  if (!data || !data.features || data.features.length === 0) {
    return null;
  }

  let minLng = 180;
  let maxLng = -180;
  let minLat = 90;
  let maxLat = -90;

  data.features.forEach((feature: any) => {
    const [lng, lat] = feature.geometry.coordinates;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  });

  return {
    longitude: (minLng + maxLng) / 2,
    latitude: (minLat + maxLat) / 2,
    zoom: 9, // Default zoom for now, user can zoom in/out
  };
}

export default calculateViewState;
