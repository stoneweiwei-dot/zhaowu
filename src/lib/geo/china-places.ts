import type { CityHit } from "../bazi/types";

/**
 * Offline gazetteer: every prefecture-level division of mainland China (incl. autonomous
 * prefectures / leagues / the four municipalities), Taiwan counties and cities, Hong Kong,
 * Macau, plus 300 of the most-born-in county-level cities (tier 3/4).
 *
 * Row format: "繁體|簡體(空=同繁體)|pinyin(no tones)|lat|lon|alt1,alt2(optional extra search names)".
 * Coordinates are the urban centre (+-0.1 deg). Entries not known with confidence are omitted.
 * Mainland (incl. Xinjiang) uses Asia/Shanghai civil time. Expanded lazily at first use.
 */

export type PlaceKind = "prefecture" | "county" | "taiwan" | "hk" | "macau";

export type ChinaPlace = {
  key: string;
  name: string;
  hans: string;
  pinyin: string;
  province: string;
  provinceHans: string;
  kind: PlaceKind;
  latitude: number;
  longitude: number;
  timezone: string;
  country: string;
  display: string;
  hit: CityHit;
};

// province (繁) -> [簡, English]
const PROVINCES: Record<string, [string, string]> = {
  河北: ["河北", "Hebei"], 山西: ["山西", "Shanxi"], 內蒙古: ["内蒙古", "Inner Mongolia"], 遼寧: ["辽宁", "Liaoning"],
  吉林: ["吉林", "Jilin"], 黑龍江: ["黑龙江", "Heilongjiang"], 江蘇: ["江苏", "Jiangsu"], 浙江: ["浙江", "Zhejiang"],
  安徽: ["安徽", "Anhui"], 福建: ["福建", "Fujian"], 江西: ["江西", "Jiangxi"], 山東: ["山东", "Shandong"],
  河南: ["河南", "Henan"], 湖北: ["湖北", "Hubei"], 湖南: ["湖南", "Hunan"], 廣東: ["广东", "Guangdong"],
  廣西: ["广西", "Guangxi"], 海南: ["海南", "Hainan"], 四川: ["四川", "Sichuan"], 貴州: ["贵州", "Guizhou"],
  雲南: ["云南", "Yunnan"], 西藏: ["西藏", "Tibet"], 陝西: ["陕西", "Shaanxi"], 甘肅: ["甘肃", "Gansu"],
  青海: ["青海", "Qinghai"], 寧夏: ["宁夏", "Ningxia"], 新疆: ["新疆", "Xinjiang"],
};

