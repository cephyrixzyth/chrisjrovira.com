import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const $ = (id) => document.getElementById(id);
const world = $('world');
const canvas = $('scene');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const fallback=document.createElement('div');
fallback.className='webgl-error';fallback.hidden=true;fallback.setAttribute('role','status');
fallback.textContent='This browser could not start the 3D scene. The venue list remains available; try a browser with WebGL enabled.';
const venues = [
  {name:'The Continental',short:'CONTINENTAL',area:'SOUTH CONGRESS',era:'SOUTH CONGRESS · SINCE 1955',tag:'A little room. A bottomless night.',description:'An intimate South Congress landmark folded into a pocket-sized light machine. Roots, rockabilly and a ceiling that forgot about the sky.',kind:'continental',color:'#ff5f49',x:-24},
  {name:'Antone’s',short:'ANTONE’S',area:'DOWNTOWN',era:'DOWNTOWN BLUES · SINCE 1975',tag:'Every wall has a blue note.',description:'Clifford Antone’s blues room becomes a slow electric tide: deep indigo, hot amber, and a backbeat that leaves a trace in the air.',kind:'antones',color:'#41bbff',x:-12},
  {name:'Mohawk',short:'MOHAWK',area:'RED RIVER',era:'RED RIVER · INDOOR / OUTDOOR',tag:'Two stages. Four million stars.',description:'Red River goes vertical. Brick, balconies, an outside stage and a night sky running a little too much voltage.',kind:'mohawk',color:'#d5ff36',x:0},
  {name:'Stubb’s',short:'STUBB’S',area:'RED RIVER',era:'RED RIVER · THE OUTDOOR STAGE',tag:'Smoke signals from the future.',description:'An outdoor Austin classic turns into a backyard-sized aurora. Canopy lights, big sky, low frequencies, absolutely no curfew in this dimension.',kind:'stubbs',color:'#ffad44',x:12},
  {name:'ACL Live at the Moody Theater',short:'ACL LIVE',area:'DOWNTOWN',era:'DOWNTOWN · HOME OF AUSTIN CITY LIMITS',tag:'The whole room is the instrument.',description:'The Moody Theater becomes a precision light chamber, where audience, stage and broadcast rig glow as one machine.',kind:'acl',color:'#bc91ff',x:24}
];

const scene = new THREE.Scene();
scene.background = new THREE.Color('#171126');
scene.fog = new THREE.FogExp2('#171126', 0.008);
const camera = new THREE.PerspectiveCamera(60, 1, .1, 280);
let renderer;
try {
  renderer = new THREE.WebGLRenderer({canvas, antialias:true, powerPreference:'high-performance'});
} catch (error) {
  fallback.hidden=false;world.append(fallback);
  renderer={setPixelRatio(){},setSize(){},render(){},outputColorSpace:null,toneMapping:null,toneMappingExposure:1,shadowMap:{enabled:false,type:null}};
}
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

scene.add(new THREE.HemisphereLight(0xb6acff, 0x19111e, 1.55));
const moonLight = new THREE.DirectionalLight(0x93a8ff, 2.1);
moonLight.position.set(-18, 34, 8);
moonLight.castShadow = true;
moonLight.shadow.mapSize.set(1024, 1024);
scene.add(moonLight);
const cityFill = new THREE.PointLight(0x5a45ae, 65, 110);
cityFill.position.set(0, 18, -15);
scene.add(cityFill);

const city = new THREE.Group();
scene.add(city);
const facades = [];
const animatedLights = [];
const windows = [];
const traffic = [];
const crowd = [];
const stars = [];
let selected = 0;
let level = 'aerial';
let inside = false;
let returnLevel = 'ground';
let yaw = 0;
let pitch = 0;
let dragging = false;
let dragDistance = 0;
let lastPointer = {x:0,y:0};
let aerialDistance = 88;
const keys = new Set();
const touchMoves = new Set();
const clock = new THREE.Clock();
const walk = {x:-24,y:1.8,z:9};
const roomWalk = {x:0,y:1.8,z:5.2};
let roomYaw = 0;
let roomPitch = 0;

const material = (color, emissive=color, intensity=0, roughness=.82, metalness=.08) => new THREE.MeshStandardMaterial({color, emissive, emissiveIntensity:intensity, roughness, metalness});
const neon = (color, intensity=2.7) => material(color,color,intensity,.28,.12);
function block(parent, name, x,y,z, sx,sy,sz, mat, cast=true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat);
  mesh.name=name; mesh.position.set(x,y,z); mesh.castShadow=cast; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
function cylinder(name,pos,radiusTop,radiusBottom,height,mat,parent=city,segments=12){
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radiusTop,radiusBottom,height,segments),mat);
  mesh.name=name;mesh.position.set(...pos);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function lamp(parent,color,power,range,x,y,z) {
  const light=new THREE.PointLight(color,power,range,2);light.position.set(x,y,z);parent.add(light);
  animatedLights.push({light,phase:animatedLights.length*.37,base:power}); return light;
}
function plaqueMaterial(label,color,secondary){
  const c=document.createElement('canvas');c.width=1024;c.height=256;const g=c.getContext('2d');
  g.fillStyle='#1b1622';g.fillRect(0,0,1024,256);g.strokeStyle=color;g.lineWidth=14;g.strokeRect(10,10,1004,236);
  g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff0cf';g.shadowColor=color;g.shadowBlur=22;g.font='900 62px Arial Black,Arial';g.fillText(label,512,101);g.font='bold 30px Arial';g.fillText(secondary,512,186);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({map:texture,emissive:color,emissiveIntensity:.38,roughness:.45});
}

