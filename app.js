const API_URL = "https://script.google.com/macros/s/AKfycbxMy029focRumJnw0woRMUtD3i59Sn4TQK1eM42Tvp2mLrH5zaLK5ggrKwxO7eqHM8/exec";

const SESSION_AUTH_KEY = "fastmatch_v02_authenticated";
const SESSION_PASSWORD_KEY = "fastmatch_v02_password";

const fields = [
  "propertyId",
  "propertyName",
  "city",
  "district",
  "address",
  "roomType",
  "rent",
  "managementFee",
  "deposit",
  "availableDate",
  "currentStatus",
  "petAllowed",
  "elevator",
  "carParking",
  "scooterParking",
  "cookingAllowed",
  "matchingNotes",
  "features",
  "internalNotes",
  "ownerAgent",
  "ownerAgentPhone",
  "ownerAgentLine",
  "contactNotes",
  "branch",
  "supervisorReviewStatus",
  "supervisorNotes",
  "propertyStatus",
  "createdAt",
  "updatedAt",
];

const fieldLabels = {
  propertyId: "物件編號",
  propertyName: "物件名稱／物件簡稱",
  city: "縣市",
  district: "行政區",
  address: "物件地址",
  roomType: "房型",
  rent: "租金",
  managementFee: "管理費",
  deposit: "押金條件",
  availableDate: "可入住日期",
  currentStatus: "物件現況",
  petAllowed: "可寵物",
  elevator: "有無電梯",
  carParking: "汽車車位",
  scooterParking: "機車車位",
  cookingAllowed: "是否可開伙",
  matchingNotes: "可配案條件／注意事項",
  features: "物件特色",
  internalNotes: "內部備註",
  ownerAgent: "原登錄業務",
  ownerAgentPhone: "原登錄業務電話",
  ownerAgentLine: "原登錄業務 LINE 聯絡方式",
  contactNotes: "聯絡注意事項",
  branch: "所屬營業處",
  supervisorReviewStatus: "主管確認狀態",
  supervisorNotes: "主管備註",
  propertyStatus: "物件狀態",
  createdAt: "建立時間",
  updatedAt: "最後更新時間",
};

const options = {
  city: ["台中市", "彰化縣", "南投縣", "嘉義市", "嘉義縣", "新竹縣", "新竹市"],
  roomType: ["套房", "1房", "2房", "3房", "4房以上", "整層住家", "透天", "其他"],
  currentStatus: ["空屋可看", "有人住可約看", "整理中", "即將空出", "待確認"],
  petAllowed: ["可寵", "不可寵", "可談", "待確認"],
  elevator: ["有電梯", "無電梯", "待確認"],
  carParking: ["有", "無", "可另租", "待確認"],
  scooterParking: ["有", "無", "可另租", "待確認"],
  cookingAllowed: ["可", "不可", "待確認"],
  branch: ["中一處", "中二處", "中三處", "中四處", "中五處", "中六處", "彰一處", "嘉一處", "竹一處"],
  supervisorReviewStatus: ["待主管確認", "資料需補正", "已確認上架", "未通過上架", "暫停"],
  propertyStatus: ["待主管確認", "資料需補正", "已上架", "配案中", "暫停配案", "已出租", "已下架"],
};

const requiredCreateFields = [
  "propertyName",
  "city",
  "district",
  "address",
  "roomType",
  "rent",
  "availableDate",
  "currentStatus",
  "petAllowed",
  "elevator",
  "carParking",
  "scooterParking",
  "cookingAllowed",
  "ownerAgent",
  "ownerAgentPhone",
  "branch",
];

const optionalCreateFields = [
  "managementFee",
  "deposit",
  "matchingNotes",
  "features",
  "internalNotes",
  "ownerAgentLine",
  "contactNotes",
];

const filterFields = [
  "city",
  "district",
  "roomType",
  "rentMin",
  "rentMax",
  "availableDate",
  "petAllowed",
  "elevator",
  "carParking",
  "scooterParking",
  "cookingAllowed",
  "propertyStatus",
  "ownerAgent",
  "branch",
];

const appState = {
  properties: [],
  filters: {},
};

function apiIsConfigured() {
  return API_URL && !API_URL.includes("請貼上") && /^https?:\/\//.test(API_URL);
}

