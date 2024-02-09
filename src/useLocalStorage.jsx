export function useLocalStorage(key) {
    const initialValue = localStorage.getItem(key);
    function setValue(value) {
        if(value ?? '' !== '') {
            localStorage.setItem(key, value);
        }
        else {
            localStorage.removeItem(key);
        }
    }
    return [initialValue, setValue];
}
