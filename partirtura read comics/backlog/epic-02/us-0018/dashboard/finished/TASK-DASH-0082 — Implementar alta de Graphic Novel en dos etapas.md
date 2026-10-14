# TASK-DASH-0082 — Implementar alta de Graphic Novel en dos etapas

## ID

TASK-DASH-0082

## Título

Implementar alta de Graphic Novel en dos etapas

## Descripción

Implementar el flujo administrativo de alta de un `GraphicNovel` en dos etapas, siguiendo el patrón funcional utilizado para el alta de `Number`.

El alta no debe intentar completar todos los datos en el primer formulario.

El flujo será:

```text
Paso 1
Franchise + Title + CBR/CBZ
        │
        ▼
Crear Graphic Novel
        │
        ▼
Procesamiento del contenido
        │
        ▼
Paso 2
Editar Graphic Novel
        │
        ├── datos editoriales
        ├── portada
        ├── páginas
        ├── personas / roles
        ├── tags
        ├── descripción
        └── IA
```

La primera etapa tiene como único objetivo crear la obra y enviar su contenido.

Una vez finalizado el procesamiento, el administrador podrá ingresar a la edición del Graphic Novel y completar el resto de la información, utilizando IA como asistencia para completar los campos disponibles.

## Contexto relevante

`GraphicNovel` hereda de `Work`.

Su relación es:

```text
Franchise
└── GraphicNovel
```

A diferencia de `Number`, un Graphic Novel es una obra independiente / single shot.

Por lo tanto, no posee:

- `NumberValue`
- `PreviousNumber`
- `NextNumber`
- `Series`
- continuidad editorial de números.

La experiencia de alta debe reutilizar los patrones ya implementados para `Number`, pero no debe trasladar campos o reglas específicas de Numbers.

La implementación realizada en `TASK-DASH-0079` constituye la principal referencia para el flujo de alta en dos etapas.

## Alcance

### 1. Crear pantalla de alta de Graphic Novel

Implementar el flujo de creación de Graphic Novel utilizando la arquitectura, routing, componentes y patrones existentes del Dashboard.

La pantalla debe iniciarse desde el contexto de una `Franchise`.

El formulario de creación inicial debe recibir/conservar el `franchiseId`.

### 2. Paso 1 — Datos mínimos

El primer paso debe solicitar únicamente los datos necesarios para crear la obra y comenzar el procesamiento de contenido:

- `Title`
- archivo `CBR` / `CBZ`

La `Franchise` debe estar determinada por el contexto desde el cual se inició el alta.

No solicitar en este paso información que será completada durante la edición posterior.

Particularmente, no incluir:

- NumberValue;
- Series;
- PreviousNumber;
- NextNumber;
- datos de continuidad.

### 3. Validación del archivo

Mantener las mismas reglas de validación utilizadas por el flujo de Number cuando sean aplicables.

Validar:

- extensión CBR/CBZ;
- tamaño máximo definido por el contrato existente;
- existencia del archivo;
- estado de carga;
- errores de carga.

No modificar las reglas backend desde frontend.

### 4. Creación con contenido

Utilizar el endpoint backend destinado a crear un Graphic Novel junto con su contenido.

La request debe incluir:

```text
FranchiseId
Title
Content
```

Utilizar exactamente los nombres, tipos y formato definidos por el contrato backend.

No inventar endpoints ni modificar el contrato desde el Dashboard.

### 5. Estado posterior a la creación

Una vez creada la entidad, el Dashboard debe reconocer que el contenido puede continuar procesándose de forma asíncrona.

La pantalla no debe asumir que el procesamiento terminó simplemente porque la creación del Graphic Novel fue exitosa.

Debe utilizar el estado de contenido definido por backend.

### 6. Procesamiento

Mientras el contenido se encuentre procesándose:

- mostrar el estado correspondiente;
- impedir acciones que requieran contenido completamente procesado cuando corresponda;
- mantener la experiencia de procesamiento utilizada por Number;
- actualizar el estado según el mecanismo ya implementado en el Dashboard.

Si el procesamiento finaliza correctamente, permitir continuar con la edición.

Si finaliza con error, mostrar el error y permitir el retry cuando el contrato backend lo soporte.

### 7. Navegación al segundo paso

Una vez que el Graphic Novel esté disponible para edición, el administrador debe poder acceder a su pantalla completa de edición.

La edición debe utilizar el identificador del Graphic Novel recién creado.

El flujo debe conservar el contexto de la Franchise.

Conceptualmente:

