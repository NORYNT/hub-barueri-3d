import {chromium, devices} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
try {
  for(const mobile of [false,true]){
    const page=await browser.newPage(mobile?devices['Pixel 7']:{viewport:{width:1320,height:850}});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:5173/maquete/76');
    const marker=page.locator('#marker');
    await marker.waitFor();
    const where=await marker.boundingBox();
    if(mobile){
      const cdp=await page.context().newCDPSession(page);
      const x=190,y=470;
      for(const [type,pts] of [['touchStart',[{x,y}]],['touchMove',[{x:x+88,y:y+25}]],['touchEnd',[]]]) await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
    }else{
      await page.mouse.move(430,470); await page.mouse.down(); await page.mouse.move(550,510,{steps:12}); await page.mouse.up();
    }
    await page.waitForTimeout(450);
    const after=await marker.boundingBox();
    assert.ok(Math.hypot(after.x-where.x,after.y-where.y)>5,'orbit moved');
    if(!mobile) await page.screenshot({path:'.img2threejs/orbit.png'});
    await page.locator('#top').click(); await page.waitForTimeout(850);
    if(!mobile) await page.screenshot({path:'.img2threejs/superior.png'});
    if(mobile) await marker.tap();
    else {
      const m=await marker.boundingBox();
      await page.mouse.click(m.x+m.width/2+50,m.y+m.height/2+26);
    }
    await page.getByRole('dialog').waitFor();
    await page.waitForFunction(()=>document.querySelector('#official').naturalWidth===3840);
    await page.getByRole('button',{name:'Voltar à maquete'}).click();
    await page.getByRole('dialog').waitFor({state:'hidden'});
    await marker.waitFor();
    await page.locator('#plan').click();
    await page.waitForFunction(()=>document.querySelector('#official').naturalWidth===5000);
    await page.keyboard.press('Escape');
    await page.locator('#reset').click();
    await page.waitForTimeout(850);
    await page.screenshot({path:'.img2threejs/'+(mobile?'celular':'inicial')+'.png'});
    assert.deepEqual(errors,[]);
    console.log(mobile?'touch passed':'mouse passed');
    await page.close();
  }
} finally { await browser.close(); }