// The street is a real walkable strip, framed by Austin's layered city blocks.
block(city,'South Congress asphalt',0,-.28,8,84,.34,14,material('#211d2b'),false);
block(city,'north sidewalk',0,-.04,0,84,.18,2.1,material('#70545a'),false);
block(city,'south sidewalk',0,-.04,16,84,.18,2.1,material('#70545a'),false);
block(city,'road center stripe',0,-.085,8,84,.025,.12,material('#f6ce73','#f6ce73',1.2),false);
for(let x=-39;x<40;x+=6)block(city,'crosswalk dash',x,-.07,8,2.5,.03,.16,material('#e8c878'),false);
block(city,'riverfront plaza',0,-.23,28,84,.22,12,material('#28233b'),false);
for(let x=-40;x<41;x+=4)block(city,'plaza tile seam',x,-.1,28,.045,.02,12,material('#927c73'),false);

// Original Austin-like skyline: capitol dome, clock tower, and glass sail.
block(city,'Capitol base',-4,3,-34,12,6,8,material('#86616a'));
const dome=new THREE.Mesh(new THREE.SphereGeometry(3.2,24,14,0,Math.PI*2,0,Math.PI/2),material('#c09179'));dome.position.set(-4,8,-34);city.add(dome);
const domeDrum=new THREE.Mesh(new THREE.CylinderGeometry(3.1,3.3,1.6,20),material('#a77d74'));domeDrum.position.set(-4,7.3,-34);city.add(domeDrum);
block(city,'University clock tower',8,13,-44,3.3,26,3.3,material('#a87663'));
for(const z of [-45.7,-42.3])block(city,'clock face',8,17,z,1.05,1.1,.08,neon('#ffcf75',.8),false);
const sail=block(city,'downtown glass sail',37,17,-42,8,34,8,material('#2a394e','#5680ad',.55,.24,.55));sail.rotation.z=-.14;
for(let i=0;i<54;i++){
  const x=-40+(i*17.13%82),z=i%2?-23-(i*7.5%23):37+(i*9.31%20),w=3+(i*7%5),d=3+(i*11%6),h=7+(i*19%27);
  if(Math.abs(x+4)<9&&z<0)continue;
  block(city,`downtown block ${i}`,x,h/2,z,w,h,d,material(['#29283c','#342838','#3d2c3a','#253045','#40313c'][i%5]),true);
  const cols=Math.max(2,Math.floor(w/1.3)),rows=Math.max(2,Math.floor(h/2.5));
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if((i*7+r*13+c*3)%5<2){
    const wm=neon((i+c+r)%4===0?'#ffb866':(i+c)%3===0?'#52cfff':'#a083e9',.6);
    const win=block(city,'window light',x-w*.35+c*w*.7/cols,1.2+r*(h-2.3)/rows,z+d/2+.025,.23,.48,.035,wm,false);
    windows.push({mesh:win,phase:i*2+r+c,base:.35+((i+r+c)%5)*.12});
  }
}

function oak(x,z,s=2){
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(s*.15,s*.21,s*2.6,7),material('#49353b'));trunk.position.set(x,s*1.3,z);city.add(trunk);
 for(let i=0;i<7;i++){const crown=new THREE.Mesh(new THREE.DodecahedronGeometry(s*(.65+(i%3)*.13),1),material(i%2?'#263a31':'#334136'));crown.position.set(x+Math.cos(i*2.4)*s*.7,s*(2.3+(i%3)*.37),z+Math.sin(i*2.4)*s*.7);crown.castShadow=true;city.add(crown)}
}
for(let x=-39;x<40;x+=9){oak(x,18,2.25);oak(x,-1,1.8)}

