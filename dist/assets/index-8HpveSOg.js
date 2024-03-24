true&&(function polyfill() {
    const relList = document.createElement('link').relList;
    if (relList && relList.supports && relList.supports('modulepreload')) {
        return;
    }
    for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
        processPreload(link);
    }
    new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type !== 'childList') {
                continue;
            }
            for (const node of mutation.addedNodes) {
                if (node.tagName === 'LINK' && node.rel === 'modulepreload')
                    processPreload(node);
            }
        }
    }).observe(document, { childList: true, subtree: true });
    function getFetchOpts(link) {
        const fetchOpts = {};
        if (link.integrity)
            fetchOpts.integrity = link.integrity;
        if (link.referrerPolicy)
            fetchOpts.referrerPolicy = link.referrerPolicy;
        if (link.crossOrigin === 'use-credentials')
            fetchOpts.credentials = 'include';
        else if (link.crossOrigin === 'anonymous')
            fetchOpts.credentials = 'omit';
        else
            fetchOpts.credentials = 'same-origin';
        return fetchOpts;
    }
    function processPreload(link) {
        if (link.ep)
            // ep marker = processed
            return;
        link.ep = true;
        // prepopulate the load record
        const fetchOpts = getFetchOpts(link);
        fetch(link.href, fetchOpts);
    }
}());

/* compose, composeElement, create, createElement */
const IGNORE = Symbol.for('azoth.compose.IGNORE');

class Sync {
    static wrap(initial, input) {
        return new this(initial, input);
    }
    constructor(initial, input) {
        this.initial = initial;
        this.input = input;
    }
}

function compose(anchor, input, keepLast, props, slottable) {
    if(keepLast !== true) keepLast = false;
    const type = typeof input;

    switch(true) {
        case input === IGNORE:
            break;
        case input === undefined:
        case input === null:
        case input === true:
        case input === false:
        case input === '':
            if(!keepLast) clear(anchor);
            break;
        case type === 'number':
        case type === 'bigint':
            input = `${input}`;
        // eslint-disable-next-line no-fallthrough
        case type === 'string':
            replace(anchor, input, keepLast);
            break;
        case input instanceof Node:
            if(props) Object.assign(input, props);
            if(slottable) input.slottable = slottable;
            replace(anchor, input, keepLast);
            break;
        case input instanceof Sync:
            compose(anchor, input.initial, keepLast);
            compose(anchor, input.input, keepLast, props, slottable);
            break;
        case type === 'function': {
            // will throw if function is class,
            // unlike create or compose element
            let out = slottable
                ? input(props, slottable)
                : props ? input(props) : input();
            compose(anchor, out, keepLast);
            break;
        }
        case type !== 'object': {
            // ES2023: Symbol should be only type  
            throwTypeError(input, type);
            break;
        }
        case input instanceof Promise:
            input.then(value => compose(anchor, value, keepLast, props, slottable));
            break;
        case Array.isArray(input):
            composeArray(anchor, input, keepLast);
            break;
        // w/o the !! this causes intermittent failures :p maybe vitest/node thing?
        case !!input[Symbol.asyncIterator]:
            composeAsyncIterator(anchor, input, keepLast, props, slottable);
            break;
        case input instanceof ReadableStream:
            // no props and slottable propagation on streams
            composeStream(anchor, input, true);
            break;
        case isRenderObject(input): {
            let out = slottable
                ? input.render(props, slottable)
                : props ? input.render(props) : input.render();
            compose(anchor, out, keepLast);
            break;
        }
        // TODO:
        case !!input.subscribe:
        case !!input.on:
        default: {
            throwTypeErrorForObject(input);
        }
    }
}

const isRenderObject = obj => obj && typeof obj === 'object' && obj.render && typeof obj.render === 'function';

function createElement(Constructor, props, slottable, topLevel = false) {
    const result = create(Constructor, props, slottable);
    if(!topLevel) return result;

    // result is returned to caller, not composed by Azoth,
    // force to be of type Node or null:
    // strings and numbers into text nodes
    // non-values to null
    const type = typeof result;
    switch(true) {
        case type === 'string':
        case type === 'number':
            return document.createTextNode(result);
        case result === undefined:
        case result === null:
        case result === true:
        case result === false:
        case result === IGNORE:
            return null;
        default:
            return result;
    }
}

