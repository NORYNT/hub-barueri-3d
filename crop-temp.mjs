import {createCanvas,loadImage} from '@napi-rs/canvas';
import {writeFileSync} from 'node:fs';
for(const [n,name,x,y,w,h] of [[38,'living',0,0,2500,1042],[39,'planta',1470,310,685,570]]){
 const src=await loadImage('page-'+n+'.jpg');
 const s=src.width/2500; const c=createCanvas(Math.round(w*s),Math.round(h*s));
 c.getContext('2d').drawImage(src,x*s,y*s,w*s,h*s,0,0,c.width,c.height);
 writeFileSync('public/'+name+'.jpg',c.toBuffer('image/jpeg',91));
}
