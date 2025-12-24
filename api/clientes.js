export default async function handler(req, res) {
  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID, ALLOWED_ORIGIN } = process.env;
  const allowedOrigin = ALLOWED_ORIGIN || "http://localhost:3000";

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const table = "clientes"; // nome da aba no Airtable (case sensitive)

  // --- Cadastro (POST) ---
  if (req.method === "POST") {
    try {
      const dados = req.body;

      if (!dados || !dados.idPublico) {
        return res.status(400).json({ error: "Dados incompletos" });
      }

      const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(dados.idPublico)}`;

      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${AIRTABLE_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fields: {
              idPublico: dados.idPublico,
              nome: dados.nome || "",
              cpf: dados.cpf || "",
              dataNascimento: dados.dataNascimento || "",
              celular: dados.celular || "",
              grupo: dados.grupo || "",
              cidade: dados.cidade || "",
              ativo: false, // Sempre entra como inativo
              qrURL: qrURL
            },
          }),
        }
      );

      const json = await response.json();

      if (!response.ok) {
        console.error("Erro Airtable:", json);
        return res.status(500).json({ error: "Erro ao salvar no Airtable", detalhes: json });
      }

      return res.status(200).json({ sucesso: true, cliente: json });
    } catch (error) {
      console.error("Erro geral:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }

  // --- Consulta (GET) ---
  if (req.method === "GET") {
    const { idPublico } = req.query;
    try {
      let url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`;
      if (idPublico) {
        url += `?filterByFormula={idPublico}="${idPublico}"`;
      }

      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
      });

      const json = await resp.json();

      const clientes = (json.records || []).map((r) => ({
        id: r.id,
        idPublico: r.fields.idPublico || "",
        nome: r.fields.nome || "",
        cpf: r.fields.cpf || "",
        dataNascimento: r.fields.dataNascimento || "",
        celular: r.fields.celular || "",
        grupo: r.fields.grupo || "",
        cidade: r.fields.cidade || "",
        ativo: r.fields.ativo === true,
        qrURL: r.fields.qrURL || "",
      }));

      return res.status(200).json(clientes);
    } catch (e) {
      console.error("Erro GET:", e);
      return res.status(500).json({ error: "Erro ao buscar no Airtable" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