function create(input, props, slottable, anchor) {
    const type = typeof input;
    switch(true) {
        case input instanceof Node:
            if(props) Object.assign(input, props);
        // eslint-disable-next-line no-fallthrough
        case type === 'string':
        case type === 'number':
        case input === undefined:
        case input === null:
        case input === true:
        case input === false:
        case input === '':
        case input === IGNORE:
            return anchor ? void compose(anchor, input) : input;
        case !!(input.prototype?.constructor): {
            // eslint-disable-next-line new-cap
            return create(new input(props, slottable), null, null, anchor);
        }
        case type === 'function':
            return create(input(props, slottable), null, null, anchor);
        case type !== 'object': {
            throwTypeError(input, type);
            break;
        }
        case isRenderObject(input):
            return create(input.render(props, slottable), null, null, anchor);
        default: {
            // these inputs require a comment anchor to which they can render
            if(!anchor) anchor = document.createComment('0');

            if(input[Symbol.asyncIterator]) {
                composeAsyncIterator(anchor, input, false, props, slottable);
            }
            else if(input instanceof Promise) {
                input.then(value => {
                    create(value, props, slottable, anchor);
                });
            }
            else if(Array.isArray(input)) {
                composeArray(anchor, input, false);
            }
            else if(input instanceof Sync) {
                // REASSIGN anchor! sync input will compose _before_
                // anchor is appended to DOM, need container until then
                const commentAnchor = anchor;
                anchor = document.createDocumentFragment();
                anchor.append(commentAnchor);

                create(input.initial, props, slottable, commentAnchor);
                create(input.input, props, slottable, commentAnchor);
            }
            else {
                throwTypeErrorForObject(input);
            }

            return anchor;
        }
    }
}

/* replace and clear */

function replace(anchor, input, keepLast) {
    if(!keepLast) clear(anchor);
    anchor.before(input);
    anchor.data = ++anchor.data;
}

function clear(anchor) {
    let node = anchor;
    let count = +anchor.data;

    // TODO: validate count received

    while(count--) {
        const { previousSibling } = node;
        if(!previousSibling) break;

        if(previousSibling.nodeType === Node.COMMENT_NODE) {
            // TODO: how to guard for azoth comments only?
            clear(previousSibling);
        }

        previousSibling.remove();
    }

    anchor.data = 0;
}

/* complex types */

function composeArray(anchor, array, keepLast) {
    if(!keepLast) clear(anchor);
    // TODO: optimize arrays here if Node[]
    for(let i = 0; i < array.length; i++) {
        compose(anchor, array[i], true);
    }
}

async function composeStream(anchor, stream, keepLast) {
    stream.pipeTo(new WritableStream({
        write(chunk) {
            compose(anchor, chunk, keepLast);
        }
    }));
}

async function composeAsyncIterator(anchor, iterator, keepLast, props, slottable) {
    // TODO: use iterator and intercept system messages
    for await(const value of iterator) {
        compose(anchor, value, keepLast, props, slottable);
    }
}

/* thrown errors */

function throwTypeError(input, type, footer = '') {
    // Passing Symbol to `{...}` throws!
    if(type === 'symbol') input = 'Symbol';
    throw new TypeError(`\
Invalid compose {...} input type "${type}", value ${input}.\
${footer}`
    );
}

function throwTypeErrorForObject(obj) {
    let message = '';
    try {
        const json = JSON.stringify(obj, null, 2);
        message = `\n\nReceived as:\n\n${json}\n\n`;
    }
    catch(ex) {
        /* no-op */
    }
    throwTypeError(obj, 'object', message);
}

const QUERY_SELECTOR = '[data-bind]';
const DOMRenderer = {
    name: 'DOMRenderer',

    createTemplate(id, content, isFragment) {
        const node = DOMRenderer.template(id, content);
        if(!node) return null;
        const render = DOMRenderer.renderer(node, isFragment);
        return render;
    },

    template(id, content) {
        if(content) return DOMRenderer.create(content);
        if(content === '') return null;
        DOMRenderer.getById(id);
    },

    create(html) {
        const template = document.createElement('template');
        template.innerHTML = html;
        return template.content;
    },
    getById(id) {
        const template = document.getElementById(id);
        if(!template) {
            throw new Error(`No template with id "${id}"`);
        }
        return template.content;
    },

    renderer(fragment, isFragment) {
        if(!isFragment) fragment = fragment.firstElementChild;
        // TODO: malformed fragment check...necessary?

        return function render() {
            const clone = fragment.cloneNode(true);
            const targets = clone.querySelectorAll(QUERY_SELECTOR);
            return [clone, targets];
        };
    },
    bound(dom) {
        return dom.querySelectorAll(QUERY_SELECTOR);
    }
};

