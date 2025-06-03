document.addEventListener('DOMContentLoaded', () => {
    // Configurar panel de administración
    if (document.getElementById('tabla-admin-producto')) {
        crearPanelAdministrador();
    }
    
});

function crearPanelAdministrador() {
    // Configurar panel de administración
    const addProductoBtn = document.getElementById('add-producto-btn');
    const formularioProducto = document.getElementById('formulario-producto');
    const contenedorFormularioProducto = document.getElementById('contenedor-formulario-producto');
    const btnCancelarProducto = document.getElementById('btn-cancelar-producto');

    // Cargar productos en la tabla de administración
    cargarAdminProductos();

    addProductoBtn.addEventListener('click', () => {
        // alert('Productos en venta'); // Solo como prueba de que trabaja el boton
        formularioProducto.reset();
        contenedorFormularioProducto.style.display = 'block';
    });

    btnCancelarProducto.addEventListener('click', () => {
        contenedorFormularioProducto.style.display = 'none';
    });

    // Manejar envio del formulario
    formularioProducto.addEventListener('submit', async(e) => {
        e.preventDefault();

        const idProducto = document.getElementById('id-producto').value;
        const formData = new FormData();
        //alert(idProducto);

        formData.append('nombre', document.getElementById('nombre-producto').value);
        formData.append('descripcion', document.getElementById('descripcion-producto').value);
        formData.append('precio', document.getElementById('precio-producto').value);
        formData.append('categoria', document.getElementById('categoria-producto').value);
        formData.append('stock', document.getElementById('stock-producto').value);

        const inputImagen = document.getElementById('imagen-producto');
        if (inputImagen.files[0]) {
            formData.append('imagen', inputImagen.files[0]);
        }

        try {
            let response;
            if(idProducto) {
                // Actualizar producto existente
                response = await fetch(`/api/productos/${idProducto}`, {
                    method: 'PUT',
                    body: formData
                });
            } else {
                // Crear nuevo producto
                response = await fetch('/api/productos', {
                    method: 'POST',
                    body: formData
                });
            }

            if(response.ok) {
                contenedorFormularioProducto.style.display = 'none';
                cargarAdminProductos();
            } else {
                const error = await response.json();
                alert(error.error || 'Error al guardar el producto');
            }
        } catch(error) {
            console.error('Error al guardar el producto:', error);
            alert('Error al guardar el producto');
        }
    })
}

// Cargar productos en la tabla de administración
async function cargarAdminProductos() {
    try {
        const response = await fetch('/api/productos');
        const productos = await response.json();

        /* Acceder a la tabla donde se listan los productos */
        const tBody = document.getElementById('tabla-admin-producto');
        if(tBody) {
            tBody.innerHTML = '';

            productos.forEach(producto => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${producto.nombre}</td>
                    <td>${producto.precio.toFixed(2)}</td>
                    <td>${producto.categoria}</td>
                    <td>${producto.stock}</td>
                    <td>
                        <button class="btn-accion btn-editar" data-id="${producto.id}">Editar</button>
                        <button class="btn-accion btn-borrar" data-id="${producto.id}">Eliminar</button>
                    </td>
                `
                // Agregar eventos a los botones
                fila.querySelector('.btn-editar').addEventListener('click', () => editarProducto(producto));
                fila.querySelector('.btn-borrar').addEventListener('click', () => borrarProducto(producto.id));
                //fila.querySelector('.btn-editar').addEventListener('click', () => alert('Edicion de producto'));

                tBody.appendChild(fila);
            });
        }
    } catch(err) {
        console.error('Error al cargar productos para administración:', err);
    }
}

// Editar producto
function editarProducto(producto) {
    const contenedorFormularioProducto = document.getElementById('contenedor-formulario-producto');
    //const formularioProducto = document.getElementById('formulario-producto');

    document.getElementById('id-producto').value = producto.id;
    document.getElementById('nombre-producto').value = producto.nombre;
    document.getElementById('descripcion-producto').value = producto.descripcion;
    document.getElementById('precio-producto').value = producto.precio;
    document.getElementById('categoria-producto').value = producto.categoria;
    document.getElementById('stock-producto').value = producto.stock;

    contenedorFormularioProducto.style.display = 'block';
}

// Eliminar producto
async function borrarProducto(idProducto) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    
    try {
        const response = await fetch(`/api/productos/${idProducto}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            cargarAdminProductos();
        } else {
            const error = await response.json();
            alert(error.error || 'Error al eliminar el producto');
        }
    } catch (err) {
        console.error('Error al eliminar el producto:', err);
        alert('Error al eliminar el producto');
    }
}