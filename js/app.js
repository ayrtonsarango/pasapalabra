(() => {
	'use strict';

	const MIN_SECONDS = 5;
	const MAX_SECONDS = 300;
	const DEFAULT_SECONDS = 250;
	const UNANSWERED_STATUSES = ['pending', 'skipped'];

	const questions = [
		{ letter: 'A', answer: 'Anécdota' },
		{ letter: 'B', answer: 'Bollo' },
		{ letter: 'C', answer: 'Cascada' },
		{ letter: 'D', answer: 'Daga' },
		{ letter: 'E', answer: 'Espiral' },
		{ letter: 'F', answer: 'Putrefacto' },
		{ letter: 'G', answer: 'Garrulo' },
		{ letter: 'H', answer: 'Rechoncho' },
		{ letter: 'I', answer: 'Interestelar' },
		{ letter: 'J', answer: 'Jalapeño' },
		{ letter: 'K', answer: 'Kebab' },
		{ letter: 'L', answer: 'Homúnculo' },
		{ letter: 'M', answer: 'Mártir' },
		{ letter: 'N', answer: 'Neón' },
		{ letter: 'O', answer: 'Omnisciente' },
		{ letter: 'P', answer: 'Alpargata' },
		{ letter: 'Q', answer: 'Quebradizo' },
		{ letter: 'R', answer: 'Rinoplastia' },
		{ letter: 'S', answer: 'Desaliño' },
		{ letter: 'T', answer: 'Tabardillo' },
		{ letter: 'U', answer: 'Huraño' },
		{ letter: 'V', answer: 'Vasallaje' },
		{ letter: 'W', answer: 'Whisky' },
		{ letter: 'X', answer: 'Clímax' },
		{ letter: 'Y', answer: 'Buey' },
		{ letter: 'Z', answer: 'Pazguato' }
	];

	const elements = {
		newGameControls: document.getElementById('js--ng-controls'),
		questionControls: document.getElementById('js--question-controls'),
		playAgainControls: document.getElementById('js--pa-controls'),
		closeButton: document.getElementById('js--close'),
		newGameButton: document.getElementById('js--new-game'),
		playAgainButton: document.getElementById('js--pa'),
		goodButton: document.getElementById('js--bien'),
		wrongButton: document.getElementById('js--mal'),
		skipButton: document.getElementById('js--pasapalabra'),
		pauseButton: document.getElementById('js--pause'),
		timeInput: document.getElementById('js--time-input'),
		timer: document.getElementById('js--timer'),
		score: document.getElementById('js--score'),
		hint: document.getElementById('js--hint'),
		definition: document.getElementById('js--definition'),
		endTitle: document.getElementById('js--end-title'),
		endSubtitle: document.getElementById('js--end-subtitle'),
		letterItems: Array.from(document.querySelectorAll('.circle .item'))
	};

	const state = {
		round: [],
		currentIndex: 0,
		seconds: DEFAULT_SECONDS,
		timerId: null,
		paused: false,
		running: false
	};

	function createRound() {
		return questions.map((question, index) => ({
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
		const remaining = state.round.filter(isUnanswered).length;
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
		elements.definition.textContent = question.status === 'skipped'
			? 'Pendiente'
			: 'En juego';
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

		hide(elements.questionControls);
		hide(elements.closeButton);
		show(elements.playAgainControls);
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
		state.seconds = clampSeconds(elements.timeInput.value);
		state.paused = false;
		state.running = true;

		elements.timeInput.value = state.seconds;
		hide(elements.newGameControls);
		hide(elements.playAgainControls);
		show(elements.questionControls);
		show(elements.closeButton);

		renderTimer();
		renderScore();
		renderPauseButton();
		renderCurrentQuestion();
		startTimer();
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
			startGame();
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

	function bindEvents() {
		elements.newGameButton.addEventListener('click', startGame);
		elements.playAgainButton.addEventListener('click', startGame);
		elements.goodButton.addEventListener('click', () => markAnswer('correct'));
		elements.wrongButton.addEventListener('click', () => markAnswer('wrong'));
		elements.skipButton.addEventListener('click', skipQuestion);
		elements.pauseButton.addEventListener('click', togglePause);
		elements.closeButton.addEventListener('click', () => endGame('manual'));
		document.addEventListener('keydown', handleKeyboard);
	}

	function init() {
		state.round = createRound();
		state.seconds = clampSeconds(elements.timeInput.value);

		elements.timeInput.value = state.seconds;
		renderTimer();
		renderScore();
		bindEvents();
	}

	init();
})();
