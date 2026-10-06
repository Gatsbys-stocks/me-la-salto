/**
 * Lógica del cálculo de faltas (sin nada de la interfaz).
 *
 * Clases del curso = horas/semana × (60 ÷ minutos por clase) × semanas
 * Faltas permitidas = clases del curso × % permitido (redondeado hacia abajo)
 * Te quedan        = faltas permitidas − faltas que llevas
 */

/** Convierte lo que escribe el usuario en un número positivo (acepta coma decimal). */
function aNumero(valor) {
  const n = parseFloat(String(valor).replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * @param {{horas: number|string, faltas: number|string}} asignatura
 * @param {{pct: number|string, semanas: number|string, duracion: number|string}} ajustes
 */
function calcularFaltas(asignatura, ajustes) {
  const duracion = aNumero(ajustes.duracion) || 60;
  const semanas = aNumero(ajustes.semanas) || 33;
  const pct = aNumero(ajustes.pct) || 20;

  const clasesSemana = aNumero(asignatura.horas) * 60 / duracion;
  const totalClases = Math.round(clasesSemana * semanas);
  const permitidas = Math.floor(totalClases * pct / 100 + 1e-9);
  const usadas = aNumero(asignatura.faltas);
  const quedan = permitidas - usadas;
  const proporcion = permitidas ? usadas / permitidas : (usadas ? 1 : 0);

  let estado = "ok";            // vas bien
  if (quedan < 0) estado = "bad";          // evaluación continua perdida
  else if (proporcion >= 0.75) estado = "warn"; // cuidado

  return { totalClases, permitidas, usadas, quedan, proporcion, estado };
}
