// Type definitions for leaflet.heat
import * as L from "leaflet";

declare module "leaflet" {
  type HeatLatLngTuple = [number, number, number]; // [lat, lng, intensity]

  interface HeatLayerOptions {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: Record<number, string>;
  }

  interface HeatLayer extends L.Layer {
    setLatLngs(latlngs: HeatLatLngTuple[]): this;
    addLatLng(latlng: HeatLatLngTuple): this;
    setOptions(options: HeatLayerOptions): this;
    redraw(): this;
  }

  function heatLayer(
    latlngs: HeatLatLngTuple[],
    options?: HeatLayerOptions
  ): HeatLayer;
}

declare module "leaflet.heat" {
  // Module augmentation - types are added to "leaflet" module above
}