function getPassword() {
  return sessionStorage.getItem(SESSION_PASSWORD_KEY) || "";
}

async function callApi(action, body = {}) {
  if (!apiIsConfigured()) {
    throw new Error("尚未設定 Apps Script API_URL，請先依照 README 完成部署設定。");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...body }),
  });

  if (!response.ok) {
    throw new Error(`無法連線 Apps Script（HTTP ${response.status}）`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Apps Script 回傳錯誤");
  }
  return result;
}

function showGlobalMessage(message, type = "info") {
  const box = document.querySelector("#globalMessage");
  box.textContent = message;
  box.className = `notice ${type === "error" ? "notice-error" : ""}`;
  box.classList.remove("hidden");
  window.setTimeout(() => box.classList.add("hidden"), 4200);
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "未填寫";
  return String(value);
}

function formatRent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return formatValue(value);
  return `${number.toLocaleString("zh-TW")} 元`;
}

function formatDate(value) {
  if (!value) return "未填寫";
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return date.toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return formatValue(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeRaw(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function statusClass(status) {
  const value = String(status || "");
  if (value.includes("已上架") || value.includes("已確認")) return "status-live";
  if (value.includes("配案中")) return "status-matching";
  if (value.includes("補正")) return "status-fix";
  if (value.includes("待主管")) return "status-waiting";
  if (value.includes("暫停")) return "status-paused";
  if (value.includes("已出租") || value.includes("已下架") || value.includes("未通過")) return "status-closed";
  return "";
}

function badge(status) {
  return `<span class="badge ${statusClass(status)}">${escapeHtml(status || "未填寫")}</span>`;
}

function switchView(viewId) {
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === viewId));
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === viewId));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleApiNotice() {
  document.querySelector("#apiNotice").classList.toggle("hidden", apiIsConfigured());
}

async function login(event) {
  event.preventDefault();
  const message = document.querySelector("#loginMessage");
  const password = document.querySelector("#passwordInput").value.trim();
  message.textContent = "";

  try {
    await callApi("verifyPassword", { password });
    sessionStorage.setItem(SESSION_AUTH_KEY, "true");
    sessionStorage.setItem(SESSION_PASSWORD_KEY, password);
    showApp();
    await loadProperties();
  } catch (error) {
    message.textContent = error.message || "密碼錯誤";
  }
}

function logout() {
  sessionStorage.removeItem(SESSION_AUTH_KEY);
  sessionStorage.removeItem(SESSION_PASSWORD_KEY);
  document.querySelector("#passwordInput").value = "";
  document.querySelector("#appShell").classList.add("hidden");
  document.querySelector("#loginView").classList.remove("hidden");
}

function showApp() {
  document.querySelector("#loginView").classList.add("hidden");
  document.querySelector("#appShell").classList.remove("hidden");
}

async function loadProperties() {
  try {
    const result = await callApi("listProperties", { password: getPassword() });
    appState.properties = Array.isArray(result.data) ? result.data : [];
    renderAll();
  } catch (error) {
    showGlobalMessage(error.message || "讀取資料失敗", "error");
    appState.properties = [];
    renderAll();
  }
}

function renderAll() {
  renderDashboard();
  renderFilters();
  renderPropertyList();
  renderReviewList();
}

function renderDashboard() {
  const stats = [
    ["已上架物件數", countByStatus("已上架")],
    ["待主管確認物件數", countByStatus("待主管確認")],
    ["配案中物件數", countByStatus("配案中")],
    ["已出租物件數", countByStatus("已出租")],
    ["資料需補正物件數", countByStatus("資料需補正")],
    ["總物件數", appState.properties.length],
  ];

  document.querySelector("#statCards").innerHTML = stats
    .map(([label, count]) => `<article class="stat-card"><strong>${count}</strong><span>${label}</span></article>`)
    .join("");

  const recent = [...appState.properties]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  document.querySelector("#recentList").innerHTML = renderTable(recent, [
    ["propertyName", fieldLabels.propertyName],
    ["city", "縣市"],
    ["district", "行政區"],
    ["roomType", "房型"],
    ["rent", "租金", formatRent],
    ["propertyStatus", "物件狀態", badge],
    ["ownerAgent", "原登錄業務"],
  ]);
}

function countByStatus(status) {
  return appState.properties.filter((item) => item.propertyStatus === status).length;
}