// Prefecture-level (and the four municipalities, province "") sections.
const PREFECTURES: [string, string][] = [
  ["", `北京||beijing|39.90|116.41
天津||tianjin|39.13|117.20
上海||shanghai|31.23|121.47
重慶|重庆|chongqing|29.56|106.55`],
  ["河北", `石家莊|石家庄|shijiazhuang|38.04|114.51
唐山||tangshan|39.63|118.18
秦皇島|秦皇岛|qinhuangdao|39.94|119.60
邯鄲|邯郸|handan|36.61|114.49
邢臺|邢台|xingtai|37.07|114.50
保定||baoding|38.87|115.46
張家口|张家口|zhangjiakou|40.77|114.89
承德||chengde|40.95|117.96
滄州|沧州|cangzhou|38.30|116.84
廊坊||langfang|39.52|116.68
衡水||hengshui|37.74|115.67`],
  ["山西", `太原||taiyuan|37.87|112.55
大同||datong|40.08|113.30
陽泉|阳泉|yangquan|37.86|113.58
長治|长治|changzhi|36.20|113.12
晉城|晋城|jincheng|35.49|112.85
朔州||shuozhou|39.33|112.43
晉中|晋中|jinzhong|37.69|112.75
運城|运城|yuncheng|35.03|111.01
忻州||xinzhou|38.42|112.73
臨汾|临汾|linfen|36.09|111.52
呂梁|吕梁|lvliang|37.52|111.14`],
  ["內蒙古", `呼和浩特||huhehaote|40.84|111.75|hohhot
包頭|包头|baotou|40.66|109.84
烏海|乌海|wuhai|39.65|106.80
赤峰||chifeng|42.26|118.89
通遼|通辽|tongliao|43.65|122.24
鄂爾多斯|鄂尔多斯|eerduosi|39.61|109.78|東勝,东胜
呼倫貝爾|呼伦贝尔|hulunbeier|49.21|119.77|海拉爾,海拉尔
巴彥淖爾|巴彦淖尔|bayannaoer|40.76|107.39|臨河,临河
烏蘭察布|乌兰察布|wulanchabu|40.99|113.13|集寧,集宁
興安盟|兴安盟|xinganmeng|46.08|122.07|烏蘭浩特,乌兰浩特
錫林郭勒盟|锡林郭勒盟|xilinguolemeng|43.93|116.09|錫林浩特,锡林浩特
阿拉善盟||alashanmeng|38.85|105.73`],
  ["遼寧", `瀋陽|沈阳|shenyang|41.80|123.43|沈陽
大連|大连|dalian|38.91|121.61
鞍山||anshan|41.11|122.99
撫順|抚顺|fushun|41.88|123.96
本溪||benxi|41.29|123.77
丹東|丹东|dandong|40.12|124.35
錦州|锦州|jinzhou|41.10|121.13
營口|营口|yingkou|40.67|122.24
阜新||fuxin|42.02|121.67
遼陽|辽阳|liaoyang|41.27|123.24
盤錦|盘锦|panjin|41.12|122.07
鐵嶺|铁岭|tieling|42.22|123.84
朝陽|朝阳|chaoyang|41.57|120.45
葫蘆島|葫芦岛|huludao|40.71|120.84`],
  ["吉林", `長春|长春|changchun|43.82|125.32
吉林||jilin|43.84|126.55
四平||siping|43.17|124.35
遼源|辽源|liaoyuan|42.89|125.14
通化||tonghua|41.73|125.94
白山||baishan|41.94|126.42
松原||songyuan|45.14|124.83
白城||baicheng|45.62|122.84
延邊|延边|yanbian|42.89|129.51|延吉`],
  ["黑龍江", `哈爾濱|哈尔滨|haerbin|45.80|126.53|harbin
齊齊哈爾|齐齐哈尔|qiqihaer|47.35|123.92
雞西|鸡西|jixi|45.30|130.97
鶴崗|鹤岗|hegang|47.35|130.30
雙鴨山|双鸭山|shuangyashan|46.64|131.16
大慶|大庆|daqing|46.59|125.10
伊春||yichun|47.73|128.84
佳木斯||jiamusi|46.80|130.32
七臺河|七台河|qitaihe|45.77|131.00
牡丹江||mudanjiang|44.55|129.63
黑河||heihe|50.25|127.53
綏化|绥化|suihua|46.64|126.97
大興安嶺|大兴安岭|daxinganling|50.41|124.12|加格達奇,加格达奇`],
  ["江蘇", `南京||nanjing|32.06|118.80
無錫|无锡|wuxi|31.49|120.31
徐州||xuzhou|34.26|117.18
常州||changzhou|31.81|119.97
蘇州|苏州|suzhou|31.30|120.59
南通||nantong|32.01|120.89
連雲港|连云港|lianyungang|34.60|119.22
淮安||huaian|33.61|119.02
鹽城|盐城|yancheng|33.35|120.16
揚州|扬州|yangzhou|32.39|119.41
鎮江|镇江|zhenjiang|32.19|119.43
泰州||taizhou|32.46|119.92
宿遷|宿迁|suqian|33.96|118.28`],
  ["浙江", `杭州||hangzhou|30.27|120.16
寧波|宁波|ningbo|29.87|121.54
溫州|温州|wenzhou|28.00|120.70
嘉興|嘉兴|jiaxing|30.75|120.76
湖州||huzhou|30.89|120.09
紹興|绍兴|shaoxing|30.00|120.58
金華|金华|jinhua|29.08|119.65
衢州||quzhou|28.97|118.87
舟山||zhoushan|30.02|122.11
臺州|台州|taizhou|28.66|121.42
麗水|丽水|lishui|28.45|119.92`],
  ["安徽", `合肥||hefei|31.82|117.23
蕪湖|芜湖|wuhu|31.35|118.43
蚌埠||bengbu|32.92|117.39
淮南||huainan|32.63|117.02
馬鞍山|马鞍山|maanshan|31.67|118.51
淮北||huaibei|33.96|116.80
銅陵|铜陵|tongling|30.93|117.81
安慶|安庆|anqing|30.54|117.06
黃山|黄山|huangshan|29.71|118.34|屯溪
滁州||chuzhou|32.30|118.32
阜陽|阜阳|fuyang|32.89|115.81
宿州||suzhou|33.64|116.96
六安||luan|31.73|116.52
亳州||bozhou|33.84|115.78
池州||chizhou|30.66|117.49
宣城||xuancheng|30.94|118.76`],
  ["福建", `福州||fuzhou|26.07|119.30
廈門|厦门|xiamen|24.48|118.09
莆田||putian|25.45|119.01
三明||sanming|26.27|117.64
泉州||quanzhou|24.87|118.68
漳州||zhangzhou|24.51|117.65
南平||nanping|26.64|118.18
龍巖|龙岩|longyan|25.08|117.02
寧德|宁德|ningde|26.66|119.55`],
  ["江西", `南昌||nanchang|28.68|115.86
景德鎮|景德镇|jingdezhen|29.27|117.18
萍鄉|萍乡|pingxiang|27.62|113.85
九江||jiujiang|29.71|116.00
新餘|新余|xinyu|27.82|114.92
鷹潭|鹰潭|yingtan|28.24|117.07
贛州|赣州|ganzhou|25.83|114.93
吉安||jian|27.11|114.99
宜春||yichun|27.81|114.42
撫州|抚州|fuzhou|27.95|116.36
上饒|上饶|shangrao|28.45|117.94`],
  ["山東", `濟南|济南|jinan|36.67|117.00
青島|青岛|qingdao|36.07|120.38
淄博||zibo|36.81|118.05
棗莊|枣庄|zaozhuang|34.81|117.32
東營|东营|dongying|37.43|118.67
煙臺|烟台|yantai|37.46|121.45|煙台
濰坊|潍坊|weifang|36.71|119.16
濟寧|济宁|jining|35.41|116.59
泰安||taian|36.20|117.09
威海||weihai|37.51|122.12
日照||rizhao|35.42|119.53
臨沂|临沂|linyi|35.10|118.36
德州||dezhou|37.44|116.36
聊城||liaocheng|36.46|115.99
濱州|滨州|binzhou|37.38|118.02
菏澤|菏泽|heze|35.23|115.48`],
  ["河南", `鄭州|郑州|zhengzhou|34.75|113.62
開封|开封|kaifeng|34.80|114.31
洛陽|洛阳|luoyang|34.62|112.45
平頂山|平顶山|pingdingshan|33.77|113.19
安陽|安阳|anyang|36.10|114.39
鶴壁|鹤壁|hebi|35.75|114.30
新鄉|新乡|xinxiang|35.30|113.93
焦作||jiaozuo|35.22|113.24
濮陽|濮阳|puyang|35.76|115.03
許昌|许昌|xuchang|34.04|113.85
漯河||luohe|33.58|114.02
三門峽|三门峡|sanmenxia|34.77|111.20
南陽|南阳|nanyang|32.99|112.53
商丘||shangqiu|34.41|115.66
信陽|信阳|xinyang|32.13|114.09
周口||zhoukou|33.63|114.65
駐馬店|驻马店|zhumadian|33.01|114.02`],
  ["湖北", `武漢|武汉|wuhan|30.59|114.31
黃石|黄石|huangshi|30.20|115.04
十堰||shiyan|32.65|110.80
宜昌||yichang|30.69|111.29
襄陽|襄阳|xiangyang|32.01|112.12|襄樊
鄂州||ezhou|30.39|114.89
荊門|荆门|jingmen|31.04|112.20
孝感||xiaogan|30.93|113.92
荊州|荆州|jingzhou|30.33|112.24
黃岡|黄冈|huanggang|30.45|114.87
咸寧|咸宁|xianning|29.84|114.32
隨州|随州|suizhou|31.69|113.38
恩施||enshi|30.27|109.49`],
  ["湖南", `長沙|长沙|changsha|28.23|112.94
株洲||zhuzhou|27.83|113.13
湘潭||xiangtan|27.83|112.94
衡陽|衡阳|hengyang|26.89|112.57
邵陽|邵阳|shaoyang|27.24|111.47
岳陽|岳阳|yueyang|29.36|113.13
常德||changde|29.03|111.70
張家界|张家界|zhangjiajie|29.12|110.48
益陽|益阳|yiyang|28.55|112.36
郴州||chenzhou|25.77|113.01
永州||yongzhou|26.42|111.61
懷化|怀化|huaihua|27.55|110.00
婁底|娄底|loudi|27.70|112.00
湘西||xiangxi|28.31|109.74|吉首`],
  ["廣東", `廣州|广州|guangzhou|23.13|113.26
韶關|韶关|shaoguan|24.81|113.60
深圳||shenzhen|22.54|114.06
珠海||zhuhai|22.27|113.58
汕頭|汕头|shantou|23.35|116.68
佛山||foshan|23.02|113.12
江門|江门|jiangmen|22.58|113.08
湛江||zhanjiang|21.27|110.36
茂名||maoming|21.66|110.92
肇慶|肇庆|zhaoqing|23.05|112.47
惠州||huizhou|23.11|114.42
梅州||meizhou|24.29|116.12
汕尾||shanwei|22.79|115.37
河源||heyuan|23.74|114.70
陽江|阳江|yangjiang|21.86|111.98
清遠|清远|qingyuan|23.68|113.06
東莞|东莞|dongguan|23.02|113.75
中山||zhongshan|22.52|113.39
潮州||chaozhou|23.66|116.62
揭陽|揭阳|jieyang|23.55|116.37
雲浮|云浮|yunfu|22.92|112.04`],
  ["廣西", `南寧|南宁|nanning|22.82|108.37
柳州||liuzhou|24.33|109.43
桂林||guilin|25.27|110.29
梧州||wuzhou|23.48|111.28
北海||beihai|21.48|109.12
防城港||fangchenggang|21.69|108.35
欽州|钦州|qinzhou|21.98|108.65
貴港|贵港|guigang|23.11|109.60
玉林||yulin|22.65|110.18
百色||baise|23.90|106.62
賀州|贺州|hezhou|24.40|111.57
河池||hechi|24.69|108.06
來賓|来宾|laibin|23.75|109.22
崇左||chongzuo|22.38|107.36`],
  ["海南", `海口||haikou|20.04|110.20
三亞|三亚|sanya|18.25|109.51
三沙||sansha|16.83|112.34
儋州||danzhou|19.52|109.58`],
  ["四川", `成都||chengdu|30.57|104.07
自貢|自贡|zigong|29.34|104.78
攀枝花||panzhihua|26.58|101.72
瀘州|泸州|luzhou|28.87|105.44
德陽|德阳|deyang|31.13|104.40
綿陽|绵阳|mianyang|31.47|104.68
廣元|广元|guangyuan|32.43|105.84
遂寧|遂宁|suining|30.53|105.59
內江|内江|neijiang|29.58|105.06
樂山|乐山|leshan|29.58|103.77
南充||nanchong|30.84|106.11
眉山||meishan|30.08|103.85
宜賓|宜宾|yibin|28.77|104.64
廣安|广安|guangan|30.46|106.63
達州|达州|dazhou|31.21|107.47
雅安||yaan|29.98|103.04
巴中||bazhong|31.87|106.75
資陽|资阳|ziyang|30.12|104.63
阿壩|阿坝|aba|31.90|102.22|馬爾康,马尔康
甘孜||ganzi|30.05|101.96|康定
涼山|凉山|liangshan|27.89|102.27|西昌`],
  ["貴州", `貴陽|贵阳|guiyang|26.65|106.63
六盤水|六盘水|liupanshui|26.59|104.83
遵義|遵义|zunyi|27.73|106.93
安順|安顺|anshun|26.25|105.95
畢節|毕节|bijie|27.30|105.29
銅仁|铜仁|tongren|27.72|109.19
黔西南||qianxinan|25.09|104.90|興義,兴义
黔東南|黔东南|qiandongnan|26.57|107.98|凱里,凯里
黔南||qiannan|26.26|107.52|都勻,都匀`],
  ["雲南", `昆明||kunming|25.04|102.71
曲靖||qujing|25.49|103.80
玉溪||yuxi|24.35|102.54
保山||baoshan|25.12|99.17
昭通||zhaotong|27.34|103.72
麗江|丽江|lijiang|26.87|100.23
普洱||puer|22.78|100.97
臨滄|临沧|lincang|23.88|100.09
楚雄||chuxiong|25.04|101.55
紅河|红河|honghe|23.36|103.36|蒙自
文山||wenshan|23.37|104.24
西雙版納|西双版纳|xishuangbanna|22.00|100.80|景洪
大理||dali|25.61|100.27
德宏||dehong|24.43|98.59|芒市
怒江||nujiang|25.85|98.86|瀘水,泸水
迪慶|迪庆|diqing|27.83|99.70|香格里拉`],
  ["西藏", `拉薩|拉萨|lasa|29.65|91.12|lhasa
日喀則|日喀则|rikaze|29.27|88.88
昌都||changdu|31.14|97.17
林芝||linzhi|29.65|94.36
山南||shannan|29.24|91.77
那曲||naqu|31.48|92.05
阿里||ali|32.50|80.11|獅泉河,狮泉河`],
  ["陝西", `西安||xian|34.34|108.94
銅川|铜川|tongchuan|34.90|108.95
寶雞|宝鸡|baoji|34.36|107.24
咸陽|咸阳|xianyang|34.33|108.71
渭南||weinan|34.50|109.51
延安||yanan|36.59|109.49
漢中|汉中|hanzhong|33.07|107.02
榆林||yulin|38.29|109.73
安康||ankang|32.69|109.03
商洛||shangluo|33.87|109.94`],
  ["甘肅", `蘭州|兰州|lanzhou|36.06|103.83
嘉峪關|嘉峪关|jiayuguan|39.77|98.29
金昌||jinchang|38.52|102.19
白銀|白银|baiyin|36.54|104.14
天水||tianshui|34.58|105.72
武威||wuwei|37.93|102.64
張掖|张掖|zhangye|38.93|100.45
平涼|平凉|pingliang|35.54|106.67
酒泉||jiuquan|39.73|98.49
慶陽|庆阳|qingyang|35.71|107.64
定西||dingxi|35.58|104.63
隴南|陇南|longnan|33.40|104.92
臨夏|临夏|linxia|35.60|103.21
甘南||gannan|34.99|102.91|合作`],
  ["青海", `西寧|西宁|xining|36.62|101.78
海東|海东|haidong|36.48|102.40|樂都,乐都
海北||haibei|36.90|100.90|海晏
黃南|黄南|huangnan|35.52|102.02|同仁
海南州||hainanzhou|36.28|100.62|共和
果洛||guoluo|34.47|100.24|瑪沁,玛沁
玉樹|玉树|yushu|33.00|97.01
海西||haixi|37.37|97.37|德令哈`],
  ["寧夏", `銀川|银川|yinchuan|38.49|106.23
石嘴山||shizuishan|39.01|106.38
吳忠|吴忠|wuzhong|37.99|106.20
固原||guyuan|36.02|106.24
中衛|中卫|zhongwei|37.50|105.20`],
  ["新疆", `烏魯木齊|乌鲁木齐|wulumuqi|43.83|87.62|urumqi
克拉瑪依|克拉玛依|kelamayi|45.58|84.89
吐魯番|吐鲁番|tulufan|42.95|89.19
哈密||hami|42.83|93.51
昌吉||changji|44.01|87.31
博爾塔拉|博尔塔拉|boertala|44.90|82.07|博樂,博乐
巴音郭楞||bayinguoleng|41.76|86.15|庫爾勒,库尔勒
阿克蘇|阿克苏|akesu|41.17|80.26
克孜勒蘇|克孜勒苏|kezilesu|39.72|76.17|阿圖什,阿图什
喀什||kashi|39.47|75.99
和田||hetian|37.11|79.92
伊犁||yili|43.92|81.32|伊寧,伊宁
塔城||tacheng|46.75|82.98
阿勒泰||aletai|47.85|88.14`],
];

