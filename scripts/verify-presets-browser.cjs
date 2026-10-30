const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
process.chdir(path.join(__dirname,'..'));
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const original=fs.readFileSync('dist/index.html','utf8'),origin='https://silppuri.test/';
const at=original.lastIndexOf('  loadSharedLocation();');
const html=original.slice(0,at)+'window.audit={stateIn,render,renderGoal,packageModel,packageSummary,packagePresets,data,shareUrl,createShareImage,piePresentation,pieViewport};'+original.slice(at);
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});
 try{
  for(const width of [1200,390,320]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',r=>r.request().url().startsWith(origin)?r.fulfill({contentType:'text/html; charset=utf-8',body:html}):r.abort());
   await page.goto(origin);
   assert.equal(await page.locator('[data-preset]').count(),8);
   for(const [sum,state] of [[0,'under'],[9499.99,'under'],[9500,'target'],[10000,'target'],[10500,'target'],[10500.01,'over'],[20200,'over']]){
    await page.evaluate(sum=>audit.renderGoal(sum),sum);
    assert.equal(await page.locator('.sp-remaining').getAttribute('data-goal'),state,'goal boundary '+sum);
    assert.equal(await page.locator('.sp-remaining-label').textContent(),state==='target'?'Tavoite kasassa':state==='under'?'Vielä puuttuu':'Yli tavoitteen');
   }
   await page.evaluate(()=>audit.render());
   assert.equal(await page.locator('#sp-presets-title').textContent(),'Valmiit paketit');
   assert.ok(!(await page.locator('.sp-threshold-note').textContent()).includes('avoimet arviot'));
   assert.ok(await page.evaluate(()=>document.querySelector('.sp-presets').compareDocumentPosition(document.querySelector('#sp-search'))&Node.DOCUMENT_POSITION_FOLLOWING));
   for(const id of ['income','corporate','cut-1-25','cut-1-42','tax-softdrink']){
    await page.locator('#sp-search').fill(await page.evaluate(id=>audit.data.find(d=>d.id===id).title.split(/[+−]/)[0].trim(),id));
    const card=page.locator('article').filter({has:page.locator('[data-open="'+id+'"]')});
    await card.scrollIntoViewIfNeeded();
    const rect=await card.locator('.sp-stepper').evaluate(e=>{const r=e.getBoundingClientRect(),c=e.closest('article').getBoundingClientRect(),bs=[...e.querySelectorAll('button')].map(b=>b.getBoundingClientRect());return {x:Math.min(c.right-12,bs.at(-1).right+15),y:r.top+r.height/2};});
    await page.mouse.click(rect.x,rect.y);
    assert.ok(await page.locator('.sp-modal').evaluate(e=>e.open),id+' right-side opens '+width);
    await page.locator('.sp-modal-close').click();
    const plus=card.locator('.sp-stepper button').last();
    const before=await card.locator('output').textContent();
    await plus.click();
    assert.deepEqual(errors,[]); assert.notEqual(await card.locator('output').textContent(),before,id+' plus adjusts');
    assert.equal(await page.locator('.sp-modal').evaluate(e=>e.open),false,id+' plus does not open');
    await card.locator('.sp-stepper button').first().click();
    assert.equal(await card.locator('output').textContent(),before,id+' minus adjusts');
    const box=await card.locator('output').boundingBox();await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
    assert.ok(await page.locator('.sp-modal').evaluate(e=>e.open),id+' output opens');await page.locator('.sp-modal-close').click();
   }
   await page.locator('#sp-search').fill('');
   await page.locator('[data-preset="poor"]').click();
   assert.equal(await page.locator('.sp-preset-dialog').evaluate(e=>e.open),false,'empty package applies immediately');
   const poor=await page.evaluate(()=>JSON.stringify(audit.packageModel()));
   await page.locator('[data-preset="rich"]').click();
   assert.ok(await page.locator('.sp-preset-dialog').evaluate(e=>e.open));
   assert.ok(await page.locator('.sp-preset-cancel').evaluate(e=>e===document.activeElement));
   await page.locator('.sp-preset-cancel').click();
   assert.equal(await page.evaluate(()=>JSON.stringify(audit.packageModel())),poor,'cancel preserves package');
   await page.locator('[data-preset="rich"]').click();await page.keyboard.press('Escape');
   assert.equal(await page.evaluate(()=>JSON.stringify(audit.packageModel())),poor,'Escape preserves package');
   for(const id of ['rich','all','companies','consumption','committee','nightwatch','pension']){
    await page.locator('[data-preset="'+id+'"]').click();await page.locator('.sp-preset-confirm').click();
    const r=await page.evaluate(()=>{const state=audit.packageModel(),s=audit.packageSummary(audit.data.filter(d=>state.selectedIds.includes(d.id)));return {total:s.total,name:state.name};});
    assert.ok(id==='nightwatch'?r.total>20000:r.total>=9500&&r.total<=10500,id+' real total');
    assert.equal(await page.locator('.sp-remaining').getAttribute('data-goal'),id==='nightwatch'?'over':'target');
    assert.ok(r.name.length);
   }
   const saved=await page.evaluate(()=>JSON.stringify(audit.packageModel()));await page.reload();
   assert.equal(await page.evaluate(()=>JSON.stringify(audit.packageModel())),saved,'preset reload');
   const ownStore=await page.evaluate(()=>localStorage.getItem('silppuri:state:v1:/'));
   const shared=await page.evaluate(()=>audit.shareUrl(audit.packagePresets[0].model,location.href));
   await page.goto(shared);await page.locator('[data-preset="poor"]').click();await page.locator('.sp-preset-confirm').click();
   assert.equal(await page.evaluate(()=>localStorage.getItem('silppuri:state:v1:/')),ownStore,'preset does not overwrite owner from shared view');
   const sharedState=await page.evaluate(()=>JSON.stringify(audit.packageModel()));await page.reload();
   assert.equal(await page.evaluate(()=>JSON.stringify(audit.packageModel())),sharedState,'shared preset round trip');
   await page.locator('.sp-return-own').click();assert.equal(await page.evaluate(()=>JSON.stringify(audit.packageModel())),saved);
   await page.locator('.sp-clear').click();assert.ok(await page.locator('#sp-reset-dialog').evaluate(e=>e.open));await page.locator('.sp-reset-cancel').click();
   assert.equal(await page.evaluate(()=>JSON.stringify(audit.packageModel())),saved,'reset still cancels');
   await page.locator('.sp-clear').click();await page.locator('.sp-reset-confirm').click();
   for(const reloaded of [false,true]){
    if(reloaded)await page.reload();
    const cleared=await page.evaluate(()=>audit.packageModel());
    assert.equal(cleared.name,'','reset clears the name, including after reload');
    assert.deepEqual(cleared.selectedIds,[],'reset clears all actions');
    assert.equal(await page.locator('.sp-panel-heading h2').textContent(),'Sinun pakettisi');
   }
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no horizontal overflow');
   await page.locator('.sp-presets').scrollIntoViewIfNeeded();await page.screenshot({path:'tmp/presets-'+width+'.png'});
   assert.deepEqual(errors,[]);console.log('PASS '+width+': goal boundaries, card click areas, controls, 8 presets, cancel/Escape, reset, local/share persistence and layout');
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
