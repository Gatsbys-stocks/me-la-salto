/**
 * Interfaz: pinta las asignaturas, maneja los botones − / +,
 * guarda los datos en el navegador y muestra el gato cuando
 * se pierde la evaluación continua.
 */

const CLAVE = "calculadora-faltas-fp";
const GATO = "img/gato-platano.png";

const EJEMPLO = {
  pct: 20,
  semanas: 33,
  duracion: 60,
  asignaturas: [
    { nombre: "Programación", horas: 6, faltas: 12 },
    { nombre: "Bases de datos", horas: 5, faltas: 3 },
    { nombre: "Inglés", horas: 2, faltas: 13 },
  ],
};

const $ = (id) => document.getElementById(id);
const lista = $("asignaturas");

let datos = cargar();

// Asignaturas que ya estaban perdidas al abrir la página (para no repetir el aviso)
const perdidas = new Set();
datos.asignaturas.forEach((a, i) => {
  if (calcularFaltas(a, datos).quedan < 0) perdidas.add(i);
});

/* ---------- Guardar y cargar ---------- */

function cargar() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE));
    if (guardado && Array.isArray(guardado.asignaturas)) return guardado;
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
        <input id="${campo}-${i}" data-campo="${campo}" type="number" min="0" inputmode="decimal" value="${escapar(valor)}" aria-label="${etiqueta}">
        <button type="button" data-campo="${campo}" data-paso="1" aria-label="${mas}">+</button>
      </div>
    </div>`;
}

function pintarTodo() {
  lista.innerHTML = datos.asignaturas.map((a, i) => `
    <article class="card" data-i="${i}">
      <div class="ring" id="anillo-${i}"><div id="centro-${i}"></div></div>
      <div class="side">
        <div class="top">
          <input class="name" id="nombre-${i}" data-campo="nombre" value="${escapar(a.nombre)}" placeholder="Nombre de la asignatura" aria-label="Nombre de la asignatura">
          <button class="x" type="button" data-borrar aria-label="Quitar asignatura">×</button>
        </div>
        <div class="row">
          ${contador(i, "horas", "Horas/sem", a.horas, "Menos horas", "Más horas")}
          ${contador(i, "faltas", "Faltas", a.faltas, "Quitar falta", "Sumar falta")}
        </div>
        <div class="status" id="estado-${i}"></div>
      </div>
    </article>`).join("");

  datos.asignaturas.forEach((_, i) => pintarAsignatura(i));
  pintarResumen();
}

function pintarAsignatura(i) {
  const a = datos.asignaturas[i];
  const r = calcularFaltas(a, datos);
  const color = { ok: "var(--ok)", warn: "var(--warn)", bad: "var(--bad)" }[r.estado];

  const anillo = $("anillo-" + i);
  anillo.style.setProperty("--c", color);
  anillo.style.setProperty("--p", Math.min(r.proporcion, 1) * 100);
  anillo.setAttribute("aria-label", `${r.usadas} de ${r.permitidas} faltas usadas`);

  $("centro-" + i).innerHTML = r.quedan >= 0
    ? `<b>${r.quedan}</b><small>${r.quedan === 1 ? "te queda" : "te quedan"}</small>`
    : `<img src="${GATO}" alt="Gato plátano bailando">`;

  const texto = { ok: "Vas bien", warn: "Cuidado", bad: "Evaluación continua perdida" }[r.estado];
  $("estado-" + i).innerHTML =
    `<span class="pill ${r.estado}">${texto}</span>` +
    `<span><strong>${r.usadas}</strong>/${r.permitidas} faltas · ${r.totalClases} clases en el curso</span>`;

  // Aviso del gato solo al pasar el límite, no cada vez que se pinta
  if (r.quedan < 0 && !perdidas.has(i)) {
    perdidas.add(i);
    mostrarGato(a.nombre);
  }
  if (r.quedan >= 0) perdidas.delete(i);
}

function pintarResumen() {
  const horas = datos.asignaturas.reduce((t, a) => t + aNumero(a.horas), 0);
  const n = datos.asignaturas.length;
  $("resumen").textContent =
    `${n} ${n === 1 ? "asignatura" : "asignaturas"} · ${String(horas).replace(".", ",")} h/semana`;
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
  datos.asignaturas[i][campo] = e.target.value;
  guardar();
  pintarAsignatura(i);
  pintarResumen();
});

// Botones − / + y borrar
lista.addEventListener("click", (e) => {
  const boton = e.target.closest("button");
  if (!boton) return;
  const tarjeta = boton.closest(".card");
  const i = +tarjeta.dataset.i;

  if (boton.hasAttribute("data-borrar")) {
    datos.asignaturas.splice(i, 1);
    // Recolocar los índices de las asignaturas perdidas
    const nuevas = [...perdidas].filter((j) => j !== i).map((j) => (j > i ? j - 1 : j));
    perdidas.clear();
    nuevas.forEach((j) => perdidas.add(j));
    guardar();
    pintarTodo();
    return;
  }

  const campo = boton.dataset.campo;
  const valor = Math.max(0, aNumero(datos.asignaturas[i][campo]) + Number(boton.dataset.paso));
  datos.asignaturas[i][campo] = valor;
  tarjeta.querySelector(`input[data-campo="${campo}"]`).value = valor;
  guardar();
  pintarAsignatura(i);
  pintarResumen();
});

// Añadir asignatura
$("anadir").addEventListener("click", () => {
  datos.asignaturas.push({ nombre: "", horas: 3, faltas: 0 });
  guardar();
  pintarTodo();
  $("nombre-" + (datos.asignaturas.length - 1)).focus();
});

// Ajustes del insti
["pct", "semanas", "duracion"].forEach((id) => {
  const campo = $(id);
  campo.value = datos[id];
  campo.addEventListener("input", () => {
    datos[id] = campo.value;
    guardar();
    datos.asignaturas.forEach((_, i) => pintarAsignatura(i));
  });
});

pintarTodo();
