const form = document.querySelector("#quoteForm");
const note = document.querySelector("#formNote");
const totalOutput = document.querySelector("#quantityTotal");
const summaryOutput = document.querySelector("#orderSummary");

const sizeFields = ["size_xs", "size_s", "size_m", "size_l", "size_xl", "size_xxl"];

const getValue = (data, key, fallback = "Por definir") => {
  const value = data.get(key)?.toString().trim();
  return value || fallback;
};

const getSizes = (data) =>
  sizeFields.map((key) => {
    const size = key.replace("size_", "").toUpperCase();
    const quantity = Number(data.get(key) || 0);
    return { size, quantity: Number.isFinite(quantity) ? quantity : 0 };
  });

const getTotal = (sizes) => sizes.reduce((total, item) => total + item.quantity, 0);

const formatSizes = (sizes) => {
  const selected = sizes.filter((item) => item.quantity > 0);
  if (!selected.length) return "Sin tallas capturadas";
  return selected.map((item) => `${item.size}: ${item.quantity}`).join(", ");
};

const getExtras = (data) => {
  const extras = data.getAll("extras").map((item) => item.toString());
  return extras.length ? extras.join(", ") : "Sin extras seleccionados";
};

const buildSummary = () => {
  if (!form || !summaryOutput || !totalOutput) return null;

  const data = new FormData(form);
  const sizes = getSizes(data);
  const total = getTotal(sizes);
  const project = getValue(data, "project");
  const team = getValue(data, "team");
  const fabric = getValue(data, "fabric");
  const personalization = getValue(data, "personalization");

  totalOutput.textContent = total.toString();
  summaryOutput.textContent =
    `${team} · ${project} · ${fabric} · ${total} playeras · ${personalization}.`;

  return { data, sizes, total };
};

form?.addEventListener("input", buildSummary);
form?.addEventListener("change", buildSummary);

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  const result = buildSummary();
  if (!result) return;

  const { data, sizes, total } = result;

  if (total < 1) {
    note.textContent = "Agrega al menos una talla para preparar el pedido.";
    return;
  }

  const whatsappText = encodeURIComponent(
    `Hola VELKA, soy ${getValue(data, "name")}.\n\n` +
      `Quiero cotizar un proyecto para ${getValue(data, "team")}.\n\n` +
      `Deporte: ${getValue(data, "sport")}\n` +
      `Tipo de proyecto: ${getValue(data, "project")}\n` +
      `Tela: ${getValue(data, "fabric")}\n` +
      `Extras: ${getExtras(data)}\n` +
      `Personalización: ${getValue(data, "personalization")}\n` +
      `Fecha ideal: ${getValue(data, "date")}\n\n` +
      `Tallas: ${formatSizes(sizes)}\n` +
      `Total estimado: ${total} playeras\n\n` +
      `Notas:\n${getValue(data, "message", "Sin notas adicionales")}`
  );

  note.innerHTML = `Listo. Abre el pedido en <a href="https://wa.me/525500000000?text=${whatsappText}" target="_blank" rel="noreferrer">WhatsApp</a>.`;
});

buildSummary();
