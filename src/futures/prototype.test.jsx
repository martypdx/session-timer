import { afterEach, beforeEach, test } from 'vitest';
import { multicast, subject } from './generators.js';
import userEvent from '@testing-library/user-event';
import '../test-utils/with-resolvers-polyfill.js';
import { screen, getByText } from '@testing-library/dom';

beforeEach(async context => {
    document.body.innerHTML = '';
    context.fixture = document.body;
});

test('simple state subject', async ({ expect, fixture }) => {
    const user = userEvent.setup();

    let count = 0;
    const [handleClick, Count] = subject(() => ++count, { startWith: count });

    const counter = <button onclick={handleClick}>{Count}</button>;

    fixture.append(counter);
    expect(counter.outerHTML).toBe(`<button><!--0--></button>`);

    await screen.findByText('0');
    expect(counter.outerHTML).toBe(`<button>0<!--1--></button>`);

    await user.click(counter);
    expect(counter.outerHTML).toMatchInlineSnapshot(`"<button>1<!--1--></button>"`);

    await user.click(counter);
    expect(counter.outerHTML).toMatchInlineSnapshot(`"<button>2<!--1--></button>"`);

    user.click(counter);
    await user.click(counter);
    expect(counter.outerHTML).toMatchInlineSnapshot(`"<button>4<!--1--></button>"`);
});

test('simple state subject imperative update', async ({ expect, fixture }) => {
    const user = userEvent.setup();

    let count = 0;
    const [handleClick] = subject(() => {
        counter.textContent = ++count;
    }, { startWith: count });

    const counter = <button onclick={handleClick} textContent={count} />;

    fixture.append(counter);
    expect(counter.outerHTML).toBe(`<button>0</button>`);

    await screen.findByText('0');
    expect(counter.outerHTML).toBe(`<button>0</button>`);

    await user.click(counter);
    expect(counter.outerHTML).toMatchInlineSnapshot(`"<button>1</button>"`);

    await user.click(counter);
    expect(counter.outerHTML).toMatchInlineSnapshot(`"<button>2</button>"`);

    user.click(counter);
    await user.click(counter);
    expect(counter.outerHTML).toMatchInlineSnapshot(`"<button>4</button>"`);
});

test('reducer state subject', async ({ expect, fixture }) => {

    function counter(initial = 0) {
        let count = initial;
        return subject(({ type }) => {
            switch(type) {
                case 'INCREMENT':
                    return ++count;
                case 'DECREMENT':
                    return --count;
            }

        }, { startWith: count });
    }

    const [dispatch, Count] = counter(10);
    function Button({ type, text }) {
        return <button onclick={() => dispatch({ type })}>{text}</button>;
    }

    const volume = <div>
        <Button type="INCREMENT" text="+" />;
        <span>{Count}</span>
        <Button type="DECREMENT" text="-" />;
    </div>;

    const incr = getByText(volume, '+');
    const decr = getByText(volume, '-');
    const display = volume.querySelector('span');

    const user = userEvent.setup();

    fixture.append(volume);

    await user.click(incr);
    expect(display.textContent).toBe('11');

    await user.click(decr);
    await user.click(decr);
    expect(display.textContent).toBe('9');
});