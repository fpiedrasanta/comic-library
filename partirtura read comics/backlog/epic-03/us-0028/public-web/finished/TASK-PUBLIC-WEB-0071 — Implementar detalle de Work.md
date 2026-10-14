# TASK-PUBLIC-WEB-0071 — Implementar detalle de Work

## Objetivo

Implementar en Public Web la pantalla de consulta del detalle de una Work definida en `US-0028 — Consultar detalle de una Work`.

La pantalla debe consumir el endpoint:

```text
GET /api/works/{id}
```

y presentar toda la información definida por el contrato público de `CatalogWorkDetailDto`.

---

## Referencia visual

Utilizar como referencia visual el siguiente template:

```text
C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\detalle-obra.html
```

### IMPORTANTE

El HTML es **únicamente una guía visual**.

No constituye un contrato funcional ni arquitectónico.

El comportamiento de la pantalla debe implementarse exclusivamente según:

1. `US-0028`;
2. el contrato real del Backend;
3. la arquitectura existente de Public Web;
4. los componentes y patrones ya implementados en el proyecto.

No copiar literalmente el HTML si eso contradice la arquitectura de componentes existente.

El resultado debe **mantener el estilo visual de las pantallas que ya venimos implementando** para Catalog, Publisher, Franchise, Series y Lists.

---

## Ruta

Implementar:

```text
/works/:id
```

La ruta debe integrarse con el router existente.

Debe funcionar correctamente mediante:

* navegación desde otra pantalla;
* acceso directo mediante URL;
* refresh;
* navegación Back/Forward del navegador.

---

## API

Consumir:

```text
GET /api/works/{id}
```

El endpoint requiere autenticación.

Utilizar el mecanismo de acceso a API y autenticación existente en Public Web.

No crear un mecanismo paralelo de autenticación o consumo HTTP.

---

## Información de la Work

Mostrar:

* Cover;
* Title;
* Number, si existe;
* Description;
* Language;
* WorkType;
* PublicationDate.

La información principal debe respetar la jerarquía visual definida por el diseño.

No mostrar placeholders ficticios cuando un dato opcional no exista.

---

## Contexto editorial

Mostrar:

* Publisher;
* Franchise;
* Series.

Cada contexto contiene:

```text
Id
Name
Color
UrlCover
```

Utilizar los patrones visuales existentes para estos contextos.

Los elementos deben ser navegables hacia:

```text
/publishers/:id
/franchises/:id
/series/:id
```

No realizar consultas adicionales por cada contexto.

Toda la información necesaria llega en el detalle de la Work.

---

## PreviousWork / NextWork

Mostrar las relaciones de secuencia cuando existan.

Cada una contiene:

```text
Id
Title
NumberValue
UrlCover
```

Representarlas utilizando un componente visual reutilizable para navegación entre Works.

Al seleccionar una Work anterior o siguiente:

```text
/works/:id
```

La pantalla debe cargar el detalle de la nueva Work utilizando el mismo componente/página.

No crear una segunda página ni una variante funcional de la pantalla.

Si PreviousWork o NextWork es `null`, no mostrar un bloque vacío.

---

## PersonAssignments

Mostrar todas las asignaciones:

```text
Person
Role
```

Debe conservarse cada asignación individual.

Una misma Persona puede aparecer varias veces con distintos Roles.

Ejemplo:

```text
Steve Ditko
Penciller

Steve Ditko
Inker
```

No eliminar duplicados ni agruparlos de una manera que pierda la relación Persona → Role.

---

## Tags

Mostrar todos los Tags recibidos por el Backend.

Reutilizar el componente o patrón visual de Tags existente.

No agregar funcionalidades de búsqueda o filtrado.

---

## Componentización y reutilización

### IMPORTANTE

La implementación debe estar **orientada a componentes y a la reutilización**.

No generar un componente enorme con todo el markup de la pantalla.

Identificar y reutilizar componentes existentes antes de crear nuevos.

Como mínimo, evaluar la reutilización de componentes/patrones para:

* Cover;
* Contexto editorial;
* Pills;
* Tags;
* Work navigation;
* Person/Role assignments;
* Loading;
* Error;
* Not Found.

Si un componente equivalente ya existe, **reutilizarlo**.

Si no existe y el patrón puede utilizarse en otras pantallas, crear un componente reutilizable en lugar de resolverlo únicamente dentro de esta página.

Evitar:

