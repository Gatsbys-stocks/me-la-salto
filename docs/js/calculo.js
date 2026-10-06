/**
 * Lógica del cálculo de faltas (sin nada de la interfaz).
 *
 * Se calcula por MÓDULO, a partir de sus horas totales oficiales
 * (las que salen en el currículo o en la programación del módulo),
 * así sirve igual para módulos de 1º y de 2º.
 *
 * Clases del módulo  = horas totales ÷ duración de una clase
 * Faltas permitidas  = clases del módulo × % permitido (redondeado hacia abajo)
 * Te quedan          = faltas permitidas − faltas que llevas
 * % faltado          = horas faltadas ÷ horas totales × 100
 */

/** Convierte lo que escribe el usuario en un número positivo (acepta coma decimal). */
function aNumero(valor) {
  const n = parseFloat(String(valor).replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Formatea un número con coma decimal y como mucho 1 decimal. */
function formatear(n) {
  const r = Math.round(n * 10) / 10;
  return String(r).replace(".", ",");
}

/**
 * @param {{horasTotales: number|string, faltas: number|string}} modulo
 * @param {{pct: number|string, duracion: number|string}} ajustes
 */
function calcularFaltas(modulo, ajustes) {
  const pct = aNumero(ajustes.pct) || 20;
  const horasClase = (aNumero(ajustes.duracion) || 60) / 60;

  const horasTotales = aNumero(modulo.horasTotales);
  const totalClases = Math.round(horasTotales / horasClase);
  const permitidas = Math.floor(totalClases * pct / 100 + 1e-9);
  const usadas = aNumero(modulo.faltas);
  const quedan = permitidas - usadas;

  const horasFaltadas = usadas * horasClase;
  const pctFaltado = horasTotales ? horasFaltadas / horasTotales * 100 : 0;
  const proporcion = permitidas ? usadas / permitidas : (usadas ? 1 : 0);

  let estado = "ok";                            // vas bien
  if (quedan < 0) estado = "bad";               // evaluación continua perdida
  else if (proporcion >= 0.75) estado = "warn"; // cuidado

  return { pct, horasTotales, totalClases, permitidas, usadas, quedan, horasFaltadas, pctFaltado, proporcion, estado };
}
