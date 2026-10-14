# EPIC-04 — Lectura y seguimiento de Works

## Objetivo

Permitir que un usuario autenticado pueda **leer una Work completa mediante un Reader**, avanzando página por página y conservando su progreso de lectura.

El sistema debe permitir que el usuario:

* Abra una Work desde su detalle.
* Ingrese al Reader.
* Lea sus páginas individualmente.
* Avance y retroceda entre páginas.
* Visualice su progreso de lectura.
* Salga y continúe posteriormente desde donde dejó la lectura.
* Consulte sus Works en lectura y completadas.
* Elimine una Work de su historial, eliminando también su progreso.
* Continúe leyendo desde la página correspondiente.
* Complete una Work llegando al formulario final de la lectura.
* Navegue directamente hacia la Work anterior o siguiente cuando exista una relación explícita.
* Mantenga una experiencia de lectura inmersiva y adaptable a Mobile, Tablet y Desktop.

La Epic debe dejar el Reader diseñado de manera reutilizable para futuros **contextos de lectura**, especialmente Lists, pero la lectura de Lists no forma parte de esta Epic.

---

# Conceptos

## Work como unidad de lectura

Una Work puede ser leída individualmente.

El flujo principal es:

```text
Detalle de Work
      ↓
    Leer
      ↓
    Reader
      ↓
Página por página
```

El Reader debe trabajar sobre una Work completa y conservar el progreso individual del usuario para esa Work.

---

## Progreso de lectura

El progreso pertenece a:

```text
User + Work
```

Una Work puede encontrarse en uno de dos estados:

```text
Reading
Completed
```

No existe un registro `NotStarted`.

No se crea un registro de progreso para cada Work del sistema. El registro aparece cuando el usuario comienza a leer una Work.

Una Work pasa a `Reading` desde el momento en que el usuario comienza a leerla, incluso si todavía tiene:

```text
0%
```

---

## Porcentaje de lectura

El porcentaje representa cuánto de la Work fue efectivamente leído.

Una página se considera leída **cuando el usuario avanza hacia la siguiente página**.

Ejemplo:

```text
Work: 10 páginas

Página 1 de 10
Progreso: 0%

        ↓ siguiente

Página 2 de 10
Progreso: 10%

        ↓ siguiente

Página 3 de 10
Progreso: 20%
```

La última página no completa automáticamente la Work.

La Work se completa cuando el usuario avanza desde la última página hacia el estado final de lectura.

Ese estado corresponde al formulario de finalización de la Work, que posteriormente permitirá incorporar evaluación y comentario.

El objetivo es que el usuario llegue efectivamente al final de la lectura y no pueda simplemente marcar una Work como completada sin pasar por ella.

---

# Estado de lectura

## Reading

Una Work está en `Reading` cuando el usuario comenzó a leerla pero todavía no alcanzó el final.

Puede tener cualquier porcentaje entre:

```text
0% y 99%
```

## Completed

Una Work está `Completed` cuando el usuario llegó al final de la lectura.

En este estado:

```text
CurrentPage = página posterior a la última página
Progress = 100%
```

La interfaz presenta el estado final de la lectura y el punto de integración para las funcionalidades de evaluación y comentario que pertenecen a una Epic posterior.

---

# Reader

## Acceso

El Reader se abre desde el detalle de una Work mediante una acción **Leer**.

Ruta conceptual:

```text
/works/{id}/read
```

La navegación debe utilizar el router existente de Public Web.

Debe funcionar mediante:

* navegación interna,
* acceso directo mediante URL,
* refresh,
* Back,
* Forward.

---

## Lectura página por página

Las páginas se presentan individualmente.

No existe una vista de dos páginas simultáneas.

Una imagen puede representar visualmente dos páginas de un comic, pero continúa siendo una única página/imagen del sistema.

El Reader no debe interpretar ni dividir artificialmente esa imagen.

---

## Navegación

El usuario puede:

* avanzar una página;
* retroceder una página;
* ir a la primera página;
* ir a la última página.

La navegación debe representar visualmente el concepto de pasar una página.

Debe existir una animación de transición.

Opcionalmente puede existir un sonido de paso de página como parte de la experiencia.

Cuando el usuario solicita ir a la última página, el Reader debe avanzar rápidamente por las páginas necesarias utilizando la misma lógica de navegación, sin crear un salto conceptual que omita el estado de lectura.

---

## Navegación táctil

En Mobile y Tablet se debe soportar navegación mediante gestos:

* swipe hacia la izquierda → siguiente página;
* swipe hacia la derecha → página anterior.

También debe permitirse tocar las zonas laterales de la página para avanzar o retroceder.

---

## Teclado

El Reader debe soportar navegación mediante teclado.

