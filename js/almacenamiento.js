const CART_STORAGE_KEY = 'tecnostock_cart_v1';

export function saveCart(cartItems) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
  }
}

export function loadCart(catalogProducts) {
  try {
    const rawData = localStorage.getItem(CART_STORAGE_KEY);
    if (!rawData) return [];

    const parsedData = JSON.parse(rawData);
    if (!Array.isArray(parsedData)) return [];

    // Validar contra el catálogo actual (precios vigentes, stock real y estado activo)
    const validCart = [];
    for (const item of parsedData) {
      const productInCatalog = catalogProducts.find(p => p.id === item.id);
      
      // Si el producto ya no existe, está inactivo o sin stock, se omite
      if (!productInCatalog || !productInCatalog.activo || productInCatalog.stock <= 0) {
        continue;
      }

      let quantity = parseInt(item.quantity, 10);
      if (isNaN(quantity) || quantity < 1) continue;

      // La cantidad no puede superar el inventario actual
      if (quantity > productInCatalog.stock) {
        quantity = productInCatalog.stock;
      }

      validCart.push({
        id: productInCatalog.id,
        name: productInCatalog.name,
        precio: productInCatalog.precio, // Usar siempre precio vigente del catálogo
        quantity: quantity,
        stock: productInCatalog.stock
      });
    }

    return validCart;
  } catch (error) {
    console.error('Error al recuperar o parsear el carrito de localStorage:', error);
    // Limpiar almacenamiento corrupto
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
}
