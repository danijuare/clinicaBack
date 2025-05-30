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

//REPORTES
//1
api.post('/generatePDFConsultasAtendidas', asignacionController.generatePDFConsultasAtendidas);
api.post('/generateConsultasAtendidas', asignacionController.generateConsultasAtendidas);
//2
api.post('/generatePDFConsultasRevisadasNoAtendidas', asignacionController.generatePDFConsultasRevisadasNoAtendidas);
api.post('/generateConsultasRevisadasNoAtendidas', asignacionController.generateConsultasRevisadasNoAtendidas);
//3
api.post('/generatePDFConsultasTotalPorVentanilla', asignacionController.generatePDFConsultasTotalPorVentanilla);
api.post('/generateConsultasTotalPorVentanilla', asignacionController.generateConsultasTotalPorVentanilla);
//4
api.post('/generatePDFConsultasGeneral', asignacionController.generatePDFConsultasGeneral);
api.post('/generateConsultasGeneral', asignacionController.generateConsultasGeneral);
module.exports = api;