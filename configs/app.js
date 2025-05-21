'use strict'


const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');


//Definiciones de rutas
const categoriaRoutes = require('../src/routes/categoria.routes');
const tipo_consultaRoutes = require('../src/routes/tipo_consuta.routes');
const userRoutes = require('../src/routes/user.routes');
const asignacionRoutes = require('../src/routes/asignacion_consulta.routes');

const app = express(); //instancia

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());
app.use(cors());

//Declaraciones de rutas
app.use('/categoria', categoriaRoutes);
app.use('/tipoConsulta', tipo_consultaRoutes);
app.use('/user', userRoutes);
app.use('/asignacion', asignacionRoutes);

module.exports = app;