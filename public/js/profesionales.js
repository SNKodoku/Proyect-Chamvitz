document.addEventListener('DOMContentLoaded', () => {
    // Cargar productos en la página de productos
    if (document.querySelector('.contenedor-producto')) {
        cargarProductos();
    }
    
    // Configurar carrito
    if (document.querySelector('.items-cart')) {
        cargarCarrito();
    }
});

// Función para la carga de productos
async function cargarProductos() {
    try {
        showLoading();

        let url = '/api/productos';

        const response = await fetch(url);
        const productos = await response.json();
        
        desplegarProductos(productos);    
    } catch (err) {
        console.error('Error al cargar productos:', err);
        mostrarError('Error al cargar los productos. Intenta nuevamente');
    } finally {
        hideLoading();
    }
}

// Mostrar productos en el DOM
function desplegarProductos(productos) {
    const contenedorProductos = document.getElementById('lista-producto');

    if(!contenedorProductos) return;

    contenedorProductos.innerHTML = '';

    if(productos.length === 0) {
        contenedorProductos.innerHTML = `
            <div class="no-productos">
                <p>No se encontraron productos</p>
            </div>
        `
        return;
    }

    productos.forEach(producto => {
        const tarjetaProducto = crearTarjetaProducto(producto);
        contenedorProductos.appendChild(tarjetaProducto);
    });
}

// Mostrar indicador de carga
function showLoading() {
    const productContainer = document.getElementById('product-list');
    if (productContainer) {
        productContainer.innerHTML = `
            <div class="contenedor-carga">
                <div class="cargando-spinner"></div>
                <p>Cargando productos...</p>
            </div>
        `;
    }
}

// Ocultar indicador de carga
function hideLoading() {
    // El contenido será reemplazado por los productos
}

// Cargar carrito
// Cargar carrito
async function cargarCarrito() {
    try {
        const response = await fetch('/api/cart');
        const itemsCarrito = await response.json();

        const contenedorItemsCarrito = document.querySelector('.items-cart');
        const resumenCarrito = document.querySelector('.resumen-cart');

        if(contenedorItemsCarrito) {
            contenedorItemsCarrito.innerHTML = '<h2>Tu carrito</h2>';

            if (itemsCarrito.length === 0) {
                contenedorItemsCarrito.innerHTML += '<p class="no-productos">Tu carrito está vacío.</p>';
                if (resumenCarrito) resumenCarrito.innerHTML = '';
                return;
            }

            itemsCarrito.forEach(item => {
                if(!item.producto) return;

                const itemCarrito = document.createElement('div');
                itemCarrito.className = 'item-cart fade-in';
                itemCarrito.innerHTML = `
                    <img src="${item.producto.imagen}" alt="${item.producto.nombre}" class="imagen-item-cart">
                    <div class="detalles-item-cart">
                        <h3>${item.producto.nombre}</h3>
                        <p>$${item.producto.precio.toFixed(2)} c/u</p>
                        <div class="acciones-item-cart">
                            <input type="number" value="${item.cantidad}" min="1" data-id="${item.producto.id}">
                            <span class="remover-item" data-id="${item.producto.id}">Eliminar</span>
                        </div>
                    </div>
                `;

                // Agregar eventos
                const inputCantidad = itemCarrito.querySelector('input');
                /*inputCantidad.addEventListener('change', (e) => {
                    actualizarItemCarrito(item.producto.id, parseInt(e.target.value));
                });*/
                inputCantidad.addEventListener('change', async (e) => {
                    const nuevaCantidad = parseInt(e.target.value);
                    const idProducto = e.target.dataset.id;
                    
                    try {
                        if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
                        // Si el valor no es válido, restaurar el valor anterior
                        const item = await obtenerItemCarrito(idProducto);
                        e.target.value = item ? item.cantidad : 1;
                        return;
                        }

                        const resultado = await actualizarItemCarrito(idProducto, nuevaCantidad);
                        
                        if (!resultado.success) {
                        // Restaurar valor si falla la actualización
                        const item = await obtenerItemCarrito(idProducto);
                        e.target.value = item ? item.cantidad : 1;
                        alert(resultado.error || 'Error al actualizar cantidad');
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        // Restaurar valor en caso de error
                        const item = await obtenerItemCarrito(idProducto);
                        e.target.value = item ? item.cantidad : 1;
                    }
                });
                
                const btnRemover = itemCarrito.querySelector('.remover-item');
                btnRemover.addEventListener('click', () => {
                    removerCarrito(item.producto.id);
                });

                contenedorItemsCarrito.appendChild(itemCarrito);
            });  
        }

        if(resumenCarrito) {
            // Calcular total
            const total = itemsCarrito.reduce((sum, item) => {
                return sum + (item.producto ? item.producto.precio * item.cantidad : 0);
            }, 0);

            resumenCarrito.innerHTML = `
                <h3>Resumen</h3>
                <div class="fila-resumen">
                    <span>Subtotal:</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
                <div class="fila-resumen">
                    <span>Envío:</span>
                    <span>$0.00</span>
                </div>
                <div class="fila-resumen total-resumen">
                    <span>Total:</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
                <button class="btn checkout-btn">Proceder al pago</button>
            `
        }
    } catch(error) {
        console.error('Error al cargar el carrito:', error);
    }
}

