(function(){
const D=GHOST_DATA;

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
    GCharts.horizontalBars(el,rows.map(d=>({...d,label:d.th+' · #'+d.rank,value:d.relative})),{
      max:100,
      format:v=>'Index '+v.toFixed(0),
      color:d=>d.rank===1?'#2bb79a':'#667b86',
      tooltipFormat:d=>`<b>${d.th} · อันดับ #${d.rank}</b><br>${d.approx||('Relative index '+d.relative)}`
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

caption();timing();narrative();
window.addEventListener('resize',()=>{clearTimeout(window.__rr);window.__rr=setTimeout(()=>{caption();timing();narrative()},140)});
})();
