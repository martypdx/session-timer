const ul = document.getElementById('sessions');
const timer = document.getElementById('timer');
const params = new URLSearchParams(location.search);
let start = new Date();
const DEFAULT = 25;
let minutes = DEFAULT;
try {
    const value = params.get('minutes') || DEFAULT;
    minutes = isNaN(value) || !(value >= 1) ? DEFAULT : parseInt(value);
}
catch(ignore) { }

let session = 1000 * 3; //60 * minutes;
console.log({ session })
const format = s => s.toString().padStart(2, '0');
function updateTimeRemaining(time) {
    const ms = session - (time - start);
    const raw = Math.trunc(ms / 1000);
    const minutes = Math.trunc(raw / 60);
    const seconds = raw % 60;
    timer.textContent = `${format(minutes)}:${format(seconds)}`;
}

updateTimeRemaining(start);

let interval = setInterval(() => {
    const time = new Date();
    updateTimeRemaining(time);
    if(time - start > session) {
        ul.prepend(document.createElement('li'));
        queueMicrotask(() => {
            // alert('session complete!');
            start = new Date();
            updateTimeRemaining(start);
        });
    }
}, 1000);