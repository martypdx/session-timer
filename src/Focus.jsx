import { useLocalStorage } from './useLocalStorage.jsx';
import './RawHtml.jsx';

function useEditable(key) {
    const [initial, setValue] = useLocalStorage(key);
    return [initial, value => {
        setValue(value === '<br>' ? '' : value);
    }];
}

export default function Focus() {
    const [initialPriority, setPriority] = useEditable('focus.priority');
    const [initialExit, setExit] = useEditable('focus.exit');

    const handleEnter = ({ key, target }) => {
        if(key === 'Enter' && document.hasFocus(target)) target.blur();
    };

    const $priority = <h1 contenteditable aria-label="priority"
        aria-placeholder="Declared Priority"
        oninput={({ target }) => setPriority(target.innerHTML)}
        onkeydown={handleEnter}></h1>;
    $priority.innerHTML = initialPriority;

    const $exit = <p contenteditable aria-label="exit"
        aria-placeholder="Clear exit seen and understood"
        oninput={({ target }) => setExit(target.innerHTML)}
        onkeydown={handleEnter}></p>;
    $exit.innerHTML = initialExit;

    const focus = <section class="work-play">
        <button>
            <label>
                <input name="check-working" type="checkbox" checked />
            </label>
        </button>

        <div class="focus">
            {$priority}
            {$exit}
        </div>
    </section>;

    return focus;
}