function buildInterior(v,venueGroup){
 const room=new THREE.Group();room.name='Walkable venue interior';venueGroup.add(room);venueGroup.userData.room=room; const point=(color,power,range,pos)=>{const light=new THREE.PointLight(color,power,range,2);light.position.set(...pos);room.add(light);return light};
 const warm=['#ffb45f','#ffd16d','#e96b5d'];
 const sideWall=material(v.kind==='antones'?'#162635':v.kind==='mohawk'?'#42232e':v.kind==='acl'?'#282536':v.kind==='stubbs'?'#334035':'#33232a');sideWall.side=THREE.DoubleSide;
 const floor=material(v.kind==='stubbs'?'#4b3940':v.kind==='acl'?'#2f2c3b':'#312632');
 block(room,'room floor',0,-.13,-4.1,10.4,.25,18,floor);
 block(room,'room left wall',-5.22,3.5,-4.1,.35,7.2,18,sideWall);
 block(room,'room right wall',5.22,3.5,-4.1,.35,7.2,18,sideWall);
 block(room,'room rear wall',0,3.5,-13.1,10.4,7.2,.35,sideWall);
 // Exposed overhead girders and venue-specific color washes keep sightlines open.
 for(let z=3;z>-13;z-=3){block(room,'ceiling truss',0,6.65,z,10.2,.16,.16,material('#514150'));for(const x of [-4.6,4.6])block(room,'truss drop',x,5.9,z,.12,1.4,.12,material('#514150'))}
 const backPanel=block(room,'projection wall',0,4.2,-12.88,7.4,3.4,.12,neon(v.color,.32));backPanel.material.color.set(v.kind==='acl'?'#3e344e':v.color);
 const stageWidth=v.kind==='acl'?8.5:v.kind==='stubbs'?8:6.8;
 block(room,'stage deck',0,.48,-10.3,stageWidth,.75,2.7,material(v.kind==='stubbs'?'#55352e':'#413341'));
 block(room,'stage fascia',0,.35,-8.93,stageWidth,.45,.14,neon(v.color,.75));
 // PA stacks, mic stands, drums, and instrument silhouettes anchor the stage.
 for(const x of [-stageWidth*.42,stageWidth*.42]){
  block(room,'speaker stack',x,2,-9.8,.75,3.5,.85,material('#17151d'));
  for(let row=0;row<3;row++){const cone=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.045,14),neon(v.color,.3));cone.rotation.x=Math.PI/2;cone.position.set(x,1.15+row*.8,-9.33);room.add(cone)}
 }
 const mic=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,1.8,8),material('#d8c8ae'));mic.position.set(-1.15,1.6,-8.8);mic.rotation.z=-.12;room.add(mic);
 const drum=new THREE.Mesh(new THREE.CylinderGeometry(.52,.52,.38,16),material(v.kind==='antones'?'#276084':'#a44d54'));drum.rotation.x=Math.PI/2;drum.position.set(1.3,1.4,-9.2);room.add(drum);
 for(let i=0;i<5;i++){const beam=new THREE.Mesh(new THREE.ConeGeometry(1.2,8,12,1,true),new THREE.MeshBasicMaterial({color:i%2?v.color:warm[i%3],transparent:true,opacity:.07,side:THREE.DoubleSide,depthWrite:false}));beam.position.set(-4+i*2,4.8,-7);room.add(beam);animatedLights.push({mesh:beam,phase:i*.47,base:.07,opacity:true})}
 for(let i=0;i<6;i++){const lamp=block(room,'moving stage lamp',-4.4+i*1.76,6.35,-8.6,.25,.25,.25,neon(i%2?v.color:warm[i%3],1.2));animatedLights.push({mesh:lamp,phase:i*.7,base:1.2})}
 if(v.kind==='continental'){
  block(room,'Continental bar counter',-4.15,1.25,.1,1.4,1.2,7.5,material('#704238'));
  block(room,'bar foot rail',-3.25,.42,.1,.08,.08,7.2,material('#d2a45e'));
  for(let i=0;i<6;i++){const stool=cylinder('bar stool',[-2.95,.72,-2.8+i*1.12],.24,.24,.14,material('#d09857'),room,10);cylinder('stool leg',[-2.95,.38,-2.8+i*1.12],.045,.045,.62,material('#66515a'),room,8);stool.position.y=.72}
  for(let x=-2.6;x<3;x+=1.3)for(let z=-3;z<2;z+=1.2)if((Math.round(x*10)+Math.round(z*10))%2===0)block(room,'dance floor tile',x,-.005,z,.62,.025,.58,material('#4c3440'));
  for(let i=0;i<5;i++){const bulb=point(warm[i%3],7,5,[-3+i*1.5,5.7,-1]);animatedLights.push({light:bulb,phase:i*.6,base:7})}
 }else if(v.kind==='antones'){
  block(room,'blues club piano body',-1.5,1,-8.15,2.4,1.45,1.35,material('#13131b',v.color,.12,.27,.35));
  block(room,'piano lid',-1.5,1.86,-8.15,2.6,.12,1.5,material('#22202a'));
  for(let i=0;i<14;i++)block(room,'piano keys',-2.52+i*.155,1.77,-7.42,.13,.045,.38,material(i%2?'#18171c':'#eee2cf'),false);
  for(const x of [3.25,4.1])for(let y=1;y<4;y+=1.35)block(room,'amp stack',x,y,-8.7,.72,1.2,.68,material('#1b1c25','#267bb4',.22));
  block(room,'blues mural panel',3.15,4.5,-12.68,2.1,2.4,.08,neon('#2e80bc',.38));
 }else if(v.kind==='mohawk'){
  for(const y of [3.8,5.8])for(const x of [-3.7,3.7]){
   block(room,'upper Mohawk balcony',x,y,-4.5,2.7,.25,11,material('#3b2d38'));
   block(room,'upper balcony rail',x,y+.48,1.05,2.7,.09,.09,material('#cf9865'));
   for(let k=0;k<7;k++)block(room,'balcony post',x-1.25+k*.42,y+.24,1.05,.035,.4,.035,material('#cf9865'),false);
  }
  block(room,'second stage',0,3.05,-10.2,5.6,.4,2.2,material('#35313d'));
  for(let i=0;i<4;i++)block(room,'brick room divider',-4.5+i*3,3.5,-2.2,.18,7,.18,material('#8b4942'));
 }else if(v.kind==='stubbs'){
  // The outdoor stage continues into a yard with picnic tables, trees, and open sky.
  for(let i=0;i<4;i++){
   const z=-1-i*2.2;
   block(room,'picnic tabletop',-1.8,1.05,z,3.2,.15,.82,material('#a77a54'));
   for(const x of [-2.9,-.7])block(room,'picnic bench',x,.58,z, .32,.14,1.4,material('#846147'));
   for(const x of [-3.1,-.5])for(const zz of [z-.3,z+.3])block(room,'table leg',x,.32,zz,.1,.62,.1,material('#573f3b'));
  }
  for(let i=0;i<6;i++){const bulb=point(i%2?'#ff744f':'#ffd16d',9,6,[-4+i*1.6,5.9,-1-i%3*2]);animatedLights.push({light:bulb,phase:i*.53,base:9})}
  for(const x of [-4.7,4.7])for(let i=0;i<4;i++){const tree=new THREE.Mesh(new THREE.DodecahedronGeometry(1.2,1),material('#31513e'));tree.position.set(x,4,-2-i*3.1);room.add(tree)}
 }else if(v.kind==='acl'){
  const screen=block(room,'ACL live performance screen',0,4.4,-12.63,6.5,3.2,.12,neon('#c394ff',.7));
  for(let row=0;row<5;row++)for(let side of [-1,1])for(let i=0;i<3;i++){
   const z=2-row*1.65,x=side*(2.2+i*.78);
   block(room,'theater seat',x,.75-row*.04,z,.58,.36,.72,material(row%2?'#654355':'#38324a'));
   block(room,'seat back',x,1.12-row*.04,z+.28,.58,.72,.14,material('#564055'));
  }
  for(let i=0;i<5;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(1.2+i*.62,.035,6,36,Math.PI),neon(i%2?'#c394ff':'#54d7ff',.8));ring.position.set(0,2.4,-8.4);room.add(ring);animatedLights.push({mesh:ring,phase:i*.65,base:.8})}
 }
 // A modest animated crowd gives the room human scale without blocking the floor route.
 const count=v.kind==='acl'?16:v.kind==='stubbs'?13:18;
 for(let i=0;i<count;i++){
  const patron=new THREE.Group();const coat=['#ed655c','#d3a34b','#438aaa','#5c895e','#a566a8'][i%5];
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.16,.48,3,6),material(coat));torso.position.y=.67;patron.add(torso);
  const face=new THREE.Mesh(new THREE.SphereGeometry(.15,8,7),material(['#bb896b','#d2a27f','#96684f'][i%3]));face.position.y=1.08;patron.add(face);
  const angle=i*2.399;const radius=1.2+(i%5)*.58;patron.position.set(Math.cos(angle)*radius,0,-3.7-Math.floor(i/5)*.6);patron.userData.phase=i*.8;room.add(patron);crowd.push(patron);
 }
}

