import "@arcgis/core/assets/esri/themes/light/main.css";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import Map from "@arcgis/core/Map.js";
import SceneView from "@arcgis/core/views/SceneView.js";
import Editor from "@arcgis/core/widgets/Editor.js";
import Expand from "@arcgis/core/widgets/Expand.js";
import LayerList from "@arcgis/core/widgets/LayerList.js";
import "@esri/calcite-components/dist/calcite/calcite.css";
import "@esri/calcite-components/dist/components/calcite-button.js";
import "@esri/calcite-components/dist/components/calcite-shell.js";
import { setAssetPath } from "@esri/calcite-components/dist/components/index.js";
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
 * arcade expressions
 */

const temperatureExpression = `Round($feature.TEMP) + '° F';`;

const watchesAndWarningsEventExpression = `
  var features = Intersects(FeatureSetByName($map,"Watches and Warnings"), $feature);
  IIF(Count(features) > 0, First(features).Event, "No current watches or warnings");
`;

const watchesAndWarningsSummaryExpression = `
  var features = Intersects(FeatureSetByName($map,"Watches and Warnings"), $feature);
  IIF(Count(features) > 0, First(features).Summary, "");
`;

const windChillExpression = `Round($feature.WIND_CHILL) + '° F';`;

const windSpeedAndTemperatureExpression = `
  var deg = $feature.WIND_DIRECT;
  var speed = $feature.WIND_speed;
  var temperature = Round($feature.TEMP) + '° F';
  var dir = When( speed == 0, "",
    (deg < 22.5 && deg >= 0) || deg > 337.5, "N",
    deg >= 22.5 && deg < 67.5, "NE",
    deg >= 67.5 && deg < 112.5, "E",
    deg >= 112.5 && deg < 157.5, "SE",
    deg >= 157.5 && deg < 202.5, "S",
    deg >= 202.5 && deg < 247.5, "SW",
    deg >= 247.5 && deg < 292.5, "W",
    deg >= 292.5 && deg < 337.5, "NW", "" );
  return speed + " km/h " + dir + TextFormatting.NewLine + temperature;
`;

/**
 * label classes
 */

const labelClass = {
  labelExpressionInfo: {
    expression: windSpeedAndTemperatureExpression
  },
  labelPlacement: "above-center",
  minScale: referenceScale,
  symbol: {
    type: "label-3d",
    symbolLayers: [
      {
        type: "text",
        material: {
          color: "white"
        },
        font: {
          weight: "bold"
        },
        halo: {
          color: "black",
          size: 2
        },
        size: 24
      }
    ]
  }
};

/**
 * popup template
 */

const popupTemplate = {
  content: `
    <p>
      At {OBS_DATETIME}, the wind direction is blowing from {WIND_DIRECT} degrees with a speed of {WIND_SPEED} km/h.
      The temperature is {expression/temperature}. It currently feels like {expression/windchill}.
    </p>
    <p>
      <strong>Sky Conditions: </strong>{SKY_CONDTN}
    </p>
    <p>
      <strong>Visibility:</strong> {VISIBILITY} m
    </p>
    <p>
      <strong>Watches and Warnings:</strong> {expression/watchesAndWarningsEvent}
    </p>
    <p>
      {expression/watchesAndWarningsSummary}
    </p>
  `,
  expressionInfos: [
    {
      expression: `Upper($feature.STATION_NAME)`,
      name: "popupTitle"
    },
    {
      expression: temperatureExpression,
      name: "temperature"
    },
    {
      expression: watchesAndWarningsEventExpression,
      name: "watchesAndWarningsEvent"
    },
    {
      expression: watchesAndWarningsSummaryExpression,
      name: "watchesAndWarningsSummary"
    },
    {
      expression: windChillExpression,
      name: "windchill"
    }
  ],
  title: `{expression/popupTitle}`
};

/**
 * renderer
 */

const renderer = {
  type: "simple",
  symbol: {
    type: "point-3d",
    callout: {
      type: "line",
      color: "black",
      size: 2
    },
    symbolLayers: [
      {
        type: "object",
        resource: {
          primitive: "cone"
        },
        anchor: "bottom",
        tilt: 90
      }
    ],
    verticalOffset: {
      screenLength: 10,
      maxWorldLength: 5000,
      minWorldLength: 3000
    }
  },
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
          { value: referenceScale * 32, size: 1600 },
          { value: referenceScale * 64, size: 1200 },
          { value: referenceScale * 128, size: 800 },
          { value: referenceScale * 256, size: 400 }
        ]
      },
      maxDataValue: 100,
      maxSize: {
        type: "size",
        valueExpression: "$view.scale",
        stops: [
          { value: referenceScale * 32, size: 4000 },
          { value: referenceScale * 64, size: 3000 },
          { value: referenceScale * 128, size: 2000 },
          { value: referenceScale * 256, size: 1000 }
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
  labelingInfo: [labelClass],
  layerId: 0,
  popupTemplate,
  portalItem: {
    id: "ad89d792895e42fd88a53b5f11915b86"
  },
  renderer
});

const weatherWatchesAndWarnings = new FeatureLayer({
  title: "Watches and Warnings",
  layerId: 6,
  popupEnabled: false,
  portalItem: {
    id: "a6134ae01aad44c499d12feec782b386"
  },
  visible: true
});

const map = new Map({
  basemap: "streets-navigation-vector",
  layers: [weatherWatchesAndWarnings, weatherStations]
});

const view = new SceneView({
  map,
  camera: {
    position: {
      latitude: 39.5,
      longitude: -104.67,
      z: 10000
    },
    tilt: 75
  },
  container: "viewDiv",
  zoom: 9
});

/**
 * wait for the view to load and add widgets to the ui
 */

view.when(() => {
  /**
   * editor widget
   */

  const layerInfos = [
    {
      layer: weatherStations,
      formTemplate: {
        elements: [
          {
            type: "field",
            fieldName: "TEMP"
          },
          {
            type: "field",
            fieldName: "WIND_DIRECT"
          },
          {
            type: "field",
            fieldName: "WIND_SPEED"
          },
          {
            type: "field",
            fieldName: "SKY_CONDTN"
          }
        ]
      }
    }
  ];

  const editor = new Editor({
    layerInfos,
    view
  });

  const editorExpand = new Expand({
    content: editor,
    expandTooltip: "Editor Widget",
    view
  });

  view.ui.add(editorExpand, "top-right");

  /**
   * layer list widget
   */

  const layerList = new LayerList({
    listItemCreatedFunction: (event) => {
      const item = event.item;
      if (item.layer.type != "group") {
        item.panel = {
          content: "legend",
          open: true
        };
      }
    },
    view
  });

  const layerListExpand = new Expand({
    content: layerList,
    expandTooltip: "Layer List",
    view
  });

  view.ui.add(layerListExpand, "top-right");
});
