import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import CropMap from '../../components/map/crop.map';
import { apiClient } from '../../lib/rpc';

export const Route = createFileRoute('/dashboard/crop-map')({
  component: RouteComponent,
});

function RouteComponent() {
  const [data, setData] = useState<any>(null); // GeoJSON format
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiClient.api.admin.map.scans.$get();
        if (res.ok) {
          const json = await res.json();
          setData(json);
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
        <CropMap data={data || { type: "FeatureCollection", features: [] }} />
      </div>
    </div>
  );
}