La implementación concreta de las teclas debe definirse en las tareas de implementación, manteniendo como requisito que el usuario pueda controlar la navegación mediante teclado.

---

## Indicador de página

El Reader debe mostrar siempre información equivalente a:

```text
Página 12 de 32
```

No existe navegación directa mediante ingreso de número de página ni slider.

La experiencia buscada es la de un comic físico:

```text
Página actual
    ↓
pasar páginas
    ↓
avanzar
```

Si el usuario quiere llegar rápidamente a una página posterior, puede utilizar la navegación rápida hacia adelante.

---

# Controles del Reader

El Reader debe disponer de controles para:

* navegación;
* página actual;
* zoom;
* pantalla completa;
* modo inmersivo;
* configuración disponible;
* salida del Reader.

Los controles deben poder ocultarse para no interferir con la experiencia de lectura.

Debe existir una interfaz superpuesta/ocultable que permita acceder a los controles sin abandonar el Reader.

---

# Zoom

El Reader debe soportar zoom.

El usuario debe poder utilizar:

* controles de zoom;
* rueda del mouse cuando corresponda;
* pinch/zoom táctil en Mobile y Tablet.

La implementación debe mantener la experiencia de lectura tanto en orientación vertical como horizontal.

---

# Modo inmersivo

El Reader debe contar con un **modo inmersivo**.

El objetivo es permitir que la página ocupe la mayor parte posible de la pantalla y ocultar controles y elementos que interfieran con la lectura.

El usuario debe poder volver a mostrar los controles.

También debe existir soporte para pantalla completa del navegador.

---

# Responsive

El Reader debe funcionar en:

* Mobile vertical;
* Mobile horizontal;
* Tablet vertical;
* Tablet horizontal;
* Desktop/PC.

La experiencia debe estar especialmente optimizada para dispositivos móviles de aproximadamente **480 px de ancho**.

No se establece una orientación obligatoria.

---

# Carga de páginas

Las páginas se sirven individualmente.

El Reader no descarga la Work completa como un único archivo.

Las imágenes pueden ser solicitadas mediante elementos HTML como:

```html
<img src="...">
```

y deben poder cargarse de manera independiente.

La carga de una página no debe bloquear la carga de las demás páginas solicitadas.

Las páginas deben poder comenzar a cargarse anticipadamente siguiendo el orden de lectura, sin esperar a que el usuario llegue físicamente a cada una.

El Reader debe presentar una animación o indicador visual mientras una página está cargando.

---

# Errores de carga

Una falla al cargar una página nunca debe ser silenciosa.

Debe mostrarse un estado de error dentro del Reader, por ejemplo:

```text
No se pudo cargar la página.

[Reintentar]
```

El error no debe sacar al usuario de la aplicación ni provocar la pérdida de su estado de lectura.

---

# Acceso al contenido

Solamente usuarios autenticados pueden utilizar el Reader.

Las páginas individuales deben estar protegidas y solamente ser accesibles por usuarios autenticados.

El contenido se sirve mediante el mecanismo de almacenamiento protegido utilizado por el sistema, basado en Blob Storage.

No se ofrece un mecanismo de descarga de la Work como:

* CBR;
* CBZ;
* PDF;
* otro archivo equivalente.

No se intenta impedir que el usuario utilice mecanismos propios del navegador, como **Guardar imagen como**, sobre una imagen que ya fue entregada al cliente.

No se implementa watermark.

---

# Persistencia del progreso

El Reader debe persistir el progreso del usuario mientras avanza.

El progreso debe registrar como mínimo:

* Work;
* usuario;
* página actual;
* porcentaje;
* fecha de última lectura;
* estado.

El porcentaje puede calcularse a partir de la página, pero puede persistirse para evitar cálculos innecesarios en consultas frecuentes.

La fecha de última lectura es necesaria para ordenar el historial.

---

# Continuar leyendo

El sistema debe permitir continuar una Work desde el punto en que el usuario la dejó.

Desde el detalle de una Work:

```text
Reading
→ Continuar leyendo — Página X
```

En lugar de mostrar solamente:

```text
Leer
```

Cuando el usuario entra a una Work que tiene progreso, el Reader debe abrir directamente en la página correspondiente al progreso almacenado.

Esto debe funcionar independientemente de otras Works que el usuario haya leído.

El usuario puede salir de una Work y continuar posteriormente desde ella, incluso después de haber leído otras Works.

---

# Finalización de una Work

La última página representa el final físico del contenido.

Al avanzar desde la última página, la Work pasa a:

```text
100%
Completed
```

y el Reader presenta el estado final de lectura.

Ese estado será el punto de integración para funcionalidades posteriores de:

* evaluación;
* ranking/rating;
* comentario/review.