// Five venue silhouettes, handmade from simple architectural forms and light.
function buildVenue(v,index){
 const group=new THREE.Group();group.position.set(v.x,0,index%2?-.35:0);group.userData.venueIndex=index;city.add(group);facades.push(group);
 const wall=material(v.kind==='continental'?'#bd826c':v.kind==='antones'?'#79434b':v.kind==='mohawk'?'#88433e':v.kind==='stubbs'?'#aa8c66':'#37374b');
 const trim=material('#211c28');
 if(v.kind==='acl'){
  group.userData.shell=block(group,'Moody theater mass',0,5.8,0,11,11.6,7,wall);
  block(group,'theater roof',0,11.8,0,12,.55,7.8,material('#474353'));
  for(let i=0;i<7;i++){const fin=block(group,'ACL light fin',-5+i*1.65,5.7,3.65,.4,8.8,.14,neon(v.color,1.1));animatedLights.push({mesh:fin,phase:i*.7,base:1.1})}
  block(group,'bronze lobby entrance',0,2.3,3.62,7,4.4,.2,material('#926b50'));
  for(let i=0;i<5;i++)block(group,'lobby glass',-2.65+i*1.32,2.3,3.74,.8,3.3,.06,material('#ffcb91','#ff9e5c',.42,.25,.2));
 }else if(v.kind==='stubbs'){
  group.userData.shell=block(group,'Stubb\'s building',0,3.2,0,10,6.4,5.5,wall);
  block(group,'outdoor stage wing',-7,3,-1,3.2,6,5,material('#59464b'));
  block(group,'live outdoor stage',2.8,2.1,-4,5.7,4.2,.5,material('#28212d'));
  const canopy=block(group,'backyard canopy',0,6.5,2.8,12,.28,3.5,material('#4b333d'));canopy.rotation.z=-.025;
  for(let i=0;i<13;i++){const x=-5.5+i*.92;const b=block(group,'string bulb',x,6.8,4,.12,.15,.12,neon(i%2?'#ff704f':'#ffd36c'));animatedLights.push({mesh:b,phase:i*.33,base:2})}
  for(let x=-5;x<7;x+=1.4)block(group,'venue fence',x,1,4.2,.14,2,.14,trim);
  for(let i=0;i<5;i++){const cone=new THREE.Mesh(new THREE.ConeGeometry(1.1,7.8,8,1,true),new THREE.MeshBasicMaterial({color:v.color,transparent:true,opacity:.07,side:THREE.DoubleSide,depthWrite:false}));cone.position.set(-4+i*2,4,-4);cone.rotation.x=Math.PI;group.add(cone);animatedLights.push({mesh:cone,phase:i*.63,base:.07,opacity:true})}
 }else{
  const h=v.kind==='mohawk'?10:7.2,w=v.kind==='mohawk'?10.5:9.5;
  group.userData.shell=block(group,v.kind==='mohawk'?'Mohawk red brick tiers':v.kind==='antones'?'Antone’s brick blues club':'Continental Club low frontage',0,h/2,0,w,h,6,wall);
  // Hand-laid mortar gives the facades a specific brick rhythm.
  if(v.kind==='mohawk'||v.kind==='antones')for(let row=1;row<h;row++){
    block(group,'mortar line',0,row,3.04,w,.045,.035,material('#351f2b'),false);
    for(let col=-4;col<5;col++)block(group,'brick joint',col*1.05+(row%2)*.5,row-.5,3.07,.035,.85,.035,material('#351f2b'),false);
  }
  const count=v.kind==='continental'?4:5;
  for(let i=0;i<count;i++){
    const x=-w*.38+i*(w*.76/(count-1));
    block(group,'window frame',x,h*.73,3.08,1.14,1.2,.18,trim);
    block(group,'lit window',x,h*.73,3.19,.87,.92,.06,material(v.kind==='antones'?'#4384b0':'#775c76','#ffc375',.45,.28,.12));
    block(group,'window sill',x,h*.73-.64,3.25,1.25,.13,.22,trim);
  }
  const doors=v.kind==='mohawk'?3:2;
  for(let i=0;i<doors;i++)block(group,'doorway',-2.1+i*(4.2/(doors-1||1)),1.55,3.14,1.7,3.1,.22,material('#1c1926','#ff9c67',.38,.35));
  if(v.kind==='mohawk'){
    for(let level=0;level<2;level++){
      const y=3.2+level*3.2;block(group,'Mohawk balcony',0,y,4.15,11.2,.25,2.2,trim);
      block(group,'balcony rail',0,y+.58,5.18,11.2,.1,.1,material('#bd895d'));
      for(let x=-5;x<=5;x+=.8)block(group,'balcony baluster',x,y+.32,5.18,.045,.56,.045,material('#bd895d'),false);
    }
  }
  if(v.kind==='continental'){
    const sign=block(group,'Continental vertical blade sign',-5.1,6.6,1.9,1,5.4,.45,material('#281923',v.color,.5));
    for(let i=0;i<9;i++){const letter=block(group,'neon sign strokes',-5.1,8.7-i*.51,2.16,.52,.11,.08,neon(i%2?'#ffd274':v.color));animatedLights.push({mesh:letter,phase:i*.3,base:1.4})}
  }
 }
 const title=v.kind==='continental'?'THE CONTINENTAL CLUB':v.kind==='antones'?"ANTONE’S NIGHTCLUB":v.kind==='mohawk'?'MOHAWK / RED RIVER':v.kind==='stubbs'?"STUBB’S BAR-B-Q":'ACL LIVE AT THE MOODY';
 const sign=block(group,'venue sign',0,v.kind==='acl'?10:v.kind==='mohawk'?8:v.kind==='stubbs'?7:6.3,3.35,v.kind==='continental'?6:7.6,1.35,.25,material('#1b1722',v.color,.35));
 const face=new THREE.Mesh(new THREE.PlaneGeometry(v.kind==='continental'?5.6:7.2,1.15),plaqueMaterial(title,v.color,v.area));face.position.set(0,sign.position.y,3.51);group.add(face);
 lamp(group,v.color,48,24,0,sign.position.y,4.4);lamp(group,v.color,70,30,0,4.6,6.8);
 // Original gig-poster energy: abstract animated geometric marks on the outer wall.
 for(let i=0;i<9;i++){const mark=new THREE.Mesh(new THREE.TorusGeometry(.23+(i%3)*.08,.035,5,16),neon(i%2?v.color:'#ffd16c',.72));mark.position.set(-3.3+(i%5)*.61,2.8+Math.floor(i/5)*.6,3.18);group.add(mark);animatedLights.push({mesh:mark,phase:i*.6,base:.72})}
 const mural=new THREE.Mesh(new THREE.PlaneGeometry(2.7,1.8),new THREE.MeshStandardMaterial({color:v.color,emissive:v.color,emissiveIntensity:.32,roughness:.8,side:THREE.DoubleSide}));mural.position.set(-2.1,3.8,3.18);group.add(mural);
 buildInterior(v,group);
 return group;
}
venues.forEach(buildVenue);

