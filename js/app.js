(() => {
	'use strict';

	const MIN_SECONDS = 5;
	const MAX_SECONDS = 300;
	const DEFAULT_SECONDS = 250;
	const UNANSWERED_STATUSES = ['pending', 'skipped'];

	const defaultQuestions = [
		{ letter: 'A', definition: 'Empieza por A: relato breve de un hecho curioso.' },
		{ letter: 'B', definition: 'Empieza por B: pieza de bolleria dulce o salada.' },
		{ letter: 'C', definition: 'Empieza por C: caida de agua desde cierta altura.' },
		{ letter: 'D', definition: 'Empieza por D: arma blanca corta.' },
		{ letter: 'E', definition: 'Empieza por E: curva que gira alrededor de un punto alejandose de el.' },
		{ letter: 'F', definition: 'Contiene la F: que esta corrompido o en descomposicion.' },
		{ letter: 'G', definition: 'Empieza por G: persona ruda o de modales poco cuidados.' },
		{ letter: 'H', definition: 'Contiene la H: de cuerpo grueso y bajo.' },
		{ letter: 'I', definition: 'Empieza por I: relativo al espacio entre estrellas.' },
		{ letter: 'J', definition: 'Empieza por J: chile pequeno y picante.' },
		{ letter: 'K', definition: 'Empieza por K: preparacion de carne asada servida normalmente en pan.' },
		{ letter: 'L', definition: 'Contiene la L: criatura humana diminuta creada artificialmente en relatos antiguos.' },
		{ letter: 'M', definition: 'Empieza por M: persona que muere por defender sus creencias.' },
		{ letter: 'N', definition: 'Empieza por N: gas noble usado en letreros luminosos.' },
		{ letter: 'O', definition: 'Empieza por O: que lo sabe todo.' },
		{ letter: 'P', definition: 'Contiene la P: calzado sencillo de lona o esparto.' },
		{ letter: 'Q', definition: 'Empieza por Q: fragil o facil de romper.' },
		{ letter: 'R', definition: 'Empieza por R: cirugia estetica de la nariz.' },
		{ letter: 'S', definition: 'Contiene la S: falta de aseo o arreglo.' },
		{ letter: 'T', definition: 'Empieza por T: insolacion o malestar causado por calor excesivo.' },
		{ letter: 'U', definition: 'Contiene la U: esquivo o poco sociable.' },
		{ letter: 'V', definition: 'Empieza por V: relacion de dependencia o sumision.' },
		{ letter: 'W', definition: 'Empieza por W: bebida alcoholica destilada de cereales.' },
		{ letter: 'X', definition: 'Contiene la X: punto culminante de una obra o situacion.' },
		{ letter: 'Y', definition: 'Contiene la Y: macho de la vaca.' },
		{ letter: 'Z', definition: 'Empieza por Z: persona simple o poco despierta.' }
	];

	const elements = {
		menuControls: document.getElementById('js--ng-controls'),
		configControls: document.getElementById('js--config-controls'),
		questionControls: document.getElementById('js--question-controls'),
		playAgainControls: document.getElementById('js--pa-controls'),
		closeButton: document.getElementById('js--close'),
		quickGameButton: document.getElementById('js--quick-game'),
		customizeGameButton: document.getElementById('js--customize-game'),
		startCustomGameButton: document.getElementById('js--start-custom-game'),
		backMenuButton: document.getElementById('js--back-menu'),
		menuButton: document.getElementById('js--menu'),
		playAgainButton: document.getElementById('js--pa'),
		goodButton: document.getElementById('js--bien'),
		wrongButton: document.getElementById('js--mal'),
		skipButton: document.getElementById('js--pasapalabra'),
		pauseButton: document.getElementById('js--pause'),
		timeInput: document.getElementById('js--time-input'),
		definitionsList: document.getElementById('js--definitions-list'),
		timer: document.getElementById('js--timer'),
		score: document.getElementById('js--score'),
		hint: document.getElementById('js--hint'),
		definition: document.getElementById('js--definition'),
		endTitle: document.getElementById('js--end-title'),
		endSubtitle: document.getElementById('js--end-subtitle'),
		letterItems: Array.from(document.querySelectorAll('.circle .item'))
	};

	const state = {
		activeQuestions: copyQuestions(defaultQuestions),
		round: [],
		currentIndex: 0,
		configSeconds: DEFAULT_SECONDS,
		seconds: DEFAULT_SECONDS,
		timerId: null,
		paused: false,
		running: false
	};

	function copyQuestions(questions) {
		return questions.map(question => ({ ...question }));
	}

	function createRound() {
		return state.activeQuestions.map((question, index) => ({
			...question,
			id: index,
			status: 'pending'
		}));
	}

	function isUnanswered(question) {
		return UNANSWERED_STATUSES.includes(question.status);
	}

	function clampSeconds(value) {
		const seconds = Number.parseInt(value, 10);

		if (Number.isNaN(seconds)) {
			return DEFAULT_SECONDS;
		}

		return Math.min(Math.max(seconds, MIN_SECONDS), MAX_SECONDS);
	}

	function show(element) {
		element.classList.remove('hidden');
	}

	function hide(element) {
		element.classList.add('hidden');
	}

	function showOnly(view) {
		[
			elements.menuControls,
			elements.configControls,
			elements.questionControls,
			elements.playAgainControls
		].forEach(hide);

		show(view);
	}

	function resetTimer() {
		if (state.timerId) {
			window.clearInterval(state.timerId);
			state.timerId = null;
		}
	}

	function resetRosco() {
		elements.letterItems.forEach(item => {
			item.classList.remove('item--active', 'item--success', 'item--failure', 'item--skip');
		});
	}

	function updateLetterStatus(question) {
		const item = elements.letterItems[question.id];

		if (!item) {
			return;
		}

		item.classList.remove('item--active', 'item--success', 'item--failure', 'item--skip');

		if (question.status === 'correct') {
			item.classList.add('item--success');
		}

		if (question.status === 'wrong') {
			item.classList.add('item--failure');
		}

		if (question.status === 'skipped') {
			item.classList.add('item--skip');
		}
	}

	function renderTimer() {
		elements.timer.textContent = state.seconds;
	}

	function renderScore() {
		const source = state.round.length > 0 ? state.round : state.activeQuestions;
		const remaining = source.filter(question => !question.status || isUnanswered(question)).length;
		elements.score.textContent = remaining;
	}

	function renderCurrentQuestion() {
		elements.letterItems.forEach(item => item.classList.remove('item--active'));

		const question = state.round[state.currentIndex];

		if (!question || !isUnanswered(question)) {
			return;
		}

		const currentItem = elements.letterItems[question.id];

		if (currentItem) {
			currentItem.classList.add('item--active');
		}

		elements.hint.textContent = question.letter;
		elements.definition.textContent = question.definition;
	}

	function renderPauseButton() {
		elements.pauseButton.textContent = state.paused ? 'Reanudar' : 'Pausa';
	}

	function findNextUnansweredIndex(startIndex) {
		for (let offset = 0; offset < state.round.length; offset++) {
			const index = (startIndex + offset) % state.round.length;

			if (isUnanswered(state.round[index])) {
				return index;
			}
		}

		return -1;
	}

	function moveToNextQuestion() {
		const nextIndex = findNextUnansweredIndex((state.currentIndex + 1) % state.round.length);

		if (nextIndex === -1) {
			endGame('completed');
			return;
		}

		state.currentIndex = nextIndex;
		renderCurrentQuestion();
		renderScore();
	}

	function markAnswer(status) {
		if (!state.running || state.paused) {
			return;
		}

		const question = state.round[state.currentIndex];

		if (!question || !isUnanswered(question)) {
			return;
		}

		question.status = status;
		updateLetterStatus(question);
		moveToNextQuestion();
	}

	function skipQuestion() {
		if (!state.running || state.paused) {
			return;
		}

		const question = state.round[state.currentIndex];

		if (!question || !isUnanswered(question)) {
			return;
		}

		question.status = 'skipped';
		updateLetterStatus(question);
		moveToNextQuestion();
	}

	function buildEndMessage(reason) {
		const correct = state.round.filter(question => question.status === 'correct').length;
		const wrong = state.round.filter(question => question.status === 'wrong').length;
		const pending = state.round.filter(isUnanswered).length;

		if (reason === 'completed') {
			return {
				title: 'Rosco completado',
				subtitle: `Aciertos: ${correct}. Fallos: ${wrong}.`
			};
		}

		if (reason === 'time') {
			return {
				title: 'Tiempo agotado',
				subtitle: `Aciertos: ${correct}. Fallos: ${wrong}. Pendientes: ${pending}.`
			};
		}

		return {
			title: 'Partida terminada',
			subtitle: `Aciertos: ${correct}. Fallos: ${wrong}. Pendientes: ${pending}.`
		};
	}

	function endGame(reason) {
		if (!state.running) {
			return;
		}

		resetTimer();
		state.running = false;
		state.paused = false;

		hide(elements.closeButton);
		showOnly(elements.playAgainControls);
		renderPauseButton();
		renderScore();

		const message = buildEndMessage(reason);
		elements.endTitle.textContent = message.title;
		elements.endSubtitle.textContent = message.subtitle;
	}

	function tick() {
		if (!state.running || state.paused) {
			return;
		}

		state.seconds -= 1;
		renderTimer();

		if (state.seconds <= 0) {
			state.seconds = 0;
			renderTimer();
			endGame('time');
		}
	}

	function startTimer() {
		resetTimer();
		state.timerId = window.setInterval(tick, 1000);
	}

	function startGame() {
		resetTimer();
		resetRosco();

		state.round = createRound();
		state.currentIndex = 0;
		state.seconds = state.configSeconds;
		state.paused = false;
		state.running = true;

		showOnly(elements.questionControls);
		show(elements.closeButton);

		renderTimer();
		renderScore();
		renderPauseButton();
		renderCurrentQuestion();
		startTimer();
	}

	function startQuickGame() {
		state.activeQuestions = copyQuestions(defaultQuestions);
		state.configSeconds = DEFAULT_SECONDS;
		elements.timeInput.value = DEFAULT_SECONDS;
		startGame();
	}

	function applyCustomSettings() {
		state.configSeconds = clampSeconds(elements.timeInput.value);
		elements.timeInput.value = state.configSeconds;
		state.activeQuestions = defaultQuestions.map(question => {
			const field = elements.definitionsList.querySelector(`[data-letter="${question.letter}"]`);
			const definition = field ? field.value.trim() : '';

			return {
				letter: question.letter,
				definition: definition || question.definition
			};
		});
	}

	function startCustomGame() {
		applyCustomSettings();
		startGame();
	}

	function showMenu() {
		resetTimer();
		resetRosco();

		state.running = false;
		state.paused = false;
		state.round = [];
		state.currentIndex = 0;
		state.configSeconds = DEFAULT_SECONDS;
		state.seconds = DEFAULT_SECONDS;

		elements.timeInput.value = DEFAULT_SECONDS;
		hide(elements.closeButton);
		showOnly(elements.menuControls);
		renderTimer();
		renderScore();
		renderPauseButton();
	}

	function showConfig() {
		state.configSeconds = clampSeconds(elements.timeInput.value);
		elements.timeInput.value = state.configSeconds;
		showOnly(elements.configControls);
	}

	function togglePause() {
		if (!state.running) {
			return;
		}

		state.paused = !state.paused;
		renderPauseButton();
	}

	function handleKeyboard(event) {
		if (event.target === elements.timeInput && event.key === 'Enter') {
			startCustomGame();
			return;
		}

		if (!state.running) {
			return;
		}

		if (event.key === ' ') {
			event.preventDefault();
			skipQuestion();
		}

		if (event.key.toLowerCase() === 'b') {
			markAnswer('correct');
		}

		if (event.key.toLowerCase() === 'm') {
			markAnswer('wrong');
		}

		if (event.key.toLowerCase() === 'p') {
			togglePause();
		}
	}

	function buildDefinitionEditor(question) {
		const wrapper = document.createElement('label');
		const label = document.createElement('span');
		const textarea = document.createElement('textarea');

		wrapper.className = 'definition-field';
		label.className = 'definition-field__letter';
		label.textContent = question.letter;
		textarea.className = 'definition-field__input';
		textarea.value = question.definition;
		textarea.rows = 2;
		textarea.dataset.letter = question.letter;

		wrapper.append(label, textarea);
		return wrapper;
	}

	function renderDefinitionEditors() {
		const fragment = document.createDocumentFragment();

		defaultQuestions.forEach(question => {
			fragment.append(buildDefinitionEditor(question));
		});

		elements.definitionsList.replaceChildren(fragment);
	}

	function bindEvents() {
		elements.quickGameButton.addEventListener('click', startQuickGame);
		elements.customizeGameButton.addEventListener('click', showConfig);
		elements.startCustomGameButton.addEventListener('click', startCustomGame);
		elements.backMenuButton.addEventListener('click', showMenu);
		elements.menuButton.addEventListener('click', showMenu);
		elements.playAgainButton.addEventListener('click', startGame);
		elements.goodButton.addEventListener('click', () => markAnswer('correct'));
		elements.wrongButton.addEventListener('click', () => markAnswer('wrong'));
		elements.skipButton.addEventListener('click', skipQuestion);
		elements.pauseButton.addEventListener('click', togglePause);
		elements.closeButton.addEventListener('click', () => endGame('manual'));
		document.addEventListener('keydown', handleKeyboard);
	}

	function init() {
		renderDefinitionEditors();
		showMenu();
		bindEvents();
	}

	init();
})();
