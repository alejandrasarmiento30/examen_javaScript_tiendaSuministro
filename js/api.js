export async function fetchCatalog() {
  try {
    const response = await fetch('datos/productos.json');
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} (${response.statusText})`);
    }
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('El formato de los datos no es un arreglo válido.');
    }
    
    // Validación estricta de estructura de productos
    const validatedData = data.map(item => {
      if (typeof item.id !== 'number' || typeof item.name !== 'string' || typeof item.precio !== 'number' || typeof item.stock !== 'number') {
        throw new Error(`Producto con ID ${item.id} posee datos corruptos o inválidos.`);
      }
      return {
        id: item.id,
        name: item.name,
        categoría: item.categoría || 'General',
        precio: item.precio >= 0 ? item.precio : 0,
        stock: item.stock >= 0 ? item.stock : 0,
        description: item.description || '',
        activo: Boolean(item.activo)
      };
    });

    return validatedData;
  } catch (error) {
    console.error('Fallo al cargar el catálogo:', error);
    throw error;
  }
}
