const express=require("express");
const fs=require("fs");

const app=express();

app.use(express.json());

app.use(
express.static(
"public"
)

);

const ADMIN_PASSWORD=
"QM2026_ADMIN_8472";

function leer(
archivo
){

if(
!fs.existsSync(
archivo
)
){

fs.writeFileSync(
archivo,
"[]"
);

}

return JSON.parse(
fs.readFileSync(
archivo,
"utf8"
)
);

}

function guardar(
archivo,
datos
){

fs.writeFileSync(

archivo,

JSON.stringify(
datos,
null,
2

)

);

}

function siguienteID(){

const partidos=
leer(
"partidos.json"
);

const ultimo=

partidos.length

?

Number(

partidos[
partidos.length-1
]

.id

.replace(
"P",
""
)

)

:

0;

return(

"P"+

String(

ultimo+1

)

.padStart(
3,
"0"
)

);

}

app.post(
"/login-admin",

(req,res)=>{

res.json({

ok:

req.body.password===

ADMIN_PASSWORD

});

}
);

app.get(
"/partidos",

(req,res)=>{

res.json(
leer(
"partidos.json"
)
);

}
);

app.post(
"/partidos",

(req,res)=>{

const partidos=
leer(
"partidos.json"
);

const nuevo=

{

id:
siguienteID(),

...req.body

};

partidos.push(
nuevo
);

guardar(
"partidos.json",
partidos
);

res.json({

ok:true

});

}
);

app.put(
"/partidos/:id",

(req,res)=>{

let partidos=
leer(
"partidos.json"
);

partidos=
partidos.map(

p=>

p.id===
req.params.id

?

{

...p,

...req.body

}

:

p

);

guardar(
"partidos.json",
partidos
);

res.json({

ok:true

});

}
);

app.delete(
"/partidos/:id",

(req,res)=>{

let partidos=
leer(
"partidos.json"
);

partidos=
partidos.filter(

p=>

p.id!==

req.params.id

);

guardar(
"partidos.json",
partidos
);

res.json({

ok:true

});

}
);

app.get(
"/apuestas",

(req,res)=>{

res.json(
leer(
"apuestas.json"
)
);

}
);

app.post(
"/apuestas",

(req,res)=>{

guardar(
"apuestas.json",

req.body
);

res.json({

ok:true

});

}
);

app.get(
"/resultados",

(req,res)=>{

res.json(
leer(
"resultados.json"
)
);

}
);

app.post(
"/calcular-ganadores",

(req,res)=>{

const partidos=
leer(
"partidos.json"
);

const apuestas=
leer(
"apuestas.json"
);

let ranking={};

let resultados=[];

partidos.forEach(

partido=>{

if(
!partido.ganador
)
return;

const usuarios=[];

apuestas.forEach(

u=>{

if(
u.partido
!==

partido.id

)
return;

let puntos=0;

if(

partido.ganador
!==

"Empate"

&&

u.equipo===

partido.ganador

){

puntos+=1;

}

if(

partido.ganador===

"Empate"

&&

u.equipo===

"Empate"

){

puntos+=1;

}

if(
puntos
===0
)
return;

const nombre=

u.nombre+

" "+

u.apellido;

ranking[
nombre
]=

(
ranking[
nombre
]

||

0

)

+

puntos;

usuarios.push({

...u,

puntos

});

}

);

resultados.push({

partido:
partido.id,

usuarios

});

}

);

guardar(

"resultados.json",

{

resultados,

ranking

}

);

res.json({

ok:true

});

}
);

app.get(
"/ranking",

(req,res)=>{

const datos=
leer(
"resultados.json"
);

res.json(

datos.ranking

||

{}

);

});

const PORT =
process.env.PORT
||
3000;

app.listen(

PORT,

()=>{

console.log(
`Servidor iniciado en puerto ${PORT}`
);

});