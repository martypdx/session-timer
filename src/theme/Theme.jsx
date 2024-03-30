import { unicast } from 'azoth/chronos/generators';
import { consume } from 'azoth/chronos/channels';
import { useLocalStorage } from '../local-storage.js';
import './Theme.css';

const html = document.querySelector('html');

export default function Theme() {
    const [saved, saveTheme] = useLocalStorage('FOP.THEME');
    const [theme, setTheme] = unicast(saveTheme, saved);
    consume(theme, theme => html.className = theme);

    return <select name="select-theme" class="theme"
        value={saved || ''}
        onchange={({ target: { value } }) => setTheme(value)}>
        <option value="light" title="light theme">🌇</option>
        <option class="auto" title="device theme" value="" selected>🃏</option>
        <option value="dark" title="dark theme">🌃</option>
    </select>;
}