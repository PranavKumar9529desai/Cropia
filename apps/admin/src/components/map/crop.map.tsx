import { useRef } from "react";
import Map, { Source, Layer, MapRef, LayerProps } from "react-map-gl/maplibre";
import { GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const createPulsingDot = (map: any, size: number, rgbColor: [number, number, number]) => {
  return {
    width: size,
    height: size,
    data: new Uint8ClampedArray(size * size * 4),
    context: null as CanvasRenderingContext2D | null,

    // When the layer is added to the map,
    // get the rendering context for the map canvas.
    onAdd: function () {
      const canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext("2d");
    },

    // Call once before every frame where the icon will be used.
    render: function () {
      const duration = 1500;
      const t = (performance.now() % duration) / duration;

      const radius = (size / 2) * 0.3;
      const outerRadius = (size / 2) * 0.7 * t + radius;
      const context = this.context;

      if (!context) return false;

      // Draw the outer circle.
      context.clearRect(0, 0, this.width, this.height);
      context.beginPath();
      context.arc(
        this.width / 2,
        this.height / 2,
        outerRadius,
        0,
        Math.PI * 2
      );
      context.fillStyle = `rgba(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]}, ${1 - t})`;
      context.fill();

      // Draw the inner circle.
      context.beginPath();
      context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]}, 1)`;
      context.strokeStyle = "white";
      context.lineWidth = 2 + 4 * (1 - t);
      context.fill();
      context.stroke();

      // Update this image's data with data from the canvas.
      this.data = context.getImageData(0, 0, this.width, this.height).data;

      // Continuously repaint the map, resulting
      // in the smooth animation of the dot.
      map.triggerRepaint();

      // Return `true` to let the map know that the image was updated.
      return true;
    },
  };
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

// 3. The Individual Dot (When not clustered) - NOW ANIMATED
const unclusteredPointLayer: LayerProps = {
  id: "unclustered-point",
  type: "symbol",
  filter: ["!", ["has", "point_count"]],
  layout: {
    "icon-image": [
      "match",
      ["get", "status"],
      "healthy",
      "pulsing-dot-healthy",
      "warning",
      "pulsing-dot-warning",
      "critical",
      "pulsing-dot-critical",
      "pulsing-dot-unknown", // Fallback
    ],
    "icon-allow-overlap": true,
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

export default function CropMap({
  data,
  onPointClick,
  defaultView,
}: CropMapProps) {
  const apiKey = (import.meta.env.VITE_ESRI_API_KEYS || "").replace(/["'\s]/g, "");
  // console.log("api key from crop map", apiKey)

  const mapRef = useRef<MapRef>(null);

  const onMapLoad = () => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    if (!map.hasImage("pulsing-dot-healthy")) {
      map.addImage(
        "pulsing-dot-healthy",
        createPulsingDot(map, 100, [34, 197, 94]),
        { pixelRatio: 2 }
      );
    }
    if (!map.hasImage("pulsing-dot-warning")) {
      map.addImage(
        "pulsing-dot-warning",
        createPulsingDot(map, 100, [234, 179, 8]),
        { pixelRatio: 2 }
      );
    }
    if (!map.hasImage("pulsing-dot-critical")) {
      map.addImage(
        "pulsing-dot-critical",
        createPulsingDot(map, 100, [239, 68, 68]),
        { pixelRatio: 2 }
      );
    }
    if (!map.hasImage("pulsing-dot-unknown")) {
      map.addImage(
        "pulsing-dot-unknown",
        createPulsingDot(map, 100, [17, 180, 218]),
        { pixelRatio: 2 }
      );
    }
  };


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
        onLoad={onMapLoad}
        attributionControl={false}
        //  TODO: default should be juridiction center
        initialViewState={
          defaultView || {
            longitude: 74.2433, // Default: Kolhapur (Change to user's location)
            latitude: 16.705,
            zoom: 9,
          }
        }
        // The "Fuel"
        mapStyle={`https://basemaps-api.arcgis.com/arcgis/rest/services/styles/ArcGIS:Imagery?type=style&token=${apiKey}`} interactiveLayerIds={["clusters", "unclustered-point"]}
        onClick={onClick}
      >
        <Source
          id="scans"
          type="geojson"
          data={data}
          cluster={true}
          clusterMaxZoom={14} // Stop clustering when zoomed in close
          clusterRadius={50} // Radius of each cluster in pixels
          clusterProperties={{
            has_critical: ["any", ["==", ["get", "status"], "critical"]],
            has_warning: ["any", ["==", ["get", "status"], "warning"]],
          }}
        >
          <Layer
            id="clusters"
            type="circle"
            filter={["has", "point_count"]}
            paint={{
              "circle-color": [
                "case",
                ["get", "has_critical"],
                "#ef4444", // Red if any point is critical
                ["get", "has_warning"],
                "#eab308", // Yellow if any point is warning (and none critical)
                "#22c55e", // Green if all are healthy
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
            }}
          />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>
      </Map>
    </div>
  );
}
