import { useLocalStorage } from './useLocalStorage';

const THEME_KEY = 'theme.mode';

function useTheme() {
    let [initialTheme, saveTheme] = useLocalStorage(THEME_KEY);
    initialTheme = initialTheme ?? '';

    const html = document.querySelector('html');
    const setHTMLTheme = theme => html.className = theme;
    setHTMLTheme(initialTheme);

    const setTheme = (theme) => {
        saveTheme(theme);
        setHTMLTheme(theme);
    };

    return [initialTheme, setTheme];
}

export default function Theme() {
    const [initialTheme, setTheme] = useTheme();

    return <select name="select-theme" class="theme" value={initialTheme}
        onchange={({ target }) => setTheme(target.value)}>
        <option value="light" title="light theme">🌇</option>
        <option class="auto" value="" title="device theme" selected>🃏</option>
        <option value="dark" title="dark theme">🌃</option>
    </select>;
}