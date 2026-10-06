/**
 * Interfaz: pinta la lista de módulos,
 * maneja los botones − / +, guarda los datos en el navegador
 * y muestra el gato cuando se pierde la evaluación continua.
 */

const CLAVE = "calculadora-faltas-fp-modulos-v3";
const GATO = "img/gato-platano.png";

const EJEMPLO = {
  pct: 20,
  duracion: 60,
  semanas: 33,
  modulos: [
    { nombre: "Programación", horasTotales: 198, horasSemana: 6, faltas: 12 },
    { nombre: "Bases de datos", horasTotales: 165, horasSemana: 5, faltas: 4 },
    { nombre: "Inglés profesional", horasTotales: 66, horasSemana: 2, faltas: 13 },
    { nombre: "Acceso a datos", horasTotales: 132, horasSemana: 6, faltas: 6 },
    { nombre: "Desarrollo de interfaces", horasTotales: 99, horasSemana: 4, faltas: 2 },
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
          <input class="name" id="nombre-${i}" data-campo="nombre" value="${escapar(m.nombre)}" placeholder="Nombre del módulo" aria-label="Nombre del módulo">
          <button class="x" type="button" data-borrar aria-label="Quitar módulo">×</button>
        </div>
        <div class="row">
          <label class="box campo" for="horasTotales-${i}"><span>Horas totales</span>
            <input id="horasTotales-${i}" data-campo="horasTotales" type="number" min="0" inputmode="numeric" value="${escapar(m.horasTotales)}" placeholder="auto">
          </label>
          <label class="box campo" for="horasSemana-${i}"><span>Horas/semana</span>
            <input id="horasSemana-${i}" data-campo="horasSemana" type="number" min="0" step="0.5" inputmode="decimal" value="${escapar(m.horasSemana)}">
          </label>
        </div>
        ${contador(i, "faltas", "Faltas (clases)", m.faltas, "Quitar falta", "Sumar falta")}
        <div class="status" id="estado-${i}"></div>
      </div>
    </article>`;
}

function pintarTodo() {
  lista.innerHTML = datos.modulos.length
    ? datos.modulos.map(tarjeta).join("")
    : `<p class="vacio">Aún no has añadido ningún módulo.</p>`;
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
       <span><strong>${r.usadas}</strong>/${r.permitidas} faltas</span>
       ${r.semanasQuedan >= 1 ? `<span>≈ <strong>${formatear(r.semanasQuedan)}</strong> semanas enteras</span>` : ""}
       ${r.estimado ? `<span class="nota">Total estimado: ${formatear(r.horasTotales)} h</span>` : ""}`
    : `<span>Pon las horas totales o las horas por semana</span>`;

  // Aviso del gato solo al pasar el límite, no cada vez que se pinta
  if (r.quedan < 0 && !perdidos.has(i)) {
    perdidos.add(i);
    mostrarGato(m.nombre);
  }
  if (r.quedan >= 0) perdidos.delete(i);
}

function pintarResumen() {
  const n = datos.modulos.length;
  const horasSemana = datos.modulos.reduce((t, m) => t + aNumero(m.horasSemana), 0);
  $("resumen").textContent =
    `${n} ${n === 1 ? "módulo" : "módulos"} · ${formatear(horasSemana)} h/semana · límite ${formatear(aNumero(datos.pct) || 20)}%`;
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

  const tarjeta = boton.closest(".card");
  if (!tarjeta) return;
  const i = +tarjeta.dataset.i;

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

// Añadir módulo
$("anadir").addEventListener("click", () => {
  datos.modulos.push({ nombre: "", horasTotales: "", horasSemana: 3, faltas: 0 });
  guardar();
  pintarTodo();
  $("nombre-" + (datos.modulos.length - 1)).focus();
});

// Ajustes del insti
["pct", "duracion", "semanas"].forEach((id) => {
  const campo = $(id);
  campo.value = datos[id] ?? EJEMPLO[id];
  campo.addEventListener("input", () => {
    datos[id] = campo.value;
    guardar();
    datos.modulos.forEach((_, i) => pintarModulo(i));
    pintarResumen();
  });
});

pintarTodo();
