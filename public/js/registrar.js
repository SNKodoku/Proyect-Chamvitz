document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-registro');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      nombre: form.nombre.value,
      oficio: form.oficio.value,
      estado: form.delegacion.value,
      ciudad: '',       // Puedes personalizar esto después
      colonia: '',      // Puedes agregar campo si quieres
      descripcion: form.descripcion.value,
      experiencia: '',  // Puedes agregar experiencia luego
      contacto: form.contacto.value,
      foto: form.foto.value || ''
    };

    try {
      const res = await fetch('/api/profesionales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error('Error al registrar profesional');

      const resultado = await res.json();
      alert('¡Registrado con éxito!');
      form.reset();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  });
});

