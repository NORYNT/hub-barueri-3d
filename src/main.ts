import {asset,modelLayout,type EnvironmentKey} from './catalog';
import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { bedrooms, footprint, walls } from './plan';

const host = document.querySelector<HTMLDivElement>('#scene')!;
const marker = document.querySelector<HTMLButtonElement>('#marker')!;
const environmentButtons:Record<EnvironmentKey,HTMLButtonElement> = {
  living:marker,
  bedroom:document.querySelector<HTMLButtonElement>('#bedroom-marker')!,
  kitchen:document.querySelector<HTMLButtonElement>('#kitchen-marker')!,
  outdoor:document.querySelector<HTMLButtonElement>('#balcony-marker')!,
};
const dialog = document.querySelector<HTMLDialogElement>('#gallery')!;
const official = document.querySelector<HTMLImageElement>('#official')!;
const status = document.querySelector('#status')!;
let renderer: T.WebGLRenderer;
try {
  renderer = new T.WebGLRenderer({ antialias: true });
} catch (error) {
  status.textContent = 'Ative o WebGL no navegador para abrir a maquete.';
  for (const button of Object.values(environmentButtons)) button.hidden = true;
  throw error;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFShadowMap;
host.append(renderer.domElement);
const scene = new T.Scene();
scene.background = new T.Color('#eae7dd');
const camera = new T.PerspectiveCamera(36, 1, .05, 100);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 3;
controls.maxDistance = 44;
controls.maxPolarAngle = 1.38;
const home = new T.Vector3(8, 17, 12);
const center = new T.Vector3(0, .25, 0);
const apt = new T.Group();
scene.add(apt);
const scale = .00655;
const point = (x: number, z: number, y = 0) => new T.Vector3((x-810)*scale, y, (z-680)*scale);
const matte = (color: string) => new T.MeshStandardMaterial({color, roughness: .82});
const plaster = matte('#eddfcc'), edge = matte('#5e6355'), wood = matte('#a8764e');
const tile = matte('#cfccbf'), cloth = matte('#f2e9d6'), sage = matte('#768053');
const stone = matte('#4c4b43'), metal = matte('#454c47'), ceramic = matte('#fcfaf3');
const glaze = new T.MeshStandardMaterial({color:'#acd4d7', transparent:true, opacity:.37, depthWrite:false, roughness:.2});
function box(x: number,z: number,w: number,d: number,h: number,y: number,mat: T.Material,r=0) {
  const size = [w*scale,h,d*scale] as const;
  const mesh = new T.Mesh(r ? new RoundedBoxGeometry(...size,2,r) : new T.BoxGeometry(...size),mat);
  mesh.position.copy(point(x,z,y+h/2));
  mesh.castShadow = !mat.transparent;
  mesh.receiveShadow = true;
  apt.add(mesh);
  return mesh;
}
function slab(points: number[][], y: number, depth: number, material: T.Material) {
  const shape = new T.Shape(points.map(([x,z]) => {
    const p = point(x,z);
    return new T.Vector2(p.x,-p.z);
  }));
  const mesh = new T.Mesh(new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false}),material);
  mesh.rotation.x = -Math.PI/2;
  mesh.position.y = y;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  apt.add(mesh);
}
slab(footprint,-.25,.23,edge);
slab(footprint,-.02,.02,tile);
for (const room of bedrooms) slab(room,0,.011,wood);
for (const [axis,fixed,start,end,thick,openings=[]] of walls) {
  const height = 1.57;
  const piece = (a: number,b: number,y: number,h: number,mat: T.Material,t=thick) => {
    if (b<=a) return;
    const middle = (a+b)/2;
    if (axis==='x') box(middle,fixed,b-a,t,h,y,mat);
    else box(fixed,middle,t,b-a,h,y,mat);
  };
  const solid = (a: number,b: number) => {
    piece(a,b,0,height,plaster);
    piece(a,b,height,.04,edge);
  };
  let cursor = start;
  for (const [a,b,kind] of openings) {
    solid(cursor,a);
    if (kind==='window' || kind==='slider') {
      const sill = kind==='window' ? .59 : .025;
      if (kind==='window') piece(a,b,0,sill,plaster);
      piece(a,b,sill,1.38-sill,glaze,6);
      for (const v of [a,(a+b)/2,b-4]) piece(v,v+4,sill,1.38-sill,metal,8);
      for (const y of [sill,1.38]) piece(a,b,y,.027,metal,9);
    } else {
      for (const v of [a,b-4]) piece(v,v+4,0,1.38,wood,thick+2);
      if (kind==='entry') piece(a+5,b-5,.02,.035,wood);
    }
    cursor = b;
  }
  solid(cursor,end);
}
box(668,1228,9,207,.62,0,glaze);
box(1028,1339,735,9,.62,0,glaze);
for (let x=670;x<=1388;x+=51) box(x,1339,5,8,.63,0,metal);
for (let z=1133;z<=1339;z+=51) box(668,z,8,5,.63,0,metal);
box(1028,1339,735,12,.025,.62,metal);
box(668,1230,12,218,.025,.62,metal);