* duplicación de JSX;
* estilos duplicados;
* lógica duplicada;
* componentes funcionalmente equivalentes con nombres diferentes;
* markup repetido para Publisher/Franchise/Series;
* variantes innecesarias de WorkCard.

---

## Cover

La Cover principal representa una portada de cómic, no un logo.

Mantener el tratamiento visual definido para las portadas del proyecto.

Utilizar:

```text
object-fit: cover
```

cuando corresponda al diseño.

Debe respetarse:

* proporción visual de portada;
* bordes redondeados;
* integración con la identidad visual de la Work.

No reutilizar el tratamiento de `object-contain` utilizado para logos de Publisher/Franchise/Series.

---

## WorkCard

No crear una variante nueva de `WorkCard` únicamente para esta pantalla.

Si `WorkCard` existente puede reutilizarse para algún contexto visual, hacerlo.

Para PreviousWork/NextWork utilizar el componente apropiado para navegación de Works si existe o crear uno reutilizable si resulta necesario.

---

## Estados

Implementar los estados:

### Loading

Mientras se obtiene el detalle.

Debe utilizar los patrones de loading existentes.

### Data

Mostrar el detalle completo.

### Not Found

Cuando el Backend responda `404`.

Mostrar un estado específico de recurso no encontrado.

### Error

Para errores inesperados de API o comunicación.

Utilizar el patrón de error existente.

No implementar estados alternativos específicos para funcionalidades fuera de esta User Story.

---

## Responsive

La pantalla debe funcionar correctamente en:

* Mobile;
* Tablet;
* PC/Desktop.

Mantener los criterios responsive utilizados por las pantallas anteriores.

No crear implementaciones independientes por dispositivo.

---

## Navegación

La pantalla debe permitir navegar visualmente hacia:

* Publisher;
* Franchise;
* Series;
* PreviousWork;
* NextWork.

Las navegaciones deben utilizar el router existente.

Para PreviousWork/NextWork, la misma pantalla debe ser reutilizada con el nuevo `id`.

---

## Datos

No hardcodear datos de la Work.

Los datos mostrados deben provenir exclusivamente del endpoint:

```text
GET /api/works/{id}
```

No realizar consultas individuales para obtener:

* Publisher;
* Franchise;
* Series;
* PreviousWork;
* NextWork;
* Person;
* Role;
* Tags.

El Backend ya entrega estas relaciones dentro del detalle.

---

## Fuera de alcance

No implementar:

* Reader;
* descarga;
* progreso;
* historial;
* favoritos;
* Save for later;
* ratings;
* reviews;
* comentarios;
* recomendaciones;
* estadísticas personales;
* anotaciones;
* edición administrativa;
* procesamiento CBR;
* IA;
* búsqueda;
* filtros;
* ordenamiento;
* cualquier funcionalidad de lectura.

---

## Validación

La task se considera completa cuando:

* [ ] Existe la ruta `/works/:id`.
* [ ] La pantalla consume `GET /api/works/{id}`.
* [ ] Requiere autenticación mediante el mecanismo existente.
* [ ] Se muestra Cover.
* [ ] Se muestra Title.
* [ ] Number se muestra solo cuando existe.
* [ ] Se muestran Description, Language, WorkType y PublicationDate.
* [ ] Se muestran Publisher, Franchise y Series.
* [ ] Los contextos muestran Cover, Name y Color.
* [ ] Publisher, Franchise y Series permiten navegar a sus páginas correspondientes.
* [ ] Se muestra PreviousWork cuando existe.
* [ ] Se muestra NextWork cuando existe.
* [ ] PreviousWork y NextWork navegan mediante `/works/:id`.
* [ ] Se muestran todas las PersonAssignments.
* [ ] Se conserva una misma Persona con múltiples Roles.
* [ ] Se muestran los Tags.
* [ ] Se implementan Loading, Data, Not Found y Error.
* [ ] La pantalla es responsive.
* [ ] Funciona con refresh y Back/Forward.
* [ ] Se mantiene el estilo visual de las pantallas existentes.
* [ ] Se reutilizan componentes existentes siempre que sea posible.
* [ ] Los nuevos componentes potencialmente reutilizables se implementan como componentes reutilizables.
* [ ] No existe duplicación innecesaria de componentes, JSX o estilos.
* [ ] El template `detalle-obra.html` se utiliza únicamente como referencia visual.
* [ ] La implementación funcional respeta `US-0028` y el contrato real del Backend.
* [ ] No se incorpora funcionalidad fuera del alcance.
