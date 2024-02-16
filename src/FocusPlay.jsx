import { getFoci } from './useFoci.jsx';

export default function FocusPlay() {
    let [initial, dispatch] = getFoci();

    return <section class="focus-play">
        <FocusPlayButton />
        <Focus focus={initial[0]} update={dispatch} />
        <button onclick={() => dispatch({ type: 'ADD' })}>Add</button>
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
        if(key === 'Enter' && document.hasFocus(target)) {
            target.blur();
        }
    };

    const handleInput = ({ target: { innerHTML, ariaLabel } }) => {
        update({
            type: 'UPDATE',
            payload: [ariaLabel, innerHTML === '<br>' ? '' : innerHTML]
        });
    };

    return <div class="focus">
        <h2 contenteditable
            aria-label="priority"
            aria-placeholder="Declared Priority"
            oninput={handleInput}
            onkeydown={handleEnter}
            innerHTML={focus?.priority ?? ''} />

        <p contenteditable
            aria-label="exit"
            aria-placeholder="Clear exit seen and understood"
            oninput={handleInput}
            onkeydown={handleEnter}
            innerHTML={focus?.exit ?? ''} />
    </div>;
}