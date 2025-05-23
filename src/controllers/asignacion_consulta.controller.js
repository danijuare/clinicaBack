'use strict'

const db = require('../../configs/mariaDBConfigs');

//Funcion de prueba
exports.prueba = async (req, res) => {
    res.status(200).send({ message: 'Controller Asignacion Consultas is runing !!' });
}

exports.getAsignaciones = async (req, res, next) => {
    let connection
    try {
        //conexion a la base de datos await
        connection = await db.init();
        //consulta a realizar
        const query = `SELECT
            asi.idasignacion_consulta,
            asi.idtipo_consulta,
            asi.descripcion,
            asi.nombre_cliente,
            asi.telefono_cliente,
            asi.fecha_hora_creacion,
            asi.condicion,
            asi.atendido,
            asi.fecha_hora_salida,
            t.nombre AS nombre_tipo_consulta,
            v.nombre AS nombre_ventanilla
        FROM asignacion_consulta asi
        INNER JOIN tipo_consulta t ON asi.idtipo_consulta = t.idtipo_consulta
        LEFT JOIN (
            SELECT idtipo_consulta, nombre, idventanillas
            FROM ventanillas
            GROUP BY idtipo_consulta, nombre
        ) v ON asi.idtipo_consulta = v.idtipo_consulta
        ORDER BY asi.fecha_hora_creacion ASC`;
        //guardar y ejecutar
        const [rows] = await connection.execute(query);
        res.status(200).send({ message: 'Asignaciones Obtenidas Exitosamente ', data: rows });
        //await connection.end();
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Obtener las Asignaciones' });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

exports.getAsignacionesPendientes = async (req, res, next) => {
    let connection
    try {
        //conexion a la base de datos await
        connection = await db.init();
        //consulta a realizar
        const query = `SELECT
            asi.idasignacion_consulta,
            asi.idtipo_consulta,
            asi.descripcion,
            asi.nombre_cliente,
            asi.telefono_cliente,
            asi.fecha_hora_creacion,
            asi.condicion,
            asi.atendido,
            asi.fecha_hora_salida,
            t.nombre AS nombre_tipo_consulta,
            v.nombre AS nombre_ventanilla
        FROM asignacion_consulta asi
        INNER JOIN tipo_consulta t ON asi.idtipo_consulta = t.idtipo_consulta
        LEFT JOIN (
            SELECT idtipo_consulta, nombre, idventanillas
            FROM ventanillas
            GROUP BY idtipo_consulta, nombre
        ) v ON asi.idtipo_consulta = v.idtipo_consulta
        WHERE asi.atendido = 'NO'
        ORDER BY asi.fecha_hora_creacion ASC`;
        //guardar y ejecutar
        const [rows] = await connection.execute(query);
        res.status(200).send({ message: 'Asignaciones Pendientes Obtenidas Exitosamente ', data: rows });
        //await connection.end();
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Obtener las Asignaciones Pendientes' });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

exports.addAsignacionConsulta = async (req, res) => {
    let connection;
    try {
        // conexión a la base de datos
        connection = await db.init();

        // extraer los datos del cuerpo de la petición
        const {
            idtipo_consulta,
            descripcion,
            nombre_cliente,
            telefono_cliente,
            fecha_hora_creacion, // asegurarse de enviar este campo en formato DATETIME válido (YYYY-MM-DD HH:mm:ss)
            fecha_hora_salida // opcional, también formato válido si se envía
        } = req.body;

        const condicion = 1;
        const atendido = 'NO';

        // query de inserción
        const queryInsert = `
            INSERT INTO asignacion_consulta (
                idtipo_consulta, descripcion, nombre_cliente, telefono_cliente,
                fecha_hora_creacion, condicion, atendido, fecha_hora_salida
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            idtipo_consulta,
            descripcion || null,
            nombre_cliente || null,
            telefono_cliente || null,
            fecha_hora_creacion || null,
            condicion,
            atendido,
            fecha_hora_salida || null
        ];

        const [result] = await connection.execute(queryInsert, values);

        // obtener el ID del nuevo registro
        const insertedId = result.insertId;

        // recuperar el registro insertado
        const [newRecord] = await connection.execute(
            `SELECT * FROM asignacion_consulta WHERE idasignacion_consulta = ?`,
            [insertedId]
        );

        if (newRecord.length > 0) {
            res.status(200).send({ message: 'Consulta asignada correctamente', data: newRecord[0] });
        } else {
            res.status(404).send({ message: 'Error al recuperar la asignación insertada' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al asignar consulta', error: err });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

exports.getAsignacionesPendientesVentanilla = async (req, res, next) => {
    let connection;
    try {
        const { id } = req.params;

        connection = await db.init();

        const query = `
            SELECT
            v.idventanillas,
            v.nombre AS nombre_ventanilla,
            asi.idasignacion_consulta,
            asi.nombre_cliente,
            asi.telefono_cliente,
            asi.descripcion AS descripcion_consulta,
            asi.fecha_hora_creacion,
            asi.atendido,
            t.nombre AS nombre_tipo_consulta
        FROM asignacion_consulta asi
        INNER JOIN tipo_consulta t ON asi.idtipo_consulta = t.idtipo_consulta
        INNER JOIN ventanillas v ON t.idtipo_consulta = v.idtipo_consulta
        WHERE v.idventanillas = ?
        ORDER BY asi.fecha_hora_creacion
        `;
        const [rows] = await connection.execute(query, [id]);

        res.status(200).send({ message: 'Asignaciones pendientes obtenidas exitosamente', data: rows });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al obtener las asignaciones pendientes', error: err });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

exports.getVentanillas = async (req, res, next) => {
    let connection
    try {
        //conexion a la base de datos await
        connection = await db.init();
        //consulta a realizar
        const query = `SELECT v.*,t.* FROM ventanillas v
        INNER JOIN tipo_consulta t ON v.idtipo_consulta = t.idtipo_consulta
        WHERE v.condicion = 1 AND t.condicion = 1`;
        //guardar y ejecutar
        const [rows] = await connection.execute(query);
        res.status(200).send({ message: 'Ventanillas Obtenidas Exitosamente ', data: rows });
        //await connection.end();
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Obtener las Ventanillas' });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

/**
 * SELECT
    asi.idasignacion_consulta,
    asi.idtipo_consulta,
    asi.descripcion,
    asi.nombre_cliente,
    asi.telefono_cliente,
    asi.fecha_hora_creacion,
    asi.condicion,
    asi.atendido,
    asi.fecha_hora_salida,
    t.nombre AS nombre_tipo_consulta,
    v.nombre AS nombre_ventanilla
FROM asignacion_consulta asi
INNER JOIN tipo_consulta t ON asi.idtipo_consulta = t.idtipo_consulta
LEFT JOIN (
    SELECT idtipo_consulta, nombre, idventanillas
    FROM ventanillas
    GROUP BY idtipo_consulta, nombre
) v ON asi.idtipo_consulta = v.idtipo_consulta
WHERE v.idventanillas = '4'
and asi.atendido = 'NO'
ORDER BY asi.fecha_hora_creacion ASC
 */

