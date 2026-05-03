(() => {
	'use strict';

	const MIN_SECONDS = 5;
	const MAX_SECONDS = 600;
	const DEFAULT_SECONDS = 250;
	const DEFAULT_TEAM_COUNT = 1;
	const MAX_TEAMS = 4;
	const UNANSWERED_STATUSES = ['pending', 'skipped'];
	const DEFAULT_TEAM_COLORS = ['#4f8cff', '#ff7a59', '#2dbf9f', '#d6a636'];
	const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
	const READY_MESSAGE = 'Listo para el siguiente equipo.';

	const defaultQuestions = LETTERS.map(letter => ({
		letter,
		definition: ''
	}));

	const elements = {
		boards: document.getElementById('js--boards'),
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
		playTurnButton: document.getElementById('js--play-turn'),
		teamCount: document.getElementById('js--team-count'),
		teamsConfig: document.getElementById('js--teams-config'),
		turnLabel: document.getElementById('js--turn-label'),
		hint: document.getElementById('js--hint'),
		definition: document.getElementById('js--definition'),
		endTitle: document.getElementById('js--end-title'),
		endSubtitle: document.getElementById('js--end-subtitle')
	};

	const state = {
		configTeams: buildDefaultTeamConfigs(DEFAULT_TEAM_COUNT),
		teams: [],
		activeTeamIndex: 0,
		timerId: null,
		phase: 'menu'
	};

	function buildDefaultTeamConfigs(count) {
		return Array.from({ length: count }, (_, index) => ({
			name: `Equipo ${index + 1}`,
			seconds: DEFAULT_SECONDS,
			color: DEFAULT_TEAM_COLORS[index % DEFAULT_TEAM_COLORS.length],
			questions: copyQuestions(defaultQuestions)
		}));
	}

	function copyQuestions(questions) {
		return questions.map(question => ({ ...question }));
	}

	function clampSeconds(value) {
		const seconds = Number.parseInt(value, 10);

		if (Number.isNaN(seconds)) {
			return DEFAULT_SECONDS;
		}

		return Math.min(Math.max(seconds, MIN_SECONDS), MAX_SECONDS);
	}

	function clampTeamCount(value) {
		const count = Number.parseInt(value, 10);

		if (Number.isNaN(count)) {
			return DEFAULT_TEAM_COUNT;
		}

		return Math.min(Math.max(count, 1), MAX_TEAMS);
	}

	function normalizeColor(value, fallback) {
		if (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value.trim())) {
			return value.trim().toLowerCase();
		}

		return fallback;
	}

	function hexToRgba(hex, alpha) {
		const normalized = normalizeColor(hex, DEFAULT_TEAM_COLORS[0]).slice(1);
		const value = Number.parseInt(normalized, 16);
		const red = (value >> 16) & 255;
		const green = (value >> 8) & 255;
		const blue = value & 255;

		return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
	}

	function isUnanswered(question) {
		return UNANSWERED_STATUSES.includes(question.status);
	}

	function getRemaining(team) {
		return team.questions.filter(isUnanswered).length;
	}

	function isTeamPlayable(team) {
		return !team.finished && team.seconds > 0 && getRemaining(team) > 0;
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

	function createTeam(config, index) {
		const fallbackColor = DEFAULT_TEAM_COLORS[index % DEFAULT_TEAM_COLORS.length];
		const color = normalizeColor(config.color, fallbackColor);

		return {
			id: index,
			name: config.name || `Equipo ${index + 1}`,
			color,
			configSeconds: clampSeconds(config.seconds),
			seconds: clampSeconds(config.seconds),
			currentIndex: 0,
			finished: false,
			finishReason: null,
			questions: config.questions.map((question, questionIndex) => ({
				id: questionIndex,
				letter: question.letter,
				definition: question.definition.trim(),
				status: 'pending'
			}))
		};
	}

	function createTeamsFromConfig() {
		return state.configTeams.map(createTeam);
	}

	function findNextQuestionIndex(team, startIndex) {
		for (let offset = 0; offset < team.questions.length; offset++) {
			const index = (startIndex + offset) % team.questions.length;

			if (isUnanswered(team.questions[index])) {
				return index;
			}
		}

		return -1;
	}

	function refreshTeamCompletion(team, reason = 'completed') {
		if (getRemaining(team) === 0) {
			team.finished = true;
			team.finishReason = reason;
			return true;
		}

		if (team.seconds <= 0) {
			team.seconds = 0;
			team.finished = true;
			team.finishReason = 'time';
			return true;
		}

		return false;
	}

	function findNextTeamIndex(startIndex) {
		for (let offset = 0; offset < state.teams.length; offset++) {
			const index = (startIndex + offset) % state.teams.length;

			if (isTeamPlayable(state.teams[index])) {
				return index;
			}
		}

		return -1;
	}

	function getActiveTeam() {
		return state.teams[state.activeTeamIndex] || null;
	}

	function getActiveQuestion() {
		const team = getActiveTeam();

		if (!team) {
			return null;
		}

		return team.questions[team.currentIndex] || null;
	}

	function setControlsEnabled(enabled) {
		[
			elements.goodButton,
			elements.wrongButton,
			elements.skipButton,
			elements.pauseButton
		].forEach(button => {
			button.disabled = !enabled;
		});
	}

	function renderBoards() {
		elements.boards.dataset.count = String(Math.max(state.teams.length, 1));
		elements.boards.replaceChildren(...state.teams.map(buildBoard));
	}

	function buildBoard(team) {
		const board = document.createElement('article');
		const circle = document.createElement('ul');
		const center = document.createElement('div');
		const name = document.createElement('p');
		const stateText = document.createElement('p');
		const score = document.createElement('ul');
		const timerItem = buildScoreItem('Tiempo', team.seconds);
		const pendingItem = buildScoreItem('Pendientes', getRemaining(team));

		board.className = 'team-board';
		board.dataset.teamId = team.id;
		board.setAttribute('aria-label', team.name);
		board.style.setProperty('--team-accent', team.color);
		board.style.setProperty('--team-core', hexToRgba(team.color, .2));
		board.style.setProperty('--team-glow', hexToRgba(team.color, .26));

		if (team.finished) {
			board.classList.add('is-finished');
		}

		if (team.id === state.activeTeamIndex && state.phase === 'playing') {
			board.classList.add('is-active');
		}

		if (team.id === state.activeTeamIndex && state.phase === 'ready') {
			board.classList.add('is-ready');
		}

		circle.className = 'circle';
		team.questions.forEach((question, index) => {
			const item = document.createElement('li');
			item.className = getLetterClass(team, question, index);
			item.textContent = question.letter;
			circle.append(item);
		});

		center.className = 'team-board__center';
		name.className = 'team-board__name';
		name.textContent = team.name;
		stateText.className = 'team-board__state';
		stateText.textContent = getBoardStateText(team);
		center.append(name, stateText);

		score.className = 'scoreboard';
		score.append(timerItem, pendingItem);

		board.append(circle, center, score);
		return board;
	}

	function buildScoreItem(label, value) {
		const item = document.createElement('li');
		const labelEl = document.createElement('span');
		const valueEl = document.createElement('strong');

		item.className = 'scoreboard__item';
		labelEl.className = 'scoreboard__label';
		labelEl.textContent = label;
		valueEl.className = 'scoreboard__value';
		valueEl.textContent = value;
		item.append(labelEl, valueEl);

		return item;
	}

	function getLetterClass(team, question, index) {
		const classes = ['item'];

		if (question.status === 'correct') {
			classes.push('item--success');
		}

		if (question.status === 'wrong') {
			classes.push('item--failure');
		}

		if (question.status === 'skipped') {
			classes.push('item--skip');
		}

		if (team.id === state.activeTeamIndex && state.phase === 'playing' && index === team.currentIndex) {
			classes.push('item--active');
		}

		return classes.join(' ');
	}

	function getBoardStateText(team) {
		if (team.finished && team.finishReason === 'time') {
			return 'Tiempo agotado';
		}

		if (team.finished) {
			return 'Finalizado';
		}

		if (team.id === state.activeTeamIndex && state.phase === 'playing') {
			return 'En juego';
		}

		if (team.id === state.activeTeamIndex && state.phase === 'ready') {
			return 'Listo';
		}

		return 'Espera';
	}

	function renderTurnPanel() {
		const team = getActiveTeam();
		const question = getActiveQuestion();

		if (!team || !question) {
			elements.turnLabel.textContent = 'Turno';
			elements.hint.textContent = '';
			setDefinitionText('');
			setControlsEnabled(false);
			hide(elements.playTurnButton);
			return;
		}

		elements.turnLabel.textContent = `${team.name} - ${team.seconds}s`;

		if (state.phase === 'ready') {
			elements.hint.textContent = '';
			setDefinitionText(READY_MESSAGE);
			setControlsEnabled(false);
			show(elements.playTurnButton);
			return;
		}

		elements.hint.textContent = question.letter;
		setDefinitionText(question.definition);
		setControlsEnabled(state.phase === 'playing');
		hide(elements.playTurnButton);
	}

	function setDefinitionText(text) {
		elements.definition.textContent = text;
		elements.definition.classList.toggle('definition--empty', !text);
	}

	function renderGame() {
		renderBoards();
		renderTurnPanel();
	}

	function startInterval() {
		resetTimer();
		state.timerId = window.setInterval(tick, 1000);
	}

	function startGame(startImmediately = true) {
		resetTimer();
		state.teams = createTeamsFromConfig();
		state.activeTeamIndex = findNextTeamIndex(0);

		if (state.activeTeamIndex === -1) {
			showResults();
			return;
		}

		state.phase = startImmediately ? 'playing' : 'ready';
		showOnly(elements.questionControls);
		show(elements.closeButton);
		renderGame();

		if (state.phase === 'playing') {
			startInterval();
		}
	}

	function startQuickGame() {
		state.configTeams = buildDefaultTeamConfigs(1);
		startGame(true);
	}

	function startCustomGame() {
		applyCustomSettings();
		startGame(true);
	}

	function playPreparedTurn() {
		if (state.phase !== 'ready') {
			return;
		}

		state.phase = 'playing';
		renderGame();
		startInterval();
	}

	function tick() {
		if (state.phase !== 'playing') {
			return;
		}

		const team = getActiveTeam();

		if (!team) {
			return;
		}

		team.seconds -= 1;

		if (refreshTeamCompletion(team, 'time')) {
			passTurn();
			return;
		}

		renderGame();
	}

	function markAnswer(status) {
		if (state.phase !== 'playing') {
			return;
		}

		const team = getActiveTeam();
		const question = getActiveQuestion();

		if (!team || !question || !isUnanswered(question)) {
			return;
		}

		question.status = status;

		if (status === 'correct') {
			continueSameTeam(team);
			return;
		}

		passTurnAfterQuestion(team);
	}

	function skipQuestion() {
		markAnswer('skipped');
	}

	function continueSameTeam(team) {
		if (refreshTeamCompletion(team)) {
			passTurn();
			return;
		}

		const nextIndex = findNextQuestionIndex(team, (team.currentIndex + 1) % team.questions.length);

		if (nextIndex === -1) {
			team.finished = true;
			team.finishReason = 'completed';
			passTurn();
			return;
		}

		team.currentIndex = nextIndex;
		renderGame();
	}

	function passTurnAfterQuestion(team) {
		if (!team.finished) {
			const nextQuestionIndex = findNextQuestionIndex(team, (team.currentIndex + 1) % team.questions.length);

			if (nextQuestionIndex === -1) {
				team.finished = true;
				team.finishReason = 'completed';
			} else {
				team.currentIndex = nextQuestionIndex;
			}
		}

		passTurn();
	}

	function passTurn() {
		resetTimer();

		const nextTeamIndex = findNextTeamIndex((state.activeTeamIndex + 1) % state.teams.length);

		if (nextTeamIndex === -1) {
			showResults();
			return;
		}

		state.activeTeamIndex = nextTeamIndex;
		state.phase = 'ready';
		renderGame();
	}

	function togglePause() {
		if (state.phase === 'playing') {
			resetTimer();
			state.phase = 'ready';
			renderGame();
		}
	}

	function finishGame() {
		resetTimer();
		state.teams.forEach(team => {
			if (!team.finished) {
				team.finished = true;
				team.finishReason = 'manual';
			}
		});
		showResults();
	}

	function showResults() {
		resetTimer();
		state.phase = 'results';
		hide(elements.closeButton);
		showOnly(elements.playAgainControls);
		renderBoards();

		elements.endTitle.textContent = 'Partida terminada';
		elements.endSubtitle.textContent = state.teams.map(team => {
			const correct = team.questions.filter(question => question.status === 'correct').length;
			const wrong = team.questions.filter(question => question.status === 'wrong').length;
			const pending = getRemaining(team);

			return `${team.name}: ${correct} aciertos, ${wrong} fallos, ${pending} pendientes.`;
		}).join(' ');
	}

	function showMenu() {
		resetTimer();
		state.phase = 'menu';
		state.teams = createTeamsFromConfig();
		state.activeTeamIndex = 0;
		hide(elements.closeButton);
		showOnly(elements.menuControls);
		renderBoards();
	}

	function showConfig() {
		state.phase = 'config';
		renderTeamConfig();
		showOnly(elements.configControls);
	}

	function syncTeamCount() {
		const count = clampTeamCount(elements.teamCount.value);
		const currentConfigs = Array.from({ length: state.configTeams.length }, (_, index) => readTeamConfigFromForm(index));
		const nextConfigs = buildDefaultTeamConfigs(count);

		for (let index = 0; index < count; index++) {
			if (currentConfigs[index]) {
				nextConfigs[index] = currentConfigs[index];
			}
		}

		state.configTeams = nextConfigs;
		elements.teamCount.value = String(count);
		renderTeamConfig();
	}

	function applyCustomSettings() {
		const count = clampTeamCount(elements.teamCount.value);

		state.configTeams = Array.from({ length: count }, (_, index) => readTeamConfigFromForm(index));
		elements.teamCount.value = String(count);
	}

	function readTeamConfigFromForm(index) {
		const fallbackConfig = state.configTeams[index] || {};
		const fallbackColor = DEFAULT_TEAM_COLORS[index % DEFAULT_TEAM_COLORS.length];
		const nameInput = elements.teamsConfig.querySelector(`[data-team-name="${index}"]`);
		const timeInput = elements.teamsConfig.querySelector(`[data-team-time="${index}"]`);
		const colorInput = elements.teamsConfig.querySelector(`[data-team-color="${index}"]`);

		return {
			name: nameInput && nameInput.value.trim() ? nameInput.value.trim() : fallbackConfig.name || `Equipo ${index + 1}`,
			seconds: timeInput ? clampSeconds(timeInput.value) : clampSeconds(fallbackConfig.seconds),
			color: normalizeColor(colorInput?.value || fallbackConfig.color, fallbackColor),
			questions: defaultQuestions.map(question => {
				const field = elements.teamsConfig.querySelector(`[data-team-definition="${index}-${question.letter}"]`);
				const fallbackQuestion = fallbackConfig.questions?.find(item => item.letter === question.letter);

				return {
					letter: question.letter,
					definition: field ? field.value.trim() : fallbackQuestion?.definition || ''
				};
			})
		};
	}

	function buildTeamConfig(teamConfig, index) {
		const wrapper = document.createElement('details');
		const summary = document.createElement('summary');
		const fields = document.createElement('div');
		const nameGroup = document.createElement('label');
		const nameLabel = document.createElement('span');
		const nameInput = document.createElement('input');
		const timeGroup = document.createElement('label');
		const timeLabel = document.createElement('span');
		const timeInput = document.createElement('input');
		const colorGroup = document.createElement('label');
		const colorLabel = document.createElement('span');
		const colorInput = document.createElement('input');
		const definitions = document.createElement('div');

		wrapper.className = 'team-config';
		wrapper.open = index === 0;
		summary.className = 'team-config__summary';
		summary.textContent = teamConfig.name || `Equipo ${index + 1}`;
		fields.className = 'team-config__fields';

		nameGroup.className = 'config-field';
		nameLabel.className = 'field-label';
		nameLabel.textContent = 'Nombre';
		nameInput.className = 'text-input';
		nameInput.type = 'text';
		nameInput.value = teamConfig.name || `Equipo ${index + 1}`;
		nameInput.dataset.teamName = index;
		nameGroup.append(nameLabel, nameInput);

		timeGroup.className = 'config-field';
		timeLabel.className = 'field-label';
		timeLabel.textContent = 'Tiempo';
		timeInput.className = 'time-input';
		timeInput.type = 'number';
		timeInput.min = MIN_SECONDS;
		timeInput.max = MAX_SECONDS;
		timeInput.value = clampSeconds(teamConfig.seconds);
		timeInput.dataset.teamTime = index;
		timeGroup.append(timeLabel, timeInput);

		colorGroup.className = 'config-field config-field--inline';
		colorLabel.className = 'field-label';
		colorLabel.textContent = 'Color';
		colorInput.className = 'color-input';
		colorInput.type = 'color';
		colorInput.value = normalizeColor(teamConfig.color, DEFAULT_TEAM_COLORS[index % DEFAULT_TEAM_COLORS.length]);
		colorInput.dataset.teamColor = index;
		colorGroup.append(colorLabel, colorInput);

		definitions.className = 'definitions-list';
		teamConfig.questions.forEach(question => {
			definitions.append(buildDefinitionEditor(question, index));
		});

		fields.append(nameGroup, timeGroup, colorGroup, definitions);
		wrapper.append(summary, fields);

		return wrapper;
	}

	function buildDefinitionEditor(question, teamIndex) {
		const wrapper = document.createElement('label');
		const label = document.createElement('span');
		const textarea = document.createElement('textarea');

		wrapper.className = 'definition-field';
		label.className = 'definition-field__letter';
		label.textContent = question.letter;
		textarea.className = 'definition-field__input';
		textarea.value = question.definition;
		textarea.placeholder = `Definicion ${question.letter}`;
		textarea.rows = 2;
		textarea.dataset.teamDefinition = `${teamIndex}-${question.letter}`;

		wrapper.append(label, textarea);

		return wrapper;
	}

	function renderTeamConfig() {
		const fragment = document.createDocumentFragment();

		state.configTeams.forEach((teamConfig, index) => {
			fragment.append(buildTeamConfig(teamConfig, index));
		});

		elements.teamsConfig.replaceChildren(fragment);
	}

	function handleKeyboard(event) {
		if (state.phase !== 'playing') {
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
		elements.quickGameButton.addEventListener('click', startQuickGame);
		elements.customizeGameButton.addEventListener('click', showConfig);
		elements.startCustomGameButton.addEventListener('click', startCustomGame);
		elements.backMenuButton.addEventListener('click', showMenu);
		elements.menuButton.addEventListener('click', showMenu);
		elements.playAgainButton.addEventListener('click', () => startGame(true));
		elements.goodButton.addEventListener('click', () => markAnswer('correct'));
		elements.wrongButton.addEventListener('click', () => markAnswer('wrong'));
		elements.skipButton.addEventListener('click', skipQuestion);
		elements.pauseButton.addEventListener('click', togglePause);
		elements.playTurnButton.addEventListener('click', playPreparedTurn);
		elements.closeButton.addEventListener('click', finishGame);
		elements.teamCount.addEventListener('change', syncTeamCount);
		document.addEventListener('keydown', handleKeyboard);
	}

	function init() {
		elements.teamCount.value = String(DEFAULT_TEAM_COUNT);
		state.teams = createTeamsFromConfig();
		renderTeamConfig();
		showMenu();
		bindEvents();
	}

	init();
})();