Estas funcionalidades **no forman parte de EPIC-04**.

La finalización no debe poder realizarse mediante una acción independiente de "Marcar como leída".

El usuario debe llegar al final de la lectura.

---

# Reapertura de una Work completada

Si una Work está completada y el usuario vuelve a ingresar al Reader, debe abrirse en el estado final:

```text
100%
Completed
```

mostrando el formulario final de la lectura.

No se reinicia automáticamente el progreso.

Si durante una nueva lectura el usuario navega nuevamente hasta la primera página y abandona la lectura desde allí, el progreso vuelve a reflejar la nueva posición:

```text
0%
Reading
```

De esta manera, el progreso siempre representa el estado actual de la lectura.

No existe una acción independiente de "marcar como completada".

Para volver a completar una Work debe volver a recorrerla hasta el final.

---

# Reinicio de una Work

Una Work puede volver a comenzar desde cero mediante la navegación del Reader.

Al llegar a la primera página y posteriormente abandonar la lectura, su progreso será:

```text
0%
Reading
```

No existe un estado separado de `NotStarted`.

---

# Historial

El sistema debe disponer de un historial de lectura.

El historial contiene todas las Works que el usuario:

* está leyendo;
* terminó de leer.

Cada Work aparece una sola vez.

El registro representa el estado actual de lectura de esa Work.

Debe poder ordenarse por:

```text
LastReadAt DESC
```

El historial debe soportar paginación y filtros.

Como mínimo debe poder diferenciar:

```text
Todos
Leyendo
Completados
```

La información visual concreta del historial se definirá en las tareas correspondientes.

---

# Eliminar del historial

El usuario puede quitar una Work del historial.

Eliminar una Work del historial significa eliminar completamente su estado de lectura para ese usuario.

Conceptualmente:

```text
Historial
    ↓
Eliminar Work
    ↓
eliminar progreso
    ↓
eliminar estado Reading/Completed
```

El resultado debe ser equivalente a que el usuario nunca hubiera comenzado a leer esa Work.

Si posteriormente vuelve a entrar a la Work:

```text
Leer
→ página 1
→ 0%
```

---

# Limpiar historial

El usuario puede limpiar todo su historial.

La operación elimina todos los estados de lectura del usuario, tanto:

* Reading;
* Completed.

Después de limpiar el historial, las Works vuelven a comportarse como no iniciadas para ese usuario.

---

# Continuar leyendo

El sistema debe disponer de una sección **Continuar leyendo**.

Debe mostrar exclusivamente Works en estado:

```text
Reading
```

Nunca debe mostrar Works `Completed`.

El orden debe ser:

```text
LastReadAt DESC
```

El endpoint debe permitir que el cliente determine el tamaño de la consulta.

Esto permite utilizarlo tanto para:

* una sección con las últimas 10 Works;
* un carrusel;
* una consulta paginada;
* futuras interfaces equivalentes.

La interfaz principal debe mostrar inicialmente las **últimas 10 Works en lectura**.

Cuando una Work pasa a `Completed`:

```text
Continuar leyendo
        ↓
la Work desaparece
        ↓
Historial → Completados
```

---

# Navegación entre Works

Las Works pueden tener relaciones explícitas:

```text
PreviousWork
NextWork
```

Estas relaciones determinan la navegación secuencial cuando la Work se está leyendo individualmente.

Al llegar:

* al inicio de una Work → puede ofrecerse la Work anterior;
* al final de una Work → puede ofrecerse la Work siguiente.

Cuando existe una Work siguiente, la navegación debe llevar **directamente al Reader**, sin pasar nuevamente por el detalle.

Cuando existe una Work anterior, debe ocurrir lo mismo.

La Work destino debe abrirse en su propio estado de lectura:

* si nunca fue leída → página 1;
* si está `Reading` → última posición registrada;
* si está `Completed` → estado final de lectura.

La navegación no depende de que la Work anterior o siguiente esté completada.

---

# Contexto de lectura

El Reader debe conceptualizarse como un componente capaz de trabajar con distintos contextos de lectura.

En EPIC-04 se implementa solamente:

```text
Work
```

El diseño debe evitar que el Reader quede arquitectónicamente acoplado de manera innecesaria a una única Work.

En una Epic posterior se reutilizará el mismo Reader para otros contextos, particularmente **Lists**.

Una List podrá actuar conceptualmente como una unidad de lectura:

```text
List
   ↓
orden de Works
   ↓
Reader
```

En ese contexto, el orden de navegación será determinado por la List y no por `PreviousWork` / `NextWork`.

La lectura de Lists, su progreso, su navegación específica y su experiencia de miniaturas quedan **fuera de EPIC-04**.

---

# Visibilidad del contenido

El usuario nunca debe visualizar una Work que esté desactivada.

