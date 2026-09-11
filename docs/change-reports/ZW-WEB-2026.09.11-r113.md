# 昭梧更新報告｜ZW-WEB-2026.09.11-r113

## 本次改動

以 current main（r112，commit 0c9b414）為基底重新建立 STO-12 單批 Logo rollout。Header 使用獨立的 /brand-ui/header-gourd-wordmark-r113.png；App、iPhone 主畫面、Android PWA 與 favicon 使用另一組 /icons/zhaowu-gourd-wordmark-r113-* 方形輸出。HTML、manifest、安裝引導與 service worker shell 全部切換至 r113，cache namespace 遞增並保留既有更新控制。

## 發布前驗收

PR 必須以 0c9b414 為 parent，Preview 通過 build、deploy gate、iPhone Safari workflow；Production 必須以 network response 核對 index.html、manifest.webmanifest、sw.js 與實際圖片 URL；未有 iPhone 實機證據時仍標示待驗證。

## 回滾

只恢復本批 Header、manifest、index、service worker、安裝引導與圖示資產；不觸及命理、登入、付款、Supabase schema 或使用者資料。
