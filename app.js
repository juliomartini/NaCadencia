const state = {
  epic: "",
  startDate: null,
  targetEnd: null,
  demands: [],
  fileName: "",
  pendingFile: null,
  insightsCollapsed: true,
};

const els = {
  appFrame: document.querySelector(".app-frame"),
  menuToggle: document.querySelector("#menuToggle"),
  openLoadModal: document.querySelector("#openLoadModal"),
  closeLoadModal: document.querySelector("#closeLoadModal"),
  loadModal: document.querySelector("#loadModal"),
  epicName: document.querySelector("#epicName"),
  epicStart: document.querySelector("#epicStart"),
  targetEnd: document.querySelector("#targetEnd"),
  createEpic: document.querySelector("#createEpic"),
  formMessage: document.querySelector("#formMessage"),
  csvFile: document.querySelector("#csvFile"),
  uploadZone: document.querySelector("#uploadZone"),
  totalCount: document.querySelector("#totalCount"),
  doneCount: document.querySelector("#doneCount"),
  openCount: document.querySelector("#openCount"),
  devCount: document.querySelector("#devCount"),
  notStartedCount: document.querySelector("#notStartedCount"),
  percentile75: document.querySelector("#percentile75"),
  completionPercent: document.querySelector("#completionPercent"),
  epicContextName: document.querySelector("#epicContextName"),
  epicContextStart: document.querySelector("#epicContextStart"),
  epicContextEnd: document.querySelector("#epicContextEnd"),
  chartTitle: document.querySelector("#chartTitle"),
  chartSubtitle: document.querySelector("#chartSubtitle"),
  chart: document.querySelector("#burnupChart"),
  emptyState: document.querySelector("#emptyState"),
  insightsPanel: document.querySelector(".insights-panel"),
  toggleInsights: document.querySelector("#toggleInsights"),
  trafficLight: document.querySelector("#trafficLight"),
  insightTitle: document.querySelector("#insightTitle"),
  insightSummary: document.querySelector("#insightSummary"),
  plannedMetric: document.querySelector("#plannedMetric"),
  actualMetric: document.querySelector("#actualMetric"),
  gapMetric: document.querySelector("#gapMetric"),
  remainingMetric: document.querySelector("#remainingMetric"),
  actionList: document.querySelector("#actionList"),
  ownerRows: document.querySelector("#ownerRows"),
  ownerDistribution: document.querySelector("#ownerDistribution"),
  demandRows: document.querySelector("#demandRows"),
  fileName: document.querySelector("#fileName"),
  sampleButtons: document.querySelectorAll("[data-sample]"),
};

const createdDays = [
  "2026-04-15",
  "2026-04-16",
  "2026-04-17",
  "2026-04-18",
  "2026-04-19",
  "2026-04-20",
  "2026-04-21",
  "2026-04-22",
  "2026-04-23",
  "2026-04-24",
  "2026-04-25",
  "2026-04-26",
  "2026-04-27",
  "2026-04-28",
  "2026-04-29",
  "2026-04-30",
  "2026-05-01",
];

const doneDays = [
  "2026-04-16",
  "2026-04-17",
  "2026-04-18",
  "2026-04-19",
  "2026-04-20",
  "2026-04-21",
  "2026-04-22",
  "2026-04-23",
  "2026-04-24",
  "2026-04-25",
  "2026-04-26",
  "2026-04-27",
  "2026-04-28",
  "2026-04-29",
  "2026-04-30",
  "2026-05-01",
  "2026-05-02",
];

const doneWipPattern = [0, 1, 2, 3];

function addDays(dateText, amount) {
  const date = parseDate(dateText);
  date.setDate(date.getDate() + amount);
  return date.toISOString().slice(0, 10);
}

function maxDateText(first, second) {
  return parseDate(first) > parseDate(second) ? first : second;
}

function minDateText(first, second) {
  return parseDate(first) < parseDate(second) ? first : second;
}

function formatCsvDate(dateText, time = "") {
  const date = parseDate(dateText);
  const value = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
  return time ? `${value} ${time}` : value;
}

