const select = document.getElementById('theme-select');
const html = document.querySelector('html');

const THEME_KEY = 'selected-theme'
const themes = { light: 'light', dark: 'dark' };
const selectedTheme = themes[localStorage.getItem(THEME_KEY)];
if(selectedTheme) setTheme(select.value = selectedTheme);

select.addEventListener('change', () => {
    setTheme(select.value);
});

function setTheme(theme) {
    html.className = theme;
    if(theme) {
        localStorage.setItem(THEME_KEY, theme);
    }
    else {
        localStorage.removeItem(THEME_KEY)
    }
}