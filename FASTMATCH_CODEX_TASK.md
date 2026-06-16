# 中區房源快配站｜Codex 任務書 v0.2
## GitHub Pages ＋ Google Sheets ＋ Google Apps Script ＋ JavaScript

你是我的前端與 Google Apps Script 工程師。

請協助我將目前「中區房源快配站」第一版網站原型，改造成可上網測試的版本。

本次目標是：GitHub Pages ＋ Google Sheets ＋ Google Apps Script ＋ JavaScript

請注意：這是第一版上網測試版，不是正式營運系統。請不要自行擴大功能。

---

# 一、專案目標

請建立一個可部署到 GitHub Pages 的靜態網站，讓中區主管與業務可以用手機或電腦開啟網址，進行以下操作：

1. 輸入簡單共用密碼進入網站
2. 查看首頁／儀表板
3. 查看物件列表
4. 篩選物件
5. 查看物件詳細資料
6. 新增物件
7. 主管審核物件
8. 審核後更新物件狀態
9. 所有人看到同一份 Google Sheets 資料

資料請存放在 Google Sheets。前端請透過 Google Apps Script Web App 讀寫 Google Sheets。不要使用正式資料庫。不要做每位業務帳號。不要做完整權限系統。

---

# 二、技術架構

前端網站：
- GitHub Pages
- HTML
- CSS
- JavaScript

資料表：
- Google Sheets

簡易後端：
- Google Apps Script Web App

資料流：
業務／主管瀏覽器 → GitHub Pages 靜態網站 → JavaScript fetch 呼叫 Apps Script Web App → Apps Script 讀寫 Google Sheets → 回傳 JSON 給前端顯示

---

# 三、請不要使用以下功能

本次請不要做：React、Vite、TypeScript、正式資料庫、Firebase、Supabase、後端伺服器、登入帳號、每人權限、房東個資管理、合約上傳、修繕紀錄、成交獎金管理、金流、App 上架、自動通知、完整配案流程、大量照片上傳。

第一版只做：可以上網、可以新增、可以查詢、可以審核、可以共用資料。

---

# 四、前端檔案結構

請建立或整理成以下結構：

/index.html
/styles.css
/app.js
/README.md
/apps-script/Code.gs
/apps-script/SETUP.md

如果目前專案已經有其他檔案，請保留必要內容，刪除不需要的測試檔案。

---

# 五、Google Sheets 資料表設計

請設計一張 Google Sheets 工作表，工作表名稱：Properties

欄位順序請使用以下欄位：

1. propertyId
2. propertyName
3. city
4. district
5. address
6. roomType
7. rent
8. managementFee
9. deposit
10. availableDate
11. currentStatus
12. petAllowed
13. elevator
14. carParking
15. scooterParking
16. cookingAllowed
17. matchingNotes
18. features
19. internalNotes
20. ownerAgent
21. ownerAgentPhone
22. ownerAgentLine
23. contactNotes
24. branch
25. supervisorReviewStatus
26. supervisorNotes
27. propertyStatus
28. createdAt
29. updatedAt

請在 README.md 裡面整理一份中文欄位對照表。

欄位對照：
propertyId：物件編號
propertyName：物件名稱／物件簡稱
city：縣市
district：行政區
address：物件地址
roomType：房型
rent：租金
managementFee：管理費
deposit：押金條件
availableDate：可入住日期
currentStatus：物件現況
petAllowed：可寵物
elevator：有無電梯
carParking：汽車車位
scooterParking：機車車位
cookingAllowed：是否可開伙
matchingNotes：可配案條件／注意事項
features：物件特色
internalNotes：內部備註
ownerAgent：原登錄業務
ownerAgentPhone：原登錄業務電話
ownerAgentLine：原登錄業務 LINE 聯絡方式
contactNotes：聯絡注意事項
branch：所屬營業處
supervisorReviewStatus：主管確認狀態
supervisorNotes：主管備註
propertyStatus：物件狀態
createdAt：建立時間
updatedAt：最後更新時間

---

# 六、欄位選項

請前端表單使用下拉選單。

縣市 city：台中市、彰化縣、南投縣、嘉義市、嘉義縣、新竹縣、新竹市
房型 roomType：套房、1房、2房、3房、4房以上、整層住家、透天、其他
物件現況 currentStatus：空屋可看、有人住可約看、整理中、即將空出、待確認
可寵物 petAllowed：可寵、不可寵、可談、待確認
有無電梯 elevator：有電梯、無電梯、待確認
汽車車位 carParking：有、無、可另租、待確認
機車車位 scooterParking：有、無、可另租、待確認
是否可開伙 cookingAllowed：可、不可、待確認
所屬營業處 branch：中一處、中二處、中三處、中四處、中五處、中六處、彰一處、嘉一處、竹一處
主管確認狀態 supervisorReviewStatus：待主管確認、資料需補正、已確認上架、未通過上架、暫停
物件狀態 propertyStatus：待主管確認、資料需補正、已上架、配案中、暫停配案、已出租、已下架

