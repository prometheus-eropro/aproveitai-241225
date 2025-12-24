export default async function handler(req, res) {
  try {
    const { tabela, cartao, cpf, cnpj, token } = req.query;

    if (!tabela) {
      return res.status(400).json({ erro: "Tabela não informada" });
    }

    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

    if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
      return res.status(500).json({
        erro: "Variáveis de ambiente do Airtable não configuradas",
      });
    }

    const headers = {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    };

    const baseURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
      tabela
    )}`;

    // =========================
    // CLIENTES (cartão ou CPF)
    // =========================
    if (tabela === "clientes") {
      if (!cartao && !cpf) {
        return res
          .status(400)
          .json({ erro: "Informe cartao ou cpf" });
      }

      const formula = cartao
        ? `{cartao}='${cartao}'`
        : `{cpf}='${cpf}'`;

      const url = `${baseURL}?filterByFormula=${encodeURIComponent(formula)}`;
      const resp = await fetch(url, { headers });
      const data = await resp.json();

      return res.status(200).json(data.records || []);
    }

    // =========================
    // PARCEIROS (CNPJ + TOKEN)
    // =========================
    if (tabela === "parceiros") {
      if (!cnpj || !token) {
        return res
          .status(400)
          .json({ erro: "CNPJ e token são obrigatórios" });
      }

      const formula = `AND({cnpj}='${cnpj}',{token}='${token}')`;
      const url = `${baseURL}?filterByFormula=${encodeURIComponent(formula)}`;
      const resp = await fetch(url, { headers });
      const data = await resp.json();

      return res.status(200).json(data.records || []);
    }

    // =========================
    // TABELAS PÚBLICAS
    // beneficios, promocoes, faq, depoimentos
    // =========================
    const resp = await fetch(baseURL, { headers });
    const data = await resp.json();

    return res.status(200).json(data.records || []);
  } catch (error) {
    return res.status(500).json({
      erro: "Erro interno na API",
      detalhe: error.message,
    });
  }
}
