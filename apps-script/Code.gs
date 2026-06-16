const SHEET_NAME = 'Properties';
const APP_NAME = '中區房源快配站';

const HEADERS = [
  'propertyId',
  'propertyName',
  'city',
  'district',
  'address',
  'roomType',
  'rent',
  'managementFee',
  'deposit',
  'availableDate',
  'currentStatus',
  'petAllowed',
  'elevator',
  'carParking',
  'scooterParking',
  'cookingAllowed',
  'matchingNotes',
  'features',
  'internalNotes',
  'ownerAgent',
  'ownerAgentPhone',
  'ownerAgentLine',
  'contactNotes',
  'branch',
  'supervisorReviewStatus',
  'supervisorNotes',
  'propertyStatus',
  'createdAt',
  'updatedAt',
];

const REQUIRED_CREATE_FIELDS = [
  'propertyName',
  'city',
  'district',
  'address',
  'roomType',
  'rent',
  'availableDate',
  'currentStatus',
  'petAllowed',
  'elevator',
  'carParking',
  'scooterParking',
  'cookingAllowed',
  'ownerAgent',
  'ownerAgentPhone',
  'branch',
];

function doGet(e) {
  const params = (e && e.parameter) || {};
  const action = params.action || 'healthCheck';
  return handleRequest({ action: action, password: params.password });
}

function doPost(e) {
  try {
    const body = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    return handleRequest(body);
  } catch (error) {
    return jsonOutput({ success: false, message: '請求格式錯誤：' + error.message });
  }
}

function handleRequest(request) {
  try {
    const action = request.action;
    if (action === 'healthCheck') return healthCheck();
    if (action === 'verifyPassword') return verifyPasswordAction(request);

    assertPassword(request.password);

    if (action === 'listProperties') return listProperties();
    if (action === 'createProperty') return createProperty(request.payload || {});
    if (action === 'reviewProperty') return reviewProperty(request);
    if (action === 'seedDemoData') return seedDemoData();

    return jsonOutput({ success: false, message: '不支援的 action：' + action });
  } catch (error) {
    return jsonOutput({ success: false, message: error.message || '系統發生錯誤' });
  }
}

function healthCheck() {
  return jsonOutput({ success: true, message: APP_NAME + ' API 正常' });
}

function verifyPasswordAction(request) {
  if (isPasswordValid(request.password)) {
    return jsonOutput({ success: true });
  }
  return jsonOutput({ success: false, message: '密碼錯誤' });
}

function assertPassword(password) {
  if (!isPasswordValid(password)) {
    throw new Error('密碼錯誤');
  }
}

function isPasswordValid(password) {
  const props = PropertiesService.getScriptProperties();
  const plainPassword = props.getProperty('SHARED_PASSWORD');
  const passwordHash = props.getProperty('PASSWORD_HASH');
  const input = String(password || '');

  if (passwordHash) {
    return sha256(input) === passwordHash;
  }
  if (plainPassword) {
    return input === plainPassword;
  }
  throw new Error('尚未設定 SHARED_PASSWORD 或 PASSWORD_HASH');
}

function sha256(text) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return bytes
    .map(function (byte) {
      const value = byte < 0 ? byte + 256 : byte;
      return ('0' + value.toString(16)).slice(-2);
    })
    .join('');
}

function listProperties() {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) {
    return jsonOutput({ success: true, data: [] });
  }

  const rows = values.slice(1).filter(function (row) {
    return row.some(function (cell) {
      return cell !== '';
    });
  });

  const data = rows.map(function (row) {
    const record = {};
    HEADERS.forEach(function (header, index) {
      record[header] = normalizeCell(row[index]);
    });
    return record;
  });

  return jsonOutput({ success: true, data: data });
}

function createProperty(payload) {
  validateCreatePayload(payload);

  const sheet = getSheet();
  const now = nowText();
  const property = {};

  HEADERS.forEach(function (header) {
    property[header] = payload[header] || '';
  });

  property.propertyId = nextPropertyId(sheet);
  property.rent = Number(payload.rent);
  property.createdAt = now;
  property.updatedAt = now;
  property.supervisorReviewStatus = '待主管確認';
  property.propertyStatus = '待主管確認';

  sheet.appendRow(toRow(property));
  return jsonOutput({ success: true, message: '新增成功', data: property });
}

