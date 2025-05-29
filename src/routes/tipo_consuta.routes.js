'use strict'

const express = require('express');
const tipo_consultaController = require('../controllers/tipo_consuta.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Función publica de prueba
api.get('/pruebaTipoConsulta', tipo_consultaController.pruebaTipoConsulta);

//Funciones publicas
api.get('/getTipoConsultas', tipo_consultaController.getTipoConsultas);
api.get('/getCategoriasAdmin', tipo_consultaController.getTipoConsultasAdmin);
api.get('/getTipoConsulta/:id', tipo_consultaController.getOneTipoConsulta);
api.post('/addTipoConsulta',  tipo_consultaController.addTipoConsulta);
api.put('/updateTipoConsulta/:id', tipo_consultaController.updateTipoConsulta);

api.get('/getVentanillas', tipo_consultaController.getVentanillas);
api.get('/getVentanilla/:id', tipo_consultaController.getVentanilla);
api.post('/addVentanilla',  tipo_consultaController.addVentanilla);
api.put('/updateVentanilla/:id', tipo_consultaController.updateVentanilla);

api.get('/getVentanillasActivas', tipo_consultaController.getVentanillasActivas);

module.exports = api;