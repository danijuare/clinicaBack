'use strict'

//conexion a la base de datos
const db = require('../../configs/mariaDBConfigs');
//configuracion para las imagenes

//Función de prueba
exports.test = async (req, res) => {
    res.status(200).send({ message: 'Controller Cliente is runing!!' });
}

//Función para obtener todos los cliente
exports.getClientes = async (req, res) => {
    let connection;
    try {
        //conexion a la base de datos
        connection = await db.init();
        //consulta a realizar
        let query = `SELECT * FROM clientes`;
        //guardar y ejecutar la consulta
        const [rows] = await connection.execute(query);
        res.status(200).send({ message: 'Clientes Obtenidos Exitosamente ', data: rows });
        await connection.end();

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Obtener los Clientes ', error: err });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

//Funcion para obtener un cliente por el ID
exports.getCliente = async (req, res) => {
    let connetion
    try {
        //conexion a la bd
        connetion = await db.init();
        //id
        const clienteid = req.params.id;
        //ejecutar
        const buscar = "SELECT * FROM clientes  WHERE idcliente = ?";
        const [existe] = await connetion.execute(buscar, [clienteid]);

        if (existe.length > 0) {
            res.status(200).send({ message: 'Cliente obtenido exitosamente ', data: existe[0] });
        } else {
            res.status(404).send({ message: 'Cliente no encontrado o no existe' });
        }
        //await connetion.end();
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al obtener el Cliente' });
    } finally {
        if (connetion) {
            await connetion.end();
        }
    }
}


//Función para agregar nuevo cliente
exports.addCliente = async (req, res) => {
    let connection
    try {
        // conexion a la base de datos
        connection = await db.init();
        // datos a enviar
        const { nombre,apellido,email,telefono,documento_identidad} = req.body;
        console.log("Datos recibidos:", req.body);

        // Verificar si algún campo es undefined
        if (!nombre || !apellido || !email || !telefono || !documento_identidad) {
            return res.status(400).send({ message: 'Todos los campos son requeridos.' });
        }
        /*
        // query para verificar si la hotel ya existe
        const queryVerificar = `SELECT * FROM clientes WHERE nombre = ?`;
        const [rows] = await connection.execute(queryVerificar, [nombre]);

        // hotel existe
        if (rows.length > 0) {
            res.status(400).send({ message: 'Nombre de Cliente ya existe, ingresar otro nombre.' });
            await connection.end();
            return;
        }
        */

        // query para el insert
        const queryInsert = `INSERT INTO clientes(nombre,apellido,email,telefono,documento_identidad)
                                VALUES (?, ?, ?,?,?)`;
        // valores para la consulta
        const values = [nombre,apellido,email,telefono,documento_identidad];
        // ejecutar query de inserción
        const [resultInsert] = await connection.execute(queryInsert, values);
        // obtener el id de la hotel insertada
        const idInsertada = resultInsert.insertId;

        // query para obtener la hotel insertada
        const queryObtener = `SELECT * FROM clientes WHERE idcliente = ?`;
        const [rowsInsertada] = await connection.execute(queryObtener, [idInsertada]);

        // Verificar si se encontró la categoría
        if (rowsInsertada.length > 0) {
            res.status(200).send({ message: 'Cliente Agregada Exitosamente', data: rowsInsertada[0] });
        } else {
            res.status(404).send({ message: 'Error al agregar Cliente' });
        }

        //await connection.end();
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Agregar el Cliente', error: err });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

//Funcion para actualizar un cliente existente
exports.updateCliente = async (req, res) => {
    let connection
    try {
        //conexion a la base de datos
        connection = await db.init();
        //datos enviar en el body
        const { nombre,apellido,email,telefono,documento_identidad} = req.body;
        //ID en la ruta
        const idcliente = req.params.id;

        //validar si el hotel existe
        const buscarHotel = "SELECT * FROM clientes WHERE idcliente = ?";
        const [existe] = await connection.execute(buscarHotel, [idcliente]);

        if (existe.length > 0) {
            const update = "UPDATE clientes SET nombre=?,apellido=?,email=?,telefono=?,documento_identidad=? WHERE idcliente = ?";
            const valuesUpdate = [nombre,apellido,email,telefono,documento_identidad, idcliente];
            await connection.execute(update, valuesUpdate);

            //devolver Cliente actualizada
            const alreadeUpdate = "SELECT * FROM clientes WHERE idcliente = ?";
            const [mostrarUpdate] = await connection.execute(alreadeUpdate, [idcliente]);
            res.status(200).send({ message: 'Cliente actualizada exitosamente', data: mostrarUpdate[0] });

        } else {
            res.status(404).send({ message: 'Cliente no encontrada o no existe.' });
        }


    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al actualizar el Cliente' });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}