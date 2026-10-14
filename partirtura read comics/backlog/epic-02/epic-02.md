# EPIC-02 — Gestión del catálogo y contenido editorial

## Tipo

Epic funcional.

## Objetivo

Permitir que los administradores construyan, mantengan y organicen el catálogo de Comic Library.

La Epic establece las capacidades necesarias para registrar las entidades que conforman el catálogo, relacionarlas correctamente y mantener la información editorial y narrativa de las obras.

El catálogo constituye la fuente única de información utilizada posteriormente por las funcionalidades públicas de exploración, búsqueda, lectura, recomendaciones y estadísticas.

La Epic también comprende la incorporación de obras digitales mediante archivos CBR, su procesamiento y la generación de las páginas individuales necesarias para la lectura.

## Alcance

La Epic comprende:

- Gestión de editoriales.
- Gestión de franquicias.
- Gestión de series.
- Gestión de números.
- Gestión de novelas gráficas.
- Gestión de personas.
- Gestión de roles.
- Gestión de idiomas.
- Gestión de etiquetas.
- Gestión de listas administradas.
- Gestión de tipos de lista.
- Gestión de relaciones entre listas y números.
- Gestión de relaciones de continuidad entre números.
- Importación de obras digitales mediante archivos CBR.
- Procesamiento de archivos CBR.
- Extracción de páginas.
- Conversión de páginas a WebP.
- Almacenamiento individual de páginas.
- Registro de las páginas asociadas a cada obra.
- Validación de integridad de las relaciones del catálogo.
- Administración exclusiva del contenido por parte del administrador.

## Principios del catálogo

### Fuente única

Cada entidad del catálogo debe existir una única vez.

Las relaciones entre entidades deben utilizar referencias a los registros existentes y nunca duplicar información.

Por ejemplo, un número no debe contener una copia de la información de su serie, editorial o personas participantes.

### Separación de responsabilidades

Las entidades del catálogo representan conceptos diferentes y no deben utilizarse para resolver responsabilidades que pertenecen a otras entidades.

Una franquicia agrupa series.

Una serie establece la continuidad de sus números.

Un número representa una publicación individual.

Una lista establece una agrupación y orden de lectura independiente de la continuidad de una serie.

### Administración exclusiva

Durante la primera versión, únicamente los usuarios con rol `Administrator` pueden crear, modificar o eliminar información del catálogo.

Los usuarios públicos pueden consultar el catálogo, pero no modificarlo.

## Entidades

### Editorial

El administrador debe poder crear, consultar, modificar y desactivar editoriales.

Una editorial representa la empresa responsable de una publicación.

La desactivación de una editorial no debe eliminar los números asociados.

No debe ser posible eliminar físicamente una editorial cuando existan referencias a ella.

### Franquicia

El administrador debe poder crear, consultar, modificar y desactivar franquicias.

Una franquicia agrupa series relacionadas.

Una franquicia no representa personajes individuales.

Una serie debe pertenecer a una franquicia.

La desactivación de una franquicia no debe eliminar sus series ni números.

### Serie

El administrador debe poder crear, consultar, modificar y desactivar series.

Una serie representa una publicación o continuidad numerada.

Una serie pertenece a una franquicia.

Una serie puede contener múltiples números.

La continuidad de una serie debe mantenerse mediante relaciones explícitas entre sus números.

La desactivación de una serie no debe eliminar físicamente sus números.

### Número

El administrador debe poder crear, consultar, modificar y desactivar números.

Un número es una unidad individual de publicación y lectura.

Debe poder asociarse con:

- Serie.
- Editorial.
- Idioma.
- Personas.
- Roles.
- Etiquetas.
- Portada.
- Archivo digital procesado.
- Páginas.

Un número puede tener una relación explícita con un número anterior y otro posterior dentro de su continuidad.

La existencia de estas relaciones no debe asumirse automáticamente a partir del número editorial.

### Novela gráfica

El administrador debe poder crear, consultar, modificar y desactivar novelas gráficas.

Una novela gráfica representa una obra independiente que no requiere pertenecer a una serie numerada.

Debe poder contener la información necesaria para su consulta y lectura.

Una novela gráfica puede tener relaciones de navegación adicionales, pero no debe asumir una continuidad numerada.

### Persona

El administrador debe poder crear, consultar, modificar y desactivar personas.

Una persona puede participar en múltiples números.

La relación entre una persona y un número debe indicar el rol desempeñado.

Una misma persona puede desempeñar múltiples roles dentro del mismo número.

