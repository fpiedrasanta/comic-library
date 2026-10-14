# EPIC-03 — Exploración y navegación del catálogo

## Objetivo

Permitir que los usuarios exploren y naveguen el catálogo de Comics Library de forma visual, contextual y jerárquica, partiendo de los Works o navegando a través de Editoriales, Franquicias y Series.

Esta épica se limita exclusivamente a **descubrir y navegar el catálogo**.

No incluye lectura de comics, progreso de lectura, favoritos, guardar para leer después, comentarios privados por página, puntuaciones, comentarios públicos, recomendaciones ni Listas.

---

## Alcance

La épica contempla:

* Catálogo general de Works.
* Búsqueda de Works.
* Filtrado por Editorial, Franquicia y Serie.
* Cascada bidireccional entre Editorial → Franquicia → Serie.
* Ordenamiento de Works.
* Scroll infinito.
* Persistencia del estado de navegación mediante URL.
* Cards reutilizables para Works.
* Navegación hacia Editorial, Franquicia y Serie desde las Works.
* Índice de Editoriales.
* Índice de Franquicias.
* Índice de Series.
* Páginas contextuales de Editorial, Franquicia y Serie.
* Diseño responsive obligatorio para mobile, tablet y PC.

---

# 1. Navegación del catálogo

La navegación principal del catálogo debe permitir acceder a:

```text
Catálogo
Editoriales
Franquicias
Series
```

Las rutas conceptuales son:

```text
/catalog

/publishers
/publishers/:id

/franchises
/franchises/:id

/series
/series/:id
```

La navegación debe permitir desplazarse desde cualquiera de estos niveles hacia Works y desde una Work regresar a su contexto de Editorial, Franquicia o Serie.

---

# 2. WorksPage única y reutilizable

Debe existir una única experiencia de listado de Works.

Las siguientes rutas utilizan la misma página/componente de listado:

```text
/catalog
/publishers/:id
/franchises/:id
/series/:id
```

No deben implementarse páginas independientes como:

```text
CatalogWorksPage
PublisherWorksPage
FranchiseWorksPage
SeriesWorksPage
```

La página de Works debe recibir el contexto correspondiente y adaptar únicamente:

* encabezado;
* filtros preseleccionados;
* filtros visibles/ocultos;
* conjunto de resultados.

El listado, búsqueda, ordenamiento, scroll infinito y Work Cards deben ser compartidos.

### 2.1 Catálogo general

Ruta:

```text
/catalog
```

No muestra encabezado contextual.

Filtros visibles:

```text
Publisher
Franchise
Series
```

Search:

```text
Title
Summary
Number.Value
Tags
Person
```

Resultados:

```text
Todos los Works
```

Ordenamiento inicial:

```text
UploadedAt DESC
```

Es decir, las Works subidas más recientemente aparecen primero. La fecha de subida no representa necesariamente la fecha de publicación de la obra.

---

# 3. Búsqueda

El catálogo debe disponer de un único campo de búsqueda libre.

La búsqueda debe ser:

* parcial;
* case-insensitive;
* basada inicialmente en `LIKE '%search%'`;
* sin búsqueda por múltiples términos independientes.

La búsqueda debe considerar:

```text
Work.Title
Work.Summary
Work.Number.Value
Work.Tags
Person
```

La búsqueda por Person debe encontrar Works relacionadas con la persona independientemente del Role que tenga dentro de la Work.

No se incorpora en esta épica un filtro independiente por Role.

La búsqueda se combina con los filtros estructurales activos.

Conceptualmente:

```text
Search
AND
Publisher
AND
Franchise
AND
Series
```

---

# 4. Filtros Publisher → Franchise → Series

Los filtros estructurales son:

```text
Publisher
Franchise
Series
```

La relación entre ellos debe ser una cascada bidireccional.

## 4.1 Cascada descendente

Al seleccionar una Editorial:

```text
Publisher
    ↓
Franchise
    ↓
Series
```

El filtro Franchise debe mostrar únicamente franquicias compatibles con la Editorial seleccionada.

Al seleccionar una Franchise, el filtro Series debe mostrar únicamente series compatibles con esa Franchise.

Cada modificación debe actualizar inmediatamente los Works mostrados.

---

## 4.2 Cascada ascendente

Los filtros también deben poder determinar sus ancestros.

Por ejemplo, al buscar y seleccionar:

```text
Series:
Amazing Spider-Man
```

el sistema debe completar automáticamente:

```text
Publisher:
Marvel

Franchise:
Spider-Man

Series:
Amazing Spider-Man
```

El autocomplete de Series debe mostrar resultados encontrados mediante `LIKE '%search%'`.

Cuando sea necesario para identificar el resultado, puede mostrar contexto visual secundario:

```text
Amazing Spider-Man
Franquicia: Spider-Man
Editorial: Marvel
```

---

## 4.3 Reglas de limpieza

La limpieza de filtros debe respetar la jerarquía.

### Al eliminar Series

No se deben eliminar los filtros superiores:

```text
Publisher: Marvel
Franchise: Spider-Man
Series: [vacío]
```

