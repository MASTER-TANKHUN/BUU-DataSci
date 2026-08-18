(function(){
const D=GHOST_DATA;

function captionYearGap(){
  const el=document.getElementById('caption-year-chart');
  if(!el)return;
  let mode='comparable';

  const draw=()=>{
    el.innerHTML='';
    let rows=D.captionByYear.slice();
    if(mode==='comparable') rows=rows.filter(d=>d.foundN>=20&&d.notFoundN>=20);

    const mobile=el.clientWidth<560,w=Math.max(280,el.clientWidth),h=mobile?300:350;
    const m=mobile?{l:46,r:12,t:24,b:48}:{l:62,r:22,t:28,b:50};
    const iw=w-m.l-m.r,ih=h-m.t-m.b;
    const values=rows.flatMap(d=>[d.found,d.notFound]).filter(v=>Number.isFinite(v));
    const mx=Math.max(...values,1)*1.08;
    const minYear=rows[0].year,maxYear=rows.at(-1).year;
    const X=yr=>m.l+iw*((yr-minYear)/((maxYear-minYear)||1));
    const Y=v=>m.t+ih*(1-v/mx);
    const svg=svgEl('svg',{viewBox:`0 0 ${w} ${h}`,role:'img'});
    svg.style.height=h+'px';el.style.minHeight=h+'px';el.appendChild(svg);

    for(let i=0;i<=4;i++){
      const yy=m.t+ih*i/4;
      svg.appendChild(svgEl('line',{x1:m.l,x2:w-m.r,y1:yy,y2:yy,class:'grid'}));
      const tx=svgEl('text',{x:m.l-7,y:yy+3,'text-anchor':'end',class:'axis'});
      tx.textContent=fmt.compact(mx*(1-i/4));svg.appendChild(tx);
    }
    rows.forEach(d=>{
      const tx=svgEl('text',{x:X(d.year),y:h-14,'text-anchor':'middle',class:'axis'});
      tx.textContent=d.year;svg.appendChild(tx);
    });

    const defs=[
      {key:'found',nKey:'foundN',label:'Caption found',color:'#2bb79a'},
      {key:'notFound',nKey:'notFoundN',label:'Caption not found',color:'#718591'}
    ];

    defs.forEach(series=>{
      let segment=[];
      const flush=()=>{
        if(segment.length>1) svg.appendChild(svgEl('path',{d:'M'+segment.map(p=>p[0]+','+p[1]).join(' L'),stroke:series.color,class:'line'}));
        segment=[];
      };
      rows.forEach(d=>{
        const v=d[series.key];
        if(!Number.isFinite(v)){flush();return;}
        const cx=X(d.year),cy=Y(v),n=d[series.nKey],sparse=n<20;
        segment.push([cx,cy]);
        const dot=svgEl('circle',{cx,cy,r:mobile?4.2:4.8,fill:sparse?'#fff':series.color,stroke:series.color,'stroke-width':sparse?2:0,class:'dot'});
        if(sparse) dot.setAttribute('opacity','.72');
        svg.appendChild(dot);
        dot.addEventListener('mousemove',e=>{
          const rect=el.getBoundingClientRect();
          tip(el,`<b>${series.label} · ${d.year}</b><br>${fmt.int(v)} average views<br>n = ${n}${sparse?'<br><span style="color:#f2b84b">sample size ต่ำ — ตีความระวัง</span>':''}`,e.clientX-rect.left,e.clientY-rect.top);
        });
        dot.addEventListener('mouseleave',()=>hideTip(el));
      });
      flush();
    });

    const legendY=12;
    [['#2bb79a','Caption found'],['#718591','Caption not found']].forEach((it,i)=>{
      const x=m.l+i*(mobile?125:155);
      svg.appendChild(svgEl('line',{x1:x,x2:x+18,y1:legendY,y2:legendY,stroke:it[0],'stroke-width':3}));
      const t=svgEl('text',{x:x+24,y:legendY+3,class:'axis'});t.textContent=it[1];svg.appendChild(t);
    });
  };

  draw();
  document.querySelectorAll('[data-caption-year-mode]').forEach(b=>b.addEventListener('click',()=>{
    mode=b.dataset.captionYearMode;
    document.querySelectorAll('[data-caption-year-mode]').forEach(x=>x.classList.toggle('active',x===b));
    draw();
  }));
}


function caption(){
  const c=document.getElementById('caption-chart'),y=document.getElementById('year-chart'); if(!c||!y)return;
  GCharts.barChart(c,D.captionViews,{labelKey:'label',color:(d,i)=>i?'#9da8af':'#2bb79a',format:v=>fmt.int(v)+' views'});
  let range='all';
  const drawYear=()=>{
    y.innerHTML='';
    let rows=D.yearViews;if(range==='early')rows=rows.filter(d=>d.year<=2020);if(range==='late')rows=rows.filter(d=>d.year>=2021);
    const mobile=y.clientWidth<560,w=Math.max(260,y.clientWidth),h=mobile?290:350,m=mobile?{l:42,r:10,t:18,b:44}:{l:52,r:20,t:20,b:44},iw=w-m.l-m.r,ih=h-m.t-m.b;
    const mx=Math.max(...rows.map(d=>d.value))*1.08,minY=rows[0].year,maxYr=rows.at(-1).year,X=x=>m.l+iw*((x-minY)/((maxYr-minY)||1)),Y=v=>m.t+ih*(1-v/mx),svg=svgEl('svg',{viewBox:`0 0 ${w} ${h}`});
    svg.style.height=h+'px';y.style.minHeight=h+'px';y.appendChild(svg);
    for(let i=0;i<=4;i++){const yy=m.t+ih*i/4;svg.appendChild(svgEl('line',{x1:m.l,x2:w-m.r,y1:yy,y2:yy,class:'grid'}));const tx=svgEl('text',{x:m.l-6,y:yy+3,'text-anchor':'end',class:'axis'});tx.textContent=fmt.compact(mx*(1-i/4));svg.appendChild(tx)}
    rows.forEach((d,i)=>{const shouldLabel=!mobile||rows.length<=5||i%2===0||i===rows.length-1;if(!shouldLabel)return;const tx=svgEl('text',{x:X(d.year),y:h-13,'text-anchor':'middle',class:'axis'});tx.textContent=d.year;svg.appendChild(tx)});
    const pts=rows.map(d=>[X(d.year),Y(d.value),d]);svg.appendChild(svgEl('path',{d:'M'+pts.map(p=>p[0]+','+p[1]).join(' L'),stroke:'#2bb79a',class:'line'}));
    pts.forEach(([cx,cy,d])=>{const dot=svgEl('circle',{cx,cy,r:mobile?4:4.5,fill:'#2bb79a',class:'dot'});svg.appendChild(dot);dot.addEventListener('mousemove',e=>{const rect=y.getBoundingClientRect();tip(y,`<b>${d.year}</b><br>${fmt.int(d.value)} views`,e.clientX-rect.left,e.clientY-rect.top)});dot.addEventListener('mouseleave',()=>hideTip(y))});
  };
  drawYear();
  document.querySelectorAll('[data-year-range]').forEach(b=>b.addEventListener('click',()=>{range=b.dataset.yearRange;document.querySelectorAll('[data-year-range]').forEach(x=>x.classList.toggle('active',x===b));drawYear()}));
}

function timing(){
  const el=document.getElementById('day-chart');if(!el)return;let group='all';const isWeekend=d=>['Saturday','Sunday'].includes(d.day);
  const render=()=>{
    let rows=D.dayRank;if(group==='weekday')rows=rows.filter(d=>!isWeekend(d));if(group==='weekend')rows=rows.filter(isWeekend);
    GCharts.horizontalBars(el,rows.map(d=>({...d,label:d.th+' · #'+d.rank})),{
      valueKey:'value',
      max:1200000,
      xTicks:7,
      xAxisFormat:v=>Math.round(v).toLocaleString('en-US'),
      format:v=>v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})+' views',
      color:d=>d.rank===1?'#2bb79a':'#667b86',
      tooltipFormat:d=>`<b>${d.th} · อันดับ #${d.rank}</b><br>${d.exact}`
    });
  };
  render();
  document.querySelectorAll('[data-day-group]').forEach(b=>b.addEventListener('click',()=>{group=b.dataset.dayGroup;document.querySelectorAll('[data-day-group]').forEach(x=>x.classList.toggle('active',x===b));render()}));
}

function narrative(){
  const el=document.getElementById('narrative-chart');if(!el)return;let range=[0,100];const s=D.narrative.series.map(x=>({...x,visible:true}));
  const render=()=>GCharts.lineChart(el,s,D.narrative.positions,{xMin:range[0],xMax:range[1],format:v=>v.toFixed(2)+' / 10k chars'});
  render();
  document.querySelectorAll('[data-signal]').forEach(b=>b.addEventListener('click',()=>{const item=s.find(x=>x.key===b.dataset.signal);item.visible=!item.visible;if(!s.some(x=>x.visible))item.visible=true;b.classList.toggle('active',item.visible);render()}));
  document.querySelectorAll('[data-progress]').forEach(b=>b.addEventListener('click',()=>{range=b.dataset.progress==='first'?[0,50]:b.dataset.progress==='last'?[50,100]:[0,100];document.querySelectorAll('[data-progress]').forEach(x=>x.classList.toggle('active',x===b));render()}));
}

caption();captionYearGap();timing();narrative();
window.addEventListener('resize',()=>{clearTimeout(window.__rr);window.__rr=setTimeout(()=>{caption();captionYearGap();timing();narrative()},140)});
})();
