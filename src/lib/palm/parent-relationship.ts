import type { PalmReading } from "@/lib/core/types";
import type { Locale } from "@/lib/i18n";
import { presentPalmPalace } from "./standalone-presentation";

function translation(traditional: string, simplified: string, en: string): Record<Locale, string> {
  return { "zh-Hant": traditional, "zh-Hans": simplified, en };
}

const labels = {
  title: translation("前世今生之父母緣分圖鑑", "前世今生之父母缘分图鉴", "Your bond with your parents across lifetimes"),
  source: translation("年宮（前世第四世）", "年宫（前世第四世）", "Year palace (four lives ago)"),
  year: translation("你的年宮", "你的年宫", "Your year palace"),
  type: translation("你的類型", "你的类型", "Your relationship pattern"),
  identity: translation("你的身份", "你的身份", "Your symbolic identity"),
  personality: translation("性格解析", "性格解析", "Your personality"),
  dynamic: translation("你和爸媽的相處模式", "你和爸妈的相处模式", "How you and your parents relate"),
  voice: translation("你的心聲", "你的心声", "What’s on your mind"),
  reminder: translation("給你的一句提醒", "给你的一句提醒", "A thought to take with you"),
  closing: translation("達摩一掌經為傳統民俗論命法，內容僅供參考，命運掌握在自己手中。", "达摩一掌经为传统民俗论命法，内容仅供参考，命运掌握在自己手中。", "Dharma Palm is a traditional folk reading offered for reflection. Your path is yours to choose."),
};

const patterns = {
  holding: {
    type: translation(
      "牽手型",
      "牵手型",
      "Hand in hand",
    ),
    dynamic: translation(
      "前四世積攢的福報，讓你這輩子投胎到懂你、撐你的家。",
      "前四世积攒的福报，让你这辈子投胎到懂你、撑你的家。",
      "In this tradition, the kindness gathered over four earlier lives brings you to a family that understands you and stands by you.",
    ),
    voice: translation(
      "大家都羨慕你家庭和樂、被捧在手心，只有你知道，不想讓爸媽失望的壓力，從來沒有少過。",
      "大家都羡慕你家庭和乐、被捧在手心，只有你知道，不想让爸妈失望的压力，从来没有少过。",
      "Others see a happy family and how cherished you are. Only you know how much you worry about letting your parents down.",
    ),
  },
  space: {
    type: translation(
      "鬆手型",
      "松手型",
      "Room to grow",
    ),
    dynamic: translation(
      "被生活推著早早長大，跟家人時近時遠，抓對距離反而最親。",
      "被生活推着早早长大，跟家人时近时远，抓对距离反而最亲。",
      "Life asked you to grow up early. Closeness comes and goes in your family, and a little breathing room can help you feel closer.",
    ),
    voice: translation(
      "你不是不愛家，只是愛的方式跟爸媽的期待對不上。保持一點距離不是疏遠，是讓這份親情走得更遠。",
      "你不是不爱家，只是爱的方式跟爸妈的期待对不上。保持一点距离不是疏远，是让这份亲情走得更远。",
      "You love your family, even when the way you show it differs from what your parents expect. A little space can help that affection last.",
    ),
  },
  tension: {
    type: translation(
      "拉扯型",
      "拉扯型",
      "Push and pull",
    ),
    dynamic: translation(
      "親緣多磨、聚少離多，不是不孝，是這一世要修的家庭功課。",
      "亲缘多磨、聚少离多，不是不孝，是这一世要修的家庭功课。",
      "Your bond has weathered rough stretches, with more time apart than together. Finding your way back to each other is part of this life’s family story, however much you care.",
    ),
    voice: translation(
      "你常懷疑是不是自己不夠好，才跟家人走不近。其實緣淡不等於不孝，在愛與界線之間找到平衡，就是這一世最大的功課。",
      "你常怀疑是不是自己不够好，才跟家人走不近。其实缘淡不等于不孝，在爱与界线之间找到平衡，就是这一世最大的功课。",
      "When closeness feels hard, you sometimes wonder if you’re good enough. Distance says little about your love. Finding a balance between care and boundaries is the work of a lifetime.",
    ),
  },
};