function renderFilters() {
  const form = document.querySelector("#filterForm");
  if (form.dataset.ready === "true") return;

  form.innerHTML = filterFields.map(renderFilterField).join("");
  form.addEventListener("input", () => {
    appState.filters = Object.fromEntries(new FormData(form).entries());
    renderPropertyList();
  });
  form.dataset.ready = "true";
}

function renderFilterField(name) {
  const label = {
    rentMin: "租金最低",
    rentMax: "租金最高",
  }[name] || fieldLabels[name];

  if (options[name]) {
    return `<div class="field"><label for="filter-${name}">${label}</label><select id="filter-${name}" name="${name}"><option value="">全部</option>${options[name]
      .map((item) => `<option value="${item}">${item}</option>`)
      .join("")}</select></div>`;
  }

  const type = ["rentMin", "rentMax"].includes(name) ? "number" : name === "availableDate" ? "date" : "text";
  return `<div class="field"><label for="filter-${name}">${label}</label><input id="filter-${name}" name="${name}" type="${type}" /></div>`;
}

function getFilteredProperties() {
  return appState.properties.filter((item) => {
    const filters = appState.filters;
    if (filters.city && item.city !== filters.city) return false;
    if (filters.district && !String(item.district || "").includes(filters.district)) return false;
    if (filters.roomType && item.roomType !== filters.roomType) return false;
    if (filters.petAllowed && item.petAllowed !== filters.petAllowed) return false;
    if (filters.elevator && item.elevator !== filters.elevator) return false;
    if (filters.carParking && item.carParking !== filters.carParking) return false;
    if (filters.scooterParking && item.scooterParking !== filters.scooterParking) return false;
    if (filters.cookingAllowed && item.cookingAllowed !== filters.cookingAllowed) return false;
    if (filters.propertyStatus && item.propertyStatus !== filters.propertyStatus) return false;
    if (filters.ownerAgent && !String(item.ownerAgent || "").includes(filters.ownerAgent)) return false;
    if (filters.branch && item.branch !== filters.branch) return false;
    if (filters.rentMin && Number(item.rent) < Number(filters.rentMin)) return false;
    if (filters.rentMax && Number(item.rent) > Number(filters.rentMax)) return false;
    if (filters.availableDate && formatDate(item.availableDate) < filters.availableDate) return false;
    return true;
  });
}

function renderPropertyList() {
  const properties = getFilteredProperties();
  const columns = [
    ["propertyName", fieldLabels.propertyName],
    ["city", "縣市"],
    ["district", "行政區"],
    ["roomType", "房型"],
    ["rent", "租金", formatRent],
    ["availableDate", "可入住日期", formatDate],
    ["petAllowed", "可寵物"],
    ["elevator", "電梯"],
    ["carParking", "汽車位"],
    ["scooterParking", "機車位"],
    ["cookingAllowed", "開伙"],
    ["propertyStatus", "狀態", badge],
    ["ownerAgent", "原登錄業務"],
    ["branch", "營業處"],
    ["actions", "操作", (_, item) => `<button type="button" data-detail-id="${escapeHtml(item.propertyId)}">查看詳情</button>`],
  ];
  document.querySelector("#propertyList").innerHTML = renderTable(properties, columns);
}

function renderTable(rows, columns) {
  if (!rows.length) return `<div class="empty">目前沒有資料</div>`;
  return `<table><thead><tr>${columns.map(([, label]) => `<th>${label}</th>`).join("")}</tr></thead><tbody>${rows
    .map(
      (row) =>
        `<tr>${columns
          .map(([key, , formatter]) => {
            const value = formatter ? formatter(row[key], row) : escapeHtml(row[key]);
            return `<td>${value}</td>`;
          })
          .join("")}</tr>`,
    )
    .join("")}</tbody></table>`;
}

