import { useEffect, useMemo, useState } from 'react';
import type { Chart } from '@/lib/bazi/types';
import { useI18n } from '@/lib/i18n';
import { characterFacts, chartTerm } from '@/lib/bazi/presentation';
import { loadCustomerGalleryCandidates, type CustomerGalleryArt } from '@/lib/gallery-match';
import { isCharacterPanelVisualEligible } from '@/lib/report/character-panel-visual-contract';
import { rankPersonalArt, personalArtReason, downloadPersonalArt } from '@/lib/report/personal-art';

export function CharacterPanel({chart,question='',portraitUrl,selectedAssetId,onGenerate,generating=false,onImageError}:{chart:Chart;question?:string;portraitUrl?:string|null;selectedAssetId?:string|null;onGenerate?:()=>void;generating?:boolean;onImageError?:()=>void}) {
  const {locale}=useI18n();const en=locale==='en',hans=locale==='zh-Hans';
  const [matches,setMatches]=useState<CustomerGalleryArt[]>([]);
  const [loading,setLoading]=useState(true);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [failed,setFailed]=useState<string[]>([]);
  useEffect(()=>{let active=true;setLoading(true);setMatches([]);setFailed([]);
    void loadCustomerGalleryCandidates().then(rows=>{if(active)setMatches(rankPersonalArt(chart,rows));}).catch(()=>{}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[chart]);
  const chosen=useMemo(()=>matches.find(m=>m.asset.id===selectedAssetId&&!failed.includes(m.imageUrl))??matches.find(m=>!failed.includes(m.imageUrl))??null,[matches,selectedAssetId,failed]);
  const generated=Boolean(portraitUrl && !failed.includes(portraitUrl) && isCharacterPanelVisualEligible({storage_path:portraitUrl}));
  const src=generated?portraitUrl:chosen?.imageUrl;
  const title=chartTerm(chart.pillars.find(p=>p.key==='day')?.nayin??'',locale);
  const generatedReason=en?'This image brings together the birth-chart setting and the question in this report. It is a symbolic interpretation, not a likeness or a confirmed spiritual identity.':hans?'这张图把本次出生盘面与所问之事收进一个画面，作为命局的象征性表达；不代表真实长相，也不认定宗教身份。':'這張圖把本次出生盤面與所問之事收進一個畫面，作為命局的象徵性表達；不代表真實長相，也不認定宗教身份。';
  const reason=generated?generatedReason:chosen?personalArtReason(chart,question,chosen,locale):'';
  async function save(){if(!src)return;setBusy(true);setMessage('');try{await downloadPersonalArt(chart,locale,src,reason);setMessage(en?'Image download started.':hans?'已开始下载图片。':'已開始下載圖片。');}catch{setMessage(en?'The image could not be saved. Please try again.':hans?'图片暂时无法保存，请重试。':'圖片暫時無法保存，請重試。');}finally{setBusy(false);}}
  return <article className="zhaowu-personal-art seal-border" aria-label={en?'Your chart in an image':'你的命象'}>
    <header><p className="zhaowu-section-kicker">ZHAOWU · {en?'YOUR IMAGE':'命象'}</p><h2>{title}</h2></header>
    <dl className="zhaowu-facts">{characterFacts(chart,locale).map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
    {src?<figure><img src={src} alt={en?'Artwork accompanying your chart':hans?'与本次命盘相应的画作':'與本次命盤相應的畫作'} loading="lazy" onError={()=>{setFailed(old=>[...old,src]);if(generated)onImageError?.();}}/><figcaption><h3>{en?'Why this image':hans?'为什么是这张图':'為什麼是這張圖'}</h3><p>{reason}</p></figcaption></figure>:<p>{loading?(en?'Finding an image for your chart…':hans?'正在为你的命盘选图…':'正在為你的命盤選圖…'):(en?'No suitable image is available right now. Your chart and reading remain available.':hans?'暂时没有可用的合适图片，命盘与文字报告仍可阅读。':'暫時沒有可用的合適圖片，命盤與文字報告仍可閱讀。')}</p>}
    <div className="zhaowu-personal-art-actions">{onGenerate?<button type="button" disabled={generating} onClick={onGenerate}>{generating?(en?'Creating your image…':hans?'正在制作命象…':'正在製作命象…'):(en?'Create my personal image':hans?'制作我的专属命象':'製作我的專屬命象')}</button>:null}{src?<button type="button" disabled={busy} onClick={()=>void save()}>{busy?(en?'Preparing…':hans?'正在准备…':'正在準備…'):(en?'Save image · 9:16':hans?'保存命象 · 9:16':'保存命象 · 9:16')}</button>:null}</div>
    {message?<p role="status">{message}</p>:null}
  </article>;
}