### Al eliminar Franchise

Debe eliminarse Series:

```text
Publisher: Marvel
Franchise: [vacío]
Series: [vacío]
```

### Al eliminar Publisher

Deben eliminarse Franchise y Series:

```text
Publisher: [vacío]
Franchise: [vacío]
Series: [vacío]
```

---

# 5. Autocomplete de filtros

Publisher, Franchise y Series deben utilizar selección mediante autocomplete.

La búsqueda del autocomplete debe ser parcial y case-insensitive:

```text
LIKE '%search%'
```

La selección de una entidad es necesaria para aplicar el filtro.

Escribir texto sin seleccionar una opción no debe modificar el listado de Works.

Los resultados del autocomplete deben poder mostrar contexto secundario de forma visual y estética cuando sea necesario.

Ejemplo:

```text
---------------------------------------
Amazing Spider-Man

Franquicia: Spider-Man
Editorial: Marvel
---------------------------------------
```

---

# 6. Ordenamiento

El listado de Works debe permitir seleccionar:

```text
Ordenar por:
    Título
    Fecha de publicación
    Fecha de subida
    Número
```

Y:

```text
Dirección:
    Ascendente
    Descendente
```

El valor inicial debe ser:

```text
Ordenar por: Fecha de subida
Dirección: Descendente
```

---

# 7. Resultados y scroll infinito

El listado de Works no utilizará paginación tradicional ni un botón "Ver más".

Debe utilizar:

> **Scroll infinito**

La carga de resultados adicionales debe mantener:

* filtros actuales;
* búsqueda actual;
* ordenamiento actual;
* contexto actual.

---

# 8. Work Card

Todas las Works deben representarse mediante un componente reutilizable.

La card debe mostrar:

```text
┌──────────────────────────────┐
│ [Editorial]                  │
│ [Franquicia]                 │
│ [Serie]                      │
│                              │
│          PORTADA             │
│                              │
│                              │
│                              │
├──────────────────────────────┤
│            NUMBER            │
│ TITLE                        │
│                              │
│ Publicado:       Subido:     │
└──────────────────────────────┘
```

Las pills de Editorial, Franchise y Series deben utilizar el color configurado para cada entidad en la base de datos.

Cada pill debe permitir navegar a la entidad correspondiente.

Si una Work no tiene Number, no debe mostrarse un campo vacío ni un placeholder textual.

Debe reservarse el espacio visual necesario para mantener una altura uniforme de las cards.

Ejemplo:

```text
┌──────────────────────────────┐
│ [Editorial]                  │
│ [Franquicia]                 │
│ [Serie]                      │
│                              │
│          PORTADA             │
│                              │
│                              │
│                              │
├──────────────────────────────┤
│                              │
│ TITLE                        │
│                              │
│ Publicado:       Subido:     │
│                              │
└──────────────────────────────┘
```

---

# 9. Página contextual de Publisher

Ruta:

```text
/publishers/:id
```

Utiliza la misma WorksPage.

Debe mostrar un encabezado contextual con:

* imagen del Publisher;
* nombre del Publisher.

El filtro Publisher debe aparecer:

* preseleccionado;
* oculto al usuario.

Los filtros Franchise y Series permanecen disponibles.

Los resultados son las Works pertenecientes al Publisher.

---

# 10. Página contextual de Franchise

Ruta:

```text
/franchises/:id
```

Utiliza la misma WorksPage.

Debe mostrar un encabezado contextual con:

* imagen de la Franchise;
* nombre de la Franchise;
* Publisher al que pertenece.

Los filtros deben quedar:

```text
Publisher  → preseleccionado y oculto
Franchise  → preseleccionado y oculto
Series     → visible
```

Los resultados son las Works pertenecientes a la Franchise.

---

# 11. Página contextual de Series

Ruta:

```text
/series/:id
```

Utiliza la misma WorksPage.

Debe mostrar un encabezado contextual con:

* imagen de la Series;
* nombre de la Series;
* Publisher;
* Franchise.

Los filtros deben quedar:

```text
Publisher  → preseleccionado y oculto
Franchise  → preseleccionado y oculto
Series     → preseleccionado y oculto
```

No se muestran filtros estructurales adicionales porque Series es el nivel más específico de la jerarquía.

El Search permanece disponible.

Los resultados son las Works pertenecientes a la Series.

---

# 12. Índice de Publishers

Ruta:

```text
/publishers
```

Debe existir una página independiente para listar Publishers.

Debe disponer de:

* Search;
* listado de Publishers;
* navegación hacia cada Publisher.

La card de Publisher debe utilizar el color configurado para el Publisher como color de borde.

Conceptualmente:

```text
┌──────────────────────────────┐
│                              │
│                              │
│          IMAGEN              │
│                              │
│                              │
├──────────────────────────────┤
│ Nombre                       │
└──────────────────────────────┘
```

Al seleccionar un Publisher:

```text
/publishers/:id
```

---

# 13. Índice de Franchises

Ruta:

```text
/franchises
```

Debe existir una página independiente para listar Franchises.

