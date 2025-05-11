export default async function handler(req, res) {
  try {
    const apiRes = await fetch('http://203.215.168.43:4050/api/ts4/mapview?company=Shah%20Jee%20Transport', {
      headers: {
        'Authorization': 'Bearer vtslivemapview_sec987'
      }
    });

    const data = await apiRes.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Proxy fetch failed:", err);
    res.status(500).json({ error: "Proxy fetch failed" });
  }
}
