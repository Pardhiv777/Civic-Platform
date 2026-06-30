import { useEffect, useRef, useState } from 'react';

const DEFAULT_CENTER = [20.5937, 78.9629]; // India center
const DEFAULT_ZOOM = 5;

const MapPicker = ({ value, onChange }) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default marker icon issue with Vite
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (leafletMapRef.current) return;

      const map = L.map(mapRef.current).setView(
        value?.lat && value?.lng ? [value.lat, value.lng] : DEFAULT_CENTER,
        value?.lat ? 13 : DEFAULT_ZOOM
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;

      // Place initial marker if value exists
      if (value?.lat && value?.lng) {
        markerRef.current = L.marker([value.lat, value.lng], { draggable: true }).addTo(map);
        markerRef.current.on('dragend', (e) => {
          const { lat, lng } = e.target.getLatLng();
          onChange({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
        });
      }

      // Click to place/move marker
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
          markerRef.current.on('dragend', (ev) => {
            const pos = ev.target.getLatLng();
            onChange({ lat: pos.lat, lng: pos.lng, address: `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}` });
          });
        }

        onChange({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
      });
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        import('leaflet').then((L) => {
          const map = leafletMapRef.current;
          if (!map) return;
          map.setView([lat, lng], 15);

          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
            markerRef.current.on('dragend', (e) => {
              const pos = e.target.getLatLng();
              onChange({ lat: pos.lat, lng: pos.lng, address: `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}` });
            });
          }

          onChange({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
          setLocating(false);
        });
      },
      (err) => {
        setLocationError('Could not get your location. Please pin manually on the map.');
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleGeolocate}
          disabled={locating}
        >
          {locating ? '⏳ Locating…' : '📍 Use My Location'}
        </button>
        {value?.lat && (
          <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
            ✅ Location pinned: {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </span>
        )}
        {!value?.lat && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Click on the map to pin location
          </span>
        )}
      </div>

      {locationError && (
        <div className="alert alert-error" style={{ fontSize: '0.8rem' }}>{locationError}</div>
      )}

      <div className="map-container">
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

export default MapPicker;