const templates = new Map(); // cache
let renderEngine = DOMRenderer; // DOM or HTML engine


function get(id, isFragment = false, content) {
    if(templates.has(id)) return templates.get(id);
    const template = renderEngine.createTemplate(id, content, isFragment);
    templates.set(id, template);
    return template;
}

const bindings = new Map(); // cache

// stack
const injectable = [];

const templateRenderer = getBound => (...args) => {
    const [root, bind] = getBound();
    if(bind) bind(...args);
    return root;
};

function renderer(id, targets, makeBind, isFragment, content) {
    const create = get(id, isFragment, content);

    function getBound() {
        let bind = null;
        let boundEls = null;
        let node = injectable.at(-1); // peek!

        // TODO: test injectable is right template id type

        if(node) {
            const hasBind = bindings.has(node);
            bind = bindings.get(node);
            if(hasBind) return [node, bind];
        }

        // if(!create) return [null, null];

        // Honestly not sure this really needed, 
        // use case would be list component optimize by
        // not keeping bind functions?
        // overhead is small as it is simple function
        if(node) boundEls = renderEngine.bound(node);
        else {
            // (destructuring re-assignment)
            ([node, boundEls] = create());
        }

        const nodes = targets ? targets(node, boundEls) : null;
        bind = makeBind ? makeBind(nodes) : null;

        bindings.set(node, bind);
        return [node, bind];
    }

    return templateRenderer(getBound);
}

renderer("d41d8cd98f", null, null, false);

const g7aa9d8ce95 = (r) => [r.childNodes[1],r.childNodes[3]];

const bc0cb5f0fcf = (ts) => {
  const t0 = ts[0], t1 = ts[1];
  return (v0, v1) => {
    compose(t0, v0);
    compose(t1, v1);
  };    
};

const tdf700eb6fb = renderer("df700eb6fb", g7aa9d8ce95, bc0cb5f0fcf, false);

const g7d31a73795 = (r,t) => [t[0],t[0],t[0],t[1],t[1],t[1]];

const bfe3979c34e = (ts) => {
  const t0 = ts[0], t1 = ts[1], t2 = ts[2], t3 = ts[3], t4 = ts[4], t5 = ts[5];
  return (v0, v1, v2, v3, v4, v5) => {
    t0.oninput = v0;
    t1.onkeydown = v1;
    t2.innerHTML = v2;
    t3.oninput = v3;
    t4.onkeydown = v4;
    t5.innerHTML = v5;
  };    
};

const t595ce4fc0c = renderer("595ce4fc0c", g7aa9d8ce95, bc0cb5f0fcf, false);
const t8fc4292ef5 = renderer("8fc4292ef5", null, null, false);
const tbf8f797734 = renderer("bf8f797734", g7d31a73795, bfe3979c34e, false);

function useLocalStorage(key) {
    const initialValue = getValue(key);
    const setValue = setKeyedValue(key);
    return [initialValue, setValue];
}

function useLocalStorageJSON(key, defaultValue = null) {
    const initialValue = getObject(key) ?? defaultValue;
    const setValue = setKeyedValue(key, value => JSON.stringify(value));
    return [initialValue, setValue];
}

const getValue = key => localStorage.getItem(key);

const setKeyedValue = (key, serialize = null) => value => {
    if((value ?? '') !== '') {
        if(serialize) value = serialize(value);
        localStorage.setItem(key, value);
        return value;
    }

    localStorage.removeItem(key);
    return null;
};

function getObject(key) {
    const json = getValue(key);
    if(json) {
        try {
            return JSON.parse(json);
        }
        catch(ex) { // failed parse
            localStorage.removeItem(key);
        }
    }
    return null;
}

