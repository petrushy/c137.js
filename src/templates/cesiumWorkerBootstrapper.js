self.CESIUM_BASE_URL = "/";

self.cesiumWorkers = cesiumWorkers;

onmessage = function(event) {
  if (event.data.CESIUM_BASE_URL) {
    self.CESIUM_BASE_URL = event.data.CESIUM_BASE_URL;
  }
  if (event.data.XYS2006_samples) {
    self.XYS2006_samples = event.data.XYS2006_samples;
  }
  if (event.data.approximateTerrainHeights) {
    self.approximateTerrainHeights = event.data.approximateTerrainHeights;
  }
  if (event.data.location) {
    globalThis.location = event.data.location;
  }
  var data = event.data;

  var dd = data.workerModule.split(/\//g);
  var wModule = dd[dd.length - 1];

  self.onmessage = cesiumWorkers[wModule];
};
