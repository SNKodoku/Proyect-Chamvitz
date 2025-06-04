const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Profesional } = require('./database');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Obtener todos los profesionales
router.get('/', async (req, res) => {
  const profesionales = await Profesional.findAll();
  res.json(profesionales);
});

// Crear un nuevo profesional
router.post('/', upload.single('foto'), async (req, res) => {
  const { nombre, oficio, delegacion, descripcion, experiencia, contacto } = req.body;
  const foto = req.file ? `/uploads/${req.file.filename}` : '';

  const nuevo = await Profesional.create({
    nombre, oficio, delegacion, descripcion, experiencia, contacto, foto
  });
  res.json(nuevo);
});

// Actualizar profesional
router.put('/:id', upload.single('foto'), async (req, res) => {
  const { nombre, oficio, delegacion, descripcion, experiencia, contacto } = req.body;
  const foto = req.file ? `/uploads/${req.file.filename}` : req.body.foto || '';

  const actualizado = await Profesional.update(
    { nombre, oficio, delegacion, descripcion, experiencia, contacto, foto },
    { where: { id: req.params.id } }
  );
  res.json({ actualizado });
});

// Eliminar profesional
router.delete('/:id', async (req, res) => {
  await Profesional.destroy({ where: { id: req.params.id } });
  res.json({ eliminado: true });
});

module.exports = router;