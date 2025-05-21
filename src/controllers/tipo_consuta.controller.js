'use strict'

const db = require('../../configs/mariaDBConfigs');

//Funcion de prueba
exports.pruebaTipoConsulta = async (req, res) => {
    res.status(200).send({ message: 'Controller Tipo Consulta is runing !!' });
}


exports.getTipoConsultas = async (req, res, next) => {
    let connection
    try {
        //conexion a la base de datos await
        connection = await db.init();
        //consulta a realizar
        const query = 'SELECT * FROM tipo_consulta WHERE condicion = 1';
        //guardar y ejecutar
        const [rows] = await connection.execute(query);
        res.status(200).send({ message: 'Tipos de Consultas Obtenidas Exitosamente ', data: rows });
        //await connection.end();
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Obtener Tipos de Consultas' });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

exports.getTipoConsultasAdmin = async (req, res, next) => {
    let connection
    try {
        //conexion a la base de datos await
        connection = await db.init();
        //consulta a realizar
        const query = 'SELECT * FROM tipo_consulta';
        //guardar y ejecutar
        const [rows] = await connection.execute(query);
        res.status(200).send({ message: 'Tipos de Consultas Obtenidas Exitosamente ', data: rows });
        //await connection.end();
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Obtener Tipos de Consultas' });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

exports.getOneTipoConsulta = async (req, res, next) => {
    let connection
    try {
        //conexion
        connection = await db.init();
        //id en ruta
        const idtipo_consulta = req.params.id;
        //buscar
        const buscarC = "SELECT * FROM tipo_consulta WHERE idtipo_consulta = ?";
        const [existeC] = await connection.execute(buscarC, [idtipo_consulta]);

        if (existeC.length > 0) {
            res.status(200).send({ message: 'tipo_consulta obtenida exitosamente', data: existeC[0] });
        } else {
            res.status(404).send({ message: 'tipo_consulta no encontrada o no existe' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Error al obtener la tipo_consulta' });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

exports.addTipoConsulta = async (req, res) => {
    let connection;
    try {
        // Conexión a la base de datos
        connection = await db.init();

        // Datos del cuerpo de la solicitud
        const { nombre, descripcion } = req.body;
        const condicion = 1;

        // Verificar si el tipo de consulta ya existe
        const queryVerificar = `SELECT * FROM tipo_consulta WHERE nombre = ?`;
        const [rows] = await connection.execute(queryVerificar, [nombre]);

        if (rows.length > 0) {
            return res.status(400).send({ message: 'El nombre del tipo de consulta ya existe. Por favor ingrese otro.' });
        }

        // Insertar el nuevo tipo de consulta
        const queryInsertar = `INSERT INTO tipo_consulta (nombre, descripcion, condicion) VALUES (?, ?, ?)`;
        const [resultInsert] = await connection.execute(queryInsertar, [nombre, descripcion, condicion]);

        const idInsertado = resultInsert.insertId;

        // Obtener el registro insertado
        const queryObtener = `SELECT * FROM tipo_consulta WHERE idtipo_consulta = ?`;
        const [rowsInsertado] = await connection.execute(queryObtener, [idInsertado]);

        if (rowsInsertado.length > 0) {
            return res.status(200).send({
                message: 'Tipo de consulta agregado exitosamente',
                data: rowsInsertado[0]
            });
        } else {
            return res.status(404).send({ message: 'Error al recuperar el tipo de consulta insertado.' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error al agregar el tipo de consulta', error: err });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

exports.updateTipoConsulta = async (req, res) => {
    let connection;
    try {
        // Conexión a la base de datos
        connection = await db.init();

        // Datos del cuerpo de la solicitud
        const { nombre, descripcion, condicion } = req.body;
        // ID recibido en la ruta
        const idTipoConsulta = req.params.id;

        // Verificar si el tipo de consulta existe
        const queryBuscar = "SELECT * FROM tipo_consulta WHERE idtipo_consulta = ?";
        const [tipoConsultaExiste] = await connection.execute(queryBuscar, [idTipoConsulta]);

        if (tipoConsultaExiste.length > 0) {
            // Realizar la actualización
            const queryActualizar = "UPDATE tipo_consulta SET nombre = ?, descripcion = ?, condicion = ? WHERE idtipo_consulta = ?";
            const valuesActualizar = [nombre, descripcion, condicion, idTipoConsulta];
            await connection.execute(queryActualizar, valuesActualizar);

            // Obtener y devolver el registro actualizado
            const queryObtenerActualizado = "SELECT * FROM tipo_consulta WHERE idtipo_consulta = ?";
            const [registroActualizado] = await connection.execute(queryObtenerActualizado, [idTipoConsulta]);

            res.status(200).send({
                message: 'Tipo de consulta actualizado exitosamente',
                data: registroActualizado[0]
            });
        } else {
            res.status(404).send({ message: 'Tipo de consulta no encontrado.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al actualizar el tipo de consulta', error: err });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};


