import { FocusPath } from './FocusPath.jsx';
import { EditableFocus } from './EditableFocus.jsx';
import { useFocus } from './useFocus.jsx';
import './FocusFeature.css';

export default function FocusFeature() {
    const [current, stack, { update, ...changeFocus }] = useFocus();
    const { FocusStack, AddButton, RemoveButton } = <FocusPath stack={stack} {...changeFocus} />;

    return <section class="focus-play">
        <FocusPlayButton />

        <div class="work-play">
            <FocusStack />

            <div class="focus-section">
                <RemoveButton className="change-focus remove-button" />
                <EditableFocus className="current-focus"
                    current={current} update={update} />
                <AddButton className="change-focus add-button" />
            </div>
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