function useFocus() {
  const [foci, saveFocus] = useLocalStorageJSON("FOP.FOCI", [{
    priority: "priority",
    exit: "clear exit"
  }]);
  let focus = foci.at(-1);
  const update = (updates) => {
    Object.assign(focus, updates);
    saveFocus(foci);
  };
  return [focus, update];
}
function FocusPlay() {
  const [focus, update] = useFocus();
  return t595ce4fc0c(createElement(FocusPlayButton), createElement(EditableFocus, { priority: focus.priority, exit: focus.exit, update }));
}
function FocusPlayButton() {
  return t8fc4292ef5();
}
function EditableFocus({ priority, exit, update }) {
  const handleEnter = ({ key, target }) => {
    if (key === "Enter" && document.hasFocus(target)) {
      target.blur();
    }
  };
  const handleInput = ({ target: { innerHTML, ariaLabel } }) => {
    update({
      [ariaLabel]: innerHTML === "<br>" ? "" : innerHTML
    });
  };
  return tbf8f797734(handleInput, handleEnter, priority ?? "", handleInput, handleEnter, exit ?? "");
}

const gc0cb5f0fcf = (r) => [r,r];

const b17fbb73f8e = (ts) => {
  const t0 = ts[0], t1 = ts[1];
  return (v0, v1) => {
    t0.value = v0;
    t1.onchange = v1;
  };    
};

const t075f120336 = renderer("075f120336", gc0cb5f0fcf, b17fbb73f8e, false);

