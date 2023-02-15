import React, {useState, useEffect} from 'react';
import mapboxgl from 'mapbox-gl';
import {MapboxLayer} from '@deck.gl/mapbox';
import {scaleLog} from 'd3-scale';
import {TripsLayer} from '@deck.gl/geo-layers';
import {load} from '@loaders.gl/core';
import {CSVLoader} from '@loaders.gl/csv';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import {_GeoJSONLoader} from '@loaders.gl/json';

// Set your mapbox token here
mapboxgl.accessToken = process.env.MapboxAccessToken; // eslint-disable-line

const colorScale = scaleLog()
  .domain([10, 100, 1000, 10000])
  .range([
    [255, 255, 178],
    [254, 204, 92],
    [253, 141, 60],
    [227, 26, 28]
  ]);

export function renderToDOM(container, data) {
  const map = new mapboxgl.Map({
    container,
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
    antialias: true,
    center: [-73.494815, 45.523866],
    zoom: 13.5,
    bearing: 20,
    pitch: 0
  });

  map.addControl(new mapboxgl.NavigationControl(), 'top-left');

  map.on('load', () => {

    renderLayers(map, data);
  });

  return {
    update: newData => renderLayers(map, newData),
    remove: () => {
      map.remove();
    }
  };
}

function renderLayers(map, data) {
  const ambientLight = new AmbientLight({
    color: [255, 255, 255],
    intensity: 1.0
  });
  
  const pointLight = new PointLight({
    color: [255, 255, 255],
    intensity: 2.0,
    position: [-74.05, 40.7, 8000]
  });

  const lightingEffect = new LightingEffect({ambientLight, pointLight});

  const material = {
    ambient: 0.1,
    diffuse: 0.6,
    shininess: 32,
    specularColor: [60, 64, 70]
  };

  let theme = {
    buildingColor: [74, 80, 87],
    trailColor0: [253, 128, 93],
    trailColor1: [23, 184, 190],
    material,
    effects: [lightingEffect]
  };

  if (!data) {
    return;
  }
  
  const layer = new MapboxLayer({
    id: 'trips-layer',
    type: TripsLayer,
    data: data.features,
    getPath: d => d.geometry.coordinates,
    // deduct start timestamp from each data point to avoid overflow
    getTimestamps: d => {
      var times = []
      for(var i = 50; i < d.geometry.coordinates.length; i++) {
        times.push(i * 10);
      }
      if(times.length == 0) {
        times.push(500)
        times.push(1200)
      }
      return times
    },
    getColor: theme.trailColor0,
    opacity: 0.3,
    widthMinPixels: 2,
    rounded: true,
    fadeTrail: true,
    trailLength: 100,
    currentTime: 1000,
    shadowEnabled: false
  });

  map.addLayer(layer);
}

export async function loadAndRender(container) {
  const tripsData = await load(
    './geojson-route.geojson',
    _GeoJSONLoader
  );
  const mockTripsData = [
    {
      waypoints: [
       {coordinates: [-122.3907988, 37.7664413], timestamp: 1554772579000},
       {coordinates: [-122.3908298,37.7667706], timestamp: 1554772579010},
       {coordinates: [-122.4485672, 37.8040182], timestamp: 1554772580200}
      ]
    }
  ]
  renderToDOM(container, tripsData);
}