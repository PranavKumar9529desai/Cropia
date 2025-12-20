import { useRef } from "react";
import Map, { Source, Layer, MapRef, LayerProps } from "react-map-gl/maplibre";
import { GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// --- STYLES FOR CLUSTERS ---
// 1. The Circle (Color & Size based on point count)
const clusterLayer: LayerProps = {
  id: "clusters",
  type: "circle",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": [
      "step",
      ["get", "point_count"],
      "#22c55e", // Green for small clusters (< 20)
      20,
      "#eab308", // Yellow for medium (20-50)
      50,
      "#ef4444", // Red for large clusters (> 50)
    ],
    "circle-radius": [
      "step",
      ["get", "point_count"],
      20, // 20px radius
      100,
      30, // 30px radius
      750,
      40, // 40px radius
    ],
  },
};

// 2. The Number inside the Circle
const clusterCountLayer: LayerProps = {
  id: "cluster-count",
  type: "symbol",
  filter: ["has", "point_count"],
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 12,
  },
};

// 3. The Individual Dot (When not clustered)
const unclusteredPointLayer: LayerProps = {
  id: "unclustered-point",
  type: "circle",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": "#11b4da",
    "circle-radius": 6,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#fff",
  },
};

interface CropMapProps {
  data: any; // This will be your GeoJSON from the API
  onPointClick?: (properties: any) => void;
  defaultView?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
}

export default function CropMap({ data, onPointClick, defaultView }: CropMapProps) {
  const mapRef = useRef<MapRef>(null);

  const onClick = (event: any) => {
    const feature = event.features[0];
    if (!feature) return;

    const clusterId = feature.properties.cluster_id;
    const map = mapRef.current?.getMap();

    // Logic: If clicked on a Cluster -> Zoom In
    if (clusterId && map) {
      const source = map.getSource("scans") as GeoJSONSource;
      source.getClusterExpansionZoom(clusterId).then((zoom) => {
        map.easeTo({
          center: (feature.geometry as any).coordinates,
          zoom: zoom + 1, // Zoom 1 level deeper than the expansion zoom
          duration: 500,
        });
      });
    } else if (onPointClick) {
      // Logic: If clicked on a Single Dot -> Show Info
      onPointClick(feature.properties);
    }
  };

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm relative">
      <Map
        ref={mapRef}
        //  TODO: default should be juridiction center
        initialViewState={
          defaultView || {
            longitude: 74.2433, // Default: Kolhapur (Change to user's location)
            latitude: 16.705,
            zoom: 9,
          }
        }
        // The "Fuel"
        mapStyle={`https://api.maptiler.com/maps/hybrid/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`}
        interactiveLayerIds={["clusters", "unclustered-point"]}
        onClick={onClick}
      >
        <Source
          id="scans"
          type="geojson"
          data={data}
          cluster={true}
          clusterMaxZoom={14} // Stop clustering when zoomed in close
          clusterRadius={50} // Radius of each cluster in pixels
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>
      </Map>
    </div>
  );
}
