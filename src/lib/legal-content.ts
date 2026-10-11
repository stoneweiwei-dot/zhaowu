// GENERATED from the approved legal copy (zh-Hant + English; zh-Hans converted from zh-Hant).
// Legal pages: /privacy, /terms, /copyright. Review with a lawyer before relying on this text.
export type LegalLocale = "zh-Hant" | "zh-Hans" | "en";
export type LegalDocKey = "privacy" | "terms" | "copyright";
export type LegalSection = { h: string; p?: string[]; ul?: string[]; p2?: string[] };
export type LegalDoc = { kicker: string; title: string; lead: string; sections: LegalSection[] };

export const LEGAL_LAST_UPDATED = "2026-10-11";

export const LEGAL_DOCS: Record<LegalDocKey, Record<LegalLocale, LegalDoc>> = {
  "privacy": {
    "zh-Hant": {
      "kicker": "PRIVACY POLICY",
      "title": "隱私權政策",
      "lead": "昭梧以澳洲為營運基地，服務全球訪客。本政策說明我們收集哪些資料、為何收集、交給哪些第三方，以及你可以如何查閱、更正或刪除。我們以《1988 年澳洲隱私法》（Privacy Act 1988）的澳洲隱私原則（APPs）為處理標準，並為歐盟／英國及其他地區的訪客補充說明。",
      "sections": [
        {
          "h": "1. 我們收集哪些資料",
          "ul": [
            "你主動輸入的資料：出生日期、時間、出生地（城市）、你輸入的問題文字，以及你選擇的語言與顯示偏好。",
            "付款資料：付款由 Stripe 處理，我們不會接觸或保存你的信用卡號。我們只保存用來核對訂單的紀錄：Checkout 工作階段編號、購買項目、金額、幣別、付款狀態，以及一組隨機的瀏覽器存取金鑰（不含姓名或電郵）。",
            "自動收集的技術資料：IP 位址、瀏覽器與裝置類型、造訪頁面與時間（由託管服務的伺服器日誌產生）；用於不重複計算訪客數的隨機訪客編號。",
            "匿名品質統計：為檢查答案是否切題，網站會向統計服務 PostHog 傳送匿名事件（隨機工作階段編號、問題類型分類、處理時間、問題內容的雜湊指紋）。答案被判定為不合格時，會附上已遮蔽電郵、電話與日期、並截短至 180 字的問題摘要。我們關閉了 IP 地理定位，也不建立個別使用者檔案。",
            "存放在你瀏覽器的資料：語言、主題、你的生辰與已產生的報告、付款存取金鑰。這些資料保存在你的裝置（localStorage／sessionStorage），清除瀏覽器資料即可刪除。"
          ]
        },
        {
          "h": "2. 我們如何使用資料",
          "ul": [
            "排盤、產生解讀與報告，並回覆你的提問。",
            "驗證付款、開通與還原你已購買的報告權限。",
            "防止濫用（例如以 IP 的加鹽雜湊限制每日提問次數）、維持網站安全與穩定。",
            "以匿名、彙總的方式改善答案品質與網站體驗。",
            "遵守法律義務（例如稅務與會計紀錄）。"
          ]
        },
        {
          "h": "3. 你的出生資料與提問存放在哪裡",
          "p": [
            "預設情況下，排盤與報告在你的瀏覽器內計算與保存，我們不要求你註冊帳號。",
            "在下列情況，你的提問文字或報告紀錄可能離開你的裝置：(a) 啟用 AI 文字增強時，你的問題與排盤摘要會傳送給 OpenAI 以改寫答案；(b) 付費或圖像類服務產生報告紀錄時，紀錄可能保存在我們的雲端資料庫（Supabase），僅網站管理者可存取；(c) 你主動使用分享、下載功能。",
            "請避免在提問中填寫身分證號、住址、電話、病歷或其他不必要的敏感資料。若你輸入他人的出生資料，請先取得對方同意。"
          ]
        },
        {
          "h": "4. 我們與哪些第三方分享資料（含境外）",
          "p": [
            "為提供服務，資料會交由下列服務商處理，其伺服器可能位於澳洲境外（主要為美國）。依 APP 8，我們會採取合理措施，確保服務商以與澳洲隱私原則相當的標準保護資料；對歐盟／英國訪客，跨境傳輸依服務商提供的標準契約條款（SCCs）或同等機制進行。"
          ],
          "ul": [
            "Vercel：網站託管、邊緣網路與伺服器日誌。",
            "Supabase：資料庫、儲存空間與後端函式。",
            "Stripe：付款處理與詐欺防範（Stripe 為獨立的資料控制者，適用其隱私政策）。",
            "PostHog（美國區）：匿名答案品質統計。",
            "OpenAI：僅在啟用 AI 文字增強時，處理你的問題與排盤摘要。",
            "Google Fonts：載入網頁字型時，你的 IP 位址會被 Google 接收。"
          ],
          "p2": [
            "我們不出售你的個人資料，不做跨網站的廣告追蹤，也不使用廣告像素。"
          ]
        },
        {
          "h": "5. Cookie 與本機儲存",
          "p": [
            "我們不使用廣告或跨網站追蹤 Cookie。網站使用瀏覽器的 localStorage／sessionStorage 保存語言、主題、報告、付款存取金鑰與訪客編號，屬於提供服務所必需的功能性儲存。匿名品質統計不寫入識別性 Cookie。你可隨時在瀏覽器設定中清除這些資料，但已儲存的報告與購買權限可能因此需要重新驗證。"
          ]
        },
        {
          "h": "6. 保存期限",
          "ul": [
            "留在你瀏覽器的資料：由你控制，清除即刪除。",
            "訂單核驗紀錄：依澳洲稅務與會計要求保存（一般為 5 年），之後刪除或去識別化。",
            "伺服器日誌與匿名統計：僅保存合理必要的期間，之後刪除或彙總。"
          ]
        },
        {
          "h": "7. 資料安全與外洩通報",
          "p": [
            "我們採取合理的技術與管理措施保護資料，包括傳輸加密、存取控制與最小權限。沒有任何網路服務能保證絕對安全。若發生可能對你造成嚴重傷害的資料外洩，我們會依澳洲「應通報資料外洩」（NDB）機制及適用的當地法律通知你與主管機關。"
          ]
        },
        {
          "h": "8. 你的權利",
          "ul": [
            "澳洲：你可請求查閱及更正我們持有的、與你有關的個人資料（APP 12、13），並可就我們的處理方式投訴；若不滿意我們的回覆，可向澳洲資訊專員辦公室（OAIC，oaic.gov.au）申訴。",
            "歐盟／英國（GDPR／UK GDPR）：你有權查閱、更正、刪除、限制處理、資料可攜、反對處理，以及撤回同意，並可向當地監管機關投訴。我們處理資料的法律依據為：履行與你的服務契約、我們的正當利益（安全、防濫用、匿名統計），以及法律義務。",
            "美國加州等州：我們不出售或為跨情境廣告而分享個人資料；你可請求了解、刪除或更正我們持有的資料，且不會因行使權利而受到差別待遇。",
            "其他地區：我們會在適用法律要求的範圍內尊重你的權利。",
            "行使權利時請透過本頁底部的聯絡方式提出。我們可能需要核實你的身分，並會在合理期間內（一般 30 天內）回覆。"
          ]
        },
        {
          "h": "9. 兒童",
          "p": [
            "本服務並非針對 16 歲以下兒童設計。未滿 16 歲者請在家長或監護人同意與陪同下使用；我們不會刻意收集兒童的個人資料。若你認為我們收集了兒童的資料，請聯絡我們刪除。"
          ]
        },
        {
          "h": "10. 內容性質提醒",
          "p": [
            "命理與星象內容屬傳統文化與自我反思工具，不構成醫療、法律、財務、心理健康或其他專業意見。詳見《服務條款》。"
          ]
        },
        {
          "h": "11. 政策變更",
          "p": [
            "我們可能不時更新本政策；重大變更會在本頁標示新的更新日期。繼續使用網站即表示你接受更新後的版本。"
          ]
        }
      ]
    },
    "zh-Hans": {
      "kicker": "PRIVACY POLICY",
      "title": "隐私权政策",
      "lead": "昭梧以澳洲为营运基地，服务全球访客。本政策说明我们收集哪些数据、为何收集、交给哪些第三方，以及你可以如何查阅、更正或删除。我们以《1988 年澳洲隐私法》（Privacy Act 1988）的澳洲隐私原则（APPs）为处理标准，并为欧盟／英国及其他地区的访客补充说明。",
      "sections": [
        {
          "h": "1. 我们收集哪些数据",
          "ul": [
            "你主动输入的数据：出生日期、时间、出生地（城市）、你输入的问题文本，以及你选择的语言与显示偏好。",
            "付款数据：付款由 Stripe 处理，我们不会接触或保存你的信用卡号。我们只保存用来核对订单的纪录：Checkout 工作阶段编号、购买项目、金额、币别、付款状态，以及一组随机的浏览器访问密钥（不含姓名或电邮）。",
            "自动收集的技术数据：IP 地址、浏览器与设备类型、造访页面与时间（由托管服务的服务器日志产生）；用于不重复计算访客数的随机访客编号。",
            "匿名品质统计：为检查答案是否切题，网站会向统计服务 PostHog 发送匿名事件（随机工作阶段编号、问题类型分类、处理时间、问题内容的哈希指纹）。答案被判定为不合格时，会附上已屏蔽电邮、电话与日期、并截短至 180 字的问题摘要。我们关闭了 IP 地理定位，也不创建个别用户文件。",
            "存放在你浏览器的数据：语言、主题、你的生辰与已产生的报告、付款访问密钥。这些数据保存在你的设备（localStorage／sessionStorage），清除浏览器数据即可删除。"
          ]
        },
        {
          "h": "2. 我们如何使用数据",
          "ul": [
            "排盘、产生解读与报告，并回复你的提问。",
            "验证付款、开通与还原你已购买的报告权限。",
            "防止滥用（例如以 IP 的加盐哈希限制每日提问次数）、维持网站安全与稳定。",
            "以匿名、汇总的方式改善答案品质与网站体验。",
            "遵守法律义务（例如税务与会计纪录）。"
          ]
        },
        {
          "h": "3. 你的出生数据与提问存放在哪里",
          "p": [
            "缺省情况下，排盘与报告在你的浏览器内计算与保存，我们不要求你注册帐号。",
            "在下列情况，你的提问文本或报告纪录可能离开你的设备：(a) 激活 AI 文本增强时，你的问题与排盘摘要会发送给 OpenAI 以改写答案；(b) 付费或图像类服务产生报告纪录时，纪录可能保存在我们的云端数据库（Supabase），仅网站管理者可访问；(c) 你主动使用分享、下载功能。",
            "请避免在提问中填写身分证号、住址、电话、病历或其他不必要的敏感数据。若你输入他人的出生数据，请先取得对方同意。"
          ]
        },
        {
          "h": "4. 我们与哪些第三方分享数据（含境外）",
          "p": [
            "为提供服务，数据会交由下列服务商处理，其服务器可能位于澳洲境外（主要为美国）。依 APP 8，我们会采取合理措施，确保服务商以与澳洲隐私原则相当的标准保护数据；对欧盟／英国访客，跨境传输依服务商提供的标准契约条款（SCCs）或同等机制进行。"
          ],
          "ul": [
            "Vercel：网站托管、边缘网络与服务器日志。",
            "Supabase：数据库、保存空间与后端函数。",
            "Stripe：付款处理与诈欺防范（Stripe 为独立的数据控制者，适用其隐私政策）。",
            "PostHog（美国区）：匿名答案品质统计。",
            "OpenAI：仅在激活 AI 文本增强时，处理你的问题与排盘摘要。",
            "Google Fonts：加载网页字体时，你的 IP 地址会被 Google 接收。"
          ],
          "p2": [
            "我们不出售你的个人数据，不做跨网站的广告追踪，也不使用广告像素。"
          ]
        },
        {
          "h": "5. Cookie 与本机保存",
          "p": [
            "我们不使用广告或跨网站追踪 Cookie。网站使用浏览器的 localStorage／sessionStorage 保存语言、主题、报告、付款访问密钥与访客编号，属于提供服务所必需的功能性保存。匿名品质统计不写入识别性 Cookie。你可随时在浏览器设置中清除这些数据，但已保存的报告与购买权限可能因此需要重新验证。"
          ]
        },
        {
          "h": "6. 保存期限",
          "ul": [
            "留在你浏览器的数据：由你控制，清除即删除。",
            "订单核验纪录：依澳洲税务与会计要求保存（一般为 5 年），之后删除或去识别化。",
            "服务器日志与匿名统计：仅保存合理必要的期间，之后删除或汇总。"
          ]
        },
        {
          "h": "7. 数据安全与外泄通报",
          "p": [
            "我们采取合理的技术与管理措施保护数据，包括传输加密、访问控制与最小权限。没有任何网络服务能保证绝对安全。若发生可能对你造成严重伤害的数据外泄，我们会依澳洲「应通报数据外泄」（NDB）机制及适用的当地法律通知你与主管机关。"
          ]
        },
        {
          "h": "8. 你的权利",
          "ul": [
            "澳洲：你可请求查阅及更正我们持有的、与你有关的个人数据（APP 12、13），并可就我们的处理方式投诉；若不满意我们的回复，可向澳洲信息专员办公室（OAIC，oaic.gov.au）申诉。",
            "欧盟／英国（GDPR／UK GDPR）：你有权查阅、更正、删除、限制处理、数据可携、反对处理，以及撤回同意，并可向当地监管机关投诉。我们处理数据的法律依据为：履行与你的服务契约、我们的正当利益（安全、防滥用、匿名统计），以及法律义务。",
            "美国加州等州：我们不出售或为跨情境广告而分享个人数据；你可请求了解、删除或更正我们持有的数据，且不会因行使权利而受到差别待遇。",
            "其他地区：我们会在适用法律要求的范围内尊重你的权利。",
            "行使权利时请通过本页底部的联系方式提出。我们可能需要核实你的身分，并会在合理期间内（一般 30 天内）回复。"
          ]
        },
        {
          "h": "9. 儿童",
          "p": [
            "本服务并非针对 16 岁以下儿童设计。未满 16 岁者请在家长或监护人同意与陪同下使用；我们不会刻意收集儿童的个人数据。若你认为我们收集了儿童的数据，请联系我们删除。"
          ]
        },
        {
          "h": "10. 内容性质提醒",
          "p": [
            "命理与星象内容属传统文化与自我反思工具，不构成医疗、法律、财务、心理健康或其他专业意见。详见《服务条款》。"
          ]
        },
        {
          "h": "11. 政策变更",
          "p": [
            "我们可能不时更新本政策；重大变更会在本页标示新的更新日期。继续使用网站即表示你接受更新后的版本。"
          ]
        }
      ]
    },
    "en": {
      "kicker": "PRIVACY POLICY",
      "title": "Privacy Policy",
      "lead": "ZHAOWU (昭梧) operates from Australia and serves visitors worldwide. This policy explains what we collect, why, who we share it with, and how you can access, correct or delete it. We handle personal information in line with the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth), and add notes for visitors in the EU/UK and other regions.",
      "sections": [
        {
          "h": "1. What we collect",
          "ul": [
            "Information you enter: date, time and place of birth, the question you type, and your language and display preferences.",
            "Payment information: payments are handled by Stripe. We never see or store your card number. We keep only the records needed to verify an order: the Checkout session ID, product, amount, currency, payment status, and a random browser access key (no name or email).",
            "Technical data collected automatically: IP address, browser and device type, pages visited and timestamps (from hosting-provider server logs), and a random visitor ID used to avoid double-counting visits.",
            "Anonymous quality analytics: to check whether answers are on topic, the site sends anonymous events to PostHog (a random session ID, question category, processing time and a hashed fingerprint of the question). When an answer is judged unsatisfactory, a short summary of the question (emails, phone numbers and dates masked, truncated to 180 characters) is attached. IP geolocation is disabled and no individual user profiles are created.",
            "Data kept in your browser: language, theme, your birth details and generated reports, and your payment access key. These stay on your device (localStorage/sessionStorage) and are removed when you clear your browser data."
          ]
        },
        {
          "h": "2. How we use it",
          "ul": [
            "To calculate charts, generate readings and reports, and answer your questions.",
            "To verify payments and unlock or restore the reports you bought.",
            "To prevent abuse (for example, limiting daily questions using a salted hash of your IP address) and keep the site secure and stable.",
            "To improve answer quality and the site experience using anonymous, aggregated data.",
            "To meet legal obligations such as tax and accounting records."
          ]
        },
        {
          "h": "3. Where your birth details and questions go",
          "p": [
            "By default, charts and reports are calculated and stored in your own browser, and no account is required.",
            "Your question text or report record may leave your device in these cases: (a) when AI text enhancement is switched on, your question and a chart summary are sent to OpenAI to rewrite the answer; (b) when a paid or image-based service creates a report record, it may be stored in our cloud database (Supabase), accessible only to the site administrator; (c) when you choose to share or download something.",
            "Please avoid entering ID numbers, home addresses, phone numbers, medical records or other unnecessary sensitive details in your question. If you enter someone else's birth details, make sure you have their permission."
          ]
        },
        {
          "h": "4. Who we share it with (including overseas)",
          "p": [
            "To run the service we use the providers below. Their servers may be outside Australia (mainly the United States). Under APP 8 we take reasonable steps to make sure they protect personal information to a standard comparable to the APPs. For EU/UK visitors, transfers rely on the providers' Standard Contractual Clauses (SCCs) or an equivalent mechanism."
          ],
          "ul": [
            "Vercel: hosting, edge network and server logs.",
            "Supabase: database, storage and backend functions.",
            "Stripe: payment processing and fraud prevention (Stripe is an independent controller and its own privacy policy applies).",
            "PostHog (US region): anonymous answer-quality analytics.",
            "OpenAI: only when AI text enhancement is on, to process your question and chart summary.",
            "Google Fonts: your IP address is received by Google when web fonts load."
          ],
          "p2": [
            "We do not sell your personal information, do not run cross-site advertising tracking, and do not use advertising pixels."
          ]
        },
        {
          "h": "5. Cookies and local storage",
          "p": [
            "We do not use advertising or cross-site tracking cookies. The site uses your browser's localStorage/sessionStorage to keep your language, theme, reports, payment access key and visitor ID. This is functional storage needed to deliver the service. Anonymous quality analytics do not set identifying cookies. You can clear this data in your browser settings at any time, but saved reports and purchase access may then need to be re-verified."
          ]
        },
        {
          "h": "6. How long we keep it",
          "ul": [
            "Data in your browser: under your control; clearing it deletes it.",
            "Order verification records: kept for the period required by Australian tax and accounting rules (generally 5 years), then deleted or de-identified.",
            "Server logs and anonymous analytics: kept only as long as reasonably necessary, then deleted or aggregated."
          ]
        },
        {
          "h": "7. Security and breach notification",
          "p": [
            "We use reasonable technical and organisational measures, including encryption in transit, access controls and least privilege. No online service can guarantee absolute security. If a data breach is likely to cause you serious harm, we will notify you and the relevant regulator under Australia's Notifiable Data Breaches scheme and any applicable local law."
          ]
        },
        {
          "h": "8. Your rights",
          "ul": [
            "Australia: you may ask to access and correct personal information we hold about you (APPs 12 and 13) and may complain about how we handle it. If you are unhappy with our response, you can contact the Office of the Australian Information Commissioner (OAIC, oaic.gov.au).",
            "EU/UK (GDPR/UK GDPR): you have the right to access, rectify, erase, restrict, port and object, to withdraw consent, and to lodge a complaint with your local supervisory authority. Our legal bases are performance of our contract with you, our legitimate interests (security, abuse prevention, anonymous analytics) and legal obligations.",
            "California and other US states: we do not sell personal information or share it for cross-context advertising. You may ask to know, delete or correct information we hold, and we will not discriminate against you for doing so.",
            "Elsewhere: we will respect your rights to the extent required by applicable law.",
            "To exercise a right, use the contact details at the bottom of this page. We may need to verify your identity and will respond within a reasonable time (generally within 30 days)."
          ]
        },
        {
          "h": "9. Children",
          "p": [
            "The service is not designed for children under 16. Anyone under 16 should use it with a parent or guardian's consent and supervision. We do not knowingly collect children's personal information; if you believe we have, contact us and we will delete it."
          ]
        },
        {
          "h": "10. Nature of the content",
          "p": [
            "Chinese metaphysics and astrology content is a traditional-culture and self-reflection tool. It is not medical, legal, financial, mental-health or other professional advice. See the Terms of Service."
          ]
        },
        {
          "h": "11. Changes to this policy",
          "p": [
            "We may update this policy from time to time. Material changes will be shown by a new 'last updated' date on this page. Continuing to use the site means you accept the updated version."
          ]
        }
      ]
    }
  },
  "terms": {
    "zh-Hant": {
      "kicker": "TERMS OF SERVICE",
      "title": "服務條款",
      "lead": "使用昭梧網站與服務，即表示你同意以下條款。若你不同意，請停止使用。",
      "sections": [
        {
          "h": "1. 服務內容與性質",
          "p": [
            "昭梧提供八字、紫微、七政、西占、印度古法、一掌經、生命靈數等傳統命理與星象的排盤、解讀與報告。內容屬傳統文化、娛樂與自我反思工具，只呈現傳統象義與可能性，不是對未來的保證，也不是科學上已被驗證的預測。"
          ]
        },
        {
          "h": "2. 非專業意見",
          "p": [
            "本站內容（包括身體、健康、感情、投資、事業、法律、移民與生育等題材的敘述）不構成醫療診斷、治療建議、法律意見、財務或投資建議、心理健康治療或其他專業意見。重要決定請諮詢合資格的專業人士。若你正處於危機或需要緊急協助，請立即聯絡當地緊急服務或專業機構。你需自行為依據本站內容所做的決定與行動負責。"
          ]
        },
        {
          "h": "3. 資格與你的責任",
          "ul": [
            "你須年滿 18 歲才能購買付費內容；未成年人須在家長或監護人同意下使用。",
            "請提供真實、你有權使用的出生資料。輸入他人資料前，須取得對方同意。",
            "不得以違法、騷擾、欺詐或侵害他人權利的方式使用本站。",
            "不得以機器人、爬蟲或其他自動化方式大量存取、複製本站內容，或繞過付款與使用限制。"
          ]
        },
        {
          "h": "4. 付款、交付與退款",
          "ul": [
            "付費報告以美元（USD）標價，由 Stripe 處理付款，不自動續費、非訂閱制。實際扣款金額與匯率、銀行手續費以你的付款方式為準。",
            "報告為數位內容，付款成功後即時於你購買時所用的瀏覽器開通。請保留購買時的瀏覽器與存取金鑰；清除瀏覽器資料可能令你需要聯絡我們還原權限。",
            "若你已付款但因技術故障而無法取得報告，請聯絡我們，我們會還原權限或退款。",
            "本條款不排除、限制或修改你依《澳洲消費者法》（Australian Consumer Law）或你所在地強制性消費者法律享有的任何權利，包括服務未達合理品質、不符合描述或出現重大問題時的救濟。"
          ]
        },
        {
          "h": "5. 智慧財產權",
          "p": [
            "網站內容、版面設計、插圖、音樂、程式碼與報告敘事的著作權屬昭梧所有，詳見《版權聲明》。你購買的個人化報告，授權你本人作個人、非商業用途。"
          ]
        },
        {
          "h": "6. 第三方服務與連結",
          "p": [
            "本站使用 Stripe、Vercel、Supabase 等第三方服務，並可能連結至外部網站。我們對第三方的內容與做法不負責，其使用受其自身條款與隱私政策約束。"
          ]
        },
        {
          "h": "7. 服務可用性與變更",
          "p": [
            "我們努力維持服務穩定，但不保證不中斷或無錯誤。我們可隨時修改、暫停或終止部分功能與內容，並在合理範圍內保留你已購買的權限。"
          ]
        },
        {
          "h": "8. 免責與責任限制",
          "p": [
            "在法律允許的最大範圍內，本站內容以「現狀」提供，我們不對因使用或無法使用本站而引起的間接、附帶或衍生損失負責，亦不對你依據本站內容所作決定的後果負責。對於法律不允許排除的責任（包括消費者法下不可排除的保證），我們的責任限於法律允許的範圍，且在可行時限於重新提供服務或退還你就該服務支付的費用。"
          ]
        },
        {
          "h": "9. 適用法律與爭議",
          "p": [
            "本條款受澳洲法律管轄。因本條款或服務產生的爭議，雙方應先善意協商；協商不成的，提交澳洲有管轄權的法院處理。這不影響你所在地強制性消費者保護法律賦予你的權利。"
          ]
        },
        {
          "h": "10. 條款變更",
          "p": [
            "我們可能更新本條款，並在本頁標示更新日期。繼續使用即表示你接受更新後的條款。"
          ]
        }
      ]
    },
    "zh-Hans": {
      "kicker": "TERMS OF SERVICE",
      "title": "服务条款",
      "lead": "使用昭梧网站与服务，即表示你同意以下条款。若你不同意，请停止使用。",
      "sections": [
        {
          "h": "1. 服务内容与性质",
          "p": [
            "昭梧提供八字、紫微、七政、西占、印度古法、一掌经、生命灵数等传统命理与星象的排盘、解读与报告。内容属传统文化、娱乐与自我反思工具，只呈现传统象义与可能性，不是对未来的保证，也不是科学上已被验证的预测。"
          ]
        },
        {
          "h": "2. 非专业意见",
          "p": [
            "本站内容（包括身体、健康、感情、投资、事业、法律、移民与生育等题材的叙述）不构成医疗诊断、治疗建议、法律意见、财务或投资建议、心理健康治疗或其他专业意见。重要决定请咨询合资格的专业人士。若你正处于危机或需要紧急协助，请立即联系当地紧急服务或专业机构。你需自行为依据本站内容所做的决定与行动负责。"
          ]
        },
        {
          "h": "3. 资格与你的责任",
          "ul": [
            "你须年满 18 岁才能购买付费内容；未成年人须在家长或监护人同意下使用。",
            "请提供真实、你有权使用的出生数据。输入他人数据前，须取得对方同意。",
            "不得以违法、骚扰、欺诈或侵害他人权利的方式使用本站。",
            "不得以机器人、爬虫或其他自动化方式大量访问、拷贝本站内容，或绕过付款与使用限制。"
          ]
        },
        {
          "h": "4. 付款、交付与退款",
          "ul": [
            "付费报告以美元（USD）标价，由 Stripe 处理付款，不自动续费、非订阅制。实际扣款金额与汇率、银行手续费以你的付款方式为准。",
            "报告为数字内容，付款成功后即时于你购买时所用的浏览器开通。请保留购买时的浏览器与访问密钥；清除浏览器数据可能令你需要联系我们还原权限。",
            "若你已付款但因技术故障而无法取得报告，请联系我们，我们会还原权限或退款。",
            "本条款不排除、限制或修改你依《澳洲消费者法》（Australian Consumer Law）或你所在地强制性消费者法律享有的任何权利，包括服务未达合理品质、不符合描述或出现重大问题时的救济。"
          ]
        },
        {
          "h": "5. 知识产权",
          "p": [
            "网站内容、版面设计、插图、音乐、代码与报告叙事的著作权属昭梧所有，详见《版权声明》。你购买的个人化报告，授权你本人作个人、非商业用途。"
          ]
        },
        {
          "h": "6. 第三方服务与链接",
          "p": [
            "本站使用 Stripe、Vercel、Supabase 等第三方服务，并可能链接至外部网站。我们对第三方的内容与做法不负责，其使用受其自身条款与隐私政策约束。"
          ]
        },
        {
          "h": "7. 服务可用性与变更",
          "p": [
            "我们努力维持服务稳定，但不保证不中断或无错误。我们可随时修改、暂停或终止部分功能与内容，并在合理范围内保留你已购买的权限。"
          ]
        },
        {
          "h": "8. 免责与责任限制",
          "p": [
            "在法律允许的最大范围内，本站内容以「现状」提供，我们不对因使用或无法使用本站而引起的间接、附带或衍生损失负责，亦不对你依据本站内容所作决定的后果负责。对于法律不允许排除的责任（包括消费者法下不可排除的保证），我们的责任限于法律允许的范围，且在可行时限于重新提供服务或退还你就该服务支付的费用。"
          ]
        },
        {
          "h": "9. 适用法律与争议",
          "p": [
            "本条款受澳洲法律管辖。因本条款或服务产生的争议，双方应先善意协商；协商不成的，提交澳洲有管辖权的法院处理。这不影响你所在地强制性消费者保护法律赋予你的权利。"
          ]
        },
        {
          "h": "10. 条款变更",
          "p": [
            "我们可能更新本条款，并在本页标示更新日期。继续使用即表示你接受更新后的条款。"
          ]
        }
      ]
    },
    "en": {
      "kicker": "TERMS OF SERVICE",
      "title": "Terms of Service",
      "lead": "By using the ZHAOWU (昭梧) website and services you agree to these terms. If you do not agree, please stop using the service.",
      "sections": [
        {
          "h": "1. What the service is",
          "p": [
            "ZHAOWU provides charts, readings and reports based on traditional Chinese metaphysics and astrology, including BaZi, Zi Wei Dou Shu, Qi Zheng, Western astrology, Indian astrology, palmistry (Yi Zhang Jing) and numerology. The content is a traditional-culture, entertainment and self-reflection tool. It describes traditional symbolism and possibilities; it is not a guarantee of the future and not a scientifically validated prediction."
          ]
        },
        {
          "h": "2. Not professional advice",
          "p": [
            "Nothing on the site, including text about the body, health, relationships, investment, career, law, migration or fertility, is medical diagnosis, treatment advice, legal advice, financial or investment advice, mental-health care or any other professional advice. Please consult a qualified professional for important decisions. If you are in crisis or need urgent help, contact local emergency services or a professional organisation immediately. You are responsible for decisions and actions you take based on the content."
          ]
        },
        {
          "h": "3. Eligibility and your responsibilities",
          "ul": [
            "You must be 18 or over to buy paid content; minors must have a parent or guardian's consent.",
            "Provide accurate birth details that you are entitled to use. Get the person's permission before entering anyone else's details.",
            "Do not use the site unlawfully, to harass or defraud, or to infringe anyone's rights.",
            "Do not use bots, scrapers or other automation to access or copy site content at scale, or to bypass payment and usage limits."
          ]
        },
        {
          "h": "4. Payment, delivery and refunds",
          "ul": [
            "Paid reports are priced in US dollars (USD) and paid through Stripe. There is no subscription and no automatic renewal. The amount actually charged, exchange rate and bank fees depend on your payment method.",
            "Reports are digital content and are unlocked in the browser you used to buy them as soon as payment succeeds. Keep that browser and your access key; clearing browser data may mean you need to contact us to restore access.",
            "If you paid but cannot receive your report because of a technical fault, contact us and we will restore access or refund you.",
            "Nothing in these terms excludes, restricts or modifies any right you have under the Australian Consumer Law or mandatory consumer law where you live, including remedies if a service is not of acceptable quality, does not match its description or has a major problem."
          ]
        },
        {
          "h": "5. Intellectual property",
          "p": [
            "Copyright in the site content, layout, illustrations, music, code and report narrative belongs to ZHAOWU. See the Copyright Notice. A personalised report you buy is licensed to you for personal, non-commercial use."
          ]
        },
        {
          "h": "6. Third-party services and links",
          "p": [
            "The site uses third-party services such as Stripe, Vercel and Supabase and may link to external sites. We are not responsible for third-party content or practices; their own terms and privacy policies apply."
          ]
        },
        {
          "h": "7. Availability and changes",
          "p": [
            "We work to keep the service stable but do not promise it will be uninterrupted or error-free. We may change, suspend or retire features and content at any time, and will honour access you have already purchased where reasonably possible."
          ]
        },
        {
          "h": "8. Disclaimer and limit of liability",
          "p": [
            "To the maximum extent permitted by law, the content is provided 'as is', and we are not liable for indirect, incidental or consequential loss arising from use of, or inability to use, the site, or for the consequences of decisions you make based on its content. Where liability cannot be excluded (including consumer guarantees that cannot be excluded), our liability is limited to the extent the law allows and, where permitted, to re-supplying the service or refunding the amount you paid for it."
          ]
        },
        {
          "h": "9. Governing law and disputes",
          "p": [
            "These terms are governed by the laws of Australia. The parties will first try to resolve any dispute in good faith; failing that, it will be dealt with by the courts of Australia with jurisdiction. This does not affect rights given to you by mandatory consumer protection laws where you live."
          ]
        },
        {
          "h": "10. Changes to these terms",
          "p": [
            "We may update these terms and will show the update date on this page. Continuing to use the service means you accept the updated terms."
          ]
        }
      ]
    }
  },
  "copyright": {
    "zh-Hant": {
      "kicker": "COPYRIGHT NOTICE",
      "title": "版權聲明",
      "lead": "© 2026 昭梧 ZHAOWU。保留所有權利。本站原創內容自創作完成時起即受澳洲《1968 年版權法》（Copyright Act 1968）保護，並依《伯恩公約》等國際條約在大多數國家同樣受到保護，無須另行註冊。",
      "sections": [
        {
          "h": "1. 受保護的內容",
          "ul": [
            "網站文字、文章、教學與報告敘事模板；",
            "版面設計、介面、圖示、插圖、圖像與動畫；",
            "音樂與音訊、影片；",
            "網站程式碼、資料整理與編排方式；",
            "「昭梧」「ZHAOWU」名稱與標識（作為商業識別使用）。"
          ],
          "p2": [
            "傳統命理方法（如干支、紫微、星曆等）本身屬公共知識，我們主張的是自己的表達、編排與創作，而非這些傳統方法本身。"
          ]
        },
        {
          "h": "2. 你可以做什麼",
          "ul": [
            "為個人、非商業目的閱讀、儲存與列印你自己的報告。",
            "透過站內分享功能，分享你自己的命象分享圖，並保留昭梧標識。",
            "在評論、報導、教學或研究等法律允許的情形下，合理引用少量內容，並註明來源與連結。"
          ]
        },
        {
          "h": "3. 未經書面許可，你不可以",
          "ul": [
            "複製、轉載、改編、翻譯、出版或公開傳播本站內容或圖像，無論是否營利；",
            "出售、轉售、出租或再授權報告與內容，或將其作為你自己的服務、產品或課程的一部分；",
            "以爬蟲或自動化方式大量擷取本站內容；將本站內容用於訓練、微調或建立人工智慧模型或資料集；",
            "移除、遮蓋或竄改版權標示、水印與識別資訊；",
            "仿冒本站名稱、標識或介面，使人誤以為與本站有關。"
          ]
        },
        {
          "h": "4. 第三方材料",
          "p": [
            "本站使用部分開源軟體與開放授權字體（例如 Noto 系列與 LXGW WenKai 字體、lamejs、Placidus 宮位演算法改作），其著作權屬各自權利人並依其授權條款使用，詳見專案內的第三方聲明（THIRD-PARTY-NOTICES）。部分圖像與文字可能在人工智慧輔助下製作，並經人工挑選與編輯。"
          ]
        },
        {
          "h": "5. 授權請求",
          "p": [
            "如需轉載、合作或商業授權，請透過本頁底部的聯絡方式與我們聯絡，說明用途、範圍與期限。"
          ]
        },
        {
          "h": "6. 侵權通知",
          "p": [
            "如果你認為本站侵害了你的著作權，或發現有人未經許可使用本站內容，請寄送通知並提供：(1) 被侵權作品的描述；(2) 涉嫌侵權內容的網址；(3) 你的姓名與聯絡方式；(4) 你善意相信該使用未獲授權的聲明；(5) 你聲明通知內容準確，且你是權利人或獲授權代表。我們會在合理時間內審核並處理，包括移除或停止使用有爭議的內容。"
          ]
        }
      ]
    },
    "zh-Hans": {
      "kicker": "COPYRIGHT NOTICE",
      "title": "版权声明",
      "lead": "© 2026 昭梧 ZHAOWU。保留所有权利。本站原创内容自创作完成时起即受澳洲《1968 年版权法》（Copyright Act 1968）保护，并依《伯恩公约》等国际条约在大多数国家同样受到保护，无须另行注册。",
      "sections": [
        {
          "h": "1. 受保护的内容",
          "ul": [
            "网站文本、文章、教学与报告叙事模板；",
            "版面设计、接口、图标、插图、图像与动画；",
            "音乐与音频、视频；",
            "网站代码、数据整理与编排方式；",
            "「昭梧」「ZHAOWU」名称与标识（作为商业识别使用）。"
          ],
          "p2": [
            "传统命理方法（如干支、紫微、星历等）本身属公共知识，我们主张的是自己的表达、编排与创作，而非这些传统方法本身。"
          ]
        },
        {
          "h": "2. 你可以做什么",
          "ul": [
            "为个人、非商业目的阅读、保存与打印你自己的报告。",
            "通过站内分享功能，分享你自己的命象分享图，并保留昭梧标识。",
            "在评论、报导、教学或研究等法律允许的情形下，合理引用少量内容，并注明来源与链接。"
          ]
        },
        {
          "h": "3. 未经书面许可，你不可以",
          "ul": [
            "拷贝、转载、改编、翻译、出版或公开传播本站内容或图像，无论是否营利；",
            "出售、转售、出租或再授权报告与内容，或将其作为你自己的服务、产品或课程的一部分；",
            "以爬虫或自动化方式大量截取本站内容；将本站内容用于训练、微调或创建人工智能模型或数据集；",
            "移除、遮盖或窜改版权标示、水印与识别信息；",
            "仿冒本站名称、标识或接口，使人误以为与本站有关。"
          ]
        },
        {
          "h": "4. 第三方材料",
          "p": [
            "本站使用部分开源软件与开放授权字体（例如 Noto 系列与 LXGW WenKai 字体、lamejs、Placidus 宫位算法改作），其著作权属各自权利人并依其授权条款使用，详见项目内的第三方声明（THIRD-PARTY-NOTICES）。部分图像与文本可能在人工智能辅助下制作，并经人工挑选与编辑。"
          ]
        },
        {
          "h": "5. 授权请求",
          "p": [
            "如需转载、合作或商业授权，请通过本页底部的联系方式与我们联系，说明用途、范围与期限。"
          ]
        },
        {
          "h": "6. 侵权通知",
          "p": [
            "如果你认为本站侵害了你的著作权，或发现有人未经许可使用本站内容，请寄送通知并提供：(1) 被侵权作品的描述；(2) 涉嫌侵权内容的网址；(3) 你的姓名与联系方式；(4) 你善意相信该使用未获授权的声明；(5) 你声明通知内容准确，且你是权利人或获授权代表。我们会在合理时间内审核并处理，包括移除或停止使用有争议的内容。"
          ]
        }
      ]
    },
    "en": {
      "kicker": "COPYRIGHT NOTICE",
      "title": "Copyright Notice",
      "lead": "© 2026 ZHAOWU (昭梧). All rights reserved. Original content on this site is protected from the moment it is created under Australia's Copyright Act 1968, and, through the Berne Convention and other treaties, in most countries worldwide. No registration is required.",
      "sections": [
        {
          "h": "1. What is protected",
          "ul": [
            "Site text, articles, teaching material and report narrative templates;",
            "Layout, interface, icons, illustrations, images and animation;",
            "Music, audio and video;",
            "Site source code and the way data is selected and arranged;",
            "The names 'ZHAOWU' and '昭梧' and our marks, as used to identify our business."
          ],
          "p2": [
            "Traditional methods themselves (stems and branches, Zi Wei, ephemeris data and so on) are shared cultural knowledge. We claim our own expression, arrangement and creative work, not the traditional methods."
          ]
        },
        {
          "h": "2. What you may do",
          "ul": [
            "Read, save and print your own report for personal, non-commercial purposes.",
            "Share your own snapshot image using the in-site share feature, keeping the ZHAOWU branding.",
            "Quote a small amount of content reasonably for criticism, review, news reporting, teaching or research where the law allows, with credit and a link to the source."
          ]
        },
        {
          "h": "3. What you may not do without written permission",
          "ul": [
            "Copy, republish, adapt, translate, publish or communicate site content or images to the public, whether or not for profit;",
            "Sell, resell, rent or sublicense reports or content, or include them in your own service, product or course;",
            "Scrape the site at scale or by automation, or use its content to train, fine-tune or build AI models or datasets;",
            "Remove, hide or alter copyright notices, watermarks or identifying information;",
            "Imitate the site's name, marks or interface in a way that suggests a connection with us."
          ]
        },
        {
          "h": "4. Third-party material",
          "p": [
            "The site uses some open-source software and openly licensed fonts (for example the Noto families and LXGW WenKai fonts, lamejs, and an adapted Placidus house-cusp algorithm). Copyright in those belongs to their owners and they are used under their own licences; see the project's third-party notices (THIRD-PARTY-NOTICES). Some images and text may be created with AI assistance and are selected and edited by people."
          ]
        },
        {
          "h": "5. Permission requests",
          "p": [
            "For republication, collaboration or commercial licensing, contact us using the details at the bottom of this page, describing the purpose, scope and period of use."
          ]
        },
        {
          "h": "6. Infringement notices",
          "p": [
            "If you believe the site infringes your copyright, or you find someone using our content without permission, send a notice that includes: (1) a description of the work; (2) the URL of the allegedly infringing material; (3) your name and contact details; (4) a statement that you believe in good faith that the use is not authorised; and (5) a statement that the notice is accurate and that you are the owner or authorised to act for the owner. We will review and act within a reasonable time, including removing or stopping use of disputed material."
          ]
        }
      ]
    }
  }
};
