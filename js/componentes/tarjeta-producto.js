export class ProductCard extends HTMLElement {
    set product(product) {
        this._product = product;
        this.render();
    }

    render() {
        if (!this._product) return;

        const product = this._product;
        const available = product.activo && product.stock > 0;
        const card = document.createElement('div');
        card.className = 'product-card-content';

        const title = document.createElement('h3');
        title.textContent = product.name;

        const category = document.createElement('p');
        category.className = 'category';
        category.textContent = product.categoria;

        const description = document.createElement('p');
        description.className = 'description';
        description.textContent = product.descripcion;

        const price = document.createElement('p');
        price.className = 'price';
        price.textContent = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(product.precio);

        const badge = document.createElement('span');
        badge.className = `badge ${available ? 'available' : 'out'}`;
        badge.textContent = available ? `Disponible: ${product.stock}` : 'No disponible';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn-agregar';
        button.disabled = !available;
        button.textContent = available ? 'Agregar al carrito' : 'No disponible';
        button.setAttribute('aria-label', `${button.textContent}: ${product.name}`);
        button.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('add-to-cart', {
                bubbles: true,
                detail: { id: product.id, quantity: 1 }
            }));
        });

        card.append(badge, title, category, description, price, button);
        this.replaceChildren(card);
    }
}

customElements.define('product-card', ProductCard);