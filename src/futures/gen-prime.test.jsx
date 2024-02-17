import { beforeEach, test } from 'vitest';
// import { multicast, subject } from './generators.js';
import { elementWithAnchor, runCompose } from '../test-utils/elements.test.js';
import '../test-utils/with-resolvers-polyfill.js';
import { findByText, screen, waitFor } from '@testing-library/dom';


export function subject(transform, options) {
    if(!options && typeof transform === 'object') {
        options = transform;
        transform = null;
    }

    if(options) {
        if(options.initialValue !== undefined) {
            if(options.startWith !== undefined) {
                throw new Error('Cannot specify both initialValue and startWith option');
            }
            if(!transform) {
                throw new Error('Cannot specify initialValue without a transform function');
            }
        }
    }

    const relay = { resolve: null };

    function dispatch(payload) {
        if(transform) payload = transform(payload);
        relay.resolve(payload);
    }

    async function* generator() {
        if(options?.initialValue !== undefined) {
            if(options.startWith !== undefined) {
                throw new Error('');
            }
            yield transform(options.initialValue);
        }
        if(options?.startWith !== undefined) {
            yield options.startWith;
        }

        while(true) {
            const { promise, resolve } = Promise.withResolvers();
            relay.resolve = resolve;
            yield await promise;
        }
    }

    const iterator = generator();
    return [dispatch, iterator];
}

beforeEach(() => document.body.innerHTML = '');


test('subject() with dispatch to and from values', async () => {
    const [dispatch, iterator] = subject();
    const dom = runCompose(iterator, elementWithAnchor);
    document.body.append(dom);

    dispatch('hello');
    await findByText(dom, 'hello');

    dispatch('world');
    await findByText(dom, 'world');

    dispatch();
    await findByText(dom, '');

    dispatch('goodbye');
    await findByText(dom, 'goodbye');
});

test('subject(transform)', async () => {
    const [dispatch, iterator] = subject(s => s?.toUpperCase());
    const dom = runCompose(iterator, elementWithAnchor);
    document.body.append(dom);

    dispatch('hello');
    await findByText(dom, 'HELLO');

    dispatch();
    await findByText(dom, '');

});

test('options.startWith', async () => {
    const [dispatch, iterator] = subject({ startWith: 'hi' });
    const dom = runCompose(iterator, elementWithAnchor);
    document.body.append(dom);

    await findByText(dom, 'hi');
    dispatch('hello');
    await findByText(dom, 'hello');
});

test('options.initialValue', async () => {
    const [dispatch, iterator] = subject(x => x ** 2, { initialValue: 2 });
    const dom = runCompose(iterator, elementWithAnchor);
    document.body.append(dom);

    await findByText(dom, 4);
    dispatch(3);
    await findByText(dom, 9);
});

test('error both initialValue startWith, or initialValue no transformer', ({ expect }) => {
    expect(() => {
        subject(x => x ** 2, { initialValue: 2, startWith: 4 });
    }).toThrowErrorMatchingInlineSnapshot(
        `[Error: Cannot specify both initialValue and startWith option]`
    );

    expect(() => {
        subject({ initialValue: 2 });
    }).toThrowErrorMatchingInlineSnapshot(
        `[Error: Cannot specify initialValue without a transform function]`
    );
});

test.todo('options.error');