function renderDetail(propertyId) {
  const item = appState.properties.find((property) => property.propertyId === propertyId);
  const box = document.querySelector("#propertyDetail");
  if (!item) {
    box.innerHTML = `<div class="empty">找不到這筆物件資料</div>`;
    return;
  }

  const lineValue = item.ownerAgentLine || "";
  const lineHtml = /^https?:\/\//.test(lineValue)
    ? `<a href="${escapeHtml(lineValue)}" target="_blank" rel="noopener">開啟 LINE 聯絡方式</a>`
    : `<span>${escapeHtml(lineValue || "未填寫")}</span>`;

  const cards = fields
    .map((key) => {
      const value = key === "rent" || key === "managementFee" ? formatRent(item[key]) : key.includes("Date") || key.endsWith("At") ? formatDate(item[key]) : formatValue(item[key]);
      return `<dl class="detail-card"><dt>${fieldLabels[key]}</dt><dd>${key === "propertyStatus" || key === "supervisorReviewStatus" ? badge(value) : escapeHtml(value)}</dd></dl>`;
    })
    .join("");

  box.innerHTML = `
    <section class="detail-card contact-box">
      <h3>聯絡原登錄業務</h3>
      <p><strong>${escapeHtml(item.ownerAgent)}</strong></p>
      <p>電話：${escapeHtml(item.ownerAgentPhone)}</p>
      <p>LINE：${lineHtml}</p>
      <p>注意事項：${escapeHtml(item.contactNotes)}</p>
      <div class="contact-actions">
        ${item.ownerAgentPhone ? `<a href="tel:${escapeHtml(item.ownerAgentPhone)}">撥打電話</a>` : ""}
      </div>
    </section>
    <div class="detail-grid">${cards}</div>
  `;
}

function renderCreateForm() {
  const form = document.querySelector("#createForm");
  if (form.dataset.ready === "true") return;
  const createFields = [...requiredCreateFields, ...optionalCreateFields];
  form.innerHTML = createFields.map(renderCreateField).join("");
  form.dataset.ready = "true";
}

function renderCreateField(name) {
  const required = requiredCreateFields.includes(name);
  const labelClass = required ? "required" : "";
  const wide = ["address", "deposit"].includes(name) ? "field-wide" : "";
  const full = ["matchingNotes", "features", "internalNotes", "contactNotes"].includes(name) ? "field-full" : "";

  if (options[name]) {
    return `<div class="field ${wide} ${full}"><label class="${labelClass}" for="${name}">${fieldLabels[name]}</label><select id="${name}" name="${name}" ${required ? "required" : ""}><option value="">請選擇</option>${options[name]
      .map((item) => `<option value="${item}">${item}</option>`)
      .join("")}</select></div>`;
  }

  if (["matchingNotes", "features", "internalNotes", "contactNotes"].includes(name)) {
    return `<div class="field ${full}"><label class="${labelClass}" for="${name}">${fieldLabels[name]}</label><textarea id="${name}" name="${name}" ${required ? "required" : ""}></textarea></div>`;
  }

  const type = name === "rent" || name === "managementFee" ? "number" : name === "availableDate" ? "date" : "text";
  return `<div class="field ${wide}"><label class="${labelClass}" for="${name}">${fieldLabels[name]}</label><input id="${name}" name="${name}" type="${type}" ${required ? "required" : ""} /></div>`;
}

async function submitCreate(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());
  const missing = requiredCreateFields.filter((key) => !String(payload[key] || "").trim());
  if (missing.length) {
    showGlobalMessage(`請填寫必填欄位：${missing.map((key) => fieldLabels[key]).join("、")}`, "error");
    return;
  }
  if (!Number.isFinite(Number(payload.rent))) {
    showGlobalMessage("租金必須是數字", "error");
    return;
  }

  try {
    await callApi("createProperty", { password: getPassword(), payload });
    showGlobalMessage("新增成功，已重新讀取資料");
    form.reset();
    await loadProperties();
    switchView("listView");
  } catch (error) {
    showGlobalMessage(error.message || "新增失敗", "error");
  }
}

