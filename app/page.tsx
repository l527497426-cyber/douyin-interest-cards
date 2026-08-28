"use client";

import { type CSSProperties, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Blaze from "../components/canvasui/Blaze";
import Liquid, { type LiquidOptions } from "../components/canvasui/Liquid";

const CREATE_URL = "https://creator.douyin.com/creator-micro/ai-application/agent_market?_withType=true&space=%22ai_ext_personal%22";
// The portal starts at reference frame 187/193, mapped into the video's 82% scrub range.
const HERO_PORTAL_START_SCROLL_PROGRESS=.794;
const HERO_PORTAL_END_SCROLL_PROGRESS=.98;
const HERO_VIDEO_END_SCROLL_PROGRESS=.82;
const HERO_LIQUID_END_PORTAL_PROGRESS=.7;
const HERO_FRAME_COUNT=193;
const heroFrameSrc=(index:number)=>`/assets/hero-frames-v4/frame-${String(index+1).padStart(3,"0")}.webp`;
const INTEREST_AUTOPLAY_MS=8000;
const interestDirections = [
  {
    name: "网球",
    title: "把第一次下场，\n做成人人都能参与的选择",
    desc: "从新手入门、装备选择到球场体验，真实问题就是可以被回应的新玩法。",
    userAvatar: "/assets/voice-avatar-01.jpg",
    userHandle: "@小林第一次打网球",
    userQuote: "第一次买球拍，\n哪支球拍更适合我？",
    creatorAvatar: "/assets/voice-avatar-08.png",
    creatorHandle: "@网球拍研究所",
    creatorQuote: "大家问得最多的是：\n这支球拍适不适合我？",
    panelBase: "#ffffff", panelA: "#2475e8", panelB: "transparent", panelC: "transparent", panelD: "transparent", panelBorder: "rgba(3,12,32,.04)", panelPhase: "-1.4s",
  },
  {
    name: "电影",
    title: "把看完电影的感受，\n变成可以一起参与的讨论",
    desc: "从片单推荐、角色测试到结局解读，让每一种观影偏好都有可互动的表达。",
    userAvatar: "/assets/voice-avatar-05.jpg",
    userHandle: "@今晚看哪部",
    userQuote: "想找部应景的电影，\n不想再刷半小时片单。",
    creatorAvatar: "/assets/voice-avatar-02.jpg",
    creatorHandle: "@银幕外放映室",
    creatorQuote: "观众真正想知道的是：\n它适不适合现在的我？",
    panelBase: "#ffffff", panelA: "#28bfae", panelB: "transparent", panelC: "transparent", panelD: "transparent", panelBorder: "rgba(1,27,24,.04)", panelPhase: "-5.2s",
  },
  {
    name: "游戏",
    title: "把你的游戏偏好，\n变成下一局的新玩法",
    desc: "从角色选择、阵容搭配到剧情挑战，把攻略之外的乐趣做成可体验的内容。",
    userAvatar: "/assets/voice-avatar-09.png",
    userHandle: "@新手今晚开局",
    userQuote: "刚开始玩，\n选谁才不容易劝退？",
    creatorAvatar: "/assets/voice-avatar-03.jpg",
    creatorHandle: "@存档点攻略组",
    creatorQuote: "比起标准答案，\n更想玩出自己的风格。",
    panelBase: "#ffffff", panelA: "#416fe3", panelB: "transparent", panelC: "transparent", panelD: "transparent", panelBorder: "rgba(4,10,32,.04)", panelPhase: "-8.6s",
  },
  {
    name: "美食",
    title: "把今天吃什么，\n变成每个人都能回答的选择",
    desc: "从口味测试、菜单搭配到城市探店，让真实饮食偏好生成更具体的推荐。",
    userAvatar: "/assets/voice-avatar-04.jpg",
    userHandle: "@晚饭还没想好",
    userQuote: "想吃点不一样的，\n但又说不清想吃什么。",
    creatorAvatar: "/assets/voice-avatar-07.jpg",
    creatorHandle: "@一口风味研究所",
    creatorQuote: "一道推荐真正有用，\n要先听懂今天的胃口。",
    panelBase: "#ffffff", panelA: "#ff7a1a", panelB: "transparent", panelC: "transparent", panelD: "transparent", panelBorder: "rgba(35,12,0,.04)", panelPhase: "-3.1s",
  },
  {
    name: "旅行",
    title: "把一次出发的期待，\n变成适合你的旅行路线",
    desc: "从目的地选择、行程节奏到同行偏好，把攻略变成可参与的个性化规划。",
    userAvatar: "/assets/voice-avatar-06.jpg",
    userHandle: "@假期准备出发",
    userQuote: "只有三天时间，\n怎么安排才不赶路？",
    creatorAvatar: "/assets/voice-avatar-09.png",
    creatorHandle: "@慢一点旅行",
    creatorQuote: "好路线不是塞满景点，\n而是找到自己的节奏。",
    panelBase: "#ffffff", panelA: "#258fc5", panelB: "transparent", panelC: "transparent", panelD: "transparent", panelBorder: "rgba(0,20,31,.04)", panelPhase: "-11.8s",
  },
  {
    name: "宠物",
    title: "把养宠中的小问题，\n变成更懂它的互动答案",
    desc: "从行为观察、用品选择到日常陪伴，让每一次困惑都得到更贴近真实场景的回应。",
    userAvatar: "/assets/voice-avatar-02.jpg",
    userHandle: "@第一次养小猫",
    userQuote: "它最近总在半夜叫，\n是在撒娇还是不舒服？",
    creatorAvatar: "/assets/voice-avatar-05.jpg",
    creatorHandle: "@毛孩子观察局",
    creatorQuote: "先看懂行为的场景，\n才能给出有用的建议。",
    panelBase: "#ffffff", panelA: "#70b56a", panelB: "transparent", panelC: "transparent", panelD: "transparent", panelBorder: "rgba(8,27,7,.04)", panelPhase: "-6.7s",
  },
  {
    name: "阅读",
    title: "把下一本想读的书，\n变成一次兴趣发现",
    desc: "从阅读偏好、主题探索到书单生成，让选书不再只看榜单和评分。",
    userAvatar: "/assets/voice-avatar-07.jpg",
    userHandle: "@书架还缺一本",
    userQuote: "想重新开始阅读，\n哪本书更容易读进去？",
    creatorAvatar: "/assets/voice-avatar-01.jpg",
    creatorHandle: "@翻页计划",
    creatorQuote: "推荐一本书之前，\n先问此刻想遇见什么。",
    panelBase: "#ffffff", panelA: "#238f73", panelB: "transparent", panelC: "transparent", panelD: "transparent", panelBorder: "rgba(0,25,18,.04)", panelPhase: "-9.4s",
  },
  {
    name: "城市漫步",
    title: "把熟悉的城市街道，\n走成一条新的兴趣路线",
    desc: "从街区、咖啡、建筑到书店偏好，生成一段有主题、有发现的周末漫游。",
    userAvatar: "/assets/voice-avatar-03.jpg",
    userHandle: "@周末想出去走走",
    userQuote: "不想去热门景点，\n有没有适合慢走的路线？",
    creatorAvatar: "/assets/voice-avatar-08.png",
    creatorHandle: "@城市散步指南",
    creatorQuote: "好的漫游路线，\n能让熟悉街道重新有趣。",
    panelBase: "#ffffff", panelA: "#315fc4", panelB: "transparent", panelC: "transparent", panelD: "transparent", panelBorder: "rgba(4,10,30,.04)", panelPhase: "-13.2s",
  },
] as const;
const interests = interestDirections.map(item=>item.name);
const interestFeatureImages:Partial<Record<(typeof interestDirections)[number]["name"],{src:string;alt:string}>>={
  "网球":{src:"/assets/tennis-action-panorama-v17.webp",alt:"从巨型网球罐中滚出的网球与追球运动员"},
  "电影":{src:"/assets/interest-movie-cinematic-v3.webp",alt:"沿可步行投影光带走向露天银幕的观众"},
  "游戏":{src:"/assets/interest-game-cinematic-v2.webp",alt:"踏上巨型方向键平台的玩家"},
  "美食":{src:"/assets/interest-food-cinematic-v2.webp",alt:"在巨型面碗旁探索风味的食客"},
  "旅行":{src:"/assets/interest-travel-cinematic-v2.webp",alt:"沿行李带路线前往海岸车站的旅行者"},
  "宠物":{src:"/assets/interest-pet-cinematic-v2.webp",alt:"在猫隧道旁和橘猫互动的主人"},
  "阅读":{src:"/assets/interest-reading-cinematic-v2.webp",alt:"在巨书入口旁安静阅读的读者"},
  "城市漫步":{src:"/assets/interest-citywalk-cinematic-v2.webp",alt:"沿实体路线漫游街区的城市观察者"},
};
const chapterLinks = [
  { label: "创作方向", href: "#chapter-1" },
  { label: "案例", href: "#chapter-3" },
  { label: "开发者价值", href: null },
  { label: "创作支持", href: "#chapter-4" },
];
const footerGroups = [
  { title: "热门推荐", links: ["解决方案", "学堂", "社区", "服务市场"] },
  { title: "自助服务", links: ["帮助中心", "更新日志", "文档站"] },
  { title: "问题反馈", links: ["在线咨询", "工单记录", "侵权投诉"] },
  { title: "开发工具", links: ["IDE", "沙盒", "Codelabs"] },
  { title: "培训与活动", links: ["服务市场新类目招商", "热点小游戏招募", "寻找社区问答智多星", "交易能力内侧招募", "有奖征文大赛"] },
] as const;
const footerFriends = ["抖音开放平台·服务商平台", "抖音小游戏", "穿山甲", "DOU+", "巨量引擎", "企业号", "抖音小店", "飞书", "其它友情链接"] as const;
const scrollPhase=(value:number,start:number,end:number)=>Math.min(1,Math.max(0,(value-start)/(end-start)));
const bezierCoordinate=(t:number,a:number,b:number)=>3*(1-t)*(1-t)*t*a+3*(1-t)*t*t*b+t*t*t;
const scrollBezier=(value:number,x1=.65,y1=0,x2=.35,y2=1)=>{
  let low=0,high=1,t=value;
  for(let i=0;i<10;i++){t=(low+high)/2;if(bezierCoordinate(t,x1,x2)<value)low=t;else high=t}
  return bezierCoordinate(t,y1,y2);
};
type HeroLiquidTuning={force:number;radius:number;distortion:number;blend:number;intensity:number;densityDissipation:number;curl:number;color:string;rainbow:boolean};
const DEFAULT_HERO_LIQUID:HeroLiquidTuning={force:.65,radius:.17,distortion:.65,blend:4.3,intensity:0,densityDissipation:.96,curl:1.1,color:"#eef7ff",rainbow:false};
type ButtonLiquidTuning={radius:number;force:number;intensity:number;densityDissipation:number;velocityDissipation:number;curl:number;opacity:number;orbitX:number;orbitY:number;orbitDuration:number;rainbow:boolean;color:string};
const DEFAULT_BUTTON_LIQUID:ButtonLiquidTuning={radius:1.6,force:.02,intensity:1.9,densityDissipation:.935,velocityDissipation:.96,curl:6,opacity:1,orbitX:.76,orbitY:1.6,orbitDuration:5.6,rainbow:true,color:"#8b5cf6"};
type BlazeTuning={height:number;distortion:number;distortionScale:number;speed:number;sparks:number;sparkDensity:number;sparkSize:number;layers:number;smoke:number;glow:number;brightness:number;saturation:number;sparkColor:string;smokeColor:string};
const DEFAULT_BLAZE_TUNING:BlazeTuning={height:.97,distortion:.45,distortionScale:1.09,speed:.66,sparks:.58,sparkDensity:2.33,sparkSize:.82,layers:6,smoke:1.06,glow:2.15,brightness:1.46,saturation:1.28,sparkColor:"#1fb8ff",smokeColor:"#3860ff"};
type HeroSparkTuning={enabled:boolean;bottomDensity:number;topDensity:number;layers:number;size:number;speed:number;opacity:number;fadeHeight:number};
const DEFAULT_HERO_SPARK_TUNING:HeroSparkTuning={enabled:true,bottomDensity:4,topDensity:2,layers:7,size:1.1,speed:1,opacity:2.1,fadeHeight:84};
const HERO_SPARK_LAYER_MOTION=[
  {startX:-5,startY:16,endX:7,duration:13,delay:0,scale:.72},
  {startX:7,startY:11,endX:-8,duration:17,delay:-7,scale:.64},
  {startX:-2,startY:18,endX:5,duration:15,delay:-3,scale:.58},
  {startX:9,startY:14,endX:-6,duration:19,delay:-11,scale:.7},
  {startX:-8,startY:12,endX:9,duration:16,delay:-9,scale:.66},
  {startX:4,startY:20,endX:-5,duration:14,delay:-5,scale:.75},
  {startX:-3,startY:10,endX:6,duration:18,delay:-12,scale:.56},
  {startX:10,startY:17,endX:-7,duration:16,delay:-2,scale:.68},
] as const;
const hexToLiquidColor=(value:string):[number,number,number]=>{
  const hex=value.replace("#","");
  return [0,2,4].map(index=>parseInt(hex.slice(index,index+2),16)/255) as [number,number,number];
};
const cases = [
  { tag: "兴趣人格", title: "测测你的\n春日逛展人格", desc: "根据审美偏好与逛展习惯，匹配你的春日艺术人格。", creator: "@今天看什么展 · 艺术创作者", image: "/assets/case-gallery-reference-v4.png", screen: "/assets/case-ui-gallery-banner-v7.png", cls: "orange", fallbackHue: 20 },
  { tag: "兴趣工具", title: "找到适合你的\n机械键盘", desc: "根据手感、声音与使用场景，找到更适合的轴体与配列。", creator: "@键盘研究室 · 数码创作者", image: "/assets/case-keyboard-centered-v3.png", screen: "/assets/case-ui-keyboard-banner-v5.png", cls: "sky", fallbackHue: 215 },
  { tag: "赛车知识", title: "测测你是哪种\nF1 车手", desc: "从驾驶风格与赛道偏好，生成你的赛车人格。", creator: "@赛道第十三弯 · 赛车创作者", image: "/assets/case-f1-forest-blue-gold-v6.png", screen: "/assets/case-ui-f1-banner-v5.png", cls: "pink", fallbackHue: 302 },
  { tag: "路线推荐", title: "生成你的\n周末城市漫游地图", desc: "从街区、咖啡与书店偏好，生成一条周末探索路线。", creator: "@城市散步指南 · 生活方式创作者", image: "/assets/case-city-reference-v4.png", screen: "/assets/case-ui-city-banner-v5.png", cls: "green", fallbackHue: 168 },
];

function Rail({ active = 0 }: { active?: number }) {
  return <aside className="edition-rail"><div className="rail-brand"><div className="rail-mark">DOUYIN<br /><i>Interest</i><br />Cards</div><span>抖音兴趣卡</span></div><ol>{chapterLinks.map((item,i)=><li className={i===active?"active":""} key={item.label}>{item.href?<a href={item.href}><span>{item.label}</span><b>{toRoman(i+1)}</b></a>:<span className="rail-disabled" aria-disabled="true"><span>{item.label}</span><b>{toRoman(i+1)}</b></span>}</li>)}</ol><a className="rail-create responsive-button" href={CREATE_URL}><ResponsiveButtonLabel full="开始创作" short="创作"/> <ButtonArrow/></a></aside>;
}
function toRoman(n:number){return ["I","II","III","IV","V"][n-1]}

function LineBreaks({text}:{text:string}){
  const lines=text.split("\n");
  return <>{lines.map((line,index)=><span key={`${line}-${index}`}>{line}{index<lines.length-1?<br/>:null}</span>)}</>;
}

function SoftBlurUnits({text}:{text:string}){
  let unitIndex=0;
  return <>{text.split("\n").map((line,lineIndex)=><span className="soft-blur-line" aria-hidden="true" key={`${line}-${lineIndex}`}>
    {Array.from(line).map((character)=>{
      const index=unitIndex++;
      return <span className="soft-blur-unit" style={{"--soft-blur-index":index} as CSSProperties} key={`${character}-${index}`}>{character===" "?"\u00a0":character}</span>;
    })}
  </span>)}</>;
}

function SoftBlurInGroup({kicker,title,body}:{kicker:string;title:string;body:string}){
  const titleRef=useRef<HTMLHeadingElement>(null);
  const [visible,setVisible]=useState(false);

  useEffect(()=>{
    const title=titleRef.current;
    if(!title)return;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){const timer=window.setTimeout(()=>setVisible(true),0);return()=>window.clearTimeout(timer)}
    const observer=new IntersectionObserver(([entry])=>{
      if(!entry.isIntersecting)return;
      setVisible(true);
      observer.disconnect();
    },{threshold:.18,rootMargin:"0px 0px -8% 0px"});
    observer.observe(title);
    return()=>observer.disconnect();
  },[]);

  const visibleClass=visible?" is-visible":"";
  return <>
    <small className={`soft-blur-copy soft-blur-kicker${visibleClass}`} aria-label={kicker}><SoftBlurUnits text={kicker}/></small>
    <h2 ref={titleRef} className={`soft-blur-copy soft-blur-title${visibleClass}`} aria-label={title.replace(/\n/g," ")}><SoftBlurUnits text={title}/></h2>
    <p className={`soft-blur-copy soft-blur-body${visibleClass}`} aria-label={body}><SoftBlurUnits text={body}/></p>
  </>;
}

