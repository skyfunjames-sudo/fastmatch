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

const createSections = [
  {
    title: "物件基本資料",
    desc: "先填物件識別、位置與房型，方便列表搜尋。",
    cls: "section-basic",
    fields: ["propertyName", "city", "district", "address", "roomType"],
  },
  {
    title: "租賃條件資料",
    desc: "租金、押金、可入住日期與現況集中在這裡。",
    cls: "section-rent",
    fields: ["rent", "managementFee", "deposit", "availableDate", "currentStatus"],
  },
  {
    title: "房客常問條件",
    desc: "可寵、電梯、車位、開伙，都是前線查詢常用條件。",
    cls: "section-conditions",
    fields: ["petAllowed", "elevator", "carParking", "scooterParking", "cookingAllowed"],
  },
  {
    title: "配案與注意事項",
    desc: "放配案限制、特色與內部提醒，避免查詢時漏看。",
    cls: "section-notes",
    fields: ["matchingNotes", "features", "internalNotes"],
  },
  {
    title: "聯絡資訊與責任歸屬",
    desc: "詳細頁會顯示給同仁確認原登錄業務與聯絡方式。",
    cls: "section-contact",
    fields: ["ownerAgent", "ownerAgentPhone", "ownerAgentLine", "branch", "contactNotes"],
  },
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
  document.querySelectorAll(".nav-btn").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === viewId));
  const titleMap = {
    dashboardView: "首頁儀表板",
    listView: "物件列表",
    detailView: "物件詳細頁",
    createView: "新增物件",
    reviewView: "主管審核",
  };
  const title = document.querySelector("#pageTitle");
  if (title) title.textContent = titleMap[viewId] || "中區房源快配站";
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
    ["已上架物件", countByStatus("已上架")],
    ["待主管確認", countByStatus("待主管確認")],
    ["配案中物件", countByStatus("配案中")],
    ["已出租物件", countByStatus("已出租")],
    ["資料需補正", countByStatus("資料需補正")],
    ["全部物件", appState.properties.length],
  ];

  document.querySelector("#statCards").innerHTML = stats
    .map(([label, count]) => `<article class="stat-card"><span>${label}</span><strong>${count}</strong></article>`)
    .join("");

  const recent = [...appState.properties]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  document.querySelector("#recentList").innerHTML = recent.length
    ? recent
        .map(
          (item) => `
        <div class="recent-item">
          <div>
            <h4>${escapeHtml(item.propertyName)}</h4>
            <p>${escapeHtml(item.city)} ${escapeHtml(item.district)}｜${escapeHtml(item.roomType)}｜${formatRent(item.rent)}｜${escapeHtml(item.ownerAgent)}</p>
          </div>
          ${badge(item.propertyStatus)}
        </div>`,
        )
        .join("")
    : `<div class="empty-state">目前沒有資料</div>`;
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
  document.querySelector("#propertyList").innerHTML = properties.length
    ? properties
        .map(
          (item) => `
      <article class="property-card">
        <div class="property-top">
          <div>
            <h3>${escapeHtml(item.propertyName)}</h3>
            <p class="address-short">${escapeHtml(item.city)} ${escapeHtml(item.district)}｜${escapeHtml(item.roomType)}</p>
          </div>
          <div class="rent">${formatRent(item.rent)}</div>
        </div>

        <div class="tag-row">
          ${badge(item.propertyStatus)}
          ${badge(item.petAllowed)}
          ${badge(item.elevator)}
          ${badge(`汽車：${formatValue(item.carParking)}`)}
          ${badge(`機車：${formatValue(item.scooterParking)}`)}
        </div>

        <div class="meta-grid">
          ${metaItem("可入住日期", formatDate(item.availableDate))}
          ${metaItem("可開伙", item.cookingAllowed)}
          ${metaItem("原登錄業務", item.ownerAgent)}
          ${metaItem("所屬營業處", item.branch)}
        </div>

        <div class="card-actions">
          <button class="primary-btn" type="button" data-detail-id="${escapeHtml(item.propertyId)}">查看詳情</button>
        </div>
      </article>`,
        )
        .join("")
    : `<div class="empty-state">目前沒有符合條件的物件。</div>`;
}

