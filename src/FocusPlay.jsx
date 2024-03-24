import { useLocalStorageJSON } from './services/local-storage.js';

function useFocus() {
    const [foci, saveFocus] = useLocalStorageJSON(
        'FOP.FOCI',
        [{ priority: 'priority', exit: 'clear exit' }]
    );

    let focus = foci.at(-1);

    const update = updates => {
        Object.assign(focus, updates);
        saveFocus(foci);
    };

    return [focus, update];
}

export default function FocusPlay() {
    const [focus, update] = useFocus();

    return <section class="focus-play">
        <FocusPlayButton />
        <EditableFocus priority={focus.priority} exit={focus.exit} update={update} />
    </section>;
}

function FocusPlayButton() {
    return <button class="ico-button">
        <label>
            <input name="check-working" type="checkbox" checked />
        </label>
    </button>;
}

function EditableFocus({ priority, exit, update }) {

    const handleEnter = ({ key, target }) => {
        if(key === 'Enter' && document.hasFocus(target)) {
            target.blur();
        }
    };

    const handleInput = ({ target: { innerHTML, ariaLabel } }) => {
        update({ [ariaLabel]: innerHTML === '<br>' ? '' : innerHTML });
    };

    return <div class="focus">
        <h2 contenteditable
            aria-label="priority"
            aria-placeholder="Declared Priority"
            oninput={handleInput}
            onkeydown={handleEnter}
            innerHTML={priority ?? ''} />

        <p contenteditable
            aria-label="exit"
            aria-placeholder="Clear exit seen and understood"
            oninput={handleInput}
            onkeydown={handleEnter}
            innerHTML={exit ?? ''} />
    </div>;
}