---

# 七、必填與選填欄位

新增物件頁必填欄位：propertyName、city、district、address、roomType、rent、availableDate、currentStatus、petAllowed、elevator、carParking、scooterParking、cookingAllowed、ownerAgent、ownerAgentPhone、branch。

新增物件頁選填欄位：managementFee、deposit、matchingNotes、features、internalNotes、ownerAgentLine、contactNotes。

主管審核欄位：supervisorReviewStatus、supervisorNotes、propertyStatus。

---

# 八、前端頁面需求

請建立單頁式靜態網站，不一定要使用路由套件，可以用分頁切換方式完成。

頁面包含：密碼登入頁、首頁／儀表板、物件列表頁、物件詳細頁、新增物件頁、主管審核頁。

## 1. 密碼登入頁

使用者一進網站，先看到簡單密碼輸入畫面。

需求：
1. 顯示系統名稱：中區房源快配站
2. 顯示說明：內部測試版，請輸入共用密碼
3. 使用者輸入密碼後，呼叫 Apps Script 驗證
4. 密碼正確後進入主畫面
5. 密碼錯誤顯示錯誤訊息
6. 不要把正式密碼寫死在前端 JavaScript
7. 請用 sessionStorage 記錄本次瀏覽器已通過驗證，關閉瀏覽器後需重新輸入

注意：共用密碼只是第一版測試門禁，不是正式權限。

## 2. 首頁／儀表板

顯示統計卡片：已上架物件數、待主管確認物件數、配案中物件數、已出租物件數、資料需補正物件數、總物件數。

顯示最近新增物件，最多 5 筆：物件名稱、縣市、行政區、房型、租金、物件狀態、原登錄業務。

## 3. 物件列表頁

列表頁顯示欄位：物件名稱／物件簡稱、縣市、行政區、房型、租金、可入住日期、可寵物、有無電梯、汽車車位、機車車位、是否可開伙、物件狀態、原登錄業務、所屬營業處。

列表頁不要顯示：完整地址、業務電話、業務 LINE、內部備註、主管備註。

每筆物件要有「查看詳情」按鈕。

## 4. 查詢條件

物件列表頁請支援以下查詢：縣市、行政區、房型、租金最低、租金最高、可入住日期、可寵物、有無電梯、汽車車位、機車車位、是否可開伙、物件狀態、原登錄業務、所屬營業處。

請提供「清除篩選」按鈕。

## 5. 物件詳細頁

詳細頁顯示完整資料：物件編號、物件名稱／物件簡稱、縣市、行政區、物件地址、房型、租金、管理費、押金條件、可入住日期、物件現況、可寵物、有無電梯、汽車車位、機車車位、是否可開伙、可配案條件／注意事項、物件特色、內部備註、原登錄業務、原登錄業務電話、原登錄業務 LINE 聯絡方式、聯絡注意事項、所屬營業處、主管確認狀態、主管備註、物件狀態、建立時間、最後更新時間。

詳細頁要有明顯的「聯絡原登錄業務」區塊，顯示：原登錄業務、電話、LINE 聯絡方式、聯絡注意事項。

如果 ownerAgentPhone 有值，請提供 tel: 連結按鈕。如果 ownerAgentLine 是網址，請提供可開啟連結。如果 ownerAgentLine 是文字，請直接顯示文字。

## 6. 新增物件頁

新增物件頁請依照必填與選填欄位建立表單。

送出時：檢查必填欄位、rent 必須是數字、呼叫 Apps Script 新增資料、Apps Script 自動產生 propertyId、自動填入 createdAt、自動填入 updatedAt、自動設定 supervisorReviewStatus = 待主管確認、自動設定 propertyStatus = 待主管確認、新增成功後顯示成功訊息、新增成功後重新讀取資料。

## 7. 主管審核頁

主管審核頁顯示以下狀態的物件：待主管確認、資料需補正、已確認上架、未通過上架、暫停、暫停配案。

