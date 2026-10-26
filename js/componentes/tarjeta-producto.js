export class ProductCard extends HTMLElement {
    set product(product) {
        this._product = product;
        this.render();
    }

    render() {
        if (!this._product) return;

        const product = this._product;
        const available = product.activo && product.stock > 0;
        const card = document.createElement('article');
        card.className = 'tarjeta-producto';

        const title = document.createElement('h2');
        title.textContent = product.name;

        const category = document.createElement('p');
        category.className = 'categoria-producto';
        category.textContent = product.categoria;

        const description = document.createElement('p');
        description.textContent = product.descripcion;

        const price = document.createElement('p');
        price.className = 'precio-producto';
        price.textContent = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(product.precio);

        const stock = document.createElement('p');
        stock.className = 'stock-producto';
        stock.textContent = product.stock > 0 ? `Existencias: ${product.stock}` : 'Sin existencias';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn-agregar';
        button.disabled = !available;
        button.textContent = available ? 'Agregar al carrito' : 'No disponible';
        button.setAttribute('aria-label', `${button.textContent}: ${product.name}`);
        button.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('agregar-producto', {
                bubbles: true,
                detail: { productId: product.id }
            }));
        });

        card.append(title, category, description, price, stock, button);
        this.replaceChildren(card);
    }
}

customElements.define('product-card', ProductCard);