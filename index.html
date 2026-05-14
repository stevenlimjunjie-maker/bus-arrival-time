// Vercel serverless proxy — keeps LTA API call server-side (no CORS issue)
export default async function handler(req, res) {
  const { stop } = req.query;
  if (!stop) {
    return res.status(400).json({ error: 'Missing stop parameter' });
  }

  const LTA_KEY = '979a2997850b7b49da8e6f02e7dabb2f';
  const url = `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${stop}`;

  try {
    const response = await fetch(url, {
      headers: {
        'AccountKey': LTA_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `LTA API error ${response.status}` });
    }

    const data = await response.json();

    // Allow the frontend to call this endpoint
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=15'); // cache 15s on Vercel edge
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
