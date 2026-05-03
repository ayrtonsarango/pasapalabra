# Geckoders Rosco

App web estatica de Geckoders para controlar una partida tipo Pasapalabra.

## Que hace

- Muestra el rosco completo de la A a la Z.
- Permite jugar rapido con 250 segundos.
- Permite configurar de 1 a 4 roscos en la misma partida.
- Permite asignar tiempo independiente a cada rosco.
- Permite editar la definicion de cada letra por equipo antes de empezar.
- Marca cada letra como **bien**, **mal** o **pasapalabra**.
- Mantiene las letras pasadas como pendientes.
- Pasa turno al siguiente rosco tras un fallo o pasapalabra.
- Oculta la siguiente definicion hasta pulsar `Play` en el turno preparado.
- Permite pausar, terminar y jugar de nuevo.
- Muestra el resultado final con aciertos, fallos y pendientes.

## Como usarla

Abre `index.html` en el navegador.

En el menu inicial:

- `Jugar ahora`: inicia la partida por defecto con 250 segundos.
- `Configurar`: permite elegir roscos, cambiar tiempos y editar definiciones.

Durante la partida:

- `Bien`: acierto.
- `Mal`: fallo.
- `Pasapalabra`: deja la letra para despues.
- `Pausa`: detiene el turno actual.
- `Play`: inicia el siguiente turno preparado.

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