// utilsProductos.js

// Crear tarjeta de producto
function crearTarjetaProducto(producto) {
    const tarjetaProducto = document.createElement('div');
    tarjetaProducto.className = 'tarjeta-producto fade-in';
    
    tarjetaProducto.innerHTML = `
        <div class="contenedor-imagen-producto">
            <img src="${producto.imagen}" alt="${producto.nombre}" class="imagen-producto">
            ${producto.stock <= 0 ? '<span class="no-stock">Agotado</span>': ''}
        </div>
        <div class="info-producto">
            <h3>${producto.nombre}</h3>
            <p class="precio-producto">$${producto.precio.toFixed(2)}</p>
            <p class="descripcion-producto">${producto.descripcion}</p>
            <div class="meta-producto">
                <span class="categoria-producto">${producto.categoria}</span>
                <span class="stock-producto">${producto.stock} disponibles</span>
            </div>
            <div class="acciones-producto">
                <button class="btn add-to-cart" data-id="${producto.id}"
                    ${producto.stock <= 0 ? 'disabled': ''}>
                    ${producto.stock <= 0 ? 'Agotado': 'Agregar al carrito'}
                </button>
            </div>
        </div>                                                                                                    
    `;

    // Agregar evento al botón de carrito
    tarjetaProducto.querySelector('.add-to-cart').addEventListener('click', () => {
        agregarCarrito(producto.id);
        //alert(`Producto agregado al carrito: ${producto.id}`);
    });

    return tarjetaProducto;
}

// Funciones del carrito
async function agregarCarrito(idProducto, cantidad = 1) {
    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idProducto, cantidad })
        });
        
        if (response.ok) {
            alert('Producto agregado al carrito');
            await cargarCarrito();            
        } else {
            const error = await response.json();
            alert(error.error || 'Error al agregar al carrito');
        }
    } catch (err) {
        console.error('Error al agregar al carrito:', err);
        alert('Error al agregar al carrito');
    }
}

// Actualizar cantidad en el carrito
async function actualizarItemCarrito(idProducto, cantidad) {
    try {
        const response = await fetch(`/api/cart/${idProducto}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cantidad })
        });
        
        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error };
        }

        return { success: true };
    } catch (err) {
        console.error('Error al actualizar el carrito:', err);
        return { 
            success: false, 
            error: 'Error de conexión al actualizar la cantidad' 
        };
    }
}

// Eliminar del carrito
async function removerCarrito(idProducto) {
    try {
        const response = await fetch(`/api/cart/${idProducto}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await cargarCarrito();
        } else {
            const error = await response.json();
            alert(error.error || 'Error al eliminar del carrito');
        }
    } catch (err) {
        console.error('Error al eliminar del carrito:', err);
        alert('Error al eliminar del carrito');
    }
}

// Añade esta nueva función auxiliar
async function obtenerItemCarrito(idProducto) {
    try {
        const response = await fetch('/api/cart');
        if (response.ok) {
        const carrito = await response.json();
        return carrito.find(item => item.producto.id === idProducto);
        }
        return null;
    } catch (error) {
        consoler.error('Error al obtener carrito:', error);
        return null;
    }
}

function mostrarError(mensaje) {
    const contenedorProducto = document.getElementById('lista-productos');
    if (contenedorProducto) {
        contenedorProducto.innerHTML = `
            <div class="mensaje-error">
                <p>${mensaje}</p>
                <button class="btn" onclick="window.location.reload()">Recargar</button>
            </div>
        `;
    }
}

