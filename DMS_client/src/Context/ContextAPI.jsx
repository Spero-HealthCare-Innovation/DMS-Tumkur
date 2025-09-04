import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import * as turf from "@turf/turf";
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const port = import.meta.env.VITE_APP_API_KEY;
  const token = localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh_token");
  // console.log(refresh, "refreshhhhhhhhh");

  const [newToken, setNewToken] = useState("");
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  //selected disaster id
  const [selectedDisasterId, setSelectedDisasterId] = useState(null);
  const [selectedDisasterName, setSelectedDisasterName] = useState(""); // <-- add this

  // console.log(districts, "districts");
  // const HERE_API_KEY = 'FscCo6SQsrummInzClxlkdETkvx5T1r8VVI25XMGnyY'
  console.log(districts, "districts");

  const HERE_API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;
  // const HERE_API_KEY = 'FscCo6SQsrummInzClxlkdETkvx5T1r8VVI25XMGnyY'
  const [Tehsils, setTehsils] = useState([]);
  const [Citys, setCitys] = useState([]);
  const [Wards, setWards] = useState([]);

  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedTehsilId, setSelectedTehsilId] = useState("");
  const [selectedCityID, setSelectedCityId] = useState("");
  const [selectedWardId, setSelectedWardId] = useState("");

  // console.log(Citys, "selectedCityID");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lattitude, setLattitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // console.log(lattitude, longitude, "lattitude, longitude");

  const [departments, setDepartments] = useState([]);
  const [disaterid, setDisaterid] = useState(null);
  const [disasterIdFromSop, setDisasterIdFromSop] = useState(null);
  // console.log(disasterIdFromSop, "disasterIdFromSop");

  const [disasterIncident, setDisasterIncident] = useState(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState([
    18.519566133802865, 73.85534807018765,
  ]); // Default: Pune
  const [popupText, setPopupText] = useState("");
  const [commentText, setCommentText] = useState("");

  // 🔹 sop page
  const [responderScope, setResponderScope] = useState([]);
  const [responderScopeForDispatch, setResponderScopeForDispatch] = useState(
    []
  );
  // console.log(responderScopeForDispatch, "disasterIncident");
  const [enhancedIncidentData, setEnhancedIncidentData] = useState(null);
  const [selectedIncidentFromSop, setSelectedIncidentFromSop] = useState(null);
  console.log(
    selectedIncidentFromSop,
    "selectedIncidentFromSopselectedIncidentFromSop"
  );

  const [isNewEntry, setIsNewEntry] = useState(false);
  // To fetch the ward,tehsil, district from the map
  const [wardName, setWardName] = useState("");
  const [tehsilName, setTehsilName] = useState("");
  const [districtName, setDistrictName] = useState("");

  // const [disasterIdFromSop, setDisasterIdFromSop] = useState(null);
  useEffect(() => {
    const disasterValue = disaterid || disasterIncident || disasterIdFromSop || selectedChiefComplaint;
    console.log(disasterValue, "passingValue");

    if (disasterValue) {
      fetchResponderScope(disasterValue);
    }
  }, [disaterid, disasterIncident, disasterIdFromSop]);

  const refreshAuthToken = async () => {
    const refresh = localStorage.getItem("refresh_token");

    if (!refresh) {
      console.warn("⚠️ No refresh token found.");
      return;
    }

    try {
      const response = await axios.post(`${port}/admin_web/login/refresh/`, {
        refresh: refresh,
      });

      if (response.data?.access) {
        const updatedToken = response.data.access;

        localStorage.setItem("access_token", updatedToken);
        setNewToken(updatedToken);
        console.log("✅ Access token refreshed");
      } else {
        console.warn("⚠️ No access token returned during refresh.");
      }
    } catch (error) {
      console.error("❌ Error refreshing access token:", error);
    }
  };

  useEffect(() => {
    refreshAuthToken();

    const interval = setInterval(() => {
      refreshAuthToken();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // 🔹 1. Fetch all states on load
  const fetchStates = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${port}/admin_web/state_get/`, {
        headers: {
          Authorization: `Bearer ${token || newToken}`,
        },
      });
      setStates(res.data);
    } catch (err) {
      console.error("Error fetching states:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 2. Fetch districts based on selected state
  const fetchDistrictsByState = async (stateId) => {
    const validStateId = stateId || 1;
    try {
      setLoading(true);
      const res = await axios.get(
        `${port}/admin_web/district_get_idwise/${validStateId}/`,
        {
          headers: {
            Authorization: `Bearer ${token || newToken}`,
          },
        }
      );
      console.log(`Districts by state ${validStateId}:`, res.data);
      setDistricts(res.data || []);
    } catch (err) {
      console.error("Error fetching districts:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 3. Fetch tehsils based on selected district
  const fetchTehsilsByDistrict = async (districtId) => {
    if (!districtId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${port}/admin_web/Tahsil_get_idwise/${districtId}/`,
        {
          headers: {
            Authorization: `Bearer ${newToken || token}`,
          },
        }
      );
      console.log(`Tehsils by district ${districtId}:`, res.data);
      setTehsils(res.data || []);
    } catch (err) {
      console.error("Error fetching tehsils:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCitysByTehshil = async (tehshilId) => {
    if (!tehshilId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${port}/admin_web/City_get_idwise/${tehshilId}/`,
        {
          headers: {
            Authorization: `Bearer ${newToken || token}`,
          },
        }
      );
      console.log(`City by tehshil ${tehshilId}:`, res.data);
      setCitys(res.data || []);
    } catch (err) {
      console.error("Error fetching tehsils:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWardsByTehshil = async (tehshilId) => {
    if (!tehshilId) return;
    try {
      setLoading(true);
      const res = await axios.get(`${port}/admin_web/ward_get/${tehshilId}/`, {
        headers: {
          Authorization: `Bearer ${newToken || token}`,
        },
      });
      console.log(`Ward by tehshil ${tehshilId}:`, res.data);
      setWards(res.data || []);
    } catch (err) {
      console.error("Error fetching tehsils:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResponderScope = async (selectedChiefComplaint) => {
    if (!selectedChiefComplaint) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${port}/admin_web/Responder_Scope_Get/${selectedChiefComplaint}`,
        {
          headers: {
            Authorization: `Bearer ${newToken || token}`,
          },
        }
      );
      console.log(res, "resssssss");

      console.log("Responder Scope:", res.data);
      setResponderScope(res.data || []);
      setResponderScopeForDispatch(res.data || []);
    } catch (err) {
      console.error("Error fetching responder scope:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    const response = await axios.get(
      "https://autosuggest.search.hereapi.com/v1/autosuggest",
      {
        params: {
          apiKey: HERE_API_KEY,
          q: value,
          at: `${selectedPosition[0]},${selectedPosition[1]}`,
          limit: 5,
        },
      }
    );
    console.log("🔍 HERE API full response:", response.data);
    setSuggestions(response.data.items.filter((item) => item.position));
  };

  const handleSelectSuggestion = async (item) => {
    if (!item || !item.position || !item.address) return;

    const { position, address } = item;
    setSelectedPosition([position.lat, position.lng]);
    setLattitude(position.lat);
    setLongitude(position.lng);
    setPopupText(address.label);
    setQuery(address.label);
    setSuggestions([]);

    try {
      const geojsonRes = await fetch("/Boundaries/PUNEWARDS.geojson"); // ✅ make sure this path is correct
      const geojson = await geojsonRes.json();

      const point = turf.point([position.lng, position.lat]);

      const matchedFeature = geojson.features.find((feature) =>
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
    } catch (err) {
      console.error("❌ Error checking polygon match:", err);
    }
  };

  // 🔹 Effects
  useEffect(() => {
    fetchStates();
  }, []);

  // 🔹 useEffect for selectedStateId change
  useEffect(() => {
    if (selectedStateId) {
      // fetchDistrictsByState(selectedStateId);
      const defaultId = selectedStateId || 1;
      fetchDistrictsByState(defaultId);

      if (!selectedStateId) {
        setSelectedStateId(1);
      }

      setSelectedDistrictId("");
      setSelectedTehsilId("");
      setSelectedCityId("");
      setSelectedWardId("");
      setTehsils([]);
      setCitys([]);
      setWards([]);
    } else {
      setDistricts([]);
      setTehsils([]);
      setCitys([]);
      setWards([]);
      setSelectedDistrictId("");
      setSelectedTehsilId("");
      setSelectedCityId("");
    }
  }, [selectedStateId]);

  // 🔹 useEffect for selectedDistrictId change
  useEffect(() => {
    if (selectedDistrictId) {
      fetchTehsilsByDistrict(selectedDistrictId);
      setSelectedTehsilId("");
      setSelectedCityId("");
      setSelectedWardId("");
      setCitys([]);
      setWards([]);
    } else {
      setTehsils([]);
      setCitys([]);
      setWards([]);
      setSelectedTehsilId("");
      setSelectedCityId("");
    }
  }, [selectedDistrictId]);

  // ✅ useEffect for selectedTehsilId change (fetch cities)
  useEffect(() => {
    if (selectedTehsilId) {
      fetchCitysByTehshil(selectedTehsilId);
      fetchDistrictsByState;
      fetchWardsByTehshil(selectedTehsilId);
      setSelectedCityId("");
    } else {
      setCitys([]);
      setSelectedCityId("");
    }
  }, [selectedTehsilId]);

  // DISASTER GET API

  const [callType, setCallType] = useState([]);
  const [selectedcallType, setselectedcallType] = useState([]);
  useEffect(() => {
    const FetchcallType = async () => {
      const res = await fetch(`${port}/admin_web/call_type/`, {
        headers: {
          Authorization: `Bearer ${token || newToken}`,
        },
      });
      const data = await res.json();
      setCallType(data);
    };
    FetchcallType();
  }, []);


  ///Dashboards api///

  const [vehicleData, setVehicleData] = useState([]);
  const [loading1, setLoading1] = useState(true);
  const [error1, setError1] = useState(null);
  const [callData, setCallData] = useState(null);
  const [loading2, setLoading2] = useState(true);
  const [error2, setError2] = useState(null);
  const [dispatchClosure, setDispatchClosure] = useState(null);
  const [avgTimes, setAvgTimes] = useState(null);
  const [callTypes, setCallTypes] = useState([]);
  const [chiefComplaints, setChiefComplaints] = useState([]);
  const [filter, setFilter] = useState("total"); // default filter

   const fetchVehicles = async () => {
    try {
      setLoading1(true);
      const response = await axios.get(
        `${port}/DMS_mdt/vehical_dashboard/`
      );
      setVehicleData(response.data);
      setError1(null);
    } catch (err) {
      setError1("Failed to fetch vehicle data");
      console.error(err);
    } finally {
      setLoading1(false);
    }
  };

   const fetchCallData = async () => {
    try {
      setLoading1(true);
      const response = await axios.get(
        `${port}/admin_web/call_dashboard/`
      );
      setCallData(response.data);
      setError1(null);
    } catch (err) {
      setError1("Failed to fetch call data");
      console.error(err);
    } finally {
      setLoading1(false);
    }
  };

   useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${port}/admin_web/dispatch_closure/`);
        setDispatchClosure(res.data);
        console.log(dispatchClosure,"hiii");
        
      } catch (error) {
        console.error("Error fetching dispatch_closure:", error);
      }
    };
    fetchData();
  }, []);

  const fetchAvgTimes = async () => {
  try {
    const res = await axios.get(
      `${port}/admin_web/average_dispatch_time/`
    );
    setAvgTimes(res.data);
  } catch (error) {
    console.error("Error fetching average dispatch time:", error);
  }
};

const fetchCallTypes = async () => {
  try {
    const res = await axios.get(
      "http://192.168.1.116:6003/admin_web/call_type_count/"
    );
    setCallTypes(res.data.call_type_counts || []);
  } catch (error) {
    console.error("Error fetching call types:", error);
  }
};


const fetchChiefComplaints = async (callTypeId = 1) => {
  try {
    const res = await axios.get(
      `http://192.168.1.116:6003/admin_web/chief_complaints/${callTypeId}/`
    );
    setChiefComplaints(res.data.chief_complaints || []);
  } catch (error) {
    console.error("Error fetching chief complaints:", error);
  }
};


  useEffect(() => {
    fetchVehicles();
     fetchCallData();
     fetchAvgTimes();
       fetchCallTypes();
       fetchChiefComplaints(1);
      }, []);


  // chief complaint

  const [disaster, setDisaster] = useState([]);
  const [selectedChiefComplaint, setselectedChiefComplaint] = useState(null);
  const [ChiefComplaint, setChiefComplaint] = useState([]);
  useEffect(() => {
    const fetchChiefComplaint = async () => {
      if (!selectedcallType) return;
      // const disaster = await fetch(`${port}/admin_web/DMS_Disaster_Type_Get/`,
      const ChiefComplaint = await fetch(
        `${port}/admin_web/parent_complaint_get_calltypewise/${selectedcallType}/`,

        {
          headers: {
            Authorization: `Bearer ${token || newToken}`,
          },
        }
      );
      const chiefComplaintData = await ChiefComplaint.json();
      setChiefComplaint(chiefComplaintData);
    };
    fetchChiefComplaint();
  }, [selectedcallType]);

  const [subChiefComplaint, setSubChiefComplaint] = useState([]);
  const [selectedSubchiefComplaint, setselectedSubchiefComplaint] = useState(
    []
  );

 // Fetch Sub Chief Complaints when Chief Complaint changes
useEffect(() => {
  const fetchSubChiefComplaint = async () => {
    if (!selectedChiefComplaint) return;

    try {
      const res = await fetch(
        `${port}/admin_web/disaster_type_disaster_parent/${selectedChiefComplaint}/`,
        {
          headers: {
            Authorization: `Bearer ${token || newToken}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch sub chief complaints");
      const data = await res.json();
      setSubChiefComplaint(data); 
    } catch (err) {
      console.error("Error fetching sub chief complaints:", err);
    }
  };

  fetchSubChiefComplaint();
}, [selectedChiefComplaint, port, token, newToken]); // ✅ Correct dependency


  return (
    <AuthContext.Provider
      value={{
        states,
        districts,
        Tehsils,
        Citys,
        Wards,
        subChiefComplaint,
        ChiefComplaint,
        callType,
        selectedSubchiefComplaint,
        departments,
        selectedStateId,
        selectedDistrictId,
        selectedTehsilId,
        selectedcallType,
        selectedChiefComplaint,
        selectedCityID,
        selectedWardId,
        setSelectedStateId,
        setselectedSubchiefComplaint,
        setSubChiefComplaint,
        setSelectedDistrictId,
        setChiefComplaint,
        setselectedChiefComplaint,
        setSelectedTehsilId,
        setSelectedCityId,
        setSelectedWardId,
        setselectedcallType,
        loading,
        error,
        newToken,
        fetchResponderScope,
        disaterid,
        setDisaterid,
        responderScope,
        setResponderScope,
        disasterIncident,
        setDisasterIncident,
        handleSearchChange,
        handleSelectSuggestion,
        disaster,
        setDisaster,
        query,
        suggestions,
        selectedPosition,
        popupText,
        setPopupText,
        setCallType,
        setQuery,
        selectedIncidentFromSop,
        setSelectedIncidentFromSop,
        disasterIdFromSop,
        setDisasterIdFromSop,
        responderScopeForDispatch,
        setResponderScopeForDispatch,
        enhancedIncidentData,
        setEnhancedIncidentData,
        lattitude,
        setLattitude,
        longitude,
        setLongitude,
        commentText,
        setCommentText,
        fetchDistrictsByState,
        fetchTehsilsByDistrict,
        wardName,
        setWardName,
        tehsilName,
        setTehsilName,
        districtName,
        setDistrictName,
        selectedDisasterId,
        setSelectedDisasterId,
        selectedDisasterName,
        setSelectedDisasterName,
        vehicleData,
         loading1,
          error1 ,
          callData,
           filter,
            setFilter,
            loading2,
            error2,
            dispatchClosure,
            avgTimes,
            callTypes,
             chiefComplaints,
  fetchChiefComplaints
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
