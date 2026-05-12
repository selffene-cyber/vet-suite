# Prompt — Sistema Inteligente de Gestión de Pacientes Veterinarios

## Contexto General

Se detectaron problemas funcionales y de arquitectura en el módulo de creación de pacientes veterinarios.

Actualmente:

- El buscador de tutores no encuentra registros existentes.
- El campo “Raza” es manual y no controlado.
- No existe diferenciación estructurada entre especies.
- No hay autocomplete/search eficiente.
- No existe una arquitectura escalable para futuras especies.

Este prompt define las mejoras completas requeridas para el sistema.

---

# 1. Corrección Crítica — Buscador de Tutores

## Problema actual

Al crear un paciente y buscar un tutor existente:

- el sistema NO encuentra tutores previamente creados.
- incluso escribiendo caracteres iniciales.
- aparentemente el autocomplete/search no está consultando correctamente la base de datos o no está actualizando el estado.

---

## Requerimientos

### El buscador de tutor debe:

- Buscar en tiempo real mientras el usuario escribe.
- Permitir búsqueda por:
  - nombre
  - apellido
  - nombre completo
  - teléfono
  - email
  - RUT
- Ser tolerante a mayúsculas/minúsculas.
- Permitir coincidencias parciales.
- Mostrar resultados desde el primer carácter.

---

## UX esperada

### Campo:

`Buscar Tutor`

### Comportamiento:

- searchable
- autocomplete
- dropdown dinámico
- debounce de 300ms
- loading state
- empty state:
  - “No se encontraron tutores”
- botón rápido:
  - “Crear nuevo tutor”

---

# 2. Reestructuración Completa — Sistema Dinámico de Pacientes Veterinarios

## Objetivo

Crear un sistema dinámico de selección de especie y raza veterinaria.

---

# 3. Dropdown Principal — Tipo de Paciente

Crear un dropdown obligatorio:

## Label

`Tipo de Paciente`

## Opciones

- Perro
- Gato
- Ave
- Animal Exótico
- Animal de Granja
- Reptil
- Roedor
- Conejo y Lagomorfos
- Hurón
- Equino
- Otro

---

# 4. Dropdown Dependiente — Raza

Cuando el usuario seleccione un tipo de paciente:

- mostrar automáticamente un segundo dropdown:
  - `Raza`

El contenido debe cambiar dinámicamente según el tipo seleccionado.

---

# 5. Requisitos Técnicos del Dropdown de Raza

## Debe ser:

- searchable
- autocomplete
- virtualized list
- keyboard friendly
- mobile friendly
- debounce
- soportar miles de registros futuros

---

# 6. MUY IMPORTANTE — Reutilización de Lista Existente

## Perros

NO crear una nueva lista de perros.

Debe reutilizarse EXACTAMENTE la lista canina ya creada anteriormente en el sistema.

La implementación debe:

- reutilizar catálogo existente
- reutilizar IDs existentes
- evitar duplicados
- evitar nuevas tablas innecesarias

---

# 7. Estructura Recomendada de Base de Datos

## HACER

### Tabla: species_groups

### Tabla: breeds

Con FK por especie.

---

# 8. Modelo de Datos Recomendado

```json
{
  "tipoPaciente": "Perro",
  "raza": "Labrador Retriever",
  "subtipo": null
}
```

---

# 9. Campos Veterinarios Inteligentes

| Campo | Tipo |
|---|---|
| especie | string |
| raza | string |
| tamaño | enum |
| pesoEstimado | number |
| braquicefalo | boolean |
| potencialmentePeligroso | boolean |

---

# 10. Reglas Globales para TODAS las Especies

Agregar SIEMPRE:

- Mestizo
- Sin raza definida
- Otra raza
- No identificada

---

# 11. LISTA COMPLETA — RAZAS DE PERROS (CHILE)

## Mestizos y comunes

- Mestizo
- Quiltro
- Sin raza definida (SRD)
- Cruza pequeña
- Cruza mediana
- Cruza grande

## Razas pequeñas

- Chihuahua
- Yorkshire Terrier
- Pomerania
- Maltés
- Shih Tzu
- Pug
- Pekinés
- Pinscher Miniatura
- Fox Terrier Toy
- Bichón Frisé
- Bichón Maltés
- Boston Terrier
- Jack Russell Terrier
- Schnauzer Miniatura
- Caniche Toy
- Caniche Mini
- Dachshund / Salchicha
- Bulldog Francés
- Cavalier King Charles Spaniel
- Papillón
- Coton de Tuléar
- West Highland White Terrier
- Lhasa Apso

## Razas medianas

- Beagle
- Border Collie
- Cocker Spaniel Inglés
- Cocker Spaniel Americano
- Bulldog Inglés
- Bull Terrier
- Staffordshire Bull Terrier
- Schnauzer Estándar
- Samoyedo
- Shar Pei
- Whippet
- Setter Inglés
- Springer Spaniel
- Husky Siberiano
- Australian Shepherd
- Pastor Australiano
- Kelpie Australiano
- Basenji
- Chow Chow
- Dálmata
- Brittany Spaniel
- Vizsla
- Shiba Inu
- Akita Inu
- American Staffordshire Terrier
- Pitbull Terrier Americano
- Basset Hound

## Razas grandes

- Labrador Retriever
- Golden Retriever
- Pastor Alemán
- Pastor Belga Malinois
- Pastor Belga Groenendael
- Pastor Suizo
- Rottweiler
- Doberman
- Boxer
- Weimaraner
- Gran Danés
- San Bernardo
- Terranova
- Bernés de la Montaña
- Cane Corso
- Dogo Argentino
- Fila Brasileiro
- Mastín Napolitano
- Mastín Inglés
- Mastín Español
- Leonberger
- Rhodesian Ridgeback
- Alaskan Malamute
- Setter Irlandés
- Collie
- Borzoi
- Airedale Terrier

