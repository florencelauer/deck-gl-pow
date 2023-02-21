import React from 'react';
import maplibreGl from 'maplibre-gl';
import {MapboxLayer} from '@deck.gl/mapbox';
import {TripsLayer} from '@deck.gl/geo-layers';
import {load} from '@loaders.gl/core';
import {_GeoJSONLoader} from '@loaders.gl/json';
import {createRoot} from 'react-dom/client';

function setTimestamps(data) {
  var sum = 0;
  data.properties.data.segments.forEach((value) => {
    sum += value.travelTimeSeconds;
  });
  
  var times = []
  const interval = sum/data.geometry.coordinates.length;
  for(var i = 0; i < data.geometry.coordinates.length; i+=interval) {
    times.push(i * 10);
  }
  if(times.length == 0) {
    times.push(500)
    times.push(1200)
  }
  return times
}

function createMap(container, data) {  
  const map = new maplibreGl.Map({
    container,
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
    antialias: true,
    center: [-73.494815, 45.523866],
    zoom: 13.5,
    bearing: 20,
    pitch: 0
  });

  map.addControl(new maplibreGl.NavigationControl(), 'top-left');

  map.on('load', () => {
    const layer = new MapboxLayer({
      id: 'trips-layer',
      type: TripsLayer,
      data: data.features,
      getPath: d => d.geometry.coordinates,
      getTimestamps: d => setTimestamps(d),
      getColor: [253, 128, 93],
      opacity: 0.3,
      widthMinPixels: 2,
      rounded: true,
      fadeTrail: true,
      trailLength: 100,
      currentTime: 0,
      shadowEnabled: false
    });
    
    map.addLayer(layer);
    
    var time = 0;
    const animate = () => {
      time = (time + 1) % 1800;
      layer.setProps({
        currentTime: time
      });
      window.requestAnimationFrame(animate);
    };

    animate(time)
  });

  return {
    update: newData => renderLayers(map, newData, time),
    remove: () => {
      map.remove();
    }
  };
}

async function loadAndRender(container) {
  const tripsData = await load(
    './geojson-route.geojson',
    _GeoJSONLoader
  );
  createMap(container, tripsData);
}

export default function Counter() {
  loadAndRender(document.getElementById('app'))

  return <div className='counter'></div>
}

const root = createRoot(document.getElementById("root"));
root.render(
    <Counter/>
);