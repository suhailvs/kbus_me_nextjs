const CHALO_URL = 'https://chalo.com/app/api/nearbybus/v2/city/PALAKKAD';


// const { data } = await axios.post(
//   'https://chalo.com/app/api/nearbybus/v2/city/PALAKKAD',
//   {
//     metaData: { source: 'web' },
//     requiredFields: {
//       nearbyBuses: {
//         lat: c.lat().toFixed(6),
//         lng: c.lng().toFixed(6),
//         radius: 1000,
//       },
//       cardsInfo: {},
//     },
//   },
//   { headers: { 'Content-Type': 'application/json' } }
// );
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const lat = Number(req.body?.lat);
  const lng = Number(req.body?.lng);
  const radius = Number(req.body?.radius ?? 1000);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(radius)) {
    return res.status(400).json({ error: 'lat, lng and radius must be numbers' });
  }

  try {
    const upstream = await fetch(CHALO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metaData: { source: 'web' },
        requiredFields: {
          nearbyBuses: { lat: lat.toFixed(6), lng: lng.toFixed(6), radius },
          cardsInfo: {},
        },
      }),
    });

    if (!upstream.ok) {
      return res.status(502).json({ error: 'Upstream error' });
    }

    return res.status(200).json(await upstream.json());
  } catch (err) {
    console.error('nearbybus proxy failed:', err);
    return res.status(502).json({ error: 'Upstream unreachable' });
  }
}
