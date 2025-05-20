'use strict'

//conexion a la base de datos
const db = require('../../configs/mariaDBConfigs');
//configuracion para las imagenes
const admin = require('../../configs/firebaseConfig');
//Connect Multiparty Upload Image//
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({ uploadDir: './uploads/habitaciones' });
const fs = require('fs');
const path = require('path');

//Función de prueba
exports.test = async (req, res) => {
    res.status(200).send({ message: 'Controller Habitaciones is runing!!' });
}


//Función para obtener todos las habitaciones
exports.getHabitaciones = async (req, res) => {
    let connection;
    try {
        //conexion a la base de datos
        connection = await db.init();
        //consulta a realizar
        let query = `SELECT 
                h.*,
                ho.nombre AS nombre_hotel
            FROM habitaciones h
            INNER JOIN hoteles ho ON h.idhotel = ho.idhotel`;
        //guardar y ejecutar la consulta
        const [rows] = await connection.execute(query);
        res.status(200).send({ message: 'Habitaciones Obtenidos Exitosamente ', data: rows });
        await connection.end();

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Obtener las Habitaciones ', error: err });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}


//Funcion para obtener una habitacion por el ID
exports.getHabitacion = async (req, res) => {
    let connetion
    try {
        //conexion a la bd
        connetion = await db.init();
        //id
        const habitacionid = req.params.id;
        //ejecutar
        const buscar = `SELECT 
                h.*,
                ho.nombre AS nombre_hotel
            FROM habitaciones h
            INNER JOIN hoteles ho ON h.idhotel = ho.idhotel
            WHERE idhabitacion = ?`;
        const [exis] = await connetion.execute(buscar, [habitacionid]);

        if (exis.length > 0) {
            res.status(200).send({ message: 'Habitacion obtenido exitosamente ', data: exis[0] });
        } else {
            res.status(404).send({ message: 'Habitacion no encontrado o no existe' });
        }
        //await connetion.end();
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al obtener la Habitacion' });
    } finally {
        if (connetion) {
            await connetion.end();
        }
    }
}


//Función para agregar habitacion
exports.addHabitacion = async (req, res) => {
    let connection
    try {
        // conexion a la base de datos
        connection = await db.init();
        // datos a enviar
        const { idhotel,numero_habitacion,tipo,precio,estado,
            dimensiones,cantidad_camas,cantidad_banios,wifi,tv,aireacondicionado,vistas,capacidad} = req.body;

        // query para verificar si la hotel ya existe
        const queryVerificar = `SELECT * FROM habitaciones WHERE numero_habitacion = ?`;
        const [rows] = await connection.execute(queryVerificar, [numero_habitacion]);

        // hotel existe
        if (rows.length > 0) {
            res.status(400).send({ message: '# de Habitacion ya existe, ingresar otro número.' });
            await connection.end();
            return;
        }

        // query para el insert
        const queryInsert = `INSERT INTO habitaciones(idhotel,numero_habitacion,tipo,precio,estado,dimensiones,cantidad_camas,cantidad_banios,wifi,tv,aireacondicionado,vistas,capacidad)
                                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        // valores para la consulta
        const values = [idhotel,numero_habitacion,tipo,precio,estado,dimensiones,cantidad_camas,cantidad_banios,wifi,tv,
            aireacondicionado,vistas,capacidad];
        // ejecutar query de inserción
        const [resultInsert] = await connection.execute(queryInsert, values);
        // obtener el id de la hotel insertada
        const idInsertada = resultInsert.insertId;

        // query para obtener la Habitacion insertada
        const queryObtener = `SELECT * FROM habitaciones WHERE idhabitacion = ?`;
        const [rowsInsertada] = await connection.execute(queryObtener, [idInsertada]);

        // Verificar si se encontró la categoría
        if (rowsInsertada.length > 0) {
            res.status(200).send({ message: 'Habitacion Agregada Exitosamente', data: rowsInsertada[0] });
        } else {
            res.status(404).send({ message: 'Error al agregar Habitacion' });
        }

        //await connection.end();
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Agregar el Habitacion', error: err });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}


//Funcion para actualizar una habitacion existente
exports.updateHabitacion = async (req, res) => {
    let connection
    try {
        //conexion a la base de datos
        connection = await db.init();
        //datos enviar en el body
        const { idhotel,numero_habitacion,tipo,precio,estado,
            dimensiones,cantidad_camas,cantidad_banios,wifi,tv,aireacondicionado,vistas,capacidad} = req.body;
        //ID en la ruta
        const idhabitacion = req.params.id;

        //validar si el hotel existe
        const buscar = "SELECT * FROM habitaciones WHERE idhabitacion = ?";
        const [existe] = await connection.execute(buscar, [idhabitacion]);

        if (existe.length > 0) {
            const update = `
                UPDATE habitaciones 
                SET idhotel=?, numero_habitacion=?, tipo=?, precio=?, estado=?, dimensiones=?, 
                cantidad_camas=?, cantidad_banios=?, wifi=?, tv=?, aireacondicionado=?, vistas=?, capacidad=? 
                WHERE idhabitacion = ?`;

            const valuesUpdate = [
                idhotel, numero_habitacion, tipo, precio, estado, 
                dimensiones, cantidad_camas, cantidad_banios, wifi, tv, aireacondicionado, vistas, capacidad, 
                idhabitacion
            ];
            await connection.execute(update, valuesUpdate);

            //devolver hotel actualizada
            const alreadeUpdate = "SELECT * FROM habitaciones WHERE idhabitacion = ?";
            const [mostrarUpdate] = await connection.execute(alreadeUpdate, [idhabitacion]);
            res.status(200).send({ message: 'Habitacion actualizada exitosamente', data: mostrarUpdate[0] });

        } else {
            res.status(404).send({ message: 'Habitacion no encontrada o no existe.' });
        }


    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al actualizar la Habitacion' });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

//Agregar una imagen a una Hotel
const bucket = admin.storage().bucket();
exports.addImage = async (req, res) => {
    let connection
    try {
        connection = await db.init();
        const habitacionID = req.params.id;
        const [existente] = await connection.query('SELECT * FROM habitaciones WHERE idhabitacion = ?', [habitacionID]);
        if (existente.length > 0 && existente[0].imagen) {
            const file = bucket.file(`uploads/habitaciones/${existente[0].imagen}`);
            await file.delete().catch((error) => {
                console.log("Error al eliminar la imagen existente 1:");
            });
            await connection.end();
        }

        if (!req.files.imagen || !req.files.imagen.type) {
            return res.status(400).send({ message: 'No se envió una imagen' });
        }

        
        const filePath1 = req.files.imagen.path;
        const fileSplit = filePath1.split('\\');
        const fileName1 = fileSplit[2];
        const imagen = req.files.imagen;
        const fileName = imagen.name;
        const remotePath = `uploads/habitaciones/${fileName}`;

        //ruta temporal
        const readStream = fs.createReadStream(imagen.path);

        //subir imagen a firebase
        try {
            const fileUpload = bucket.file(remotePath);
            const writeStream = fileUpload.createWriteStream({
                metadata: {
                    contentType: imagen.type,
                },
            });

            readStream.pipe(writeStream)
                .on('error', (error) => {
                    console.error('Error al subir la imagen a Firebase:', error);
                    return res.status(500).send({ err: error, message: 'Error al subir la imagen a Firebase' });
                })
                .on('finish', async () => {
                    //updata name en base de datos
                    connection = await db.init();
                    const url = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
                    try {
                        const fileName = imagen.name;
                        //await connection.execute('UPDATE hoteles SET image = ? WHERE idhotel = ?', [fileName1, hotelID]);
                        const update = "UPDATE habitaciones SET imagen = ? WHERE idhabitacion = ?";
                        const values = [fileName, habitacionID];
                        await connection.execute(update,values);
                        await connection.end();
                    } catch (error) {
                        console.error('Error al actualizar la imagen en la base de datos:', error);
                        return res.status(500).send({ err: error, message: 'Error al actualizar la imagen en la base de datos.' });
                    }
                    return res.status(200).send({ message: 'Imagen añadida con éxito a la Habitacion', imageUrl: url });
                });
        } catch (err) {
            console.error('Error al subir la imagen a Firebase:');
            return res.status(500).send({ err, message: 'Error al subir la imagen a Firebase' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al asignarle una imagen a la Habitacion.' });
    }finally {
        connection.destroy();
    }
}


//Funcion para obtener la imagen
exports.getImage = async (req, res) => {
    try {
        const fileName = req.params.fileName;
        const bucket = admin.storage().bucket();
        const file = bucket.file(`uploads/habitaciones/${fileName}`);
        const [exists] = await file.exists();
        //console.log("exists ", exists);
        if (!exists) {
            return res.status(404).send({ message: 'Imagen no existente.' });
        }

        /*const readStream = file.createReadStream();
        res.set('Content-Type', 'image/jpeg'); 
        readStream.pipe(res);*/
        const fileExtension = fileName.split('.').pop();
        //let contentType = 'image/jpeg';
        let contentType
        switch (fileExtension) {
            case 'png':
                contentType = 'image/png';
                break;
            case 'gif':
                contentType = 'image/gif';
                break;
            case 'jpg':
                contentType = 'image/jpg';
            case 'jpeg':
                contentType = 'image/jpeg';
        }
        //leer archivo de firebase
        const readStream = file.createReadStream();
        //stream de la imagen como respuesta
        res.set('Content-Type', contentType);
        readStream.pipe(res);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al obtener la Imagen del Hotel' });
    }
}