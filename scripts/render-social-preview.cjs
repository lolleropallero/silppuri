// Regenerate the committed PNG after editing its HTML or the existing logo.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assets=path.join(__dirname,'../src/assets');
const logo=fs.readFileSync(path.join(assets,'claw-slashes.svg'),'utf8')
  .replace('<path fill="#fff" d="M0 0h512v512H0z"/>','')
  .replace('fill="#000"','fill="currentColor"')
  .replace('<svg ','<svg aria-hidden="true" ');
const html=fs.readFileSync(path.join(assets,'social-preview.html'),'utf8').replace('<!--SILPPURI_LOGO-->',logo);

async function render(){
  const browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});
  try{
    const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
    await page.setContent(html);
    await page.evaluate(()=>document.fonts.ready);
    const output=path.join(assets,'social-preview.png');
    await page.locator('main').screenshot({path:output});
    console.log(output);
  }finally{await browser.close();}
}
render().catch(error=>{console.error(error);process.exitCode=1;});
