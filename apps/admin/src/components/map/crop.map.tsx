import React, { useRef, useMemo } from "react";
import Map, { Source, Layer, MapRef, LayerProps } from "react-map-gl/maplibre";
import { GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// TODO : Show spread throught joining images
const createPulsingDot = (
  map: any,
  size: number,
  rgbColor: [number, number, number],
) => {
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

      const radius = (size / 2) * 0.5;
      const outerRadius = (size / 2) * 0.8 * t + radius;
      const context = this.context;

      if (!context) return false;

      // Draw the outer circle.
      context.clearRect(0, 0, this.width, this.height);
      context.beginPath();
      context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
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
    "text-font": ["Noto Sans Regular", "Arial Unicode MS Regular"],
    "text-size": 14,
    "text-allow-overlap": true,
    "text-ignore-placement": true,
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
  viewType?: "points" | "heatmap";
  mapStyle?: "satellite" | "streets";
  showConnections?: boolean;
}

import { useIsMobile } from "@repo/ui/hooks/use-mobile";

const CropMap = ({
  data,
  onPointClick,
  defaultView,
  viewType = "points",
  mapStyle = "satellite",
  showConnections = false,
}: CropMapProps) => {
  const isMobile = useIsMobile();
  const apiKey = (import.meta.env.VITE_ESRI_API_KEYS || "").replace(
    /["'\s]/g,
    "",
  );

  const mapRef = useRef<MapRef>(null);

  // Generate connection lines for same disease in proximity
  const connectionData = useMemo(() => {
    if (!showConnections || !data || !data.features) {
      return { type: "FeatureCollection" as const, features: [] };
    }

    const features: any[] = [];
    const points = [...data.features];

    // Group features by disease
    const diseaseGroups: Record<string, any[]> = {};
    points.forEach((p) => {
      const disease = p.properties.disease?.toLowerCase();

      if (
        disease &&
        disease !== "unknown" &&
        disease !== "healthy" &&
        disease !== "no issue"
      ) {
        if (!diseaseGroups[disease]) diseaseGroups[disease] = [];
        diseaseGroups[disease].push(p);
      }
    });

    // For each disease group, sort by date and create sequential lines
    Object.values(diseaseGroups).forEach((group) => {
      // Sort by date ascending
      group.sort(
        (a, b) =>
          new Date(a.properties.date).getTime() -
          new Date(b.properties.date).getTime(),
      );

      for (let i = 0; i < group.length - 1; i++) {
        const p1 = group[i];
        const p2 = group[i + 1];
        const coord1 = p1.geometry.coordinates;
        const coord2 = p2.geometry.coordinates;

        // Distance check (approx 500km threshold as 1 deg ~ 111km)
        const dist = Math.sqrt(
          Math.pow(coord1[0] - coord2[0], 2) +
          Math.pow(coord1[1] - coord2[1], 2),
        );

        if (dist < 5.0) {
          features.push({
            type: "Feature",
            properties: {
              disease: p1.properties.disease,
              status: p1.properties.status,
              timestamp: p2.properties.timestamp, // Use the later point's timestamp
            },
            geometry: {
              type: "LineString",
              coordinates: [coord1, coord2],
            },
          });
        }
      }
    });

    return { type: "FeatureCollection" as const, features };
  }, [data, showConnections]);

  const addPulsingDots = () => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const colors: Record<string, [number, number, number]> = {
      "healthy": [34, 197, 94],
      "warning": [234, 179, 8],
      "critical": [239, 68, 68],
      "unknown": [100, 116, 139]
    };

    Object.entries(colors).forEach(([status, rgb]) => {
      const id = `pulsing-dot-${status}`;
      if (!map.hasImage(id)) {
        map.addImage(id, createPulsingDot(map, 100, rgb), { pixelRatio: 2 });
      }
    });
  };

  const onMapLoad = () => {
    addPulsingDots();
  };

  // Re-add dots if style changes
  const onStyleData = () => {
    addPulsingDots();
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
    <div className={`${isMobile ? 'h-[450px]' : 'h-[600px]'} w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm relative`}>
      <Map
        ref={mapRef}
        onLoad={onMapLoad}
        onStyleData={onStyleData}
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
        mapStyle={
          mapStyle === "streets"
            ? `https://basemaps-api.arcgis.com/arcgis/rest/services/styles/ArcGIS:Streets?type=style&token=${apiKey}`
            : `https://basemaps-api.arcgis.com/arcgis/rest/services/styles/ArcGIS:Imagery?type=style&token=${apiKey}`
        }
        interactiveLayerIds={["clusters", "unclustered-point"]}
        onClick={onClick}
      >
        {/* Sources */}
        <Source id="connections" type="geojson" data={connectionData} />
        <Source
          id="scans"
          type="geojson"
          data={data}
          cluster={true}
          clusterMaxZoom={12} // Uncluster earlier
          clusterRadius={50}
          clusterProperties={{
            has_critical: ["any", ["==", ["get", "status"], "critical"]],
            has_warning: ["any", ["==", ["get", "status"], "warning"]],
          }}
        />

        {/* Layers in strict order: Line -> Heatmap -> Circle -> Symbol/Text */}

        {/* Connections Layer (Line) - Bottom-most custom layer */}
        <Layer
          id="disease-connections"
          type="line"
          source="connections"
          beforeId="scans-heat"
          layout={{
            visibility: showConnections ? "visible" : "none",
          }}
          paint={{
            "line-color": [
              "match",
              ["get", "status"],
              "critical",
              "#ef4444",
              "warning",
              "#eab308",
              "#ef4444", // Fallback
            ],
            "line-width": 5,
            "line-opacity": 1,
            "line-dasharray": [2, 2],
          }}
        />

        {/* Heatmap Layer */}
        <Layer
          id="scans-heat"
          type="heatmap"
          source="scans"
          layout={{
            visibility: viewType === "heatmap" ? "visible" : "none"
          }}
          paint={{
            "heatmap-weight": [
              "interpolate",
              ["linear"],
              ["get", "status_weight"],
              0, 0,
              3, 1
            ],
            "heatmap-intensity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0, 1,
              15, 3
            ],
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0, "rgba(33,102,172,0)",
              0.2, "rgb(103,169,207)",
              0.4, "rgb(209,229,240)",
              0.6, "rgb(253,219,199)",
              0.8, "rgb(239,138,98)",
              1, "rgb(178,24,43)"
            ],
            "heatmap-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0, 2,
              15, 20
            ],
            "heatmap-opacity": 0.8
          }}
        />

        {/* Cluster Circle Layer */}
        <Layer
          id="clusters"
          type="circle"
          source="scans"
          filter={["has", "point_count"]}
          layout={{
            visibility: viewType === "points" ? "visible" : "none"
          }}
          paint={{
            "circle-color": [
              "case",
              ["get", "has_critical"],
              "#ef4444",
              ["get", "has_warning"],
              "#eab308",
              "#22c55e",
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              100,
              30,
              750,
              40,
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff"
          }}
        />

        {/* Cluster Count Layer */}
        <Layer
          {...({
            ...clusterCountLayer,
            source: "scans",
            layout: {
              ...(clusterCountLayer.layout as any),
              "text-size": 12,
              visibility: viewType === "points" ? "visible" : "none"
            }
          } as any)}
        />

        {/* Unclustered Point Layer */}
        <Layer
          {...({
            ...unclusteredPointLayer,
            source: "scans",
            layout: {
              ...(unclusteredPointLayer.layout as any),
              "icon-size": 1.0, // Large enough to be very clear
              visibility: viewType === "points" ? "visible" : "none"
            }
          } as any)}
        />
      </Map>
    </div>
  );
};

export default React.memo(CropMap);
