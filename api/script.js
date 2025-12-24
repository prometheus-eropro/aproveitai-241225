async function loginParceiro(cnpj, token) {
  const response = await fetch(`/api/consulta?tipo=parceirosLogin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cnpj, token })
  });

  if (!response.ok) {
    alert("CNPJ ou Token inválidos.");
    return;
  }

  const data = await response.json();
  // Redirecionar ou carregar painel com os dados do parceiro
  window.location.href = `/painelcliente.html?id=${data.id}`;
}
