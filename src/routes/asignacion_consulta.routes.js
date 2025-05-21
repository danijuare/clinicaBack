'use strict'

const express = require('express');
const asignacionController = require('../controllers/asignacion_consulta.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');


//Función publica de prueba
api.get('/prueba', asignacionController.prueba);

module.exports = api;