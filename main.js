import "@arcgis/core/assets/esri/themes/light/main.css";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import Expand from "@arcgis/core/widgets/Expand.js";
import LayerList from "@arcgis/core/widgets/LayerList.js";
import "@esri/calcite-components/dist/calcite/calcite.css";
import "@esri/calcite-components/dist/components/calcite-shell.js";
import { setAssetPath } from "@esri/calcite-components/dist/components/index.js";
import { arrowSymbol } from "./lib.js";
import "./style.css";

setAssetPath("https://js.arcgis.com/calcite-components/1.0.7/assets");

/**
 * constants
 */

const referenceScale = 577790.554289;

const temperatureStops = [
  { value: 0, color: "#4575b4" },
  { value: 32, color: "#91bfdb" },
  { value: 55, color: "#e0f3f8" },
  { value: 80, color: "#fee090" },
  { value: 100, color: "#fc8d59" },
  { value: 150, color: "#d73027" }
];

/**
 * renderer
 */

const renderer = {
  type: "simple",
  symbol: arrowSymbol,
  visualVariables: [
    {
      type: "color",
      field: "TEMP",
      stops: temperatureStops
    },
    {
      type: "rotation",
      field: "WIND_DIRECT",
      rotationType: "geographic"
    },
    {
      type: "size",
      field: "WIND_SPEED",
      minDataValue: 5,
      minSize: {
        type: "size",
        valueExpression: "$view.scale",
        stops: [
          { value: referenceScale * 32, size: 16 },
          { value: referenceScale * 64, size: 12 },
          { value: referenceScale * 128, size: 8 },
          { value: referenceScale * 256, size: 4 }
        ]
      },
      maxDataValue: 100,
      maxSize: {
        type: "size",
        valueExpression: "$view.scale",
        stops: [
          { value: referenceScale * 32, size: 40 },
          { value: referenceScale * 64, size: 30 },
          { value: referenceScale * 128, size: 20 },
          { value: referenceScale * 256, size: 10 }
        ]
      }
    }
  ]
};

/**
 * feature layers
 * map
 * map view
 */

const weatherStations = new FeatureLayer({
  layerId: 0,
  portalItem: {
    id: "cb1886ff0a9d4156ba4d2fadd7e8a139"
  },
  renderer
});

const weatherWatchesAndWarnings = new FeatureLayer({
  title: "Watches and Warnings",
  layerId: 6,
  portalItem: {
    id: "a6134ae01aad44c499d12feec782b386"
  },
  visible: false
});

const map = new Map({
  basemap: "streets-navigation-vector",
  layers: [weatherWatchesAndWarnings, weatherStations]
});

const view = new MapView({
  map,
  center: {
    latitude: 39.9,
    longitude: -105
  },
  container: "viewDiv",
  zoom: 9
});

/**
 * layer list widget
 */

const layerList = new LayerList({
  view: view,
  listItemCreatedFunction: (event) => {
    const item = event.item;
    if (item.layer.type != "group") {
      item.panel = {
        content: "legend",
        open: true
      };
    }
  }
});

const expand = new Expand({
  content: layerList,
  expandTooltip: "Layer List",
  view
});

view.ui.add(expand, "top-right");
