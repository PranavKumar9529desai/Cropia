import * as React from "react";
import Map, {
  Marker,
  MapRef,
  NavigationControl,
  GeolocateControl,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin } from "lucide-react";

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
}: LocationPickerProps) {
  const mapRef = React.useRef<MapRef>(null);
  const [viewState, setViewState] = React.useState({
    latitude: latitude || 16.705, // Default to a central point if 0
    longitude: longitude || 74.2433,
    zoom: latitude && longitude ? 15 : 9,
  });

  // Sync viewState when latitude/longitude props change (e.g. from GPS detection)
  React.useEffect(() => {
    if (latitude !== 0 && longitude !== 0) {
      setViewState((prev) => ({
        ...prev,
        latitude,
        longitude,
        zoom: 15,
      }));
      mapRef.current?.flyTo({
        center: [longitude, latitude],
        zoom: 15,
        duration: 2000,
      });
    }
  }, [latitude, longitude]);

  // @ts-ignore
  const onMarkerDragEnd = (event: any) => {
    const { lng, lat } = event.lngLat;
    onLocationChange(lat, lng);
  };

  const onMapClick = (event: any) => {
    const { lng, lat } = event.lngLat;
    onLocationChange(lat, lng);
  };

  return (
    <div className="relative w-full h-[250px] sm:h-[300px] rounded-lg overflow-hidden border border-input shadow-inner bg-muted/20 mt-2">
      <Map
        {...viewState}
        ref={mapRef}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={onMapClick}
        mapStyle={`https://basemaps-api.arcgis.com/arcgis/rest/services/styles/ArcGIS:Imagery?type=style&token=${import.meta.env.VITE_ESRI_API_KEYS.replace(/"/g, '')}`}
        style={{ width: "100%", height: "100%" }}
      >
        <GeolocateControl position="top-right" />
        <NavigationControl position="top-right" />

        {latitude !== 0 && longitude !== 0 && (
          <Marker
            longitude={longitude}
            latitude={latitude}
            draggable
            onDragEnd={onMarkerDragEnd}
            anchor="bottom"
          >
            <div className="text-primary animate-bounce-slow">
              <MapPin className="h-8 w-8 fill-primary/20 stroke-[2.5px]" />
            </div>
          </Marker>
        )}
      </Map>

      <div className="absolute bottom-2 left-2 right-2 flex justify-center pointer-events-none">
        <div className="bg-background/95 backdrop-blur px-3 py-1.5 rounded-full border shadow-lg text-[10px] sm:text-xs font-medium text-foreground/80 pointer-events-auto">
          {latitude === 0
            ? "Detect location or tap map to place pin"
            : "Drag the pin to your exact farm location"}
        </div>
      </div>
    </div>
  );
}
