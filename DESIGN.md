# Design System: Pasapalabra by Geckoders
**Project ID:** local-pasapalabra

## 1. Visual Theme & Atmosphere
Concurso limpio, directo y preparado para uso en directo como producto reusable de Geckoders. La pantalla combina una zona de escenario oscura para el rosco con una consola clara para el presentador. La interfaz debe sentirse precisa, visible a distancia y sin decoracion innecesaria.

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
- Rosco 1 Ocean (#4F8CFF): equipo principal, luminoso sobre fondo oscuro.
- Rosco 2 Ember (#FF7A59): segundo equipo, contraste calido sin invadir el rojo de error.
- Rosco 3 Forest (#2DBF9F): tercer equipo, lectura fresca y estable.
- Rosco 4 Gold (#D6A636): cuarto equipo, diferenciacion clara sin mezclar estados.

Cada rosco puede ajustar su color interior desde configuracion. Ese color vive en el brillo del centro, la letra activa y el foco del turno; no se usa un contenedor rectangular alrededor del tablero. Los estados siguen siendo semanticos y compartidos: verde para acierto, rojo para fallo y ambar para pasapalabra.

## 3. Typography Rules
Tipografia de sistema, rapida y sin dependencia externa. Titulares con peso fuerte y tamanos contenidos; controles y estados con texto corto, mayusculas moderadas y espaciado normal.

## 4. Component Stylings
* **Buttons:** rectangulos de 8px para acciones principales, color solido, alto generoso y estados hover/focus visibles.
* **Close action:** boton circular pequeno, blanco, con una X dibujada por CSS y acento rojo sutil.
* **Rosco:** letras circulares, separacion regular, centro tintado por equipo y estado activo con anillo luminoso. Si hay un solo rosco, el titulo central es "Pasapalabra".
* **Color picker:** selector circular compacto para definir el color interior del rosco sin ocupar espacio operativo.
* **Scoreboard:** dos modulos compactos con etiqueta pequena y numero grande.
* **Inputs:** superficie blanca, borde sutil y foco azul claro.
* **Footer:** franja oscura alineada con el escenario, texto claro y enlace azul suave para integrar marca sin romper contraste.

## 5. Layout Principles
La experiencia principal aparece en la primera pantalla. En escritorio, los roscos ocupan la zona izquierda y escalan en una matriz de una o dos columnas segun haya 1, 2, 3 o 4 equipos; los controles quedan a la derecha. En movil, los roscos se apilan y los controles quedan debajo. El diseno evita tarjetas anidadas y mantiene agrupaciones grandes, claras y faciles de escanear.

## 6. Turn Privacy
Cuando un equipo falla o dice pasapalabra, el siguiente rosco queda listo pero no muestra letra ni definicion. La informacion de la pregunta aparece solo cuando el presentador inicia el turno y arranca el contador del equipo activo.
