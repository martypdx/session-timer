export function useLocalValueStorage(key) {
    const initialValue = getValue(key);
    const setValue = setKeyedValue(key);
    return [initialValue, setValue];
}

export function useLocalJSONStorage(key, defaultValue = null) {
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
