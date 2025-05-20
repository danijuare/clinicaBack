'use strict'

const express = require('express');
const servicioController = require('../controllers/servicios.controller');
const api = express.Router();

//Implementación de Imágenes//
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({ uploadDir: './uploads/servicios' });

//FUNCIÓN PÚBLICA DE PRUEBA
api.get('/test', servicioController.test);
api.get('/getServicios', servicioController.getServicios);
api.get('/getServicio/:id', servicioController.getServicio);

//RUTAS PRIVADAS
api.post('/addServicio', servicioController.addServicio);
api.put('/updateServicio/:id', servicioController.updateServicio);

//Agregar una imagen
api.post('/addImage/:id', multipartMiddleware, servicioController.addImage);
api.get('/getImage/:fileName', servicioController.getImage);


module.exports = api;