import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { asset, type EnvironmentKey } from './catalog';

type SupportedArea = 40 | 45 | 56 | 63 | 112;
type Segment = readonly [number, number, number, number];
type Furniture = {
  kind: 'bed' | 'sofa' | 'counter' | 'cabinet' | 'dining' | 'plant';
  x: number;
  z: number;
  width: number;
  depth: number;
};
type LayoutDefinition = {
  crop: readonly [left: number, top: number, right: number, bottom: number];
  sourceAspect: number;
  anchors: Record<EnvironmentKey, readonly [x: number, z: number]>;
  walls: readonly Segment[];
  furniture: readonly Furniture[];
};

const environmentKeys: readonly EnvironmentKey[] = ['living','bedroom','kitchen','outdoor'];
const layouts: Record<SupportedArea, LayoutDefinition> = {
  40: {
    crop: [.065, .05, .965, .925],
    sourceAspect: 2500 / 2084,
    anchors:{living:[665,445],bedroom:[225,690],kitchen:[745,130],outdoor:[815,830]},
    walls: [
      [68, 56, 958, 56], [958, 56, 958, 922], [958, 922, 430, 922],
      [430, 922, 430, 635], [430, 635, 68, 635], [68, 635, 68, 56],
      [92, 298, 397, 298], [397, 88, 397, 298], [92, 88, 92, 298],
      [205, 130, 205, 290], [405, 300, 405, 620], [430, 635, 918, 635],
      [430, 900, 918, 900], [918, 635, 918, 900],
    ],
    furniture: [
      {kind:'bed',x:225,z:690,width:240,depth:300},
      {kind:'sofa',x:675,z:445,width:135,depth:285},
      {kind:'counter',x:745,z:130,width:310,depth:72},
      {kind:'counter',x:815,z:830,width:130,depth:96},
      {kind:'dining',x:640,z:755,width:142,depth:142},
      {kind:'plant',x:490,z:710,width:58,depth:58},
    ],
  },
  45: {
    crop: [.112, .125, .906, .88],
    sourceAspect: 1,
    anchors:{living:[520,523],bedroom:[674,253],kitchen:[520,825],outdoor:[742,520]},
    walls: [
      [236, 125, 827, 125], [827, 125, 827, 420], [827, 420, 904, 420],
      [904, 420, 904, 875], [904, 875, 114, 875], [114, 875, 114, 719],
      [114, 719, 236, 719], [236, 719, 236, 389], [236, 389, 263, 389],
      [263, 389, 263, 145], [397, 145, 397, 389], [263, 389, 397, 389],
      [397, 389, 642, 389], [642, 389, 642, 719], [397, 719, 642, 719],
      [642, 420, 807, 420], [807, 420, 807, 875],
    ],
    furniture: [
      {kind:'bed',x:674,z:253,width:205,depth:184},
      {kind:'sofa',x:520,z:523,width:215,depth:96},
      {kind:'counter',x:520,z:825,width:360,depth:78},
      {kind:'counter',x:300,z:450,width:72,depth:220},
      {kind:'dining',x:742,z:520,width:138,depth:138},
      {kind:'cabinet',x:490,z:660,width:310,depth:55},
    ],
  },
  56: {
    crop: [.108, .155, .902, .88],
    sourceAspect: 1,
    anchors:{living:[690,720],bedroom:[250,735],kitchen:[742,218],outdoor:[840,730]},
    walls: [
      [109, 158, 900, 158], [900, 158, 900, 876], [900, 876, 109, 876],
      [109, 876, 109, 158], [131, 392, 459, 392], [459, 392, 459, 592],
      [131, 592, 459, 592], [131, 392, 131, 592], [459, 392, 579, 392],
      [579, 392, 579, 591], [459, 591, 579, 591], [131, 595, 131, 850],
      [131, 595, 555, 595], [555, 595, 555, 850], [555, 850, 131, 850],
      [560, 592, 560, 876], [560, 592, 881, 592], [881, 592, 881, 876],
      [580, 355, 881, 355], [580, 158, 580, 355],
    ],
    furniture: [
      {kind:'bed',x:250,z:735,width:205,depth:245},
      {kind:'bed',x:696,z:252,width:190,depth:190},
      {kind:'sofa',x:690,z:803,width:250,depth:110},
      {kind:'counter',x:742,z:218,width:300,depth:68},
      {kind:'dining',x:700,z:445,width:150,depth:120},
      {kind:'plant',x:500,z:490,width:48,depth:48},
    ],
  },
  63: {
    crop: [.115, .06, .865, .945],
    sourceAspect: 2500 / 2778,
    anchors:{living:[690,325],bedroom:[255,330],kitchen:[650,110],outdoor:[400,810]},
    walls: [
      [118, 62, 861, 62], [861, 62, 861, 590], [861, 590, 695, 590],
      [460, 590, 118, 590], [118, 590, 118, 62], [132, 82, 398, 82],
      [398, 82, 398, 428], [132, 428, 398, 428], [132, 82, 132, 428],
      [132, 428, 132, 574], [132, 574, 459, 574], [459, 428, 459, 574],
      [460, 428, 460, 590], [460, 428, 858, 428],
    ],
    furniture: [
      {kind:'bed',x:255,z:330,width:206,depth:212},
      {kind:'sofa',x:683,z:275,width:152,depth:100},
      {kind:'counter',x:650,z:110,width:290,depth:64},
      {kind:'dining',x:692,z:325,width:140,depth:140},
      {kind:'sofa',x:275,z:810,width:260,depth:112},
      {kind:'dining',x:730,z:742,width:154,depth:154},
      {kind:'plant',x:210,z:720,width:55,depth:55},
      {kind:'plant',x:825,z:845,width:58,depth:58},
    ],
  },
  112: {
    crop: [.05, .12, .965, .91],
    sourceAspect: 1,
    anchors:{living:[742,739],bedroom:[264,205],kitchen:[888,585],outdoor:[500,805]},
    walls: [
      [67, 123, 481, 123], [481, 123, 481, 295], [481, 123, 775, 123],
      [775, 123, 775, 318], [775, 123, 906, 123], [906, 123, 906, 575],
      [906, 575, 843, 575], [843, 575, 843, 784], [843, 784, 962, 784],
      [962, 784, 962, 905], [962, 905, 52, 905], [52, 905, 52, 123],
      [67, 123, 67, 679], [67, 295, 371, 295], [371, 295, 371, 405],
      [67, 405, 371, 405], [371, 405, 371, 678], [371, 678, 67, 678],
      [371, 405, 578, 405], [578, 405, 578, 661], [371, 661, 578, 661],
      [481, 123, 481, 295], [481, 295, 639, 295], [639, 123, 639, 405],
      [639, 405, 843, 405], [843, 405, 843, 575], [578, 575, 843, 575],
    ],
    furniture: [
      {kind:'bed',x:264,z:205,width:176,depth:150},
      {kind:'bed',x:268,z:519,width:195,depth:195},
      {kind:'bed',x:586,z:494,width:105,depth:185},
      {kind:'sofa',x:232,z:817,width:265,depth:112},
      {kind:'dining',x:742,z:739,width:155,depth:155},
      {kind:'counter',x:888,z:585,width:66,depth:330},
      {kind:'cabinet',x:550,z:650,width:180,depth:68},
      {kind:'plant',x:132,z:750,width:62,depth:62},
      {kind:'plant',x:857,z:850,width:62,depth:62},
    ],
  },
};

