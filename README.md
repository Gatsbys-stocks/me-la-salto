# Me la salto — Calculadora de faltas FP

🔗 **https://melasalto.lol**

Web para que los alumnos de FP calculen, módulo por módulo, cuántas clases pueden faltar antes de perder la **evaluación continua**.

## Resumen del proyecto

En FP cada módulo tiene un límite de faltas (normalmente el **20%** de sus horas). Si lo pasas, pierdes la evaluación continua y te toca ir a la prueba final. El problema es que casi nadie sabe cuántas clases son ese 20% en cada módulo.

Esta calculadora lo resuelve: añades tus módulos con sus **horas totales** y **semanales**, vas sumando las faltas con un botón, y un círculo te dice cuántas clases te quedan y qué **% de faltas** llevas. Cuando te pasas del límite, aparece el **gato plátano llorando y bailando**.

## Qué incluye

- **Una ficha por módulo** con nombre, horas totales, horas por semana y faltas (con botones − / + para sumarlas cómodo desde el móvil).
- **Semanas que puedes faltar**: con las horas semanales calcula a cuántas semanas enteras de ese módulo equivale lo que te queda.
- **Porcentaje de faltas** de cada módulo comparado con el límite (por ejemplo, 12,1% de 20%).
- **Círculo de progreso** que se va llenando y cambia de color: verde (vas bien), naranja (cuidado, has gastado el 75%) y rojo (perdida).
- **Aviso con el gato** cuando un módulo pasa del límite.
- **Ajustes del insti**: % de faltas permitido, minutos por clase y semanas de curso, por si tu centro lo tiene distinto.
- **Guardado automático** en el navegador (`localStorage`). No hace falta cuenta y los datos no salen del móvil.
- **Diseño escolar**: hoja de cuaderno cuadriculado en modo claro y pizarra verde en modo oscuro.
- **Responsive**: pensado primero para móvil.

## Cómo se calcula

El cálculo se hace por módulo a partir de sus **horas totales oficiales**, no de las horas por semana. Así funciona aunque tengas módulos de distintos cursos a la vez, o módulos que no duran todo el año.

```
Clases del módulo  = horas totales ÷ duración de una clase
Faltas permitidas  = clases del módulo × % permitido   (redondeado hacia abajo)
Te quedan          = faltas permitidas − faltas que llevas
% faltado          = horas faltadas ÷ horas totales × 100
Semanas enteras    = horas que te quedan ÷ horas/semana
```

Si no sabes las horas totales de un módulo, déjalas vacías y se estiman con `horas/semana × semanas de curso`.

Ejemplo: un módulo de 198 h con clases de 60 min tiene 198 clases. El 20% son **39 faltas**. Si llevas 12, has faltado un 6,1% y te quedan 27, que con 6 h/semana son unas 4,5 semanas enteras. A la falta 40 se pierde la evaluación continua.

Las horas totales de cada módulo salen en el currículo del ciclo o en la programación didáctica del módulo.

> Cada centro puede aplicar el límite de forma distinta (faltas justificadas, retrasos…). Confírmalo siempre con tu tutor.

## Estructura del proyecto

```
me-la-salto/
├── public/                  # Web (código fuente)
│   ├── index.html
│   ├── css/
│   │   └── estilos.css      # estilos, colores y animaciones
│   ├── js/
│   │   ├── calculo.js       # lógica del cálculo de faltas
│   │   └── app.js           # interfaz, eventos y guardado
│   └── img/
│       ├── gato-platano.png # el gato del aviso
│       └── favicon.svg
├── docs/                    # copia de public/ que publica GitHub Pages
│   └── CNAME                # dominio: melasalto.lol
├── README.md
└── .gitignore
```

`docs/` es una copia de `public/` y es la carpeta que publica GitHub Pages. Si cambias algo en `public/`, vuelve a copiarlo a `docs/` **sin borrar `docs/CNAME`**, que es lo que mantiene conectado el dominio.

## Stack técnico

| Capa     | Tecnología                                  |
|----------|---------------------------------------------|
| Frontend | HTML5, CSS3, JavaScript (sin frameworks)    |
| Datos    | `localStorage` del navegador                |
| Hosting  | GitHub Pages con dominio propio (`melasalto.lol`) |

No tiene backend ni base de datos: todo se calcula en el navegador, así que es rápida, gratis de alojar y no guarda datos de nadie en ningún servidor.

## Cómo usarlo en local

No hace falta instalar nada. Abre `public/index.html` en el navegador.

## Despliegue

La web se publica con **GitHub Pages** desde la rama `main`, carpeta `/docs`, con el dominio **melasalto.lol**:

- DNS: 4 registros `A` de `@` a las IPs de GitHub Pages (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) y un `CNAME` de `www` a `gatsbys-stocks.github.io`.
- Cada push a `main` que cambie `docs/` actualiza la web en un par de minutos.

## Licencia

© 2026 9's. Todos los derechos reservados.