// Hill-country edge, live oak silhouettes, river plane, and impossible neon water.
const ridgeMat=material('#25243c');
for(let i=0;i<12;i++){const hill=new THREE.Mesh(new THREE.SphereGeometry(9+(i*7%8),10,7),ridgeMat);hill.scale.set(2.4,.34,.32);hill.position.set(-55+i*10,-1,-62-(i%3)*5);city.add(hill)}
const river=new THREE.Mesh(new THREE.PlaneGeometry(100,29,32,10),new THREE.MeshStandardMaterial({color:'#193d4b',emissive:'#122c42',emissiveIntensity:.48,roughness:.27,metalness:.32}));river.rotation.x=-Math.PI/2;river.position.set(0,-.15,47);city.add(river);
const ripples=[];
for(let i=0;i<14;i++){const line=block(city,'river ripple',-45+i*7,-.05,41+(i%4)*3,5,.02,.055,neon(i%2?'#46bde2':'#a168ff',.7),false);ripples.push({mesh:line,phase:i*.4})}
for(let i=0;i<390;i++){const star=new THREE.Mesh(new THREE.IcosahedronGeometry(.045+(i%5)*.015,0),new THREE.MeshBasicMaterial({color:i%6?'#fff0c7':'#bc9dff'}));star.position.set(-57+(i*19.71%114),12+(i*7.61%47),-76-(i*11.3%22));scene.add(star);stars.push({mesh:star,phase:i*.31,y:star.position.y})}
const moon=new THREE.Mesh(new THREE.SphereGeometry(4.4,22,14),new THREE.MeshBasicMaterial({color:'#ffda8c'}));moon.position.set(39,39,-79);scene.add(moon);
const moonHalo=new THREE.Mesh(new THREE.SphereGeometry(6.2,18,12),new THREE.MeshBasicMaterial({color:'#f18c84',transparent:true,opacity:.13,side:THREE.BackSide}));moonHalo.position.copy(moon.position);scene.add(moonHalo);

