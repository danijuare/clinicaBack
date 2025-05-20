'use strict'

const express = require('express');
const habitacionesController = require('../controllers/habitaciones.controller');
const api = express.Router();

//Implementación de Imágenes//
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({ uploadDir: './uploads/habitaciones' });

//FUNCIÓN PÚBLICA DE PRUEBA
api.get('/test', habitacionesController.test);
api.get('/getHabitaciones', habitacionesController.getHabitaciones);
api.get('/getHabitacion/:id', habitacionesController.getHabitacion);

//RUTAS PRIVADAS
api.post('/addHabitacion', habitacionesController.addHabitacion);
api.put('/updateHabitacion/:id', habitacionesController.updateHabitacion);

//RUTAS PRIVADAS
//Agregar una imagen
api.post('/addImage/:id', multipartMiddleware, habitacionesController.addImage);
api.get('/getImage/:fileName', habitacionesController.getImage);
module.exports = api;