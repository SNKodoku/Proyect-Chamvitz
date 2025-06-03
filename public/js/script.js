
document.addEventListener('DOMContentLoaded', function() {
  const searchForm = document.getElementById('search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const oficio = searchForm.oficio.value;
      const estado = searchForm.estado.value;
      const ciudad = searchForm.ciudad.value;
      const colonia = searchForm.colonia.value;
      const query = `oficio=${oficio}&estado=${estado}&ciudad=${ciudad}&colonia=${colonia}`;
      window.location.href = `profesionales.html?${query}`;
    });
  }
});

// En profesionales.html
if (window.location.pathname.includes('profesionales.html')) {
  const container = document.getElementById('profesionales-container');
  const params = new URLSearchParams(window.location.search);
  fetch(`/api/profesionales?${params}`)
    .then(res => res.json())
    .then(data => {
      data.forEach(pro => {
        const card = document.createElement('div');
        card.classList.add('profesional-card');
        card.innerHTML = `
          <img src="${pro.foto || 'img/profesional1.jpg'}" alt="${pro.nombre}">
          <h3>${pro.nombre}</h3>
          <p>${pro.oficio} - ${pro.ciudad}</p>
          <button onclick="window.location.href='perfil.html?id=${pro.id}'">Ver Perfil</button>
        `;
        container.appendChild(card);
      });
    });
}

// En perfil.html
if (window.location.pathname.includes('perfil.html')) {
  const id = new URLSearchParams(window.location.search).get('id');
  const container = document.getElementById('perfil-container');
  fetch(`/api/profesional/${id}`)
    .then(res => res.json())
    .then(pro => {
      container.innerHTML = `
        <img src="${pro.foto || 'img/profesional1.jpg'}" alt="${pro.nombre}">
        <h3>${pro.nombre}</h3>
        <p><strong>Oficio:</strong> ${pro.oficio}</p>
        <p><strong>Ubicación:</strong> ${pro.ciudad}, ${pro.estado}, ${pro.colonia}</p>
        <p><strong>Descripción:</strong> ${pro.descripcion}</p>
        <p><strong>Experiencia:</strong> ${pro.experiencia || 'N/A'}</p>
        <p><strong>Contacto:</strong> ${pro.contacto}</p>
      `;
    });
}

// En registrar.html
const formRegistro = document.getElementById('form-registro');
if (formRegistro) {
  formRegistro.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(formRegistro);
    const data = {};
    formData.forEach((value, key) => data[key] = value);
    fetch('/api/profesionales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(res => {
      alert('¡Profesional registrado con éxito!');
      window.location.href = 'profesionales.html';
    });
  });
}

// Nuevo código para cargar dinámicamente colonias:
document.addEventListener("DOMContentLoaded", function() {
  const delegacionSelect = document.getElementById("delegacion");
  const coloniaSelect = document.getElementById("colonia");

  const coloniasPorDelegacion = {
    "tlalpan": ["Tlalpan Centro", "Villa Coapa", "Pedregal de San Nicolás", "Parres el Guarda"],
    "coyoacan": ["Copilco", "Del Carmen", "La Concepción", "Los Reyes"],
    "cuauhtemoc": ["Centro", "Doctores", "Roma Norte", "Condesa"]
    // Aquí pondrías el resto de las colonias de todas las delegaciones
  };

  delegacionSelect.addEventListener("change", function() {
    const delegacion = this.value;
    const colonias = coloniasPorDelegacion[delegacion] || [];
    coloniaSelect.innerHTML = '<option value="">Selecciona una colonia</option>';
    colonias.forEach(function(colonia) {
      const option = document.createElement("option");
      option.value = colonia.toLowerCase().replace(/\s+/g, "_");
      option.textContent = colonia;
      coloniaSelect.appendChild(option);
    });
  });
});


/* index.html*/
    document.addEventListener("DOMContentLoaded", () => {
      const menuIcon = document.getElementById("menu-icon");
      const navList = document.getElementById("nav-list");

      menuIcon.addEventListener("click", () => {
        navList.classList.toggle("active");
      });
    });

    /*profecionales.html*/