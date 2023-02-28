import React, {useState, useEffect} from 'react';
import DeckGL from '@deck.gl/react';
import {Map} from 'react-map-gl';
import {TripsLayer} from '@deck.gl/geo-layers';
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
    times.push(i);
  }
  if(times.length == 0) {
    times.push(500)
    times.push(1200)
  }
  return times
}

export default function Counter() {
  const [time, setTime] = useState(0);
  const [animation] = useState({});

  const animate = () => {
    setTime(t => (t + 1) % 1000);
    animation.id = window.requestAnimationFrame(animate);
  };

  useEffect(() => {
    animation.id = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animation.id);
  }, [animation]);

  const layer = [
    new TripsLayer({
      id: 'trips-layer',
      data: './geojson-route.geojson',
      loaders: [_GeoJSONLoader],
      getPath: d => d.geometry.coordinates,
      getTimestamps: d => setTimestamps(d),
      getColor: [253, 128, 93],
      opacity: 0.3,
      widthMinPixels: 2,
      rounded: true,
      fadeTrail: true,
      trailLength: 300,
      currentTime: time,
      shadowEnabled: false
    })
  ];

  const INITIAL_VIEW_STATE = {
    longitude: -73.463591,
    latitude: 45.533242,
    zoom: 12,
    pitch: 0,
    bearing: 0
  };

  return (
    <DeckGL
      layers={layer}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
    >
      <Map reuseMaps mapStyle='https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json' preventStyleDiffing={true}/>
    </DeckGL>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(
    <Counter/>
);