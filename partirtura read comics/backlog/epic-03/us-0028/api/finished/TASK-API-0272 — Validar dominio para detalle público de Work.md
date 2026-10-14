# TASK-API-0272 — Validar dominio para detalle público de Work

## Objetivo

Verificar que el dominio actual de `Work` contiene toda la información y relaciones necesarias para exponer el detalle público de una Work definido en `US-0028`.

Esta task es exclusivamente de **validación del dominio**.

No deben realizarse cambios de comportamiento ni introducirse nuevas reglas de negocio que no estén definidas en la User Story.

---

## Contexto

El detalle público de una Work debe poder representar:

```text
Work
├── Publisher
├── Franchise
├── Series
├── Cover
├── Number
├── Title
├── Description
├── Language
├── WorkType
├── PublicationDate
├── PreviousWork
├── NextWork
├── PersonAssignments
└── Tags
```

La Work pertenece estructuralmente a exactamente uno de:

```text
Publisher
Franchise
Series
```

`Number` es opcional.

`PreviousWork` y `NextWork` representan exclusivamente las relaciones de secuencia explícitamente definidas en el dominio.

---

## Información a validar

Verificar que `Work` permita acceder a:

### Identidad y contenido

* `Id`
* `Title`
* `Description`
* `Number`
* `Cover`
* `PublicationDate`
* `Language`
* `WorkType`

### Contexto editorial

* `Publisher`
* `Franchise`
* `Series`

Cada entidad contextual debe permitir obtener:

```text
Id
Name
Color
Cover
```

### Secuencia

* `PreviousWork`
* `NextWork`

Cada relación debe permitir obtener:

```text
Id
Title
Number
Cover
```

No debe inferirse una relación anterior o siguiente a partir de:

* Number;
* PublicationDate;
* CreatedAt;
* UploadedAt;
* orden de consulta;
* cualquier otro criterio.

Debe utilizarse exclusivamente la relación existente en el dominio.

### Personas y Roles

Verificar que puedan obtenerse todas las asignaciones:

```text
PersonAssignment
├── Person
└── Role
```

Una misma Persona puede aparecer en múltiples asignaciones cuando posee diferentes Roles.

No debe existir ninguna regla de dominio que obligue a fusionar dichas asignaciones.

### Tags

Verificar que una Work pueda obtener sus Tags asociados.

---

## Reglas

### WorkType

`WorkType` continúa siendo exclusivamente una clasificación de la Work.

Esta task no debe introducir comportamiento condicionado por el valor de `WorkType`.

### Number

`Number` continúa siendo opcional.

Una Work sin Number sigue siendo una Work válida.

### Contexto

Debe mantenerse la regla existente:

Una Work pertenece a exactamente uno de:

```text
Publisher
Franchise
Series
```

Esta regla no debe modificarse para esta User Story.

### Secuencia

Previous/Next son relaciones explícitas.

No deben calcularse dinámicamente.

---

## Migración

No debe generarse una migración si el modelo actual ya contiene todas las relaciones necesarias.

Si se detecta que falta una relación estructural imprescindible para cumplir `US-0028`, debe documentarse antes de modificar el dominio.

---

## Documentación

Si la validación no requiere cambios de dominio:

* no modificar `domain.md` innecesariamente;
* no modificar catálogos de dominio únicamente para registrar que se realizó una validación.

Si se detecta una discrepancia real, actualizar únicamente la documentación correspondiente.

---

## Restricciones

* No implementar Repository.
* No implementar Service.
* No implementar Endpoint.
* No crear DTOs.
* No modificar contratos HTTP.
* No implementar funcionalidades del Reader.
* No implementar progreso, favoritos, historial, ratings o reviews.
* No introducir nuevas reglas de negocio.
* No duplicar entidades existentes.

---

## Validación

La task se considera completa cuando:

* [ ] `Work` contiene toda la información necesaria para `US-0028`.
* [ ] Publisher puede proporcionar Id, Name, Color y Cover.
* [ ] Franchise puede proporcionar Id, Name, Color y Cover.
* [ ] Series puede proporcionar Id, Name, Color y Cover.
* [ ] Cover de Work está disponible.
* [ ] Number continúa siendo opcional.
* [ ] Language está disponible.
* [ ] WorkType está disponible.
* [ ] PublicationDate está disponible.
* [ ] PreviousWork está disponible como relación explícita.
* [ ] NextWork está disponible como relación explícita.
* [ ] PersonAssignments permiten obtener Person y Role.
* [ ] Las asignaciones de una misma Persona con distintos Roles no se pierden.
* [ ] Tags están disponibles.
* [ ] No se introducen nuevas reglas de negocio.
* [ ] No se genera migración innecesaria.
* [ ] El dominio continúa respetando la exclusividad Publisher/Franchise/Series.
* [ ] El código compila correctamente.


---

## Execution Result

**Completed:** 2026-10-06

**Domain validation results:**

### ✅ Work entity supports all required fields:
- `Id`, `Title`, `Description`, `NumberValue`, `Cover`, `PublicationDate`, `Language`, `WorkType`
- `Publisher`, `Franchise`, `Series` (contexto editorial - exactly one)
- `PreviousNumber`, `NextNumber` (secuencia explícita)
- `PersonByRoles` (Person + Role assignments)
- `Tags`

### ✅ Context entities support required fields:
- Publisher: `Id`, `Name`, `Color`, `Cover` (Image)
- Franchise: `Id`, `Name`, `Color`, `Cover` (Image), `Publisher`
- Series: `Id`, `Name`, `Color`, `Cover` (Image), `Franchise`, `Franchise.Publisher`

### ✅ Navigation properties exist:
- Work → Publisher (direct)
- Work → Franchise (direct)
- Work → Series (direct)
- Series → Franchise → Publisher (hierarchy)
- Franchise → Publisher (hierarchy)
- Work → PreviousNumber / NextNumber (explicit sequence)
- Work → PersonByRoles → Person, Role
- Work → Tags → Tag

### ✅ Business rules preserved:
- Work belongs to exactly one of: Publisher, Franchise, or Series
- NumberValue is optional (`string?`)
- PreviousWork/NextWork are explicit relationships (not inferred)
- WorkType is a classification only
- Multiple PersonByRole entries for same Person with different Roles are preserved

### ✅ No domain changes needed:
- All required relationships already exist
- No migration required
- No new entities needed
- No business rule changes needed

**Conclusion:** The domain fully supports US-0028 requirements. No modifications needed.
