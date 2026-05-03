# Geckoders Rosco

App web estatica de Geckoders para controlar una partida tipo Pasapalabra.

## Que hace

- Muestra el rosco completo de la A a la Z.
- Permite jugar rapido con 250 segundos.
- Permite configurar el tiempo de partida.
- Permite editar la definicion de cada letra antes de empezar.
- Marca cada letra como **bien**, **mal** o **pasapalabra**.
- Mantiene las letras pasadas como pendientes.
- Permite pausar, reanudar, terminar y jugar de nuevo.
- Muestra el resultado final con aciertos, fallos y pendientes.

## Como usarla

Abre `index.html` en el navegador.

En el menu inicial:

- `Jugar ahora`: inicia la partida por defecto con 250 segundos.
- `Configurar`: permite cambiar tiempo y definiciones.

Durante la partida:

- `Bien`: acierto.
- `Mal`: fallo.
- `Pasapalabra`: deja la letra para despues.
- `Pausa`: detiene o reanuda el tiempo.

## Desarrollo

Instalar dependencias:

```bash
npm install
```

Compilar estilos:

```bash
npm run build:css
```

Comprobar JavaScript:

```bash
npm run check:js
```

## Estructura

- `index.html`: pantalla principal.
- `js/app.js`: logica de la partida.
- `scss/`: estilos fuente.
- `css/style.css`: CSS compilado.
- `DESIGN.md`: guia visual usada para el restyling.

Contacto: https://geckoders.es/
