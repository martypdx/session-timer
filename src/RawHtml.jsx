
export class RawHtml extends HTMLElement {
    constructor() {
        super();
        // eslint-disable-next-line no-self-assign
        this.#setInnerHTML(this.html);

    }

    #setInnerHTML(raw) {
        this.innerHTML = raw ?? '';
    }

    set html(raw) {
        this.#setInnerHTML(raw);
    }
}

window.customElements.define('raw-html', RawHtml);
