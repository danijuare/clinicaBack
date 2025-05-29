'use strict'

const express = require('express');
const asignacionController = require('../controllers/asignacion_consulta.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');


//Función publica de prueba
api.get('/prueba', asignacionController.prueba);
api.get('/getAsignaciones', asignacionController.getAsignaciones);
api.get('/getVentanillas', asignacionController.getVentanillas);
api.get('/getAsignacionesPendientes', asignacionController.getAsignacionesPendientes);

api.post('/addAsignacionConsulta', asignacionController.addAsignacionConsulta);
api.get('/getAsignacionesPendientesVentanilla/:id', asignacionController.getAsignacionesPendientesVentanilla);
api.get('/getAsignacionesPorVentanilla/:id', asignacionController.getAsignacionesPorVentanilla);
api.get('/getAsignacionesPorVentanillaRevisadas/:id', asignacionController.getAsignacionesPorVentanillaRevisadas);

api.get('/updateAtendido/:id', asignacionController.updateAtendido);
api.get('/updateRevisado/:id', asignacionController.updateRevisado);

module.exports = api;