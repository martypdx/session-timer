import { branch } from 'azoth/chronos/channels';
import { Toggle } from 'azoth/maya';
import './FocusPath.css';

export function FocusPath({ stack, add, remove }) {
    const AddButton = <ChangeButton onclick={add} text="➕" />;

    const [RemoveButton, Path] = branch(stack,
        <Toggle on={s => s.length}>
            <ChangeButton onclick={remove} text="➖" />
        </Toggle>,
        s => s.map(Focus),
    );

    return {
        FocusStack: <ul class="focus-path"><Path /></ul>,
        AddButton,
        RemoveButton
    };
}

function Focus({ priority, exit }) {
    return <li>
        <h2>{priority}</h2>
        <p>{exit}</p>
    </li>;
}

function ChangeButton({ onclick, text }) {
    return <button onclick={onclick}>{text}</button>;
}