function reviewProperty(request) {
  const propertyId = String(request.propertyId || '').trim();
  if (!propertyId) throw new Error('缺少 propertyId');

  const statusMap = {
    approve: ['已確認上架', '已上架'],
    revise: ['資料需補正', '資料需補正'],
    reject: ['未通過上架', '已下架'],
    pause: ['暫停', '暫停配案'],
  };
  const nextStatus = statusMap[request.reviewAction];
  if (!nextStatus) throw new Error('不支援的 reviewAction');

  const sheet = getSheet();
  const rowIndex = findRowIndexByPropertyId(sheet, propertyId);
  if (rowIndex < 2) throw new Error('找不到 propertyId：' + propertyId);

  const headerMap = headerIndexMap();
  sheet.getRange(rowIndex, headerMap.supervisorReviewStatus + 1).setValue(nextStatus[0]);
  sheet.getRange(rowIndex, headerMap.propertyStatus + 1).setValue(nextStatus[1]);
  sheet.getRange(rowIndex, headerMap.supervisorNotes + 1).setValue(request.supervisorNotes || '');
  sheet.getRange(rowIndex, headerMap.updatedAt + 1).setValue(nowText());

  return jsonOutput({ success: true, message: '審核更新成功' });
}

function seedDemoData() {
  const sheet = getSheet();
  const demoRows = demoProperties().map(toRow);
  if (demoRows.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, demoRows.length, HEADERS.length).setValues(demoRows);
  }
  return jsonOutput({ success: true, message: '已建立測試資料', count: demoRows.length });
}

function validateCreatePayload(payload) {
  const missing = REQUIRED_CREATE_FIELDS.filter(function (field) {
    return !String(payload[field] || '').trim();
  });
  if (missing.length) {
    throw new Error('必填欄位未填：' + missing.join(', '));
  }
  if (!isFinite(Number(payload.rent))) {
    throw new Error('rent 必須是數字');
  }
}

function getSheet() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) throw new Error('尚未設定 SPREADSHEET_ID');

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  ensureHeaders(sheet);
  return sheet;
}

