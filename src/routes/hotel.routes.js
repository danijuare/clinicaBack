'use strict'

const express = require('express');
const hotelController = require('../controllers/hotel.controller');
const api = express.Router();

//Implementación de Imágenes//
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({ uploadDir: './uploads/hoteles' });

//FUNCIÓN PÚBLICA DE PRUEBA
api.get('/hotelPruebas', hotelController.hotelPruebas);
api.get('/getHoteles', hotelController.getHoteles);
api.get('/getHotel/:id', hotelController.getHotel);

//RUTAS PRIVADAS
api.post('/addHotel', hotelController.addHotel);
api.put('/updateHotel/:id', hotelController.updateHotel);
//Agregar una imagen
api.post('/addImage/:id', multipartMiddleware, hotelController.addImage);
api.get('/getImage/:fileName', hotelController.getImage);


module.exports = api;