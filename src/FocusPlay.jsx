import { getFoci } from './useFoci.jsx';
import './RawHtml.jsx';

export default function FocusPlay() {
    let [initial, dispatch] = getFoci();

    return <section class="focus-play">
        <FocusPlayButton />
        <Focus focus={initial[0]} update={dispatch} />
        <button onclick={() => dispatch({ type: 'ADD' })}>
            Add
        </button>
    </section>;
}

function FocusPlayButton() {
    return <button>
        <label>
            <input name="check-working" type="checkbox" checked />
        </label>
    </button>;
}

function Focus({ focus, update }) {
    const handleEnter = ({ key, target }) => {
        if(key === 'Enter' && document.hasFocus(target)) target.blur();
    };

    const handleInput = ({ target: { innerHTML, ariaLabel } }) => {
        update({
            type: 'UPDATE',
            payload: [ariaLabel, innerHTML === '<br>' ? '' : innerHTML]
        });
    };

    const $priority = <h2 contenteditable
        aria-label="priority"
        aria-placeholder="Declared Priority"
        oninput={handleInput}
        onkeydown={handleEnter}></h2>;
    $priority.innerHTML = focus?.priority ?? '';

    const $exit = <p contenteditable
        aria-label="exit"
        aria-placeholder="Clear exit seen and understood"
        oninput={handleInput}
        onkeydown={handleEnter}></p>;
    $exit.innerHTML = focus?.exit ?? '';

    return <div class="focus">
        {$priority}
        {$exit}
    </div>;
}