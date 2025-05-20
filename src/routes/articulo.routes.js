'use strict'

const express = require('express');
const articuloController = require('../controllers/articulo.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Implementación de Imágenes//
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({ uploadDir: './uploads/articulos' });

//FUNCIÓN PÚBLICA DE PRUEBA
api.get('/pruebaArticulo', articuloController.pruebaArticulos);
api.get('/getFourArticulos',articuloController.getFourArticulos);
api.get('/quantityArticulos', articuloController.quantityArticulos);
api.get('/getArticulosByCategoria/:id', articuloController.filterArticulosByCategoria);
api.post('/searchArticulos',articuloController.searchArticulos);
api.get('/lastArticulos',articuloController.getLastFourArticulos);
api.get('/getArticulosMitad',articuloController.getMiddleFourArticulos);
api.get('/getEnPortada', articuloController.getOnlyOfertas);

//Funciones publicas 
api.get('/getArticulos', articuloController.getArticulos);
api.get('/getArticulosTope', articuloController.getArticulosTope);
api.get('/getArticulo/:id',articuloController.getArticulo);

//Funciones privadas[mdAuth.ensureAuth],
api.post('/addArticulo',[mdAuth.ensureAuth], articuloController.addArticulo);
api.get('/getArticulosAdmin',[mdAuth.ensureAuth],articuloController.getArticulosAdmin);
api.get('/getArticuloAdmin/:id',[mdAuth.ensureAuth],articuloController.getArticuloAdmin);
api.put('/updateArticulo/:id', [mdAuth.ensureAuth],articuloController.updateArticulo);
api.delete('/deleteArticulo/:id',[mdAuth.ensureAuth],articuloController.deleteArticulo);

//Agregar una imagen
api.put('/addMoreImageArticulo/:id/:imagenID', multipartMiddleware,[mdAuth.ensureAuth],articuloController.addMoreImagenesArticulo);
api.post('/addImageArticulo/:id', multipartMiddleware, [mdAuth.ensureAuth],articuloController.addImageArticulo);
api.get('/getImageArticulo/:fileName', articuloController.getImageArticulo);


module.exports = api;