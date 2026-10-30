  // Search state stays in this tab's memory; it is not part of shared packages.
  const aiSearch={ids:[],history:[],pending:false,request:0,controller:null};
  const aiQuery=q('#sp-ai-query'),aiStatus=q('.sp-ai-status'),aiResults=q('.sp-ai-results');
  function finishAiSearch(query,ids,history){
    aiSearch.ids=[...new Set(ids)];
    aiSearch.history=[...history,{query,ids:aiSearch.ids}].slice(-3);
    aiQuery.value='';aiQuery.placeholder='Hae tai tarkenna…';
    aiStatus.textContent=aiSearch.ids.length?'Hakuehdotukset':'Näillä ehdoilla ei löytynyt toimia. Kokeile toista hakua.';
    renderAiResults();renderAiHistory();
  }
  function aiSearchError(message){const error=new Error(message);error.searchMessage=message;return error;}
  function renderAiResults(){
    // Keep existing buttons mounted so popup close restores keyboard focus.
    const current=[...aiResults.children].map(b=>b.dataset.open);
    if(JSON.stringify(current)!==JSON.stringify(aiSearch.ids)){
      aiResults.replaceChildren(...aiSearch.ids.map(id=>{
        const button=document.createElement('button');button.type='button';button.dataset.open=id;
        button.className='sp-ai-result cursor-interaction';
        button.innerHTML='<span class="sp-ai-title"></span><strong class="sp-ai-amount"></strong><span class="sp-ai-who"></span><span class="sp-ai-picked"></span>';
        return button;
      }));
    }
    for(const button of aiResults.children){
      const d=data.find(d=>d.id===button.dataset.open);if(!d)continue;
      // All visible facts come from the calculator, never from generated prose.
      button.querySelector('.sp-ai-title').textContent=d.title;
      button.querySelector('.sp-ai-amount').textContent=moneyLabel(d.amount);
      button.querySelector('.sp-ai-who').textContent=d.who;
      const picked=selected.has(d.id);
      button.dataset.selected=String(picked);
      button.querySelector('.sp-ai-picked').textContent=picked?'✓ Paketissa · Avaa kortti':'Avaa kortti →';
    }
  }
  function renderAiHistory(){
    const history=q('.sp-ai-history');history.hidden=!aiSearch.history.length;
    history.replaceChildren(...aiSearch.history.map(h=>{const li=document.createElement('li');li.textContent=h.query;return li;}));
    q('.sp-ai-reset').hidden=!aiSearch.history.length&&!aiSearch.pending;
  }
  q('.sp-ai-form').addEventListener('submit',async event=>{
    event.preventDefault();
    const query=aiQuery.value.trim();if(aiSearch.pending||query.length<3||query.length>600)return;
    const ticket=++aiSearch.request,controller=new AbortController();
    aiSearch.controller=controller;aiSearch.pending=true;
    q('.sp-ai-submit').disabled=true;aiQuery.readOnly=true;
    q('.sp-ai-form').setAttribute('aria-busy','true');
    aiStatus.textContent='Etsitään toimia…';renderAiHistory();
    const timer=setTimeout(()=>controller.abort(),45000);
    try{
      const response=await fetch('/api/ai-search',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({query,history:aiSearch.history,selectedIds:[...selected]}),signal:controller.signal});
      if(!response.ok){
        let error='';try{error=(await response.json()).error;}catch{}
        throw aiSearchError(error==='rate-limit'?'Odota hetki ennen seuraavaa AI-hakua. Tavallinen haku toimii alla.':
          error==='disabled'?'AI-haku ei ole käytössä. Tavallinen haku toimii alla.':
          'AI-haku ei ole nyt käytettävissä. Tavallinen haku toimii alla.');
      }
      const result=await response.json();
      if(!Array.isArray(result?.ids)||result.ids.length>6||result.ids.some(id=>!baseData.has(id)))throw aiSearchError('AI-haku ei palauttanut kelvollisia kortteja. Kokeile tavallista hakua.');
      if(ticket!==aiSearch.request)return;
      finishAiSearch(query,result.ids,aiSearch.history);
    }catch(error){
      if(ticket===aiSearch.request)aiStatus.textContent=error.name==='AbortError'?'AI-haku kesti liian kauan. Kokeile tavallista hakua.':
        error.searchMessage||'AI-haku ei vastaa. Tavallinen haku toimii alla.';
    }finally{
      clearTimeout(timer);
      if(ticket===aiSearch.request){
        aiSearch.pending=false;aiSearch.controller=null;q('.sp-ai-submit').disabled=false;aiQuery.readOnly=false;
        q('.sp-ai-form').removeAttribute('aria-busy');renderAiHistory();
      }
    }
  });
  q('.sp-ai-reset').addEventListener('click',()=>{
    aiSearch.request++;aiSearch.controller?.abort();Object.assign(aiSearch,{ids:[],history:[],pending:false,controller:null});
    aiQuery.value='';aiQuery.readOnly=false;aiQuery.placeholder='Esim. asumisen tuet';
    aiStatus.textContent='';q('.sp-ai-submit').disabled=false;q('.sp-ai-form').removeAttribute('aria-busy');
    renderAiResults();renderAiHistory();aiQuery.focus();
  });
