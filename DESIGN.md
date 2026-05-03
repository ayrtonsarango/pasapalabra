# Design System: Geckoders Rosco
**Project ID:** local-pasapalabra

## 1. Visual Theme & Atmosphere
Panel de concurso limpio, directo y preparado para uso en directo como producto reusable de Geckoders. La pantalla combina una zona de escenario oscura para el rosco con una consola clara para el presentador. La interfaz debe sentirse precisa, visible a distancia y sin decoracion innecesaria.

## 2. Color Palette & Roles
- Stage Ink (#14141A): fondo principal del rosco y zona de tension visual.
- Console Surface (#F7F8FB): panel de controles, legible y calmado.
- Primary Text (#1E2430): texto principal sobre superficies claras.
- Muted Text (#6B7280): etiquetas, subtitulos y datos secundarios.
- Broadcast Blue (#2166E8): letra activa y accion principal.
- Deep Broadcast Blue (#1747A6): estados hover de acciones principales.
- Signal Green (#1FA971): respuestas correctas.
- Signal Red (#D43C3C): respuestas falladas y cierre.
- Pass Amber (#D99A1B): letras pasadas con pasapalabra.
- White (#FFFFFF): texto sobre zonas oscuras y bordes de alto contraste.

## 2.1 Multi Rosco Themes
- Rosco 1 Ocean (#2166E8): equipo principal, activo por defecto.
- Rosco 2 Ember (#D96B1B): segundo equipo, contraste calido.
- Rosco 3 Forest (#1FA971): tercer equipo, lectura de avance estable.
- Rosco 4 Violet (#8A5CF6): cuarto equipo, diferenciacion clara sin mezclar estados.

Cada rosco conserva los mismos colores semanticos de estado: verde para acierto, rojo para fallo y ambar para pasapalabra. El color de equipo solo identifica el tablero activo y no compite con los estados de respuesta.

## 3. Typography Rules
Tipografia de sistema, rapida y sin dependencia externa. Titulares con peso fuerte y tamanos contenidos; controles y estados con texto corto, mayusculas moderadas y espaciado normal.

## 4. Component Stylings
* **Buttons:** rectangulos de 8px para acciones principales, color solido, alto generoso y estados hover/focus visibles.
* **Close action:** boton circular pequeno, blanco, con una X dibujada por CSS y acento rojo sutil.
* **Rosco:** letras circulares, separacion regular, estado activo con anillo luminoso.
* **Scoreboard:** dos modulos compactos con etiqueta pequena y numero grande.
* **Inputs:** superficie blanca, borde sutil y foco azul claro.

## 5. Layout Principles
La experiencia principal aparece en la primera pantalla. En escritorio, los roscos ocupan la zona izquierda y escalan en una matriz de una o dos columnas segun haya 1, 2, 3 o 4 equipos; los controles quedan a la derecha. En movil, los roscos se apilan y los controles quedan debajo. El diseno evita tarjetas anidadas y mantiene agrupaciones grandes, claras y faciles de escanear.

## 6. Turn Privacy
Cuando un equipo falla o dice pasapalabra, el siguiente rosco queda listo pero no muestra letra ni definicion. La informacion de la pregunta aparece solo cuando el presentador inicia el turno y arranca el contador del equipo activo.
