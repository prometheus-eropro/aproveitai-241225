document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("beneficiosContainer");

  try {
    const response = await fetch("https://api.airtable.com/v0/AIRTABLE_BASE_ID/beneficios", {
      headers: {
        Authorization: "Bearer AIRTABLE_TOKEN"
      }
    });

    const data = await response.json();
    const registros = data.records;

    registros.forEach((registro) => {
      const campos = registro.fields;

      const card = document.createElement("div");
      card.classList.add("beneficio-card");

      card.innerHTML = `
        <h3>${campos.titulo || "Sem Título"}</h3>
        <p><strong>Descrição:</strong> ${campos.descricao || "-"}</p>
        <p><strong>Parceiro:</strong> ${campos.parceiro || "-"}</p>
        <p><strong>Validade:</strong> ${campos.dataFim || "-"}</p>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao carregar benefícios:", error);
    container.innerHTML = "<p style='color:red;'>Erro ao carregar benefícios.</p>";
  }
});
