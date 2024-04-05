import { unicast } from 'azoth/chronos/generators';
import { branch } from 'azoth/chronos/channels';
import { useLocalStorageJSON } from '../local-storage.js';

const newFocus = level => ({
    priority: level ? `level ${level}` : '',
    exit: ''
});

export function useFocus() {
    const [foci, setLocal] = useLocalStorageJSON('FOP.FOCI', [newFocus()]);
    const save = () => setLocal(foci);

    const [asyncFoci, changeFocus] = unicast(() => foci, null);
    const [current, stack] = branch(asyncFoci,
        foci => foci.at(-1),
        foci => foci.slice(0, -1),
    );

    const update = updates => {
        Object.assign(foci.at(-1), updates);
        save();
    };

    const add = () => {
        foci.push(newFocus(foci.length));
        save();
        changeFocus();
    };

    const remove = () => {
        if(foci.length === 1) return;
        foci.pop();
        save();
        changeFocus();
    };

    return [current, stack, { add, remove, update }];
}