function ButtonArrow({dark=false}:{dark?:boolean}){
  return <img className={`button-arrow${dark?" dark":""}`} src="/assets/button-arrow-up-right.svg" alt="" aria-hidden="true"/>;
}

function ResponsiveButtonLabel({full,short}:{full:string;short:string}){
  return <span className="responsive-button-label"><span className="button-label-full">{full}</span><span className="button-label-short">{short}</span></span>;
}

function PortalTransition({progress}:{progress:number}){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const progressRef=useRef(progress);
  const frameRef=useRef(0);
  const draw=useCallback(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const width=canvas.clientWidth,height=canvas.clientHeight;
    if(!width||!height)return;
    const dpr=Math.min(window.devicePixelRatio||1,1.25);
    const pixelWidth=Math.round(width*dpr),pixelHeight=Math.round(height*dpr);
    if(canvas.width!==pixelWidth||canvas.height!==pixelHeight){canvas.width=pixelWidth;canvas.height=pixelHeight}
    const ctx=canvas.getContext("2d");if(!ctx)return;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
    const value=progressRef.current;
    if(value<=.002||value>=.998)return;

    const cx=width*.5,cy=height*.5;
    const radius=Math.max(width,height)*.72*value;
    const edge=Math.max(18,Math.min(width,height)*.03)*(1-.28*value);
    const hash=(seed:number)=>{const x=Math.sin(seed*127.1+value*19.7)*43758.5453;return x-Math.floor(x)};
    ctx.save();
    ctx.globalCompositeOperation="lighter";
    const particleCount=width<760?58:88;
    for(let i=0;i<particleCount;i++){
      const angle=Math.PI*2*(i/particleCount)+(hash(i+400)-.5)*.08;
      const spread=(hash(i+800)-.5)*edge*3.2;
      const pulse=.72+.28*Math.sin(value*22+i*.41);
      const r=radius+spread+Math.sin(angle*9-value*15)*edge*.22;
      const size=(.8+hash(i+1200)*2.4)*pulse;
      const alpha=(.08+hash(i+1600)*.34)*(1-Math.abs(spread)/(edge*1.7));
      if(alpha<=0)continue;
      ctx.beginPath();ctx.arc(cx+Math.cos(angle)*r,cy+Math.sin(angle)*r,size*3.4,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${alpha*.12})`;ctx.fill();
      ctx.beginPath();ctx.arc(cx+Math.cos(angle)*r,cy+Math.sin(angle)*r,size,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${alpha})`;ctx.fill();
    }
    ctx.restore();
  },[]);

  useEffect(()=>{progressRef.current=progress;if(!frameRef.current)frameRef.current=requestAnimationFrame(()=>{frameRef.current=0;draw()})},[draw,progress]);
  useEffect(()=>{const onResize=()=>{if(!frameRef.current)frameRef.current=requestAnimationFrame(()=>{frameRef.current=0;draw()})};window.addEventListener("resize",onResize,{passive:true});onResize();return()=>{window.removeEventListener("resize",onResize);if(frameRef.current)cancelAnimationFrame(frameRef.current)}},[draw]);
  return <canvas ref={canvasRef} className="hero-portal-edge" aria-hidden="true"/>;
}