### Rol

Los roles deben ser entidades administrables.

Los roles iniciales son:

- Guionista.
- Dibujante.
- Entintador.
- Colorista.
- Portadista.
- Traductor.
- Editor.

Los roles no deben estar definidos exclusivamente como valores rígidos dentro del código.

El administrador debe poder consultar y gestionar los roles disponibles.

### Idioma

El administrador debe poder crear, consultar, modificar y desactivar idiomas.

Los idiomas representan las versiones lingüísticas de las obras disponibles en el catálogo.

Un idioma utilizado por una obra no debe poder eliminarse físicamente de forma que se rompan las referencias existentes.

### Etiqueta

El administrador debe poder crear, consultar, modificar y desactivar etiquetas.

Las etiquetas permiten clasificar temáticamente o narrativamente los números.

Un número puede tener múltiples etiquetas.

Una etiqueta puede estar asociada a múltiples números.

La eliminación o desactivación de una etiqueta no debe eliminar los números asociados.

## Listas administradas

El administrador debe poder gestionar agrupaciones de números.

Las listas iniciales son:

- Arco.
- Crossover.

Una lista contiene referencias a números existentes y mantiene un orden explícito.

Una lista no duplica los números que contiene.

### Tipos de lista

Los tipos de lista deben ser administrables.

Inicialmente deben existir:

- Arco.
- Crossover.

El tipo de lista determina la naturaleza de la agrupación.

### Lista

El administrador debe poder:

- Crear una lista.
- Consultar una lista.
- Modificar una lista.
- Eliminar una lista.
- Definir su tipo.
- Definir su nombre.
- Definir su descripción.
- Definir su portada.
- Agregar números.
- Quitar números.
- Modificar el orden de los números.

Una lista debe poder contener números pertenecientes a diferentes series.

El orden de los números dentro de una lista es independiente de la continuidad de sus respectivas series.

### Integridad de listas

Los elementos de una lista deben referenciar números existentes.

No deben existir elementos huérfanos.

El orden de lectura debe ser explícito.

Un mismo número puede formar parte de múltiples listas.

Eliminar una lista no debe eliminar los números que la componen.

## Continuidad

El administrador debe poder establecer relaciones de continuidad entre números.

Una relación debe permitir identificar:

- Número anterior.
- Número siguiente.

Las relaciones deben representar únicamente continuidad dentro del catálogo y no deben confundirse con el orden de una lista.

Una relación de continuidad no debe duplicar ni modificar los números involucrados.

No todos los números necesitan tener un número anterior o siguiente.

La continuidad debe poder modificarse cuando sea necesario corregir o actualizar la información editorial.

## Importación de obras digitales

El administrador debe poder incorporar una obra digital mediante un archivo CBR.

El procesamiento esperado es:

```text
Archivo CBR
    ↓
Validación
    ↓
Descompresión
    ↓
Extracción de páginas
    ↓
Conversión a WebP
    ↓
Almacenamiento de páginas
    ↓
Registro de páginas
    ↓
Obra disponible para lectura
```

El archivo CBR original no debe ser necesario para la lectura posterior de la obra.

Las páginas deben almacenarse individualmente.

Cada página debe poder asociarse inequívocamente con su obra y posición dentro de ella.

El sistema debe registrar como mínimo:

- Identificador de página.
- Obra asociada.
- Orden de la página.
- Ubicación física o referencia al archivo almacenado.

El procesamiento debe permitir que posteriormente el lector solicite una página individual sin descargar la obra completa.

## Integridad de las obras digitales

Una obra no debe considerarse disponible para lectura hasta que su procesamiento haya finalizado correctamente.

El sistema debe evitar que una importación incompleta genere una obra aparentemente disponible.

Los errores producidos durante el procesamiento deben poder identificarse.

El procesamiento debe evitar dejar información inconsistente entre:

- Obra.
- Archivo.
- Páginas.
- Índices de páginas.

## Portadas

Las obras y agrupaciones que requieran representación visual deben poder tener una portada asociada.

La portada debe mantenerse como recurso administrado por la aplicación.

Las imágenes del catálogo son recursos privados y no deben exponerse mediante almacenamiento público directo.

## Búsqueda y consulta administrativa

El administrador debe poder consultar las entidades del catálogo desde el Dashboard.

Los listados administrativos deben permitir, cuando corresponda:

- Búsqueda.
- Filtrado.
- Ordenamiento.
- Paginación.

Los criterios concretos de búsqueda de cada entidad serán definidos durante la especificación de las User Stories correspondientes.

