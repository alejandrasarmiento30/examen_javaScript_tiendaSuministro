export class ShoppingCartComponent extends HTMLElement {
  constructor() {
    super();
  }

  setData({ items, totals }) {
    this._items = items;
    this._totals = totals;
    this.render();
  }

  render() {
    const items = this._items || [];
    const { subtotal, discount, total } = this._totals || { subtotal: 0, discount: 0, total: 0 };

    const formatMoney = (val) => new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(val);

    this.innerHTML = `
      <h2>Carrito de Compras</h2>
      <div class="cart-items-container">
        ${items.length === 0 ? '<p style="color:var(--text-muted); text-align:center; padding:1rem;">Tu carrito está vacío</p>' : ''}
        ${items.map(item => `
          <div class="cart-item">
            <div class="cart-item-info">
              <span class="cart-item-title">${item.name}</span>
              <span class="cart-item-price">${formatMoney(item.precio)} c/u</span>
            </div>
            <div class="cart-item-controls">
              <button class="dec-btn" data-id="${item.id}">-</button>
              <span>${item.quantity}</span>
              <button class="inc-btn" data-id="${item.id}">+</button>
              <button class="del-btn" data-id="${item.id}" title="Eliminar" style="color:var(--danger-color); margin-left:4px;">×</button>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="cart-totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatMoney(subtotal)}</span>
        </div>
        ${discount > 0 ? `
          <div class="total-row">
            <span>Descuento (10%):</span>
            <span class="discount-text">-${formatMoney(discount)}</span>
          </div>
        ` : ''}
        <div class="total-row final">
          <span>Total:</span>
          <span>${formatMoney(total)}</span>
        </div>
      </div>

      <div class="cart-actions">
        <button class="btn-danger" id="clear-cart-btn" ${items.length === 0 ? 'disabled' : ''}>Vaciar</button>
        <button class="btn-primary" id="checkout-btn" ${items.length === 0 ? 'disabled' : ''}>Confirmar Pedido</button>
      </div>
    `;

    // Listeners de controles del carrito
    this.querySelectorAll('.inc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const item = items.find(i => i.id === id);
        this.dispatchCartAction('update-quantity', { id, quantity: item.quantity + 1 });
      });
    });

    this.querySelectorAll('.dec-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const item = items.find(i => i.id === id);
        this.dispatchCartAction('update-quantity', { id, quantity: item.quantity - 1 });
      });
    });

    this.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        this.dispatchCartAction('remove-item', { id });
      });
    });

    const clearBtn = this.querySelector('#clear-cart-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.dispatchCartAction('clear-cart', {});
      });
    }

    const checkoutBtn = this.querySelector('#checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('request-checkout', { bubbles: true, composed: true }));
      });
    }
  }

  dispatchCartAction(actionType, detail) {
    this.dispatchEvent(new CustomEvent('cart-action', {
      bubbles: true,
      composed: true,
      detail: { actionType, ...detail }
    }));
  }
}

customElements.define('shopping-cart', ShoppingCartComponent);