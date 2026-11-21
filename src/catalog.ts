export const asset = (name: string) => new URL(import.meta.env.BASE_URL + name, location.origin).href;

export type EnvironmentKey = 'living' | 'bedroom' | 'kitchen' | 'outdoor';
export type EnvironmentVisual = {image:string;caption:string};

const visual = (image:string,caption:string):EnvironmentVisual => ({image,caption});

export const layouts = {
  40: {
    kind:'Studio', image:'hub/planta-40.jpg',
    outdoorLabel:'Sacada',
    rooms:{
      living:visual('hub/ambientes/living-40.jpg','Perspectiva ilustrativa do Studio de 40 m² · Book HUB Barueri, página 36.'),
      bedroom:visual('hub/ambientes/bedroom-40.jpg','Recorte do dormitório na perspectiva ilustrativa do Studio de 40 m² · Book HUB Barueri, página 36.'),
      kitchen:visual('hub/ambientes/kitchen-40.jpg','Recorte da cozinha na perspectiva ilustrativa do Studio de 40 m² · Book HUB Barueri, página 36.'),
      outdoor:visual('hub/ambientes/balcony-76.jpg','Referência de sacada do decorado de 76 m² · a unidade de 40 m² pode ter configuração diferente.'),
    },
  },
  45: {
    kind:'Studio', image:'hub/planta-45.jpg',
    outdoorLabel:'Sacada',
    rooms:{
      living:visual('hub/ambientes/living-40.jpg','Referência de ambientação de Studio em 40 m² · a planta de 45 m² tem configuração distinta.'),
      bedroom:visual('hub/ambientes/bedroom-40.jpg','Referência de dormitório no Studio de 40 m² · não representa exatamente a planta de 45 m².'),
      kitchen:visual('hub/ambientes/kitchen-40.jpg','Referência de cozinha no Studio de 40 m² · não representa exatamente a planta de 45 m².'),
      outdoor:visual('hub/ambientes/balcony-76.jpg','Referência de sacada do decorado de 76 m² · a unidade de 45 m² pode ter configuração diferente.'),
    },
  },
  56: {
    kind:'1 suíte + 1 dormitório', image:'hub/planta-56.jpg',
    outdoorLabel:'Sacada',
    rooms:{
      living:visual('hub/ambientes/living-56.jpg','Perspectiva ilustrativa do apartamento de 56 m².'),
      bedroom:visual('hub/ambientes/bedroom-40.jpg','Referência de dormitório · o material disponível não inclui perspectiva específica do quarto de 56 m².'),
      kitchen:visual('hub/ambientes/kitchen-56.jpg','Recorte da cozinha na perspectiva ilustrativa do apartamento de 56 m².'),
      outdoor:visual('hub/ambientes/balcony-76.jpg','Referência de sacada do decorado de 76 m² · a unidade de 56 m² pode ter configuração diferente.'),
    },
  },
  63: {
    kind:'Studio Garden', image:'hub/planta-63.jpg',
    outdoorLabel:'Garden',
    rooms:{
      living:visual('hub/ambientes/living-40.jpg','Referência de ambientação de Studio em 40 m² · o Garden de 63 m² tem configuração distinta.'),
      bedroom:visual('hub/ambientes/bedroom-40.jpg','Referência de dormitório no Studio de 40 m² · não representa exatamente a planta Garden de 63 m².'),
      kitchen:visual('hub/ambientes/kitchen-40.jpg','Referência de cozinha no Studio de 40 m² · não representa exatamente a planta Garden de 63 m².'),
      outdoor:visual('hub/ambientes/garden-63.jpg','Recorte da planta oficial ilustrada do Garden de 63 m²; não há perspectiva ambiental específica no material.'),
    },
  },
  76: {
    kind:'1 suíte + 2 dormitórios + lavabo', image:'planta-76.png', model:true,
    outdoorLabel:'Sacada',
    rooms:{
      living:visual('hub/ambientes/living-76.jpg','Perspectiva ilustrativa do living decorado · Book HUB Barueri, página 38.'),
      bedroom:visual('hub/ambientes/bedroom-40.jpg','Referência de dormitório · o material disponível não inclui perspectiva específica dos quartos de 76 m².'),
      kitchen:visual('hub/ambientes/kitchen-76.jpg','Recorte da cozinha na perspectiva ilustrativa do living de 76 m² · Book HUB Barueri, página 38.'),
      outdoor:visual('hub/ambientes/balcony-76.jpg','Recorte da sacada na perspectiva ilustrativa do living de 76 m² · Book HUB Barueri, página 38.'),
    },
  },
  112: {
    kind:'1 suíte + 2 dormitórios + lavabo', image:'hub/planta-112.jpg',
    outdoorLabel:'Garden',
    rooms:{
      living:visual('hub/ambientes/living-76.jpg','Referência do living decorado de 76 m² · a planta Garden de 112 m² tem distribuição distinta.'),
      bedroom:visual('hub/ambientes/bedroom-40.jpg','Referência de dormitório · o material disponível não inclui perspectiva específica dos quartos do Garden de 112 m².'),
      kitchen:visual('hub/ambientes/kitchen-76.jpg','Referência de cozinha do decorado de 76 m² · o Garden de 112 m² tem distribuição distinta.'),
      outdoor:visual('hub/ambientes/garden-112.jpg','Recorte da planta oficial ilustrada do Garden de 112 m²; não há perspectiva ambiental específica no material.'),
    },
  },
} as const;

