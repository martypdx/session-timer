
export function subject(transform, options) {
    if(!options && typeof transform === 'object') {
        options = transform;
        transform = null;
    }
    const [dispatch, generator] = junction(transform);
    const iterator = generator(options?.startWith);
    return [dispatch, iterator];
}

export function junction(transform) {
    const [dispatch, relay] = dispatchRelay(transform);
    const generator = runWith(relay);
    return [dispatch, generator];
}

export function dispatchRelay(transform) {
    const relay = { resolve: null };

    function dispatch(payload) {
        if(transform) payload = transform(payload);
        relay.resolve(payload);
    }

    return [dispatch, relay];
}

export function runWith(relay) {
    const { promise, resolve } = Promise.withResolvers();
    relay.resolve = resolve;

    async function* generator(initial) {
        resolve();
        await promise;
        yield initial;

        while(true) {
            const { promise, resolve } = Promise.withResolvers();
            relay.resolve = resolve;
            yield await promise;
        }
    }

    return generator;
}


export function multicast(iterator) {
    return new Multicast(iterator);
}

class Multicast {
    consumers = [];
    constructor(subject) {
        this.subject = subject;
        this.#start();
    }

    async #start() {
        for await(let value of this.subject) {
            for(let consumer of this.consumers) {
                consumer(value);
            }
        }
    }

    subscriber(transform, options) {
        const [dispatch, iterator] = subject(transform, options);
        this.consumers.push(dispatch);
        return iterator;
    }
}
