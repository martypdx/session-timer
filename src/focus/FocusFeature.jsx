import { FocusPath } from './FocusPath.jsx';
import { CurrentFocus } from './CurrentFocus.jsx';
import { useFocus } from './useFocus.jsx';
import './FocusFeature.css';

export default function FocusFeature() {
    const [current, stack, { update, ...changeFocus }] = useFocus();
    const { Add, Remove, List } = <FocusPath stack={stack} {...changeFocus} />;

    return <section class="focus-play">
        <FocusPlayButton />
        <List />
        <div class="focus-section">
            <Remove className="remove-button" />
            <CurrentFocus current={current} update={update} />
            <Add className="add-button" />
        </div>
    </section>;
}

function FocusPlayButton() {
    return <button class="ico-button">
        <label>
            <input name="check-working" type="checkbox" checked />
        </label>
    </button>;
}
