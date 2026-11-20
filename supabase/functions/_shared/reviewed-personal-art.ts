/** Visually checked against the original files on 2026-09-01 (28 images inspected).
 * These are decorative motif weights, never chart inputs or confirmed favourable elements.
 * Path binding prevents a replacement upload from inheriting another image's review.
 * See docs/change-reports/ZW-WEB-2026.09.02-r28.md for review scope and exclusions.
 */
export type ReviewedPersonalArt = {
 id:string; storage_path:string;
 element_scores:{wood:number;fire:number;earth:number;metal:number;water:number};
 subject_labels:string[]; scene:Record<'en'|'zh-Hant'|'zh-Hans',string>;
};
export const REVIEWED_PERSONAL_ART: ReviewedPersonalArt[] = [
  {
    "id": "177dd1d3-f3f2-4b57-9920-7b13f9c4833d",
    "storage_path": "2026-08-26/05a8de50-856c-4326-914e-e243416e0acf.png",
    "element_scores": {
      "wood": 20,
      "fire": 25,
      "earth": 15,
      "metal": 95,
      "water": 20
    },
    "subject_labels": [
      "bird",
      "metal chimes",
      "cloud"
    ],
    "scene": {
      "en": "a pale bird, gold chimes and curling clouds",
      "zh-Hant": "淺色飛鳥、金色風鈴與流雲",
      "zh-Hans": "浅色飞鸟、金色风铃与流云"
    }
  },
  {
    "id": "6734cac7-444f-4d64-a5df-e4b748adf703",
    "storage_path": "2026-08-26/04bfcb7d-1537-4086-995a-4f7a3816bb88.png",
    "element_scores": {
      "wood": 15,
      "fire": 100,
      "earth": 35,
      "metal": 25,
      "water": 0
    },
    "subject_labels": [
      "cinnabar gate",
      "red lanterns",
      "warm light"
    ],
    "scene": {
      "en": "a cinnabar gate and red lanterns in warm light",
      "zh-Hant": "朱紅門闕、紅燈籠與暖光",
      "zh-Hans": "朱红门阙、红灯笼与暖光"
    }
  },
  {
    "id": "6bf3c49f-4081-40c3-8a06-abe8322bfbd6",
    "storage_path": "2026-08-26/ae3e02e4-ea77-40a9-b165-e0d5b6b031e6.png",
    "element_scores": {
      "wood": 25,
      "fire": 10,
      "earth": 85,
      "metal": 85,
      "water": 15
    },
    "subject_labels": [
      "treasure vase",
      "jade",
      "pearls"
    ],
    "scene": {
      "en": "a rounded treasure vase, jade ornaments and pearls",
      "zh-Hant": "圓腹寶瓶、玉飾與珍珠",
      "zh-Hans": "圆腹宝瓶、玉饰与珍珠"
    }
  },
  {
    "id": "dc15d0cd-1c1c-4cac-8dba-f539e412e3b8",
    "storage_path": "2026-08-26/02d52c7f-331e-4bf9-9bcd-a57f823071c1.png",
    "element_scores": {
      "wood": 5,
      "fire": 35,
      "earth": 100,
      "metal": 50,
      "water": 0
    },
    "subject_labels": [
      "guardian",
      "treasure vessel",
      "rocky base"
    ],
    "scene": {
      "en": "an armoured guardian holding a treasure vessel on a rocky base",
      "zh-Hant": "鎧甲守護者、懷中寶器與岩石基座",
      "zh-Hans": "铠甲守护者、怀中宝器与岩石基座"
    }
  },
  {
    "id": "d19fbdb4-0401-40ed-af08-44f58904a5d3",
    "storage_path": "2026-08-26/0a2ca3b4-bd4a-428c-8ab1-d81c1f4c1ae7.png",
    "element_scores": {
      "wood": 90,
      "fire": 0,
      "earth": 45,
      "metal": 5,
      "water": 95
    },
    "subject_labels": [
      "pine",
      "mountain",
      "waterfall",
      "river",
      "crane",
      "lotus"
    ],
    "scene": {
      "en": "pines, waterfalls, a winding stream and cranes among green mountains",
      "zh-Hant": "青山間的松樹、瀑布、曲水與白鶴",
      "zh-Hans": "青山间的松树、瀑布、曲水与白鹤"
    }
  },
  {
    "id": "d7e6ca11-9c62-4be4-9b34-d6d4cb603880",
    "storage_path": "2026-08-26/d0a7c375-8d8d-43d8-a8e0-c7fe3c6ebab4.jpeg",
    "element_scores": {
      "wood": 100,
      "fire": 15,
      "earth": 5,
      "metal": 0,
      "water": 20
    },
    "subject_labels": [
      "green figure",
      "peony",
      "leaves",
      "lotus"
    ],
    "scene": {
      "en": "a green seated figure surrounded by pink peonies and leafy growth",
      "zh-Hant": "綠色坐像、粉色牡丹與繁葉",
      "zh-Hans": "绿色坐像、粉色牡丹与繁叶"
    }
  },
  {
    "id": "74bd33ec-9b02-419e-8c6e-ed05388d031d",
    "storage_path": "2026-08-26/782562ae-acdc-4b2d-b89a-22e1b4471c09.jpeg",
    "element_scores": {
      "wood": 100,
      "fire": 0,
      "earth": 50,
      "metal": 10,
      "water": 70
    },
    "subject_labels": [
      "bodhisattva",
      "pine",
      "crane",
      "stream",
      "deer"
    ],
    "scene": {
      "en": "a seated bodhisattva beneath a pine, with a crane, deer and flowing stream",
      "zh-Hant": "松下坐像、白鶴、鹿與流溪",
      "zh-Hans": "松下坐像、白鹤、鹿与流溪"
    }
  },
  {
    "id": "e7905ff8-9732-4392-8c35-dd57d8643cc1",
    "storage_path": "2026-08-26/15718136-cd48-41fa-8890-6c598baf9825.png",
    "element_scores": {
      "wood": 5,
      "fire": 0,
      "earth": 15,
      "metal": 30,
      "water": 100
    },
    "subject_labels": [
      "water dragons",
      "bodhisattva",
      "waves"
    ],
    "scene": {
      "en": "a small central figure encircled by water dragons and blue waves",
      "zh-Hant": "中央小像、環繞的水龍與碧藍波浪",
      "zh-Hans": "中央小像、环绕的水龙与碧蓝波浪"
    }
  },
  {
    "id": "b64f41e1-8df6-436f-a86d-2b89f900a4d8",
    "storage_path": "2026-08-26/01c60a2c-6488-4aa3-a610-8441742f071b.jpeg",
    "element_scores": {
      "wood": 0,
      "fire": 0,
      "earth": 15,
      "metal": 95,
      "water": 80
    },
    "subject_labels": [
      "white figure",
      "white lotus",
      "blue water"
    ],
    "scene": {
      "en": "a white seated figure, white lotus flowers and cool blue water",
      "zh-Hant": "白色坐像、白蓮與清藍水色",
      "zh-Hans": "白色坐像、白莲与清蓝水色"
    }
  },
  {
    "id": "f7b94256-8d3f-4401-b744-ba360a7d95d5",
    "storage_path": "2026-08-26/c5713d5c-9f38-4cf3-8cab-7746f13d3b39.png",
    "element_scores": {
      "wood": 15,
      "fire": 100,
      "earth": 60,
      "metal": 10,
      "water": 0
    },
    "subject_labels": [
      "guardian",
      "flames",
      "dark rock"
    ],
    "scene": {
      "en": "a small guardian with rising flames above dark rock",
      "zh-Hant": "立於深色岩石上的小守護者與升騰火焰",
      "zh-Hans": "立于深色岩石上的小守护者与升腾火焰"
    }
  },
  {
    "id": "f4487f97-29f4-4d90-a11c-680ec2dfee69",
    "storage_path": "2026-08-26/8204e8f3-25e2-413c-9b39-897d89c49f4f.png",
    "element_scores": {
      "wood": 10,
      "fire": 5,
      "earth": 35,
      "metal": 40,
      "water": 100
    },
    "subject_labels": [
      "dragon",
      "water",
      "cloud"
    ],
    "scene": {
      "en": "a coiling blue-green dragon surrounded by waves and clouds",
      "zh-Hant": "青藍盤龍、波浪與雲氣",
      "zh-Hans": "青蓝盘龙、波浪与云气"
    }
  }
];
export function reviewedPersonalArt(asset:{id:string;storage_path:string}):ReviewedPersonalArt|undefined {
 return REVIEWED_PERSONAL_ART.find(row=>row.id===asset.id && row.storage_path===asset.storage_path);
}
export function reviewedPersonalKnowledge<T extends {analysis_status?:string;subject_labels?:string[]}>(asset:{id:string;storage_path:string}, knowledge:T):T|null {
 const review=reviewedPersonalArt(asset);
 if(review) return {...knowledge,element_scores:review.element_scores,subject_labels:review.subject_labels,motifs:review.subject_labels,summary:review.scene.en,style_labels:['reviewed artwork'],analysis_status:'approved',client_eligible:true,confidence:1};
 // Empty pixel-profile labels are not evidence of the picture's subject.
 return knowledge.analysis_status==='approved' && Boolean(knowledge.subject_labels?.length) ? knowledge : null;
}