// County-level cities / most-born-in tier 3-4 places (only entries known with confidence).
const COUNTIES: [string, string][] = [
  ["江蘇", `昆山||kunshan|31.39|120.98
常熟||changshu|31.65|120.75
張家港|张家港|zhangjiagang|31.88|120.55
太倉|太仓|taicang|31.45|121.13
江陰|江阴|jiangyin|31.92|120.29
宜興|宜兴|yixing|31.34|119.82
溧陽|溧阳|liyang|31.42|119.48
丹陽|丹阳|danyang|32.01|119.61
句容||jurong|31.95|119.17
揚中|扬中|yangzhong|32.24|119.83
儀徵|仪征|yizheng|32.27|119.18
高郵|高邮|gaoyou|32.78|119.44
靖江||jingjiang|32.02|120.27
泰興|泰兴|taixing|32.17|120.02
興化|兴化|xinghua|32.91|119.85
如皋||rugao|32.39|120.57
海安||haian|32.54|120.47
啟東|启东|qidong|31.81|121.66
海門|海门|haimen|31.89|121.18
東臺|东台|dongtai|32.87|120.31
大豐|大丰|dafeng|33.20|120.47
邳州||pizhou|34.31|117.96
新沂||xinyi|34.37|118.35`],
  ["浙江", `義烏|义乌|yiwu|29.31|120.08
諸暨|诸暨|zhuji|29.71|120.24
嵊州||shengzhou|29.59|120.83
上虞||shangyu|30.03|120.87
慈溪||cixi|30.17|121.27
餘姚|余姚|yuyao|30.04|121.15
奉化||fenghua|29.66|121.41
瑞安||ruian|27.78|120.65
樂清|乐清|yueqing|28.13|120.97
溫嶺|温岭|wenling|28.37|121.37
臨海|临海|linhai|28.86|121.12
東陽|东阳|dongyang|29.29|120.24
永康||yongkang|28.89|120.04
蘭溪|兰溪|lanxi|29.21|119.46
江山||jiangshan|28.74|118.62
龍泉|龙泉|longquan|28.07|119.14
桐鄉|桐乡|tongxiang|30.63|120.56
海寧|海宁|haining|30.53|120.68
平湖||pinghu|30.70|121.02
建德||jiande|29.47|119.28
臨安|临安|linan|30.23|119.72
富陽|富阳|fuyang|30.05|119.96
玉環|玉环|yuhuan|28.14|121.23`],
  ["安徽", `桐城||tongcheng|31.05|116.97
天長|天长|tianchang|32.69|119.00
明光||mingguang|32.78|117.99
界首||jieshou|33.26|115.36
寧國|宁国|ningguo|30.63|118.98`],
  ["福建", `晉江|晋江|jinjiang|24.78|118.55
石獅|石狮|shishi|24.73|118.65
南安||nanan|24.96|118.39
福清||fuqing|25.72|119.38
長樂|长乐|changle|25.96|119.52
邵武||shaowu|27.34|117.49
武夷山||wuyishan|27.76|118.04
永安||yongan|25.94|117.37
福安||fuan|27.09|119.65
福鼎||fuding|27.32|120.22
龍海|龙海|longhai|24.45|117.82
漳平||zhangping|25.29|117.42
建甌|建瓯|jianou|27.02|118.32`],
  ["廣東", `臺山|台山|taishan|22.25|112.79
開平|开平|kaiping|22.38|112.70
鶴山|鹤山|heshan|22.77|112.96
恩平||enping|22.18|112.31
廉江||lianjiang|21.61|110.28
雷州||leizhou|20.91|110.08
吳川|吴川|wuchuan|21.44|110.78
高州||gaozhou|21.92|110.85
化州||huazhou|21.66|110.64
信宜||xinyi|22.35|110.94
四會|四会|sihui|23.33|112.73
興寧|兴宁|xingning|24.14|115.73
陸豐|陆丰|lufeng|22.95|115.65
普寧|普宁|puning|23.30|116.17
羅定|罗定|luoding|22.77|111.57
樂昌|乐昌|lechang|25.13|113.35
南雄||nanxiong|25.12|114.31
英德||yingde|24.19|113.41
連州|连州|lianzhou|24.78|112.38`],
  ["山東", `諸城|诸城|zhucheng|35.99|119.41
壽光|寿光|shouguang|36.86|118.79
青州||qingzhou|36.69|118.48
高密||gaomi|36.38|119.76
膠州|胶州|jiaozhou|36.26|120.03
平度||pingdu|36.78|119.99
萊西|莱西|laixi|36.87|120.52
龍口|龙口|longkou|37.65|120.50
萊州|莱州|laizhou|37.18|119.94
招遠|招远|zhaoyuan|37.36|120.40
乳山||rushan|36.92|121.54
榮成|荣成|rongcheng|37.16|122.49
滕州||tengzhou|35.11|117.16
曲阜||qufu|35.58|116.99
鄒城|邹城|zoucheng|35.40|116.97
新泰||xintai|35.91|117.77
肥城||feicheng|36.18|116.77
臨清|临清|linqing|36.84|115.70
樂陵|乐陵|leling|37.73|117.23
禹城||yucheng|36.93|116.64`],
  ["河南", `鞏義|巩义|gongyi|34.75|112.98
滎陽|荥阳|xingyang|34.79|113.38
新密||xinmi|34.54|113.39
新鄭|新郑|xinzheng|34.40|113.74
登封||dengfeng|34.45|113.04
舞鋼|舞钢|wugang|33.30|113.52
汝州||ruzhou|34.17|112.84
林州||linzhou|36.08|113.82
衛輝|卫辉|weihui|35.40|114.06
輝縣|辉县|huixian|35.46|113.80
沁陽|沁阳|qinyang|35.09|112.95
孟州||mengzhou|34.91|112.79
禹州||yuzhou|34.14|113.47
長葛|长葛|changge|34.22|113.77
義馬|义马|yima|34.74|111.87
靈寶|灵宝|lingbao|34.52|110.89
項城|项城|xiangcheng|33.45|114.90
永城||yongcheng|33.93|116.45
鄧州|邓州|dengzhou|32.69|112.09
濟源|济源|jiyuan|35.07|112.60`],
  ["河北", `遷安|迁安|qianan|40.01|118.70
遵化||zunhua|40.19|117.97
三河||sanhe|39.98|117.07
霸州||bazhou|39.12|116.39
涿州||zhuozhou|39.49|115.97
定州||dingzhou|38.51|114.99
辛集||xinji|37.94|115.22
晉州|晋州|jinzhou|38.03|115.04
新樂|新乐|xinle|38.34|114.68
任丘||renqiu|38.71|116.10
河間|河间|hejian|38.45|116.09
黃驊|黄骅|huanghua|38.37|117.33
泊頭|泊头|botou|38.08|116.58
沙河||shahe|36.86|114.50
南宮|南宫|nangong|37.36|115.41
武安||wuan|36.70|114.20`],
  ["山西", `古交||gujiao|37.91|112.17
孝義|孝义|xiaoyi|37.14|111.78
介休||jiexiu|37.03|111.92
侯馬|侯马|houma|35.62|111.37
霍州||huozhou|36.57|111.72
河津||hejin|35.60|110.71
永濟|永济|yongji|34.87|110.45
原平||yuanping|38.73|112.71
高平||gaoping|35.80|112.92`],
  ["內蒙古", `滿洲里|满洲里|manzhouli|49.60|117.38
扎蘭屯|扎兰屯|zhalantun|48.01|122.74
牙克石||yakeshi|49.29|120.73
額爾古納|额尔古纳|eerguna|50.24|120.18
霍林郭勒||huolinguole|45.53|119.66
二連浩特|二连浩特|erlianhaote|43.65|111.98
豐鎮|丰镇|fengzhen|40.44|113.16`],
  ["遼寧", `瓦房店||wafangdian|39.63|122.00
莊河|庄河|zhuanghe|39.68|122.97
海城||haicheng|40.88|122.69
東港|东港|donggang|39.87|124.15
鳳城|凤城|fengcheng|40.45|124.07
凌海||linghai|41.17|121.36
北鎮|北镇|beizhen|41.60|121.80
蓋州|盖州|gaizhou|40.40|122.35
大石橋|大石桥|dashiqiao|40.64|122.51
調兵山|调兵山|diaobingshan|42.47|123.55
開原|开原|kaiyuan|42.54|124.04
北票||beipiao|41.80|120.77
凌源||lingyuan|41.24|119.40
興城|兴城|xingcheng|40.61|120.73
新民||xinmin|41.99|122.83`],
  ["吉林", `公主嶺|公主岭|gongzhuling|43.50|124.82
梅河口||meihekou|42.53|125.68
集安||jian|41.13|126.19
敦化||dunhua|43.37|128.23
圖們|图们|tumen|42.97|129.84
琿春|珲春|hunchun|42.87|130.37
龍井|龙井|longjing|42.77|129.43
和龍|和龙|helong|42.55|129.00
蛟河||jiaohe|43.72|127.34
舒蘭|舒兰|shulan|44.41|126.95
磐石||panshi|42.94|126.06
樺甸|桦甸|huadian|42.97|126.75
榆樹|榆树|yushu|44.84|126.55
德惠||dehui|44.53|125.70
洮南||taonan|45.34|122.79
大安||daan|45.50|124.29`],
  ["黑龍江", `北安||beian|48.24|126.51
同江||tongjiang|47.65|132.51
富錦|富锦|fujin|47.25|132.04
虎林||hulin|45.76|132.98
密山||mishan|45.53|131.87
綏芬河|绥芬河|suifenhe|44.41|131.15
海林||hailin|44.57|129.38
寧安|宁安|ningan|44.35|129.48
穆棱||muling|44.92|130.52
東寧|东宁|dongning|44.06|131.12
肇東|肇东|zhaodong|46.07|125.96
安達|安达|anda|46.41|125.32
海倫|海伦|hailun|47.46|126.97
尚志||shangzhi|45.21|127.96
五常||wuchang|44.93|127.17`],
  ["湖北", `宜都||yidu|30.38|111.45
當陽|当阳|dangyang|30.82|111.79
枝江||zhijiang|30.43|111.77
老河口||laohekou|32.38|111.68
棗陽|枣阳|zaoyang|32.13|112.77
宜城||yicheng|31.72|112.26
鍾祥|钟祥|zhongxiang|31.17|112.59
京山||jingshan|31.02|113.12
應城|应城|yingcheng|30.93|113.57
安陸|安陆|anlu|31.26|113.69
漢川|汉川|hanchuan|30.65|113.84
麻城||macheng|31.18|115.01
武穴||wuxue|29.85|115.56
赤壁||chibi|29.72|113.90
大冶||daye|30.10|114.97
丹江口||danjiangkou|32.54|111.51
洪湖||honghu|29.83|113.45
石首||shishou|29.72|112.41
松滋||songzi|30.17|111.77
利川||lichuan|30.29|108.94
仙桃||xiantao|30.36|113.45
潛江|潜江|qianjiang|30.40|112.90
天門|天门|tianmen|30.66|113.17`],
  ["湖南", `瀏陽|浏阳|liuyang|28.16|113.64
寧鄉|宁乡|ningxiang|28.28|112.55
醴陵||liling|27.65|113.50
湘鄉|湘乡|xiangxiang|27.73|112.53
韶山||shaoshan|27.92|112.53
耒陽|耒阳|leiyang|26.41|112.86
常寧|常宁|changning|26.42|112.40
武岡|武冈|wugang|26.73|110.63
邵東|邵东|shaodong|27.26|111.74
汨羅|汨罗|miluo|28.80|113.07
臨湘|临湘|linxiang|29.48|113.45
津市||jinshi|29.60|111.88
沅江||yuanjiang|28.84|112.36
資興|资兴|zixing|25.98|113.23
洪江||hongjiang|27.21|109.83
冷水江||lengshuijiang|27.69|111.43
漣源|涟源|lianyuan|27.69|111.66`],
  ["江西", `樂平|乐平|leping|28.97|117.13
瑞昌||ruichang|29.68|115.67
共青城||gongqingcheng|29.25|115.81
貴溪|贵溪|guixi|28.29|117.21
瑞金||ruijin|25.88|116.03
龍南|龙南|longnan|24.91|114.79
井岡山|井冈山|jinggangshan|26.75|114.29
豐城|丰城|fengcheng|28.16|115.77
樟樹|樟树|zhangshu|28.06|115.54
高安||gaoan|28.42|115.38
德興|德兴|dexing|28.95|117.58`],
  ["廣西", `岑溪||cenxi|22.92|110.99
桂平||guiping|23.39|110.08
北流||beiliu|22.71|110.35
東興|东兴|dongxing|21.55|107.97
憑祥|凭祥|pingxiang|22.09|106.76
合山||heshan|23.81|108.89
荔浦||lipu|24.49|110.40
宜州||yizhou|24.49|108.65`],
  ["海南", `瓊海|琼海|qionghai|19.26|110.47
萬寧|万宁|wanning|18.80|110.39
文昌||wenchang|19.61|110.75
東方|东方|dongfang|19.10|108.65
五指山||wuzhishan|18.78|109.52`],
  ["四川", `都江堰||dujiangyan|31.00|103.62
彭州||pengzhou|30.99|103.94
邛崍|邛崃|qionglai|30.41|103.46
崇州||chongzhou|30.63|103.67
簡陽|简阳|jianyang|30.39|104.55
江油||jiangyou|31.78|104.74
廣漢|广汉|guanghan|30.98|104.28
什邡||shifang|31.13|104.17
綿竹|绵竹|mianzhu|31.34|104.22
閬中|阆中|langzhong|31.55|105.97
華鎣|华蓥|huaying|30.38|106.78
萬源|万源|wanyuan|32.07|108.04
峨眉山||emeishan|29.60|103.49
隆昌||longchang|29.34|105.29`],
  ["貴州", `清鎮|清镇|qingzhen|26.56|106.47
赤水||chishui|28.59|105.70
仁懷|仁怀|renhuai|27.79|106.40
福泉||fuquan|26.70|107.52`],
  ["雲南", `瑞麗|瑞丽|ruili|24.01|97.85
騰衝|腾冲|tengchong|25.02|98.50
開遠|开远|kaiyuan|23.71|103.26
個舊|个旧|gejiu|23.36|103.15
安寧|安宁|anning|24.92|102.48
宣威||xuanwei|26.22|104.10`],
  ["陝西", `韓城|韩城|hancheng|35.48|110.44
華陰|华阴|huayin|34.57|110.09
興平|兴平|xingping|34.30|108.49
彬州||binzhou|35.04|108.08
神木||shenmu|38.84|110.50`],
  ["甘肅", `玉門|玉门|yumen|40.29|97.04
敦煌||dunhuang|40.14|94.66`],
  ["寧夏", `靈武|灵武|lingwu|38.10|106.33
青銅峽|青铜峡|qingtongxia|37.88|106.08`],
  ["新疆", `奎屯||kuitun|44.42|84.90
石河子||shihezi|44.31|86.04
阿拉爾|阿拉尔|alaer|40.55|81.28`],
];

