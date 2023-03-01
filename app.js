import React, {useState, useEffect} from 'react';
import DeckGL from '@deck.gl/react';
import {Map} from 'react-map-gl';
import {TripsLayer} from '@deck.gl/geo-layers';
import {_GeoJSONLoader} from '@loaders.gl/json';
import {createRoot} from 'react-dom/client';

function getTooltip({object}) {
  return object && object.properties.name;
}

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

var thickIndex = -1;

export default function Counter() {
  const [time, setTime] = useState(0);
  const [animation] = useState({});

  const animate = () => {
    setTime(t => (t + 1) % 700);
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
      getColor: d => {
        const rgb = d.properties.color
        return [parseInt(rgb.substring(1,3), 16), parseInt(rgb.substring(3,5), 16), parseInt(rgb.substring(5), 16)]
      },
      getWidth: (d, i) => {
        if(i.index === thickIndex) {
          return 50;
        }
        return 3;
      },
      opacity: 0.6,
      widthMinPixels: 2,
      rounded: true,
      fadeTrail: true,
      trailLength: 400,
      currentTime: time,
      shadowEnabled: false,
      pickable: true,
      updateTriggers: {
        getWidth: thickIndex
      },
      onHover: (line) => {
        thickIndex = line.index;
      },
      onClick: (line) => {
        console.log(line)
      }
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
      getTooltip={getTooltip}
    >
      <Map reuseMaps mapStyle='https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json' preventStyleDiffing={true}/>
    </DeckGL>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(
    <Counter/>
);