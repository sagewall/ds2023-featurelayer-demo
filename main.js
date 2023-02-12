import "@arcgis/core/assets/esri/themes/light/main.css";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import Expand from "@arcgis/core/widgets/Expand.js";
import LayerList from "@arcgis/core/widgets/LayerList.js";
import "@esri/calcite-components/dist/calcite/calcite.css";
import "@esri/calcite-components/dist/components/calcite-shell.js";
import { setAssetPath } from "@esri/calcite-components/dist/components/index.js";
import "./style.css";

setAssetPath("https://js.arcgis.com/calcite-components/1.0.7/assets");

/**
 * feature layers
 * map
 * map view
 */

const weatherStations = new FeatureLayer({
  layerId: 0,
  portalItem: {
    id: "cb1886ff0a9d4156ba4d2fadd7e8a139"
  }
});

const weatherWatchesAndWarnings = new FeatureLayer({
  title: "Watches and Warnings",
  layerId: 6,
  portalItem: {
    id: "a6134ae01aad44c499d12feec782b386"
  }
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