主管審核頁每筆物件要看到：物件名稱／物件簡稱、縣市、行政區、物件地址、房型、租金、可入住日期、物件現況、可寵物、有無電梯、汽車車位、機車車位、是否可開伙、可配案條件／注意事項、內部備註、原登錄業務、原登錄業務電話、原登錄業務 LINE 聯絡方式、所屬營業處、主管確認狀態、主管備註、物件狀態。

主管可以輸入主管備註。

主管可以操作四個按鈕：通過上架、退回補正、不通過、暫停配案。

操作規則：
1. 通過上架：supervisorReviewStatus = 已確認上架，propertyStatus = 已上架
2. 退回補正：supervisorReviewStatus = 資料需補正，propertyStatus = 資料需補正
3. 不通過：supervisorReviewStatus = 未通過上架，propertyStatus = 已下架
4. 暫停配案：supervisorReviewStatus = 暫停，propertyStatus = 暫停配案

操作成功後：更新 Google Sheets、updatedAt 自動更新、前端重新讀取資料、顯示成功訊息。

---

# 九、Apps Script API 設計

請在 /apps-script/Code.gs 建立完整 Apps Script 程式。

請使用 doGet(e) 與 doPost(e)。請回傳 JSON。

請支援以下 action：
1. verifyPassword
2. listProperties
3. createProperty
4. reviewProperty
5. seedDemoData
6. healthCheck

## verifyPassword
用途：驗證共用密碼。
前端送出：action = verifyPassword，password = 使用者輸入密碼。
Apps Script 檢查 Script Properties 裡面的 PASSWORD_HASH 或 SHARED_PASSWORD。
回傳成功：{ "success": true }
回傳失敗：{ "success": false, "message": "密碼錯誤" }

## listProperties
用途：取得所有物件資料。
前端送出：action = listProperties，password = 使用者輸入過的密碼或 session token。
回傳：{ "success": true, "data": [...] }

## createProperty
用途：新增物件。
前端送出：action = createProperty，password = 共用密碼，payload = 物件資料。
Apps Script 處理：驗證密碼、檢查必填欄位、產生 propertyId、寫入 Google Sheets、回傳新增成功。
propertyId 格式建議：ZQ-YYYYMMDD-流水號，例如 ZQ-20260616-001。

## reviewProperty
用途：主管審核物件。
前端送出：action = reviewProperty，password = 共用密碼，propertyId = 物件編號，reviewAction = approve / revise / reject / pause，supervisorNotes = 主管備註。
處理規則：approve 更新為已確認上架／已上架；revise 更新為資料需補正／資料需補正；reject 更新為未通過上架／已下架；pause 更新為暫停／暫停配案，並更新 updatedAt。

## seedDemoData
用途：建立測試資料。請提供 8 筆以上假資料，包含已上架、待主管確認、資料需補正、配案中、暫停配案、已出租、已下架。縣市需包含台中市、彰化縣、南投縣、嘉義市、新竹市。條件需包含可寵、不可寵、可談、有電梯、無電梯、有汽車車位、無汽車車位、可另租、可開伙、不可開伙。

請注意：seedDemoData 只能在設定階段使用。請在 SETUP.md 提醒使用後可關閉或不要公開使用。

## healthCheck
用途：確認 Apps Script 正常。
回傳：{ "success": true, "message": "中區房源快配站 API 正常" }

---

# 十、Apps Script 安全需求

請注意：
1. 不要把 Google Sheets ID 寫在前端
2. 不要把共用密碼寫在前端
3. Google Sheets ID 請放在 Apps Script 的 Script Properties
4. 共用密碼或密碼 hash 請放在 Apps Script 的 Script Properties
5. 前端只放 Apps Script Web App URL
6. 第一版共用密碼不是正式權限系統
7. 不可放房東個資、身分證、銀行帳戶、合約資料

Script Properties 建議欄位：SPREADSHEET_ID、SHARED_PASSWORD 或 PASSWORD_HASH、APP_NAME = 中區房源快配站。

---

# 十一、Apps Script 部署設定說明

請在 /apps-script/SETUP.md 寫清楚以下步驟：

1. 建立 Google Sheets
2. 建立工作表 Properties
3. 建立表頭
4. 建立 Apps Script 專案
5. 貼上 Code.gs
6. 設定 Script Properties：SPREADSHEET_ID、SHARED_PASSWORD 或 PASSWORD_HASH
7. 執行初始化函式
8. 部署為 Web App
9. Execute as：Me
10. Who has access：Anyone 或 Anyone with the link
11. 複製 Web App URL
12. 貼回前端 app.js 的 API_URL
13. 測試 healthCheck
14. 測試 verifyPassword
15. 測試 listProperties
16. 測試 createProperty
17. 測試 reviewProperty