const TAIWAN = `臺北市|台北市|taibei|25.04|121.56|台北,taipei
新北市||xinbei|25.01|121.47|newtaipei
桃園市|桃园市|taoyuan|24.99|121.30
臺中市|台中市|taizhong|24.15|120.67|taichung
臺南市|台南市|tainan|22.99|120.21
高雄市||gaoxiong|22.63|120.30|kaohsiung
基隆市||jilong|25.13|121.74|keelung
新竹市||xinzhu|24.81|120.97|hsinchu
嘉義市|嘉义市|jiayi|23.48|120.45|chiayi
新竹縣|新竹县|xinzhu|24.84|121.01|竹北
苗栗縣|苗栗县|miaoli|24.56|120.82
彰化縣|彰化县|zhanghua|24.08|120.54|changhua
南投縣|南投县|nantou|23.91|120.69
雲林縣|云林县|yunlin|23.71|120.54|斗六
嘉義縣|嘉义县|jiayi|23.46|120.25|朴子
屏東縣|屏东县|pingdong|22.67|120.49|pingtung
宜蘭縣|宜兰县|yilan|24.75|121.75
花蓮縣|花莲县|hualian|23.98|121.60|hualien
臺東縣|台东县|taidong|22.76|121.14|taitung
澎湖縣|澎湖县|penghu|23.57|119.57|馬公,马公
金門縣|金门县|jinmen|24.43|118.32|kinmen
連江縣|连江县|lianjiang|26.16|119.95|馬祖,马祖,南竿`;