function bed(x: number,z: number,w: number,d: number,turned=false) {
  const local = (u: number,v: number,a: number,b: number,h: number,y: number,m: T.Material) =>
    turned ? box(x+v,z+u,b,a,h,y,m,.025) : box(x+u,z+v,a,b,h,y,m,.025);
  local(0,0,w,d,.24,.02,wood);
  local(0,0,w-10,d-9,.14,.26,cloth);
  local(0,d*.15,w-12,d*.64,.055,.4,sage);
  for (const u of w>180 ? [-w*.23,w*.23] : [0]) local(u,-d*.34,w>180?w*.4:w*.76,d*.21,.085,.4,ceramic);
  local(0,-d/2,w,13,.55,.02,wood);
}
bed(135,201,130,290);
bed(221,788,220,291,true);
bed(921,692,130,282);
for (const [x,z,w,d] of [[618,204,75,309],[621,620,66,163],[722,892,64,205],[251,1037,374,76]]) {
  box(x,z,w,d,.94,.02,wood,.012);
  const length = Math.max(w,d);
  for (let i=-length/2+26;i<length/2-5;i+=47) {
    if (w>d) box(x+i,z-d/2,3,3,.64,.23,stone);
    else box(x-w/2,z+i,3,3,.64,.23,stone);
  }
}
box(318,92,226,73,.06,.54,wood,.015);
box(819,1045,253,65,.06,.54,wood,.015);
for (const [x,z] of [[231,92],[405,92],[718,1045],[920,1045]]) box(x,z,10,58,.55,0,wood);
box(848,306,307,265,.025,0,cloth,.01);
box(977,212,135,290,.24,.04,sage,.055);
box(1031,212,30,290,.57,.05,sage,.055);
for (const z of [82,342]) box(972,z,125,28,.41,.15,sage,.05);
for (const z of [143,211,279]) box(970,z,92,65,.10,.26,sage,.04);
box(707,210,29,215,.35,0,wood,.01);
box(707,210,8,142,.46,.35,stone,.012);
for (const [x,z,d] of [[1457,750,302],[1447,1130,350]]) {
  box(x,z,100,d,.49,0,wood,.015);
  box(x,z,104,d,.065,.49,stone,.01);
  box(x,z-68,53,62,.025,.555,metal,.008);
}
box(1447,545,94,108,.96,0,ceramic,.02);
function round(x:number,z:number,r:number,h:number,y:number,mat:T.Material) {
  const mesh = new T.Mesh(new T.CylinderGeometry(r*scale,r*scale,h,28),mat);
  mesh.position.copy(point(x,z,y+h/2));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  apt.add(mesh);
}
for (const [x,z,r] of [[1182,714,77],[1198,1064,64]]) {
  round(x,z,r,.06,.56,cloth);
  round(x,z,r*.28,.56,0,wood);
  for (const [dx,dz] of [[-1,-1],[1,-1],[1,1],[-1,1]]) {
    box(x+dx*r*.99,z+dz*r*.94,51,53,.07,.32,cloth,.03);
    box(x+dx*r*1.21,z+dz*r*.94,13,52,.31,.33,wood,.019);
    box(x+dx*r*.99,z+dz*r*.94,30,32,.32,0,wood,.016);
  }
}
for (const [x,z] of [[240,523],[622,893],[1418,411]]) {
  box(x,z,73,53,.34,0,ceramic,.12);
  box(x,z,46,31,.012,.34,tile,.008);
}
for (const [x,z] of [[360,541],[626,786],[1433,297]]) {
  box(x,z,81,61,.46,0,wood,.02);
  box(x,z,83,64,.035,.46,ceramic,.014);
  box(x,z,51,36,.009,.494,tile,.008);
}
for (const [x,z] of [[827,1191],[876,1263],[741,84]]) {
  round(x,z,22,.22,0,wood);
  for(let i=0;i<7;i++) {
    const a=i*2.399;
    const leaf = box(x+Math.cos(a)*16,z+Math.sin(a)*16,14,50,.025,.25+i*.026,sage,.01);
    leaf.rotation.y = -a;
    leaf.rotation.x = .45;
  }
}
box(957,1203,85,89,.31,0,cloth,.115);
round(1051,1216,32,.06,.39,wood);
round(1051,1216,13,.39,0,wood);

