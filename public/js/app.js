/**
 * Interfaz: pinta los módulos agrupados por curso (1º y 2º),
 * maneja los botones − / +, guarda los datos en el navegador
 * y muestra el gato cuando se pierde la evaluación continua.
 */

const CLAVE = "calculadora-faltas-fp-modulos";
const GATO = "img/gato-platano.png";
const CURSOS = [
  { id: 1, titulo: "Primero" },
  { id: 2, titulo: "Segundo" },
];

const EJEMPLO = {
  pct: 20,
  duracion: 60,
  modulos: [
    { nombre: "Programación", curso: 1, horasTotales: 198, faltas: 12 },
    { nombre: "Bases de datos", curso: 1, horasTotales: 165, faltas: 4 },
    { nombre: "Inglés profesional", curso: 1, horasTotales: 66, faltas: 13 },
    { nombre: "Acceso a datos", curso: 2, horasTotales: 132, faltas: 6 },
    { nombre: "Desarrollo de interfaces", curso: 2, horasTotales: 99, faltas: 2 },
  ],
};

const $ = (id) => document.getElementById(id);
const lista = $("modulos");

let datos = cargar();

// Módulos que ya estaban perdidos al abrir la página (para no repetir el aviso)
const perdidos = new Set();
datos.modulos.forEach((m, i) => {
  if (calcularFaltas(m, datos).quedan < 0) perdidos.add(i);
});

/* ---------- Guardar y cargar ---------- */

function cargar() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE));
    if (guardado && Array.isArray(guardado.modulos)) return guardado;
  } catch (e) { /* sin datos guardados */ }
  return structuredClone(EJEMPLO);
}