function metaItem(label, value) {
  return `<div class="meta"><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong></div>`;
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
    box.innerHTML = `<div class="empty-state">找不到這筆物件資料</div>`;
    return;
  }
  document.querySelector("#detailId").textContent = item.propertyId || "";
  document.querySelector("#detailName").textContent = item.propertyName || "物件詳細資料";
  document.querySelector("#detailSubtitle").textContent = `${formatValue(item.city)} ${formatValue(item.district)}｜${formatValue(item.roomType)}`;

  const lineValue = item.ownerAgentLine || "";
  const lineHtml = /^https?:\/\//.test(lineValue)
    ? `<a href="${escapeHtml(lineValue)}" target="_blank" rel="noopener">開啟 LINE 聯絡方式</a>`
    : `<span>${escapeHtml(lineValue || "未填寫")}</span>`;

  box.innerHTML = `
    <section class="detail-section">
      <h4>物件基本資料</h4>
      <div class="detail-grid">
        ${detailItem("物件名稱", item.propertyName)}
        ${detailItem("縣市", item.city)}
        ${detailItem("行政區", item.district)}
        ${detailItem("物件地址", item.address, "detail-span")}
        ${detailItem("房型", item.roomType)}
        ${detailItem("租金", formatRent(item.rent))}
        ${detailItem("管理費", item.managementFee)}
        ${detailItem("押金條件", item.deposit)}
        ${detailItem("可入住日期", formatDate(item.availableDate))}
        ${detailItem("物件現況", item.currentStatus)}
      </div>
    </section>

    <section class="detail-section">
      <h4>房客常問條件</h4>
      <div class="tag-row">
        ${badge(item.petAllowed)}
        ${badge(item.elevator)}
        ${badge(`汽車：${formatValue(item.carParking)}`)}
        ${badge(`機車：${formatValue(item.scooterParking)}`)}
        ${badge(`開伙：${formatValue(item.cookingAllowed)}`)}
      </div>
    </section>

    <section class="detail-section">
      <h4>配案與內部資訊</h4>
      <div class="note-box"><strong>可配案條件／注意事項</strong><br>${escapeHtml(item.matchingNotes)}</div>
      <div class="note-box"><strong>物件特色</strong><br>${escapeHtml(item.features)}</div>
      <div class="note-box"><strong>內部備註</strong><br>${escapeHtml(item.internalNotes)}</div>
    </section>

    <section class="detail-section">
      <h4>原登錄業務聯絡資訊</h4>
      <div class="detail-grid">
        ${detailItem("原登錄業務", item.ownerAgent, "contact-box")}
        ${detailItem("原登錄業務電話", item.ownerAgentPhone, "contact-box")}
        <div class="detail-item contact-box"><small>原登錄業務 LINE 聯絡方式</small><strong>${lineHtml}</strong></div>
        ${detailItem("聯絡注意事項", item.contactNotes, "contact-box detail-span")}
        ${detailItem("所屬營業處", item.branch, "contact-box")}
      </div>
    </section>

    <section class="detail-section">
      <h4>審核與系統狀態</h4>
      <div class="detail-grid">
        ${detailItem("主管確認狀態", item.supervisorReviewStatus)}
        ${detailItem("主管備註", item.supervisorNotes || "無")}
        ${detailItem("物件狀態", item.propertyStatus)}
        ${detailItem("建立時間", formatDate(item.createdAt))}
        ${detailItem("最後更新時間", formatDate(item.updatedAt))}
      </div>
    </section>
  `;
}

function detailItem(label, value, extraClass = "") {
  return `<div class="detail-item ${extraClass}"><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong></div>`;
}

function renderCreateForm() {
  const form = document.querySelector("#createForm");
  if (form.dataset.ready === "true") return;
  form.innerHTML = createSections
    .map(
      (section) => `
      <section class="form-section ${section.cls}">
        <div class="form-section-header">
          <h4>${section.title}</h4>
          <p>${section.desc}</p>
        </div>
        <div class="form-grid">${section.fields.map(renderCreateField).join("")}</div>
      </section>`,
    )
    .join("");
  form.dataset.ready = "true";
}

