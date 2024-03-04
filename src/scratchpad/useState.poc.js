// @ts-check
import { subject } from './generators.js';

/**
 * 
 * @param {} initial 
 * @returns 
 */
export function useFoci(initial = []) {
    const stack = initial;
    let current = null;

    /** @type {[AsyncIterator<any, void, unknown>, (payload? : any) => void]} */
    const [asyncStack, respond] = subject({
        startWith: { load: stack }
    });

    const actions = {
        add() {
            stack.push(current = { priority: '', exit: '' });
            respond({ add: current });
        },

        remove() {
            stack.pop();
            current = stack.at(-1) ?? null;
            respond({ remove: true });
        },

        update(updates) {
            current = { ...current, ...updates };
            respond({ update: current });
        }
    };

    return [asyncStack, actions];
}