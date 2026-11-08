export interface PerimeterPoint { x: number; y: number; }
export interface DocumentScrollMetrics {
  scrollTop: number; scrollHeight: number; clientHeight: number;
  maxScroll: number; remaining: number; isAtBottom: boolean; progress: number;
}
const clamp01=(v:number)=>Math.min(1,Math.max(0,v));

/** Exact length of the path rendered by BorderTracingLayer. */
export function getElementPerimeter(width:number,height:number,borderRadius:number,isHexagon:boolean):number {
  const w=Math.max(0,width),h=Math.max(0,height);
  if(!w||!h)return 0;
  if(isHexagon)return Math.hypot(w*.5,h*.25)*4+h;
  const r=Math.min(Math.max(0,borderRadius),Math.min(w,h)*.5);
  return 2*(w-2*r)+2*(h-2*r)+2*Math.PI*r;
}

/** Point at normalized distance along the SVG path, starting at the top edge. */
export function getPointOnElementPerimeter(width:number,height:number,borderRadius:number,isHexagon:boolean,progress:number):PerimeterPoint {
  const w=Math.max(0,width),h=Math.max(0,height),p=clamp01(progress);
  if(!w||!h)return {x:0,y:0};
  if(isHexagon){
    if(p===0||p===1)return {x:w*.5,y:0};
    const pts:PerimeterPoint[]=[
      {x:w*.5,y:0},{x:w,y:h*.25},{x:w,y:h*.75},
      {x:w*.5,y:h},{x:0,y:h*.75},{x:0,y:h*.25},{x:w*.5,y:0}
    ];
    const lens=pts.slice(0,-1).map((a,i)=>Math.hypot(pts[i+1].x-a.x,pts[i+1].y-a.y));
    let d=p*lens.reduce((sum,n)=>sum+n,0);
    for(let i=0;i<lens.length;i++){
      const len=lens[i];
      if(d<=len||i===lens.length-1){
        const t=len===0?0:Math.min(1,d/len),a=pts[i],b=pts[i+1];
        return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};
      }
      d-=len;
    }
    return pts[0];
  }
  const r=Math.min(Math.max(0,borderRadius),Math.min(w,h)*.5);
  if(p===0||p===1)return {x:r,y:0};
  if(!r){
    let d=p*2*(w+h);
    if(d<=w)return {x:d,y:0}; d-=w;
    if(d<=h)return {x:w,y:d}; d-=h;
    if(d<=w)return {x:w-d,y:h}; d-=w;
    return {x:0,y:h-d};
  }
  type Seg={length:number;at:(t:number)=>PerimeterPoint};
  const line=(x1:number,y1:number,x2:number,y2:number):Seg=>{
    const length=Math.hypot(x2-x1,y2-y1);
    return {length,at:t=>({x:x1+(x2-x1)*t,y:y1+(y2-y1)*t})};
  };
  const arc=(cx:number,cy:number,a0:number,a1:number):Seg=>({
    length:r*Math.abs(a1-a0),
    at:t=>{const a=a0+(a1-a0)*t;return {x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)};}
  });
  const segs:Seg[]=[
    line(r,0,w-r,0),arc(w-r,r,-Math.PI/2,0),line(w,r,w,h-r),
    arc(w-r,h-r,0,Math.PI/2),line(w-r,h,r,h),
    arc(r,h-r,Math.PI/2,Math.PI),line(0,h-r,0,r),
    arc(r,r,Math.PI,Math.PI*1.5)
  ];
  let d=p*segs.reduce((sum,s)=>sum+s.length,0);
  for(let i=0;i<segs.length;i++){
    const seg=segs[i];
    if(d<=seg.length||i===segs.length-1)return seg.at(seg.length===0?0:Math.min(1,d/seg.length));
    d-=seg.length;
  }
  return {x:r,y:0};
}

/** Page progress based on the actual document.scrollingElement metrics. */
export function getDocumentScrollMetrics(scrollTopValue:number,scrollHeightValue:number,clientHeightValue:number,tolerance=2):DocumentScrollMetrics {
  const scrollHeight=Math.max(0,scrollHeightValue),clientHeight=Math.max(0,clientHeightValue);
  const maxScroll=Math.max(0,scrollHeight-clientHeight);
  const scrollTop=Math.min(Math.max(0,scrollTopValue),maxScroll);
  const remaining=Math.max(0,maxScroll-scrollTop);
  const isAtBottom=maxScroll<=tolerance||remaining<=tolerance;
  const progress=isAtBottom?100:Math.min(99,Math.max(0,Math.round((scrollTop/maxScroll)*100)));
  return {scrollTop,scrollHeight,clientHeight,maxScroll,remaining,isAtBottom,progress};
}