type CasePalette={hue:number;secondaryHue:number;saturation:number};

const rgbToHsl=(red:number,green:number,blue:number)=>{
  const r=red/255,g=green/255,b=blue/255;
  const max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;
  let hue=0;
  if(delta){
    if(max===r)hue=60*(((g-b)/delta)%6);
    else if(max===g)hue=60*((b-r)/delta+2);
    else hue=60*((r-g)/delta+4);
  }
  if(hue<0)hue+=360;
  const light=(max+min)/2;
  const saturation=delta===0?0:delta/(1-Math.abs(2*light-1));
  return {hue,saturation,light};
};

const paletteStyle=({hue,secondaryHue,saturation}:CasePalette)=>{
  const sat=Math.round(Math.min(54,Math.max(30,saturation*62)));
  const secondarySat=Math.round(Math.max(24,sat*.82));
  return {
    "--case-info-base":`hsl(${hue.toFixed(1)} ${sat}% 87%)`,
    "--case-info-soft":`hsl(${secondaryHue.toFixed(1)} ${secondarySat}% 92%)`,
    "--case-info-glow":`hsla(${hue.toFixed(1)}, ${Math.min(66,sat+10)}%, 72%, .48)`,
    "--case-lift-primary":`hsl(${hue.toFixed(1)} ${Math.min(90,sat+36)}% 24%)`,
    "--case-lift-secondary":`hsl(${secondaryHue.toFixed(1)} ${Math.min(78,secondarySat+32)}% 58%)`,
    "--case-media-base":`hsl(${hue.toFixed(1)} ${Math.max(24,sat-7)}% 91%)`,
    "--case-media-soft":`hsl(${secondaryHue.toFixed(1)} ${Math.max(20,secondarySat-5)}% 95%)`,
    "--case-media-glow":`hsla(${secondaryHue.toFixed(1)}, ${Math.min(60,secondarySat+8)}%, 75%, .38)`,
  } as CSSProperties;
};

function useMaterialPalette(src:string,fallbackHue:number){
  const [palette,setPalette]=useState<CasePalette>({hue:fallbackHue,secondaryHue:(fallbackHue+22)%360,saturation:.55});
  useEffect(()=>{
    let cancelled=false;
    const image=new Image();
    image.crossOrigin="anonymous";
    image.onload=()=>{
      if(cancelled)return;
      const canvas=document.createElement("canvas");
      canvas.width=48;canvas.height=48;
      const context=canvas.getContext("2d",{willReadFrequently:true});
      if(!context)return;
      context.drawImage(image,0,0,canvas.width,canvas.height);
      const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
      const weights=Array(36).fill(0) as number[];
      const satTotals=Array(36).fill(0) as number[];
      const sinTotals=Array(36).fill(0) as number[];
      const cosTotals=Array(36).fill(0) as number[];
      for(let pixel=0;pixel<pixels.length;pixel+=4){
        if(pixels[pixel+3]<200)continue;
        const hsl=rgbToHsl(pixels[pixel],pixels[pixel+1],pixels[pixel+2]);
        if(hsl.saturation<.08||hsl.light<.055||hsl.light>.95)continue;
        const bucket=Math.min(35,Math.floor(hsl.hue/10));
        const middleWeight=1-Math.min(1,Math.abs(hsl.light-.53)/.48);
        const weight=Math.pow(hsl.saturation,1.35)*(.42+.58*middleWeight);
        weights[bucket]+=weight;
        satTotals[bucket]+=hsl.saturation*weight;
        sinTotals[bucket]+=Math.sin(hsl.hue*Math.PI/180)*weight;
        cosTotals[bucket]+=Math.cos(hsl.hue*Math.PI/180)*weight;
      }
      const ranked=weights.map((weight,index)=>({index,score:weight+weights[(index+35)%36]*.55+weights[(index+1)%36]*.55})).sort((a,b)=>b.score-a.score);
      const primary=ranked[0];
      if(!primary||primary.score<.35)return;
      const hueFor=(bucket:number)=>{
        let sin=0,cos=0,weight=0,saturation=0;
        for(const offset of [-1,0,1]){
          const index=(bucket+offset+36)%36;
          sin+=sinTotals[index];cos+=cosTotals[index];weight+=weights[index];saturation+=satTotals[index];
        }
        return {hue:(Math.atan2(sin,cos)*180/Math.PI+360)%360,saturation:weight?saturation/weight:.5};
      };
      const first=hueFor(primary.index);
      const secondary=ranked.find(item=>{const distance=Math.abs(item.index-primary.index);return Math.min(distance,36-distance)>=4&&item.score>primary.score*.16});
      const second=secondary?hueFor(secondary.index):{hue:(first.hue+22)%360,saturation:first.saturation*.82};
      if(!cancelled)setPalette({hue:first.hue,secondaryHue:second.hue,saturation:(first.saturation+second.saturation*.35)/1.35});
    };
    image.src=src;
    return()=>{cancelled=true};
  },[src,fallbackHue]);
  return palette;
}

