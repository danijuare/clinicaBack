'use strict'

const express = require('express');
const depaController = require('../controllers/departamentos.controller');
const api = express.Router();

//FUNCIÓN PÚBLICA DE PRUEBA
api.get('/prueba', depaController.prueba);
api.get('/getDepartamentos',depaController.getDepartamentos);

module.exports = api;