const ground = new T.Mesh(new T.PlaneGeometry(160,160),matte('#eae7dd'));
ground.rotation.x = -Math.PI/2;
ground.position.y = -.27;
ground.receiveShadow = true;
scene.add(ground,new T.HemisphereLight('#fffaf0','#a7a89b',2.05));
const sun = new T.DirectionalLight('#fff0dc',2.5);
sun.position.set(-8,15,6);
sun.castShadow = true;
Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:1,far:32});
sun.shadow.mapSize.set(1536,1536);
sun.shadow.normalBias=.035;
sun.shadow.bias=-.00015;
scene.add(sun);

const anchor = point(855,241,.42);
const environmentLabels:Record<EnvironmentKey,string> = {
  living:'Living',bedroom:'Quarto',kitchen:'Cozinha',outdoor:modelLayout.outdoorLabel,
};
const environmentPoints:Record<EnvironmentKey,T.Vector3> = {
  living:anchor,
  bedroom:point(230,250,.42),
  kitchen:point(618,204,.42),
  outdoor:point(1457,750,.5),
};
const environmentKeys:readonly EnvironmentKey[] = ['living','bedroom','kitchen','outdoor'];
const hit = box(946,245,500,385,.06,.03,new T.MeshBasicMaterial({visible:false}));
const ray = new T.Raycaster();
const mouse = new T.Vector2();
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let animation: {start:number;from:T.Vector3;target:T.Vector3;to:T.Vector3;look:T.Vector3;done?:()=>void}|undefined;
let previous: {camera:T.Vector3;target:T.Vector3}|undefined;
let active = false;
let opener: HTMLElement | null = null;
const homePosition = () => home.clone().multiplyScalar(T.MathUtils.clamp(.88 / camera.aspect, 1, 1.95));
function move(to:T.Vector3,look:T.Vector3,done?:()=>void) {
  controls.enableDamping = false;
  controls.update();
  controls.enableDamping = true;
  animation = {start:performance.now(),from:camera.position.clone(),target:controls.target.clone(),to,look,done};
  controls.enabled = false;
}
function showEnvironment(room:EnvironmentKey) {
  const visual = modelLayout.rooms[room];
  document.querySelector('#image-title')!.textContent = environmentLabels[room]+' · 76 m²';
  document.querySelector('#caption')!.textContent = visual.caption;
  official.alt = 'Imagem ilustrativa: '+environmentLabels[room];
  official.src = asset(visual.image);
  dialog.showModal();
}
function showPlan() {
  document.querySelector('#image-title')!.textContent = 'Planta padrão';
  document.querySelector('#caption')!.textContent = 'Apartamento 76 m² · Book HUB Barueri, página 39';
  official.alt = 'Planta original do apartamento de 76 m², com três dormitórios';
  official.src = asset(modelLayout.image);
  dialog.showModal();
}
function focusEnvironment(room:EnvironmentKey) {
  if(active || animation || dialog.open) return;
  active = true;
  opener = environmentButtons[room];
  previous = {camera:camera.position.clone(),target:controls.target.clone()};
  const target = environmentPoints[room];
  move(target.clone().add(new T.Vector3(2.6,4,3.8)),target,()=>showEnvironment(room));
}
for(const room of environmentKeys) {
  environmentButtons[room].onclick = () => focusEnvironment(room);
}
document.querySelector<HTMLButtonElement>('#plan')!.onclick = event => {
  if (active || dialog.open) return;
  opener = event.currentTarget as HTMLElement;
  showPlan();
};
document.querySelector<HTMLButtonElement>('#back')!.onclick = () => dialog.close();
dialog.onclose = () => {
  const resume = () => {active=false; requestAnimationFrame(()=>opener?.focus());};
  if(previous) {
    move(previous.camera,previous.target,resume);
    previous = undefined;
  } else resume();
};
document.querySelector<HTMLButtonElement>('#reset')!.onclick = () => { if(!active) move(homePosition(),center); };
document.querySelector<HTMLButtonElement>('#top')!.onclick = () => { if(!active) move(new T.Vector3(0,homePosition().length(),.015),center); };
const down = new Map<number,T.Vector2>();
renderer.domElement.addEventListener('pointerdown',event=>{
  down.set(event.pointerId,new T.Vector2(event.clientX,event.clientY));
  if(down.size>1) for(const p of down.values()) p.set(Infinity,Infinity);
});
renderer.domElement.addEventListener('pointercancel',event=>down.delete(event.pointerId));
renderer.domElement.addEventListener('pointerup',event=>{
  const start = down.get(event.pointerId);
  down.delete(event.pointerId);
  if(!start || start.distanceTo(new T.Vector2(event.clientX,event.clientY))>7) return;
  if(event.button !== 0) return;
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
  ray.setFromCamera(mouse,camera);
  if(ray.intersectObject(hit).length) focusEnvironment('living');
});
function resize() {
  camera.aspect = host.clientWidth/host.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(host.clientWidth,host.clientHeight);
}
window.addEventListener('resize',resize);
resize();
camera.position.copy(homePosition());
controls.target.copy(center);
controls.update();
renderer.setAnimationLoop(()=>{
  if(animation) {
    const t = reduce ? 1 : Math.min((performance.now()-animation.start)/560,1);
    const eased = t*t*(3-2*t);
    camera.position.lerpVectors(animation.from,animation.to,eased);
    controls.target.lerpVectors(animation.target,animation.look,eased);
    camera.lookAt(controls.target);
    if(t===1){
      const callback = animation.done;
      animation = undefined;
      controls.enabled = true;
      callback?.();
    }
  } else controls.update();
  renderer.render(scene,camera);
  for(const room of environmentKeys) {
    const p = environmentPoints[room].clone().project(camera);
    const button = environmentButtons[room];
    button.hidden = active || p.z < -1 || p.z > 1 || Math.abs(p.x)>.94 || Math.abs(p.y)>.9;
    if(!button.hidden) {
      button.style.left = (p.x*.5+.5)*100+'%';
      button.style.top = (.5-p.y*.5)*100+'%';
    }
  }
});
