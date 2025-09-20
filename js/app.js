// Variables
// -----------------------------------------------------------------------------
var paused = false;
var words = [
    new Word(0,"A","Anecdota"),
    new Word(1,"B","Bollo"),
    new Word(2,"C","Cascada"),
    new Word(3,"D","Daga"),
    new Word(4,"E","Espiral"),
    new Word(5,"F","Putrefacto"),
    new Word(6,"G","Garrulo"),
    new Word(7,"H","Rechoncho"),
    new Word(8,"I","Interestelar"),
    new Word(9,"J","Jalapeño"),
	new Word(10,"K","Jalapeño"),
    new Word(11,"L","Homunculo"),
    new Word(12,"M","Martir"),
    new Word(13,"N","Neon"),
    new Word(14,"O","Omnisciente"),
    new Word(15,"P","Alpargata"),
    new Word(16,"Q","Quebradizo"),
    new Word(17,"R","Rinoplastia"),
    new Word(18,"S","Desaliño"),
    new Word(19,"T","Tabardillo"),
    new Word(20,"U","Huraño"),
    new Word(21,"V","Vasallaje"),
	new Word(22,"V","Vasallaje"),
    new Word(23,"X","Climax"),
    new Word(24,"Y","Buey"),
    new Word(25,"Z","Pazguato")
];

// Word constructor
function Word(idNumber, letter, word) {
    this.idNumber = idNumber;
    this.letter = letter;
    this.word = word;
    this.correct = null;
}

var pending = words.map((_,i) => i); // indices pendientes
var remainingWords = pending.length;
var currentIndex = 0;


function showNextWord() {
    if (words.every(w => w.correct !== null)) {
        endGame();
        return;
    }

    // Buscar la siguiente palabra sin responder
    let found = false;
    let startIndex = currentIndex;

    do {
        let w = words[currentIndex];
        if (w.correct === null) {
            found = true;
            break;
        }
        currentIndex = (currentIndex + 1) % words.length;
    } while (currentIndex !== startIndex);

    let w = words[currentIndex];
    $("#js--user-answer").val("");
    $("#js--definition").html("Letra: " + w.letter);
}

// Marcar respuesta
function markAnswer(result) {
    if (paused) return; 
    let w = words[currentIndex];

    if (result === "bien") {
        w.correct = true;
        $(".circle .item").eq(w.idNumber).removeClass("item--skip").addClass("item--success");
        // ir a siguiente pendiente
        currentIndex = (currentIndex + 1) % words.length;
    } else if (result === "mal") {
        w.correct = false;
        $(".circle .item").eq(w.idNumber).removeClass("item--skip").addClass("item--failure");
        currentIndex = (currentIndex + 1) % words.length;
    } else if (result === "pasapalabra") {
        $(".circle .item").eq(w.idNumber).addClass("item--skip");
        currentIndex = (currentIndex + 1) % words.length;
    }
    

    showNextWord();
}



// Función de fin de juego
function endGame() {
    $("#js--question-controls").addClass("hidden");
    $("#js--pa-controls").removeClass("hidden");

    let score = words.filter(w => w.correct).length;
    $("#js--end-title").html("Fin de partida!");
    $("#js--end-subtitle").html("Has conseguido " + score + " aciertos.");
    $("#js--close").addClass("hidden");
}

function countdown() {
    if (paused) {
        timeoutMyOswego = setTimeout(countdown,1000);
        return;
    }
    if (seconds <= 0) {
        $("#js--timer").html(0);
        endGame();
        return;
    }
    seconds--;
    $("#js--timer").html(seconds);
    timeoutMyOswego = setTimeout(countdown,1000);
}

// Eventos
$("#js--new-game").click(function() {
    $("#js--ng-controls").addClass("hidden");
    $("#js--question-controls").removeClass("hidden");
    $("#js--close").removeClass("hidden");

    pending = words.map((_,i) => i);
    remainingWords = pending.length;
    currentIndex = 0;

    // Leer tiempo desde input
    seconds = parseInt($("#js--time-input").val(), 10) || 10;
    $("#js--timer").html(seconds);

    showNextWord();
    countdown();
});

$("#js--bien").click(() => markAnswer("bien"));
$("#js--mal").click(() => markAnswer("mal"));
$("#js--pasapalabra").click(() => markAnswer("pasapalabra"));

// Enviar respuesta con ENTER
$("#js--question-controls").keypress(function(event){
    if (paused) return;
    if(event.which == 13) {
        let pos = pending[0];
        let userAnswer = $("#js--user-answer").val().toLowerCase();
        if(userAnswer === words[pos].word.toLowerCase()) {
            markAnswer("bien");
        } else if(userAnswer === "") {
            markAnswer("pasapalabra");
        } else {
            markAnswer("mal");
        }
    }
});

$("#js--pause").click(function(e){
    e.preventDefault();
    paused = !paused;
    $("#js--pause").text(paused ? "▶️ Reanudar" : "⏸️ Pausa");
});

// Volver a jugar
$("#js--pa").click(() => location.reload());
$("#js--close").click(() => endGame());
