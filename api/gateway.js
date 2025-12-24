export default async function handler(req, res) {
  const { tabela } = req.query;

  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!tabela) {
    return res.status(400).json({ erro: "Tabela não informada" });
  }

  const url = `https://api.airtable.com/v0/${baseId}/${tabela}`;

  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });

  const data = await r.json();
  res.status(200).json(data);
}