function renderCreateField(name) {
  const required = requiredCreateFields.includes(name);
  const mark = required ? " <b>*</b>" : "";
  const wide = ["address", "matchingNotes", "features", "internalNotes", "contactNotes"].includes(name) ? "span-2" : "";

  if (options[name]) {
    return `<label class="${wide}" for="${name}">${fieldLabels[name]}${mark}<select id="${name}" name="${name}" ${required ? "required" : ""}><option value="">請選擇</option>${options[name]
      .map((item) => `<option value="${item}">${item}</option>`)
      .join("")}</select></label>`;
  }

  if (["matchingNotes", "features", "internalNotes", "contactNotes"].includes(name)) {
    return `<label class="${wide}" for="${name}">${fieldLabels[name]}${mark}<textarea id="${name}" name="${name}" ${required ? "required" : ""}></textarea></label>`;
  }

  const type = name === "rent" ? "number" : name === "availableDate" ? "date" : "text";
  return `<label class="${wide}" for="${name}">${fieldLabels[name]}${mark}<input id="${name}" name="${name}" type="${type}" ${required ? "required" : ""} /></label>`;
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
    list.innerHTML = `<div class="empty-state">目前沒有需要審核的物件</div>`;
    return;
  }

  list.innerHTML = rows
    .map(
      (item) => `
      <article class="review-card">
        <div class="review-card-head">
          <div>
            <h4>${escapeHtml(item.propertyName)}</h4>
            <p class="muted">${escapeHtml(item.propertyId)}｜${escapeHtml(item.city)} ${escapeHtml(item.district)}｜${escapeHtml(item.branch)}</p>
          </div>
          <div class="tag-row">${badge(item.supervisorReviewStatus)} ${badge(item.propertyStatus)}</div>
        </div>
        <div class="review-info">
          ${metaItem("地址", item.address)}
          ${metaItem("房型／租金", `${formatValue(item.roomType)}／${formatRent(item.rent)}`)}
          ${metaItem("可入住", formatDate(item.availableDate))}
          ${metaItem("現況", item.currentStatus)}
          ${metaItem("寵物／電梯", `${formatValue(item.petAllowed)}／${formatValue(item.elevator)}`)}
          ${metaItem("車位", `汽車：${formatValue(item.carParking)}／機車：${formatValue(item.scooterParking)}`)}
          ${metaItem("開伙", item.cookingAllowed)}
          ${metaItem("原登錄業務", `${formatValue(item.ownerAgent)} ${formatValue(item.ownerAgentPhone)}`)}
        </div>
        <div class="note-box"><strong>LINE：</strong>${escapeHtml(item.ownerAgentLine)}</div>
        <div class="note-box"><strong>配案條件：</strong>${escapeHtml(item.matchingNotes)}</div>
        <div class="note-box"><strong>內部備註：</strong>${escapeHtml(item.internalNotes)}</div>
        <label for="notes-${escapeHtml(item.propertyId)}">主管備註</label>
        <textarea id="notes-${escapeHtml(item.propertyId)}" data-notes-id="${escapeHtml(item.propertyId)}">${escapeRaw(item.supervisorNotes)}</textarea>
        <div class="review-actions-row">
          <button type="button" class="success-btn" data-review-id="${escapeHtml(item.propertyId)}" data-review-action="approve">通過上架</button>
          <button type="button" class="warning-btn" data-review-id="${escapeHtml(item.propertyId)}" data-review-action="revise">退回補正</button>
          <button type="button" class="danger-btn" data-review-id="${escapeHtml(item.propertyId)}" data-review-action="reject">不通過</button>
          <button type="button" class="secondary-btn" data-review-id="${escapeHtml(item.propertyId)}" data-review-action="pause">暫停配案</button>
          <button type="button" class="ghost-btn" data-detail-id="${escapeHtml(item.propertyId)}">查看詳細</button>
        </div>
      </article>
    `,
    )
    .join("");
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
