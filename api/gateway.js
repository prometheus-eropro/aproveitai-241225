export default async function handler(req, res) {
  const { tabela } = req.query;
  if (!tabela) {
    return res.status(400).json({ erro: "Parâmetro 'tabela' não informado" });
  }

  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;

  const url = `https://api.airtable.com/v0/${baseId}/${tabela}?pageSize=100`;

  try {
    const resposta = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!resposta.ok) {
      throw new Error(`Erro da API do Airtable: ${resposta.status}`);
    }

    const dados = await resposta.json();
    return res.status(200).json(dados);
  } catch (erro) {
    console.error("Erro no gateway:", erro);
    return res.status(500).json({ erro: "Erro ao acessar o Airtable." });
  }
}