// Streamlined low-poly sedans with curved profiles read as cars from both cameras.
function createCar(index){
 const car=new THREE.Group();
 const paint=['#d8ff32','#e85e52','#4cc9e7','#e7ad58','#8d74c8'][index%5];
 const profile=new THREE.Shape();
 profile.moveTo(-1.45,.32);profile.lineTo(-1.36,.55);profile.quadraticCurveTo(-1.25,.71,-.9,.75);
 profile.lineTo(-.63,1.15);profile.quadraticCurveTo(-.42,1.4,-.1,1.42);profile.lineTo(.48,1.37);
 profile.quadraticCurveTo(.78,1.31,.95,.98);profile.lineTo(1.22,.79);profile.quadraticCurveTo(1.42,.68,1.44,.4);profile.lineTo(1.25,.3);profile.lineTo(-1.45,.32);
 const bodyGeo=new THREE.ExtrudeGeometry(profile,{depth:2.7,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:.08,bevelThickness:.08,curveSegments:5});bodyGeo.translate(0,0,-1.35);
 const body=new THREE.Mesh(bodyGeo,material(paint,paint,.16,.42,.18));body.name='curved sedan body';body.castShadow=true;body.receiveShadow=true;car.add(body);
 const windowMat=new THREE.MeshStandardMaterial({color:'#a7d7df',emissive:'#386478',emissiveIntensity:.22,roughness:.18,metalness:.24,side:THREE.DoubleSide});
 for(const side of [-1,1]){
  for(const x0 of [-.51,.12]){
   const glassShape=new THREE.Shape();glassShape.moveTo(x0,.82);glassShape.lineTo(x0+.17,1.23);glassShape.lineTo(x0+.48,1.22);glassShape.lineTo(x0+.48,.82);glassShape.closePath();
   const glass=new THREE.Mesh(new THREE.ShapeGeometry(glassShape),windowMat);glass.position.z=side*1.365;if(side<0)glass.rotation.y=Math.PI;car.add(glass);
  }
  for(const x of [-1.04,1.04]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.31,.31,.19,12),material('#12121a','#08080b',0,.8));wheel.rotation.z=Math.PI/2;wheel.position.set(x,.38,side*.93);wheel.castShadow=true;car.add(wheel);const hub=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.2,10),material('#888997','#414451',.2,.35,.4));hub.rotation.z=Math.PI/2;hub.position.copy(wheel.position);car.add(hub)}
 }
 for(const x of [-.83,.83]){
  block(car,'warm headlight',x,.48,-1.39,.23,.16,.07,neon('#ffe6a2',.6),false);
  block(car,'red tail light',x,.51,1.39,.21,.16,.06,neon('#fa514d',.4),false);
 }
 block(car,'front chrome bumper',0,.31,-1.43,2.55,.12,.12,material('#b2b5c1','#9aa0ae',.24,.24,.65),false);
 block(car,'rear chrome bumper',0,.31,1.43,2.4,.12,.12,material('#9ea4b2','#737b8b',.17,.26,.6),false);
 return car;
}
for(let i=0;i<9;i++){
 const car=createCar(i);car.position.set(-40+i*10,.03,i%2?5:10);city.add(car);
 traffic.push({mesh:car,speed:1.4+(i%4)*.35,phase:i*.8,z:car.position.z});
}

// Little roving patron silhouette; only rendered outside the interior view.
const walker=new THREE.Group();
walker.add(new THREE.Mesh(new THREE.CapsuleGeometry(.25,.72,4,8),material('#ed655c'))).position.y=1;
walker.add(new THREE.Mesh(new THREE.SphereGeometry(.23,10,8),material('#c69570'))).position.y=1.62;
walker.add(new THREE.Mesh(new THREE.CylinderGeometry(.27,.31,.1,10),material('#292332'))).position.y=1.86;
const guitar=new THREE.Mesh(new THREE.BoxGeometry(.24,.85,.16),material('#504157'));guitar.position.set(.43,1.08,.06);guitar.rotation.z=-.2;walker.add(guitar);city.add(walker);
const marker=new THREE.Mesh(new THREE.TorusGeometry(3.2,.055,8,64),neon('#d8ff32'));marker.rotation.x=-Math.PI/2;marker.position.y=.02;city.add(marker);

function updateVenueUI(){
 const v=venues[selected];
 document.querySelectorAll('.route-stop').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===selected)));
 $('venue-count').textContent=`STOP 0${selected+1} / 0${venues.length}`;$('venue-era').textContent=v.era;
 $('venue-name').innerHTML=selected===0?'THE<br>CONTINENTAL':selected===4?'ACL LIVE<br>AT THE MOODY':v.name.toUpperCase();
 $('venue-tag').textContent=v.tag;$('venue-description').textContent=v.description;$('scene-label-name').textContent=v.name.toUpperCase();
 $('street-venue-name').textContent=selected===4?'ACL LIVE / THE MOODY':v.short;$('street-area').textContent=v.era;
 $('street-instructions').textContent=v.kind==='stubbs'?'Follow the string lights. The stage is hiding under the Texas sky.':'Find the hand-painted sign and light leaking under the door.';
 document.querySelector('.venue-readout').style.setProperty('--venue',v.color);world.style.setProperty('--venue',v.color);
 document.querySelectorAll('.readout-pulse,.venue-count').forEach(node=>node.style.color=v.color);
 $('mode-chip').innerHTML=`<i></i> ${inside?'INSIDE THE VENUE':level==='aerial'?'AERIAL FLIGHT':level==='fly'?'HIGH FLIGHT':'GROUND LEVEL'}`;$('mode-chip').style.color=v.color;
 marker.material=neon(v.color);marker.position.x=facades[selected].position.x;
}
function selectVenue(index,teleport=false){selected=(index+venues.length)%venues.length;updateVenueUI();if(teleport&&level!=='aerial'&&!inside){walk.x=venues[selected].x;walk.z=9}}
function updateMode(){
 world.classList.toggle('street-view',level!=='aerial'&&!inside);world.classList.toggle('aerial-view',level==='aerial'&&!inside);world.classList.toggle('inside',inside);
 $('street-hud').hidden=level==='aerial'||inside;$('walk-hint').hidden=level==='aerial'&&!inside;$('walkpad').hidden=level==='aerial'&&!inside;
 $('walk-hint').innerHTML=inside?'<span>W A S D</span> WALK THE ROOM <i>·</i> <span>DRAG</span> LOOK <i>·</i> <span>E / ESC</span> EXIT':'<span>W A S D</span> WALK <i>·</i> <span>SPACE / SHIFT</span> RISE / DROP <i>·</i> <span>E</span> ENTER';
 $('back-button').hidden=!inside;$('scene-whisper').hidden=!inside;
 $('level-toggle').setAttribute('aria-pressed',String(level==='aerial'));
 $('level-toggle').innerHTML=level==='aerial'?'DROP TO STREET <span>↓</span>':'RISE TO AERIAL <span>↑</span>';
 walker.visible=!inside;
 facades.forEach((group,index)=>{if(group.userData.shell)group.userData.shell.visible=!inside||index!==selected});
 updateVenueUI();
}
function setLevel(value){if(inside)return;level=value;if(value==='ground'){walk.x=venues[selected].x;walk.z=9;walk.y=1.8;pitch=0;}if(value==='fly')walk.y=Math.max(walk.y,15);keys.clear();updateMode()}
function enterVenue(){if(inside)return;returnLevel=level;inside=true;roomWalk.x=0;roomWalk.y=1.8;roomWalk.z=5.2;roomYaw=0;roomPitch=0;walker.visible=false;updateMode()}
function exitVenue(){inside=false;level=returnLevel;updateMode()}
function selectNearest(){let nearest=selected,distance=Infinity;venues.forEach((v,i)=>{const d=Math.hypot(v.x-walk.x,12-walk.z);if(d<distance){distance=d;nearest=i}});if(nearest!==selected){selected=nearest;updateVenueUI()}}

