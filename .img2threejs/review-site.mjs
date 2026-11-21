import {chromium} from 'playwright';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import fs from 'node:fs';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const base='http://127.0.0.1:5173';
const c=createCanvas(1050,750),ctx=c.getContext('2d');
for(const [col,id] of ['1','12','25'].entries()){
 for(const [row,width] of [1440,320].entries()){
   const p=await b.newPage({viewport:{width,height:900},isMobile:row===1,hasTouch:row===1});
   await p.goto(base+'/?andar='+id);
   const bounds=await p.locator('.photo').boundingBox();
   const shot=await p.screenshot({clip:{x:bounds.x,y:0,width:bounds.width,height:Math.min(900,bounds.height)}});
   const im=await loadImage(shot);
   const scale=Math.min(350/im.width,375/im.height);
   ctx.drawImage(im,col*350,row*375,im.width*scale,im.height*scale);
   await p.close();
 }
}
fs.writeFileSync('.img2threejs/alinhamento.jpg',c.toBuffer('image/jpeg',91));
const direct=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await direct.goto(base+'/maquete/76?andar=12&final=03A');
await direct.locator('canvas').waitFor();
await direct.screenshot({path:'.img2threejs/model-integrado.png'});
await b.close();
