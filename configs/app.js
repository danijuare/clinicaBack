'use strict'


const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');


//Definiciones de rutas
const categoriaRoutes = require('../src/routes/categoria.routes');

const app = express(); //instancia

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());
app.use(cors());

//Declaraciones de rutas
app.use('/categoria', categoriaRoutes);

module.exports = app;