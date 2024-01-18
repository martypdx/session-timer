
document
    .querySelectorAll('.focus > *')
    .forEach(node => {
        const key = `focus.${node.ariaLabel}`;
        node.innerHTML = localStorage.getItem(key) || '';
        node.addEventListener('input', () => {
            localStorage.setItem(key, node.innerHTML);
        })
    })
