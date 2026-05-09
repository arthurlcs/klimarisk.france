import './Map.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import KommuneLayer from './KommuneLayer';
import Yearcontrol from './YearControl';
import FlyToSelectedKommune from './FlyToSelectedKommune';


function Map() {

  return (
    <MapContainer 
      className="klimamap" 
      center={[64, 10]} 
      zoom={5} 
      maxZoom={9}
      minZoom={4}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        // attribution='&copy; <a href="http://www.kartverket.no/">Kartverket</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        // url="https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png"
        // url="https://cache.kartverket.no/v1/wmts/1.0.0/topograatone/default/webmercator/{z}/{y}/{x}.png"
      />
      <KommuneLayer />

      <Yearcontrol />
      <FlyToSelectedKommune />
    </MapContainer>
  )
}

export default Map