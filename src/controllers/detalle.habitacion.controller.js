'use strict'

//conexion a la base de datos
const db = require('../../configs/mariaDBConfigs');


//Función de prueba
exports.test = async (req, res) => {
    res.status(200).send({ message: 'Controller Detalle Habitacion is runing!!' });
}


//Funcion para obtener un habitacion por el ID
exports.gethabitacionDetalle = async (req, res) => {
    let connetion
    try {
        //conexion a la bd
        connetion = await db.init();
        //id
        const habitacionid = req.params.id;
        //ejecutar
        const buscar = `SELECT d.* FROM detalle_habitaciones d
            INNER JOIN habitaciones h ON d.idhabitacion = h.idhabitacion
            WHERE h.idhabitacion = ?`;
        const [exis] = await connetion.execute(buscar, [habitacionid]);

        if (exis.length > 0) {
            res.status(200).send({ message: 'Detalle obtenido exitosamente ', data: exis[0] });
        } else {
            res.status(404).send({ message: 'Detalle no encontrado o no existe' });
        }
        //await connetion.end();
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al obtener el Detalle' });
    } finally {
        if (connetion) {
            await connetion.end();
        }
    }
}


//Función para agregar nuevo hotel
exports.addDetalleHabitacion = async (req, res) => {
    let connection
    try {
        // conexion a la base de datos
        connection = await db.init();
        // datos a enviar
        const { idreservaciones,idhabitacion,idservicios} = req.body;

        // query para el insert
        const queryInsert = `INSERT INTO detalle_habitaciones(idreservaciones,idhabitacion,idservicios)
                                VALUES (?,?,?)`;
        // valores para la consulta
        const values = [idreservaciones,idhabitacion,idservicios];
        // ejecutar query de inserción
        const [resultInsert] = await connection.execute(queryInsert, values);
        // obtener el id de la hotel insertada
        const idInsertada = resultInsert.insertId;

        // query para obtener la hotel insertada
        const queryObtener = `SELECT * FROM detalle_habitaciones WHERE iddetalle_habitaciones = ?`;
        const [rowsInsertada] = await connection.execute(queryObtener, [idInsertada]);

        // Verificar si se encontró la categoría
        if (rowsInsertada.length > 0) {
            res.status(200).send({ message: 'Detalle Agregada Exitosamente', data: rowsInsertada[0] });
        } else {
            res.status(404).send({ message: 'Error al agregar Detalle' });
        }

        //await connection.end();
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Agregar el Detalle', error: err });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}