// Fetches bus stop info (including lat/lng) from LTA DataMall
// Usage: /api/stops?code=20019
export default async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Missing code parameter' });

  const LTA_KEY = '10Z76EBAQnufAL3+265xvw==';

  // LTA bus stop search — paginate through until we find the stop
  // Each page returns 500 stops; we search up to 5000 stops (10 pages)
  const MAX_PAGES = 20;
  const PAGE_SIZE = 500;

  try {
    for (let i = 0; i < MAX_PAGES; i++) {
      const url = `https://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip=${i * PAGE_SIZE}`;
      const response = await fetch(url, {
        headers: { 'AccountKey': LTA_KEY, 'Accept': 'application/json' }
      });
      if (!response.ok) return res.status(response.status).json({ error: `LTA API error ${response.status}` });
      const data = await response.json();
      const stops = data.value || [];
      if (stops.length === 0) break;

      const found = stops.find(s => s.BusStopCode === code);
      if (found) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 's-maxage=86400'); // cache 24h — stops don't change often
        return res.status(200).json(found);
      }
    }
    return res.status(404).json({ error: `Stop ${code} not found` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