請用非工程師也看得懂的中文寫法。

---

# 十二、前端設定

請在 app.js 上方建立設定區：
const API_URL = "請貼上 Apps Script Web App URL";

請讓 README.md 說明要如何替換 API_URL。

如果 API_URL 尚未設定，前端請顯示提醒：尚未設定 Apps Script API_URL，請先依照 README 完成部署設定。

---

# 十三、GitHub Pages 部署需求

請確保此專案可以直接用 GitHub Pages 部署。

請在 README.md 寫明：如何建立 GitHub Repository、如何上傳 index.html/styles.css/app.js、如何到 Settings > Pages 開啟 GitHub Pages、Source 選擇 main branch、Folder 選擇 root、如何取得 GitHub Pages 網址、如何測試手機版、如何更新版本。

請不要要求使用者安裝 Node.js。請不要要求 npm install。請不要使用需要 build 的工具。第一版就是純 HTML／CSS／JavaScript。

---

# 十四、UI 風格

請維持內部工具風格：簡潔清楚、手機好用、電腦也好看、狀態標籤明顯、查詢條件清楚、按鈕文字直覺、不要像大型房仲平台、不要過度動畫、不要使用太多外部套件。

建議主色：深藍、淺藍、白底、淺灰背景、狀態標籤用不同顏色區分。

狀態標籤：待主管確認灰色或黃色、資料需補正橘色、已上架綠色、配案中藍色、暫停配案紫色或灰色、已出租深色、已下架灰色。

---

# 十五、資料顯示規則

1. 租金請顯示千分位，例如 15000 顯示 15,000 元
2. 日期顯示 YYYY-MM-DD
3. 若選填欄位無資料，顯示「未填寫」
4. 列表頁不顯示完整地址與聯絡方式
5. 詳細頁才顯示完整地址、電話、LINE、內部備註
6. 首頁統計需依 Google Sheets 回傳資料計算

---

# 十六、錯誤處理

請處理以下情境：Apps Script URL 未設定、密碼錯誤、無法連線 Apps Script、Google Sheets 沒有資料、新增物件必填欄位未填、主管審核找不到 propertyId、Apps Script 回傳錯誤訊息。

錯誤訊息請用繁體中文。

---

# 十七、測試資料

請在 Apps Script 中提供 seedDemoData 函式，建立至少 8 筆假資料。假資料不要使用真實房東個資。

可以使用以下範例風格：北屯兩房車、南區電梯套房、草屯三房可寵、彰化市整理中兩房、嘉義市小家庭三房、新竹市套房、太平可開伙兩房、西屯近捷運一房。

原登錄業務可用測試姓名：黃岳澤、賴重丞、吳震、吳清蓮、童翊桓、蘇睿雅、蕭湘芩、葉孟德、王凱靖。

所屬營業處可使用：中一處、中二處、中三處、中四處、中五處、中六處、彰一處、嘉一處、竹一處。

電話請使用測試電話格式，不要用真實電話，例如 0900-000-001。

---

# 十八、版本說明

請在 README.md 標示版本：
中區房源快配站 v0.2｜GitHub Pages ＋ Google Sheets 測試版

版本定位：第一版上網測試、可多人共用同一份 Google Sheets 資料、使用共用密碼進入、不做每人帳號、不放敏感個資、非正式營運系統。

---

# 十九、完成後請回報

完成後請回報：
1. 你建立或修改了哪些檔案
2. GitHub Pages 要如何部署
3. Google Sheets 要如何建立
4. Apps Script 要如何部署
5. 前端 API_URL 要填在哪裡
6. 共用密碼要設定在哪裡
7. 如何建立測試資料
8. 如何測試新增物件
9. 如何測試主管審核
10. 目前哪些功能刻意先不做

---

# 二十、驗收標準

請確認以下項目都可以完成：

1. index.html 可直接在瀏覽器開啟
2. GitHub Pages 可部署
3. 手機版不爆版
4. 密碼驗證正常
5. 首頁統計可讀取 Google Sheets 資料
6. 物件列表可讀取 Google Sheets 資料
7. 物件列表可篩選
8. 可查看物件詳細頁
9. 新增物件可寫入 Google Sheets
10. 新增物件預設為「待主管確認」
11. 主管審核可更新 Google Sheets 狀態
12. 所有人重新整理後都看到同一份資料
13. 沒有把 Google Sheets ID 寫在前端
14. 沒有把共用密碼寫在前端
15. 沒有使用正式資料庫
16. 沒有新增不在需求內的功能

請先完成這個 v0.2 上網測試版。
