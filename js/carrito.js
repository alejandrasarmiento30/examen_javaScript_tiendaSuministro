export class CartManager {
  constructor(catalog) {
    this.catalog = catalog;
    this.items = [];
  }

  setItems(items) {
    this.items = items;
  }

  getItems() {
    return this.items;
  }

  addProduct(productId, requestedQty = 1) {
    const product = this.catalog.find(p => p.id === productId);
    if (!product) {
      return { success: false, message: 'El producto no existe en el catálogo.' };
    }
    if (!product.activo) {
      return { success: false, message: 'No se puede agregar: El producto se encuentra inactivo.' };
    }
    if (product.stock <= 0) {
      return { success: false, message: 'No se puede agregar: Producto agotado.' };
    }

    const existingIndex = this.items.findIndex(item => item.id === productId);
    let currentQtyInCart = existingIndex >= 0 ? this.items[existingIndex].quantity : 0;
    let newQty = currentQtyInCart + requestedQty;

    if (newQty > product.stock) {
      return { 
        success: false, 
        message: `Stock insuficiente. Solo hay ${product.stock} unidades disponibles.` 
      };
    }

    if (existingIndex >= 0) {
      this.items[existingIndex].quantity = newQty;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        precio: product.precio,
        quantity: requestedQty,
        stock: product.stock
      });
    }

    return { success: true, message: 'Producto agregado correctamente al carrito.' };
  }

  updateQuantity(productId, newQty) {
    const product = this.catalog.find(p => p.id === productId);
    const itemIndex = this.items.findIndex(item => item.id === productId);

    if (itemIndex < 0) return { success: false, message: 'El ítem no está en el carrito.' };
    if (!product || !product.activo) {
      this.removeItem(productId);
      return { success: false, message: 'El producto ya no está activo. Se ha eliminado del carrito.' };
    }

    let qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty < 1) {
      return { success: false, message: 'La cantidad debe ser un entero mayor o igual a 1.' };
    }

    if (qty > product.stock) {
      return { success: false, message: `La cantidad supera el stock disponible (${product.stock}).` };
    }

    this.items[itemIndex].quantity = qty;
    return { success: true, message: 'Cantidad actualizada.' };
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    return { success: true, message: 'Producto eliminado del carrito.' };
  }

  clear() {
    this.items = [];
  }

  getTotalUnits() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
  }

  getDiscount(subtotal) {
    // 10% de descuento si el subtotal es >= $300.000 COP
    return subtotal >= 300000 ? subtotal * 0.10 : 0;
  }

  getTotals() {
    const subtotal = this.getSubtotal();
    const discount = this.getDiscount(subtotal);
    const total = subtotal - discount;
    return { subtotal, discount, total };
  }

  validateBeforeCheckout() {
    if (this.items.length === 0) {
      return { valid: false, message: 'El carrito está vacío.' };
    }

    for (const item of this.items) {
      const product = this.catalog.find(p => p.id === item.id);
      if (!product || !product.activo) {
        return { valid: false, message: `El producto "${item.name}" ya no se encuentra activo.` };
      }
      if (item.quantity > product.stock) {
        return { valid: false, message: `La cantidad de "${item.name}" supera el stock actual.` };
      }
    }
    return { valid: true };
  }
}