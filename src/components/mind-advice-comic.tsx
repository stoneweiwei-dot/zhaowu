import type { AnalysisResult } from "@/lib/bazi/types";
import { buildMindAdviceComic } from "@/lib/report/mind-advice-comic";

function Scene({ scene }: { scene: ReturnType<typeof buildMindAdviceComic>["scene"] }) {
  if (scene === "relationship") {
    return (
      <div className="zhaowu-comic-scene zhaowu-comic-scene-relationship" aria-hidden="true">
        <div className="zhaowu-comic-person is-orange"><span /></div>
        <div className="zhaowu-comic-boundary">✋</div>
        <div className="zhaowu-comic-person is-blue"><span /></div>
      </div>
    );
  }
  if (scene === "body") {
    return (
      <div className="zhaowu-comic-scene" aria-hidden="true">
        <div className="zhaowu-comic-cloud">•••</div>
        <div className="zhaowu-comic-person is-orange is-tense"><span /></div>
        <div className="zhaowu-comic-arrow">→</div>
        <div className="zhaowu-comic-person is-blue is-calm"><span /></div>
      </div>
    );
  }
  if (scene === "action") {
    return (
      <div className="zhaowu-comic-scene" aria-hidden="true">
        <div className="zhaowu-comic-person is-orange"><span /></div>
        <div className="zhaowu-comic-steps"><i /><i /><i /></div>
        <div className="zhaowu-comic-person is-blue"><span /></div>
      </div>
    );
  }
  if (scene === "self") {
    return (
      <div className="zhaowu-comic-scene" aria-hidden="true">
        <div className="zhaowu-comic-cloud">☁</div>
        <div className="zhaowu-comic-person is-blue is-calm"><span /></div>
        <div className="zhaowu-comic-cloud is-drifting">☁</div>
      </div>
    );
  }
  return (
    <div className="zhaowu-comic-scene zhaowu-comic-scene-everyday" aria-hidden="true">
      <div className="zhaowu-comic-car">▭</div>
      <div className="zhaowu-comic-person is-orange is-tense"><span /></div>
      <div className="zhaowu-comic-arrow">→</div>
      <div className="zhaowu-comic-person is-blue is-calm"><span /></div>
      <div className="zhaowu-comic-dishes">◯◯</div>
    </div>
  );
}

export function MindAdviceComic({ result }: { result: AnalysisResult }) {
  const comic = buildMindAdviceComic(result);

  return (
    <aside className="zhaowu-mind-comic" aria-label="Bilingual reflection comic">
      <div className="zhaowu-mind-comic-head">
        <span>昭梧 · 修心一圖</span>
        <span>ZHAOWU · REFLECTION</span>
      </div>

      <Scene scene={comic.scene} />

      <div className="zhaowu-mind-comic-copy">
        <p className="zhaowu-mind-comic-zh">{comic.zh}</p>
        <p className="zhaowu-mind-comic-en">{comic.en}</p>
      </div>

      <div className="zhaowu-mind-comic-watermark">STONE 原創</div>
    </aside>
  );
}