function buildScenarioRows(doneCount, devCount, notStartedCount) {
  const rows = [];
  const people = ["Ana", "Bruno", "Carla", "Diego", "Elisa"];

  for (let index = 0; index < doneCount; index += 1) {
    const done = doneDays[index % doneDays.length];
    const wip = doneWipPattern[index % doneWipPattern.length];
    const dev = addDays(done, -wip);
    rows.push([
      `C4001-${String(index + 1).padStart(3, "0")}`,
      formatCsvDate(maxDateText("2026-04-15", addDays(dev, -1)), "09:00"),
      formatCsvDate(dev),
      formatCsvDate(done, "17:30"),
      "Done",
      "",
      people[index % people.length],
      "-",
    ]);
  }

  for (let index = 0; index < devCount; index += 1) {
    const keyNumber = doneCount + index + 1;
    const created = createdDays[(doneCount + index) % createdDays.length];
    rows.push([
      `C4001-${String(keyNumber).padStart(3, "0")}`,
      formatCsvDate(minDateText(created, "2026-04-30"), "09:00"),
      formatCsvDate("2026-04-30"),
      "",
      "In Progress",
      index < Math.ceil(devCount / 3) ? "Impediment" : "",
      people[(doneCount + index) % people.length],
      "-",
    ]);
  }

  for (let index = 0; index < notStartedCount; index += 1) {
    const keyNumber = doneCount + devCount + index + 1;
    rows.push([
      `C4001-${String(keyNumber).padStart(3, "0")}`,
      formatCsvDate(createdDays[(doneCount + devCount + index) % createdDays.length], "09:00"),
      "",
      "",
      index % 2 === 0 ? "Open" : "Backlog",
      "",
      "Unassigned",
      "-",
    ]);
  }

  return rows;
}

function rowsToCsv(rows) {
  return [
    "Key,Created,Start date,Resolved,Status,Flagged,Assignee,Total",
    ...rows.map((row) => row.join(",")),
  ].join("\n");
}

const sampleScenarios = {
  onTrack: {
    label: "Dentro do prazo",
    fileName: "dentro-do-prazo.csv",
    rows: buildScenarioRows(32, 8, 10),
  },
  attention: {
    label: "Ponto de atenção",
    fileName: "ponto-de-atencao.csv",
    rows: buildScenarioRows(14, 8, 28),
  },
  risk: {
    label: "Em risco",
    fileName: "em-risco.csv",
    rows: buildScenarioRows(10, 5, 35),
  },
};

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ");

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] || "";
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  return semicolonCount > commaCount ? ";" : ",";
}

function parseCsv(text) {
  const delimiter = detectDelimiter(text);
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  if (rows.length < 2) return [];

  const headers = rows[0].map(normalize);
  const indexOf = (...names) => {
    const normalizedNames = names.map(normalize);
    return headers.findIndex((header) => normalizedNames.includes(header));
  };

  const indexes = {
    key: indexOf("key", "chave", "id"),
    created: indexOf("data de criacao", "data criacao", "criacao", "created"),
    dev: indexOf(
      "start date",
      "data em desenvolvimento",
      "data desenvolvimento",
      "em desenvolvimento",
      "data em progresso",
      "data progresso",
      "em progresso",
      "development"
    ),
    done: indexOf("resolved", "data de conclusao", "data conclusao", "conclusao", "done"),
    status: indexOf("status", "situacao", "situação"),
    flagged: indexOf("flagged", "flag", "impedimentos", "impedimento", "blocked", "blocker"),
    owner: indexOf("assignee", "quem esta fazendo", "responsavel", "responsável", "owner"),
  };

  return rows.slice(1).map((cells, position) => ({
    key: cell(cells, indexes.key) || `ITEM-${position + 1}`,
    created: parseDate(cell(cells, indexes.created)),
    dev: parseDate(cell(cells, indexes.dev)),
    done: parseDate(cell(cells, indexes.done)),
    status: normalizeStatus(cell(cells, indexes.status)),
    flagged: cell(cells, indexes.flagged),
    owner: cell(cells, indexes.owner),
  }));
}

function cell(cells, index) {
  return index >= 0 ? String(cells[index] || "").trim() : "";
}

function parseDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

  const isoWithTime = raw.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (isoWithTime) {
    return new Date(
      Number(isoWithTime[1]),
      Number(isoWithTime[2]) - 1,
      Number(isoWithTime[3]),
      Number(isoWithTime[4]),
      Number(isoWithTime[5]),
      Number(isoWithTime[6] || 0)
    );
  }

  const br = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (br) {
    return new Date(
      Number(br[3]),
      Number(br[2]) - 1,
      Number(br[1]),
      Number(br[4] || 0),
      Number(br[5] || 0),
      Number(br[6] || 0)
    );
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(date) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function today() {
  return startOfDay(new Date());
}

function daysBetween(start, end) {
  if (!start || !end) return 0;
  return Math.max(0, Math.round((startOfDay(end) - startOfDay(start)) / 86400000));
}

function signedDaysBetween(start, end) {
  if (!start || !end) return 0;
  return Math.round((startOfDay(end) - startOfDay(start)) / 86400000);
}

function normalizeStatus(value) {
  const status = normalize(value).toUpperCase();
  if (!status) return "";
  return status;
}

function effectiveStatus(item) {
  if (item.status) return item.status;
  if (item.done) return "DONE";
  if (item.dev) return "IN PROGRESS";
  if (item.created) return "OPEN";
  return "INVALID";
}

function isDone(item) {
  return effectiveStatus(item) === "DONE";
}

function isInProgress(item) {
  return effectiveStatus(item) === "IN PROGRESS";
}

function isNotStarted(item) {
  return ["OPEN", "BACKLOG"].includes(effectiveStatus(item));
}

function isRemoved(item) {
  return ["REMOVED", "CANCELED"].includes(effectiveStatus(item));
}

function activeDemands() {
  return state.demands.filter((item) => !isRemoved(item));
}

function getStatus(item) {
  return effectiveStatus(item);
}

function statusClass(status) {
  if (status === "DONE") return "done";
  if (status === "IN PROGRESS") return "dev";
  if (status === "OPEN" || status === "BACKLOG") return "backlog";
  return "issue";
}

function countDemands() {
  const demands = activeDemands();
  const total = demands.length;
  const done = demands.filter(isDone).length;
  const dev = demands.filter(isInProgress).length;
  const notStarted = demands.filter(isNotStarted).length;
  const percentile75 = percentile75Wip();
  return {
    total,
    done,
    dev,
    notStarted,
    open: total - done,
    percentile75,
    completion: total ? Math.round((done / total) * 100) : 0,
  };
}

function flowDays(item) {
  const end = item.done || today();
  return item.created ? daysBetween(item.created, end) : 0;
}

function wipDays(item) {
  if (!item.dev) return null;
  return daysBetween(item.dev, item.done || today());
}

function percentile75Wip() {
  const deliveredWips = activeDemands()
    .filter((item) => isDone(item) && item.done && item.dev)
    .map((item) => wipDays(item))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

  if (!deliveredWips.length) return null;
  const index = Math.ceil(deliveredWips.length * 0.75) - 1;
  return deliveredWips[Math.max(0, index)];
}

function formatDays(value) {
  if (value === null || value === undefined) return "-";
  return `${value}d`;
}

function getBlockedItems() {
  return activeDemands().filter((item) => item.flagged && !isDone(item));
}

function ownerStats() {
  const stats = new Map();
  activeDemands().forEach((item) => {
    const owner = item.owner || "Unassigned";
    const current = stats.get(owner) || { total: 0, done: 0, open: 0, dev: 0, blocked: 0, notStarted: 0 };
    current.total += 1;
    if (isDone(item)) current.done += 1;
    if (!isDone(item)) current.open += 1;
    if (isInProgress(item)) current.dev += 1;
    if (isNotStarted(item)) current.notStarted += 1;
    if (item.flagged && !isDone(item)) current.blocked += 1;
    stats.set(owner, current);
  });
  return [...stats.entries()].sort((a, b) => b[1].total - a[1].total);
}

function averageFlowDays(items) {
  if (!items.length) return 0;
  return Math.round(items.reduce((sum, item) => sum + flowDays(item), 0) / items.length);
}

function updateDashboard() {
  const counts = countDemands();
  const hasEpic = Boolean(state.epic && state.startDate && state.targetEnd);

  els.totalCount.textContent = counts.total;
  els.doneCount.textContent = counts.done;
  els.openCount.textContent = counts.open;
  els.devCount.textContent = counts.dev;
  els.notStartedCount.textContent = counts.notStarted;
  els.percentile75.textContent = formatDays(counts.percentile75);
  els.completionPercent.textContent = `${counts.completion}%`;
  els.epicContextName.textContent = state.epic || "Nenhum épico carregado";
  els.epicContextStart.textContent = formatDate(state.startDate);
  els.epicContextEnd.textContent = formatDate(state.targetEnd);
  els.chartTitle.textContent = "Evolução do burnup";
  els.chartSubtitle.textContent = subtitleText(hasEpic, counts);
  els.fileName.textContent = state.fileName || "Nenhum arquivo selecionado";

  renderInsights();
  renderTable(state.demands);
  renderChart();
}

function subtitleText(hasEpic, counts) {
  if (!hasEpic) return "Carregue um épico ou carregue o exemplo para visualizar o burnup.";
  const period = `${formatDate(state.startDate)} até ${formatDate(state.targetEnd)}`;
  if (!counts.total) return `Linha mestra preparada para ${period}. Carregue o CSV das demandas.`;
  return `Burnup clássico do período ${period}, com escopo acumulado por data de criação e análise ancorada em hoje (${formatDate(today())}).`;
}

function renderTable(demands) {
  const visibleDemands = demands.filter((item) => !isRemoved(item));
  if (!visibleDemands.length) {
    els.demandRows.innerHTML =
      '<tr><td colspan="8" class="muted-cell">As demandas aparecerão aqui.</td></tr>';
    return;
  }

  els.demandRows.innerHTML = visibleDemands
    .map((item) => {
      const status = getStatus(item);
      return `<tr>
        <td>${escapeHtml(item.key)}</td>
        <td>${formatDate(item.created)}</td>
        <td>${formatDate(item.dev)}</td>
        <td>${formatDate(item.done)}</td>
        <td>${formatDays(wipDays(item))}</td>
        <td>${escapeHtml(item.flagged || "-")}</td>
        <td>${escapeHtml(item.owner || "-")}</td>
        <td><span class="tag ${statusClass(status)}">${status}</span></td>
      </tr>`;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getAnalysisPoint(series) {
  if (!series.length) return null;
  const current = today().getTime();
  const start = startOfDay(state.startDate).getTime();
  const end = startOfDay(state.targetEnd).getTime();
  const boundedTime = Math.min(Math.max(current, start), end);
  return series.find((point) => point.date.getTime() === boundedTime) || series[series.length - 1];
}

function renderInsights() {
  const counts = countDemands();
  const hasEpic = Boolean(state.epic && state.startDate && state.targetEnd);
  const series = buildSeries();
  const point = getAnalysisPoint(series);

  els.trafficLight.className = "traffic-light";
  els.insightsPanel.className = "insights-panel";
  applyInsightsCollapsedState();

  if (!hasEpic) {
    els.insightsPanel.classList.add("neutral");
    setInsightContent({
      title: "Semáforo do burnup",
      summary: "Carregue um épico ou carregue o exemplo para gerar a análise.",
      planned: "-",
      actual: "-",
      gap: "-",
      remaining: "-",
      actions: ["Aguardando dados para recomendar próximos passos."],
    });
    return;
  }

  if (!counts.total) {
    els.insightsPanel.classList.add("neutral");
    setInsightContent({
      title: "Épico carregado",
      summary: "A linha mestra está preparada. O próximo passo é carregar o CSV das demandas.",
      planned: "0",
      actual: "0",
      gap: "0",
      remaining: formatRemainingDays(),
      actions: [
        "Carregar o CSV com as demandas do épico.",
        "Confirmar se todas as demandas pertencem ao mesmo recorte de valor.",
      ],
    });
    return;
  }

  const planned = Math.round(point.planned);
  const actual = point.done;
  const gap = actual - planned;
  const completion = counts.total ? counts.done / counts.total : 0;
  const activeFlagged = getBlockedItems().length;
  const tolerance = Math.max(2, Math.ceil(counts.total * 0.1));
  const analysisDate = formatDate(point.date);
  const remaining = formatRemainingDays();
  const diagnosticActions = buildDiagnosticActions(counts);

  if (gap >= tolerance || (gap >= 0 && completion >= 0.5)) {
    els.trafficLight.classList.add("good");
    els.insightsPanel.classList.add("good");
    setInsightContent({
      title: "Verde: fluxo saudável",
      summary: `Hoje (${analysisDate}), o épico está no ritmo ou acima da linha planejada. ${remaining}.`,
      planned,
      actual,
      gap,
      remaining,
      actions: [
        "Manter a cadência atual e proteger o foco do time.",
        "Revisar bloqueios residuais para converter demandas abertas em concluídas.",
        "Usar a próxima daily para confirmar se o escopo permanece estável.",
        ...diagnosticActions,
      ],
    });
    return;
  }

  if (gap >= -tolerance && (completion >= 0.2 || gap >= 0 || activeFlagged > 0)) {
    els.trafficLight.classList.add("warning");
    els.insightsPanel.classList.add("warning");
    setInsightContent({
      title: "Amarelo: atenção na cadência",
      summary: `Hoje (${analysisDate}), há ponto de atenção contra a cadência esperada ou flags abertas. ${remaining}.`,
      planned,
      actual,
      gap,
      remaining,
      actions: [
        "Limitar WIP e priorizar conclusão antes de iniciar novas demandas.",
        "Quebrar demandas grandes para reduzir tempo em progresso.",
        "Fazer uma revisão rápida dos itens flagged com donos e prazo de remoção.",
        ...diagnosticActions,
      ],
    });
    return;
  }

  els.trafficLight.classList.add("critical");
  els.insightsPanel.classList.add("critical");
  setInsightContent({
    title: "Vermelho: risco de prazo",
    summary: `Hoje (${analysisDate}), a entrega acumulada está distante da linha planejada. ${remaining}.`,
    planned,
    actual,
    gap,
    remaining,
    actions: [
      "Replanejar o escopo com o sponsor e proteger o que é essencial para o épico.",
      "Atuar nos bloqueios das demandas em progresso antes de puxar novos itens.",
      "Criar plano de recuperação com metas curtas de conclusão e revisão diária do burnup.",
      ...diagnosticActions,
    ],
  });
}

function buildDiagnosticActions(counts) {
  const blocked = getBlockedItems();
  const demands = activeDemands();
  const inProgress = demands.filter(isInProgress);
  const topFlow = [...demands]
    .filter((item) => !isDone(item))
    .sort((a, b) => flowDays(b) - flowDays(a))
    .slice(0, 3);
  const actions = [];

  if (blocked.length) {
    actions.push(
      `${blocked.length} demanda(s) flagged: ${blocked
        .slice(0, 3)
        .map((item) => `${item.key} (${item.flagged})`)
        .join(", ")}. Definir dono da remoção e prazo ainda hoje.`
    );
  } else {
    actions.push("Não há itens flagged no CSV; confirmar se o time está registrando flags de forma consistente.");
  }

  if (topFlow.length) {
    actions.push(
      `Maiores tempos em fluxo aberto: ${topFlow
        .map((item) => `${item.key} com ${flowDays(item)}d`)
        .join(", ")}. Priorizar destravar ou fatiar esses itens.`
    );
  }

  if (inProgress.length) {
    actions.push(
      `${inProgress.length} demanda(s) em progresso com média de ${averageFlowDays(inProgress)}d no fluxo. Reduzir WIP antes de iniciar novos itens.`
    );
  }

  if (counts.notStarted) {
    actions.push(`${counts.notStarted} demanda(s) ainda sem iniciar. Revisar prioridade e confirmar se todas ainda pertencem ao escopo do épico.`);
  }

  return actions;
}

function formatRemainingDays() {
  const diff = signedDaysBetween(today(), state.targetEnd);
  if (diff > 1) return `Faltam ${diff} dias para a data prevista`;
  if (diff === 1) return "Falta 1 dia para a data prevista";
  if (diff === 0) return "A data prevista é hoje";
  if (diff === -1) return "A data prevista venceu há 1 dia";
  return `A data prevista venceu há ${Math.abs(diff)} dias`;
}

function setInsightContent({ title, summary, planned, actual, gap, remaining, actions }) {
  els.insightTitle.textContent = title;
  els.insightSummary.textContent = summary;
  els.plannedMetric.textContent = `Planejado: ${planned}`;
  els.actualMetric.textContent = `Concluído até hoje: ${actual}`;
  els.gapMetric.textContent = `Gap: ${gap}`;
  els.remainingMetric.textContent = `Prazo: ${remaining}`;
  els.actionList.innerHTML = actions.map((action) => `<li>${escapeHtml(action)}</li>`).join("");
  renderOwnerDistribution();
}

function renderOwnerDistribution() {
  const stats = ownerStats();
  const total = activeDemands().length;

  if (!stats.length || !total) {
    els.ownerDistribution.classList.add("empty");
    els.ownerRows.innerHTML = '<tr><td colspan="6" class="muted-cell">Sem dados de responsáveis.</td></tr>';
    return;
  }

  els.ownerDistribution.classList.remove("empty");
  els.ownerRows.innerHTML = stats
    .map(([owner, stat]) => {
      const share = Math.round((stat.total / total) * 100);
      return `<tr>
        <td>${escapeHtml(owner)}</td>
        <td>${stat.notStarted}</td>
        <td>${stat.dev}</td>
        <td>${stat.blocked}</td>
        <td>${stat.done}</td>
        <td>${share}%</td>
      </tr>`;
    })
    .join("");
}

function buildSeries() {
  if (!state.startDate || !state.targetEnd) return [];

  const min = startOfDay(state.startDate);
  const max = startOfDay(state.targetEnd);
  if (max < min) return [];

  const demands = activeDemands();
  const total = demands.length;
  const totalDays = Math.max(1, daysBetween(min, max));
  const analysisLimit = new Date(Math.min(Math.max(today().getTime(), min.getTime()), max.getTime()));
  const series = [];

  for (let time = min.getTime(); time <= max.getTime(); time += 86400000) {
    const date = new Date(time);
    const elapsedDays = daysBetween(min, date);
    series.push({
      date,
      planned: total ? (elapsedDays / totalDays) * total : 0,
      done: demands.filter(
        (item) => isDone(item) && item.done && startOfDay(item.done) <= date && startOfDay(item.done) <= analysisLimit
      ).length,
      scope: demands.filter((item) => !item.created || startOfDay(item.created) <= date).length,
    });
  }

  return series;
}

function renderChart() {
  const ctx = els.chart.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const rect = els.chart.getBoundingClientRect();
  els.chart.width = Math.max(760, Math.floor(rect.width * ratio));
  els.chart.height = Math.max(360, Math.floor(rect.height * ratio));
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const width = els.chart.width / ratio;
  const height = els.chart.height / ratio;
  ctx.clearRect(0, 0, width, height);

  const series = buildSeries();
  const hasEpic = Boolean(state.epic && state.startDate && state.targetEnd);
  els.emptyState.textContent = hasEpic ? "Carregue o CSV das demandas" : "Sem dados carregados";
  els.emptyState.classList.toggle("hidden", hasEpic || series.length > 0);
  if (!series.length) return;

  const pad = { top: 28, right: 26, bottom: 48, left: 46 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const maxY = Math.max(1, ...series.map((point) => Math.max(point.scope, point.planned, point.done)));

  drawGrid(ctx, width, height, pad, plotH, maxY);
  drawLine(ctx, series, "planned", "#2c6fbb", pad, plotW, plotH, maxY, true);
  drawLine(ctx, series, "done", "#1f7a4f", pad, plotW, plotH, maxY, false);
  drawStepLine(ctx, series, "scope", "#bb7a18", pad, plotW, plotH, maxY);
  drawTodayMarker(ctx, series, pad, plotW, plotH);
  drawDateLabels(ctx, series, width, height, pad, plotW);
}

function drawTodayMarker(ctx, series, pad, plotW, plotH) {
  const current = today().getTime();
  const start = series[0].date.getTime();
  const end = series[series.length - 1].date.getTime();
  if (current < start || current > end) return;
  const point = series.find((item) => item.date.getTime() === current);
  if (!point) return;

  const x = pointX(series, point, pad, plotW);
  ctx.save();
  ctx.strokeStyle = "#20201d";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 5]);
  ctx.beginPath();
  ctx.moveTo(x, pad.top);
  ctx.lineTo(x, pad.top + plotH);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#20201d";
  ctx.font = "12px Inter, system-ui, sans-serif";
  ctx.fillText("Hoje", Math.min(x + 8, pad.left + plotW - 36), pad.top + 16);
  ctx.restore();
}

function drawGrid(ctx, width, height, pad, plotH, maxY) {
  ctx.strokeStyle = "#d9dfd8";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#68736c";
  ctx.font = "12px Inter, system-ui, sans-serif";

  const step = Math.max(1, Math.ceil(maxY / 5));
  for (let i = 0; i <= maxY; i += step) {
    const y = pad.top + plotH - (i / maxY) * plotH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.fillText(String(i), 14, y + 4);
  }

  ctx.fillText("Início", pad.left, height - 18);
  ctx.fillText("Previsão", width - pad.right - 48, height - 18);
}

function drawDateLabels(ctx, series, width, height, pad, plotW) {
  const ticks = pickTicks(series, 5);
  ticks.forEach((point) => {
    const x = pointX(series, point, pad, plotW);
    ctx.fillStyle = "#68736c";
    ctx.fillText(
      new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(point.date),
      Math.min(Math.max(x - 16, pad.left), width - pad.right - 32),
      height - 32
    );
  });
}

function pointX(series, point, pad, plotW) {
  const index = series.indexOf(point);
  return pad.left + (series.length === 1 ? plotW : (index / (series.length - 1)) * plotW);
}

function drawLine(ctx, series, key, color, pad, plotW, plotH, maxY, dashed) {
  ctx.save();
  ctx.beginPath();
  if (dashed) ctx.setLineDash([7, 6]);
  series.forEach((point, index) => {
    const x = pad.left + (series.length === 1 ? plotW : (index / (series.length - 1)) * plotW);
    const y = pad.top + plotH - (point[key] / maxY) * plotH;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = key === "scope" ? 2 : 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.setLineDash([]);

  const last = series[series.length - 1];
  const endX = pad.left + plotW;
  const endY = pad.top + plotH - (last[key] / maxY) * plotH;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(endX, endY, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawStepLine(ctx, series, key, color, pad, plotW, plotH, maxY) {
  ctx.save();
  ctx.beginPath();
  series.forEach((point, index) => {
    const x = pad.left + (series.length === 1 ? plotW : (index / (series.length - 1)) * plotW);
    const y = pad.top + plotH - (point[key] / maxY) * plotH;

    if (index === 0) {
      ctx.moveTo(x, y);
      return;
    }

    const previous = series[index - 1];
    const previousY = pad.top + plotH - (previous[key] / maxY) * plotH;
    ctx.lineTo(x, previousY);
    ctx.lineTo(x, y);
  });

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();

  const last = series[series.length - 1];
  const endX = pad.left + plotW;
  const endY = pad.top + plotH - (last[key] / maxY) * plotH;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(endX, endY, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function pickTicks(series, amount) {
  if (series.length <= amount) return series;
  const step = (series.length - 1) / (amount - 1);
  return Array.from({ length: amount }, (_, index) => series[Math.round(index * step)]);
}

function handleFile(file) {
  if (!file) return;
  state.pendingFile = file;
  setMessage(`CSV selecionado: ${file.name}`, "success");
}

function selectedFile() {
  return state.pendingFile || els.csvFile.files[0];
}

async function loadEpic() {
  const epic = els.epicName.value.trim();
  const startDate = parseDate(els.epicStart.value);
  const targetEnd = parseDate(els.targetEnd.value);
  const file = selectedFile();

  if (!epic || !startDate || !targetEnd) {
    setMessage("Nome do épico, data de início e data prevista de entrega são obrigatórios.", "error");
    return;
  }

  if (targetEnd < startDate) {
    setMessage("A data prevista de entrega precisa ser posterior à data de início.", "error");
    return;
  }

  state.epic = epic;
  state.startDate = startDate;
  state.targetEnd = targetEnd;
  if (file) {
    const text = await file.text();
    state.demands = parseCsv(text);
    state.fileName = file.name;
    state.pendingFile = null;
    setMessage("Épico carregado com CSV.", "success");
  } else {
    state.demands = [];
    state.fileName = "";
    state.pendingFile = null;
    setMessage("Épico carregado. O CSV pode ser carregado quando estiver disponível.", "success");
  }
  updateDashboard();
  closeLoadModal();
}

function setMessage(text, tone) {
  els.formMessage.textContent = text;
  els.formMessage.className = `form-message ${tone}`;
}

function clearMessage() {
  els.formMessage.textContent = "";
  els.formMessage.className = "form-message";
}

function resetDashboard() {
  state.epic = "";
  state.startDate = null;
  state.targetEnd = null;
  state.demands = [];
  state.fileName = "";
  els.epicName.value = "";
  els.epicStart.value = "";
  els.targetEnd.value = "";
  els.csvFile.value = "";
  state.pendingFile = null;
  clearMessage();
  updateDashboard();
}

function loadSampleScenario(scenarioKey) {
  const scenario = sampleScenarios[scenarioKey];
  if (!scenario) return;

  state.epic = "Circular 4001/20";
  state.startDate = parseDate("2026-04-15");
  state.targetEnd = parseDate("2026-06-01");
  state.demands = parseCsv(rowsToCsv(scenario.rows));
  state.fileName = scenario.fileName;
  els.epicName.value = state.epic;
  els.epicStart.value = "2026-04-15";
  els.targetEnd.value = "2026-06-01";
  els.csvFile.value = "";
  state.pendingFile = null;
  setMessage(`Exemplo "${scenario.label}" carregado.`, "success");
  updateDashboard();
  closeLoadModal();
}

function openLoadModal() {
  els.loadModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  els.epicName.focus();
}

function closeLoadModal() {
  els.loadModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function toggleMenu() {
  const collapsed = els.appFrame.classList.toggle("sidebar-collapsed");
  els.menuToggle.setAttribute("aria-expanded", String(!collapsed));
  els.menuToggle.setAttribute("aria-label", collapsed ? "Expandir menu" : "Recolher menu");
  els.menuToggle.textContent = collapsed ? "›" : "‹";
  renderChart();
}

function applyInsightsCollapsedState() {
  els.insightsPanel.classList.toggle("collapsed", state.insightsCollapsed);
  els.toggleInsights.setAttribute("aria-expanded", String(!state.insightsCollapsed));
  els.toggleInsights.textContent = state.insightsCollapsed ? "Expandir" : "Recolher";
}

function toggleInsightsPanel() {
  state.insightsCollapsed = !state.insightsCollapsed;
  applyInsightsCollapsedState();
}

els.menuToggle.addEventListener("click", toggleMenu);
els.toggleInsights.addEventListener("click", toggleInsightsPanel);
els.openLoadModal.addEventListener("click", openLoadModal);
els.closeLoadModal.addEventListener("click", closeLoadModal);
els.loadModal.addEventListener("click", (event) => {
  if (event.target === els.loadModal) closeLoadModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !els.loadModal.classList.contains("hidden")) closeLoadModal();
});
els.createEpic.addEventListener("click", loadEpic);
els.csvFile.addEventListener("change", (event) => {
  handleFile(event.target.files[0]);
});

["dragenter", "dragover"].forEach((eventName) => {
  els.uploadZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    els.uploadZone.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  els.uploadZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    els.uploadZone.classList.remove("dragging");
  });
});

els.uploadZone.addEventListener("drop", (event) => {
  handleFile(event.dataTransfer.files[0]);
});

els.sampleButtons.forEach((button) => {
  button.addEventListener("click", () => loadSampleScenario(button.dataset.sample));
});
window.addEventListener("resize", renderChart);

resetDashboard();