type GenericModelOptions = {
  area: number;
  kind: string;
  image: string;
  markers: Record<EnvironmentKey, HTMLButtonElement>;
};

export function createGenericModel(host: HTMLDivElement, options: GenericModelOptions) {
  const definition = layouts[options.area as SupportedArea];
  if (!definition) throw new RangeError(`Unsupported 3D apartment area: ${options.area}`);

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true });
  } catch {
    return false;
  }

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  host.append(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#eae7dd');

  const crop = definition.crop;
  const cropWidth = crop[2] - crop[0];
  const cropDepth = crop[3] - crop[1];
  const aspect = definition.sourceAspect * cropWidth / cropDepth;
  const bounds = aspect >= 1
    ? new THREE.Vector2(12, 12 / aspect)
    : new THREE.Vector2(12 * aspect, 12);
  const image = new Image();
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = aspect >= 1 ? 1200 : Math.round(1200 * aspect);
  textureCanvas.height = aspect >= 1 ? Math.round(1200 / aspect) : 1200;
  const textureContext = textureCanvas.getContext('2d');
  if (!textureContext) throw new Error('Could not create the apartment plan texture.');

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureContext.fillStyle = '#dedbd1';
  textureContext.fillRect(0, 0, textureCanvas.width, textureCanvas.height);
  image.onload = () => {
    const sx = crop[0] * image.naturalWidth;
    const sy = crop[1] * image.naturalHeight;
    const sw = cropWidth * image.naturalWidth;
    const sh = cropDepth * image.naturalHeight;
    textureContext.drawImage(image, sx, sy, sw, sh, 0, 0, textureCanvas.width, textureCanvas.height);
    texture.needsUpdate = true;
  };
  image.onerror = () => console.error(`Unable to load the official ${options.area} m² plan: ${options.image}`);
  image.src = asset(options.image);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 5;
  controls.maxDistance = 34;
  controls.maxPolarAngle = Math.PI * .48;
  controls.target.set(0, 0, 0);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(bounds.x, bounds.y),
    new THREE.MeshStandardMaterial({ map: texture, roughness: .88, side: THREE.DoubleSide })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(bounds.x + .4, .18, bounds.y + .4),
    new THREE.MeshStandardMaterial({ color: '#596052', roughness: .72 })
  );
  base.position.y = -.13;
  base.receiveShadow = true;
  scene.add(base);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ color: '#eae7dd', roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -.27;
  ground.receiveShadow = true;
  scene.add(ground);

  scene.add(new THREE.HemisphereLight('#fffaf0', '#7d866f', 2.2));
  const sun = new THREE.DirectionalLight('#fff4de', 2.5);
  sun.position.set(-8, 14, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);

  const mapPoint = (x: number, z: number) => new THREE.Vector3(
    ((x / 1000 - crop[0]) / cropWidth - .5) * bounds.x,
    0,
    ((z / 1000 - crop[1]) / cropDepth - .5) * bounds.y
  );
  const markerPoints: Record<EnvironmentKey, THREE.Vector3> = {
    living:mapPoint(...definition.anchors.living),
    bedroom:mapPoint(...definition.anchors.bedroom),
    kitchen:mapPoint(...definition.anchors.kitchen),
    outdoor:mapPoint(...definition.anchors.outdoor),
  };
  for (const point of Object.values(markerPoints)) point.y = .16;
  const wallMaterial = new THREE.MeshStandardMaterial({ color: '#e6d9c7', roughness: .9 });
  for (const [x1, z1, x2, z2] of definition.walls) {
    const start = mapPoint(x1, z1);
    const end = mapPoint(x2, z2);
    const direction = end.clone().sub(start);
    const length = direction.length();
    const wall = new THREE.Mesh(new THREE.BoxGeometry(length, 1.05, .15), wallMaterial);
    wall.position.set((start.x + end.x) / 2, .525, (start.z + end.z) / 2);
    wall.rotation.y = -Math.atan2(direction.z, direction.x);
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);
  }

  const materials = {
    wood: new THREE.MeshStandardMaterial({ color: '#a8764e', roughness: .82 }),
    fabric: new THREE.MeshStandardMaterial({ color: '#e4dfd4', roughness: .94 }),
    sage: new THREE.MeshStandardMaterial({ color: '#768053', roughness: .9 }),
    dark: new THREE.MeshStandardMaterial({ color: '#514d45', roughness: .88 }),
    stone: new THREE.MeshStandardMaterial({ color: '#d3cec2', roughness: .8 }),
    leaf: new THREE.MeshStandardMaterial({ color: '#72875a', roughness: .9 }),
  };
  const addBox = (
    width: number, height: number, depth: number,
    x: number, y: number, z: number, material: THREE.Material
  ) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y + height / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  };
  const worldSize = (x: number, z: number, width: number, depth: number) => {
    const first = mapPoint(x - width / 2, z - depth / 2);
    const last = mapPoint(x + width / 2, z + depth / 2);
    return [Math.max(.06, last.x - first.x), Math.max(.06, last.z - first.z)] as const;
  };

  for (const item of definition.furniture) {
    const position = mapPoint(item.x, item.z);
    const [width, depth] = worldSize(item.x, item.z, item.width, item.depth);
    if (item.kind === 'bed') {
      addBox(width, .13, depth, position.x, .03, position.z, materials.wood);
      addBox(width * .94, .18, depth * .88, position.x, .16, position.z, materials.fabric);
      addBox(width * .95, .34, .075, position.x, .05, position.z + depth / 2, materials.wood);
      for (const offset of [-.24, .24]) {
        addBox(width * .34, .07, depth * .17, position.x + width * offset, .34, position.z - depth * .32, materials.stone);
      }
    } else if (item.kind === 'sofa') {
      addBox(width, .18, depth, position.x, .04, position.z, materials.sage);
      const cushionCount = width > depth ? 3 : 2;
      for (let i = 0; i < cushionCount; i++) {
        const cushionWidth = width / cushionCount;
        const cushionX = position.x - width / 2 + cushionWidth * (i + .5);
        addBox(cushionWidth * .92, .13, depth * .7, cushionX, .22, position.z + depth * .08, materials.sage);
      }
      addBox(width, .42, Math.max(.08, depth * .18), position.x, .17, position.z - depth * .4, materials.sage);
    } else if (item.kind === 'counter') {
      addBox(width, .72, depth, position.x, .03, position.z, materials.dark);
      addBox(width * 1.03, .06, depth * 1.04, position.x, .75, position.z, materials.stone);
    } else if (item.kind === 'cabinet') {
      addBox(width, .64, depth, position.x, .03, position.z, materials.wood);
      addBox(width * 1.02, .06, depth * 1.05, position.x, .67, position.z, materials.stone);
    } else if (item.kind === 'dining') {
      const tabletop = new THREE.Mesh(new THREE.CylinderGeometry(width * .42, width * .42, .09, 28), materials.wood);
      tabletop.position.set(position.x, .78, position.z);
      tabletop.castShadow = true;
      tabletop.receiveShadow = true;
      scene.add(tabletop);
      addBox(.1, .68, .1, position.x, .06, position.z, materials.dark);
      const chairSize = Math.max(.18, Math.min(width, depth) * .22);
      for (const [dx, dz] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const chairX = position.x + dx * width * .55;
        const chairZ = position.z + dz * depth * .55;
        addBox(chairSize, .12, chairSize, chairX, .36, chairZ, materials.wood);
        addBox(chairSize, .42, .08, chairX, .43, chairZ - chairSize * .42, materials.dark);
      }
    } else {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(width * .19, width * .24, .26, 12), materials.wood);
      pot.position.set(position.x, .16, position.z);
      pot.castShadow = true;
      scene.add(pot);
      const leaves = new THREE.Mesh(new THREE.SphereGeometry(width * .36, 10, 8), materials.leaf);
      leaves.position.set(position.x, .53, position.z);
      leaves.castShadow = true;
      scene.add(leaves);
    }
  }

  const home = new THREE.Vector3(bounds.x * .95, Math.max(bounds.x, bounds.y) * 1.45, bounds.y * .95);
  const homePosition = () => home.clone().multiplyScalar(THREE.MathUtils.clamp(.88 / camera.aspect, 1, 1.95));
  const resize = () => {
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height);
  };
  window.addEventListener('resize', resize);
  resize();
  camera.position.copy(homePosition());
  controls.update();
  renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
    for (const key of environmentKeys) {
      const projected = markerPoints[key].clone().project(camera);
      const visible = projected.z >= -1 && projected.z <= 1 &&
        Math.abs(projected.x) < .94 && Math.abs(projected.y) < .9;
      const button = options.markers[key];
      button.hidden = !visible;
      if (visible) {
        button.style.left = (projected.x * .5 + .5) * 100 + '%';
        button.style.top = (.5 - projected.y * .5) * 100 + '%';
      }
    }
  });

  return {
    reset: () => {
      camera.position.copy(homePosition());
      controls.target.set(0, 0, 0);
      controls.update();
    },
    top: () => {
      camera.position.set(0, Math.max(bounds.x, bounds.y) * 1.5, 0.01);
      controls.target.set(0, 0, 0);
      controls.update();
    }
  };
}
