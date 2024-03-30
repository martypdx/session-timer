import { consume } from 'azoth/chronos/channels';
import { Updater } from 'azoth/maya';

export function CurrentFocus({ current, update }) {
    const Focus = updatableFocus(update);
    consume(current, current => Focus.update(current));
    return Focus;
}

function updatableFocus(update) {
    const handleEnter = ({ key, target }) => {
        if(key === 'Enter' && document.hasFocus(target)) {
            target.blur();
        }
    };

    const handleInput = ({ target: { innerHTML, ariaLabel } }) => {
        update({ [ariaLabel]: innerHTML === '<br>' ? '' : innerHTML });
    };

    return Updater.for(({ priority, exit }) => <div class="current-focus">
        <h2 contenteditable
            aria-label="priority"
            aria-placeholder="Declared Priority"
            oninput={handleInput}
            onkeydown={handleEnter}
            innerHTML={priority || ''} />

        <p contenteditable
            aria-label="exit"
            aria-placeholder="Clear exit seen and understood"
            oninput={handleInput}
            onkeydown={handleEnter}
            innerHTML={exit || ''} />
    </div >);
}