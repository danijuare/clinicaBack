'use strict'

const express = require('express');
const facturaController = require('../controllers/factura.controller');
const api = express.Router();

//FUNCIÓN PÚBLICA DE PRUEBA
api.get('/test', facturaController.test);
api.get('/getFacturas', facturaController.getFacturas);
api.get('/getFactura/:id', facturaController.getFactura);
api.get('/pdfFactura/:id', facturaController.generatePDFByFactura);

//RUTAS PRIVADAS
api.post('/addFactura', facturaController.addFactura);
/*
api.get('/getHoteles', facturaController.getHoteles);
api.get('/getHotel/:id', facturaController.getHotel);


api.put('/updateHotel/:id', facturaController.updateHotel);
//Agregar una imagen
api.post('/addImage/:id', multipartMiddleware, facturaController.addImage);
api.get('/getImage/:fileName', facturaController.getImage);
*/

module.exports = api;