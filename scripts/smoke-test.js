const fs = require('fs');
const vm = require('vm');

class ClassList {
	constructor(initial = '') {
		this.classes = new Set(initial.split(/\s+/).filter(Boolean));
	}

	add(...names) {
		names.forEach(name => this.classes.add(name));
	}

	remove(...names) {
		names.forEach(name => this.classes.delete(name));
	}

	contains(name) {
		return this.classes.has(name);
	}

	toggle(name, force) {
		const shouldAdd = force === undefined ? !this.contains(name) : force;

		if (shouldAdd) {
			this.add(name);
		} else {
			this.remove(name);
		}

		return shouldAdd;
	}
}

class Element {
	constructor(tag = 'div', id = '') {
		this.tag = tag;
		this.id = id;
		this.classList = new ClassList();
		this.children = [];
		this.listeners = {};
		this.dataset = {};
		this.attributes = {};
		this.textContent = '';
		this.value = '';
		this.disabled = false;
		this.open = false;
		this.rows = 0;
		this.type = '';
		this.min = '';
		this.max = '';
		this.placeholder = '';
	}

	set className(value) {
		this.classList = new ClassList(value);
	}

	get className() {
		return Array.from(this.classList.classes).join(' ');
	}

	append(...children) {
		this.children.push(...children);
	}

	replaceChildren(...children) {
		this.children = children.flatMap(child => child.tag === 'fragment' ? child.children : [child]);
	}

	addEventListener(type, handler) {
		this.listeners[type] = handler;
	}

	click() {
		if (!this.disabled) {
			this.listeners.click?.({ target: this });
		}
	}

	setAttribute(name, value) {
		this.attributes[name] = value;
	}

	querySelector(selector) {
		const dataMatch = selector.match(/^\[data-([a-z-]+)="(.+)"\]$/);

		if (!dataMatch) {
			return null;
		}

		const key = dataMatch[1].replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
		return find(this, child => String(child.dataset?.[key]) === dataMatch[2]) || null;
	}
}

function find(node, predicate) {
	for (const child of node.children || []) {
		if (predicate(child)) {
			return child;
		}

		const nested = find(child, predicate);

		if (nested) {
			return nested;
		}
	}

	return null;
}

function all(node, predicate, output = []) {
	for (const child of node.children || []) {
		if (predicate(child)) {
			output.push(child);
		}

		all(child, predicate, output);
	}

	return output;
}

const ids = [
	'js--boards',
	'js--ng-controls',
	'js--config-controls',
	'js--question-controls',
	'js--pa-controls',
	'js--close',
	'js--quick-game',
	'js--customize-game',
	'js--start-custom-game',
	'js--back-menu',
	'js--menu',
	'js--pa',
	'js--bien',
	'js--mal',
	'js--pasapalabra',
	'js--pause',
	'js--play-turn',
	'js--team-count',
	'js--teams-config',
	'js--turn-label',
	'js--hint',
	'js--definition',
	'js--end-title',
	'js--end-subtitle'
];

const elements = Object.fromEntries(ids.map(id => [id, new Element('div', id)]));
['js--config-controls', 'js--question-controls', 'js--pa-controls', 'js--close', 'js--play-turn'].forEach(id => {
	elements[id].classList.add('hidden');
});
elements['js--team-count'].value = '1';

let keydownHandler;
let intervalHandler;

const sandbox = {
	console,
	document: {
		getElementById: id => elements[id],
		createElement: tag => new Element(tag),
		createDocumentFragment: () => new Element('fragment'),
		addEventListener: (type, handler) => {
			if (type === 'keydown') {
				keydownHandler = handler;
			}
		}
	},
	window: {
		setInterval: handler => {
			intervalHandler = handler;
			return 1;
		},
		clearInterval: () => {
			intervalHandler = null;
		}
	},
	Number,
	Array,
	Math
};

sandbox.globalThis = sandbox;
vm.runInNewContext(fs.readFileSync('js/app.js', 'utf8'), sandbox, { filename: 'js/app.js' });

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

function board(index) {
	return elements['js--boards'].children[index];
}

function boardState(index) {
	return all(board(index), child => child.classList?.contains('team-board__state'))[0]?.textContent;
}

