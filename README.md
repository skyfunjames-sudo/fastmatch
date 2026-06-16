# 中區房源快配站 v0.2｜GitHub Pages ＋ Google Sheets 測試版

這是第一版上網測試用的內部工具。前端使用純 HTML／CSS／JavaScript，可直接部署到 GitHub Pages；資料放在 Google Sheets，前端透過 Google Apps Script Web App 讀寫資料。

版本定位：
- 第一版上網測試，可多人共用同一份 Google Sheets 資料。
- 使用共用密碼進入，不做每人帳號。
- 不放房東敏感個資、身分證、銀行帳戶或合約資料。
- 非正式營運系統。

## 檔案結構

```text
index.html
styles.css
app.js
README.md
apps-script/Code.gs
apps-script/SETUP.md
```

## GitHub Pages 部署方式

1. 到 GitHub 建立 repository，例如 `fastmatch`。
2. 上傳或更新根目錄的 `index.html`、`styles.css`、`app.js`、`README.md`。
3. 進入 repository 的 `Settings`。
4. 左側選單點 `Pages`。
5. `Source` 選擇 `Deploy from a branch`。
6. `Branch` 選擇 `main`，資料夾選擇 `/root`。
7. 按下 `Save`。
8. 等待 GitHub Pages 顯示網址，例如 `https://你的帳號.github.io/fastmatch/`。
9. 用電腦和手機都打開網址測試。
10. 之後要更新版本，只要更新根目錄檔案，GitHub Pages 會自動重新部署。

本專案不需要 Node.js、npm install、Vite 或 build 指令。

## Google Sheets 建立方式

1. 開啟 Google Sheets，建立一份新的試算表。
2. 試算表名稱可命名為 `中區房源快配站測試資料`。
3. 建立或重新命名第一個工作表為 `Properties`。
4. 第一列放入以下英文欄位表頭，順序不可調整。
5. 從試算表網址複製 Google Sheets ID。網址格式通常是：

```text
https://docs.google.com/spreadsheets/d/這一段就是SPREADSHEET_ID/edit
```

## 欄位對照表

| 英文欄位 | 中文說明 |
| --- | --- |
| propertyId | 物件編號 |
| propertyName | 物件名稱／物件簡稱 |
| city | 縣市 |
| district | 行政區 |
| address | 物件地址 |
| roomType | 房型 |
| rent | 租金 |
| managementFee | 管理費 |
| deposit | 押金條件 |
| availableDate | 可入住日期 |
| currentStatus | 物件現況 |
| petAllowed | 可寵物 |
| elevator | 有無電梯 |
| carParking | 汽車車位 |
| scooterParking | 機車車位 |
| cookingAllowed | 是否可開伙 |
| matchingNotes | 可配案條件／注意事項 |
| features | 物件特色 |
| internalNotes | 內部備註 |
| ownerAgent | 原登錄業務 |
| ownerAgentPhone | 原登錄業務電話 |
| ownerAgentLine | 原登錄業務 LINE 聯絡方式 |
| contactNotes | 聯絡注意事項 |
| branch | 所屬營業處 |
| supervisorReviewStatus | 主管確認狀態 |
| supervisorNotes | 主管備註 |
| propertyStatus | 物件狀態 |
| createdAt | 建立時間 |
| updatedAt | 最後更新時間 |

## Apps Script 部署方式

詳細步驟請看 [apps-script/SETUP.md](apps-script/SETUP.md)。

簡短流程：
1. 到 Google Sheets 的 `Extensions > Apps Script` 建立 Apps Script 專案。
2. 將 `apps-script/Code.gs` 內容貼到 Apps Script 的 `Code.gs`。
3. 到 Apps Script 的 `Project Settings > Script Properties` 設定：
   - `SPREADSHEET_ID`：Google Sheets ID
   - `SHARED_PASSWORD`：共用密碼
   - `APP_NAME`：中區房源快配站
4. 先執行 `initializeSheet` 建立表頭。
5. 需要測試資料時，執行 `seedDemoData`。
6. 點 `Deploy > New deployment`，類型選 `Web app`。
7. `Execute as` 選 `Me`。
8. `Who has access` 選 `Anyone` 或 `Anyone with the link`。
9. 部署後複製 Web App URL。

## 前端 API_URL 填寫位置

打開 `app.js`，最上方有這一行：

```js
const API_URL = "請貼上 Apps Script Web App URL";
```

把雙引號內文字換成 Apps Script Web App URL，例如：

```js
const API_URL = "https://script.google.com/macros/s/你的部署ID/exec";
```

前端只放 Apps Script Web App URL，不要放 Google Sheets ID，也不要放共用密碼。

## 共用密碼設定位置

共用密碼設定在 Apps Script 的 `Script Properties`，不是設定在前端。

建議第一版先設定：

```text
SHARED_PASSWORD = 你要給內部測試人員使用的共用密碼
```

如果要改用 hash，請設定：

```text
PASSWORD_HASH = SHA-256 後的密碼 hash
```

當 `PASSWORD_HASH` 存在時，系統會優先比對 hash；否則比對 `SHARED_PASSWORD`。

## 建立測試資料

1. 完成 `SPREADSHEET_ID` 和 `SHARED_PASSWORD` 設定。
2. 在 Apps Script 編輯器上方函式下拉選單選 `seedDemoData`。
3. 按 `Run`。
4. 第一次執行會要求授權，請依畫面授權。
5. 回到 Google Sheets，確認 `Properties` 工作表已新增 8 筆測試資料。

測試資料只供設定階段使用，上線測試前可清掉或不要公開讓一般使用者執行。

## 測試新增物件

1. 開啟 GitHub Pages 網址。
2. 輸入共用密碼。
3. 點 `新增物件`。
4. 填完必填欄位，租金請填數字。
5. 按 `送出新增`。
6. 成功後會回到列表，並重新讀取 Google Sheets。
7. 回 Google Sheets 確認新增資料：
   - `propertyId` 自動產生。
   - `createdAt`、`updatedAt` 自動填入。
   - `supervisorReviewStatus` 預設為 `待主管確認`。
   - `propertyStatus` 預設為 `待主管確認`。

## 測試主管審核

1. 開啟 GitHub Pages 網址並登入。
2. 點 `主管審核`。
3. 找到要審核的物件。
4. 可輸入主管備註。
5. 點其中一個按鈕：
   - `通過上架`：主管確認狀態改為 `已確認上架`，物件狀態改為 `已上架`。
   - `退回補正`：兩個狀態都改為 `資料需補正`。
   - `不通過`：主管確認狀態改為 `未通過上架`，物件狀態改為 `已下架`。
   - `暫停配案`：主管確認狀態改為 `暫停`，物件狀態改為 `暫停配案`。
6. 成功後會重新讀取資料，Google Sheets 的 `updatedAt` 會更新。

## 目前刻意不做的功能

- React、Vite、TypeScript 或需要 build 的工具。
- 正式資料庫、Firebase、Supabase 或後端伺服器。
- 每位業務登入帳號、完整權限系統。
- 房東個資管理、身分證、銀行帳戶、合約上傳。
- 修繕紀錄、成交獎金、金流。
- App 上架、自動通知、完整配案流程。
- 大量照片上傳。

## 前端頁面功能

- 共用密碼登入，使用 `sessionStorage` 記錄本次瀏覽器已驗證。
- 首頁統計卡片與最近新增物件。
- 物件列表與篩選。
- 物件詳細資料與原登錄業務聯絡區塊。
- 新增物件表單。
- 主管審核操作。

