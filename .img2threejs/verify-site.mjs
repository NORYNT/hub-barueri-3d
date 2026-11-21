import {chromium,devices} from 'playwright';
import assert from 'node:assert/strict';
const url='http://127.0.0.1:5173';
const executablePath='C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser=await chromium.launch({executablePath,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];const requests=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',req=>requests.push(req.url()));
 await page.goto(url);
 await page.locator('.building').waitFor();
 await page.screenshot({path:'.img2threejs/site-desktop.png'});
 assert.ok(!requests.some(x=>x.includes('/src/main.ts')||x.includes('three.js')));
 async function center(p,id){
   return p.locator('polygon[data-floor="'+id+'"]').evaluate(poly=>{
     const points=poly.points;
     const a=points.getItem(2),b=points.getItem(13);
     const pt=new DOMPoint((a.x+b.x)/2,(a.y+b.y)/2).matrixTransform(poly.getScreenCTM());
     return {x:pt.x,y:pt.y};
   });
 }
 for(const id of ['1','12','25']){
   const {x,y}=await center(page,id); await page.mouse.move(x,y);
   await page.locator('polygon.highlight[data-floor="'+id+'"]').waitFor();
   assert.equal(await page.locator('polygon.highlight').count(),1);
   assert.equal(await page.locator('.floor-label').innerText(),id+'º pavimento tipo');
   if(id==='25') await page.screenshot({path:'.img2threejs/site-high.png'});
 }
 const middle=await center(page,'12'); await page.mouse.click(middle.x,middle.y);
 assert.equal(await page.locator('#floor').inputValue(),'12');
 await page.getByRole('button',{name:'Explorar andar'}).click();
 await page.getByRole('link',{name:'03A 76 m²'}).click();
 await page.waitForURL('**/maquete/76?andar=12&final=03A');
 await page.locator('#scene canvas').waitFor();
 assert.match(decodeURIComponent(await page.getByText('Quero saber mais').getAttribute('href')),/76 m², final 03A, no 12º pavimento tipo/);
 await page.locator('#marker').click();
 await page.waitForFunction(()=>document.querySelector('#official')?.naturalWidth===3840);
 await page.getByRole('button',{name:'Voltar à maquete'}).click();
 await page.locator('#marker').waitFor();
 await page.getByText('Voltar à torre').click();
 assert.equal(await page.locator('#floor').inputValue(),'12');
 await page.locator('#floor').selectOption('garden');
 await page.getByRole('button',{name:'Explorar andar'}).click();
 await page.getByRole('link',{name:'03A 112 m²'}).click();
 await page.getByRole('heading',{name:'112 m²'}).waitFor();
 await page.waitForFunction(()=>document.querySelector('.plan-frame img')?.naturalWidth===2500);
 await page.getByRole('button',{name:'Ampliar planta'}).click();
 assert.equal(await page.locator('.plan-frame img').evaluate(i=>i.style.width),'150%');
 await page.getByText('Voltar ao andar').click();
 await page.getByRole('heading',{name:'Garden'}).waitFor();
 await page.getByRole('button',{name:'Voltar à torre'}).click();
 assert.equal(await page.locator('#floor').inputValue(),'garden');
 await page.locator('#floor').selectOption('4');
 await page.locator('#explore').press('Enter');
 await page.getByRole('link',{name:'07A 45 m²'}).click();
 await page.getByRole('heading',{name:'45 m²'}).waitFor();
 await page.goto(url+'/maquete/76');
 await page.locator('#scene canvas').waitFor();
 await page.getByText('Voltar à torre').click();
 assert.equal(new URL(page.url()).pathname,'/');
 assert.deepEqual(errors,[]);
 const mobile=await browser.newPage(devices['Pixel 7']);
 await mobile.goto(url);
 for(const id of ['1','12','25']){
   const {x,y}=await center(mobile,id);
   await mobile.touchscreen.tap(x,y);
   assert.equal(await mobile.locator('#floor').inputValue(),id);
   await mobile.locator('polygon.highlight[data-floor="'+id+'"]').waitFor();
 }
 await mobile.screenshot({path:'.img2threejs/site-mobile.png',fullPage:true});
 await mobile.getByRole('button',{name:'Explorar andar'}).tap();
 await mobile.getByRole('link',{name:'06A 76 m²'}).tap();
 await mobile.locator('#scene canvas').waitFor();
 await mobile.locator('#marker').tap();
 await mobile.getByRole('dialog').waitFor();
 await mobile.getByRole('button',{name:'Voltar à maquete'}).tap();
 await mobile.locator('#marker').waitFor();
 const fallback=await browser.newPage();
 await fallback.addInitScript(()=>{
   const original=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:original.call(this,type,...args)};
 });
 await fallback.goto(url+'/maquete/76?andar=12&final=06A');
 await fallback.getByRole('heading',{name:'76 m²'}).waitFor();
 await fallback.getByRole('button',{name:'Ver living'}).click();
 await fallback.getByRole('dialog').waitFor();
 console.log('Desktop, touch, 76/112/45 m², links, WhatsApp and WebGL fallback passed.');
}finally{await browser.close();}