Debe disponer de:

* Search;
* listado de Franchises;
* navegación hacia cada Franchise.

La card debe mostrar:

* Publisher;
* imagen;
* nombre de Franchise.

El borde debe utilizar el color configurado para la Franchise.

La pill de Publisher debe utilizar el color configurado para el Publisher.

Conceptualmente:

```text
┌──────────────────────────────┐
│ [Publisher]                 │
│                              │
│          IMAGEN              │
│                              │
│                              │
├──────────────────────────────┤
│ Nombre Franchise             │
└──────────────────────────────┘
```

Al seleccionar una Franchise:

```text
/franchises/:id
```

---

# 14. Índice de Series

Ruta:

```text
/series
```

Debe existir una página independiente para listar Series.

Debe disponer de:

* Search;
* listado de Series;
* navegación hacia cada Series.

La card debe mostrar:

* Publisher;
* Franchise;
* imagen;
* nombre de Series.

El borde debe utilizar el color configurado para la Series.

Las pills de Publisher y Franchise deben utilizar sus respectivos colores configurados en la base de datos.

Conceptualmente:

```text
┌──────────────────────────────┐
│ [Publisher]                 │
│ [Franchise]                │
│                              │
│          IMAGEN              │
│                              │
│                              │
├──────────────────────────────┤
│ Nombre Series                │
└──────────────────────────────┘
```

Al seleccionar una Series:

```text
/series/:id
```

---

# 15. URL como estado de navegación

El estado de navegación de las páginas de Works debe estar representado en la URL.

Debe incluir, cuando corresponda:

* Search;
* Publisher;
* Franchise;
* Series;
* ordenamiento;
* dirección;
* contexto.

Ejemplo:

```text
/catalog?publisher=2&franchise=8&series=42&search=spiderman&sort=title&direction=asc
```

Esto debe permitir:

* utilizar Back/Forward del navegador;
* refrescar la página conservando el estado;
* compartir una URL con una búsqueda concreta;
* navegar entre contextos sin perder el estado correspondiente.

---

# 16. Responsive obligatorio

Toda la épica debe diseñarse e implementarse para:

* Mobile;
* Tablet;
* PC/Desktop.

La adaptación responsive es obligatoria para todas las pantallas y componentes de la épica.

Debe contemplar especialmente:

* navegación;
* encabezados contextuales;
* filtros;
* autocompletes;
* búsqueda;
* cards;
* grillas;
* scroll infinito;
* índices de Publishers, Franchises y Series;
* navegación entre contextos.

No deben crearse implementaciones paralelas de las mismas páginas para distintos tamaños de pantalla.

---

# 17. Reutilización y restricciones arquitectónicas

Debe priorizarse la reutilización de componentes y páginas.

Especialmente:

* Una única WorksPage.
* Una única Work Card.
* Componentes compartidos para búsqueda.
* Componentes compartidos para filtros.
* Componentes compartidos para autocompletes.
* Componentes compartidos para encabezados contextuales cuando sea posible.

Las páginas de:

```text
Publishers
Franchises
Series
```

pueden ser independientes porque representan entidades diferentes y tienen necesidades de presentación diferentes.

No debe duplicarse la experiencia de listado de Works para cada contexto.

Un cambio visual o funcional en el listado de Works debe poder realizarse en un único lugar.

---

# 18. Fuera de alcance

Esta épica NO incluye:

* lectura de páginas;
* reader;
* progreso de lectura;
* historial;
* favoritos;
* guardar para leer después;
* wishlist;
* comentarios privados por página;
* puntuaciones públicas;
* comentarios públicos;
* recomendaciones;
* Listas;
* Arcos como mecanismo de navegación adicional;
* Crossovers como mecanismo de navegación adicional;
* funcionalidades sociales.

Estas funcionalidades podrán utilizar posteriormente las Works descubiertas mediante esta épica.

---

# 19. Resultado esperado

Al finalizar esta épica, un usuario debe poder:

1. Entrar al catálogo y ver las Works más recientemente subidas.
2. Buscar Works por título, resumen, número, tags o persona.
3. Filtrar por Publisher, Franchise y Series.
4. Combinar búsqueda y filtros.
5. Navegar la cascada Publisher → Franchise → Series.
6. Seleccionar una Series y completar automáticamente su Franchise y Publisher.
7. Eliminar filtros respetando las reglas de cascada definidas.
8. Ordenar los resultados.
9. Recorrer resultados mediante scroll infinito.
10. Navegar desde una Work hacia su Publisher, Franchise o Series.
11. Navegar desde un Publisher hacia sus Works.
12. Navegar desde una Franchise hacia sus Works.
13. Navegar desde una Series hacia sus Works.
14. Explorar índices independientes de Publishers, Franchises y Series.
15. Utilizar Back/Forward y URLs compartibles conservando el estado de navegación.
16. Realizar todo lo anterior desde Mobile, Tablet o PC/Desktop.

La épica debe dejar preparada la navegación del catálogo como base para las futuras funcionalidades de lectura y participación del usuario, sin incorporarlas todavía.
