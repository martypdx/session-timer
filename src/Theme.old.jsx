import { use } from 'azoth/channels';
import { IGNORE, Updater } from 'azoth/maya';
import { useTheme } from './services/api';

class ThemeSelect {
    #select = null;

    constructor(onSelect) {
        this.onSelect = onSelect;
    }

    set theme(theme) { this.#select.value = theme; }

    render() {
        return this.#select = <select name="select-theme" class="theme"
            value=""
            onchange={({ target }) => this.onSelect(target.value)}>
            <option value="light" title="light theme">🌇</option>
            <option class="auto" title="device theme" value="" selected>🃏</option>
            <option value="dark" title="dark theme">🌃</option>
        </select>;
    }
}

const html = document.querySelector('html');

export default function Theme() {
    const [theme, saveTheme] = useTheme();

    let select = new ThemeSelect(saveTheme);

    const [Channel] = use(theme, theme => {
        html.className = theme;
        select.theme = theme;
    });

    return Channel;
}