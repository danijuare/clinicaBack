'use strict'


const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');


//Definiciones de rutas
const userRoutes = require('../src/routes/user.routes');
const categoriaRoutes = require('../src/routes/categoria.routes');
const articuloRoutes = require('../src/routes/articulo.routes');
const depaRoutes = require('../src/routes/departamentos.routes');
const muniRoutes = require('../src/routes/municipios.routes');
const hotelRoutes = require('../src/routes/hotel.routes');
const clienteRoutes = require('../src/routes/cliente.routes');
const servicioRoutes = require('../src/routes/servicios.routes');
const habitacionesRoutes = require('../src/routes/habitaciones.routes');
const detalleHabitacionRoutes = require('../src/routes/detalle.habitacion.routes');
const reservacionRoutes = require('../src/routes/reservacion.routes');
const facturaRoutes = require('../src/routes/factura.routes');

const app = express(); //instancia

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());
app.use(cors());

//Declaraciones de rutas
app.use('/user', userRoutes);
app.use('/categoria', categoriaRoutes);
app.use('/articulo', articuloRoutes);
app.use('/depa', depaRoutes);
app.use('/muni', muniRoutes);
app.use('/hotel',hotelRoutes);
app.use('/cliente',clienteRoutes);
app.use('/servicio',servicioRoutes);
app.use('/habitacion',habitacionesRoutes);
app.use('/detallehabitacion', detalleHabitacionRoutes);
app.use('/reservacion',reservacionRoutes);
app.use('/factura',facturaRoutes);

module.exports = app;