(function(){
  const internal = a => a && a.getAttribute('href') && !a.getAttribute('href').startsWith('#') && !a.getAttribute('href').startsWith('http') && !a.hasAttribute('download');
  document.body.classList.add('is-entering');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{document.body.classList.remove('is-entering');document.body.classList.add('is-ready')}));
  document.addEventListener('click',e=>{
    const a=e.target.closest('a'); if(!internal(a) || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const href=a.getAttribute('href'); if(!href || href===location.pathname.split('/').pop()) return;
    if(document.startViewTransition) return; // native cross-document CSS view transition
    e.preventDefault(); document.body.classList.remove('is-ready'); document.body.classList.add('is-leaving');
    setTimeout(()=>location.href=href,390);
  });
  window.addEventListener('pageshow',()=>{document.body.classList.remove('is-leaving','is-entering');document.body.classList.add('is-ready')});

  window.fmt = {
    int:n=>Math.round(n).toLocaleString('en-US'),
    compact:n=> n>=1e9?(n/1e9).toFixed(2)+'B':n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':Math.round(n).toString(),
    pct:n=>n.toFixed(1)+'%',
    q:n=>n<0.0001?n.toExponential(2):n.toFixed(4)
  };

  window.svgEl=(tag,attrs={})=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e};
  window.tip=(container,html,x,y)=>{let t=container.querySelector('.chart-tooltip'); if(!t){t=document.createElement('div');t.className='chart-tooltip';container.appendChild(t)}t.innerHTML=html;t.style.left=Math.min(x+12,container.clientWidth-170)+'px';t.style.top=Math.max(4,y-12)+'px';t.classList.add('show')};
  window.hideTip=container=>{const t=container.querySelector('.chart-tooltip');if(t)t.classList.remove('show')};
})();
