export default async function handler(req, res) {
  const { tabela } = req.query;

  if (!tabela) {
    return res.status(400).json({ erro: "Tabela não informada" });
  }

  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;

  const url = `https://api.airtable.com/v0/${baseId}/${tabela}`;

  try {
    const r = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    const data = await r.json();
    return res.status(200).json(data);

  } catch (e) {
    return res.status(500).json({ erro: "Erro ao acessar Airtable" });
  }
}
