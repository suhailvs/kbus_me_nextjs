// Shared district data. `slug` must match the keys of DISTRICT_CENTERS in
// components/MapPage.js (case matters: "Pathanamthitta"). Public page URLs use
// slug.toLowerCase(), e.g. /wayanad.
export const DISTRICTS = [
  { slug: 'thiruvananthapuram', label: 'Thiruvananthapuram', stand: 'Thampanoor Central bus station' },
  { slug: 'kollam', label: 'Kollam', stand: 'Kollam KSRTC bus station' },
  { slug: 'Pathanamthitta', label: 'Pathanamthitta', stand: 'Pathanamthitta KSRTC bus stand' },
  { slug: 'kottayam', label: 'Kottayam', stand: 'Nagampadam KSRTC bus stand' },
  { slug: 'alappuzha', label: 'Alappuzha', stand: 'Alappuzha KSRTC bus stand' },
  { slug: 'idukki', label: 'Idukki', stand: 'Thodupuzha KSRTC bus stand' },
  { slug: 'ernakulam', label: 'Ernakulam', stand: 'Ernakulam KSRTC bus station' },
  { slug: 'thrissur', label: 'Thrissur', stand: 'Thrissur KSRTC bus station' },
  { slug: 'palakkad', label: 'Palakkad', stand: 'Palakkad KSRTC bus terminal' },
  { slug: 'malappuram', label: 'Malappuram', stand: 'Malappuram KSRTC bus stand' },
  { slug: 'kozhikode', label: 'Kozhikode', stand: 'Mavoor Road KSRTC bus station' },
  { slug: 'wayanad', label: 'Wayanad', stand: 'Kalpetta KSRTC bus stand' },
  { slug: 'kannur', label: 'Kannur', stand: 'Thavakkara bus terminal' },
  { slug: 'kasaragod', label: 'Kasaragod', stand: 'Kasaragod KSRTC bus stand' },
];

// Remember the district so /map opens on it (same shape MapPage reads).
export function saveDistrict(slug) {
  try {
    localStorage.setItem('selectedDistrict', JSON.stringify({ slug }));
  } catch {
    // localStorage unavailable — navigation still proceeds
  }
}
