const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const original=fs.readFileSync('dist/index.html','utf8'),origin='https://silppuri.test/';
const at=original.lastIndexOf('  loadSharedLocation();');
const html=original.slice(0,at)+'window.growthAudit={stateIn,render,packagePresets,snapshot:()=>growthSnapshot,chosen:()=>growthChosen.map(d=>d.id),model:growthModel};'+original.slice(at);
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});
 try{
  for(const width of [1200,390,320]){
   const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',r=>r.request().url().startsWith(origin)?r.fulfill({contentType:'text/html; charset=utf-8',body:html}):r.abort());
   await page.goto(origin);
   const pick=id=>page.evaluate(id=>{const p=growthAudit.packagePresets.find(p=>p.id===id);growthAudit.stateIn({modelContent:p.model});growthAudit.render();},id);
   const label=()=>page.locator('.sp-growth-plot').getAttribute('aria-label'),coverage=()=>page.locator('.sp-growth-coverage').textContent();
   assert.equal(await page.locator('.sp-growth-line').count(),0);
   assert.match(await page.locator('.sp-growth-empty').textContent(),/Valitse toimia/,'no selection is not a zero line');
   await pick('poor');
   assert.equal(await page.locator('.sp-growth-scope').isVisible(),false,'a complete calculation needs no coverage line');
   assert.equal(await page.locator('.sp-growth').evaluate(e=>e.tagName),'SECTION','the chart cannot be collapsed');
   assert.ok(await page.locator('.sp-growth-plot').isVisible(),'the chart is always visible');
   // One line and one band, each drawn in a loss and a gain colour clipped at the zero line.
   for(const side of ['loss','gain'])for(const mark of ['line','band'])assert.equal(await page.locator(`.sp-growth-${side} .sp-growth-${mark}`).count(),1,side+' '+mark);
   assert.equal(new Set(await page.locator('.sp-growth-line').evaluateAll(els=>els.map(e=>e.getAttribute('d')))).size,1,'one GDP line');
   assert.notEqual(await page.locator('.sp-growth-loss .sp-growth-line').evaluate(e=>getComputedStyle(e).stroke),await page.locator('.sp-growth-gain .sp-growth-line').evaluate(e=>getComputedStyle(e).stroke),'loss and gain differ in colour');
   assert.equal(await page.locator('.sp-growth-point.sp-growth-loss').count(),1,'a smaller GDP gets the loss colour');
   assert.equal(await page.locator('.sp-growth-value').count(),1,'a curve without a turning point labels only its end');
   assert.equal(await page.locator('.sp-growth-hit title').count(),6,'every year of the five-year window has a readable value');
   // The chart carries its own figures; the details carry coverage and caveats, so no text
   // under the chart repeats them.
   assert.equal(await page.locator('.sp-growth-summary').count(),0);
   assert.match(await label(),/BKT on noin .+ pienempi ja 5 vuoden päästä noin .+ pienempi kuin ilman pakettia\. Oletuksista riippuen 5\. vuoden ero on .+ … .+\./,'screen readers get the figures as text');
   assert.match(await coverage(),/VM:n pitkän aikavälin työn tarjonnan arviot, eivät käyrässä: yhteensä noin [+−].+Ne koskevat vain \d+ \/ \d+ toimea, joten summa ei ole paketin työllisyysvaikutus/,'untimed labour-supply estimates keep their coverage and caveat');
   await pick('nightwatch');
   assert.match(await coverage(),/Käyrässä mukana (noin \d+ %|lähes kaikki) paketin säästöistä \(\d+ \/ \d+ toimea\)\. Ei arviota: /);
   await pick('growth');
   const svg=await page.locator('.sp-growth-plot').boundingBox(),labels=await page.locator('.sp-growth-value').evaluateAll(els=>els.map(e=>e.getBoundingClientRect().toJSON()));
   assert.ok(labels.every(b=>b.left>=svg.x-1&&b.right<=svg.x+svg.width+1),'value labels stay inside the chart');
   assert.ok(labels.length<2||labels[0].right<labels[1].left||labels[0].bottom<labels[1].top||labels[1].bottom<labels[0].top,'value labels do not overlap');
   // Unemployment-benefit cuts have no stable multiplier, so their curve can turn and gets a second label.
   await page.evaluate(()=>{growthAudit.stateIn({modelContent:{selectedIds:['cut-3-15','health']}});growthAudit.render();});
   const turn=await page.evaluate(()=>{const p=growthAudit.snapshot().metrics.gdp.points;return p.slice(1,5).reduce((b,x)=>Math.abs(x.value)>Math.abs(b.value)?x:b,p[1]).year<4;});
   assert.equal(await page.locator('.sp-growth-value').count(),turn?2:1,'a turning point gets its own label');
   await pick('growth');
   await page.locator('.sp-growth').evaluate(e=>e.scrollIntoView({block:'start'}));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no horizontal overflow');
   await page.screenshot({path:'tmp/growth-chart-'+width+'.png'});
   await page.locator('.sp-growth-method>summary').click();
   assert.match(await coverage(),/Käyrässä mukana .+ \(\d+ \/ \d+ toimea\)/);
   // The multiplier groups are tables: the package's own groups, and all of them under Kalibrointi.
   const groups=await page.evaluate(()=>{const chosen=growthAudit.chosen(),all=Object.values(growthAudit.model.fiscalMultipliers.groups);return {all:all.length,chosen:all.filter(g=>g.actions.some(id=>chosen.includes(id))).length};});
   assert.equal(await page.locator('.sp-growth-coverage .sp-growth-table tbody tr').count(),groups.chosen);
   assert.equal(await page.locator('.sp-growth-method-content .sp-growth-table tbody tr').count(),groups.all);
   assert.deepEqual(await page.locator('.sp-growth-method-content .sp-growth-table thead th').allTextContents(),['Ryhmä','Perusmalli','Mallien mediaani','Vaihteluväli 2 v','Vaihteluväli 5 v']);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'wide tables scroll inside their own box');
   // Each group is explained once, under Kalibrointi; the package view only lists its numbers.
   assert.equal((await page.locator('.sp-growth-method').textContent()).split('Alennettujen ALV-kantojen korotus').length,2,'no repeated group notes');
   assert.ok(await page.locator('.sp-growth-coverage a').count()>0,'evidence notes link their sources');
   assert.equal(await page.locator('.sp-growth select').count(),0,'no control that barely moves the curve');
   assert.equal(await page.locator('.sp-growth-heading h2').innerText(),'Paketin vaikutus BKT:hen');
   assert.match(await page.locator('.sp-growth-scope').innerText(),/^Käyrässä mukana noin \d+ % paketin säästöistä \(\d+ \/ \d+ toimea\)\.$/,'a partial curve says how much of the package it covers');
   await page.locator('.sp-growth-method>summary').focus();
   assert.equal(await page.evaluate(()=>document.activeElement.closest('.sp-growth-method')!==null),true,'details are keyboard reachable');
   assert.deepEqual(errors,[]);
   console.log('PASS '+width+': one five-year GDP line with its range, labelled points, screen-reader summary, no repeated text under the chart, coverage notes, keyboard and layout');
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
