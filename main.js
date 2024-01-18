import './theme.js';

if(Notification) {
    if(Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        // async
        Notification.requestPermission();
    }
}

function notify(message) {
    if(Notification.permission === "granted") {
        return new Notification(message);
    }
    else {
        window.focus();
        alert(message);
        return null;
    }
}

const ul = document.getElementById('sessions');
const timer = document.getElementById('timer');
const params = new URLSearchParams(location.search);
let start = new Date();
const DEFAULT = 25;
let minutes = DEFAULT;
try {
    const value = params.get('minutes') || DEFAULT;
    if(value === 'test') {
        minutes = .1;
    }
    else {
        minutes = isNaN(value) || !(value >= 1) ? DEFAULT : parseInt(value);
    }
}
catch(ignore) { }

let session = 1000 * 60 * minutes;

const format = s => s.toString().padStart(2, '0');
function updateTimeRemaining(time) {
    const ms = session - (time - start);
    const raw = Math.trunc(ms / 1000);
    const minutes = Math.trunc(raw / 60);
    const seconds = raw % 60;
    timer.textContent = `${format(minutes)}:${format(seconds)}`;
}

updateTimeRemaining(start);
startInterval();

function startInterval() {
    let interval = setInterval(() => {
        const time = new Date();
        updateTimeRemaining(time);
        if(time - start > session) {
            clearInterval(interval);
            ul.prepend(document.createElement('li'));
            queueMicrotask(() => {
                start = new Date();
                updateTimeRemaining(start);
                const next = () => {
                    start = new Date();
                    updateTimeRemaining(start);
                    startInterval();
                    if(notification) {
                        notification.close();
                        notification.removeEventListener('click', next, { once: true });
                        notification.removeEventListener('close', next, { once: true });
                        document.removeEventListener('click', next, { once: true });
                    }
                }

                const notification = notify('session complete');
                if(!notification) next();
                else {
                    notification.addEventListener('click', next, { once: true });
                    notification.addEventListener('close', next, { once: true });
                    document.addEventListener('click', next, { once: true });
                }
            });
        }
    }, 1000);
}