function boardName(index) {
	return all(board(index), child => child.classList?.contains('team-board__name'))[0]?.textContent;
}

function statusCount(index, cls) {
	return all(board(index), child => child.classList?.contains(cls)).length;
}

assert(elements['js--boards'].children.length === 1, 'menu should render one default board');
assert(boardName(0) === 'Equipo 1', 'default team name should render');

elements['js--customize-game'].click();
elements['js--team-count'].value = '3';
elements['js--team-count'].listeners.change();
assert(elements['js--teams-config'].children.length === 3, 'config should render three team configs');

elements['js--teams-config'].querySelector('[data-team-name="0"]').value = 'Azul';
elements['js--teams-config'].querySelector('[data-team-name="1"]').value = 'Naranja';
elements['js--teams-config'].querySelector('[data-team-name="2"]').value = 'Verde';
elements['js--teams-config'].querySelector('[data-team-time="0"]').value = '250';
elements['js--teams-config'].querySelector('[data-team-time="1"]').value = '12';
elements['js--teams-config'].querySelector('[data-team-time="2"]').value = '5';
elements['js--teams-config'].querySelector('[data-team-definition="0-A"]').value = 'Def A Azul';
elements['js--teams-config'].querySelector('[data-team-definition="1-A"]').value = 'Def A Naranja';
elements['js--teams-config'].querySelector('[data-team-definition="2-A"]').value = 'Def A Verde';
elements['js--start-custom-game'].click();

assert(elements['js--boards'].children.length === 3, 'game should render three boards');
assert(boardName(0) === 'Azul', 'team 1 name should apply');
assert(elements['js--hint'].textContent === 'A', 'first active letter should be visible while playing');
assert(elements['js--definition'].textContent === 'Def A Azul', 'active definition should be visible while playing');
assert(boardState(0) === 'En juego', 'team 1 should be playing');

elements['js--bien'].click();
assert(boardState(0) === 'En juego', 'correct answer should keep same team playing');
assert(elements['js--hint'].textContent === 'B', 'correct answer should advance same board to next letter');
assert(statusCount(0, 'item--success') === 1, 'team 1 should have one success');

elements['js--pasapalabra'].click();
assert(boardState(1) === 'Listo', 'pasapalabra should prepare next team');
assert(elements['js--hint'].textContent === '', 'ready turn should hide letter');
assert(elements['js--definition'].textContent === 'Listo para el siguiente equipo.', 'ready turn should not reveal question info');
assert(!elements['js--play-turn'].classList.contains('hidden'), 'turn start button should be visible while ready');
assert(elements['js--bien'].disabled === true, 'answer controls should be disabled while ready');

elements['js--play-turn'].click();
assert(boardState(1) === 'En juego', 'turn start should activate next team');
assert(elements['js--hint'].textContent === 'A', 'team 2 letter should appear after turn start');
assert(elements['js--definition'].textContent === 'Def A Naranja', 'team 2 definition should appear after turn start');
elements['js--mal'].click();
assert(boardState(2) === 'Listo', 'wrong answer should prepare next team');
assert(statusCount(1, 'item--failure') === 1, 'team 2 should have one failure');

elements['js--play-turn'].click();
assert(boardState(2) === 'En juego', 'team 3 should play');
for (let i = 0; i < 5; i++) {
	intervalHandler();
}
assert(boardState(2) === 'Tiempo agotado', 'team 3 should finish when time reaches zero');
assert(boardState(0) === 'Listo', 'finished team should be skipped and next playable team prepared');

elements['js--play-turn'].click();
for (let i = 0; i < 25; i++) {
	elements['js--bien'].click();
}
assert(boardState(1) === 'Listo', 'after team 1 completes, team 2 should be prepared');
assert(boardState(0) === 'Finalizado', 'team 1 should be completed');
assert(typeof keydownHandler === 'function', 'keyboard handler should be bound');

elements['js--play-turn'].click();
assert(elements['js--definition'].textContent === '', 'empty definitions should render no filler text');
assert(elements['js--definition'].classList.contains('definition--empty'), 'empty definitions should collapse the definition block');

console.log('Smoke test OK');