La consulta administrativa no debe modificar información.

## Reglas de integridad

El sistema debe impedir relaciones inválidas entre entidades.

Como mínimo:

- Una serie debe referenciar una franquicia existente.
- Un número debe referenciar una serie existente cuando corresponda.
- Una participación debe referenciar una persona existente.
- Una participación debe referenciar un rol existente.
- Una obra debe referenciar un idioma existente cuando corresponda.
- Una lista debe referenciar un tipo de lista existente.
- Un elemento de lista debe referenciar un número existente.
- Una relación de continuidad debe referenciar números existentes.
- No deben existir relaciones duplicadas cuando conceptualmente representen la misma relación.
- No deben existir elementos huérfanos.

Las restricciones de integridad deben reforzarse mediante las reglas apropiadas en Application y Persistence.

## Seguridad

Todas las operaciones administrativas de esta Epic deben requerir:

- Usuario autenticado.
- Rol `Administrator`.

Los usuarios públicos no pueden crear, modificar ni eliminar contenido del catálogo.

Los contratos de entrada no deben permitir modificar identificadores que se obtienen mediante la ruta o contexto de la operación.

Las operaciones administrativas no deben permitir modificar el rol del usuario autenticado.

## Eliminación

Las entidades utilizadas como referencia por otras entidades no deben eliminarse físicamente cuando dicha eliminación pueda romper la integridad del catálogo.

Cuando corresponda, debe utilizarse desactivación lógica.

La eliminación física de listas puede permitirse porque una lista representa una agrupación y no constituye la identidad de los números que contiene.

Eliminar una lista no debe eliminar sus números.

Las reglas concretas de eliminación de cada entidad serán definidas en sus User Stories.

## Inteligencia artificial

Esta Epic debe contemplar la integración futura de asistencia de IA durante la carga del catálogo.

La primera capacidad de IA prevista es asistir al administrador en la generación o mejora de descripciones de obras.

La IA no debe crear automáticamente entidades persistentes sin intervención o confirmación del administrador.

La implementación de recomendaciones inteligentes, búsqueda semántica y funcionalidades de IA orientadas al usuario queda fuera del alcance de esta Epic.

## User Stories

La Epic comprende inicialmente las siguientes User Stories:

### US-0014 — Administrar editoriales

Permitir que el administrador consulte, cree, modifique y desactive editoriales utilizadas por las obras del catálogo.

### US-0015 — Administrar franquicias

Permitir que el administrador consulte, cree, modifique y desactive franquicias y las utilice para agrupar series relacionadas.

### US-0016 — Administrar series

Permitir que el administrador consulte, cree, modifique y desactive series asociadas a una franquicia.

### US-0017 — Administrar números

Permitir que el administrador consulte, cree, modifique y desactive números pertenecientes a una serie y gestione su información editorial.

### US-0018 — Administrar novelas gráficas

Permitir que el administrador consulte, cree, modifique y desactive novelas gráficas independientes.

### US-0019 — Administrar personas

Permitir que el administrador consulte, cree, modifique y desactive personas que participan en las obras.

### US-0020 — Administrar roles

Permitir que el administrador consulte, cree, modifique y desactive los roles disponibles para las personas que participan en las obras.

### US-0021 — Administrar idiomas

Permitir que el administrador consulte, cree, modifique y desactive idiomas utilizados por las obras.

### US-0022 — Administrar etiquetas

Permitir que el administrador consulte, cree, modifique y desactive etiquetas y asociarlas a números.

### US-0023 — Administrar tipos de lista

Permitir que el administrador consulte y gestione los tipos de listas disponibles para las agrupaciones narrativas.

### US-0024 — Administrar listas de obras

Permitir que el administrador cree, consulte, modifique y elimine listas de tipo Arco o Crossover, incluyendo sus números y orden de lectura.

### US-0025 — Administrar continuidad

Permitir que el administrador establezca y modifique las relaciones de continuidad anterior/siguiente entre números.

### US-0026 — Importar y procesar obras digitales

Permitir que el administrador incorpore una obra mediante un archivo CBR, procese sus páginas y deje la obra disponible para lectura página por página.

### US-0027 — Asistencia de IA para contenido editorial

Permitir que el administrador utilice asistencia de inteligencia artificial para generar o mejorar descripciones de las obras antes de incorporarlas al catálogo.

## Fuera de alcance

Esta Epic no comprende:

- Exploración pública del catálogo.
- Búsqueda pública del catálogo.
- Filtros públicos.
- Ficha pública de una obra.
- Lector.
- Progreso de lectura.
- Historial de lectura.
- Favoritos.
- Valoraciones.
- Opiniones públicas.
- Reseñas privadas.
- Recomendaciones personalizadas.
- Estadísticas públicas.
- Estadísticas personales.
- Listas creadas por usuarios.
- Listas comunitarias.
- Órdenes de lectura colaborativos.
- Búsqueda semántica.
- IA para usuarios.
- Copiloto personal de lectura.
- Anotaciones por página.
- OCR.
- Colecciones inteligentes.

Estas funcionalidades serán desarrolladas en Epics posteriores.

## Resultado esperado

Al finalizar esta Epic, el administrador debe poder construir un catálogo coherente y utilizable mediante:

1. Crear y administrar editoriales.
2. Crear y administrar franquicias.
3. Crear y administrar series.
4. Crear y administrar números.
5. Crear y administrar novelas gráficas.
6. Crear y administrar personas.
7. Crear y administrar roles.
8. Crear y administrar idiomas.
9. Crear y administrar etiquetas.
10. Crear y administrar tipos de lista.
11. Crear y administrar arcos.
12. Crear y administrar crossovers.
13. Establecer relaciones de continuidad.
14. Incorporar obras digitales mediante CBR.
15. Procesar sus páginas individualmente.
16. Asociar correctamente las páginas con cada obra.
17. Mantener la integridad de las relaciones del catálogo.
18. Utilizar asistencia de IA para generar o mejorar descripciones.

Como resultado, el sistema debe disponer de un catálogo estructurado que pueda ser consumido posteriormente por las funcionalidades públicas de exploración, búsqueda y lectura.

## Criterio de finalización de la Epic

EPIC-02 se considera funcionalmente completada cuando todas las User Stories que forman parte de la Epic hayan sido implementadas y se encuentren en estado `finished`.

El conjunto inicial de User Stories que determina la finalización de EPIC-02 es:

- US-0014 — Administrar editoriales.
- US-0015 — Administrar franquicias.
- US-0016 — Administrar series.
- US-0017 — Administrar números.
- US-0018 — Administrar novelas gráficas.
- US-0019 — Administrar personas.
- US-0020 — Administrar roles.
- US-0021 — Administrar idiomas.
- US-0022 — Administrar etiquetas.
- US-0023 — Administrar tipos de lista.
- US-0024 — Administrar listas de obras.
- US-0025 — Administrar continuidad.
- US-0026 — Importar y procesar obras digitales.
- US-0027 — Asistencia de IA para contenido editorial.

## Dependencias

Esta Epic depende de EPIC-01 para:

- Autenticación.
- Identidad de usuario.
- Roles.
- Autorización del administrador.

Las funcionalidades públicas que consuman el catálogo dependerán de las entidades y capacidades establecidas por esta Epic.

## Decisiones pendientes

Este documento define el alcance funcional de la gestión del catálogo.

No define todavía:

- Arquitectura de software.
- Modelo físico de base de datos.
- Endpoints.
- Contratos API.
- Componentes React.
- Estrategia concreta de almacenamiento de archivos.
- Tecnología concreta de procesamiento CBR.
- Estrategia de procesamiento asíncrono.
- Infraestructura de almacenamiento.
- Estrategia de caché.
- Estrategia detallada de seguridad de archivos.
- Proveedor o modelo concreto de inteligencia artificial.
- Prompts utilizados para generación de contenido.
- Estrategia de testing.

Estas decisiones deberán definirse en los artefactos correspondientes de la especificación OCSE.

## Regla para agentes

Todo agente que participe en el desarrollo de esta Epic debe tratar este documento como la definición funcional del catálogo.

Antes de implementar una funcionalidad, debe verificar:

1. Que la funcionalidad pertenece al alcance de EPIC-02.
2. Que utiliza correctamente el vocabulario definido en `domain.md`.
3. Que no duplica entidades existentes.
4. Que mantiene separadas la continuidad de una serie y las agrupaciones mediante listas.
5. Que respeta la administración exclusiva del catálogo.
6. Que no implementa funcionalidades pertenecientes a Epics posteriores.
7. Que no toma decisiones arquitectónicas que correspondan a otros artefactos.

Cuando una necesidad no esté definida, el agente debe identificar la ambigüedad y generar o solicitar el artefacto de especificación correspondiente antes de implementar.

Esta Epic define **qué capacidades debe proporcionar la gestión del catálogo**, no **cómo deben implementarse técnicamente**.