function CreatorCaseCard({item}:{item:(typeof cases)[number]}){
  const palette=useMaterialPalette(item.screen,item.fallbackHue);
  return <article className={`editorial-card horizontal-card ${item.cls}`} style={{...paletteStyle(palette),"--case-scene":`url("${item.screen}")`} as CSSProperties}><div className="case-media"><img className="case-media-backdrop" src={item.screen} alt=""/><div className="case-phone-stage"><div className="case-phone"><img className="case-phone-screen" src={item.screen} alt={`${item.title.replace("\n","")}兴趣卡界面`}/><img className="case-phone-hardware" src="/assets/case-phone-hardware.png" alt=""/></div></div></div><div className="case-info"><small>{item.tag}</small><h3>{item.title.split("\n").map((text,lineIndex)=><span key={lineIndex}>{text}<br/></span>)}</h3><p>{item.desc}</p><em>{item.creator}</em><div><a className="responsive-button icon-collapse" href={CREATE_URL} aria-label={`围绕${item.title.replace("\n","")}创作同类兴趣卡`}><ResponsiveButtonLabel full="创作同类" short="创作"/> <ButtonArrow dark/></a><button className="responsive-button icon-collapse" aria-label={`体验${item.title.replace("\n","")}案例`}><ResponsiveButtonLabel full="体验案例" short="体验"/> <ButtonArrow/></button></div></div></article>;
}
function HorizontalCases(){
  const sectionRef=useRef<HTMLElement>(null);
  const [progress,setProgress]=useState(0);
  useEffect(()=>{
    let frame=0;
    const update=()=>{
      const section=sectionRef.current;if(!section)return;
      const range=Math.max(section.offsetHeight-window.innerHeight,1);
      const rawProgress=Math.min(1,Math.max(0,-section.getBoundingClientRect().top/range));
      const value=Math.min(1,rawProgress/.92);
      setProgress(value);
      frame=0;
    };
    const onScroll=()=>{if(!frame)frame=requestAnimationFrame(update)};
    update();window.addEventListener("scroll",onScroll,{passive:true});
    return()=>{window.removeEventListener("scroll",onScroll);if(frame)cancelAnimationFrame(frame)};
  },[]);
  return <section id="chapter-3" ref={sectionRef} className="chapter chapter-cases horizontal-cases"><div className="cases-sticky"><div className="cases-heading"><div><SoftBlurInGroup kicker="创作者生态" title="来自创作者的兴趣卡作品" body="四个真实兴趣方向，展示创作者如何把内容转化为可体验、可分享的兴趣卡。"/></div><b>{String(Math.min(cases.length,Math.floor(progress*cases.length)+1)).padStart(2,"0")} / {String(cases.length).padStart(2,"0")}</b></div><div className="bend-shell content-rise" style={{"--content-rise-delay":"180ms"} as CSSProperties}><div className="cases-bend cases-flat"><div className="horizontal-track" style={{transform:`translate3d(${-progress*184}vw, 0, 0)`}}>{cases.map(item=><CreatorCaseCard item={item} key={item.title}/>)}</div></div></div></div></section>;
}

