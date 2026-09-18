const $ = id => document.getElementById(id);

const sections = ["dashboard", "prediction", "analytics", "dataset"];

const datasetFields = [
  ["Product ID", "Product identifier used for prediction"],
  ["Date", "Historical observation date"],
  ["Category", "Product category"],
  ["Region", "Sales region"],
  ["Weather Condition", "Weather feature used by the model"],
  ["Seasonality", "Seasonal demand signal"],
  ["Inventory Level", "Current inventory quantity"],
  ["Units Sold", "Observed units sold"],
  ["Units Ordered", "Units ordered for replenishment"],
  ["Demand Forecast", "Forecast / target demand"],
  ["Price", "Product price"]
];

function showSection(name) {
  sections.forEach(id => {
    const el = $(id);
    if (el) el.style.display = id === name ? "" : "none";
  });

  document.querySelectorAll(".dv-nav").forEach(btn => {
    const active = btn.dataset.section === name;
    btn.classList.toggle("active", active);
    btn.style.background = active ? "#14223e" : "transparent";
    btn.style.color = active ? "#67e8f9" : "#c9d3eb";
    btn.style.boxShadow = active ? "inset 3px 0 0 #67e8f9" : "none";
  });
}

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

function updateAnalytics(d) {
  const actual = Number(d.actual_demand);
  const predicted = Number(d.predicted_demand);
  const inventory = Number(d.inventory_level);
  const ordered = Number(d.units_ordered);

  if (![actual, predicted, inventory].every(Number.isFinite)) return;

  setText("analyticsProduct", d.product_id || "Latest prediction");
  setText("chartActual", actual.toFixed(2));
  setText("chartPredicted", predicted.toFixed(2));
  setText("chartInventory", inventory.toFixed(2));
  setText("gapSignal", (predicted - actual).toFixed(2));
  setText("orderedSignal", Number.isFinite(ordered) ? ordered.toFixed(2) : "—");

  const coverage = predicted > 0 ? inventory / predicted : 0;
  setText("coverageSignal", Number.isFinite(coverage) ? coverage.toFixed(2) + "×" : "—");

  const max = Math.max(actual, predicted, inventory, 1);
  const bars = document.querySelectorAll(".dv-bar-wrap");
  const values = {actual, predicted, inventory};

  bars.forEach(wrap => {
    const key = wrap.dataset.key;
    const bar = wrap.querySelector(".dv-bar");
    if (!bar) return;
    bar.style.height = Math.max(8, (values[key] / max) * 78) + "%";
    bar.style.transition = "height .7s ease";
  });
}

async function predict() {
  const productId = $("productId").value.trim();
  $("message").textContent = "";
  $("result").classList.add("hidden");

  if (!productId) {
    $("message").textContent = "Please enter a Product ID.";
    return;
  }

  $("predict").disabled = true;
  $("predict").textContent = "Loading...";

  try {
    const r = await fetch("/api/predict", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({productId})
    });

    const d = await r.json();
    if (!r.ok) throw new Error(d.error || d.detail || "Prediction failed");

    setText("product", d.product_id);
    setText("predicted", Number(d.predicted_demand).toFixed(2));
    setText("actual", Number(d.actual_demand).toFixed(2));
    setText("inventory", Number(d.inventory_level).toFixed(2));
    setText("sold", Number(d.units_sold).toFixed(2));
    setText("ordered", Number(d.units_ordered).toFixed(2));
    setText("price", Number(d.price).toFixed(2));
    setText("recommendation", d.recommendation);

    $("result").classList.remove("hidden");
    updateAnalytics(d);
  } catch (e) {
    $("message").textContent = e.message;
  } finally {
    $("predict").disabled = false;
    $("predict").textContent = "Predict";
  }
}

document.querySelectorAll(".dv-nav").forEach(btn => {
  btn.addEventListener("click", () => showSection(btn.dataset.section));
});

$("launchPrediction").addEventListener("click", () => {
  showSection("prediction");
  $("productId").focus();
});

$("predict").addEventListener("click", predict);

$("productId").addEventListener("keydown", e => {
  if (e.key === "Enter") predict();
});

$("datasetFields").innerHTML = datasetFields.map(([field, purpose]) => `
  <tr>
    <td style="padding:11px 12px;border-bottom:1px solid #1d2943;font-weight:700;">${field}</td>
    <td style="padding:11px 12px;border-bottom:1px solid #1d2943;color:#7785a7;">${purpose}</td>
  </tr>
`).join("");

// Fill the Dashboard cards with the real dataset statistics.
// This does not change the CSS, backend, or AI model.
function setDashboardStat(label, value) {
  const spans = document.querySelectorAll(".metric span");
  spans.forEach(span => {
    if (span.textContent.trim() === label) {
      const card = span.closest(".metric");
      const strong = card ? card.querySelector("strong") : null;
      if (strong) strong.textContent = value;
    }
  });
}

setDashboardStat("Dataset Rows", "73,100");
setDashboardStat("Products", "20");

showSection("dashboard");
