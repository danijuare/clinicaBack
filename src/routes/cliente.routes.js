'use strict'

const express = require('express');
const clienteController = require('../controllers/cliente.controller');
const api = express.Router();

//FUNCIÓN PÚBLICA DE PRUEBA
api.get('/test', clienteController.test);
api.get('/getClientes', clienteController.getClientes);
api.get('/getCliente/:id', clienteController.getCliente);

//RUTAS PRIVADAS
api.post('/addCliente', clienteController.addCliente);
api.put('/updateCliente/:id', clienteController.updateCliente);

module.exports = api;