function renderReviewList() {
  const reviewStatuses = ["待主管確認", "資料需補正", "已確認上架", "未通過上架", "暫停", "暫停配案"];
  const rows = appState.properties.filter(
    (item) => reviewStatuses.includes(item.supervisorReviewStatus) || reviewStatuses.includes(item.propertyStatus),
  );

  const list = document.querySelector("#reviewList");
  if (!rows.length) {
    list.innerHTML = `<div class="empty">目前沒有需要審核的物件</div>`;
    return;
  }

  list.innerHTML = rows
    .map(
      (item) => `
      <article class="review-card">
        <div class="review-head">
          <div>
            <h3>${escapeHtml(item.propertyName)}</h3>
            <p class="muted">${escapeHtml(item.propertyId)}｜${escapeHtml(item.city)} ${escapeHtml(item.district)}｜${escapeHtml(item.branch)}</p>
          </div>
          <div>${badge(item.supervisorReviewStatus)} ${badge(item.propertyStatus)}</div>
        </div>
        <div class="review-summary">
          ${reviewSummary("地址", item.address)}
          ${reviewSummary("房型／租金", `${formatValue(item.roomType)}／${formatRent(item.rent)}`)}
          ${reviewSummary("可入住", formatDate(item.availableDate))}
          ${reviewSummary("現況", item.currentStatus)}
          ${reviewSummary("寵物／電梯", `${formatValue(item.petAllowed)}／${formatValue(item.elevator)}`)}
          ${reviewSummary("車位", `汽車：${formatValue(item.carParking)}／機車：${formatValue(item.scooterParking)}`)}
          ${reviewSummary("開伙", item.cookingAllowed)}
          ${reviewSummary("原登錄業務", `${formatValue(item.ownerAgent)} ${formatValue(item.ownerAgentPhone)}`)}
          ${reviewSummary("LINE", item.ownerAgentLine)}
          ${reviewSummary("配案條件", item.matchingNotes)}
          ${reviewSummary("內部備註", item.internalNotes)}
          ${reviewSummary("主管備註", item.supervisorNotes)}
        </div>
        <label for="notes-${escapeHtml(item.propertyId)}">主管備註</label>
        <textarea id="notes-${escapeHtml(item.propertyId)}" data-notes-id="${escapeHtml(item.propertyId)}">${escapeRaw(item.supervisorNotes)}</textarea>
        <div class="review-actions">
          <button type="button" class="primary" data-review-id="${escapeHtml(item.propertyId)}" data-review-action="approve">通過上架</button>
          <button type="button" data-review-id="${escapeHtml(item.propertyId)}" data-review-action="revise">退回補正</button>
          <button type="button" class="danger" data-review-id="${escapeHtml(item.propertyId)}" data-review-action="reject">不通過</button>
          <button type="button" data-review-id="${escapeHtml(item.propertyId)}" data-review-action="pause">暫停配案</button>
        </div>
      </article>
    `,
    )
    .join("");
}

function reviewSummary(label, value) {
  return `<div><span>${label}</span>${escapeHtml(value)}</div>`;
}

async function submitReview(propertyId, reviewAction) {
  const textarea = document.querySelector(`[data-notes-id="${CSS.escape(propertyId)}"]`);
  try {
    await callApi("reviewProperty", {
      password: getPassword(),
      propertyId,
      reviewAction,
      supervisorNotes: textarea ? textarea.value : "",
    });
    showGlobalMessage("審核更新成功，已重新讀取資料");
    await loadProperties();
  } catch (error) {
    showGlobalMessage(error.message || "審核更新失敗", "error");
  }
}

function bindEvents() {
  document.querySelector("#loginForm").addEventListener("submit", login);
  document.querySelector("#logoutButton").addEventListener("click", logout);
  document.querySelector("#refreshButton").addEventListener("click", loadProperties);
  document.querySelector("#clearFiltersButton").addEventListener("click", () => {
    document.querySelector("#filterForm").reset();
    appState.filters = {};
    renderPropertyList();
  });
  document.querySelector("#createForm").addEventListener("submit", submitCreate);
  document.querySelector("#resetCreateButton").addEventListener("click", () => document.querySelector("#createForm").reset());

  document.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-view]");
    if (tab) switchView(tab.dataset.view);

    const targetButton = event.target.closest("[data-view-target]");
    if (targetButton) switchView(targetButton.dataset.viewTarget);

    const detailButton = event.target.closest("[data-detail-id]");
    if (detailButton) {
      renderDetail(detailButton.dataset.detailId);
      switchView("detailView");
    }

    const reviewButton = event.target.closest("[data-review-id]");
    if (reviewButton) {
      submitReview(reviewButton.dataset.reviewId, reviewButton.dataset.reviewAction);
    }
  });
}

function init() {
  toggleApiNotice();
  bindEvents();
  renderCreateForm();
  if (sessionStorage.getItem(SESSION_AUTH_KEY) === "true") {
    showApp();
    loadProperties();
  }
}

init();
