import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api';
import { Sheet } from 'react-modal-sheet';
import RouteDetail from './RouteDetail';
import { CITIES } from '../lib/cities';

const GOOGLE_MAPS_API_KEY = "AIzaSyBwFTs8_ByftQEytonOPdVpdV9N0uyi3h4"; // process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const CITY_CENTERS = Object.fromEntries(CITIES.map(({ slug, center }) => [slug, center]));

// Only call this inside effects/handlers (browser only). Reading localStorage
// during render would differ between server and client and break hydration.
function readSelectedCitySlug() {
  try {
    const raw = localStorage.getItem('selectedCity');
    if (!raw) return '';
    const { slug } = JSON.parse(raw);
    return CITY_CENTERS[slug] ? slug : '';
  } catch {
    return ''; // missing/corrupted entry — fall back to the picker
  }
}

const mapContainerStyle = { width: '100%', height: '100%' };

const mapOptions = {
  disableDefaultUI: true,
  gestureHandling: 'greedy',
  styles: [
    { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#a8d4f5' }] },
    { featureType: 'landscape', elementType: 'geometry.fill', stylers: [{ color: '#e8edf0' }] },
    { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#d0d0d0' }] },
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  ],
};

const circleOptions = {
  strokeColor: '#888888',
  strokeOpacity: 0.7,
  strokeWeight: 1.5,
  fillColor: '#aaaaaa',
  fillOpacity: 0.18,
  clickable: false,
};

const MAP_LIBRARIES = [];

export default function MapPage() {
  const mapRef = useRef(null);
  const circleRef = useRef(null);
  const initialCenterRef = useRef(null);
  const [buses, setBuses] = useState([]);
  const [toast, setToast] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState(null);
  // null  = haven't read localStorage yet (first render, matches the server)
  // ''    = read it, nothing saved -> show the city picker
  // slug  = a saved/selected city
  const [selectedCity, setSelectedCity] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [sheetRoute, setSheetRoute] = useState(null); // { routeId, vehicleId } | null

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: MAP_LIBRARIES,
  });

  // Restore the saved city after mount.
  useEffect(() => {
    const slug = readSelectedCitySlug();
    if (slug) initialCenterRef.current = CITY_CENTERS[slug];
    setSelectedCity(slug);
  }, []);

  const handleBusSelect = useCallback((routeId, vehicleId) => {
    setSheetRoute({ routeId, vehicleId });
  }, []);

  const closeSheet = useCallback(() => setSheetRoute(null), []);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
    setIsMapReady(true);
    if (circleRef.current) {
      // onLoad can fire more than once for the same instance in dev
      // (React StrictMode). Reuse the existing circle.
      circleRef.current.setMap(map);
      circleRef.current.setCenter(initialCenterRef.current);
      return;
    }
    circleRef.current = new window.google.maps.Circle({
      ...circleOptions,
      map,
      center: initialCenterRef.current,
      radius: 1000,
    });
  }, []);

  const onUnmount = useCallback(() => {
    if (circleRef.current) circleRef.current.setMap(null);
    mapRef.current = null;
    setIsMapReady(false);
  }, []);

  // Keep the search-radius circle centered as the user pans.
  const onCenterChanged = useCallback(() => {
    if (!mapRef.current) return;
    const c = mapRef.current.getCenter();
    if (!c || !circleRef.current) return;
    circleRef.current.setCenter({ lat: c.lat(), lng: c.lng() });
  }, []);

  const refreshBuses = useCallback(async () => {
    if (!mapRef.current) return;
    const c = mapRef.current.getCenter();
    if (!c) return;

    try {
      const { data } = await axios.post(
        'https://chalo.com/app/api/nearbybus/v2/city/PALAKKAD',
        {
          metaData: { source: 'web' },
          requiredFields: {
            nearbyBuses: {
              lat: c.lat().toFixed(6),
              lng: c.lng().toFixed(6),
              radius: 1000,
            },
            cardsInfo: {},
          },
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const nextBuses = data.buses ?? [];
      setBuses(nextBuses);
      if (nextBuses.length === 0) {
        setToast('No buses found nearby');
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error('Failed to refresh buses:', err);
    }
  }, []);

  useEffect(() => {
    if (isMapReady) refreshBuses();
  }, [isMapReady, refreshBuses]);

  // Re-fetch once the user finishes panning, not on every center_changed.
  const onDragEnd = useCallback(() => {
    refreshBuses();
  }, [refreshBuses]);

  const goToCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocateError("Geolocation isn't supported on this device.");
      return;
    }
    setIsLocating(true);
    setLocateError(null);
    const onSuccess = (pos) => {
      const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      if (mapRef.current) mapRef.current.panTo(next);
      if (circleRef.current) circleRef.current.setCenter(next);
      setIsLocating(false);
      refreshBuses();
    };

    const onFinalError = (err) => {
      console.error('Geolocation error:', err.code, err.message);
      const messages = {
        1: 'Location permission denied. Allow it in your browser/site settings.',
        2: "Your location isn't available right now.",
        3: 'Getting your location timed out. Try again.',
      };
      setLocateError(messages[err.code] ?? "Couldn't get your location.");
      setIsLocating(false);
    };

    // Fast attempt: network/cached location.
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      (err) => {
        // Retrying can't fix a denied permission, so fail immediately.
        if (err.code === err.PERMISSION_DENIED) {
          onFinalError(err);
          return;
        }
        // Slow fallback: GPS, longer timeout.
        navigator.geolocation.getCurrentPosition(onSuccess, onFinalError, {
          enableHighAccuracy: true,
          timeout: 30000,
        });
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  }, [refreshBuses]);

  const handleCityChange = useCallback(
    (e) => {
      const slug = e.target.value;
      const center = CITY_CENTERS[slug];
      if (!center) return;

      initialCenterRef.current = center;
      setSelectedCity(slug);
      try {
        localStorage.setItem('selectedCity', JSON.stringify({ slug }));
      } catch {
        // localStorage unavailable — selection still works for this session
      }

      if (mapRef.current) mapRef.current.setCenter(center);
      if (circleRef.current) circleRef.current.setCenter(center);
      refreshBuses();
    },
    [refreshBuses]
  );

  // Still reading localStorage — render the same empty shell as the server.
  if (selectedCity === null) {
    return <div id="map-wrapper" />;
  }

  if (!selectedCity) {
    return (
      <main className="city-picker" aria-labelledby="city-picker-title">
        <div className="city-picker__card">
          <h1 id="city-picker-title">Choose your city</h1>
          <p>Select a city to view nearby buses.</p>
          <label className="visually-hidden" htmlFor="city-picker-select">
            City
          </label>
          <select
            id="city-picker-select"
            className="form-select form-select-lg"
            value=""
            onChange={handleCityChange}
            autoFocus
          >
            <option value="" disabled>
              Select a city
            </option>
            {CITIES.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.label}
              </option>
            ))}
          </select>
        </div>
      </main>
    );
  }

  if (!isLoaded) {
    return <div id="map-wrapper" />;
  }

  return (
    <div id="map-wrapper">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={initialCenterRef.current}
        zoom={14}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onCenterChanged={onCenterChanged}
        onDragEnd={onDragEnd}
      >
        {buses.map((bus) => (
          <OverlayView
            key={bus.session._vehicleId}
            position={{ lat: bus.parameters.lat, lng: bus.parameters.lon }}
            mapPaneName={OverlayView.FLOAT_PANE}
            getPixelPositionOffset={(width) => ({ x: -(width / 2), y: -40 })}
          >
            <div
              className="bus-label"
              onClick={() => handleBusSelect(bus.session._routeId, bus.session._vehicleId)}
            >
              🚌 {bus.session._routeName}
            </div>
          </OverlayView>
        ))}
      </GoogleMap>

      <select
        id="city-select"
        className="form-select form-select-sm shadow w-auto"
        value={selectedCity}
        onChange={handleCityChange}
      >
        <option value="" disabled>
          Select a city
        </option>
        {CITIES.map((d) => (
          <option key={d.slug} value={d.slug}>
            {d.label}
          </option>
        ))}
      </select>

      <button
        id="locate-btn"
        className="btn btn-light shadow"
        title="Go to current location"
        onClick={goToCurrentLocation}
        disabled={isLocating}
      >
        {isLocating ? (
          <span className="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true" />
        ) : (
          <i className="ti ti-current-location" style={{ fontSize: 20, color: '#0d6efd' }} />
        )}
        <span className="visually-hidden">Go to current location</span>
      </button>

      {locateError && (
        <div id="locate-error" className="alert alert-warning py-1 px-2 shadow-sm small mb-0">
          {locateError}
        </div>
      )}

      {toast && (
        <div
          className="position-absolute top-0 start-50 translate-middle-x mt-3 alert alert-dark py-1 px-3 shadow-sm small"
          style={{ zIndex: 10 }}
        >
          {toast}
        </div>
      )}

      <Sheet isOpen={!!sheetRoute} onClose={closeSheet} snapPoints={[0.9, 0.5, 0.15]} initialSnap={1}>
        <Sheet.Container>
          <Sheet.Header />
          <Sheet.Content>
            {sheetRoute && <RouteDetail routeId={sheetRoute.routeId} />}
            <br />
            <br />
            <br />
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onTap={closeSheet} />
      </Sheet>
    </div>
  );
}
