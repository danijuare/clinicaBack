'use strict'

const express = require('express');
const categoriaController = require('../controllers/categoria.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Implementación de Imágenes//
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({ uploadDir: './uploads/categorias' });


//Función publica de prueba
api.get('/pruebaCategoria', categoriaController.pruebaCategoria);

//Funciones publicas
api.get('/getCategorias', categoriaController.getCategorias);
api.get('/getFourCategorias', categoriaController.getFourCategorias);

//Funciones privadas [mdAuth.ensureAuth],
api.get('/getOneCategoria/:id', [mdAuth.ensureAuth], categoriaController.getOneCategoria);
api.get('/getCategoriasAdmin', [mdAuth.ensureAuth],categoriaController.getCategoriasAdmin);
api.post('/addCategoria', [mdAuth.ensureAuth], categoriaController.addCategoria);
api.put('/updateCategoria/:id', [mdAuth.ensureAuth], categoriaController.updateCategoria);
api.delete('/deteleCategoria/:id', [mdAuth.ensureAuth], categoriaController.deleteCategoria);




module.exports = api;