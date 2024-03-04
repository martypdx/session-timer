import { useLocalJSONStorage } from './local-storage.js';
import { subject } from 'azoth/channels';

const KEY = 'FOP.THEME';

export function useTheme() {
    const [theme, setTheme] = useLocalJSONStorage('FOP.THEME');
    const options = theme ? { startWith: theme } : null;
    return subject(setTheme, options);
}