export default function Home(){
  const heroFrameCanvasRef=useRef<HTMLCanvasElement>(null);
  const heroVideoMotionRef=useRef<HTMLDivElement>(null);
  const heroCtaRef=useRef<HTMLAnchorElement>(null);
  const heroFrameTargetRef=useRef(0);
  const requestHeroFrameRef=useRef<(index:number)=>void>(()=>{});
  const interestSectionRef=useRef<HTMLElement>(null);
  const interestStripRef=useRef<HTMLDivElement>(null);
  const [interest,setInterest]=useState(0);
  const [interestAutoplay,setInterestAutoplay]=useState(false);
  const [interestCycle,setInterestCycle]=useState(0);
  const activeInterest=interestDirections[interest];
  const activeInterestImage=interestFeatureImages[activeInterest.name]??interestFeatureImages["网球"]!;
  const [heroStep,setHeroStep]=useState(0);
  const [heroProgress,setHeroProgress]=useState(0);
  const [activeChapter,setActiveChapter]=useState(0);
  const [headerTheme,setHeaderTheme]=useState<"dark"|"light">("dark");
  const [headerOverHero,setHeaderOverHero]=useState(true);
  const [finalCardDragging,setFinalCardDragging]=useState(false);
  const [finalCardRotation,setFinalCardRotation]=useState({x:0,y:0});
  const finalCardDragRef=useRef<{pointerId:number;startX:number;startY:number;baseX:number;baseY:number}|null>(null);
  const buttonLiquidTuning=DEFAULT_BUTTON_LIQUID;
  const [heroIntroVisible,setHeroIntroVisible]=useState(true);
  useLayoutEffect(()=>{
    const previousRestoration=window.history.scrollRestoration;
    const isRootView=()=>!window.location.hash||window.location.hash==="#";
    const resetRootScroll=()=>{
      if(!isRootView())return;
      window.scrollTo({top:0,left:0,behavior:"auto"});
      document.documentElement.scrollTop=0;
      document.body.scrollTop=0;
    };
    window.history.scrollRestoration="manual";
    resetRootScroll();
    const afterLayout=requestAnimationFrame(()=>requestAnimationFrame(resetRootScroll));
    const onPageShow=()=>requestAnimationFrame(resetRootScroll);
    window.addEventListener("pageshow",onPageShow);
    return()=>{
      cancelAnimationFrame(afterLayout);
      window.removeEventListener("pageshow",onPageShow);
      window.history.scrollRestoration=previousRestoration;
    };
  },[]);
  useEffect(()=>{if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const timer=window.setTimeout(()=>setHeroIntroVisible(false),0);return()=>window.clearTimeout(timer)},[]);
  useEffect(()=>{
    const nodes=Array.from(document.querySelectorAll<HTMLElement>(".content-rise"));
    if(!nodes.length)return;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){
      nodes.forEach(node=>node.classList.add("is-visible"));
      return;
    }
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },{threshold:.1,rootMargin:"0px 0px -7% 0px"});
    nodes.forEach(node=>observer.observe(node));
    return()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    const section=interestSectionRef.current;
    if(!section||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    let wasVisible=false;
    const observer=new IntersectionObserver(([entry])=>{
      const visible=entry.isIntersecting&&entry.intersectionRatio>=.18;
      if(visible===wasVisible)return;
      wasVisible=visible;
      setInterestAutoplay(visible);
      if(visible)setInterestCycle(cycle=>cycle+1);
    },{threshold:[0,.18,.45],rootMargin:"-8% 0px -8%"});
    observer.observe(section);
    return()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    const section=interestSectionRef.current;
    if(!section)return;
    const sources=Object.values(interestFeatureImages).map(image=>image.src).slice(1);
    let timer=0,index=0,disposed=false;
    const preloadNext=()=>{
      if(disposed||index>=sources.length)return;
      const image=new Image();
      image.decoding="async";
      image.onload=image.onerror=()=>{if(!disposed)timer=window.setTimeout(preloadNext,140)};
      image.src=sources[index++];
    };
    const observer=new IntersectionObserver(([entry])=>{
      if(!entry.isIntersecting)return;
      observer.disconnect();
      preloadNext();
    },{rootMargin:"100% 0px",threshold:0});
    observer.observe(section);
    return()=>{disposed=true;window.clearTimeout(timer);observer.disconnect()};
  },[]);
  useEffect(()=>{
    if(!interestAutoplay)return;
    const timer=window.setTimeout(()=>{
      setInterest(current=>(current+1)%interestDirections.length);
      setInterestCycle(cycle=>cycle+1);
    },INTEREST_AUTOPLAY_MS);
    return()=>window.clearTimeout(timer);
  },[interestAutoplay,interestCycle]);
  useEffect(()=>{
    if(!window.matchMedia("(max-width: 900px)").matches)return;
    const strip=interestStripRef.current;
    const active=strip?.querySelector<HTMLButtonElement>('[data-interest-active="true"]');
    if(!strip||!active)return;
    const target=active.offsetLeft-(strip.clientWidth-active.offsetWidth)/2;
    strip.scrollTo({
      left:Math.max(0,target),
      behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",
    });
  },[interest]);
  useEffect(()=>{
    const button=heroCtaRef.current;
    if(!button||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    let frame=0,lastSplat=0;
    const orbit=(time:number)=>{
      if(time-lastSplat>34){
        const rect=button.getBoundingClientRect();
        const actions=button.parentElement;
        const visible=rect.width>0&&rect.height>0&&rect.bottom>0&&rect.top<window.innerHeight&&Number.parseFloat(actions?getComputedStyle(actions).opacity:"0")>.04;
        if(visible){
          const angle=time/(buttonLiquidTuning.orbitDuration*1000)*Math.PI*2;
          const clientX=rect.left+rect.width*(.5+Math.cos(angle)*buttonLiquidTuning.orbitX);
          const clientY=rect.top+rect.height*(.5+Math.sin(angle)*buttonLiquidTuning.orbitY);
          button.dispatchEvent(new PointerEvent("pointermove",{clientX,clientY,pointerId:407,pointerType:"mouse"}));
        }
        lastSplat=time;
      }
      frame=requestAnimationFrame(orbit);
    };
    frame=requestAnimationFrame(orbit);
    return()=>cancelAnimationFrame(frame);
  },[buttonLiquidTuning.orbitDuration,buttonLiquidTuning.orbitX,buttonLiquidTuning.orbitY]);
  useEffect(()=>{
    let touchStartY=0;
    const onWheel=(event:WheelEvent)=>{if(window.scrollY<=0&&event.deltaY<0)event.preventDefault()};
    const onTouchStart=(event:TouchEvent)=>{touchStartY=event.touches[0]?.clientY??0};
    const onTouchMove=(event:TouchEvent)=>{const currentY=event.touches[0]?.clientY??touchStartY;if(window.scrollY<=0&&currentY>touchStartY)event.preventDefault()};
    window.addEventListener("wheel",onWheel,{passive:false});
    window.addEventListener("touchstart",onTouchStart,{passive:true});
    window.addEventListener("touchmove",onTouchMove,{passive:false});
    return()=>{window.removeEventListener("wheel",onWheel);window.removeEventListener("touchstart",onTouchStart);window.removeEventListener("touchmove",onTouchMove)};
  },[]);
  useEffect(()=>{
    const canvas=heroFrameCanvasRef.current;
    if(!canvas)return;
    let disposed=false;
    let warmTimer=0;
    const context=canvas.getContext("2d",{alpha:false});
    if(!context)return;
    const decoded=new Map<number,ImageBitmap>();
    const pending=new Map<number,Promise<ImageBitmap|null>>();
    const touch=(index:number,bitmap:ImageBitmap)=>{decoded.delete(index);decoded.set(index,bitmap);while(decoded.size>24){const oldest=decoded.entries().next().value as [number,ImageBitmap]|undefined;if(!oldest)break;decoded.delete(oldest[0]);oldest[1].close()}};
    const draw=(bitmap:ImageBitmap)=>{const rect=canvas.getBoundingClientRect();if(rect.width<1||rect.height<1)return;const ratio=Math.min(window.devicePixelRatio||1,1.5,1600/rect.width);const width=Math.max(1,Math.round(rect.width*ratio));const height=Math.max(1,Math.round(rect.height*ratio));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}const scale=Math.max(width/bitmap.width,height/bitmap.height);const drawWidth=bitmap.width*scale;const drawHeight=bitmap.height*scale;context.drawImage(bitmap,(width-drawWidth)/2,(height-drawHeight)/2,drawWidth,drawHeight);canvas.dispatchEvent(new CustomEvent("liquidcontentchange",{bubbles:true}))};
    const load=(index:number)=>{const safe=Math.max(0,Math.min(HERO_FRAME_COUNT-1,index));const cached=decoded.get(safe);if(cached){touch(safe,cached);return Promise.resolve(cached)}const active=pending.get(safe);if(active)return active;const task=fetch(heroFrameSrc(safe),{cache:"force-cache"}).then(response=>{if(!response.ok)throw new Error(`Frame ${safe+1} failed`);return response.blob()}).then(blob=>createImageBitmap(blob)).then(bitmap=>{pending.delete(safe);if(disposed){bitmap.close();return null}touch(safe,bitmap);if(heroFrameTargetRef.current===safe)draw(bitmap);return bitmap}).catch(()=>{pending.delete(safe);return null});pending.set(safe,task);return task};
    requestHeroFrameRef.current=(index:number)=>{const safe=Math.max(0,Math.min(HERO_FRAME_COUNT-1,index));heroFrameTargetRef.current=safe;const cached=decoded.get(safe);if(cached){touch(safe,cached);draw(cached)};[safe,safe+1,safe-1,safe+2,safe-2].forEach(load)};
    requestHeroFrameRef.current(heroFrameTargetRef.current);
    let warmIndex=0;
    const warm=()=>{if(disposed||warmIndex>=HERO_FRAME_COUNT)return;const batch=Array.from({length:4},()=>warmIndex++).filter(index=>index<HERO_FRAME_COUNT);Promise.all(batch.map(index=>fetch(heroFrameSrc(index),{cache:"force-cache"}).then(response=>response.arrayBuffer()).catch(()=>null))).finally(()=>{if(!disposed)warmTimer=window.setTimeout(warm,70)})};
    warmTimer=window.setTimeout(warm,300);
    const resizeObserver=new ResizeObserver(()=>{const current=decoded.get(heroFrameTargetRef.current);if(current)draw(current)});
    resizeObserver.observe(canvas);
    return()=>{disposed=true;window.clearTimeout(warmTimer);resizeObserver.disconnect();requestHeroFrameRef.current=()=>{};decoded.forEach(bitmap=>bitmap.close());decoded.clear();pending.clear()};
  },[]);
  useEffect(()=>{
    let ticking=false;
    const update=()=>{const hero=document.querySelector<HTMLElement>(".edition-hero");if(!hero)return;const range=Math.max(hero.offsetHeight-window.innerHeight,1);const progress=Math.min(1,Math.max(0,-hero.getBoundingClientRect().top/range));const frame=Math.round(scrollPhase(progress,0,HERO_VIDEO_END_SCROLL_PROGRESS)*(HERO_FRAME_COUNT-1));requestHeroFrameRef.current(frame);setHeroProgress(progress);setHeroStep(Math.min(2,Math.floor(progress*3)));ticking=false};
    const onScroll=()=>{if(!ticking){requestAnimationFrame(update);ticking=true}};
    update();window.addEventListener("scroll",onScroll,{passive:true});return()=>window.removeEventListener("scroll",onScroll);
  },[]);
  useEffect(()=>{
    const motion=heroVideoMotionRef.current;
    const hero=motion?.closest<HTMLElement>(".hero-sticky");
    if(!motion||!hero||!window.matchMedia("(pointer: fine)").matches||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    let targetX=0,targetY=0,currentX=0,currentY=0,frame=0,lastTime=performance.now();
    const render=(time:number)=>{
      const elapsed=Math.min(64,time-lastTime);lastTime=time;
      const ease=1-Math.exp(-elapsed/110);
      currentX+=(targetX-currentX)*ease;
      currentY+=(targetY-currentY)*ease;
      const shiftX=`${(-currentX*12).toFixed(3)}px`;
      const shiftY=`${(-currentY*8).toFixed(3)}px`;
      motion.style.setProperty("--hero-shift-x",shiftX);
      motion.style.setProperty("--hero-shift-y",shiftY);
      hero.style.setProperty("--hero-shift-x",shiftX);
      hero.style.setProperty("--hero-shift-y",shiftY);
      if(Math.abs(targetX-currentX)>.001||Math.abs(targetY-currentY)>.001)frame=requestAnimationFrame(render);
      else frame=0;
    };
    const wake=()=>{if(!frame){lastTime=performance.now();frame=requestAnimationFrame(render)}};
    const onPointerMove=(event:PointerEvent)=>{
      if(event.pointerType!=="mouse")return;
      const rect=hero.getBoundingClientRect();
      targetX=Math.min(1,Math.max(-1,((event.clientX-rect.left)/rect.width-.5)*2));
      targetY=Math.min(1,Math.max(-1,((event.clientY-rect.top)/rect.height-.5)*2));
      wake();
    };
    const onPointerLeave=()=>{targetX=0;targetY=0;wake()};
    hero.addEventListener("pointermove",onPointerMove,{passive:true});
    hero.addEventListener("pointerleave",onPointerLeave);
    return()=>{hero.removeEventListener("pointermove",onPointerMove);hero.removeEventListener("pointerleave",onPointerLeave);hero.style.removeProperty("--hero-shift-x");hero.style.removeProperty("--hero-shift-y");if(frame)cancelAnimationFrame(frame)};
  },[]);
  useEffect(()=>{
    const sections = ["chapter-1","chapter-3","chapter-4"];
    const navIndex: Record<string,number> = {"chapter-1":0,"chapter-3":1,"chapter-4":3};
    let frame=0;
    const update=()=>{
      const readingLine=window.innerHeight*.38;
      let current=sections[0];
      for(const id of sections){
        const section=document.getElementById(id);
        if(section && section.getBoundingClientRect().top<=readingLine) current=id;
      }
      setActiveChapter(navIndex[current]);
      frame=0;
    };
    const onScroll=()=>{if(!frame) frame=requestAnimationFrame(update)};
    update();window.addEventListener("scroll",onScroll,{passive:true});
    return()=>{window.removeEventListener("scroll",onScroll);if(frame)cancelAnimationFrame(frame)};
  },[]);
  useEffect(()=>{
    let frame=0;
    const update=()=>{
      const hero=document.querySelector<HTMLElement>(".edition-hero");
      const heroBottom=hero?.getBoundingClientRect().bottom ?? 0;
      setHeaderOverHero(heroBottom>window.innerHeight);
      if(heroBottom>60){
        const range=Math.max((hero?.offsetHeight ?? 0)-window.innerHeight,1);
        const progress=Math.min(1,Math.max(0,-(hero?.getBoundingClientRect().top ?? 0)/range));
        setHeaderTheme(progress<HERO_PORTAL_START_SCROLL_PROGRESS?"dark":"light");
      }else{
        const line=30;
        const isDark=["chapter-5"].some(id=>{const el=document.getElementById(id);if(!el)return false;const rect=el.getBoundingClientRect();return rect.top<=line&&rect.bottom>line});
        setHeaderTheme(isDark?"dark":"light");
      }
      frame=0;
    };
    const onScroll=()=>{if(!frame)frame=requestAnimationFrame(update)};
    update();window.addEventListener("scroll",onScroll,{passive:true});
    return()=>{window.removeEventListener("scroll",onScroll);if(frame)cancelAnimationFrame(frame)};
  },[]);
  const heroTimeline=scrollBezier(heroProgress);
  const portalProgress=scrollPhase(heroProgress,HERO_PORTAL_START_SCROLL_PROGRESS,HERO_PORTAL_END_SCROLL_PROGRESS);
  const thirdActControlsIn=scrollPhase(portalProgress,0,.24);
  const heroShadowOut=scrollPhase(portalProgress,0,.24);
  const sceneThreeEnter=portalProgress;
  const heroSparksOpacity=1-scrollPhase(heroProgress,.72,.84);
  const descriptionIn=scrollPhase(heroProgress,.34,.56);
  const actionsIn=thirdActControlsIn;
  const capabilitiesIn=thirdActControlsIn;
  const copySettle=scrollPhase(heroTimeline,.12,.72);
  const titleScaleProgress=scrollBezier(scrollPhase(heroProgress,.22,.56));
  const titleScale=1-.14*titleScaleProgress;
  const titleLayoutCompensation=32*((1-titleScale)/.14);
  const inkR=Math.round(255+(17-255)*sceneThreeEnter);
  const inkG=Math.round(255+(19-255)*sceneThreeEnter);
  const inkB=Math.round(255+(21-255)*sceneThreeEnter);
  const heroInk=`rgb(${inkR},${inkG},${inkB})`;
  const heroBodyInk=`rgba(${inkR},${inkG},${inkB},${(.82-.1*sceneThreeEnter).toFixed(3)})`;
  const primaryButton="#111315";
  const secondaryButton="transparent";
  const secondaryBorder="#111315";
  const heroTitleShadow=`0 3px ${28*(1-heroShadowOut)}px rgba(0,0,0,${.28*(1-heroShadowOut)})`;
  const heroCopyShadow=`0 2px ${18*(1-heroShadowOut)}px rgba(0,0,0,${.3*(1-heroShadowOut)})`;
  const portalRadius=portalProgress*90;
  const portalFeather=2.2+(1-portalProgress)*2.2;
  const portalMask=`radial-gradient(circle at 50% 50%, #000 0, #000 ${Math.max(0,portalRadius-portalFeather)}vmax, rgba(0,0,0,.72) ${portalRadius}vmax, transparent ${portalRadius+portalFeather}vmax)`;
  const selectInterest=(index:number)=>{setInterest(index);setInterestCycle(cycle=>cycle+1)};
  const heroLiquidOptions:LiquidOptions={simResolution:96,dyeResolution:384,velocityDissipation:.93,pressure:.68,pressureIterations:3,...DEFAULT_HERO_LIQUID,color:hexToLiquidColor(DEFAULT_HERO_LIQUID.color)};
  const heroSparkBottomLayerCount=Math.min(12,Math.max(1,Math.round(DEFAULT_HERO_SPARK_TUNING.layers*DEFAULT_HERO_SPARK_TUNING.bottomDensity)));
  const heroSparkTopLayerCount=Math.min(4,Math.max(0,Math.round(DEFAULT_HERO_SPARK_TUNING.layers*DEFAULT_HERO_SPARK_TUNING.topDensity)));
  const heroSparkStyle={opacity:heroSparksOpacity*Math.min(DEFAULT_HERO_SPARK_TUNING.opacity,1),"--hero-spark-size":DEFAULT_HERO_SPARK_TUNING.size,"--hero-spark-brightness":DEFAULT_HERO_SPARK_TUNING.opacity,"--hero-spark-fade-height":`${DEFAULT_HERO_SPARK_TUNING.fadeHeight}vh`,"--hero-spark-travel-y":`-${DEFAULT_HERO_SPARK_TUNING.fadeHeight+28}vh`} as CSSProperties;
  return <main className="editions-page">
    <header className={`edition-header header-${headerTheme}${headerOverHero?" header-hero":""}`}>
      <div className="header-main">
        <span className="header-logo-wrap"><img className="header-logo header-logo-base" src="/assets/header-logo.svg" alt="抖音开放平台"/><img className="header-logo header-logo-invert" src="/assets/header-logo.svg" alt="" aria-hidden="true"/></span>
        <nav>
          <a href="#">首页</a><a href="#chapter-1" className="solution-link">解决方案 <i>NEW</i></a><a href="#chapter-3">客户案例</a><a href="#">文档 <img src="/assets/header-chevron.svg" alt=""/></a><a href="#chapter-4">学堂</a><a href="#">社区</a><a href="#">服务市场</a><a href="#">支持与服务 <img src="/assets/header-chevron.svg" alt=""/></a><a href="#">合作平台 <img src="/assets/header-chevron.svg" alt=""/></a>
        </nav>
        <div className="edition-header-actions"><div className="header-search"><span>输入关键词搜索</span><img src="/assets/header-search.svg" alt="搜索"/></div><a className="console-link" href={CREATE_URL}>控制台</a></div>
      </div>
      <a className="login-link" href={CREATE_URL}>登录/注册</a>
    </header>

    <section className={`edition-hero step-${heroStep}`}>
      <div className={`hero-sticky hero-scroll-scrubbed${heroIntroVisible?" hero-intro-playing":""}`}>
        <div className="hero-scene scene-one hero-video-scene" style={{opacity:1,transform:"scale(1)"}}><div ref={heroVideoMotionRef} className="hero-video-motion"><Liquid className="hero-liquid" pointerTarget=".hero-sticky" active={portalProgress<HERO_LIQUID_END_PORTAL_PROGRESS} forceFallback {...heroLiquidOptions}><div className="hero-video-content"><canvas key="hero-frames-v4-liquid" ref={heroFrameCanvasRef} className="hero-frame-canvas" aria-label="抖音兴趣卡首屏创意画面"/><div className="hero-video-shade"/></div></Liquid></div></div>
        <div className="hero-scene scene-three" style={{opacity:portalProgress>.002?1:0,WebkitMaskImage:portalMask,maskImage:portalMask,transform:"scale(1)"}}><div className="white-field"/><Liquid className="scene-three-hover-liquid" style={{opacity:sceneThreeEnter,transform:"translate3d(var(--hero-shift-x,0),var(--hero-shift-y,0),0) scale(1.022)"}} pointerTarget=".hero-sticky" active={sceneThreeEnter>.01} forceFallback simResolution={96} dyeResolution={384} densityDissipation={.955} velocityDissipation={.93} pressure={.68} pressureIterations={3} curl={1.4} radius={.24} force={.85} intensity={.25} distortion={1.1} blend={6.5} color={[.2,.56,1]} rainbow><div className="hero-line-art"><img src="/assets/hero-line-art-final-frames-v4.png" alt=""/></div></Liquid><div className="hero-line-art-wash"/></div>
        <PortalTransition progress={portalProgress}/>
        <div className="hero-sparks" style={heroSparkStyle} aria-hidden="true">{Array.from({length:heroSparkBottomLayerCount},(_,index)=>{const motion=HERO_SPARK_LAYER_MOTION[index%HERO_SPARK_LAYER_MOTION.length];return <i className="hero-spark-layer hero-spark-layer-bottom" key={`bottom-${index}`} style={{"--hero-spark-layer-duration":`${(motion.duration/DEFAULT_HERO_SPARK_TUNING.speed).toFixed(2)}s`,"--hero-spark-layer-delay":`${motion.delay}s`,"--hero-spark-start-x":`${motion.startX}vw`,"--hero-spark-start-y":`${motion.startY}vh`,"--hero-spark-end-x":`${motion.endX}vw`,"--hero-spark-layer-scale":motion.scale} as CSSProperties}/>})}{Array.from({length:heroSparkTopLayerCount},(_,index)=>{const motion=HERO_SPARK_LAYER_MOTION[(index+heroSparkBottomLayerCount+2)%HERO_SPARK_LAYER_MOTION.length];return <i className="hero-spark-layer hero-spark-layer-top" key={`top-${index}`} style={{"--hero-spark-layer-duration":`${(motion.duration/DEFAULT_HERO_SPARK_TUNING.speed).toFixed(2)}s`,"--hero-spark-layer-delay":`${motion.delay}s`,"--hero-spark-start-x":`${motion.startX}vw`,"--hero-spark-start-y":`${motion.startY}vh`,"--hero-spark-end-x":`${motion.endX}vw`,"--hero-spark-layer-scale":motion.scale} as CSSProperties}/>})}</div>
        {heroIntroVisible&&<div className="hero-intro-liquid-layer" aria-hidden="true" onAnimationEnd={()=>setHeroIntroVisible(false)}><Liquid className="hero-intro-liquid" intro overlayOnly forceFallback simResolution={64} dyeResolution={256} densityDissipation={.92} dissipationVariation={.88} velocityDissipation={.9} pressure={.55} pressureIterations={2} curl={1.05} radius={7.5} force={.4} intensity={4.8} distortion={0} blend={0} color={[.93,.97,1]} rainbow={false}><div className="hero-intro-liquid-content"/></Liquid></div>}
        <div className="hero-index hero-copy" style={{opacity:1,color:heroInk,transform:`translate(-50%,calc(-50% + ${112*(1-copySettle)}px))`}}>
          <small className="hero-badge-raster" style={{opacity:1,transform:"none"}} aria-label="抖音兴趣卡"><img src="/assets/hero-interest-badge@3x.png" alt="" aria-hidden="true"/></small>
          <h1 style={{opacity:1,color:heroInk,textShadow:heroTitleShadow,transform:`scale(${titleScale})`,marginBottom:`-${titleLayoutCompensation}px`}}>把一个兴趣想法，<br/>变成人和人都能参与的内容</h1>
          <p style={{opacity:descriptionIn,color:heroBodyInk,textShadow:heroCopyShadow,transform:`translateY(${24*(1-descriptionIn)}px)`}}>从真实兴趣出发，快速生成可体验、可发布的互动内容，<br/>并在抖音 Feed 场景中触达用户。</p>
          <div className="hero-actions" style={{opacity:actionsIn,transform:`translateY(${26*(1-actionsIn)}px)`,pointerEvents:actionsIn>.92?"auto":"none"}}><a ref={heroCtaRef} className="hero-primary-cta hero-liquid-orbit-target responsive-button" href={CREATE_URL} style={{backgroundColor:primaryButton}}><Liquid className="hero-button-liquid" style={{opacity:buttonLiquidTuning.opacity}} pointerTarget=".hero-liquid-orbit-target" active={actionsIn>.04} forceFallback overlayOnly simResolution={48} dyeResolution={192} densityDissipation={buttonLiquidTuning.densityDissipation} dissipationVariation={.16} velocityDissipation={buttonLiquidTuning.velocityDissipation} pressure={.62} pressureIterations={2} curl={buttonLiquidTuning.curl} radius={buttonLiquidTuning.radius} force={buttonLiquidTuning.force} intensity={buttonLiquidTuning.intensity} distortion={0} blend={0} color={hexToLiquidColor(buttonLiquidTuning.color)} rainbow={buttonLiquidTuning.rainbow}><div className="hero-button-liquid-fill"/></Liquid><span className="hero-primary-label"><ResponsiveButtonLabel full="开始创作" short="创作"/> <ButtonArrow/></span></a><a className="responsive-button" href="#chapter-3" style={{backgroundColor:secondaryButton,borderColor:secondaryBorder,color:"#111315"}}><ResponsiveButtonLabel full="浏览案例" short="案例"/></a></div>
          <div className="hero-capabilities" style={{opacity:capabilitiesIn,color:heroBodyInk,textShadow:heroCopyShadow,transform:`translateY(${22*(1-capabilitiesIn)}px)`}}>自然语言生成 <i>·</i> 实时预览 <i>·</i> 一键发布到抖音</div>
        </div>
        <div className="hero-step-label" style={{color:heroInk}}><b>{String(heroStep+1).padStart(2,"0")}</b><span>{["兴趣，从一个真实问题开始","真实需求，正在形成可创作的回应","生成、预览、发布，一步完成"][heroStep]}</span></div>
        <div className="hero-scroll-hint" style={{opacity:1,color:heroInk}}>向下滚动 ↓</div>
      </div>
    </section>

    <div className="edition-body">
      <Rail active={activeChapter}/>
      <div className="edition-content">
        <section id="chapter-1" ref={interestSectionRef} className="chapter chapter-brief">
          <div className="chapter-head"><div><SoftBlurInGroup kicker="本期流量悬赏" title={"这些兴趣，\n正在等待新玩法"} body="每期围绕一个真实兴趣方向开放创作，从用户问题中找到值得回应的新玩法。"/></div></div>
          <div ref={interestStripRef} className="interest-strip content-rise" style={{"--content-rise-delay":"120ms"} as CSSProperties}>{interests.map((x,i)=><button type="button" aria-pressed={i===interest} data-interest-active={i===interest?"true":undefined} className={i===interest?"active":""} onClick={()=>selectInterest(i)} key={x}>{x}{i===interest&&<span key={`${interest}-${interestCycle}`} className={`interest-progress${interestAutoplay?" playing":""}`} aria-hidden="true"/>}</button>)}</div>
          <div className="direction-module content-rise" style={{"--content-rise-delay":"220ms"} as CSSProperties}>
            <article key={`stage-${activeInterest.name}`} className="feature-stage interest-swap-stage"><img src={activeInterestImage.src} alt={activeInterestImage.alt} decoding="async"/><div className="stage-copy"><small>本期兴趣方向 · {activeInterest.name}</small><h3><LineBreaks text={activeInterest.title}/></h3><p>{activeInterest.desc}</p><a className="responsive-button" href={CREATE_URL}><ResponsiveButtonLabel full={`围绕${activeInterest.name}创作`} short="创作"/> <ButtonArrow dark/></a></div><div id="chapter-2" className="official-benefits stage-benefits"><small>完成本期创作，有机会获得</small><b>官方流量激励　·　官号展示　·　案例推荐</b><span>优质作品将进入官方评选</span></div></article>
            <aside key={`signal-${activeInterest.name}`} className="signal-panel interest-swap-signal" style={{"--signal-base":activeInterest.panelBase,"--signal-a":activeInterest.panelA,"--signal-b":activeInterest.panelB,"--signal-c":activeInterest.panelC,"--signal-d":activeInterest.panelD,"--signal-border":activeInterest.panelBorder,"--signal-phase":activeInterest.panelPhase} as CSSProperties}>
              <div className="signal-panel-head"><small>真实需求信号</small><h3>听见真实问题，<br/>找到可创作的回应</h3></div>
              <div className="voice-stack"><article className="voice-card user-voice"><span><img src={activeInterest.userAvatar} alt=""/></span><div><small>用户原声 · {activeInterest.userHandle}</small><blockquote>“<LineBreaks text={activeInterest.userQuote}/>”</blockquote></div></article><article className="voice-card creator-voice"><span><img src={activeInterest.creatorAvatar} alt=""/></span><div><small>创作者原声 · {activeInterest.creatorHandle}</small><blockquote>“<LineBreaks text={activeInterest.creatorQuote}/>”</blockquote></div></article></div>
            </aside>
          </div>
        </section>

        <HorizontalCases/>

        <section id="chapter-4" className="chapter chapter-support">
          <div className="chapter-head"><div><SoftBlurInGroup kicker="需要帮助时" title={"学习、发布、反馈，\n一站找到"} body="从学习入门到发布上线，再到社群反馈，按当前任务进入对应支持。"/></div></div>
          <div className="support-stack content-rise" style={{"--content-rise-delay":"180ms"} as CSSProperties}><article><b>01</b><small>入门课程</small><h3>通过短课与示例，<br/>快速完成第一张兴趣卡。</h3><a className="responsive-button" href="#"><ResponsiveButtonLabel full="查看兴趣卡课程" short="课程"/> <ButtonArrow dark/></a><div className="support-shape play">▶</div></article><article><b>02</b><small>发布指南</small><h3>发布规范、上线检查与<br/>常见问题一次看清。</h3><a className="responsive-button" href="#"><ResponsiveButtonLabel full="查看发布指南" short="指南"/> <ButtonArrow dark/></a><div className="support-shape list">☷</div></article><article><b>03</b><small>社区问答与反馈</small><h3>加入飞书群，与官方和<br/>创作者直接交流。</h3><a className="responsive-button" href="#"><ResponsiveButtonLabel full="进入创作者社群" short="社群"/> <ButtonArrow dark/></a><div className="support-shape qr">QR</div></article></div>
        </section>

        <section id="chapter-5" className="chapter chapter-final">
          <Blaze className="final-blaze" style={{"--blaze-brightness":DEFAULT_BLAZE_TUNING.brightness,"--blaze-saturation":DEFAULT_BLAZE_TUNING.saturation} as CSSProperties} height={DEFAULT_BLAZE_TUNING.height} distortion={DEFAULT_BLAZE_TUNING.distortion} distortionScale={DEFAULT_BLAZE_TUNING.distortionScale} speed={DEFAULT_BLAZE_TUNING.speed} sparks={DEFAULT_BLAZE_TUNING.sparks} sparkDensity={DEFAULT_BLAZE_TUNING.sparkDensity} sparkSize={DEFAULT_BLAZE_TUNING.sparkSize} layers={DEFAULT_BLAZE_TUNING.layers} smoke={DEFAULT_BLAZE_TUNING.smoke} glow={DEFAULT_BLAZE_TUNING.glow} sparkColor={hexToLiquidColor(DEFAULT_BLAZE_TUNING.sparkColor)} smokeColor={hexToLiquidColor(DEFAULT_BLAZE_TUNING.smokeColor)}><div className="final-blaze-field"/></Blaze>
          <div className="final-bg-word">IDEA</div><div className="final-copy"><SoftBlurInGroup kicker="准备好了吗？" title={"从一个想法开始，\n做出你的第一张兴趣卡"} body="进入抖音创作者中心，用一句话生成并发布你的兴趣卡。"/><div className="content-rise" style={{"--content-rise-delay":"240ms"} as CSSProperties}><a className="responsive-button" href={CREATE_URL}><ResponsiveButtonLabel full="开始创作" short="创作"/> <ButtonArrow/></a><a className="responsive-button" href="#chapter-4"><ResponsiveButtonLabel full="查看课程" short="课程"/></a></div></div>
          <div className={`interest-card-showcase${finalCardDragging?" is-dragging":""}`} aria-label="可拖拽旋转的三维抖音兴趣卡示例" onPointerDown={event=>{event.currentTarget.setPointerCapture(event.pointerId);finalCardDragRef.current={pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,baseX:finalCardRotation.x,baseY:finalCardRotation.y};setFinalCardDragging(true)}} onPointerMove={event=>{const drag=finalCardDragRef.current;if(!drag||drag.pointerId!==event.pointerId)return;setFinalCardRotation({x:Math.max(-6,Math.min(6,drag.baseX-(event.clientY-drag.startY)*.055)),y:drag.baseY+(event.clientX-drag.startX)*.34})}} onPointerUp={event=>{if(finalCardDragRef.current?.pointerId!==event.pointerId)return;finalCardDragRef.current=null;setFinalCardDragging(false);event.currentTarget.releasePointerCapture(event.pointerId)}} onPointerCancel={()=>{finalCardDragRef.current=null;setFinalCardDragging(false)}}>
            <div className="interest-flip-card content-rise" style={{"--content-rise-delay":"320ms","--card-drag-x":`${finalCardRotation.x}deg`,"--card-drag-y":`${finalCardRotation.y}deg`} as CSSProperties}>
              <div className="interest-card-inner">
                <article className="interest-card-face interest-card-front">
                  <div className="interest-card-cover"><img src="/assets/case-gallery-reference-v4.png" alt="春日艺术展览场景"/><span>抖音兴趣卡</span></div>
                  <div className="interest-card-copy"><small>INTEREST CARD　01</small><h3>今天适合<br/>逛什么展？</h3><p>回答几个兴趣问题，生成你的春日逛展人格。</p><div><b>兴趣人格</b><span>抖音兴趣卡</span></div></div>
                </article>
                <article className="interest-card-face interest-card-back" aria-hidden="true">
                  <div className="interest-card-cover"><img src="/assets/case-gallery-reference-v4.png" alt=""/><span>抖音兴趣卡</span></div>
                  <div className="interest-card-copy"><small>INTEREST CARD　01</small><h3>今天适合<br/>逛什么展？</h3><p>回答几个兴趣问题，生成你的春日逛展人格。</p><div><b>兴趣人格</b><span>抖音兴趣卡</span></div></div>
                </article>
                {Array.from({length:17},(_,index)=><i className="interest-card-depth" style={{"--depth-z":`${(index-8)*.5}px`} as CSSProperties} aria-hidden="true" key={index}/>) }
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <footer className="edition-footer">
      <div className="footer-primary">
        <div className="footer-brand">
          <img src="/assets/logo.png" alt="抖音开放平台"/>
          <div className="footer-socials" aria-label="平台入口">
            <a href="#" aria-label="抖音"><span aria-hidden="true">♪</span></a>
            <a href="#" aria-label="抖音小程序"><span aria-hidden="true">小</span></a>
            <a href="#" aria-label="微信"><span aria-hidden="true">微</span></a>
          </div>
        </div>
        <nav className="footer-nav" aria-label="页尾导航">
          {footerGroups.map(group=><section key={group.title}>
            <h2>{group.title}</h2>
            <ul>{group.links.map(link=><li key={link}><a href="#">{link}</a></li>)}</ul>
          </section>)}
        </nav>
      </div>
      <div className="footer-legal">
        <nav className="footer-friends" aria-label="友情链接">
          {footerFriends.map(link=><a href="#" key={link}>{link}</a>)}
        </nav>
        <div className="footer-report"><span>违规信息举报：</span><a href="#">在线：互联网举报中心</a><span>电话：400-140-2108</span><a href="mailto:jubao@douyin.com">邮箱：jubao@douyin.com</a></div>
        <div className="footer-record"><span>2023 © 抖音</span><i aria-hidden="true">｜</i><a href="#">蜀ICP备2022010445号-2</a><i aria-hidden="true">｜</i><span>成都聚沙成塔科技有限公司</span><a className="footer-police" href="#"><b aria-hidden="true">徽</b>川公网安备 51015602000374号</a></div>
      </div>
    </footer>
  </main>
}