const HONG_KONG = `香港||xianggang|22.32|114.17|hongkong,hk`;
const MACAU = `澳門|澳门|aomen|22.20|113.54|macau,macao`;

const SUFFIX = /(市|縣|县)$/u;
const STRIP_QUERY_WORDS = /(中國|中国|china|taiwan|臺灣|台灣|台湾)$/u;

/** Fold text for matching: NFKC, lower-case, drop separators, 台 -> 臺. */
export function foldPlaceText(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s,，。、·/\\'’`-]+/g, "")
    .replace(/台/g, "臺");
}

function stripSuffix(value: string) {
  return value.length > 2 && SUFFIX.test(value) ? value.replace(SUFFIX, "") : value;
}

type Indexed = ChinaPlace & { keys: string[]; names: string[] };

let cache: Indexed[] | null = null;

function build(rows: string, kind: PlaceKind, provinceTw: string): Indexed[] {
  const out: Indexed[] = [];
  const prov = PROVINCES[provinceTw];
  for (const line of rows.split("\n")) {
    if (!line.trim()) continue;
    const [tw, sc, py, lat, lon, alt] = line.split("|");
    const hans = sc || tw;
    const latitude = Number(lat);
    const longitude = Number(lon);
    const isTaiwan = kind === "taiwan";
    const isSpecial = kind === "hk" || kind === "macau";
    const province = provinceTw;
    const provinceHans = prov?.[0] ?? province;
    const country = isTaiwan ? "臺灣" : "中國";
    const timezone = isTaiwan ? "Asia/Taipei" : kind === "hk" ? "Asia/Hong_Kong" : kind === "macau" ? "Asia/Macau" : "Asia/Shanghai";
    const display = isSpecial
      ? tw
      : [tw, province && province !== tw ? province : null, country].filter(Boolean).join("，");
    const hit: CityHit = { name: tw, country, display, latitude, longitude, timezone };
    const alts = (alt ? alt.split(",") : []).filter(Boolean);
    const names = [tw, hans, ...alts].map(foldPlaceText);
    const stripped = names.map(stripSuffix);
    const provKeys = province
      ? [`${tw}${province}`, `${province}${tw}`, `${hans}${provinceHans}`, `${provinceHans}${hans}`].map(foldPlaceText)
      : [];
    out.push({
      key: `${province}|${tw}`,
      name: tw,
      hans,
      pinyin: py,
      province,
      provinceHans,
      kind,
      latitude,
      longitude,
      timezone,
      country,
      display,
      hit,
      keys: Array.from(new Set([...names, ...stripped, foldPlaceText(py), ...provKeys])),
      names: Array.from(new Set([...names, ...stripped])),
    });
  }
  return out;
}

