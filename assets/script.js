// Minimal client script: language toggle and load publications.json to render list
(function(){
  const btnPt = document.getElementById('btn-pt');
  const btnEn = document.getElementById('btn-en');
  function setLang(lang){
    document.documentElement.setAttribute('data-lang', lang);
    const show = document.querySelectorAll('.lang-' + lang);
    const hide = document.querySelectorAll('.lang-' + (lang==='pt'?'en':'pt'));
    show.forEach(el=>el.style.display='');
    hide.forEach(el=>el.style.display='none');
    btnPt.setAttribute('aria-pressed', lang==='pt');
    btnEn.setAttribute('aria-pressed', lang==='en');
  }
  btnPt.addEventListener('click', ()=>setLang('pt'));
  btnEn.addEventListener('click', ()=>setLang('en'));

  // load publications.json and render
  async function loadPubs(){
    try{
      const res = await fetch('/publications.json');
      if(!res.ok) return;
      const pubs = await res.json();
      const container = document.getElementById('publications-list');
      if(!pubs || pubs.length===0){
        return;
      }
      const ul = document.createElement('ul');
      pubs.forEach(p=>{
        const li = document.createElement('li');
        const title = p.title || p['title'] || p['work-title'] || 'Untitled';
        const authors = (p.authors || p['author'] || []).map(a=>a.name).join(', ');
        const link = p.url || p['url'] || p['external-ids']?.doi ? (p.url || ('https://doi.org/'+p['external-ids'].doi)) : null;
        li.textContent = title + (authors? (' — '+authors):'') + (p.year? (' ('+p.year+')'):'');
        if(link){
          const a = document.createElement('a');
          a.href = link;
          a.textContent = ' PDF/Link';
          a.target = '_blank';
          a.rel = 'noopener';
          li.appendChild(a);
        }
        ul.appendChild(li);
      });
      container.innerHTML = '';
      container.appendChild(ul);
    }catch(e){ console.error('Failed to load publications', e); }
  }
  loadPubs();
})();