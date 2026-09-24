// Shared city data used by the city pages and map. Public page URLs use
// slug.toLowerCase(), e.g. /wayanad.
export const CITIES = [
  { slug: 'thiruvananthapuram', label: 'Thiruvananthapuram', stand: 'Thampanoor Central bus station', center: { lat: 8.488, lng: 76.952 } },
  { slug: 'kollam', label: 'Kollam', stand: 'Kollam KSRTC bus station', center: { lat: 8.891194, lng: 76.585128 } },
  { slug: 'Pathanamthitta', label: 'Pathanamthitta', stand: 'Pathanamthitta KSRTC bus stand', center: { lat: 9.2646, lng: 76.7871 } },
  { slug: 'kottayam', label: 'Kottayam', stand: 'Nagampadam KSRTC bus stand', center: { lat: 9.594, lng: 76.5222 } },
  { slug: 'alappuzha', label: 'Alappuzha', stand: 'Alappuzha KSRTC bus stand', center: { lat: 9.4909, lng: 76.3257 } },
  { slug: 'idukki', label: 'Idukki', stand: 'Thodupuzha KSRTC bus stand', center: { lat: 9.8952, lng: 76.7202 } },
  { slug: 'ernakulam', label: 'Ernakulam', stand: 'Ernakulam KSRTC bus station', center: { lat: 9.9679, lng: 76.2854 } },
  { slug: 'thrissur', label: 'Thrissur', stand: 'Thrissur KSRTC bus station', center: { lat: 10.51753, lng: 76.210431 } },
  { slug: 'palakkad', label: 'Palakkad', stand: 'Palakkad KSRTC bus terminal', center: { lat: 10.7678, lng: 76.6491 } },
  { slug: 'malappuram', label: 'Malappuram', stand: 'Malappuram KSRTC bus stand', center: { lat: 11.051, lng: 76.0711 } },
  { slug: 'kozhikode', label: 'Kozhikode', stand: 'Mavoor Road KSRTC bus station', center: { lat: 11.2565, lng: 75.79 } },
  { slug: 'wayanad', label: 'Wayanad', stand: 'Kalpetta KSRTC bus stand', center: { lat: 11.6085, lng: 76.0837 } },
  { slug: 'kannur', label: 'Kannur', stand: 'Thavakkara bus terminal', center: { lat: 11.867419, lng: 75.370598 } },
  { slug: 'kasaragod', label: 'Kasaragod', stand: 'Kasaragod KSRTC bus stand', center: { lat: 12.4913, lng: 74.9877 } },
];

// Remember the city so /map opens on it (same shape MapPage reads).
export function saveCity(slug) {
  try {
    localStorage.setItem('selectedCity', JSON.stringify({ slug }));
  } catch {
    // localStorage unavailable — navigation still proceeds
  }
}
