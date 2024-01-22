
document
    .querySelectorAll('.focus > *')
    .forEach(node => {
        const key = `focus.${node.ariaLabel}`;
        node.innerHTML = localStorage.getItem(key) || '';
        
        node.addEventListener('input', (e) => { 
            localStorage.setItem(key, node.innerHTML);
        });

        node.addEventListener('keydown', ({ key }) => {
            if(key === 'Enter' && document.hasFocus(node)) node.blur();
        })
    })
