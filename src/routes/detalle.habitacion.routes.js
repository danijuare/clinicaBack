'use strict'

const express = require('express');
const detalleController = require('../controllers/detalle.habitacion.controller');
const api = express.Router();

//FUNCIÓN PÚBLICA DE PRUEBA
api.get('/test', detalleController.test);
api.get('/gethabitacionDetalle/:id', detalleController.gethabitacionDetalle);

//RUTAS PRIVADAS
api.post('/addDetalleHabitacion', detalleController.addDetalleHabitacion);

module.exports = api;