function all(): Indexed[] {
  if (cache) return cache;
  const rows: Indexed[] = [];
  for (const [prov, text] of PREFECTURES) rows.push(...build(text, "prefecture", prov));
  for (const [prov, text] of COUNTIES) rows.push(...build(text, "county", prov));
  rows.push(...build(TAIWAN, "taiwan", ""), ...build(HONG_KONG, "hk", ""), ...build(MACAU, "macau", ""));
  cache = rows;
  return rows;
}

/** All gazetteer entries (expanded lazily, then cached). */
export function getChinaPlaces(): ChinaPlace[] {
  return all();
}

function prepareQuery(query: string) {
  let q = foldPlaceText(String(query ?? "")).replace(/省/g, "");
  q = q.replace(STRIP_QUERY_WORDS, "");
  const variants = [q];
  const stripped = q.replace(SUFFIX, "");
  if (stripped.length >= 2 && stripped !== q) variants.push(stripped);
  return variants.filter(Boolean);
}

const LATIN = /^[a-z0-9]+$/;

/**
 * Instant offline search. Accepts Traditional / Simplified / pinyin / partial names
 * (and "省份+城市"). Best matches first; prefecture-level before county-level.
 */
export function searchChinaPlaces(query: string, limit = 8): CityHit[] {
  const variants = prepareQuery(query);
  if (!variants.length) return [];
  const scored: { place: Indexed; score: number; index: number }[] = [];
  all().forEach((place, index) => {
    let best = 0;
    for (const v of variants) {
      const latin = LATIN.test(v);
      for (const k of place.keys) {
        let s = 0;
        if (k === v) s = 100;
        else if (k.startsWith(v)) s = 80 - Math.min(20, k.length - v.length);
        else if (!latin && v.length >= 2 && k.includes(v)) s = 40;
        if (s > best) best = s;
      }
    }
    if (best > 0) {
      const bonus = place.kind === "prefecture" ? 5 : place.kind === "county" ? 0 : 3;
      scored.push({ place, score: best + bonus, index });
    }
  });
  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  return scored.slice(0, limit).map((s) => s.place.hit);
}