## Razas de trabajo / pastoreo

- Border Collie
- Pastor Alemán
- Pastor Belga Malinois
- Pastor Australiano
- Kelpie
- Boyero de Berna
- Pastor de Anatolia
- Pastor Catalán
- Pastor de Brie
- Komondor
- Pastor Maremmano
- Old English Sheepdog
- Corgi Pembroke
- Corgi Cardigan

## Razas primitivas / asiáticas

- Akita Inu
- Shiba Inu
- Chow Chow
- Shar Pei
- Husky Siberiano
- Alaskan Malamute
- Basenji
- Samoyedo

## Razas tipo terrier

- Bull Terrier
- Fox Terrier
- Jack Russell Terrier
- Yorkshire Terrier
- Airedale Terrier
- Staffordshire Bull Terrier
- American Staffordshire Terrier
- Pitbull Terrier Americano
- West Highland Terrier

## Razas tipo sabueso / caza

- Beagle
- Basset Hound
- Bloodhound
- Pointer Inglés
- Setter Inglés
- Setter Irlandés
- Weimaraner
- Vizsla
- Springer Spaniel
- Coonhound
- Galgo Español
- Greyhound

## Razas braquicéfalas

- Pug
- Bulldog Francés
- Bulldog Inglés
- Boston Terrier
- Pekinés
- Shih Tzu
- Boxer

## Razas gigantes

- Gran Danés
- San Bernardo
- Terranova
- Mastín Inglés
- Leonberger
- Lobero Irlandés

## Razas menos comunes presentes en Chile

- Xoloitzcuintle
- Perro sin pelo del Perú
- Dogo de Burdeos
- Keeshond
- Schipperke
- Saluki
- Cane Corso
- Boerboel
- Tosa Inu
- Kuvasz
- Flat Coated Retriever
- Nova Scotia Duck Tolling Retriever

## Opciones útiles

- Otra raza
- No identificada
- Mestizo
- Cruza
- En evaluación

---

# 12. GATOS

- Mestizo / Común Europeo
- Doméstico de Pelo Corto
- Doméstico de Pelo Largo
- Siamés
- Persa
- Maine Coon
- Bengalí
- British Shorthair
- Ragdoll
- Sphynx
- Azul Ruso
- Angora Turco
- Bosque de Noruega
- Abisinio
- Scottish Fold
- Himalayo
- Burmés
- Savannah
- Devon Rex
- Cornish Rex
- Otro

---

# 13. AVES

## Compañía

- Periquito Australiano
- Ninfa / Carolino
- Agapornis
- Cotorra Argentina
- Canario
- Diamante Mandarín
- Loro Amazona
- Guacamayo
- Cacatúa
- Eclectus
- Yaco Africano
- Caique
- Conure
- Tucán

## Corral / Producción

- Gallina
- Gallo
- Pollo Broiler
- Pato
- Ganso
- Pavo
- Codorniz

## Ornamentales

- Faisán
- Pavo Real

---

# 14. REPTILES

- Iguana Verde
- Gecko Leopardo
- Gecko Crestado
- Dragón Barbudo
- Camaleón
- Tortuga de Tierra
- Tortuga de Agua
- Boa Constrictor
- Pitón Bola
- Serpiente del Maíz
- Anolis
- Monitor
- Skink
- Otro

---

# 15. ROEDORES

- Hámster Sirio
- Hámster Ruso
- Cobayo / Cuy / Cuyo
- Ratón
- Rata
- Chinchilla
- Degú
- Jerbo
- Ardilla
- Otro

---

# 16. CONEJOS Y LAGOMORFOS

- Conejo Cabeza de León
- Holland Lop
- Mini Lop
- Rex
- Californiano
- Neozelandés
- Belier
- Angora
- Mini Rex
- Mestizo
- Otro

---

# 17. HURONES

- Hurón Albino
- Hurón Sable
- Hurón Panda
- Hurón Champagne
- Mestizo
- Otro

---

# 18. ANIMALES DE GRANJA

## Bovinos

- Holstein
- Jersey
- Angus
- Hereford
- Wagyu
- Overo Colorado
- Clavel Alemán

## Ovinos

- Suffolk
- Merino
- Dorset
- Romney Marsh

## Caprinos

- Boer
- Saanen
- Anglo Nubian

## Porcinos

- Landrace
- Yorkshire
- Duroc
- Pietrain

## Camélidos

- Alpaca
- Llama

---

# 19. EQUINOS

- Criollo Chileno
- Cuarto de Milla
- Árabe
- Pura Sangre Inglés
- Appaloosa
- Andaluz
- Percherón
- Frisón
- Mestizo
- Pony
- Otro

---

# 20. EXÓTICOS

- Erizo Africano
- Sugar Glider
- Mono Tití
- Zorrillo doméstico
- Axolote
- Tarántula
- Escorpión
- Rana Pacman
- Rana Arborícola
- Caracol Gigante Africano
- Otro

---

# 21. Consideraciones Frontend

Idealmente usar:

- React Select
- Command UI
- Combobox accesible
- Virtual scroll
- TanStack Query
- Debounce
- Lazy loading

---

# 22. Validaciones

Validar:

- especie obligatoria
- raza obligatoria
- tutor obligatorio
- coherencia entre especie y raza

---

# 23. Objetivo Final

Construir un sistema veterinario moderno, escalable y optimizado para:

- clínicas veterinarias
- hospitales
- móviles
- atención rápida
- formularios eficientes
- integraciones médicas
- expansión futura
