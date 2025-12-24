import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const data = req.body;

    await base('parceiros').create([
      {
        fields: {
          nome: data.nomeFantasia,
          cnpj: data.cnpj,
          cidade: data.cidade,
          ramo: data.ramo,
          beneficios: data.beneficios,
          whatsapp: data.whatsapp,
          instagram: data.instagram,
          site: data.site,
          email: data.email,
          ativo: false, // novo parceiro entra desativado
          dataCadastro: new Date().toISOString(), // ou: data.dataCadastro se quiser enviar
        },
      },
    ]);

    return res.status(200).json({ message: 'Parceiro cadastrado com sucesso!' });

  } catch (error) {
    console.error("Erro ao cadastrar parceiro no Airtable:", JSON.stringify(error, null, 2));
    return res.status(500).json({ message: 'Erro ao cadastrar parceiro no Airtable' });
  }
}
