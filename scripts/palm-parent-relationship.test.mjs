import assert from "node:assert/strict";
import test from "node:test";
import { buildPalm } from "../src/lib/yizhangjing/engine.ts";
import { parentRelationship } from "../src/lib/palm/parent-relationship.ts";

const identities = {
  buddhistWoman: ["holding", "佛道 · 女居士（佛女）aka 報恩小棉襖",
    "天生帶著長輩緣，走到哪都被誇懂事，是全家最省心的孩子；但讓人放心久了，委屈也習慣自己吞。"],
  buddhistMan: ["holding", "佛道 · 男居士（佛男）aka 好命天花板",
    "在滿滿的善意裡長大，小時候闖過的禍總有人收拾，長大才發現那叫福氣；你天生被疼，也天生懂得把疼愛傳下去。"],
  immortalWoman: ["holding", "仙道 · 仙女 aka 家族的驕傲",
    "聰明、會讀書，親戚口中的模範生、全家的驕傲；但你要的從來不是掌聲，而是爸媽真的看見你、懂你在想什麼。"],
  immortalMan: ["holding", "仙道 · 仙男 aka 長輩的開心果",
    "天生跟長輩頻率合，家族聚會少了你就冷場；孝順對你來說不是義務，是真心捨不得，越長大越得長輩疼。"],
  merchant: ["holding", "人道 · 生意人 aka 思路超前小孩",
    "從小很有主見，不愛被安排，凡事要自己試過才服氣；爸媽嘴上嫌你固執，心裡最放心把家交給你。"],
  asuraMan: ["space", "阿修羅道 · 男修羅 aka 管不住的野孩子",
    "一刻都坐不住，點子比誰都多，常被罵「不聽話」，小時候的你是家裡最會出狀況的那個；闖過的禍，後來都成了你的膽識。"],
  earthGod: ["space", "餓鬼道 · 土地公（福鬼）aka 獨立生存戰士",
    "很早就懂得看大人臉色、替家裡分憂；長大後人在外地，電話裡永遠說「我很好，不用擔心」，報喜不報憂。"],
  asuraWoman: ["space", "阿修羅道 · 女修羅 aka 傲嬌小才女",
    "不愛被管、只想被欣賞，嘴上不撒嬌，你用成績和作品證明自己；跟爸媽最好的距離，是各自欣賞、互不干涉。"],
  ghost: ["tension", "餓鬼道 · 餓鬼 aka 全家情緒海綿",
    "小時候吃過苦，所以特別珍惜家，家裡最辛苦的那段日子，總是你陪著撐過來；你習慣先照顧所有人，最後才想到自己。"],
  herbivore: ["tension", "動物道 · 草食動物 aka 付出型孝子",
    "孝順得讓人心疼，溫馴是你的保護色；你的孝順像空氣，存在感很低，少了卻不行，家裡大小事都往身上攬，卻很少有人問你累不累。"],
  monastic: ["tension", "人道 · 出家人 aka 高冷型孩子",
    "不撒嬌、不訴苦，從小就習慣一個人待著，家人常說你「跟我們不親」；你愛家的方式很安靜，安靜到常被誤會。"],
  carnivore: ["tension", "動物道 · 肉食動物 aka 火爆護家小老虎",
    "門檻高、話頂過，脾氣跟爸媽一模一樣，所以最常起衝突；你們不是不合，是太像了，但誰敢說你家人一句不是，你第一個衝出去。"],
};

const patterns = {
  holding: ["牽手型", "前四世積攢的福報，讓你這輩子投胎到懂你、撐你的家。",
    "大家都羨慕你家庭和樂、被捧在手心，只有你知道，不想讓爸媽失望的壓力，從來沒有少過。"],
  space: ["鬆手型", "被生活推著早早長大，跟家人時近時遠，抓對距離反而最親。",
    "你不是不愛家，只是愛的方式跟爸媽的期待對不上。保持一點距離不是疏遠，是讓這份親情走得更遠。"],
  tension: ["拉扯型", "親緣多磨、聚少離多，不是不孝，是這一世要修的家庭功課。",
    "你常懷疑是不是自己不夠好，才跟家人走不近。其實緣淡不等於不孝，在愛與界線之間找到平衡，就是這一世最大的功課。"],
};

const cases = [
  ["子", "buddhistMan", "buddhistWoman"], ["丑", "ghost", "ghost"],
  ["寅", "merchant", "merchant"], ["卯", "herbivore", "herbivore"],
  ["辰", "asuraMan", "asuraWoman"], ["巳", "immortalMan", "immortalWoman"],
  ["午", "buddhistMan", "buddhistWoman"], ["未", "earthGod", "earthGod"],
  ["申", "monastic", "monastic"], ["酉", "carnivore", "carnivore"],
  ["戌", "asuraMan", "asuraWoman"], ["亥", "immortalMan", "immortalWoman"],
];

for (const [index, [branch, male, female]] of cases.entries()) {
  for (const [gender, id] of [["male", male], ["female", female]]) {
    test(`年宮 ${branch} · ${gender} · ${id}`, () => {
      const reading = buildPalm({ year: 2008 + index, month: 6, day: 15, hour: 10, timeUnknown: false, gender });
      const year = reading.palaces.find(p => p.key === "year");
      assert.equal(year.zhi, branch);
      const [pattern, identity, personality] = identities[id];
      const [type, dynamic, voice] = patterns[pattern];
      const report = parentRelationship(reading, "zh-Hant");
      const values = Object.fromEntries(report.fields);
      assert.equal(values["你的年宮"], `${branch}宮 / ${year.star} / ${year.dao}`);
      assert.equal(values["你的類型"], type);
      assert.equal(values["你的身份"], identity);
      assert.equal(values["性格解析"], personality);
      assert.equal(values["你和爸媽的相處模式"], dynamic);
      assert.equal(values["你的心聲"], voice);
      assert.equal(report.source, "年宮（前世第四世）");
      assert.equal(report.closing, "達摩一掌經為傳統民俗論命法，內容僅供參考，命運掌握在自己手中。");
      for (const locale of ["zh-Hant", "zh-Hans", "en"]) {
        const translated = parentRelationship(reading, locale);
        assert.equal(translated.fields.length, 7);
        assert.equal(new Set(translated.fields.map(([label]) => label)).size, 7);
        for (const text of [translated.title, translated.source, translated.closing, ...translated.fields.flat()]) {
          assert.ok(text.trim());
          if (locale === "en") assert.doesNotMatch(text, /\p{Script=Han}/u);
        }
        assert.deepEqual(parentRelationship({ ...reading, palaces: [year] }, locale), translated);
      }
      assert.equal(parentRelationship({ ...reading, palaces: reading.palaces.slice(1) }, "en"), null);
    });
  }
}

test("Gregorian dates on either side of Lunar New Year use the engine's year palace", () => {
  const input = { year: 2024, month: 2, hour: 10, timeUnknown: true, gender: "female" };
  for (const [day, identity] of [[9, identities.herbivore], [10, identities.asuraWoman]]) {
    const report = parentRelationship(buildPalm({ ...input, day }), "zh-Hant");
    assert.equal(Object.fromEntries(report.fields)["你的身份"], identity[1]);
  }
});
