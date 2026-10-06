# ¿Cuántas clases puedo faltar? — Calculadora de faltas FP

Web para que los alumnos de FP calculen, asignatura por asignatura, cuántas clases pueden faltar antes de perder la **evaluación continua**.

## Resumen del proyecto

En FP cada módulo tiene un límite de faltas (normalmente el **20%** de sus horas). Si lo pasas, pierdes la evaluación continua y te toca ir a la prueba final. El problema es que casi nadie sabe cuántas clases son ese 20% en cada asignatura, porque depende de las horas que tenga a la semana.

Esta calculadora lo resuelve: pones las horas semanales de cada asignatura, vas sumando las faltas con un botón, y un círculo te dice cuántas te quedan. Cuando te pasas del límite, aparece el **gato plátano llorando y bailando**.

## Qué incluye

- **Una tarjeta por asignatura** con nombre, horas a la semana y faltas, con botones − / + para usarlo cómodo desde el móvil.
- **Círculo de progreso** que se va llenando y cambia de color: verde (vas bien), naranja (cuidado, has gastado el 75%) y rojo (perdida).
- **Aviso con el gato** cuando una asignatura pasa del límite.
- **Ajustes del insti**: % de faltas permitido, semanas de curso y minutos por clase, por si tu centro lo tiene distinto.
- **Guardado automático** en el navegador (`localStorage`). No hace falta cuenta y los datos no salen del móvil.
- **Diseño escolar**: hoja de cuaderno cuadriculado en modo claro y pizarra verde en modo oscuro.
- **Responsive**: pensado primero para móvil.

## Cómo se calcula

```
Clases del curso   = horas/semana × (60 ÷ minutos por clase) × semanas
Faltas permitidas  = clases del curso × % permitido   (redondeado hacia abajo)
Te quedan          = faltas permitidas − faltas que llevas
```

Ejemplo: una asignatura de 6 h/semana, en un curso de 33 semanas con clases de 60 min, tiene 198 clases. El 20% son **39 faltas**. A la falta 40 se pierde la evaluación continua.

> Cada centro puede aplicar el límite de forma distinta (faltas justificadas, retrasos…). Confírmalo siempre con tu tutor.

## Estructura del proyecto

```
calculadora-faltas/
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
├── docs/                    # copia de public/ para GitHub Pages
├── README.md
└── .gitignore
```

`docs/` es una copia exacta de `public/` para poder publicar la web con GitHub Pages. Si cambias algo en `public/`, vuelve a copiarlo a `docs/`.

## Stack técnico

| Capa     | Tecnología                                  |
|----------|---------------------------------------------|
| Frontend | HTML5, CSS3, JavaScript (sin frameworks)    |
| Datos    | `localStorage` del navegador                |
| Hosting  | GitHub Pages                                |

No tiene backend ni base de datos: todo se calcula en el navegador, así que es rápida, gratis de alojar y no guarda datos de nadie en ningún servidor.

## Cómo usarlo en local

No hace falta instalar nada. Abre `public/index.html` en el navegador.

## Publicar en GitHub Pages

1. Sube el repo a GitHub.
2. Ve a **Settings → Pages**.
3. En *Source* elige **Deploy from a branch**, rama `main` y carpeta **`/docs`**.
4. En un par de minutos la web estará en `https://<tu-usuario>.github.io/<nombre-del-repo>/`.

## Licencia

© 2026 9's. Todos los derechos reservados.
