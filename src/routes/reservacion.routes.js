'use strict'

const express = require('express');
const reservacionController = require('../controllers/reservacion.controller');
const api = express.Router();


//FUNCIÓN PÚBLICA DE PRUEBA
api.get('/test', reservacionController.test);
api.get('/getReservaciones', reservacionController.getReservaciones);
api.get('/getReservacion/:id', reservacionController.getReservacion);
api.get('/generatePDFByReservacion/:id', reservacionController.generatePDFByReservacion);

//RUTAS PRIVADAS
api.post('/addReservacion', reservacionController.addReservacion);
api.put('/updateReservacion/:id', reservacionController.updateReservacion);
api.delete('/cancelarReservacion/:id', reservacionController.cancelarReservacion);

module.exports = api;