function withResolvers() {
    let resolve = null, reject = null;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

if(!Promise.withResolvers) {
    Promise.withResolvers = withResolvers;
}

class AsyncTypeError extends TypeError {
    constructor(asyncProvider) {
        let message = '';
        if(!asyncProvider) {
            message = `Missing async provider argument.` + getObjectJSON(asyncProvider);
        }
        else {
            const type = typeof (asyncProvider);
            message = `\
Invalid async provider type "${type}". Expected a valid async provider, or \
a function that returns an async provider."`;

            if(type === 'object') message += getObjectJSON(asyncProvider);
        }

        super(message);

    }
}

// TODO: this is in both maya and channels
function getObjectJSON(obj) {
    let message = '';
    try {
        const json = JSON.stringify(obj, null, 2);
        message = ` Received:\n\n${json}\n\n`;
    }
    catch(ex) {
        /* no-op */
    }
    return message;
}

class OptionMissingFunctionArgumentError extends TypeError {
    constructor(option = 'map: true') {
        super(`\
More arguments needed: option "${option}" requires a mapping function.`);
    }
}

class TransformNotFunctionArgumentError extends TypeError {
    constructor(value, { method = 'generator', param = 'transform' } = {}) {
        super(`\
The "${param}" argument must be a function. If you want to use an initial \
value with no function, pass "null" as the first argument to "${method}".` + getObjectJSON(value));
    }
}

class InitOptionWithSyncWrappedAsyncProviderError extends TypeError {
    constructor() {
        super(`\
Option "init" was supplied with an async provider that \
is wrapped with its own initial synchronous initial value to be provided \
as the initial input of this channel. Use one or the other, but not both.`
        );
    }
}

function resolveArgs(transform, options) {
    if(!options && typeof transform === 'object') {
        options = transform;
        transform = null;
    }

    const init = options?.init;
    const start = options?.start;
    const map = !!options?.map;

    if(map && !transform) {
        throw new OptionMissingFunctionArgumentError();
    }

    return {
        transform,
        init, start, map,
        hasStart: start !== undefined,
        hasInit: init !== undefined,
    };
}

function generator(transformArg, options) {
    const {
        transform,
        init, start, map,
        hasStart, hasInit
    } = resolveArgs(transformArg, options);

    const maybeTransform = payload => transform ? transform(payload) : payload;
    let onDeck = hasStart && hasInit ? maybeTransform(init) : undefined;
    const relay = { resolve: null };

    function dispatch(payload) {
        if(map) payload = payload?.map(transform);
        else payload = maybeTransform(payload);

        if(relay.resolve) relay.resolve(payload);
        else onDeck = payload;
    }

    async function* generator() {
        let promise = null;
        let resolve = null;

        // this handles:
        // 1. maybeTransformed init when init is used with start
        // 2. dispatch fires via synchronous call during render
        while(onDeck !== undefined) {
            const received = onDeck;
            onDeck = undefined;
            yield received;
        }

        while(true) {
            ({ promise, resolve } = Promise.withResolvers());
            relay.resolve = resolve;
            yield await promise;
        }
    }

    let asyncIterator = generator();

    if(hasStart) {
        return [Sync.wrap(start, asyncIterator), dispatch];
    }

    if(hasInit) {
        const value = transform ? transform(init) : init;
        return [Sync.wrap(value, asyncIterator), dispatch];
    }

    return [asyncIterator, dispatch];
}

function consume(async, transform, options) {
    const {
        map, transform: consumer, // specialized version of transform
        init, hasStart, hasInit
    } = resolveArgs(transform, options);

    if(hasStart) {
        // TODO: move to throw.js
        throw new TypeError(`Option "start" cannot be used with consume as it does not emit values`);
    }

    let sync = init;
    if(async instanceof Sync) {
        if(hasInit) throw new InitOptionWithSyncWrappedAsyncProviderError();
        const { initial, input } = async;
        sync = initial;
        async = input;
    }

    if(sync !== undefined) consumer(sync);

    if(!map) doConsume(async, consumer);
    else mapConsume(async, consumer);
}

async function doConsume(async, transform) {
    if(async instanceof Promise) {
        async.then(transform);
    }
    else if(async?.[Symbol.asyncIterator]) {
        for await(const value of async) {
            transform(value);
        }
    }
    else {
        throw new AsyncTypeError(async);
    }
}

async function mapConsume(async, transform, map) {
    if(async instanceof Promise) {
        async.then(array => array?.map(transform));
    }
    else if(async?.[Symbol.asyncIterator]) {
        for await(const value of async) {
            value?.map(transform);
        }
    }
    else {
        throw new AsyncTypeError(async);
    }
}

function unicast(transform, init) {
    if(typeof transform !== 'function') {
        if(init !== undefined) {
            throw new TransformNotFunctionArgumentError(transform, { method: 'unicast' });
        }

        init = transform;
        transform = null;
    }

    return generator(transform, { init });
}

const html = document.querySelector("html");
function Theme() {
  const [saved, saveTheme] = useLocalStorage("FOP.THEME");
  const [theme, setTheme] = unicast(saveTheme, saved);
  consume(theme, (theme2) => html.className = theme2);
  return t075f120336(saved || "", ({ target: { value } }) => setTheme(value));
}

function Header() {
  return tdf700eb6fb(createElement(FocusPlay), createElement(Theme));
}

document.body.prepend(createElement(Header, true));
if (Notification) {
  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }
}
const ul = document.getElementById("sessions");
const timer = document.getElementById("timer");
const DEFAULT = 25;
const TEST = 1 / 6;
function getDuration() {
  try {
    const params = new URLSearchParams(location.search);
    const value = params.get("minutes");
    if (value === "test")
      return TEST;
    if (!value || isNaN(value) || value < 1)
      return DEFAULT;
    return parseInt(value);
  } catch (_) {
    return DEFAULT;
  }
}
const sexagesimal = (s) => s.toString().padStart(2, "0");
function updateTimeRemaining(time) {
  const ms = session - (time - start);
  const seconds = Math.round(ms / 1e3);
  const minutes2 = Math.trunc(seconds / 60);
  const remain = seconds % 60;
  timer.textContent = `${sexagesimal(minutes2)}:${sexagesimal(remain)}`;
}
let start = null;
function resetTimer() {
  start = /* @__PURE__ */ new Date();
  updateTimeRemaining(start);
}
function updateTimer() {
  const time = /* @__PURE__ */ new Date();
  updateTimeRemaining(time);
  return time;
}
let minutes = getDuration();
let session = 1e3 * 60 * minutes;
startSession();
function startSession() {
  resetTimer();
  let interval = setInterval(() => {
    const time = updateTimer();
    if (time - start > session) {
      clearInterval(interval);
      ul.prepend(document.createElement("li"));
      queueMicrotask(sessionComplete);
    }
  }, 1e3);
}
function sessionComplete() {
  resetTimer();
  window.focus();
  const notification = notify("session complete");
  if (!notification)
    next();
  else {
    notification.addEventListener("click", next, {
      once: true
    });
    notification.addEventListener("close", next, {
      once: true
    });
    document.addEventListener("click", next, {
      once: true
    });
  }
  function next() {
    window.focus();
    startSession();
    if (notification) {
      notification.close();
      notification.removeEventListener("click", next, {
        once: true
      });
      notification.removeEventListener("close", next, {
        once: true
      });
      document.removeEventListener("click", next, {
        once: true
      });
    }
  }
}
function notify(message) {
  if (Notification.permission === "granted") {
    return new Notification(message);
  }
  alert(message);
  return null;
}
//# sourceMappingURL=index-8HpveSOg.js.map
