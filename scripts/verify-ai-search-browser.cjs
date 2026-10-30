// Browser -> real Worker handler -> mocked inference. No Cloudflare calls.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
process.chdir(path.join(__dirname,'..'));
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const original=fs.readFileSync('dist/index.html','utf8'),origin='https://silppuri.test/';
const at=original.lastIndexOf('  loadSharedLocation();');
const html=original.slice(0,at)+'window.audit={data,packageModel};'+original.slice(at);
(async()=>{
  const {default:worker}=await import('../src/worker.mjs');
  const browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});
  try{
    for(const width of [1200,390,320]){
      const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'}),errors=[],sent=[];
      let responseIds=['income','corporate','cut-3-7'],providerFails=false,allow=true,delay=false,release,invalidResponse=false;
      const inferenceReady=Promise.withResolvers();
      const env={AI_SEARCH_MODE:'workers-free',AI_SEARCH_LIMITER:{limit:async()=>({success:allow})},AI:{run:async()=>{
        if(delay)await new Promise(resolve=>{release=resolve;inferenceReady.resolve();});
        if(providerFails)throw new Error('quota exhausted');
        return {choices:[{message:{content:JSON.stringify({ids:responseIds})},finish_reason:'stop'}]};
      }}};
      page.on('pageerror',e=>errors.push(e.message));
      await page.route('**/*',async route=>{
        const r=route.request();
        if(r.url()===origin+'api/ai-search'){
          sent.push(r.postDataJSON());
          if(invalidResponse){await route.fulfill({contentType:'text/html',body:'<h1>provider internals</h1>'});return;}
          const result=await worker.fetch(new Request(r.url(),{method:'POST',headers:{...r.headers(),'cf-connecting-ip':'192.0.2.1'},body:r.postData()}),env);
          await route.fulfill({status:result.status,headers:Object.fromEntries(result.headers),body:await result.text()});
        }else if(r.url()===origin)await route.fulfill({contentType:'text/html; charset=utf-8',body:html});
        else await route.abort();
      });
      await page.goto(origin);
      assert.deepEqual(errors,[]);assert.equal(sent.length,0,'loading a page never calls AI');
      assert.equal(await page.locator('.sp-ai-search').evaluate(e=>e.open),false);
      await page.locator('.sp-ai-search summary').click();
      const before=await page.evaluate(()=>JSON.stringify(audit.packageModel()));
      providerFails=true;allow=false;
      for(const [query,expected] of [['mamut ulos','cut-5-45'],['yle silppuriin','cut-1-42'],['Köyhät kyykkyyn','cut-3-13']]){
        await page.locator('#sp-ai-query').fill(query);await page.locator('.sp-ai-submit').click();
        await page.locator('.sp-ai-results [data-open="'+expected+'"]').waitFor({state:'visible'});
        assert.equal(sent.length,0,'short searches work offline, with AI disabled or its quota exhausted');
        assert.equal(await page.locator('.sp-ai-history li').count(),1,'a new explicit subject resets earlier constraints');
        assert.equal(await page.evaluate(()=>JSON.stringify(audit.packageModel())),before);
      }
      await page.locator('.sp-ai-reset').click();providerFails=false;allow=true;
      await page.locator('#sp-ai-query').fill('Veroja lisää yrityksille');
      await page.locator('.sp-ai-submit').click();
      await page.waitForFunction(()=>document.querySelector('.sp-ai-status').textContent==='Hakuehdotukset');
      assert.equal(await page.locator('.sp-ai-result').count(),3);
      assert.equal(await page.evaluate(()=>JSON.stringify(audit.packageModel())),before,'search does not change the package');
      const income=page.locator('.sp-ai-results [data-open="income"]');
      assert.equal(await income.locator('.sp-ai-title').textContent(),await page.evaluate(()=>audit.data.find(d=>d.id==='income').title));
      await income.click();
      assert.ok(await page.locator('.sp-modal').evaluate(e=>e.open));
      const oldAmount=await income.locator('.sp-ai-amount').textContent();
      await page.locator('.sp-modal [data-step="income"][data-delta="1"]').click();
      assert.notEqual(await income.locator('.sp-ai-amount').textContent(),oldAmount,'results use the current calculator settings');
      await page.locator('.sp-modal-close').click();
      assert.ok(await income.evaluate(e=>e===document.activeElement),'popup restores focus');
      await income.click();await page.locator('.sp-modal-confirm').click();
      await page.waitForFunction(()=>audit.packageModel().selectedIds.includes('income'));
      assert.ok((await income.locator('.sp-ai-picked').textContent()).startsWith('Paketissa'));
      await page.locator('#sp-ai-query').fill('Entä ilman ansiotuloveroja?');await page.locator('.sp-ai-submit').click();
      await page.waitForFunction(()=>document.querySelector('.sp-ai-history').children.length===2);
      assert.deepEqual(sent[1].history,[{query:'Veroja lisää yrityksille',ids:['income','corporate','cut-3-7']}]);
      assert.ok(sent[1].selectedIds.includes('income'));
      await page.locator('.sp-ai-search').screenshot({path:`tmp/ai-search-${width}.png`});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow');
      providerFails=true;
      await page.locator('#sp-ai-query').fill('Kiintiö täynnä');await page.locator('.sp-ai-submit').click();
      await page.waitForFunction(()=>document.querySelector('.sp-ai-status').textContent.includes('ei ole nyt käytettävissä'));
      assert.equal(await page.locator('#sp-ai-query').inputValue(),'Kiintiö täynnä','failed query stays editable');
      assert.equal(await page.locator('.sp-ai-result').count(),3,'previous useful results survive failure');
      await page.locator('#sp-search').fill('Yle');
      assert.ok(await page.locator('.sp-action-list article:visible').count()>0,'ordinary search works after provider failure');
      assert.equal(sent.length,3,'normal search does not call AI');
      allow=false;
      await page.locator('.sp-ai-submit').click();await page.waitForFunction(()=>document.querySelector('.sp-ai-status').textContent.startsWith('Odota'));
      assert.equal(await page.locator('.sp-ai-submit').isEnabled(),true);
      providerFails=false;allow=true;responseIds=[];
      await page.locator('.sp-ai-submit').click();await page.waitForFunction(()=>document.querySelector('.sp-ai-status').textContent.includes('ei löytynyt'));
      assert.equal(await page.locator('.sp-ai-result').count(),0);
      await page.locator('.sp-ai-reset').click();
      assert.equal(await page.locator('.sp-ai-history li').count(),0);
      const selectedBefore=await page.evaluate(()=>audit.packageModel().selectedIds);
      // A cancelled, late response cannot resurrect a reset search.
      delay=true;responseIds=['corporate'];
      await page.locator('#sp-ai-query').fill('Uusi hidas haku');
      const waiting=page.waitForRequest(origin+'api/ai-search');await page.locator('.sp-ai-submit').click();await waiting;
      let inferenceTimeout;
      await Promise.race([inferenceReady.promise,new Promise((_,reject)=>{
        inferenceTimeout=setTimeout(()=>reject(new Error('Mock inference did not start within five seconds')),5000);
      })]).finally(()=>clearTimeout(inferenceTimeout));
      assert.equal(await page.locator('.sp-ai-submit').isDisabled(),true);
      await page.locator('.sp-ai-reset').click();release();delay=false;
      await page.locator('#sp-ai-query').fill('<img src=x onerror=alert(1)>');await page.locator('.sp-ai-submit').click();
      await page.waitForFunction(()=>document.querySelector('.sp-ai-history').children.length===1);
      assert.equal(await page.locator('.sp-ai-history img').count(),0,'query text cannot inject HTML');
      assert.deepEqual(sent.at(-1).history,[],'reset discards conversation');
      assert.deepEqual(await page.evaluate(()=>audit.packageModel().selectedIds),selectedBefore);
      // Search can surface a non-default alternative hidden in the catalogue.
      responseIds=['cut-2-43'];
      await page.locator('#sp-ai-query').fill('Toinen tutkinto maksulliseksi');await page.locator('.sp-ai-submit').click();
      await page.locator('.sp-ai-results [data-open="cut-2-43"]').waitFor({state:'visible'});
      await page.locator('.sp-ai-results [data-open="cut-2-43"]').click();
      await page.locator('.sp-modal [data-variant="eva-tuition"]').click();
      assert.equal(await page.locator('#sp-impact-title').textContent(),await page.evaluate(()=>audit.data.find(d=>d.id==='eva-tuition').title));
      await page.locator('.sp-modal-confirm').click();
      await page.waitForFunction(()=>audit.packageModel().selectedIds.includes('eva-tuition'));
      assert.ok(!(await page.evaluate(()=>audit.packageModel().selectedIds)).includes('cut-2-43'));
      invalidResponse=true;
      await page.locator('#sp-ai-query').fill('Virheellinen palvelinvastaus');await page.locator('.sp-ai-submit').click();
      await page.waitForFunction(()=>document.querySelector('.sp-ai-status').textContent==='AI-haku ei vastaa. Tavallinen haku toimii alla.');
      assert.ok(!(await page.locator('.sp-ai-status').textContent()).includes('provider internals'));
      assert.deepEqual(errors,[]);
      await page.reload();assert.equal(await page.locator('.sp-ai-result').count(),0,'search history is not persisted');
      await page.close();console.log('AI search browser passed at '+width+'px (mocked inference)');
    }
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
