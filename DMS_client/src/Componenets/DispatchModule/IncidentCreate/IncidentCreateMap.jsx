import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import customIconUrl from '../../../assets/Rectangle.png';
import { useAuth } from '../../../Context/ContextAPI';
import * as turf from '@turf/turf';
const customIcon = new L.Icon({
  iconUrl: customIconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: null
});

const HERE_API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;

const FlyToLocation = ({ position, zoom }) => {
  const map = useMap();
  const hasDragged = useRef(false);
  const previousPosition = useRef(null);

  useEffect(() => {
    // Skip on first load
    if (!hasDragged.current && previousPosition.current === null) {
      previousPosition.current = position;
      return;
    }

    // Only fly if position has changed
    if (
      position &&
      (!previousPosition.current ||
        position[0] !== previousPosition.current[0] ||
        position[1] !== previousPosition.current[1])
    ) {
      hasDragged.current = true;
      map.flyTo(position, zoom ?? map.getZoom(), { duration: 1.5 });
      previousPosition.current = position;
    }
  }, [position, zoom]);

  return null;
};

const IncidentCreateMap = () => {
  const { query, suggestions, selectedPosition, popupText, handleSearchChange, handleSelectSuggestion, setQuery,
    setWardName, setTehsilName, setDistrictName, } = useAuth();
  const [queryMap, setQueryMap] = useState('');
  const [suggestionsMap, setSuggestionsMap] = useState([]);
  const [selectedPositionMap, setSelectedPositionMap] = useState([18.519566133802865, 73.85534807018765]); // Default: Pune (PMC)
  const [popupTextMap, setPopupTextMap] = useState('You are here!');
  const [stateData, setStateData] = useState();
  const [mapZoom, setMapZoom] = useState(10.5);
  const mapRef = useRef();



  useEffect(() => {
    setQueryMap(query);
    setSuggestionsMap(suggestions);
    setSelectedPositionMap(selectedPosition);
    if (!document.activeElement || document.activeElement.tagName !== 'INPUT') {
      setPopupTextMap(query);
    }
  }, [query, suggestions, selectedPosition]);

  // useEffect(() => {
  //   setQuery(queryMap);  // send value to context
  // }, [queryMap]);

  useEffect(() => {
    fetch('/Boundaries/PUNEWARDS.geojson')
      .then(res => res.json())
      .then(data => {
        setStateData(data);
      });
  }, []);

  const geoJsonStyle = {
    weight: 2,
    color: 'Orange',
    fillOpacity: 0.1,
  };


  // const handleSearchChange = async (e) => {
  //   const value = e.target.value;
  //   setQuery(value);


  //   if (value.length < 3) return;

  //   const response = await axios.get('https://autosuggest.search.hereapi.com/v1/autosuggest', {
  //     params: {
  //       apiKey: HERE_API_KEY,
  //       q: value,
  //       at: `${selectedPosition[0]},${selectedPosition[1]}`,
  //       limit: 5
  //     }
  //   });

  //   setSuggestions(response.data.items.filter(item => item.position));

  // };

  // const handleSelectSuggestion = async (item) => {
  //   const { position, address } = item;
  //   setSelectedPosition([position.lat, position.lng]);
  //   setPopupText(address.label);
  //   setQuery(address.label);
  //   setSuggestions([]);
  // };

  // const handleMapClick = async (e) => {
  //   console.log("I am called")
  //   const { lat, lng } = e.latlng;
  //   const response = await axios.get('https://revgeocode.search.hereapi.com/v1/revgeocode', {
  //     params: {
  //       apiKey: HERE_API_KEY,
  //       at: `${lat},${lng}`,
  //     }
  //   });

  //   const label = response.data.items[0]?.address?.label || 'No address found';
  //   setSelectedPosition([lat, lng]);
  //   setPopupText(label);
  // };
  const checkPolygonMatch = (lat, lng) => {
    if (!stateData) return;

    const point = turf.point([lng, lat]);
    const matchedFeature = stateData.features.find(feature =>
      turf.booleanPointInPolygon(point, feature)
    );

    if (matchedFeature) {
      const { ward_name, tehsil_name, district_name } = matchedFeature.properties;
      setWardName(ward_name || "");
      setTehsilName(tehsil_name || "");
      setDistrictName(district_name || "");
    } else {
      setWardName("");
      setTehsilName("");
      setDistrictName("");
    }
  };



  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Search input & suggestions */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 10,
          zIndex: 1000,
          backgroundColor: "white",
          borderRadius: 5,
          padding: 0,
          width: 300,
          boxShadow: "0px 2px 6px rgba(249, 246, 246, 1)"
        }}
      >
        <input
          type="text"
          placeholder="Search for a place..."
          value={query}
          onChange={handleSearchChange}
          style={{ width: '100%', padding: '8px' }}
        />
        {suggestions.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, background: 'white', color: 'black', fontFamily: 'initial' }}>
            {suggestions.map((item, idx) => (
              <li
                key={idx}
                onClick={() => {
                  handleSelectSuggestion(item);
                  setMapZoom(13);
                }}
                style={{ padding: '5px', cursor: 'pointer', borderBottom: '1px solid #ccc' }}
              >
                {item.address.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={selectedPosition}
        zoom={mapZoom}
        style={{ height: "68vh", width: "100%", borderRadius: 10 }}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
      // onClick={handleMapClick}
      >
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          attribution='&copy; Google Maps'
        />
        {stateData && <GeoJSON data={stateData} style={geoJsonStyle} />}
        <FlyToLocation position={selectedPosition} zoom={mapZoom} />
        <Marker
          position={selectedPosition}
          draggable={true}
          icon={customIcon}
          eventHandlers={{
            dragend: async (e) => {
              const marker = e.target;
              const position = marker.getLatLng();
              setSelectedPositionMap([position.lat, position.lng]);
              setMapZoom(13);

              try {
                // Reverse geocode
                const response = await axios.get(
                  "https://revgeocode.search.hereapi.com/v1/revgeocode",
                  {
                    params: {
                      apiKey: HERE_API_KEY,
                      at: `${position.lat},${position.lng}`,
                    },
                  }
                );

                const label = response.data.items[0]?.address?.label || "No address found";
                setPopupTextMap(label);
                // setQueryMap(label);
                setQuery(label);

    // 👇 GeoJSON + Turf match
    const geojsonRes = await fetch('/Boundaries/PUNEWARDS.geojson');
    const geojson = await geojsonRes.json();
    const point = turf.point([position.lng, position.lat]);

                const matchedFeature = geojson.features.find(feature =>
                  turf.booleanPointInPolygon(point, feature)
                );

                if (matchedFeature) {
                  const { Name1, Teshil, District } = matchedFeature.properties;
                  setWardName(Name1 || "");
                  setTehsilName(Teshil || "");
                  setDistrictName(District || "");
                } else {
                  setWardName("");
                  setTehsilName("");
                  setDistrictName("");
                }
              } catch (error) {
                console.error("Reverse geocoding or geojson lookup failed:", error);
                setPopupTextMap("Failed to fetch address");
              }
            }


          }}
        >
          <Popup>{popupTextMap || "PUNE"}</Popup>

        </Marker>
      </MapContainer>
    </div>
  );

};

export default IncidentCreateMap