Esto incluye:

* catálogo;
* detalle;
* Reader;
* historial;
* continuar leyendo;
* cualquier otra consulta de usuario.

La misma regla aplica transitivamente a contenido cuyo contexto haya sido desactivado.

Por ejemplo, si se desactiva una Series, el usuario deja de visualizar las Works pertenecientes a esa Series.

Si posteriormente la Series vuelve a activarse, el contenido vuelve a ser visible.

El progreso e historial pueden permanecer almacenados internamente mientras el contenido está desactivado, pero no deben ser visibles para el usuario.

---

# Administradores

Los administradores utilizan el mismo Reader y las mismas reglas de lectura que cualquier usuario autenticado.

No existe una experiencia de lectura diferenciada para administradores.

---

# Responsive y experiencia de usuario

Toda la experiencia debe ser responsive para:

* Mobile;
* Tablet;
* Desktop/PC.

El Reader debe priorizar especialmente la experiencia en Mobile.

Los controles deben ser accesibles sin interferir permanentemente con la lectura.

El contenido debe ocupar el espacio disponible de manera apropiada para cada orientación.

---

# Alcance de EPIC-04

## Incluye

* Reader de Works.
* Lectura página por página.
* Navegación anterior/siguiente.
* Primera y última página.
* Animación de cambio de página.
* Soporte táctil.
* Swipe.
* Toque lateral para navegar.
* Teclado.
* Zoom.
* Pantalla completa.
* Modo inmersivo.
* Controles ocultables.
* Carga individual de páginas.
* Carga independiente y anticipada.
* Estados de carga.
* Reintento ante errores.
* Acceso autenticado a páginas.
* Persistencia del progreso.
* Estados Reading / Completed.
* Porcentaje de lectura.
* Continuar leyendo.
* Historial.
* Filtros de historial.
* Paginación de historial.
* Eliminación individual del historial.
* Limpieza completa del historial.
* Navegación directa hacia PreviousWork / NextWork.
* Integración con el estado final de lectura.
* Preparación del Reader para futuros contextos de lectura.

## Fuera de alcance

* Lectura de Lists.
* Reader específico para Lists.
* Miniaturas de Works dentro del Reader.
* Orden de lectura de Lists.
* Progreso de Lists.
* Arcos argumentales como contexto de lectura.
* Crossovers como contexto de lectura.
* Ratings.
* Reviews.
* Comentarios.
* Favoritos.
* Listas personales del usuario.
* Listas públicas o compartidas.
* Notas sobre páginas.
* Anotaciones.
* Recomendaciones.
* Funcionalidades sociales.
* Descarga de CBR/CBZ/PDF.
* Watermarks.
* Protección contra "Guardar imagen como".
* Administración de contenido.
* Procesamiento CBR.
* Funcionalidades de IA.

Las funcionalidades de interacción del usuario con el sistema —evaluar, comentar, favoritos, listas personales y notas sobre páginas— serán abordadas en la Epic posterior correspondiente.

---

# Resultado esperado

Al finalizar EPIC-04, un usuario autenticado podrá:

1. Entrar al detalle de una Work.
2. Seleccionar **Leer**.
3. Leer la Work página por página.
4. Utilizar teclado, controles táctiles y gestos.
5. Utilizar zoom y pantalla completa.
6. Ocultar los controles para obtener una experiencia inmersiva.
7. Salir de la lectura en cualquier momento.
8. Volver posteriormente y continuar desde su última posición.
9. Consultar cuánto de cada Work lleva leído.
10. Ver sus Works en lectura desde **Continuar leyendo**.
11. Consultar todas sus Works leídas y en lectura desde **Historial**.
12. Filtrar y paginar su historial.
13. Eliminar una Work del historial y perder completamente su progreso.
14. Limpiar todo su historial.
15. Completar una Work llegando al final de su lectura.
16. Acceder posteriormente al estado final de una Work completada.
17. Navegar directamente hacia la Work anterior o siguiente cuando exista.
18. Mantener una experiencia consistente en Mobile, Tablet y Desktop.
19. No visualizar nunca contenido que haya sido desactivado.
20. Utilizar un Reader que pueda reutilizarse posteriormente para otros contextos de lectura.

# US derivadas

La descomposición concreta en US se realizará posteriormente. Como mínimo, EPIC-04 deberá contemplar separadamente:

* **Reader de Work**
* **Persistencia y cálculo del progreso**
* **Continuar leyendo**
* **Historial de lectura**
* **Finalización de lectura**
* **Navegación secuencial entre Works**
* **Experiencia responsive/inmersiva del Reader**

Las US deberán definir el comportamiento funcional concreto sin introducir funcionalidades pertenecientes a otras Epics.
