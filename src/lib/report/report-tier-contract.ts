export const REPORT_TIER_CONTRACT_ID = "ZW-REPORT-TIERS-2.0" as const;
export const PAID_DECREE_STYLE_ID = "ZW-PAID-SONG-HEAVEN-EARTH-2.0" as const;

/**
 * Product staging contract. Checkout is deliberately disabled until a server-side
 * payment entitlement exists; a client-only button is not a payment gate.
 */
export const reportTierContract = {
  id: REPORT_TIER_CONTRACT_ID,
  free: {
    id: "ZW-FREE-RESULT-2.0",
    status: "production",
    visual: "轻量漫画百科信息卡",
    generatedImage: false,
    includes: ["直接答案", "四柱概览", "两句个人命辞"],
  },
  paid: {
    id: "ZW-PAID-REPORT-2.0",
    status: "staged",
    checkoutEnabled: false,
    ownerPreviewOnly: true,
    visual: "昭梧・宋式天地化形",
    decreeStyleId: PAID_DECREE_STYLE_ID,
    includes: ["问题导向完整报告", "9:16宋式天地化形主图", "画面元素解码", "现实行动提示"],
    imageLogic: [
      "月令与寒暖燥湿决定天地气候",
      "根气、透藏与来源决定山水起点",
      "合冲刑害库决定地形、蓄泄与动势",
      "病药与流通决定阻塞、出口和最终光源",
      "只画命局实际成立的主体与辅象",
    ],
  },
} as const;

export function canPreviewStagedPaidReport(isOwner: boolean | null | undefined): boolean {
  return reportTierContract.paid.ownerPreviewOnly && isOwner === true;
}

