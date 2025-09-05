import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, LayersControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import customIconUrl from '../../../assets/Rectangle.png';
 
const customIcon = new L.Icon({
  iconUrl: customIconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: null
});
 
// Component to handle flyTo when triggeredData updates
const FlyToLocation = ({ position, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, zoom);
    }
  }, [position, zoom, map]);
  return null;
};
 
const MapView = ({ data }) => {
  const position = [18.51956674674116, 73.85536020335581]; // Default location (Goa)
  const [stateData, setStateData] = useState();
  const [triggeredData, setTriggeredData] = useState(null);
  const [mapZoom, setMapZoom] = useState(11);
  const { BaseLayer, Overlay } = LayersControl;
 
  useEffect(() => {
    setTriggeredData(data);
  }, [data]);
 
  useEffect(() => {
    fetch('/Boundaries/PUNEWARDS.geojson')
      .then(res => res.json())
      .then(data => setStateData(data));
  }, []);
 
  // Determine marker position
  const markerPosition =
    triggeredData?.latitude && triggeredData?.longitude
      ? [triggeredData.latitude, triggeredData.longitude]
      : position;
 
  // Update zoom if triggeredData is available
  useEffect(() => {
    if (triggeredData?.latitude && triggeredData?.longitude) {
      setMapZoom(13); // Zoom in on update
    } else {
      setMapZoom(11); // Default zoom
    }
  }, [triggeredData]);
 
  const geoJsonStyle = {
    weight: 2,
    color: '#BE5103',
    fillOpacity: 0.1,
  };
 
  const popupContent = triggeredData ? (
    <div>
      <strong>Latitude:</strong> {triggeredData.latitude}<br />
      <strong>Longitude:</strong> {triggeredData.longitude}<br />
      <strong>Elevation:</strong> {triggeredData.elevation}<br />
      <strong>Precipitation:</strong> {triggeredData.precipitation}<br />
      <strong>Rain:</strong> {triggeredData.rain}<br />
      <strong>Temperature:</strong> {triggeredData.temperature_2m}<br />
      <strong>Time:</strong> {new Date(triggeredData.alert_datetime).toLocaleString()}<br />
    </div>
  ) : "No data";
 
  return (
    <MapContainer
      center={markerPosition}
      zoom={mapZoom}
      style={{ height: "96vh", width: "100%", marginBottom: "0.6rem" }}
      scrollWheelZoom={true}
    >
      <LayersControl position="topright">
        {/* Base Layer 1: Thunderforest */}
        <BaseLayer checked name="Thunderforest Outdoors">
          <TileLayer
            url="https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=e2c62012ab834665b043fe5b2a6c67a4"
            attribution='&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>'
          />
        </BaseLayer>
 
        {/* Base Layer 2: ESRI Satellite */}
        <BaseLayer name="ESRI Satellite">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics'
          />
 
        </BaseLayer>
        <BaseLayer name="Google Satellite">
          <TileLayer
            url="http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}&s=Ga"
            attribution='&copy; <a href="https://www.google.com/">google</a>'
          />
        </BaseLayer>
 
        <BaseLayer name="Maptiler Satellite">
          <TileLayer
            url="https://api.maptiler.com/maps/hybrid/256/{z}/{x}/{y}.jpg?key=HBBM5qrIqQ5Y0hnH7gln"
            attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
          />
        </BaseLayer>
        {/* Base Layer 3: heremaps Hybrid tile layer
    <BaseLayer name="Maptiler Satellite">
      <TileLayer
  https://2.aerial.maps.ls.hereapi.com/maptile/2.1/maptile/newest/hybrid.day/5/8/13/256/png8
?apiKey={YOUR_API_KEY}
      />
    </BaseLayer>
    */}
        {/* ✅ Overlay: ESRI Labels */}
        <Overlay name="ESRI Labels">
          <TileLayer
            url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; Esri"
            zIndex={1000}
          />
        </Overlay>
 
 
      </LayersControl>
 
      {/* GeoJSON layer (Always visible) */}
      {stateData && <GeoJSON data={stateData} style={geoJsonStyle} />}
 
      {/* Marker (Always visible) */}
      <Marker position={markerPosition} icon={customIcon}>
        <Popup>{popupContent}</Popup>
      </Marker>
 
      {/* Optional fly-to animation */}
      <FlyToLocation position={markerPosition} zoom={mapZoom} />
    </MapContainer>
  );
};
 
export default MapView;