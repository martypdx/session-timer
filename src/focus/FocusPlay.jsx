import { FocusPath } from './FocusPath.jsx';
import { CurrentFocus } from './CurrentFocus.jsx';
import { useFocus } from './useFocus.jsx';
import './focus.css';

function FocusPlayButton() {
    return <button class="ico-button">
        <label>
            <input name="check-working" type="checkbox" checked />
        </label>
    </button>;
}

export default function FocusPlay() {
    const [current, stack, { update, ...changeFocus }] = useFocus();
    const { Add, Remove, Path } = <FocusPath stack={stack} {...changeFocus} />;

    return <section class="focus-play">
        <FocusPlayButton />
        <ul><Path /></ul>
        <section class="focus-section">
            <Remove className="remove-button" />
            <CurrentFocus current={current} update={update} />
        </section>
        <Add className="add-button" />
    </section>;
}
