import { use } from 'azoth/channels';
import { useTheme } from './services/api';

export default function Theme() {
    const [themeIterator, saveTheme] = useTheme();

    const html = document.querySelector('html');

    const select = <select name="select-theme" class="theme"
        onchange={({ target }) => saveTheme(target.value)}>
        <option value="light" title="light theme">🌇</option>
        <option class="auto" title="device theme" value="" selected>🃏</option>
        <option value="dark" title="dark theme">🌃</option>
    </select>;

    use(themeIterator, theme => {
        html.className = theme;
        select.value = theme;
    });

    return select;
}