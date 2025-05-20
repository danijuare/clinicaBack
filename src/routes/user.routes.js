'use strict'

const express = require('express');
const userController = require('../controllers/user.controller');
const api = express.Router();

//FUNCIÓN PÚBLICA DE PRUEBA
api.get('/test', userController.test);
api.get('/getUsuarios', userController.getUsuarios);
api.get('/getUser/:id', userController.getUser);

//RUTAS PRIVADAS
api.post('/addUser', userController.addUser);
api.post('/login', userController.login);
api.put('/updateUser/:id', userController.updateUser);

module.exports = api;