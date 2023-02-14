import maplibregl from 'maplibre-gl';
import './app.css';
import {MapboxLayer} from '@deck.gl/mapbox';
import { TripsLayer } from '@deck.gl/geo-layers';
import geojson from './geojson-route.geojson';

var renders = 0;

const DEFAULT_THEME = {
    buildingColor: [74, 80, 87],
    trailColor0: [253, 128, 93],
    trailColor1: [23, 184, 190]
  };

const transitPathsSelectedLayer = new MapboxLayer({
    id: 'trips',
    data: geojson,
    type: TripsLayer,
    getPath: d => {
      console.log(d)
      return d.path
    },
    getTimestamps: d => {
      console.log(d)
      return d.timestamps
    },
    getColor: d => (d.vendor === 0 ? DEFAULT_THEME.trailColor0 : DEFAULT_THEME.trailColor1),
    opacity: 0.3,
    widthMinPixels: 2,
    trailLength: 100,
    currentTime: performance.now(),

    shadowEnabled: false
  });


function App() {
    if(renders) return;
    renders++;

    const map = new maplibregl.Map({
        container: 'maplibre-map',
        style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
        antialias: true,
        center: [-73.508376, 45.521052],
        zoom: 15.5,
        bearing: 20
      });
    
    map.addControl(new maplibregl.NavigationControl(), 'top-left');
    
    map.on('load', () => {
        map.addLayer(transitPathsSelectedLayer);
        map.redraw()
        console.log('onload')
    })

    return <div></div>
}

export default App;
