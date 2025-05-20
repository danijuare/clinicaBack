'use strict'

const express = require('express');
const muniController = require('../controllers/municipios.controller');
const api = express.Router();

//FUNCIÓN PÚBLICA DE PRUEBA
api.get('/prueba', muniController.prueba);
api.get('/getMunicipios/:id',muniController.getMunicipiosByDepa);

module.exports = api;