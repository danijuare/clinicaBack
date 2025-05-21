'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secretKey = 'secretKeyjwt';

//conexion a la base de datos
const db = require('../../configs/mariaDBConfigs');

//Función de prueba
exports.test = async (req, res) => {
    res.status(200).send({ message: 'Controller User is runing!!' });
}


//Función para obtener todos los usuarios
exports.getUsuarios = async (req, res) => {
    let connection;
    try {
        //conexion a la base de datos
        connection = await db.init();
        //consulta a realizar
        let query = `SELECT * FROM usuarios`;
        //guardar y ejecutar la consulta
        const [rows] = await connection.execute(query);
        res.status(200).send({ message: 'usuarios Obtenidos Exitosamente ', data: rows });
        await connection.end();

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Obtener los usuarios ', error: err });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}


//Funcion para obtener un user por el ID
exports.getUser = async (req, res) => {
    let connetion
    try {
        //conexion a la bd
        connetion = await db.init();
        //id
        const userID = req.params.id;
        //ejecutar
        const buscar = "SELECT * FROM usuarios WHERE idusuario = ?";
        const [exisuser] = await connetion.execute(buscar, [userID]);

        if (exisuser.length > 0) {
            res.status(200).send({ message: 'Usuario obtenido exitosamente ', data: exisuser[0] });
        } else {
            res.status(404).send({ message: 'Usuario no encontrado o no existe' });
        }
        //await connetion.end();
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al obtener el Usuario' });
    } finally {
        if (connetion) {
            await connetion.end();
        }
    }
}


//Función para agregar nuevo hotel
exports.addUser = async (req, res) => {
    let connection
    try {
        // conexion a la base de datos
        connection = await db.init();
        // datos a enviar
        const { nombre,email,password,rol} = req.body;

        // query para verificar si la hotel ya existe
        const queryVerificar = `SELECT * FROM usuarios WHERE nombre = ?`;
        const [rows] = await connection.execute(queryVerificar, [nombre]);

        // hotel existe
        if (rows.length > 0) {
            res.status(400).send({ message: 'Nombre de Usuario ya existe, ingresar otro nombre.' });
            await connection.end();
            return;
        }

        // query para el insert
        const queryInsert = `INSERT INTO usuarios(nombre,email,password,rol)
                                VALUES (?, ?, ?,?)`;
        // valores para la consulta
        const values = [nombre,email,password,rol];
        // ejecutar query de inserción
        const [resultInsert] = await connection.execute(queryInsert, values);
        // obtener el id de usuario insertada
        const idInsertada = resultInsert.insertId;

        // query para obtener la hotel insertada
        const queryObtener = `SELECT * FROM usuarios WHERE idusuario = ?`;
        const [rowsInsertada] = await connection.execute(queryObtener, [idInsertada]);

        // Verificar si se encontró la categoría
        if (rowsInsertada.length > 0) {
            res.status(200).send({ message: 'Usuario Agregada Exitosamente', data: rowsInsertada[0] });
        } else {
            res.status(404).send({ message: 'Error al agregar Usuario' });
        }

        //await connection.end();
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Agregar el Usuario', error: err });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

//Funcion para actualizar un hotel existente
exports.updateUser = async (req, res) => {
    let connection
    try {
        //conexion a la base de datos
        connection = await db.init();
        //datos enviar en el body
        const { nombre,email,password,rol} = req.body;
        //ID en la ruta
        const idusuario = req.params.id;

        //validar si el Usuario existe
        const buscarHotel = "SELECT * FROM usuarios WHERE idusuario = ?";
        const [existe] = await connection.execute(buscarHotel, [idusuario]);

        if (existe.length > 0) {
            const update = "UPDATE usuarios SET nombre=?,email=?,password=?,rol=? WHERE idusuario = ?";
            const valuesUpdate = [nombre,email,password,rol, idusuario];
            await connection.execute(update, valuesUpdate);

            //devolver Usuario actualizada
            const alreadeUpdate = "SELECT * FROM usuarios WHERE idusuario = ?";
            const [mostrarUpdate] = await connection.execute(alreadeUpdate, [idusuario]);
            res.status(200).send({ message: 'Usuario actualizada exitosamente', data: mostrarUpdate[0] });

        } else {
            res.status(404).send({ message: 'Usuario no encontrada o no existe.' });
        }


    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al actualizar la Usuario' });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

exports.login = async (req, res) => {
    let connection;
    try {
        connection = await db.init();
        const { nombre, clave } = req.body;
        const query = `SELECT * FROM usuarios WHERE nombre = ?`;
        const [rows] = await connection.execute(query, [nombre]);

        if (rows.length === 0) {
            return res.status(401).send({ message: 'Credenciales incorrectas' });
        }

        const user = rows[0];

        if (user.clave !== clave) {
            return res.status(401).send({ message: 'Credenciales incorrectas' });
        }

        // Crear token
        const payload = {
            id: user.idusuario,
            nombre: user.nombre,
            login: user.login,
            iat: moment().unix(),
            exp: moment().add(1, 'day').unix()
        };
        const token = jwt.encode(payload, secretKey);

        res.status(200).send({
            message: 'Inicio de sesión exitoso',
            token: token,
            data: {
                idusuario: user.idusuario,
                nombre: user.nombre,
                login: user.login,
                condicion: user.condicion
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Iniciar sesión' });
    }
}