```text
Franchise
  ↓
Nuevo Graphic Novel
  ↓
Crear + procesar contenido
  ↓
Editar Graphic Novel
```

### 8. Paso 2 — Edición completa

La pantalla de edición debe permitir completar los datos del Graphic Novel que no forman parte del alta mínima.

La información debe determinarse según el contrato backend y US-0018.

Debe contemplar, cuando corresponda:

- título;
- descripción;
- idioma;
- fecha de publicación;
- portada;
- personas;
- roles;
- tags;
- contenido;
- páginas;
- estado del contenido;
- demás propiedades comunes de `Work`.

No incluir campos específicos de `Number`.

### 9. Asistencia mediante IA

La edición debe contemplar la utilización de IA para completar información cuando el backend exponga dicha capacidad para Graphic Novels.

La IA debe considerarse una herramienta de asistencia.

El resultado generado por IA debe poder ser revisado y editado por el administrador antes de persistirlo.

No asumir que una sugerencia de IA debe guardarse automáticamente.

Si una capacidad de IA no existe todavía en el contrato backend para Graphic Novel, no inventar el endpoint ni simular la integración.

### 10. Portada

Mantener el patrón utilizado para `Number` para seleccionar o actualizar la portada cuando el backend lo permita.

Las imágenes deben utilizar los mecanismos existentes para contenido protegido.

No implementar un mecanismo paralelo de almacenamiento o visualización de imágenes.

### 11. Personas y roles

Permitir administrar las relaciones entre el Graphic Novel y las personas/roles disponibles, utilizando los componentes y patrones existentes del Dashboard.

No reutilizar conceptos que pertenezcan exclusivamente a Numbers.

### 12. Tags

Permitir administrar los tags asociados al Graphic Novel según las capacidades existentes del backend.

Si existen recomendaciones generadas por IA, deben diferenciarse de los tags ya persistidos y poder ser revisadas antes de guardar.

### 13. Contenido y páginas

La pantalla de edición debe poder mostrar el contenido procesado del Graphic Novel de acuerdo con el contrato backend.

Debe respetar el modelo existente de:

```text
GraphicNovel
└── Pages
```

No crear una estructura paralela específica para Graphic Novel si el backend ya utiliza el modelo común de `Work`.

### 14. Estados de UI

Implementar correctamente:

- Loading;
- Saving;
- Uploading;
- Processing;
- Error;
- Success;
- Empty cuando corresponda.

Los estados deben diferenciar errores de creación, carga, procesamiento y persistencia.

### 15. Reintento del procesamiento

Cuando el backend indique que el contenido terminó en estado de error y permita retry, ofrecer la acción correspondiente.

El retry debe reutilizar el mecanismo existente para Number.

No duplicar lógica de procesamiento en frontend.

### 16. Cancelación / eliminación de contenido

Si el contrato backend permite eliminar el contenido cargado, mantener la capacidad en edición utilizando el patrón existente.

La eliminación debe respetar las confirmaciones y estados utilizados por el Dashboard.

### 17. React Hook Form y validación

Utilizar el mismo enfoque establecido para los formularios administrativos existentes:

- React Hook Form;
- Zod;
- validaciones explícitas;
- validaciones dependientes del modo cuando corresponda.

El formulario debe distinguir claramente:

```text
Create
```

de:

```text
Edit
```

No exigir durante el alta inicial campos que solamente existen o son editables en el segundo paso.

### 18. Reutilización de componentes

Reutilizar componentes existentes de Number cuando representen comportamiento común de `Work`.

Cuando el componente tenga conceptos específicos de Number, generalizarlo solamente si existe una abstracción real y coherente.

No copiar y pegar componentes completos para Graphic Novel si representan la misma responsabilidad.

No realizar una refactorización global fuera del alcance de esta task.

### 19. Diferencias obligatorias respecto de Number

El formulario de Graphic Novel no debe contener:

```text
NumberValue
PreviousNumber
NextNumber
Series
```

El contexto debe ser:

```text
Franchise
└── GraphicNovel
```

No debe implementarse ninguna lógica de continuidad.

### 20. Documentación del Dashboard

Al finalizar la task, actualizar **únicamente**:

```text
project/pages.md
project/components.md
```

`pages.md` debe documentar las páginas nuevas o modificadas y el flujo de dos etapas.

`components.md` debe documentar los componentes nuevos o modificados.

No actualizar otros documentos de `project/` como parte de esta task.

## Fuera de alcance