const stopList=$('route-stops');
venues.forEach((venue,index)=>{
 const button=document.createElement('button');button.className='route-stop';button.type='button';button.dataset.index=index;button.style.setProperty('--stop',venue.color);button.setAttribute('aria-pressed','false');button.setAttribute('aria-label',`Stop ${index+1}: ${venue.name}, ${venue.area}`);
 button.innerHTML=`<span class="stop-no">0${index+1}</span><span class="stop-name">${venue.short}</span><span class="stop-neighborhood">${venue.area}</span>`;button.addEventListener('click',()=>selectVenue(index,true));stopList.append(button);
});

$('level-toggle').addEventListener('click',()=>setLevel(level==='aerial'?'ground':'aerial'));
$('enter-button').addEventListener('click',enterVenue);$('street-enter').addEventListener('click',enterVenue);$('back-button').addEventListener('click',exitVenue);
document.querySelectorAll('.walkpad button').forEach(button=>{
 const direction=button.dataset.move;
 const hold=(on,event)=>{event.preventDefault();on?touchMoves.add(direction):touchMoves.delete(direction)};
 button.addEventListener('pointerdown',event=>{hold(true,event);button.setPointerCapture?.(event.pointerId)});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,event=>hold(false,event));
 button.addEventListener('click',()=>{const target=inside?roomWalk:walk,step=inside?1.2:2;if(direction==='left')target.x-=step;if(direction==='right')target.x+=step;if(direction==='forward')target.z-=step;if(direction==='down')inside?target.z=Math.min(5.4,target.z+step):target.y=Math.max(1.8,target.y-3);if(direction==='up')inside?target.z=Math.max(-11.2,target.z-step):target.y=Math.min(25,target.y+3);target.x=THREE.MathUtils.clamp(target.x,inside?-4.2:-40,inside?4.2:40);if(!inside){target.z=THREE.MathUtils.clamp(target.z,-5,20);selectNearest()}});
});

canvas.addEventListener('pointerdown',event=>{dragging=true;dragDistance=0;lastPointer={x:event.clientX,y:event.clientY};canvas.setPointerCapture?.(event.pointerId)});
canvas.addEventListener('pointerup',event=>{
 dragging=false;if(level!=='aerial'||inside||dragDistance>7)return;
 const rect=canvas.getBoundingClientRect(),ndc=new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-((event.clientY-rect.top)/rect.height*2-1));
 const ray=new THREE.Raycaster();ray.setFromCamera(ndc,camera);const hit=ray.intersectObjects(facades,true)[0];if(hit){let root=hit.object;while(root&&!Number.isInteger(root.userData.venueIndex))root=root.parent;if(root)selectVenue(root.userData.venueIndex,false)}
});
canvas.addEventListener('pointermove',event=>{if(!dragging)return;const dx=event.clientX-lastPointer.x,dy=event.clientY-lastPointer.y;dragDistance+=Math.hypot(dx,dy);lastPointer={x:event.clientX,y:event.clientY};if(inside){roomYaw-=dx*.0038;roomPitch=THREE.MathUtils.clamp(roomPitch+dy*.003,-.48,.48)}else{yaw-=dx*.0038;pitch=THREE.MathUtils.clamp(pitch+dy*.003,-.7,.5)}});
canvas.addEventListener('pointercancel',()=>dragging=false);
canvas.addEventListener('wheel',event=>{if(level==='aerial'&&!inside){event.preventDefault();aerialDistance=THREE.MathUtils.clamp(aerialDistance+event.deltaY*.025,32,110)}},{passive:false});
document.addEventListener('keydown',event=>{
 if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;
 if(document.activeElement?.closest('button,a')&&['Enter',' '].includes(event.key))return;
 const key=event.key.toLowerCase();
 if(['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright',' ','shift'].includes(key)&&(level!=='aerial'||inside)){event.preventDefault();keys.add(key);return}
 if(key==='arrowright')selectVenue(selected+1,false);else if(key==='arrowleft')selectVenue(selected-1,false);
 else if(key==='g')setLevel('ground');else if(key==='f')setLevel(level==='fly'?'ground':'fly');
 else if(key==='enter'){if(!inside)enterVenue()}else if(key==='e'){inside?exitVenue():enterVenue()}else if(key==='escape'&&inside)exitVenue();else if(key==='m')setLevel('aerial');
});
document.addEventListener('keyup',event=>keys.delete(event.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();touchMoves.clear()});
stopList.addEventListener('wheel',event=>{if(Math.abs(event.deltaX)<Math.abs(event.deltaY)){event.preventDefault();stopList.scrollLeft+=event.deltaY}},{passive:false});

