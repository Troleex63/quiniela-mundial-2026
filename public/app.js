let admin=false;

async function api(
url,
op="GET",
body=null
){

const r=
await fetch(

url,

{

method:op,

headers:{

"Content-Type":
"application/json"

},

body:

body

?

JSON.stringify(
body
)

:

null

}

);

return r.json();

}

async function cargar(){

const partidos=
await api(
"/partidos"
);

const zona=

document
.getElementById(
"partidos"
);

zona.innerHTML="";

partidos.forEach(

p=>{

const cerrado=

Date.now()

>=

new Date(
p.fecha
);

zona.innerHTML+=`

<div class="card">

<h2>

${p.id}

—

${p.local}

VS

${p.visitante}

</h2>

<p>

Fecha:
${p.fecha}

</p>

<p>

Marcador:
${p.marcador||"-"}

</p>

<p>

Ganador:
${p.ganador||"-"}

</p>

${
cerrado

?

"<b>Apuestas cerradas</b>"

:

`

<input
id="n${p.id}"
placeholder="Nombre">

<input
id="a${p.id}"
placeholder="Apellido">

<select
id="e${p.id}">

<option>

${p.local}

</option>

<option>

${p.visitante}

</option>

</select>

<input
id="r${p.id}"

placeholder="Marcador (ej. 2-1)">

<button
onclick="apostar('${p.id}')">

Apostar

</button>

`

}

${
admin

?

`

<br>

<button
onclick="editar('${p.id}')">

Editar

</button>

<button
onclick="eliminar('${p.id}')">

Eliminar

</button>

`

:

""

}

</div>

`;

}

);

}

async function apostar(
id
){

const nombre=
document
.getElementById(
"n"+id
).value;

const apellido=
document
.getElementById(
"a"+id
).value;

const equipo=
document
.getElementById(
"e"+id
).value;

const marcador=
document
.getElementById(
"r"+id
).value;

if(
!nombre||
!apellido||
!marcador
){

alert(
"Completa todos los datos"
);

return;

}

if(

!confirm(

"Participar tiene una cuota fija informativa de $50 MXN.\n\nTu predicción ya no podrá modificarse."

)

)

return;

const apuestas=
await api(
"/apuestas"
);

const existe=

apuestas.find(

a=>

a.nombre===nombre

&&

a.apellido===apellido

&&

a.partido===id

);

if(
existe
){

alert(
"Ya participaste"
);

return;

}

apuestas.push({

nombre,

apellido,

equipo,

marcador,

partido:id,

entrada:"50"

});

await fetch(

"/apuestas",

{

method:
"POST",

headers:{

"Content-Type":

"application/json"

},

body:

JSON.stringify(
apuestas
)

}

);

alert(
"Participación registrada"
);

location.reload();

}

async function abrirAdmin(){

const pass=
prompt(
"Contraseña"
);

const ok=

await api(

"/login-admin",

"POST",

{

password:
pass

}

);

if(
!ok.ok
){

alert(
"Incorrecta"
);

return;

}

admin=true;

document
.getElementById(
"admin"
)

.innerHTML=

`

<div class="admin">

<h2>

Administrador

</h2>

<input
id="local"
placeholder="Local">

<input
id="visitante"
placeholder="Visitante">

<input
id="fecha"
placeholder="2026-06-11T18:00:00">

<button
onclick="crear()">

Crear Partido

</button>

<button
onclick="verApuestas()">

Ver apuestas

</button>

<button
onclick="calcularGanadores()">

Calcular Ganadores

</button>

<button
onclick="verRanking()">

Ver Ranking

</button>

<div id="lista"></div>

</div>

`;

cargar();

}

async function crear(){

await api(

"/partidos",

"POST",

{

local:

local.value,

visitante:

visitante.value,

fecha:

fecha.value,

marcador:"",

ganador:""

}

);

cargar();

}

async function editar(
id
){

const marcador=
prompt(
"Marcador"
);

const ganador=
prompt(
"Ganador"
);

await api(

"/partidos/"+id,

"PUT",

{

marcador,
ganador

}

);

cargar();

}

async function eliminar(
id
){

if(
!confirm(
"Eliminar partido"
)
)
return;

await api(

"/partidos/"+id,

"DELETE"
);

cargar();

}

async function verApuestas(){

const datos=
await api(
"/apuestas"
);

let html=

`

<h2>

Apuestas realizadas

</h2>

`;

if(
datos.length===0
){

html+=`

<p>

No hay apuestas todavía

</p>

`;

}

else{

datos.forEach(

a=>{

html+=`

<div class="card">

<p>

👤
<b>

${a.nombre}

${a.apellido}

</b>

</p>

<p>

⚽ Equipo:

${a.equipo}

</p>

<p>

💵 Cantidad:

$${a.cantidad}

</p>

<p>

🏟 Partido:

${a.partido}

</p>

</div>

`;

}

);

}

document
.getElementById(
"lista"
)

.innerHTML=
html;

}

document
.getElementById(
"titulo"
)

.addEventListener(

"dblclick",

abrirAdmin

);

async function calcularGanadores(){

await api(

"/calcular-ganadores",

"POST"

);

alert(
"Ranking actualizado"
);

}

async function verRanking(){

const datos=

await api(
"/ranking"
);

let html=

`

<h2>

Ranking

</h2>

`;

const orden=

Object.entries(
datos
)

.sort(

(a,b)=>

b[1]-a[1]

);

orden.forEach(

u=>{

html+=`

<p>

🏆

${u[0]}

—

${u[1]}

pts

</p>

`;

}

);

document
.getElementById(
"lista"
)

.innerHTML=
html;

}
async function mostrarRankingPublico(){

const datos=

await api(
"/ranking"
);

let html=

`

<div class="card">

<h2>

🏆 Ranking

</h2>

`;

const orden=

Object.entries(
datos
)

.sort(

(a,b)=>

b[1]-a[1]

);

if(
orden.length===0
){

html+=

"<p>Aún no hay puntos</p>";

}

else{

orden.forEach(

u=>{

html+=`

<p>

${u[0]}

—

${u[1]} pts

</p>

`;

}

);

}

html+=
"</div>";

document
.body

.insertAdjacentHTML(

"beforeend",

html

);

}

cargar();

mostrarRankingPublico();