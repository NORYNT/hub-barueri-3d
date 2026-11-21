import {apartmentURL,asset,contact,floors,living,layouts,modelLayout,reference,towerURL,type EnvironmentKey,type EnvironmentVisual,type Floor,type Unit} from './catalog';
import './site.css';

const app = document.querySelector<HTMLDivElement>('#app')!;
const params = new URLSearchParams(location.search);
const initialFloor = floors.find(floor => floor.id===params.get('andar'));
const unit = initialFloor?.units.find(item => item.final===params.get('final'));
const logo = () => '<a class="brand" href="/" aria-label="HUB Barueri, início"><img src="'+asset('hub/marca.png')+'" width="555" height="228" alt="HUB Barueri"></a>';
const broker = '<div class="broker"><strong>Fábio Luz</strong><span>CRECI 249452</span></div>';
const disclosure = 'Futuro lançamento. Perspectivas meramente ilustrativas.';
const legal = '<small class="legal">'+disclosure+'</small>';
const launchNote = '<p class="launch-note">Empreendimento sujeito a aprovações. Comercialização após o registro do Memorial de Incorporação.</p>';

function tower() {
  let selected = initialFloor;
  let preview: Floor|undefined;
  let exploring = Boolean(selected && params.get('explorar')==='1');
  const polygons = floors.map(floor => '<polygon tabindex="0" role="button" aria-label="'+floor.label+'" data-floor="'+floor.id+'" points="'+floor.polygon.map(p=>p.join(',')).join(' ')+'"><title>'+floor.label+'</title></polygon>').join('');
  app.innerHTML = `
    <main class="tower">
      <div class="tower-view">
        <figure class="facade" aria-label="Fachada oficial do HUB Barueri">
          <div class="photo">
            <img class="building" src="${asset('hub/torre.jpg')}" width="1552" height="1940" fetchpriority="high" alt="Perspectiva noturna da torre e do embasamento do HUB Barueri">
            <svg class="slabs" viewBox="0 0 ${reference.width} ${reference.height}" aria-hidden="true">${polygons}</svg>
            <div class="floor-label" aria-hidden="true" hidden></div>
          </div>
        </figure>
        <span class="perspective">Perspectiva ilustrativa da fachada</span>
      </div>
      <div class="tower-brand">${logo()}<span>Futuro lançamento</span></div>
      <section class="tower-panel" aria-labelledby="tower-heading">
        <div id="pick">
          <p class="eyebrow">Fachada interativa</p>
          <h1 id="tower-heading">Escolha<br> um andar<span>.</span></h1>
          <p class="instruction">Selecione um pavimento na torre ou use o seletor.</p>
          <label class="select-label" for="floor">Pavimento</label>
          <div class="select-wrap"><select id="floor"><option value="">Selecione um pavimento</option>${[...floors].reverse().map(f=>'<option value="'+f.id+'">'+f.label+'</option>').join('')}</select></div>
          <button id="explore" class="primary" type="button" disabled>Explorar andar</button>
        </div>
        <div id="choices" hidden>
          <button id="tower-back" class="quiet" type="button">Voltar à torre</button>
          <p class="eyebrow">Apartamentos</p>
          <h2 id="floor-heading" tabindex="-1"></h2>
          <p class="instruction">Escolha um final para ver a planta.</p>
          <div id="units" class="units"></div>
        </div>
        <div class="panel-foot">${broker}${legal}${launchNote}</div>
      </section>
    </main>`;
  const find = <E extends HTMLElement>(selector:string) => app.querySelector<E>(selector)!;
  const select = find<HTMLSelectElement>('#floor');
  const explore = find<HTMLButtonElement>('#explore');
  const photo = find('.photo');
  const label = find('.floor-label');
  const heading = find('#floor-heading');
  const pick = find('#pick');
  const choices = find('#choices');
  const svg = app.querySelector<SVGSVGElement>('.slabs')!;
  const url = () => history.replaceState(null,'',towerURL(selected,exploring));

  function paint() {
    const target = preview || selected;
    for(const polygon of svg.querySelectorAll('polygon')) polygon.classList.toggle('highlight',polygon.dataset.floor===target?.id);
    label.hidden = !target || exploring;
    if(target) {
      const right = target.polygon.slice().sort((a,b)=>b[0]-a[0]).slice(0,2);
      const y = (right[0][1]+right[1][1])/2;
      label.style.left = Math.max(...right.map(p=>p[0]))/reference.width*100+'%';
      label.style.top = y/reference.height*100+'%';
      label.textContent = target.label;
      if(exploring) photo.style.setProperty('--pivot', '53% '+y/reference.height*100+'%');
    }
  }
  function render() {
    select.value = selected?.id ?? '';
    explore.disabled = !selected;
    pick.hidden = exploring;
    choices.hidden = !exploring;
    photo.classList.toggle('zoomed',exploring);
    if(exploring && selected) {
      const floor = selected;
      heading.textContent = floor.label;
      find('#units').innerHTML = floor.units.map(item => '<a href="'+apartmentURL(floor,item)+'"><strong>'+item.final+'</strong><span>'+item.area+' m²</span></a>').join('');
    }
    paint();
  }
  select.onchange = () => {selected=floors.find(f=>f.id===select.value);preview=undefined;url();render();};
  svg.addEventListener('pointerover',event=>{
    if(event.pointerType!=='mouse' || exploring) return;
    preview=floors.find(f=>f.id===(event.target as SVGElement).dataset.floor);
    paint();
  });
  svg.addEventListener('pointerout',()=>{preview=undefined;paint();});
  svg.addEventListener('click',event=>{
    if(exploring) return;
    const floor=floors.find(f=>f.id===(event.target as SVGElement).dataset.floor);
    if(!floor) return;
    selected=floor;preview=undefined;url();render();
  });
  svg.addEventListener('keydown',event=>{
    if(exploring || (event.key!=='Enter' && event.key!==' ')) return;
    const floor=floors.find(f=>f.id===(event.target as SVGElement).dataset.floor);
    if(!floor) return;
    event.preventDefault();
    selected=floor;preview=undefined;url();render();select.focus();
  });
  explore.onclick = () => {
    if(!selected) return;
    exploring=true;preview=undefined;url();render();heading.focus();
  };
  find<HTMLButtonElement>('#tower-back').onclick = () => {
    exploring=false;url();render();select.focus();
  };
  render();
}

