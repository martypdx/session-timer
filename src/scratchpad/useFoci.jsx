export function getFoci() {
    const [initialValue, setValue] = storedObject('FOCI');
    const foci = initialValue ?? [{}];
    let current = foci.at(-1);

    function dispatch({ type, payload }) {
        if(type === 'UPDATE') {
            current[payload.key] = payload.value;
            // no dispatch...
        }
        if(type === 'ADD') {
            foci.push(current = {});
            console.log('new current');
            // dispatch...
        }
        else {
            throw new Error(`Unrecognized foci dispatch type "${type}"`);
        }
        setValue(foci);
    }

    return [foci, dispatch];
}

function storedObject(key, defaultValue) {
    const initialValue = get(key) ?? defaultValue;

    function setValue(value) {
        if((value ?? '') !== '') {
            localStorage.setItem(key, JSON.stringify(value));
        }
        else {
            localStorage.removeItem(key);
        }
    }

    return [initialValue, setValue];
}

function get(key) {
    const json = localStorage.getItem(key);

    if(json) {
        try {
            return JSON.parse(json);
        }
        catch(ex) {
            // failed parse
            localStorage.removeItem(key);
        }
    }

    return null;
}