function editDistance(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/**
 * Last-resort candidates when nothing else matched: edit distance <= 1 on names (and on
 * pinyin for Latin input of 4+ letters), or a known name contained in the typed text.
 */
export function fuzzyChinaPlaces(query: string, limit = 6): CityHit[] {
  const variants = prepareQuery(query);
  if (!variants.length) return [];
  const scored: { place: Indexed; score: number; index: number }[] = [];
  all().forEach((place, index) => {
    let best = 0;
    for (const v of variants) {
      const latin = LATIN.test(v);
      if (latin ? v.length < 4 : v.length < 2) continue;
      const pool = latin ? [foldPlaceText(place.pinyin)] : place.names;
      for (const n of pool) {
        if (n.length < 2) continue;
        const d = editDistance(v, n, 1);
        if (d <= 1) best = Math.max(best, 60 - d * 10);
        else if (!latin && v.length >= 3 && v.includes(n)) best = Math.max(best, 45);
      }
    }
    if (best > 0) scored.push({ place, score: best + (place.kind === "prefecture" ? 3 : 0), index });
  });
  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  return scored.slice(0, limit).map((s) => s.place.hit);
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 6371.0088 * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
}

export type NearestPlace = { place: ChinaPlace; hit: CityHit; distanceKm: number };

/** Nearest known gazetteer place to a coordinate (haversine); null when none within maxKm. */
export function nearestPlace(latitude: number, longitude: number, maxKm = Infinity): NearestPlace | null {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  let best: Indexed | null = null;
  let bestKm = Infinity;
  for (const p of all()) {
    const d = haversineKm(latitude, longitude, p.latitude, p.longitude);
    if (d < bestKm) {
      bestKm = d;
      best = p;
    }
  }
  if (!best || bestKm > maxKm) return null;
  return { place: best, hit: best.hit, distanceKm: Math.round(bestKm * 10) / 10 };
}

/** True when `name` is a known gazetteer name located within `radiusKm` of the coordinate. */
export function isKnownPlace(name: string, latitude: number, longitude: number, radiusKm = 80): boolean {
  const n = foldPlaceText(String(name ?? "")).replace(/省/g, "");
  const variants = Array.from(new Set([n, stripSuffix(n), n.replace(/(市|縣|县|區|区)$/u, "")])).filter((v) => v.length >= 2);
  if (!variants.length) return false;
  return all().some(
    (p) => (p.names.some((k) => variants.includes(k)) || variants.includes(foldPlaceText(p.pinyin))) && haversineKm(latitude, longitude, p.latitude, p.longitude) <= radiusKm,
  );
}

function capitalize(value: string) {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}

/** Localised display for a gazetteer coordinate; null when the city is not a gazetteer entry. */
export function localizeChinaPlace(
  city: Pick<CityHit, "latitude" | "longitude">,
  locale: "zh-Hant" | "zh-Hans" | "en",
): string | null {
  const place = all().find((p) => p.latitude === city.latitude && p.longitude === city.longitude);
  if (!place) return null;
  if (locale === "zh-Hant") return place.display;
  const special = place.kind === "hk" || place.kind === "macau";
  const taiwan = place.kind === "taiwan";
  if (locale === "zh-Hans") {
    if (special) return place.hans;
    const prov = place.provinceHans && place.provinceHans !== place.hans ? place.provinceHans : null;
    return [place.hans, prov, taiwan ? "台湾" : "中国"].filter(Boolean).join("，");
  }
  const english = place.kind === "hk" ? "Hong Kong" : place.kind === "macau" ? "Macau" : capitalize(place.pinyin);
  if (special) return english;
  const provEn = PROVINCES[place.province]?.[1];
  return [english, provEn && place.province !== place.name ? provEn : null, taiwan ? "Taiwan" : "China"]
    .filter(Boolean)
    .join(", ");
}
