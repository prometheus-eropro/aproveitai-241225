// /api/consulta.js

function gerarCodigoAutorizacao() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = 'ERO';
  for (let i = 0; i < 5; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}

export default async function handler(req, res) {
  try {
    const params = { ...req.query, ...req.body };
    let { tipo, cpf, cnpj, token } = params;
    tipo = String(tipo || '').trim();
    cpf = cpf?.trim();
    cnpj = cnpj?.trim();
    token = token?.trim();

    const baseId = process.env.AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_API_KEY;
    const tabelaClientes = process.env.AIRTABLE_CLIENTES || 'Parceiros';
    const tabelaLogs = process.env.AIRTABLE_LOGS || 'log';

    if (!baseId || !apiKey || !tabelaClientes || !tabelaLogs) {
      return res.status(500).json({ erro: 'Variáveis de ambiente ausentes.' });
    }

    if (tipo === 'clientesValidar') {
      const url = `https://api.airtable.com/v0/${baseId}/${tabelaClientes}?filterByFormula={cpf}='${cpf}'`;
      const headers = { Authorization: `Bearer ${apiKey}` };
      const resposta = await fetch(url, { headers });
      const dados = await resposta.json();

      let logFields = {
        dataHora: new Date().toISOString(),
        IdPublico: cpf,
        origemConsulta: 'paineldoparceiro'
      };

      if (dados.records?.length > 0) {
        const cliente = dados.records[0].fields;
        const codigo = gerarCodigoAutorizacao();
        const ativo = cliente.ativo === 1 || cliente.ativo === true;
        const grupo = cliente.grupo || '---';

        Object.assign(logFields, {
          CodigoAutorizacao: codigo,
          nome: cliente.nome,
          NomeCliente: cliente.nome,
          grupo,
          Status: ativo ? 'Ativo' : 'Inativo',
          dataCadastro: cliente.dataCadastro || '',
          diasDesdeValidacao: cliente.dataCadastro
            ? Math.floor((new Date() - new Date(cliente.dataCadastro)) / (1000 * 60 * 60 * 24))
            : undefined,
        });

        await fetch(`https://api.airtable.com/v0/${baseId}/${tabelaLogs}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fields: logFields })
        });

        return res.status(200).json({
          valido: true,
          dados: {
            nome: cliente.nome,
            idPublico: cpf,
            grupo,
            ativo,
            dataCadastro: cliente.dataCadastro,
            codigo
          }
        });
      } else {
        Object.assign(logFields, {
          nome: 'Desconhecido',
          Status: 'NAO_ENCONTRADO',
          Erros: 'Cliente não encontrado'
        });

        await fetch(`https://api.airtable.com/v0/${baseId}/${tabelaLogs}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fields: logFields })
        });

        return res.status(404).json({ valido: false, erro: 'Cliente não encontrado.' });
      }
    }

    else if (tipo === "parceirosLogin") {
      if (!cnpj || !token) {
        return res.status(400).json({ error: "CNPJ e token são obrigatórios" });
      }

      const url = `https://api.airtable.com/v0/${baseId}/${tabelaClientes}?filterByFormula=AND(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE({cnpj}, '.', ''), '-', ''), '/', '')='${cnpj}', TRIM({token})='${token}')`;
;
      const headers = { Authorization: `Bearer ${apiKey}` };
      const resposta = await fetch(url, { headers });
      const dados = await resposta.json();

      if (dados.records?.length > 0) {
        const parceiro = dados.records[0].fields;
        const inativo = parceiro.ativo !== true && parceiro.ativo !== 1;

        if (inativo) {
          return res.status(423).json({ error: "Parceiro inativo" });
        }

        return res.status(200).json({
          nome: parceiro.nome,
          cnpj: parceiro.cnpj,
          whatsapp: parceiro.whatsapp,
          instagram: parceiro.instagram
        });
      } else {
        return res.status(401).json({ error: "CNPJ ou token inválidos" });
      }
    }

    return res.status(400).json({ erro: 'Tipo de operação não reconhecido.' });
  } catch (err) {
    console.error("Erro interno:", err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}
