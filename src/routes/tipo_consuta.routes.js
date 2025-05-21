'use strict'

const express = require('express');
const tipo_consultaController = require('../controllers/tipo_consuta.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Función publica de prueba
api.get('/pruebaTipoConsulta', tipo_consultaController.pruebaTipoConsulta);

//Funciones publicas
api.get('/getTipoConsultas', tipo_consultaController.getTipoConsultas);

//Funciones privadas
api.get('/getCategoriasAdmin', [mdAuth.ensureAuth],tipo_consultaController.getTipoConsultasAdmin);
api.get('/getTipoConsulta/:id', [mdAuth.ensureAuth], tipo_consultaController.getOneTipoConsulta);
api.post('/addTipoConsulta', [mdAuth.ensureAuth], tipo_consultaController.addTipoConsulta);
api.put('/updateTipoConsulta/:id', [mdAuth.ensureAuth], tipo_consultaController.updateTipoConsulta);

module.exports = api;