if(!fallback.isConnected)world.append(fallback);

function moveWalker(dt){
 if(level==='aerial'&&!inside)return;
 let f=0,s=0,h=0;const held=new Set([...keys,...touchMoves]);
 for(const k of held){if(k==='w'||k==='arrowup'||k==='forward'||(inside&&k==='up'))f++;else if(k==='s'||k==='arrowdown'||(inside&&k==='down'))f--;else if(k==='d'||k==='arrowright'||k==='right')s++;else if(k==='a'||k==='arrowleft'||k==='left')s--;else if(k===' '||(!inside&&k==='up'))h++;else if(k==='shift'||(!inside&&k==='down'))h--;}
 if(inside){
  const length=Math.hypot(f,s)||1,speed=4.2,fx=-Math.sin(roomYaw),fz=-Math.cos(roomYaw),rx=Math.cos(roomYaw),rz=-Math.sin(roomYaw);
  roomWalk.x+=(fx*f+rx*s)/length*speed*dt;roomWalk.z+=(fz*f+rz*s)/length*speed*dt;
  roomWalk.x=THREE.MathUtils.clamp(roomWalk.x,-4.25,4.25);roomWalk.z=THREE.MathUtils.clamp(roomWalk.z,-11.1,5.5);return;
 }
 const length=Math.hypot(f,s)||1,speed=held.has('shift')?11:6.7,fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);
 walk.x+=(fx*f+rx*s)/length*speed*dt;walk.z+=(fz*f+rz*s)/length*speed*dt;walk.y=THREE.MathUtils.clamp(walk.y+h*speed*dt,1.8,26);walk.x=THREE.MathUtils.clamp(walk.x,-40,40);walk.z=THREE.MathUtils.clamp(walk.z,-5,20);
 walker.position.set(walk.x,0,walk.z);walker.rotation.y=yaw;selectNearest();
}
function moveCamera(dt){
 const ease=1-Math.exp(-dt*3.8);
 if(inside){const v=facades[selected].position;const target=new THREE.Vector3(v.x+roomWalk.x,roomWalk.y,v.z+roomWalk.z);const forward=new THREE.Vector3(-Math.sin(roomYaw),Math.sin(roomPitch),-Math.cos(roomYaw));camera.position.lerp(target,ease);camera.lookAt(target.clone().add(forward));return}
 if(level==='ground'||level==='fly'){
  const target=new THREE.Vector3(walk.x,level==='fly'?Math.max(15,walk.y):walk.y,walk.z),forward=new THREE.Vector3(-Math.sin(yaw),Math.sin(pitch),-Math.cos(yaw));camera.position.lerp(target,ease);camera.lookAt(target.clone().add(forward));
 }else{
  const v=facades[selected].position;
  const orbitTarget=new THREE.Vector3(v.x,1,0);
  const aerialOffset=new THREE.Vector3(Math.sin(yaw)*aerialDistance, aerialDistance*.58+Math.sin(pitch)*aerialDistance*.35, Math.cos(yaw)*aerialDistance);
  camera.position.lerp(orbitTarget.clone().add(aerialOffset),ease);camera.lookAt(orbitTarget);
 }
}
function animateTime(t,dt){
 const motion=reduceMotion.matches?.18:1;
 for(const item of windows)item.mesh.material.emissiveIntensity=item.base*(.55+.45*Math.sin(t*2.1+item.phase));
 for(const item of animatedLights){const p=.58+.42*Math.sin(t*2.15+item.phase);if(item.light)item.light.intensity=item.base*p;if(item.opacity)item.mesh.material.opacity=item.base*p;else if(item.mesh?.material?.emissiveIntensity!==undefined)item.mesh.material.emissiveIntensity=item.base*p;if(item.mesh?.rotation)item.mesh.rotation.y=Math.sin(t*.4+item.phase)*.1}
 crowd.forEach(patron=>{patron.position.y=Math.max(0,Math.sin(t*3.2+patron.userData.phase)*.045);patron.rotation.y=Math.sin(t*.8+patron.userData.phase)*.08});
 stars.forEach(s=>s.mesh.position.y=s.y+Math.sin(t*.45+s.phase)*.24*motion);
 traffic.forEach(car=>{car.mesh.position.x=((car.mesh.position.x+car.speed*dt+46)%92)-46;car.mesh.position.z=car.z+Math.sin(t*1.3+car.phase)*.22});
 ripples.forEach(r=>{r.mesh.position.x=((r.mesh.position.x+dt*2+47)%94)-47;r.mesh.material.emissiveIntensity=.45+.35*Math.sin(t+r.phase)});
 cityFill.intensity=58+9*Math.sin(t*.23)*motion;river.material.emissiveIntensity=.38+.18*Math.sin(t*.42)*motion;
 facades.forEach((group,i)=>{group.children.forEach(child=>{if(child.name==='live outdoor stage')child.position.y=2.1+Math.sin(t*1.3+i)*.14*motion})});
}
function resize(){const rect=world.getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/Math.max(rect.height,1);camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(world);window.addEventListener('orientationchange',resize);resize();
let elapsed=0;
function animate(){const dt=Math.min(clock.getDelta(),.05);elapsed+=dt*(reduceMotion.matches?.25:1);moveWalker(dt);animateTime(elapsed,dt);moveCamera(dt);renderer.render(scene,camera);requestAnimationFrame(animate)}
selectVenue(0);updateMode();requestAnimationFrame(animate);
