import { branch } from 'azoth/chronos/channels';
import { Toggle } from 'azoth/maya';


export function FocusPath({ stack, add, remove }) {
    const Add = <ChangeButton onclick={add} text="add" />;

    const [Remove, Path] = branch(stack,
        <Toggle on={s => s.length}>
            <ChangeButton onclick={remove} text="remove" />
        </Toggle>,
        [Focus, { map: true }],
        // s => s.map(focus => <Focus {...focus} />),
    );

    return { Path, Add, Remove };
}

function Focus({ priority, exit }) {
    return <li>
        <span class="priority">{priority}</span>
        {exit}
    </li>;
}

function ChangeButton({ onclick, text }) {
    return <button onclick={onclick}>{text}</button>;
}
