(function(){
function mobile(el){return el.clientWidth < 560}
function size(el,h=330){return {w:Math.max(260,el.clientWidth),h}}
function clear(el){el.innerHTML=''}

function barChart(el,data,{valueKey='value',labelKey='label',color='#2bb79a',format=v=>fmt.compact(v),max=null}={}){
  clear(el);
  const isMobile=mobile(el), {w}=size(el), h=isMobile?275:330;
  const m=isMobile?{l:28,r:12,t:14,b:66}:{l:46,r:18,t:16,b:48};
  const iw=w-m.l-m.r, ih=h-m.t-m.b;
  const svg=svgEl('svg',{viewBox:`0 0 ${w} ${h}`,role:'img'});svg.style.height=h+'px';el.style.minHeight=h+'px';el.appendChild(svg);
  const mx=max||Math.max(...data.map(d=>d[valueKey]),1);
  for(let i=0;i<=4;i++){const y=m.t+ih*i/4;svg.appendChild(svgEl('line',{x1:m.l,x2:w-m.r,y1:y,y2:y,class:'grid'}));}
  const gap=isMobile?10:12,bw=Math.max(24,(iw-gap*(data.length-1))/data.length);
  data.forEach((d,i)=>{
    const val=d[valueKey],bh=ih*val/mx,x=m.l+i*(bw+gap),y=m.t+ih-bh;
    const r=svgEl('rect',{x,y,width:bw,height:bh,rx:2,fill:typeof color==='function'?color(d,i):color,class:'bar'});svg.appendChild(r);
    const tx=svgEl('text',{x:x+bw/2,y:h-(isMobile?32:20),'text-anchor':'middle',class:'axis'});tx.textContent=d[labelKey];svg.appendChild(tx);
    r.addEventListener('mousemove',e=>{const rect=el.getBoundingClientRect();tip(el,`<b>${d[labelKey]}</b><br>${format(val)}`,e.clientX-rect.left,e.clientY-rect.top)});
    r.addEventListener('mouseleave',()=>hideTip(el));
  });
}

function lineChart(el,series,xVals,{xMin=0,xMax=100,format=v=>v.toFixed(2)}={}){
  clear(el);
  const isMobile=mobile(el),{w}=size(el),h=isMobile?300:350;
  const m=isMobile?{l:38,r:10,t:18,b:44}:{l:52,r:20,t:20,b:44};
  const iw=w-m.l-m.r,ih=h-m.t-m.b;
  const svg=svgEl('svg',{viewBox:`0 0 ${w} ${h}`,role:'img'});svg.style.height=h+'px';el.style.minHeight=h+'px';el.appendChild(svg);
  const visibleIdx=xVals.map((x,i)=>({x,i})).filter(o=>o.x>=xMin&&o.x<=xMax);
  const vals=[];series.filter(s=>s.visible!==false).forEach(s=>visibleIdx.forEach(o=>vals.push(s.values[o.i])));
  const maxY=Math.max(...vals,1)*1.1,minX=Math.min(...visibleIdx.map(o=>o.x)),maxX=Math.max(...visibleIdx.map(o=>o.x));
  const X=x=>m.l+iw*((x-minX)/((maxX-minX)||1)),Y=v=>m.t+ih*(1-v/maxY);
  for(let i=0;i<=4;i++){
    const yy=m.t+ih*i/4;svg.appendChild(svgEl('line',{x1:m.l,x2:w-m.r,y1:yy,y2:yy,class:'grid'}));
    const tx=svgEl('text',{x:m.l-6,y:yy+3,'text-anchor':'end',class:'axis'});tx.textContent=(maxY*(1-i/4)).toFixed(0);svg.appendChild(tx)
  }
  const ticks=[0,10,20,30,40,50,60,70,80,90,100].filter(x=>x>=xMin&&x<=xMax);
  ticks.forEach(xv=>{const tx=svgEl('text',{x:X(Math.max(minX,Math.min(maxX,xv))),y:h-13,'text-anchor':'middle',class:'axis'});tx.textContent=xv;svg.appendChild(tx)});
  series.filter(s=>s.visible!==false).forEach(s=>{
    const pts=visibleIdx.map(o=>[X(o.x),Y(s.values[o.i]),o]);
    const p=svgEl('path',{d:'M'+pts.map(p=>p[0]+','+p[1]).join(' L'),stroke:s.color,class:'line'});svg.appendChild(p);
    pts.forEach(([cx,cy,o])=>{
      const c=svgEl('circle',{cx,cy,r:isMobile?4:4.5,fill:s.color,class:'dot'});svg.appendChild(c);
      c.addEventListener('mousemove',e=>{const rect=el.getBoundingClientRect();tip(el,`<b>${s.th||s.label}</b><br>ตำแหน่งเรื่อง ~${o.x}%<br>${format(s.values[o.i])}`,e.clientX-rect.left,e.clientY-rect.top)});
      c.addEventListener('mouseleave',()=>hideTip(el));
    });
  });
}

function horizontalBars(el,data,{
  labelKey='label',
  valueKey='value',
  format=v=>v.toFixed(2),
  color='#2bb79a',
  max=null,
  tooltipFormat=null,
  xTicks=0,
  xAxisFormat=null
}={}){
  clear(el);

  const isMobile=mobile(el),{w}=size(el),rowH=isMobile?42:46;
  const hasAxis=xTicks>1;
  const h=Math.max(300,data.length*rowH+(hasAxis?58:30));
  const m=isMobile
    ?{l:92,r:24,t:12,b:hasAxis?46:20}
    :{l:170,r:70,t:12,b:hasAxis?48:20};

  const iw=w-m.l-m.r;
  const svg=svgEl('svg',{viewBox:`0 0 ${w} ${h}`});
  svg.style.height=h+'px';
  el.style.minHeight=h+'px';
  el.appendChild(svg);

  const mx=max||Math.max(...data.map(d=>d[valueKey]),1);

  // Real-value X axis: no relative index.
  if(hasAxis){
    const axisFmt=xAxisFormat||format;
    for(let i=0;i<xTicks;i++){
      const value=mx*i/(xTicks-1);
      const xx=m.l+iw*(value/mx);

      svg.appendChild(svgEl('line',{
        x1:xx,x2:xx,
        y1:m.t-2,
        y2:h-m.b+4,
        class:'grid'
      }));

      const tick=svgEl('text',{
        x:xx,
        y:h-12,
        'text-anchor':i===0?'start':i===xTicks-1?'end':'middle',
        class:'axis'
      });
      tick.textContent=axisFmt(value);
      svg.appendChild(tick);
    }

    const axisTitle=svgEl('text',{
      x:m.l+iw/2,
      y:h-1,
      'text-anchor':'middle',
      class:'axis axis-title'
    });
    axisTitle.textContent='Average View Count';
    svg.appendChild(axisTitle);
  }

  data.forEach((d,i)=>{
    const y=m.t+i*rowH,bh=isMobile?18:20,bw=iw*d[valueKey]/mx;

    const label=svgEl('text',{
      x:m.l-8,
      y:y+13,
      'text-anchor':'end',
      class:'axis'
    });
    label.textContent=d[labelKey];
    svg.appendChild(label);

    svg.appendChild(svgEl('rect',{
      x:m.l,y,
      width:iw,height:bh,
      rx:2,fill:'#edf1f3'
    }));

    const r=svgEl('rect',{
      x:m.l,y,
      width:bw,height:bh,
      rx:2,
      fill:typeof color==='function'?color(d,i):color,
      class:'bar'
    });
    svg.appendChild(r);

    // Exact numeric value on desktop.
    if(!isMobile){
      const val=svgEl('text',{
        x:Math.min(w-m.r-2,m.l+bw+8),
        y:y+14,
        class:'axis'
      });
      val.textContent=format(d[valueKey]);
      svg.appendChild(val);
    }

    r.addEventListener('mousemove',e=>{
      const rect=el.getBoundingClientRect();
      const content=tooltipFormat
        ?tooltipFormat(d)
        :`<b>${d[labelKey]}</b><br>${format(d[valueKey])}`;
      tip(el,content,e.clientX-rect.left,e.clientY-rect.top)
    });
    r.addEventListener('mouseleave',()=>hideTip(el));
  });
}

window.GCharts={barChart,lineChart,horizontalBars};
})();
