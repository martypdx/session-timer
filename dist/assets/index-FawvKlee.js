class RawHtml extends HTMLElement {
  constructor() {
    super();
    this.#setInnerHTML(this.html);
  }
  #setInnerHTML(raw) {
    this.innerHTML = raw ?? "";
  }
  set html(raw) {
    this.#setInnerHTML(raw);
  }
}
window.customElements.define("raw-html", RawHtml);

function compose(input, anchor, keepLast = false) {
    const type = typeof input;
    switch(true) {
        case input === undefined:
        case input === null:
        case input === true:
        case input === false:
        case input === '':
            if(!keepLast) removePrior(anchor);
            break;
        case type === 'string':
        case type === 'number':
        case input instanceof Node: {
            inject(input, anchor, keepLast);
            break;
        }
        case type === 'function':
            compose(input(), anchor, keepLast);
            break;
        case input instanceof Promise:
            input.then(v => compose(v, anchor, keepLast));
            break;
        case Array.isArray(input):
            composeArray(input, anchor);
            break;
        case type === 'object': {
            composeObject(input, anchor, keepLast);
            break;
        }
        default: {
            throwTypeError(input, type);
        }
    }
}


function composeObject(object, anchor, keepLast) {
    switch(true) {
        case object instanceof ReadableStream:
            composeStream(object, anchor, true);
            break;
        // w/o the !! this cause intermittent failures
        case !!object[Symbol.asyncIterator]:
            composeAsyncIterator(object, anchor, keepLast);
            break;
        case object.subscribe:
        case object.on:
        default: {
            throwTypeErrorForObject(object);
        }
    }
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


async function composeAsyncIterator(iterator, anchor, keepLast) {
    for await(const value of iterator) {
        compose(value, anchor, keepLast);
    }
}

async function composeStream(stream, anchor, keepLast) {
    const writeable = new WritableStream({
        write(chunk) {
            compose(chunk, anchor, keepLast);
        }
    });
    stream.pipeTo(writeable);
}

function composeElement(Constructor, anchor, props) {
    const dom = createElement(Constructor, props);
    // TODO: optimize arrays here or in compose array
    compose(dom, anchor);
}

function createElement(Constructor, props) {
    // let JavaScript handle it :)
    // will throw appropriate errors, 
    // so key point for source maps in callers
    return new Constructor(props);
}

function removePrior(anchor) {
    const count = +anchor.data;
    if(!count) return;
    if(tryRemovePrior(anchor)) anchor.data = `${count - 1}`;
}

function inject(input, anchor, keepLast) {
    let count = +anchor.data;
    if(!keepLast && count > 0 && tryRemovePrior(anchor)) count--;

    // happy-dom bug
    const type = typeof input;
    const isDomNode = input instanceof Node;
    if(type !== 'string' && !isDomNode) {
        input = `${input}`;
    }

    anchor.before(input);
    anchor.data = `${count + 1}`;
}

// TODO: TEST array in array with replace param
function composeArray(array, anchor) {
    // TODO: optimize arrays here if Node[]
    for(let i = 0; i < array.length; i++) {
        compose(array[i], anchor, true);
    }
}

function throwTypeError(input, type, footer = '') {
    throw new TypeError(`\
Invalid {...} compose input type "${type}", \
value ${input}.${footer}`
    );
}

// need to walk additional comments
function tryRemovePrior({ previousSibling }) {
    if(!previousSibling) return false;
    if(previousSibling.nodeType !== 3 /* comment */) {
        // TODO: id azoth comments only!
        removePrior(previousSibling);
    }
    previousSibling.remove();
    return true;
}

const templates = new Map();

function rendererById(id, isFragment = false) {
    if(templates.has(id)) return templates.get(id);

    const templateEl = document.getElementById(id);
    if(!templateEl) {
        throw new Error(`No template with id "${id}"`);
    }

    return rendererFactory(id, templateEl.content, isFragment);
}

function rendererFactory(id, node, isFragment) {
    const render = renderer(node, isFragment);
    templates.set(id, render);
    return render;
}

function renderer(fragment, isFragment) {
    if(!isFragment) fragment = fragment.firstElementChild;
    // TODO: malformed fragments...necessary?

    return function render() {
        const clone = fragment.cloneNode(true);
        const targets = clone.querySelectorAll('[data-bind]');
        return [clone, targets];
    };
}

const t555ef61c41 = rendererById('555ef61c41');

const t0f98a5efc2 = rendererById('0f98a5efc2');

const ta6c748f246 = rendererById('a6c748f246');

const t09500b6b17 = rendererById('09500b6b17');

const tf94d7f303e = rendererById('f94d7f303e');

const t44e1e573ec = rendererById('44e1e573ec');

function getFoci() {
  const [initialValue, setValue] = storedObject("FOCI");
  const foci = initialValue ?? [{}];
  let current = foci.at(-1);
  console.log({ current });
  function dispatch({ type, payload }) {
    if (type === "UPDATE") {
      current[payload.key] = payload.value;
    }
    if (type === "ADD") {
      foci.push(current = {});
      console.log("new current");
    } else {
      throw new Error(`Unrecognized foci dispatch type "${type}"`);
    }
    setValue(foci);
  }
  return [foci, dispatch];
}
function storedObject(key, defaultValue) {
  const initialValue = get(key) ?? defaultValue;
  function setValue(value) {
    if ((value ?? "") !== "") {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.removeItem(key);
    }
  }
  return [initialValue, setValue];
}
function get(key) {
  const json = localStorage.getItem(key);
  if (json) {
    try {
      return JSON.parse(json);
    } catch (ex) {
      localStorage.removeItem(key);
    }
  }
  return null;
}

function FocusPlay() {
  let [initial, dispatch] = getFoci();
  const [__root, __targets] = t0f98a5efc2();
  const __target0 = __targets[0];
  const __child0 = __root.childNodes[1];
  const __child1 = __root.childNodes[3];
  composeElement(FocusPlayButton, __child0);
  composeElement(Focus, __child1, { focus: initial[0], update: dispatch });
  __target0.onclick = () => dispatch({
    type: "ADD"
  });
  return __root;
}
function FocusPlayButton() {
  return ta6c748f246()[0];
}
function Focus({ focus, update }) {
  const handleEnter = ({ key, target }) => {
    if (key === "Enter" && document.hasFocus(target))
      target.blur();
  };
  const handleInput = ({ target: { innerHTML, ariaLabel } }) => {
    update({
      type: "UPDATE",
      payload: [ariaLabel, innerHTML === "<br>" ? "" : innerHTML]
    });
  };
  const $priority = (() => {
    const __root2 = t09500b6b17()[0];
    __root2.oninput = handleInput;
    __root2.onkeydown = handleEnter;
    return __root2;
  })();
  $priority.innerHTML = focus?.priority ?? "";
  const $exit = (() => {
    const __root2 = tf94d7f303e()[0];
    __root2.oninput = handleInput;
    __root2.onkeydown = handleEnter;
    return __root2;
  })();
  $exit.innerHTML = focus?.exit ?? "";
  const __root = t44e1e573ec()[0];
  const __child0 = __root.childNodes[1];
  const __child1 = __root.childNodes[3];
  compose($priority, __child0);
  compose($exit, __child1);
  return __root;
}

const t5a5f40ed46 = rendererById('5a5f40ed46');

function useLocalStorage(key) {
  const initialValue = localStorage.getItem(key);
  function setValue(value) {
    if ((value ?? "") !== "") {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  }
  return [initialValue, setValue];
}

const THEME_KEY = "theme.mode";
function useTheme() {
  let [initialTheme, saveTheme] = useLocalStorage(THEME_KEY);
  initialTheme = initialTheme ?? "";
  const html = document.querySelector("html");
  const setHTMLTheme = (theme) => html.className = theme;
  setHTMLTheme(initialTheme);
  const setTheme = (theme) => {
    saveTheme(theme);
    setHTMLTheme(theme);
  };
  return [initialTheme, setTheme];
}
function Theme() {
  const [initialTheme, setTheme] = useTheme();
  const __root = t5a5f40ed46()[0];
  __root.value = initialTheme;
  __root.onchange = ({ target }) => setTheme(target.value);
  return __root;
}

function Header() {
  const __root = t555ef61c41()[0];
  const __child0 = __root.childNodes[1];
  const __child1 = __root.childNodes[3];
  composeElement(FocusPlay, __child0);
  composeElement(Theme, __child1);
  return __root;
}

document.body.prepend(/* @__PURE__ */ React.createElement(Header, null));
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
const format = (s) => s.toString().padStart(2, "0");
function updateTimeRemaining(time) {
  const ms = session - (time - start);
  const seconds = Math.round(ms / 1e3);
  const minutes2 = Math.trunc(seconds / 60);
  const remain = seconds % 60;
  timer.textContent = `${format(minutes2)}:${format(remain)}`;
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
    notification.addEventListener("click", next, { once: true });
    notification.addEventListener("close", next, { once: true });
    document.addEventListener("click", next, { once: true });
  }
  function next() {
    window.focus();
    startSession();
    if (notification) {
      notification.close();
      notification.removeEventListener("click", next, { once: true });
      notification.removeEventListener("close", next, { once: true });
      document.removeEventListener("click", next, { once: true });
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