function ensureHeaders(sheet) {
  const current = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasAllHeaders = HEADERS.every(function (header, index) {
    return current[index] === header;
  });
  if (!hasAllHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function nextPropertyId(sheet) {
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd');
  const prefix = 'ZQ-' + today + '-';
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return prefix + '001';

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  const max = ids.reduce(function (largest, id) {
    const text = String(id || '');
    if (!text.startsWith(prefix)) return largest;
    const number = Number(text.slice(prefix.length));
    return isFinite(number) && number > largest ? number : largest;
  }, 0);
  return prefix + String(max + 1).padStart(3, '0');
}

function findRowIndexByPropertyId(sheet, propertyId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let index = 0; index < ids.length; index += 1) {
    if (String(ids[index][0]) === propertyId) {
      return index + 2;
    }
  }
  return -1;
}

function headerIndexMap() {
  const map = {};
  HEADERS.forEach(function (header, index) {
    map[header] = index;
  });
  return map;
}

function toRow(property) {
  return HEADERS.map(function (header) {
    return property[header] || '';
  });
}

function normalizeCell(value) {
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return value === null || value === undefined ? '' : value;
}

function nowText() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

function jsonOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function setupPropertiesForFirstRun() {
  const props = PropertiesService.getScriptProperties();
  props.setProperties({
    SPREADSHEET_ID: '請貼上 Google Sheets ID',
    SHARED_PASSWORD: '請改成自己的共用密碼',
    APP_NAME: APP_NAME,
  });
}

function initializeSheet() {
  getSheet();
}

function demoProperties() {
  const now = nowText();
  return [
    demo('ZQ-DEMO-001', '北屯兩房車', '台中市', '北屯區', '測試路一段 1 號', '2房', 26000, '2500', '兩個月', '2026-07-01', '空屋可看', '可談', '有電梯', '有', '有', '可', '適合小家庭，車位需提前確認。', '近公園、採光佳', '測試資料，非真實物件。', '黃岳澤', '0900-000-001', 'line-test-001', '請先以 LINE 約看。', '中一處', '已確認上架', '測試通過', '已上架', now),
    demo('ZQ-DEMO-002', '南區電梯套房', '台中市', '南區', '測試街 22 號', '套房', 12000, '800', '兩個月', '2026-06-25', '有人住可約看', '不可寵', '有電梯', '無', '有', '不可', '適合單身上班族。', '電梯、獨洗', '測試資料，非真實物件。', '賴重丞', '0900-000-002', 'https://line.me/R/ti/p/@demo002', '晚上較方便聯絡。', '中二處', '待主管確認', '', '待主管確認', now),
    demo('ZQ-DEMO-003', '草屯三房可寵', '南投縣', '草屯鎮', '測試路 33 號', '3房', 21000, '1500', '兩個月', '2026-07-10', '空屋可看', '可寵', '無電梯', '無', '有', '可', '寵物需簽寵物條款。', '通風、可寵', '測試資料，非真實物件。', '吳震', '0900-000-003', 'line-test-003', '週末可約看。', '中三處', '資料需補正', '請補充寵物限制。', '資料需補正', now),
    demo('ZQ-DEMO-004', '彰化市整理中兩房', '彰化縣', '彰化市', '測試巷 45 號', '2房', 18000, '1000', '兩個月', '2026-08-01', '整理中', '待確認', '有電梯', '可另租', '有', '可', '需確認完工日。', '新整理', '測試資料，非真實物件。', '吳清蓮', '0900-000-004', 'line-test-004', '先確認整理進度。', '彰一處', '暫停', '整理完成後再開放。', '暫停配案', now),
    demo('ZQ-DEMO-005', '嘉義市小家庭三房', '嘉義市', '東區', '測試大道 56 號', '3房', 23000, '1200', '兩個月', '2026-07-15', '即將空出', '可談', '有電梯', '有', '無', '可', '適合家庭客。', '學區、採光', '測試資料，非真實物件。', '童翊桓', '0900-000-005', 'line-test-005', '白天聯絡。', '嘉一處', '已確認上架', '', '配案中', now),
    demo('ZQ-DEMO-006', '新竹市套房', '新竹市', '東區', '測試路 66 號', '套房', 16000, '900', '兩個月', '2026-06-30', '空屋可看', '不可寵', '有電梯', '無', '可另租', '不可', '適合工程師。', '近園區交通線', '測試資料，非真實物件。', '蘇睿雅', '0900-000-006', 'line-test-006', '需提前一天約看。', '竹一處', '已確認上架', '', '已出租', now),
    demo('ZQ-DEMO-007', '太平可開伙兩房', '台中市', '太平區', '測試街 77 號', '2房', 19000, '1000', '兩個月', '2026-07-05', '待確認', '可談', '無電梯', '無', '有', '可', '樓層需告知客戶。', '可開伙、格局方正', '測試資料，非真實物件。', '蕭湘芩', '0900-000-007', 'line-test-007', '電話不通再傳 LINE。', '中四處', '未通過上架', '照片與現況不符。', '已下架', now),
    demo('ZQ-DEMO-008', '西屯近捷運一房', '台中市', '西屯區', '測試路 88 號', '1房', 22000, '1800', '兩個月', '2026-07-20', '空屋可看', '可談', '有電梯', '可另租', '有', '可', '適合通勤客。', '近捷運、管理佳', '測試資料，非真實物件。', '葉孟德', '0900-000-008', 'line-test-008', '管理室需換證。', '中五處', '已確認上架', '', '已上架', now),
  ];
}

function demo(propertyId, propertyName, city, district, address, roomType, rent, managementFee, deposit, availableDate, currentStatus, petAllowed, elevator, carParking, scooterParking, cookingAllowed, matchingNotes, features, internalNotes, ownerAgent, ownerAgentPhone, ownerAgentLine, contactNotes, branch, supervisorReviewStatus, supervisorNotes, propertyStatus, timestamp) {
  return {
    propertyId: propertyId,
    propertyName: propertyName,
    city: city,
    district: district,
    address: address,
    roomType: roomType,
    rent: rent,
    managementFee: managementFee,
    deposit: deposit,
    availableDate: availableDate,
    currentStatus: currentStatus,
    petAllowed: petAllowed,
    elevator: elevator,
    carParking: carParking,
    scooterParking: scooterParking,
    cookingAllowed: cookingAllowed,
    matchingNotes: matchingNotes,
    features: features,
    internalNotes: internalNotes,
    ownerAgent: ownerAgent,
    ownerAgentPhone: ownerAgentPhone,
    ownerAgentLine: ownerAgentLine,
    contactNotes: contactNotes,
    branch: branch,
    supervisorReviewStatus: supervisorReviewStatus,
    supervisorNotes: supervisorNotes,
    propertyStatus: propertyStatus,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
