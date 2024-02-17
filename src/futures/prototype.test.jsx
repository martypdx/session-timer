import { beforeEach, test } from 'vitest';
import { subject } from './generators.js';
import userEvent from '@testing-library/user-event';
import '../test-utils/with-resolvers-polyfill.js';
import { screen, waitFor } from '@testing-library/dom';

beforeEach(async context => {
    document.body.innerHTML = '';
    context.fixture = document.body;
});

test('simple state subject', async ({ expect, fixture }) => {
    const user = userEvent.setup();

    let count = 0;
    const [count$, handleClick] = subject(() => ++count, { startWith: count });

    const counter = <button onclick={handleClick}>{count$}</button>;

    fixture.append(counter);
    expect(counter.textContent).toBe('');
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
    expect(counter.outerHTML).toBe(`<button>0</button>`);

    await screen.findByText('0');
    expect(counter.outerHTML).toBe(`<button>0</button>`);

    await user.click(counter);
    // expect(counter.outerHTML).toMatchInlineSnapshot(`"<button>1</button>"`);

    // await user.click(counter);
    // expect(counter.outerHTML).toMatchInlineSnapshot(`"<button>2</button>"`);

    // user.click(counter);
    // await user.click(counter);
    // expect(counter.outerHTML).toMatchInlineSnapshot(`"<button>4</button>"`);
});

function counterReducer(initial = 0) {
    let count = initial;
    const [asyncCount, dispatch] = subject(({ type }) => {
        switch(type) {
            case 'INCREMENT':
                return ++count;
            case 'DECREMENT':
                return --count;
        }

    }, { startWith: count });

    const incr = () => dispatch({ type: 'INCREMENT' });
    const decr = () => dispatch({ type: 'DECREMENT' });
    return [asyncCount, { incr, decr }];
}

function counter(initial = 0) {
    let count = initial;
    const [asyncCount, dispatch] = subject(amt => {
        return count += amt;
    }, { startWith: count });

    const incr = () => dispatch(1);
    const decr = () => dispatch(-1);
    return [asyncCount, { incr, decr }];
}

test('reducer state subject', async ({ expect, fixture }) => {
    const [count$, { incr, decr }] = counter(10);

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