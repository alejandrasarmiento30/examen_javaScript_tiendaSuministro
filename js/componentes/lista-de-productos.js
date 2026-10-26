import './product-card.js';

export class ProductList extends HTMLElement {
  constructor() {
    super();
  }

  set products(list) {
    this._products = list;
    this.render();
  }

  render() {
    if (!this._products || this._products.length === 0) {
      this.innerHTML = `
        <div class="alert-box alert-info">
          No se encontraron productos con los criterios de búsqueda seleccionados.
        </div>
      `;
      return;
    }

    this.innerHTML = `<div class="products-grid" id="grid"></div>`;
    const grid = this.querySelector('#grid');

    this._products.forEach(product => {
      const card = document.createElement('product-card');
      card.product = product;
      grid.appendChild(card);
    });
  }
}

customElements.define('product-list', ProductList);