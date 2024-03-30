import { branch } from 'azoth/chronos/channels';

function Toggle({ on: predicate }, slottable) {
    return payload => predicate(payload) ? slottable : null;
}

export function FocusPath({ stack, add, remove }) {
    const Add = <ChangeButton onclick={add} text="add" />;

    const [Remove, Path] = branch(stack,
        <Toggle on={s => s.length}>
            <ChangeButton onclick={remove} text="remove" />
        </Toggle>,
        s => s.map(focus => <Focus {...focus} />),
        // [Focus, { map: true }],
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