function apartmentBar(floor?:Floor,item?:Unit) {
  return `<div class="apartment-bar">
    ${floor ? '<a href="'+towerURL(floor,true)+'">Voltar ao andar</a>' : ''}
    <a href="${towerURL(floor)}">Voltar à torre</a>
    <a class="primary" href="${contact(floor,item)}" target="_blank" rel="noopener noreferrer">Quero saber mais</a>
  </div>`;
}

function plan(floor?:Floor,item?:Unit,fallback=false) {
  const layout = item ?? {...modelLayout,area:76};
  document.title = layout.area + ' m² | HUB Barueri';
  const title = floor && item ? floor.label+' · Final '+item.final : 'Apartamento';
  app.innerHTML = `<main class="plan-page">
    <div class="plan-head">${logo()}${broker}</div>
    <section class="plan-card" aria-labelledby="plan-heading">
      <div class="plan-title">
        <div><p class="eyebrow">${title}</p><h1 id="plan-heading">${layout.area} m²</h1><p>${layout.kind}</p></div>
        ${apartmentBar(floor,item)}
      </div>
      ${fallback ? '<p class="fallback" role="status">Maquete 3D indisponível neste navegador. Explore a planta e a perspectiva oficial.</p>' : ''}
      <div class="plan-tools">
        <button type="button" id="smaller" aria-label="Reduzir planta">−</button>
        <button type="button" id="larger" aria-label="Ampliar planta">+</button>
        <button type="button" id="fit">Ajustar</button>
        ${fallback ? '<button type="button" id="living">Ver living</button>' : ''}
      </div>
      <div class="plan-frame" tabindex="0" aria-label="Planta ampliável. Use a rolagem para percorrer a imagem."><img src="${asset(layout.image)}" alt="Planta oficial de ${layout.area} m²"></div>
    </section>
    ${legal}
  </main>
  ${fallback ? '<dialog class="living-fallback" aria-label="Living do decorado"><div><h2>Living do decorado</h2><button type="button">Voltar à planta</button></div><img alt="Perspectiva oficial do living de 76 m²"></dialog>' : ''}`;
  let zoom=1;
  const image=app.querySelector<HTMLImageElement>('.plan-frame img')!;
  const smaller=app.querySelector<HTMLButtonElement>('#smaller')!;
  const larger=app.querySelector<HTMLButtonElement>('#larger')!;
  function setZoom(next:number) {
    zoom=Math.max(1,Math.min(3,next));
    image.style.width=zoom*100+'%';
    image.classList.toggle('enlarged',zoom>1);
    smaller.disabled=zoom===1;
    larger.disabled=zoom===3;
  }
  smaller.onclick=()=>setZoom(zoom-.5);
  larger.onclick=()=>setZoom(zoom+.5);
  app.querySelector<HTMLButtonElement>('#fit')!.onclick=()=>setZoom(1);
  setZoom(1);
  if(fallback) {
    const modal=app.querySelector<HTMLDialogElement>('.living-fallback')!;
    app.querySelector<HTMLButtonElement>('#living')!.onclick=()=>{
      modal.querySelector('img')!.src=asset(living);
      modal.showModal();
    };
    modal.querySelector('button')!.onclick=()=>modal.close();
  }
}