function guardar() {
  try { localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch (e) { /* navegador sin almacenamiento */ }
}

/* ---------- Pintar ---------- */

function escapar(texto) {
  return String(texto).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function contador(i, campo, etiqueta, valor, menos, mas) {
  return `
    <div class="box"><span>${etiqueta}</span>
      <div class="step">
        <button type="button" data-campo="${campo}" data-paso="-1" aria-label="${menos}">−</button>
        <input id="${campo}-${i}" data-campo="${campo}" type="number" min="0" inputmode="numeric" value="${escapar(valor)}" aria-label="${etiqueta}">
        <button type="button" data-campo="${campo}" data-paso="1" aria-label="${mas}">+</button>
      </div>
    </div>`;
}

function tarjeta(m, i) {
  return `
    <article class="card" data-i="${i}">
      <div class="ring" id="anillo-${i}"><div id="centro-${i}"></div></div>
      <div class="side">
        <div class="top">
          <button class="curso" type="button" data-cambiar-curso aria-label="Cambiar de curso">${m.curso === 2 ? "2º" : "1º"}</button>
          <input class="name" id="nombre-${i}" data-campo="nombre" value="${escapar(m.nombre)}" placeholder="Nombre del módulo" aria-label="Nombre del módulo">
          <button class="x" type="button" data-borrar aria-label="Quitar módulo">×</button>
        </div>
        <div class="row">
          ${contador(i, "horasTotales", "Horas totales", m.horasTotales, "Menos horas", "Más horas")}
          ${contador(i, "faltas", "Faltas", m.faltas, "Quitar falta", "Sumar falta")}
        </div>
        <div class="status" id="estado-${i}"></div>
      </div>
    </article>`;
}

function pintarTodo() {
  lista.innerHTML = CURSOS.map((c) => {
    const tarjetas = datos.modulos
      .map((m, i) => ((m.curso === 2 ? 2 : 1) === c.id ? tarjeta(m, i) : ""))
      .join("");
    return `
      <section class="grupo" aria-labelledby="curso-${c.id}">
        <div class="grupo-cabecera">
          <h2 id="curso-${c.id}">${c.titulo}</h2>
          <span id="info-curso-${c.id}"></span>
        </div>
        ${tarjetas || `<p class="vacio">Aún no hay módulos de ${c.titulo.toLowerCase()}.</p>`}
        <button class="add" type="button" data-anadir="${c.id}">+ Añadir módulo de ${c.id}º</button>
      </section>`;
  }).join("");

  datos.modulos.forEach((_, i) => pintarModulo(i));
  pintarResumen();
}

function pintarModulo(i) {
  const m = datos.modulos[i];
  const r = calcularFaltas(m, datos);
  const color = { ok: "var(--ok)", warn: "var(--warn)", bad: "var(--bad)" }[r.estado];

  const anillo = $("anillo-" + i);
  anillo.style.setProperty("--c", color);
  anillo.style.setProperty("--p", Math.min(r.proporcion, 1) * 100);
  anillo.setAttribute("aria-label", `${r.usadas} de ${r.permitidas} faltas usadas`);

  $("centro-" + i).innerHTML = r.quedan >= 0
    ? `<b>${r.quedan}</b><small>${r.quedan === 1 ? "te queda" : "te quedan"}</small>`
    : `<img src="${GATO}" alt="Gato plátano bailando">`;

  const texto = { ok: "Vas bien", warn: "Cuidado", bad: "Evaluación continua perdida" }[r.estado];
  $("estado-" + i).innerHTML = r.horasTotales
    ? `<span class="pill ${r.estado}">${texto}</span>
       <span class="pct"><strong>${formatear(r.pctFaltado)}%</strong> de ${formatear(r.pct)}%</span>
       <span><strong>${r.usadas}</strong>/${r.permitidas} faltas</span>`
    : `<span>Pon las horas totales del módulo</span>`;

  // Aviso del gato solo al pasar el límite, no cada vez que se pinta
  if (r.quedan < 0 && !perdidos.has(i)) {
    perdidos.add(i);
    mostrarGato(m.nombre);
  }
  if (r.quedan >= 0) perdidos.delete(i);
}

function pintarResumen() {
  const n = datos.modulos.length;
  $("resumen").textContent = `${n} ${n === 1 ? "módulo" : "módulos"} · límite ${formatear(aNumero(datos.pct) || 20)}%`;

  CURSOS.forEach((c) => {
    const del = datos.modulos.filter((m) => (m.curso === 2 ? 2 : 1) === c.id);
    const horas = del.reduce((t, m) => t + aNumero(m.horasTotales), 0);
    const info = $("info-curso-" + c.id);
    if (info) info.textContent = del.length ? `${del.length} ${del.length === 1 ? "módulo" : "módulos"} · ${formatear(horas)} h` : "";
  });
}

/* ---------- Aviso del gato ---------- */

function mostrarGato(nombre) {
  $("avisoTexto").textContent = nombre
    ? `En ${nombre} te has pasado del límite de faltas.`
    : "Te has pasado del límite de faltas.";
  $("aviso").hidden = false;
  $("cerrarAviso").focus();
}

function ocultarGato() {
  $("aviso").hidden = true;
}

$("cerrarAviso").addEventListener("click", ocultarGato);
$("aviso").addEventListener("click", (e) => { if (e.target.id === "aviso") ocultarGato(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") ocultarGato(); });

/* ---------- Eventos ---------- */

// Escribir en un campo
lista.addEventListener("input", (e) => {
  const campo = e.target.dataset.campo;
  if (!campo) return;
  const i = +e.target.closest(".card").dataset.i;
  datos.modulos[i][campo] = e.target.value;
  guardar();
  pintarModulo(i);
  pintarResumen();
});

lista.addEventListener("click", (e) => {
  const boton = e.target.closest("button");
  if (!boton) return;

  // Añadir módulo a un curso
  if (boton.dataset.anadir) {
    datos.modulos.push({ nombre: "", curso: +boton.dataset.anadir, horasTotales: 99, faltas: 0 });
    guardar();
    pintarTodo();
    $("nombre-" + (datos.modulos.length - 1)).focus();
    return;
  }

  const tarjeta = boton.closest(".card");
  if (!tarjeta) return;
  const i = +tarjeta.dataset.i;

  // Pasar el módulo de 1º a 2º o al revés
  if (boton.hasAttribute("data-cambiar-curso")) {
    datos.modulos[i].curso = datos.modulos[i].curso === 2 ? 1 : 2;
    guardar();
    pintarTodo();
    return;
  }

  // Quitar módulo
  if (boton.hasAttribute("data-borrar")) {
    datos.modulos.splice(i, 1);
    const nuevos = [...perdidos].filter((j) => j !== i).map((j) => (j > i ? j - 1 : j));
    perdidos.clear();
    nuevos.forEach((j) => perdidos.add(j));
    guardar();
    pintarTodo();
    return;
  }

  // Botones − / +
  const campo = boton.dataset.campo;
  const valor = Math.max(0, aNumero(datos.modulos[i][campo]) + Number(boton.dataset.paso));
  datos.modulos[i][campo] = valor;
  tarjeta.querySelector(`input[data-campo="${campo}"]`).value = valor;
  guardar();
  pintarModulo(i);
  pintarResumen();
});

// Ajustes del insti
["pct", "duracion"].forEach((id) => {
  const campo = $(id);
  campo.value = datos[id];
  campo.addEventListener("input", () => {
    datos[id] = campo.value;
    guardar();
    datos.modulos.forEach((_, i) => pintarModulo(i));
    pintarResumen();
  });
});

pintarTodo();
