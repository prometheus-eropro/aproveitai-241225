import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const {
      tabela,
      cartao,
      cpf,
      cnpj,
      token
    } = req.query;

    if (!tabela) {
      return res.status(400).json({ erro: "Tabela não informada" });
    }

    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

    const headers = {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    };

    const baseURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tabela)}`;

    // =========================
    // CLIENTE (cartão APT ou CPF)
    // =========================
    if (tabela === "clientes") {
      if (!cartao && !cpf) {
        return res.status(400).json({ erro: "Informe cartão ou CPF" });
      }

      const filtro = cartao
        ? `({cartao}='${cartao}')`
        : `({cpf}='${cpf}')`;

      const url = `${baseURL}?filterByFormula=${encodeURIComponent(filtro)}`;
      const resp = await fetch(url, { headers });
      const data = await resp.json();

      return res.json(data.records || []);
    }

    // =========================
    // PARCEIRO (CNPJ + TOKEN)
    // =========================
    if (tabela === "parceiros") {
      if (!cnpj || !token) {
        return res.status(400).json({ erro: "CNPJ e token são obrigatórios" });
      }

      const filtro = `AND({cnpj}='${cnpj}',{token}='${token}')`;
      const url = `${baseURL}?filterByFormula=${encodeURIComponent(filtro)}`;
      const resp = await fetch(url, { headers });
      const data = await resp.json();

      return res.json(data.records || []);
    }

    // =========================
    // TABELAS PÚBLICAS
    // =========================
    const resp = await fetch(baseURL, { headers });
    const data = await resp.json();

    return res.json(data.records || []);

  } catch (err) {
    return res.status(500).json({
      erro: "Erro interno",
      detalhe: err.message,
    });
  }
}