- Implementar el listado global de Works.
- Implementar el acceso Franchise → Graphic Novels.
- Implementar un listado contextual completo de Graphic Novels.
- Implementar la edición como una task independiente más allá de lo necesario para completar el segundo paso del flujo de alta.
- Modificar entidades de dominio.
- Modificar servicios backend.
- Crear nuevos endpoints backend.
- Crear lógica de negocio en frontend.
- Implementar continuidad para Graphic Novel.
- Agregar Series a Graphic Novel.
- Agregar NumberValue, PreviousNumber o NextNumber.
- Implementar capacidades de IA que no estén soportadas por backend.
- Realizar una refactorización general del Dashboard.

## Criterios de aceptación

1. Existe un flujo administrativo para crear un Graphic Novel desde una Franchise.

2. El alta está implementada en exactamente dos etapas funcionales.

3. El primer paso solicita únicamente:
   - Title;
   - CBR/CBZ.

4. La Franchise se determina mediante el contexto desde el cual se inicia el alta.

5. El primer paso crea el Graphic Novel junto con su contenido utilizando el contrato backend existente.

6. La creación no exige campos propios del segundo paso.

7. Se validan correctamente los archivos CBR/CBZ según las reglas existentes.

8. El Dashboard representa correctamente el estado de procesamiento posterior a la creación.

9. El administrador puede continuar hacia la edición una vez que el contenido está disponible.

10. El segundo paso permite completar los datos restantes del Graphic Novel.

11. La edición permite utilizar IA como asistencia cuando dicha capacidad esté disponible en backend.

12. Los resultados de IA pueden ser revisados y modificados antes de guardarse.

13. El formulario no contiene:
   - NumberValue;
   - PreviousNumber;
   - NextNumber;
   - Series.

14. No existe ninguna lógica de continuidad para Graphic Novel.

15. El flujo conserva el contexto:

```text
Franchise → Graphic Novel
```

16. Los estados Loading, Uploading, Processing, Saving, Error y Success se manejan correctamente.

17. El retry de procesamiento funciona cuando está soportado por backend.

18. La eliminación de contenido funciona cuando está soportada por backend.

19. Las relaciones con personas, roles y tags funcionan según el contrato backend.

20. Se reutilizan componentes comunes con Number cuando corresponde.

21. No se duplican innecesariamente componentes o lógica existente.

22. No se inventan endpoints, DTOs ni parámetros backend.

23. No se implementa lógica de negocio en frontend.

24. `project/pages.md` queda actualizado.

25. `project/components.md` queda actualizado.

26. No se modifican otros documentos de `project/`.

## Dependencias

Antes de comenzar, el Dashboard Agent debe leer obligatoriamente:

```text
project/
 ├── project.md
 ├── communication.md
 ├── dashboard-architecture.md
 ├── frontend-dashboard-stack-technology.md
 ├── frontend-dashboard-agent.md
 ├── frontend-coding-rules.md
 ├── endpoints.md
 ├── pages.md
 └── components.md
```

También debe leer:

```text
backlog/
 ├── epic-02.md
 └── us-0018/
      └── us-0018.md
```

Y debe revisar explícitamente:

```text
backlog/us-0017/us-0017.md
```

Debe revisar como referencia funcional principal:

```text
TASK-DASH-0079
```

especialmente la implementación del flujo:

```text
Create
  ↓
Title + Content
  ↓
Processing
  ↓
Edit
```

También debe revisar la implementación existente de:

```text
dashboard/pages/numbers-page.tsx
dashboard/pages/number-form-page.tsx
```

y los servicios, tipos y componentes utilizados por ese flujo.

Antes de implementar debe revisar los endpoints reales de Graphic Novel documentados en:

```text
project/endpoints.md
```

y los documentos específicos de endpoints relacionados con Graphic Novel, si existen.

## Resultado esperado

El Dashboard permite crear un Graphic Novel mediante un flujo de dos etapas:

```text
Franchise
   ↓
Nuevo Graphic Novel
   ↓
Title + CBR/CBZ
   ↓
Crear
   ↓
Procesamiento
   ↓
Editar Graphic Novel
   ↓
Completar información + IA
   ↓
Guardar
```

La primera etapa es deliberadamente mínima y permite iniciar rápidamente el procesamiento del contenido.

La segunda etapa concentra la edición completa de la obra y la asistencia mediante IA.

El flujo reutiliza los patrones existentes de `Number` y de `Work`, pero respeta las diferencias de dominio de `GraphicNovel`, especialmente la ausencia total de Series y continuidad.