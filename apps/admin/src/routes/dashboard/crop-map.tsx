import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import CropMap from '../../components/map/crop.map';
import { apiClient } from '../../lib/rpc';

export const Route = createFileRoute('/dashboard/crop-map')({
  component: RouteComponent,
});


// Helper to calculate view state from GeoJSON data
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
    zoom: 9 // Default zoom for now, user can zoom in/out
  };
}

function RouteComponent() {
  const [data, setData] = useState<any>(null); // GeoJSON format
  const [loading, setLoading] = useState(true);
  const [defaultView, setDefaultView] = useState<{ longitude: number; latitude: number; zoom: number } | undefined>(undefined);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiClient.api.admin.map.scans.$get();
        if (res.ok) {
          const json = await res.json();
          setData(json);
          const view = calculateViewState(json);
          if (view) {
            setDefaultView(view);
          }
        }
      } catch (error) {
        console.error("Failed to fetch map data", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Crop Scan Map</h1>

      {/* Map Container */}
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <CropMap
          data={data || { type: "FeatureCollection", features: [] }}
          defaultView={defaultView}
        />
      </div>
    </div>
  );
}