async function model(floor?:Floor,item?:Unit) {
  document.title = 'Maquete 76 m² | HUB Barueri';
  const canRender = document.createElement('canvas').getContext('webgl2');
  if(!canRender) {plan(floor,item,true);return;}
  canRender.getExtension('WEBGL_lose_context')?.loseContext();
  const {default:markup} = await import('./model.html?raw');
  await import('./style.css');
  document.body.classList.add('model-page');
  app.innerHTML = markup;
  app.querySelector('main')!.insertAdjacentHTML('beforeend',apartmentBar(floor,item)+
    '<div class="model-broker">'+broker+legal+'</div>');
  if(floor && item) app.querySelector('header p')!.textContent=floor.label+' · Final '+item.final+' · 3 dormitórios';
  try {
    await import('./main');
  } catch (error) {
    console.error(error);
    document.body.classList.remove('model-page');
    plan(floor,item,true);
  }
}
async function genericModel(floor:Floor|undefined,item:Unit|undefined,layout:{area:number;kind:string;image:string;rooms:Record<EnvironmentKey,EnvironmentVisual>;outdoorLabel:string}) {
  document.title = 'Maquete '+layout.area+' m² | HUB Barueri';
  const title = floor && item ? floor.label+' · Final '+item.final : 'Apartamento';
  const environmentKeys:EnvironmentKey[] = ['living','bedroom','kitchen','outdoor'];
  const environmentLabels:Record<EnvironmentKey,string> = {
    living:'Living',bedroom:'Quarto',kitchen:'Cozinha',outdoor:layout.outdoorLabel,
  };
  const environmentButtons = environmentKeys.map(key =>
    '<button class="generic-environment-hotspot" data-environment="'+key+'" type="button" aria-label="Abrir perspectiva de '+environmentLabels[key]+'" hidden>● '+environmentLabels[key]+'</button>'
  ).join('');
  app.innerHTML = `<main class="generic-model-page">
    <div class="generic-model-head">${logo()}${broker}</div>
    <header><p class="eyebrow">${title}</p><h1>Maquete ${layout.area} m²</h1><p>${layout.kind}</p></header>
    <div id="generic-scene" aria-label="Visualização isométrica 3D da planta"></div>
    <div class="generic-hotspots" aria-label="Ambientes interativos">${environmentButtons}</div>
    <nav class="generic-model-nav" aria-label="Controles da maquete">
      <button id="generic-reset" type="button">Vista inicial</button>
      <button id="generic-top" type="button">Vista superior</button>
      <button id="generic-plan" type="button">Planta oficial</button>
    </nav>
    ${apartmentBar(floor,item)}
  </main>
  <dialog id="generic-plan-dialog" aria-label="Planta oficial"><div class="toolbar"><h2>Planta oficial · ${layout.area} m²</h2><button id="generic-plan-back" type="button">Voltar à maquete</button></div><img src="${asset(layout.image)}" alt="Planta oficial ampliável de ${layout.area} m²"></dialog>
  <dialog id="generic-environment-dialog" aria-label="Perspectiva ilustrativa do ambiente"><div class="toolbar"><h2 id="generic-environment-title"></h2><button id="generic-environment-back" type="button">Voltar à maquete</button></div><p id="generic-environment-caption" class="photo-caption"></p><img id="generic-environment-image" alt=""></dialog>`;

  await import('./generic-model.css');
  const canRender = document.createElement('canvas').getContext('webgl2');
  const host = app.querySelector<HTMLDivElement>('#generic-scene')!;
  const hotspotContainer = app.querySelector<HTMLDivElement>('.generic-hotspots')!;
  const markers:Record<EnvironmentKey,HTMLButtonElement> = {
    living:app.querySelector<HTMLButtonElement>('[data-environment="living"]')!,
    bedroom:app.querySelector<HTMLButtonElement>('[data-environment="bedroom"]')!,
    kitchen:app.querySelector<HTMLButtonElement>('[data-environment="kitchen"]')!,
    outdoor:app.querySelector<HTMLButtonElement>('[data-environment="outdoor"]')!,
  };
  if(!canRender) {
    host.innerHTML = '<img class="generic-fallback" src="'+asset(layout.image)+'" alt="Planta oficial de '+layout.area+' m²">';
    hotspotContainer.classList.add('generic-hotspots--fallback');
    for (const button of Object.values(markers)) {
      button.classList.add('static-action');
      button.hidden = false;
    }
  } else {
    canRender.getExtension('WEBGL_lose_context')?.loseContext();
    const {createGenericModel} = await import('./generic-model');
    const controls = createGenericModel(host,{area:layout.area,kind:layout.kind,image:layout.image,markers});
    app.querySelector<HTMLButtonElement>('#generic-reset')!.onclick = () => controls && controls.reset();
    app.querySelector<HTMLButtonElement>('#generic-top')!.onclick = () => controls && controls.top();
    if(!controls) {
      host.innerHTML = '<img class="generic-fallback" src="'+asset(layout.image)+'" alt="Planta oficial de '+layout.area+' m²">';
      hotspotContainer.classList.add('generic-hotspots--fallback');
      for (const button of Object.values(markers)) {
        button.classList.add('static-action');
        button.hidden = false;
      }
    }
  }

  const dialog = app.querySelector<HTMLDialogElement>('#generic-plan-dialog')!;
  app.querySelector<HTMLButtonElement>('#generic-plan')!.onclick = () => dialog.showModal();
  app.querySelector<HTMLButtonElement>('#generic-plan-back')!.onclick = () => dialog.close();
  const environmentDialog = app.querySelector<HTMLDialogElement>('#generic-environment-dialog')!;
  const environmentImage = app.querySelector<HTMLImageElement>('#generic-environment-image')!;
  for (const key of environmentKeys) {
    markers[key].onclick = () => {
      const environment = layout.rooms[key];
      environmentDialog.querySelector('#generic-environment-title')!.textContent = environmentLabels[key]+' · '+layout.area+' m²';
      environmentDialog.querySelector('#generic-environment-caption')!.textContent = environment.caption;
      environmentImage.alt = 'Imagem ilustrativa: '+environmentLabels[key];
      environmentImage.src = asset(environment.image);
      environmentDialog.showModal();
    };
  }
  app.querySelector<HTMLButtonElement>('#generic-environment-back')!.onclick = () => environmentDialog.close();
}

const modelMatch = location.pathname.match(/^\/maquete\/(\d+)\/?$/);
if(modelMatch) {
  const area = Number(modelMatch[1]) as keyof typeof layouts;
  const layout = layouts[area];
  if(layout) {
    if(area===76) void model(unit ? initialFloor : undefined,unit);
    else void genericModel(initialFloor,unit,{...layout,area});
  } else tower();
} else if(location.pathname==='/apartamento' && initialFloor && unit) {
  if(unit.area===76) void model(initialFloor,unit);
  else void genericModel(initialFloor,unit,{...layouts[unit.area],area:unit.area});
} else tower();
