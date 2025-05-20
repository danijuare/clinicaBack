'use strict'

//conexion a la base de datos
const db = require('../../configs/mariaDBConfigs');
//configuracion para las imagenes
const admin = require('../../configs/firebaseConfig');
//Connect Multiparty Upload Image//
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({ uploadDir: './uploads/servicios' });
const fs = require('fs');
const path = require('path');

//Función de prueba
exports.test = async (req, res) => {
    res.status(200).send({ message: 'Controller Servicios is runing!!' });
}


//Función para obtener todos los servicios
exports.getServicios = async (req, res) => {
    let connection;
    try {
        //conexion a la base de datos
        connection = await db.init();
        //consulta a realizar
        let query = `SELECT * FROM servicios`;
        //guardar y ejecutar la consulta
        const [rows] = await connection.execute(query);
        res.status(200).send({ message: 'Servicios Obtenidos Exitosamente ', data: rows });
        await connection.end();

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Obtener los Servicios ', error: err });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

//Funcion para obtener un servicio por el ID
exports.getServicio = async (req, res) => {
    let connetion
    try {
        //conexion a la bd
        connetion = await db.init();
        //id
        const servicioID = req.params.id;
        //ejecutar
        const buscar = "SELECT * FROM servicios WHERE idservicios = ?";
        const [exis] = await connetion.execute(buscar, [servicioID]);

        if (exis.length > 0) {
            res.status(200).send({ message: 'Servicio obtenido exitosamente ', data: exis[0] });
        } else {
            res.status(404).send({ message: 'Servicio no encontrado o no existe' });
        }
        //await connetion.end();
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al obtener el Servicio' });
    } finally {
        if (connetion) {
            await connetion.end();
        }
    }
}


//Función para agregar nuevo servicio
exports.addServicio = async (req, res) => {
    let connection
    try {
        // conexion a la base de datos
        connection = await db.init();
        // datos a enviar
        const { servicio,descripcion,precio} = req.body;

        // query para verificar si la hotel ya existe
        const queryVerificar = `SELECT * FROM servicios WHERE servicio = ?`;
        const [rows] = await connection.execute(queryVerificar, [servicio]);

        // hotel existe
        if (rows.length > 0) {
            res.status(400).send({ message: 'Servicio ya existe, ingresar otro nuevo.' });
            await connection.end();
            return;
        }

        // query para el insert
        const queryInsert = `INSERT INTO servicios(servicio,descripcion,precio)
                                VALUES (?,?,?)`;
        // valores para la consulta
        const values = [servicio,descripcion,precio];
        // ejecutar query de inserción
        const [resultInsert] = await connection.execute(queryInsert, values);
        // obtener el id de la hotel insertada
        const idInsertada = resultInsert.insertId;

        // query para obtener la hotel insertada
        const queryObtener = `SELECT * FROM servicios WHERE idservicios = ?`;
        const [rowsInsertada] = await connection.execute(queryObtener, [idInsertada]);

        // Verificar si se encontró la categoría
        if (rowsInsertada.length > 0) {
            res.status(200).send({ message: 'Servicio Agregada Exitosamente', data: rowsInsertada[0] });
        } else {
            res.status(404).send({ message: 'Error al agregar Servicio' });
        }

        //await connection.end();
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Agregar el Servicio', error: err });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}


//Funcion para actualizar un servicio existente
exports.updateServicio = async (req, res) => {
    let connection
    try {
        //conexion a la base de datos
        connection = await db.init();
        //datos enviar en el body
        const { servicio,descripcion,precio} = req.body;
        //ID en la ruta
        const idservicios = req.params.id;

        //validar si el hotel existe
        const buscar = "SELECT * FROM servicios WHERE idservicios = ?";
        const [existe] = await connection.execute(buscar, [idservicios]);

        if (existe.length > 0) {
            const update = "UPDATE servicios SET servicio=?,descripcion=?,precio=? WHERE idservicios = ?";
            const valuesUpdate = [servicio,descripcion,precio, idservicios];
            await connection.execute(update, valuesUpdate);

            //devolver hotel actualizada
            const alreadeUpdate = "SELECT * FROM servicios WHERE idservicios = ?";
            const [mostrarUpdate] = await connection.execute(alreadeUpdate, [idservicios]);
            res.status(200).send({ message: 'Servicio actualizada exitosamente', data: mostrarUpdate[0] });

        } else {
            res.status(404).send({ message: 'Servicio no encontrada o no existe.' });
        }


    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al actualizar el Servicio' });
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
        const idservicios = req.params.id;
        const [existe] = await connection.query('SELECT * FROM servicios WHERE idservicios = ?', [idservicios]);
        if (existe.length > 0 && existe[0].imagen) {
            const file = bucket.file(`uploads/servicios/${existe[0].imagen}`);
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
        const remotePath = `uploads/servicios/${fileName}`;

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
                        const update = "UPDATE servicios SET imagen = ? WHERE idservicios = ?";
                        const values = [fileName, idservicios];
                        await connection.execute(update,values);
                        await connection.end();
                    } catch (error) {
                        console.error('Error al actualizar la imagen en la base de datos:', error);
                        return res.status(500).send({ err: error, message: 'Error al actualizar la imagen en la base de datos.' });
                    }
                    return res.status(200).send({ message: 'Imagen añadida con éxito al Servicio', imageUrl: url });
                });
        } catch (err) {
            console.error('Error al subir la imagen a Firebase:');
            return res.status(500).send({ err, message: 'Error al subir la imagen a Firebase' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al asignarle una imagen al Servicio.' });
    }finally {
        connection.destroy();
    }
}


//Funcion para obtener la imagen
exports.getImage = async (req, res) => {
    try {
        const fileName = req.params.fileName;
        const bucket = admin.storage().bucket();
        const file = bucket.file(`uploads/servicios/${fileName}`);
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
        res.status(500).send({ message: 'Error al obtener la Imagen del Servicio' });
    }
}