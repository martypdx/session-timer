import { beforeEach, test } from 'vitest';
import { subject } from './generators.js';
import userEvent from '@testing-library/user-event';
import '../test-utils/with-resolvers-polyfill.js';
import { screen, waitFor } from '@testing-library/dom';
import { Anchor } from './Anchor.jsx';
import { useFoci } from './useState.js';

beforeEach(async context => {
    document.body.innerHTML = '';
    context.fixture = document.body;
});

test('simple state subject', async ({ expect, fixture }) => {
    let count = 0;
    const [count$, handleClick] = subject(() => ++count, { startWith: count });

    const counter = <button onclick={handleClick}>{count$}</button>;
    fixture.append(counter);

    expect(counter.textContent).toBe('');
    const user = userEvent.setup();
    await screen.findByText('0');
    await user.click(counter);
    await screen.findByText('1');
    await user.click(counter);
    await screen.findByText('2');
    user.click(counter);
    await user.click(counter);
    await screen.findByText('4');
});

test('simple state subject imperative update', async ({ expect, fixture }) => {
    const user = userEvent.setup();

    let count = 0;
    const [, handleClick] = subject(() => {
        counter.textContent = ++count;
    });

    const counter = <button onclick={handleClick} textContent={count} />;

    fixture.append(counter);
    await user.click(counter);
    await screen.findByText('1');
});

function useCounter(initial = 0) {
    let count = initial;
    const [asyncCount, dispatch] = subject(amt => {
        return count += amt;
    }, { startWith: count });

    const incr = () => dispatch(1);
    const decr = () => dispatch(-1);
    return [asyncCount, { incr, decr }];
}

test('state w/ dispatch subject', async ({ expect, fixture }) => {
    const [count$, { incr, decr }] = useCounter(10);

    const volume = <div>
        <button onclick={incr}>+</button>
        <span>{count$}</span>
        <button onclick={decr}>-</button>
    </div>;

    fixture.append(volume);

    const plus = screen.getByText('+');
    const minus = screen.getByText('-');
    const display = volume.querySelector('span');

    await waitFor(() => expect(display.textContent).toBe('10'));
    const user = userEvent.setup();
    await user.click(plus);
    expect(display.textContent).toBe('11');
    await user.click(minus);
    await user.click(minus);
    expect(display.textContent).toBe('9');
});


test('stack reducer', async ({ expect, fixture }) => {
    const [foci$, { push }] = useFoci([
        { priority: 'task', exit: 'done' }
    ]);

    async function* layout$() {
        let list = null;
        let current = null;
        const Focus = ({ priority, exit }) => {
            return <li>{priority}</li>;
        };

        for await(const { type, payload } of foci$) {
            switch(type) {
                case 'INITIAL_LOAD':
                    list = payload.map(Focus);
                    current = list.at(-1);
                    yield list;
                    break;
                case 'ADD': {
                    const prior = current;
                    current = <Focus focus={payload} />;
                    if(prior) prior.after(current);
                    else yield current;
                    break;
                }
            }
        }
    }

    const app = <div>
        <button onclick={push}>add</button>
        <ul>{layout$}</ul>
    </div>;

    const addButton = app.querySelector('button');
    const list = app.querySelector('ul');
    const user = userEvent.setup();

    fixture.append(app);
    await screen.findByText('task', { exact: false });

    user.click(addButton);
    await user.click(addButton);
    await waitFor(() => expect(list.children.length).toBe(3));
    expect(list.innerHTML).toBe(
        `<li>task<!--1--></li><li><!--0--></li><li><!--0--></li><!--1-->`
    );
});

const Focus = ({ focus }) => {
    return <li>
        {focus.priority}
        {focus.exit}
    </li>;
};

function Foci({ foci }) {
    return <ul>
        <Anchor
            source={foci}
            loader={fociLoader}
            map={focus => <Focus focus={focus} />}
        />
    </ul>;
}

test.only('stack component', async ({ expect, fixture }) => {
    const [foci$, { add, update, remove }] = useFoci([
        { priority: 'task', exit: 'done' }
    ]);

    const focusUpdate = {
        priority: 'new priority',
        exit: 'clear doorway'
    };

    const app = <div>
        <button onclick={add}>add</button>
        <button onclick={() => update(focusUpdate)}>update</button>
        <Foci foci={foci$} />
        <button onclick={remove}>remove</button>
    </div>;

    const [addButton, updateButton, removeButton] = app.querySelectorAll('button');
    const list = app.querySelector('ul');
    const user = userEvent.setup();

    fixture.append(app);
    await screen.findByText('task', { exact: false });

    await user.click(addButton);
    await waitFor(() => expect(list.children.length).toBe(2));
    expect(list.innerHTML).toBe(`<li>
        task<!--1-->
        done<!--1-->
    </li><li>
        <!--0-->
        <!--0-->
    </li><!--2--><!--1-->`
    );

    await user.click(updateButton);
    await screen.findByText('clear doorway', { exact: false });
    expect(list.innerHTML).toBe(`<li>
        task<!--1-->
        done<!--1-->
    </li><li>
        new priority<!--1-->
        clear doorway<!--1-->
    </li><!--2--><!--1-->`
    );

    await user.click(removeButton);
    await waitFor(() => expect(list.children.length).toBe(1));
    expect(list.innerHTML).toBe(`<li>
        task<!--1-->
        done<!--1-->
    </li><!--1--><!--1-->`
    );
});