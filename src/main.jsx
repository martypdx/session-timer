import './style.css';
import Header from './Header.jsx';

document.body.prepend(<Header />);

if(Notification) {
    if(Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        // async
        Notification.requestPermission();
    }
}

const ul = document.getElementById('sessions');
const timer = document.getElementById('timer');

const DEFAULT = 25;
const TEST = 1 / 6;
function getDuration() {
    try {
        const params = new URLSearchParams(location.search);
        const value = params.get('minutes');
        if(value === 'test') return TEST;
        if(!value || isNaN(value) || value < 1) return DEFAULT;
        return parseInt(value);
    }
    catch(_) {
        return DEFAULT;
    }
}

const sexagesimal = s => s.toString().padStart(2, '0');

function updateTimeRemaining(time) {
    const ms = session - (time - start);
    const seconds = Math.round(ms / 1000);
    const minutes = Math.trunc(seconds / 60);
    const remain = seconds % 60;
    timer.textContent = `${sexagesimal(minutes)}:${sexagesimal(remain)}`;
}

let start = null;
function resetTimer() {
    start = new Date();
    updateTimeRemaining(start);
}
function updateTimer() {
    const time = new Date();
    updateTimeRemaining(time);
    return time;
}

let minutes = getDuration();
let session = 1000 * 60 * minutes;
startSession();

function startSession() {
    resetTimer();
    let interval = setInterval(() => {
        const time = updateTimer();

        if(time - start > session) {
            clearInterval(interval);
            const li = document.createElement('li');
            li.classList.add('session-circle')
            ul.prepend(li);
            queueMicrotask(sessionComplete);
        }
    }, 1000);
}

function sessionComplete() {
    resetTimer();
    window.focus();
    const notification = notify('session complete');
    if(!notification) next();
    else {
        notification.addEventListener('click', next, { once: true });
        notification.addEventListener('close', next, { once: true });
        document.addEventListener('click', next, { once: true });
    }

    function next() {
        window.focus();
        startSession();
        if(notification) {
            notification.close();
            notification.removeEventListener('click', next, { once: true });
            notification.removeEventListener('close', next, { once: true });
            document.removeEventListener('click', next, { once: true });
        }
    }
}

function notify(message) {
    if(Notification.permission === 'granted') {
        return new Notification(message);
    }
    alert(message);
    return null;
}