const identities = {
  buddhistWoman: {
    pattern: "holding",
    identity: translation(
      "佛道 · 女居士（佛女）aka 報恩小棉襖",
      "佛道 · 女居士（佛女）aka 报恩小棉袄",
      "Buddha realm · Laywoman, the daughter who gives back",
    ),
    personality: translation(
      "天生帶著長輩緣，走到哪都被誇懂事，是全家最省心的孩子；但讓人放心久了，委屈也習慣自己吞。",
      "天生带着长辈缘，走到哪都被夸懂事，是全家最省心的孩子；但让人放心久了，委屈也习惯自己吞。",
      "Your elders have always found you easy to love. Everyone praises how considerate you are. After years of being the child nobody worries about, you may have learned to keep your hurts to yourself.",
    ),
    reminder: translation(
      "下次心裡有點委屈時，也可以讓喜歡照顧你的那個人知道。",
      "下次心里有点委屈时，也可以让喜欢照顾你的那个人知道。",
      "When something hurts, you can tell someone who loves looking after you.",
    ),
  },
  buddhistMan: {
    pattern: "holding",
    identity: translation(
      "佛道 · 男居士（佛男）aka 好命天花板",
      "佛道 · 男居士（佛男）aka 好命天花板",
      "Buddha realm · Layman, the lucky one",
    ),
    personality: translation(
      "在滿滿的善意裡長大，小時候闖過的禍總有人收拾，長大才發現那叫福氣；你天生被疼，也天生懂得把疼愛傳下去。",
      "在满满的善意里长大，小时候闯过的祸总有人收拾，长大才发现那叫福气；你天生被疼，也天生懂得把疼爱传下去。",
      "You grew up surrounded by kindness. Someone always helped put things right after your childhood scrapes. Only later did you realise what a gift that was. Being cared for taught you how to care for others.",
    ),
    reminder: translation(
      "想起誰曾替你收拾殘局時，一句遲來的謝謝也會很暖。",
      "想起谁曾替你收拾残局时，一句迟来的谢谢也会很暖。",
      "If you remember someone who helped pick up the pieces, there’s still time to thank them.",
    ),
  },
  immortalWoman: {
    pattern: "holding",
    identity: translation(
      "仙道 · 仙女 aka 家族的驕傲",
      "仙道 · 仙女 aka 家族的骄傲",
      "Immortal realm · Female immortal, the pride of the family",
    ),
    personality: translation(
      "聰明、會讀書，親戚口中的模範生、全家的驕傲；但你要的從來不是掌聲，而是爸媽真的看見你、懂你在想什麼。",
      "聪明、会读书，亲戚口中的模范生、全家的骄傲；但你要的从来不是掌声，而是爸妈真的看见你、懂你在想什么。",
      "You picked things up quickly at school. Relatives held you up as an example, and the whole family was proud. What you wanted most was for your parents to see the person behind the praise and hear what was on your mind.",
    ),
    reminder: translation(
      "你可以和爸媽聊聊最近著迷的小事，讓他們認識成績以外的你。",
      "你可以和爸妈聊聊最近着迷的小事，让他们认识成绩以外的你。",
      "Try telling your parents about something you love that has nothing to do with grades.",
    ),
  },
  immortalMan: {
    pattern: "holding",
    identity: translation(
      "仙道 · 仙男 aka 長輩的開心果",
      "仙道 · 仙男 aka 长辈的开心果",
      "Immortal realm · Male immortal, the one who makes everyone laugh",
    ),
    personality: translation(
      "天生跟長輩頻率合，家族聚會少了你就冷場；孝順對你來說不是義務，是真心捨不得，越長大越得長輩疼。",
      "天生跟长辈频率合，家族聚会少了你就冷场；孝顺对你来说不是义务，是真心舍不得，越长大越得长辈疼。",
      "You and your elders get each other. Family gatherings feel quieter without you. You spend time with them out of affection, and that fondness has only grown as you’ve got older.",
    ),
    reminder: translation(
      "偶爾安靜地坐在長輩身邊，也是一種很親的陪伴。",
      "偶尔安静地坐在长辈身边，也是一种很亲的陪伴。",
      "On quieter days, just sitting beside someone you love can be enough.",
    ),
  },
  merchant: {
    pattern: "holding",
    identity: translation(
      "人道 · 生意人 aka 思路超前小孩",
      "人道 · 生意人 aka 思路超前小孩",
      "Human realm · Merchant, the kid who thinks ahead",
    ),
    personality: translation(
      "從小很有主見，不愛被安排，凡事要自己試過才服氣；爸媽嘴上嫌你固執，心裡最放心把家交給你。",
      "从小很有主见，不爱被安排，凡事要自己试过才服气；爸妈嘴上嫌你固执，心里最放心把家交给你。",
      "Even as a child, you had ideas of your own. You wanted to try things for yourself before taking anyone’s word for them. Your parents may call you stubborn, yet you’re the one they trust to look after things at home.",
    ),
    reminder: translation(
      "下次想自己試試時，可以邀爸媽聽聽你是怎麼想到的。",
      "下次想自己试试时，可以邀爸妈听听你是怎么想到的。",
      "When you want to try something your way, you might share what first gave you the idea.",
    ),
  },
  asuraMan: {
    pattern: "space",
    identity: translation(
      "阿修羅道 · 男修羅 aka 管不住的野孩子",
      "阿修罗道 · 男修罗 aka 管不住的野孩子",
      "Asura realm · Male asura, the wild child",
    ),
    personality: translation(
      "一刻都坐不住，點子比誰都多，常被罵「不聽話」，小時候的你是家裡最會出狀況的那個；闖過的禍，後來都成了你的膽識。",
      "一刻都坐不住，点子比谁都多，常被骂「不听话」，小时候的你是家里最会出状况的那个；闯过的祸，后来都成了你的胆识。",
      "You could never sit still and always had another idea. As the child most likely to land in a scrape, you heard “Why won’t you listen?” a lot. Those misadventures helped you find your courage.",
    ),
    reminder: translation(
      "你可以保有冒險的勇氣，也可以讓在意你的人知道你平安。",
      "你可以保有冒险的勇气，也可以让在意你的人知道你平安。",
      "There’s room for adventure and for a quick message to let someone know you’re safe.",
    ),
  },
  earthGod: {
    pattern: "space",
    identity: translation(
      "餓鬼道 · 土地公（福鬼）aka 獨立生存戰士",
      "饿鬼道 · 土地公（福鬼）aka 独立生存战士",
      "Hungry ghost realm · Earth guardian, the self-reliant one",
    ),
    personality: translation(
      "很早就懂得看大人臉色、替家裡分憂；長大後人在外地，電話裡永遠說「我很好，不用擔心」，報喜不報憂。",
      "很早就懂得看大人脸色、替家里分忧；长大后人在外地，电话里永远说「我很好，不用担心」，报喜不报忧。",
      "You learned early to read the adults’ faces and ease their worries. Now, calling home from far away, you always say “I’m fine, don’t worry.” They hear the good news and rarely the hard parts.",
    ),
    reminder: translation(
      "打電話回家時，也可以挑一件小煩惱讓對方陪你聊聊。",
      "打电话回家时，也可以挑一件小烦恼让对方陪你聊聊。",
      "On your next call home, you might share one small worry and let someone keep you company.",
    ),
  },
  asuraWoman: {
    pattern: "space",
    identity: translation(
      "阿修羅道 · 女修羅 aka 傲嬌小才女",
      "阿修罗道 · 女修罗 aka 傲娇小才女",
      "Asura realm · Female asura, the quietly proud young talent",
    ),
    personality: translation(
      "不愛被管、只想被欣賞，嘴上不撒嬌，你用成績和作品證明自己；跟爸媽最好的距離，是各自欣賞、互不干涉。",
      "不爱被管、只想被欣赏，嘴上不撒娇，你用成绩和作品证明自己；跟爸妈最好的距离，是各自欣赏、互不干涉。",
      "You want your parents to appreciate what you can do and give you room to do it. Your work and achievements speak for you. You feel closest when you can admire each other without stepping in.",
    ),
    reminder: translation(
      "你可以選一件自己喜歡的作品，告訴爸媽哪一處最讓你得意。",
      "你可以选一件自己喜欢的作品，告诉爸妈哪一处最让你得意。",
      "You might show your parents something you made and point out the part you’re proudest of.",
    ),
  },
  ghost: {
    pattern: "tension",
    identity: translation(
      "餓鬼道 · 餓鬼 aka 全家情緒海綿",
      "饿鬼道 · 饿鬼 aka 全家情绪海绵",
      "Hungry ghost realm · Hungry ghost, the family’s emotional sponge",
    ),
    personality: translation(
      "小時候吃過苦，所以特別珍惜家，家裡最辛苦的那段日子，總是你陪著撐過來；你習慣先照顧所有人，最後才想到自己。",
      "小时候吃过苦，所以特别珍惜家，家里最辛苦的那段日子，总是你陪着撑过来；你习惯先照顾所有人，最后才想到自己。",
      "Childhood hardship made home precious to you. You stayed alongside your family through the worst days. Looking after everyone else comes so naturally that your own needs are often the last you notice.",
    ),
    reminder: translation(
      "照顧了大家一整天，也可以留一餐飯的時間好好照顧自己。",
      "照顾了大家一整天，也可以留一餐饭的时间好好照顾自己。",
      "After a day spent caring for everyone, you deserve time to sit down to a meal of your own.",
    ),
  },
  herbivore: {
    pattern: "tension",
    identity: translation(
      "動物道 · 草食動物 aka 付出型孝子",
      "动物道 · 草食动物 aka 付出型孝子",
      "Animal realm · Herbivore, the child who quietly gives",
    ),
    personality: translation(
      "孝順得讓人心疼，溫馴是你的保護色；你的孝順像空氣，存在感很低，少了卻不行，家裡大小事都往身上攬，卻很少有人問你累不累。",
      "孝顺得让人心疼，温驯是你的保护色；你的孝顺像空气，存在感很低，少了却不行，家里大小事都往身上揽，却很少有人问你累不累。",
      "Gentleness has been your way of staying safe. The care you give is like air at home: easy to overlook and impossible to do without. You take on jobs big and small, yet people rarely ask if you’re tired.",
    ),
    reminder: translation(
      "挑一件平常默默做的家事，試著請家人和你一起完成。",
      "挑一件平常默默做的家事，试着请家人和你一起完成。",
      "You might ask someone to join you for one chore you usually do alone.",
    ),
  },
  monastic: {
    pattern: "tension",
    identity: translation(
      "人道 · 出家人 aka 高冷型孩子",
      "人道 · 出家人 aka 高冷型孩子",
      "Human realm · Monastic, the reserved child",
    ),
    personality: translation(
      "不撒嬌、不訴苦，從小就習慣一個人待著，家人常說你「跟我們不親」；你愛家的方式很安靜，安靜到常被誤會。",
      "不撒娇、不诉苦，从小就习惯一个人待着，家人常说你「跟我们不亲」；你爱家的方式很安静，安静到常被误会。",
      "Since childhood you’ve liked time alone and kept your troubles to yourself. Your family sometimes says, “You don’t seem close to us.” You love them in quiet ways that are easily missed.",
    ),
    reminder: translation(
      "想念家人時，傳一張路上拍的照片也能讓心意被看見。",
      "想念家人时，传一张路上拍的照片也能让心意被看见。",
      "When you miss someone at home, a photo from your walk can tell them they’re on your mind.",
    ),
  },
  carnivore: {
    pattern: "tension",
    identity: translation(
      "動物道 · 肉食動物 aka 火爆護家小老虎",
      "动物道 · 肉食动物 aka 火爆护家小老虎",
      "Animal realm · Carnivore, the fiercely protective tiger cub",
    ),
    personality: translation(
      "門檻高、話頂過，脾氣跟爸媽一模一樣，所以最常起衝突；你們不是不合，是太像了，但誰敢說你家人一句不是，你第一個衝出去。",
      "门槛高、话顶过，脾气跟爸妈一模一样，所以最常起冲突；你们不是不合，是太像了，但谁敢说你家人一句不是，你第一个冲出去。",
      "You set the bar high and answer back. You and your parents share a quick temper, and that resemblance can spark arguments. Yet if anyone speaks ill of your family, you’re the first to stand up for them.",
    ),
    reminder: translation(
      "下次話到嘴邊，可以先說出那句藏在火氣裡的擔心。",
      "下次话到嘴边，可以先说出那句藏在火气里的担心。",
      "When you feel your temper rising, you might start by naming the worry underneath.",
    ),
  },
} as const;

