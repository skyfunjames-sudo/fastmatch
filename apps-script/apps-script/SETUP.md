[SETUP.md](https://github.com/user-attachments/files/28990761/SETUP.md)
# Apps Script 設定說明

這份文件說明如何把 Google Sheets 接到 GitHub Pages 前端。請照順序做。

## 1. 建立 Google Sheets

1. 打開 Google Sheets。
2. 建立新的試算表。
3. 試算表名稱建議使用 `中區房源快配站測試資料`。
4. 把第一個工作表名稱改成 `Properties`。

## 2. 建立表頭

你可以手動貼上表頭，也可以等 Apps Script 的 `initializeSheet` 自動建立。

表頭順序如下：

```text
propertyId
propertyName
city
district
address
roomType
rent
managementFee
deposit
availableDate
currentStatus
petAllowed
elevator
carParking
scooterParking
cookingAllowed
matchingNotes
features
internalNotes
ownerAgent
ownerAgentPhone
ownerAgentLine
contactNotes
branch
supervisorReviewStatus
supervisorNotes
propertyStatus
createdAt
updatedAt
```

## 3. 複製 Google Sheets ID

看試算表網址：

```text
https://docs.google.com/spreadsheets/d/這一段就是SPREADSHEET_ID/edit
```

請先把這段 ID 存起來，等等要貼到 Apps Script。

## 4. 建立 Apps Script 專案

1. 在 Google Sheets 上方選單點 `Extensions`。
2. 點 `Apps Script`。
3. 進入 Apps Script 編輯器後，打開 `Code.gs`。
4. 刪掉原本內容。
5. 將本專案 `apps-script/Code.gs` 的全部內容貼上。
6. 按儲存。

## 5. 設定 Script Properties

1. 在 Apps Script 左側點齒輪圖示 `Project Settings`。
2. 找到 `Script Properties`。
3. 新增以下設定：

```text
SPREADSHEET_ID = 你的 Google Sheets ID
SHARED_PASSWORD = 你要給內部測試人員使用的共用密碼
APP_NAME = 中區房源快配站
```

第一版可先用 `SHARED_PASSWORD`。如果之後想改成 hash，可以改用：

```text
PASSWORD_HASH = SHA-256 後的密碼 hash
```

如果同時有 `PASSWORD_HASH` 和 `SHARED_PASSWORD`，程式會優先使用 `PASSWORD_HASH`。

## 6. 執行初始化

1. 回到 Apps Script 編輯器。
2. 上方函式下拉選單選 `initializeSheet`。
3. 按 `Run`。
4. 第一次執行會要求授權，請依照畫面完成授權。
5. 回 Google Sheets 確認 `Properties` 工作表第一列已有表頭。

## 7. 建立測試資料

1. 上方函式下拉選單選 `seedDemoData`。
2. 按 `Run`。
3. 回 Google Sheets 檢查是否新增 8 筆假資料。

提醒：`seedDemoData` 只建議在設定階段使用。測試完可以清掉資料，正式測試時也不要公開讓一般使用者執行。

## 8. 部署為 Web App

1. 在 Apps Script 右上角點 `Deploy`。
2. 選 `New deployment`。
3. 類型選 `Web app`。
4. `Description` 可填 `fastmatch v0.2`。
5. `Execute as` 選 `Me`。
6. `Who has access` 選 `Anyone` 或 `Anyone with the link`。
7. 點 `Deploy`。
8. 完成後複製 `Web App URL`。

## 9. 貼回前端 API_URL

打開前端檔案 `app.js`，最上方會看到：

```js
const API_URL = "請貼上 Apps Script Web App URL";
```

請把雙引號內改成剛剛複製的 Web App URL：

```js
const API_URL = "https://script.google.com/macros/s/你的部署ID/exec";
```

儲存後，上傳到 GitHub。GitHub Pages 重新部署後，前端就會連到 Apps Script。

## 10. 測試 API

### healthCheck

在瀏覽器打開：

```text
https://script.google.com/macros/s/你的部署ID/exec?action=healthCheck
```

正常會看到：

```json
{"success":true,"message":"中區房源快配站 API 正常"}
```

### verifyPassword

到 GitHub Pages 網址，輸入共用密碼。正確時會進入主畫面，錯誤時會顯示 `密碼錯誤`。

### listProperties

登入後首頁和物件列表會自動呼叫 `listProperties`。如果 Google Sheets 沒有資料，畫面會顯示目前沒有資料。

### createProperty

1. 登入前端。
2. 點 `新增物件`。
3. 填完必填欄位。
4. 按 `送出新增`。
5. 回 Google Sheets 確認新增列。

### reviewProperty

1. 登入前端。
2. 點 `主管審核`。
3. 輸入主管備註。
4. 點 `通過上架`、`退回補正`、`不通過` 或 `暫停配案`。
5. 回 Google Sheets 確認狀態與 `updatedAt` 已更新。

## 常見問題

### 前端顯示尚未設定 API_URL

代表 `app.js` 最上方仍是：

```js
const API_URL = "請貼上 Apps Script Web App URL";
```

請改成 Apps Script Web App URL。

### 密碼一直錯誤

請到 Apps Script 的 `Project Settings > Script Properties` 檢查 `SHARED_PASSWORD` 是否設定正確。

### 前端無法連線 Apps Script

請檢查：
- Apps Script 是否已部署為 Web App。
- `Who has access` 是否選 `Anyone` 或 `Anyone with the link`。
- `app.js` 的 `API_URL` 是否貼的是 `/exec` 結尾的 Web App URL。
- 修改 Apps Script 後，是否有重新部署新版本。

### Google Sheets 沒有資料

請先執行 `initializeSheet`，再視需要執行 `seedDemoData`。

