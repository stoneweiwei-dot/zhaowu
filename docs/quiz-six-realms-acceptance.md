# 六道习气测验 acceptance checklist

1. 首页出现「六道习气测验」入口并进入 `/quiz/six-realms`。
2. 六题均为整行可点击单选；当前题未选择时下一题 disabled。
3. `AAAAAA` → 天道习气。
4. `BBBBBB` → 阿修罗道习气。
5. `CCCCCC` → 人道习气。
6. `DDDDDD` → 畜生道习气。
7. `EEEEEE` → 饿鬼道习气。
8. `FFFFFF` → 地狱道习气。
9. `AABBCC` → A/B/C 同时并列，不强行挑一个。
10. 无登录、生日、AI、付费依赖；结果不写入正式命盘或付费报告。
11. 锁定的八字、一掌经和 actions 文件未修改。
12. iPhone Safari 无白屏、卡死、横向滚动：待 CI / Production 浏览器验证后填写。