function yearIdentity(branch: string, forward: boolean): keyof typeof identities | undefined {
  switch (branch) {
    case "子":
    case "午": return forward ? "buddhistMan" : "buddhistWoman";
    case "巳":
    case "亥": return forward ? "immortalMan" : "immortalWoman";
    case "辰":
    case "戌": return forward ? "asuraMan" : "asuraWoman";
    case "寅": return "merchant";
    case "丑": return "ghost";
    case "未": return "earthGod";
    case "卯": return "herbivore";
    case "酉": return "carnivore";
    case "申": return "monastic";
  }
}

export function parentRelationship(reading: PalmReading, locale: Locale) {
  const year = reading.palaces.find((palace) => palace.key === "year");
  if (!year || reading.forward === null) return null;
  const id = yearIdentity(year.zhi, reading.forward);
  if (!id) return null;

  const identity = identities[id];
  const pattern = patterns[identity.pattern];
  const palace = presentPalmPalace(year, locale);
  const branch = locale === "en" ? palace.zhi : palace.zhi + (locale === "zh-Hans" ? "宫" : "宮");
  return {
    title: labels.title[locale],
    source: labels.source[locale],
    fields: [
      [labels.year[locale], [branch, palace.star, palace.dao].join(" / ")],
      [labels.type[locale], pattern.type[locale]],
      [labels.identity[locale], identity.identity[locale]],
      [labels.personality[locale], identity.personality[locale]],
      [labels.dynamic[locale], pattern.dynamic[locale]],
      [labels.voice[locale], pattern.voice[locale]],
      [labels.reminder[locale], identity.reminder[locale]],
    ],
    closing: labels.closing[locale],
  };
}