const finals = {
  tipo: {40:['01A','04A','05A','01B','02B','05B','06B'],45:['07A'],56:['02A','03B','04B'],76:['03A','06A']},
  garden: {63:['04A','05A'],112:['03A','06A']},
};

type Area = keyof typeof layouts;
export type Unit = typeof layouts[Area] & {final:string; area:Area};
const units = (kind: keyof typeof finals): Unit[] => Object.entries(finals[kind])
  .flatMap(([area, codes]) => codes.map(final => ({final,area:Number(area) as Area,...layouts[Number(area) as Area]})))
  .sort((a,b)=>a.final.at(-1)!.localeCompare(b.final.at(-1)!) || a.final.localeCompare(b.final));

const typical = units('tipo');
export const reference = {width:5184,height:6480};
const px = (x:number,y:number) => [Math.round(x*reference.width/1037),y*5];
// Slab edges digitized from the official vertical_002 perspective, top to bottom.
// Each edge follows the returns at the ends of the balcony stacks.
const slabs = [
  [208,90],[240,123],[273,160],[306,197],[338,233],[371,270],[403,306],
  [436,343],[468,380],[501,416],[534,453],[566,489],[599,526],
  [631,563],[664,600],[696,637],[729,673],[761,710],[794,747],
  [826,783],[859,820],[891,857],[924,894],[956,930],[988,967],[1021,1004],
];
function edge([left,right]: number[]) {
  const y = (x:number) => left + (right-left)*(x-382)/301;
  const step = 3 + (1021-left)*.011;
  return [px(367,y(367)),px(382,left),px(453,y(453)),px(465,y(465)+step),
    px(592,y(592)+step),px(598,y(598)),px(683,right),px(714,y(714))];
}
export const floors = slabs.slice(1).map((bottom,i) => ({
  id:String(25-i), label: (25-i)+'º pavimento tipo', units:typical,
  polygon:[...edge(slabs[i]),...edge(bottom).reverse()],
})).concat({
  id:'garden',label:'Garden',units:units('garden'),
  polygon:[...edge(slabs.at(-1)!),px(728,1027),px(746,1027),px(746,1048),px(327,1053),px(327,1034),px(366,1030)],
});
export type Floor = typeof floors[number];
export const living = 'hub/ambientes/living-76.jpg';
export const modelLayout = layouts[76];

export function apartmentURL(floor:Floor,unit:Unit) {
  const path = '/maquete/' + unit.area;
  return path+'?'+new URLSearchParams({andar:floor.id,final:unit.final});
}
export function towerURL(floor?:Floor,explore=false) {
  return floor ? '/?'+new URLSearchParams({andar:floor.id,...(explore?{explorar:'1'}:{})}) : '/';
}
export function contact(floor?:Floor,unit?:Unit) {
  const context = floor && unit ? 'a planta de '+unit.area+' m², final '+unit.final+', no '+floor.label
    : 'a planta de 76 m²';
  return 'https://wa.me/5511996486103?text='+encodeURIComponent('Oi, Fábio! Vi o HUB Barueri e queria saber mais sobre '+context+'.');
}
