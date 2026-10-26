import { fetchCatalog } from './api.js';
import { loadCart, saveCart } from './almacenamiento.js';
import { CartManager } from './carrito.js';
import './componentes/lista-de-productos.js';
import './componentes/carrito-de-compras.js';

class App {
  constructor() {
    this.catalog = [];
    this.filteredProducts = [];
    this.cartManager = null;
    
    // Elementos del DOM
    this.catalogSection = document.getElementById('catalog-section');
    this.cartComponent = document.getElementById('shopping-cart-element');
    this.productListElement = document.getElementById('product-list-element');
    this.cartSummaryIndicator = document.getElementById('cart-summary-indicator');
    this.globalMessage = document.getElementById('global-message');

    // Filtros
    this.searchInput = document.getElementById('search-input');
    this.categorySelect = document.getElementById('category-select');
    this.availableCheckbox = document.getElementById('available-checkbox');
    this.sortSelect = document.getElementById('sort-select');
    this.clearFiltersBtn = document.getElementById('clear-filters-btn');

    this.init();
  }

  async init() {
    try {
      this.showLoading(true);
      this.catalog = await fetchCatalog();
      this.showLoading(false);

      this.cartManager = new CartManager(this.catalog);
      
      // Recuperar carrito desde localStorage y sincronizar
      const savedItems = loadCart(this.catalog);
      this.cartManager.setItems(savedItems);

      this.setupCategoriesDropdown();
      this.initEventListeners();
      this.applyFilters();
      this.updateUI();

    } catch (error) {
      this.showLoading(false);
      this.showError(`Error al iniciar la aplicación: ${error.message}`);
    }
  }

  showLoading(isLoading) {
    if (isLoading) {
      this.globalMessage.innerHTML = `<div class="alert-box alert-info">Cargando catálogo de TecnoStock...</div>`;
      this.productListElement.innerHTML = '';
    } else {
      this.globalMessage.innerHTML = '';
    }
  }

  showError(message) {
    this.globalMessage.innerHTML = `<div class="alert-box alert-error">${message}</div>`;
  }

  showNotification(message, isError = false) {
    const notif = document.createElement('div');
    notif.className = `alert-box ${isError ? 'alert-error' : 'alert-info'}`;
    notif.style.position = 'fixed';
    notif.style.bottom = '20px';
    notif.style.right = '20px';
    notif.style.zIndex = '1000';
    notif.style.maxWidth = '300px';
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3500);
  }

  setupCategoriesDropdown() {
    const categories = [...new Set(this.catalog.map(p => p.categoria))];
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      this.categorySelect.appendChild(option);
    });
  }

  initEventListeners() {
    // Filtros reactivos
    this.searchInput.addEventListener('input', () => this.applyFilters());
    this.categorySelect.addEventListener('change', () => this.applyFilters());
    this.availableCheckbox.addEventListener('change', () => this.applyFilters());
    this.sortSelect.addEventListener('change', () => this.applyFilters());
    this.clearFiltersBtn.addEventListener('click', () => {
      this.searchInput.value = '';
      this.categorySelect.value = '';
      this.availableCheckbox.checked = false;
      this.sortSelect.value = 'default';
      this.applyFilters();
    });

    // Escuchar evento personalizado desde <product-card>
    document.addEventListener('add-to-cart', (e) => {
      const { id, quantity } = e.detail;
      const result = this.cartManager.addProduct(id, quantity);
      
      if (result.success) {
        this.saveAndRefresh();
        this.showNotification(result.message);
      } else {
        this.showNotification(result.message, true);
      }
    });

    // Escuchar acciones desde <shopping-cart>
    document.addEventListener('cart-action', (e) => {
      const { actionType, id, quantity } = e.detail;
      let result = { success: true };

      if (actionType === 'update-quantity') {
        result = this.cartManager.updateQuantity(id, quantity);
      } else if (actionType === 'remove-item') {
        result = this.cartManager.removeItem(id);
      } else if (actionType === 'clear-cart') {
        this.cartManager.clear();
      }

      if (result.success) {
        this.saveAndRefresh();
        if (actionType === 'clear-cart') this.showNotification('Se ha vaciado el carrito.');
      } else {
        this.showNotification(result.message, true);
      }
    });

    // Solicitar confirmación de pedido / Checkout
    document.addEventListener('request-checkout', () => {
      this.handleCheckout();
    });
  }

  applyFilters() {
    const searchTerm = this.searchInput.value.trim().toLowerCase();
    const selectedCategory = this.categorySelect.value;
    const onlyAvailable = this.availableCheckbox.checked;
    const sortOrder = this.sortSelect.value;

    let result = [...this.catalog];

    // Búsqueda por nombre o descripción (sin distinguir mayúsculas)
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.descripcion.toLowerCase().includes(searchTerm)
      );
    }

    // Filtrar por categoría
    if (selectedCategory) {
      result = result.filter(p => p.categoria === selectedCategory);
    }

    // Filtrar solo productos disponibles (activos y stock > 0)
    if (onlyAvailable) {
      result = result.filter(p => p.activo && p.stock > 0);
    }

    // Ordenamiento por precio
    if (sortOrder === 'asc') {
      result.sort((a, b) => a.precio - b.precio);
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => b.precio - a.precio);
    }

    this.filteredProducts = result;
    this.productListElement.products = this.filteredProducts;
  }

  saveAndRefresh() {
    saveCart(this.cartManager.getItems());
    this.updateUI();
  }

  updateUI() {
    const items = this.cartManager.getItems();
    const totals = this.cartManager.getTotals();
    const totalUnits = this.cartManager.getTotalUnits();

    // Actualizar indicador superior
    this.cartSummaryIndicator.textContent = `🛒 ${totalUnits} ${totalUnits === 1 ? 'unidad' : 'unidades'}`;

    // Actualizar componente del carrito
    this.cartComponent.setData({ items, totals });
  }

  handleCheckout() {
    const validation = this.cartManager.validateBeforeCheckout();
    if (!validation.valid) {
      this.showNotification(validation.message, true);
      this.updateUI(); // Refrescar por si hubo cambios de stock externos
      return;
    }

    const items = this.cartManager.getItems();
    const totals = this.cartManager.getTotals();
    const orderId = 'TS-' + Math.floor(100000 + Math.random() * 900000);

    const formatMoney = (val) => new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(val);

    // Crear Modal de confirmación de pedido
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
      <div class="modal-content">
        <h3>¡Pedido Confirmado con Éxito!</h3>
        <p><strong>Identificador del pedido:</strong> ${orderId}</p>
        <p style="margin: 0.5rem 0; font-size:0.9rem; color:var(--text-muted);">Resumen de la compra:</p>
        <pre>${items.map(i => `${i.quantity}x ${i.name} - ${formatMoney(i.precio * i.quantity)}`).join('\n')}</pre>
        <p><strong>Subtotal:</strong> ${formatMoney(totals.subtotal)}</p>
        ${totals.discount > 0 ? `<p style="color:var(--success-color);"><strong>Descuento aplicado (10%):</strong> -${formatMoney(totals.discount)}</p>` : ''}
        <p style="font-size: 1.1rem; margin-top: 0.5rem;"><strong>Total Pagado:</strong> ${formatMoney(totals.total)}</p>
        <button class="btn-primary" id="close-modal-btn" style="width: 100%; margin-top: 1.5rem;">Aceptar y Nueva Compra</button>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    modalOverlay.querySelector('#close-modal-btn').addEventListener('click', () => {
      modalOverlay.remove();
      this.cartManager.clear();
      this.saveAndRefresh();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});