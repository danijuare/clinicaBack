'use strict'

const db = require('../../configs/mariaDBConfigs');

const fs = require('fs');
const path = require('path');
//configuracion para las imagenes
const admin = require('../../configs/firebaseConfig');
const stream = require('stream');
//Función de prueba
exports.pruebaArticulos = async (req,res)=>{
    res.status(200).send({message: 'Controller Articulos is runing!!'});
}


//Función para obtener todos los articulos
exports.getArticulos = async (req,res)=>{
    let connection;
    try{
        //conexion a la base de datos
        connection = await db.init();
        //consulta a realizar
        let query = `
            SELECT a.idarticulo, a.ofertado, a.enportada, a.nombre, a.titulo, a.descripcion, a.precio_venta, a.stock, a.imagenes, a.condicion, a.codigo, a.idcategoria, categorias.nombre as nombre_categoria
            FROM articulos a
            JOIN categorias ON a.idcategoria = categorias.idcategoria
            WHERE a.condicion = 1
        `;
        //guardar y ejecutar la consulta
        const [rows] = await connection.execute(query);
        res.status(200).send({message: 'Articulos Obtenidos Exitosamente ', data: rows});
        await connection.end();

    }catch(err){
        console.error(err);
        res.status(500).send({message: 'Error al Obtener los Articulos ', error: err});
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

//Función para obtener todos los articulos
exports.getArticulosTope = async (req,res)=>{
    let connection;
    try{
        //conexion a la base de datos
        connection = await db.init();
        //consulta a realizar
        let query = `
            SELECT a.idarticulo, a.ofertado, a.enportada, a.nombre, a.titulo, a.descripcion, a.precio_venta, a.stock, a.imagenes, a.condicion, a.codigo, a.idcategoria, categorias.nombre as nombre_categoria
            FROM articulos a
            JOIN categorias ON a.idcategoria = categorias.idcategoria
            WHERE a.condicion = 1
            LIMIT 75
        `;
        //guardar y ejecutar la consulta
        const [rows] = await connection.execute(query);
        res.status(200).send({message: 'Articulos Obtenidos Exitosamente ', data: rows});
        await connection.end();

    }catch(err){
        console.error(err);
        res.status(500).send({message: 'Error al Obtener los Articulos ', error: err});
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

//Función para obtener todos los articulos
exports.getArticulosAdmin = async (req,res)=>{
    let connection;
    try{
        //conexion a la base de datos
        connection = await db.init();
        //consulta a realizar
        let query = `
            SELECT a.idarticulo, a.ofertado, a.enportada, a.nombre, a.titulo, a.descripcion, a.precio_venta, a.stock, a.imagenes, a.condicion, a.codigo, a.idcategoria, categorias.nombre as nombre_categoria
            FROM articulos a
            JOIN categorias ON a.idcategoria = categorias.idcategoria
        `;
        //guardar y ejecutar la consulta
        const [rows] = await connection.execute(query);
        res.status(200).send({message: 'Articulos Obtenidos Exitosamente ', data: rows});
        await connection.end();

    }catch(err){
        console.error(err);
        res.status(500).send({message: 'Error al Obtener los Articulos ', error: err});
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

//Funcion para obtener un articulo por el ID
exports.getArticulo = async (req,res)=>{
    let connetion
    try{
        //conexion a la bd
        connetion = await db.init();
        //id
        const articuloID = req.params.id;
        //ejecutar
        const buscarArticulo = "SELECT * FROM articulos a WHERE a.idarticulo = ? and a.condicion = 1";
        const [existeArticulo] = await connetion.execute(buscarArticulo, [articuloID]);

        if(existeArticulo.length > 0){
            const buscarFotos = "SELECT * FROM imagenes_articulo WHERE idarticulo = ?";
            const [images] = await connetion.execute(buscarFotos,[articuloID]);
            res.status(200).send({message: 'Articulo obtenido exitosamente ', data:existeArticulo[0], fotos:images});
        }else{
            res.status(404).send({message: 'Articulo no encontrado o no existe'});
        }
        //await connetion.end();
    }catch(err){
        console.error(err);
        res.status(500).send({message: 'Error al obtener el Articulo'});
    }finally {
        if (connetion) {
            await connetion.end();
        }
    }
}

//Funcion para obtener un articulo por el ID
exports.getArticuloAdmin = async (req,res)=>{
    let connetion
    try{
        //conexion a la bd
        connetion = await db.init();
        //id
        const articuloID = req.params.id;
        //ejecutar
        const buscarArticulo = "SELECT * FROM articulos a WHERE a.idarticulo = ?";
        const [existeArticulo] = await connetion.execute(buscarArticulo, [articuloID]);

        if(existeArticulo.length > 0){
            const buscarFotos = "SELECT * FROM imagenes_articulo WHERE idarticulo = ?";
            const [images] = await connetion.execute(buscarFotos,[articuloID]);
            res.status(200).send({message: 'Articulo obtenido exitosamente ', data:existeArticulo[0], fotos:images});
        }else{
            res.status(404).send({message: 'Articulo no encontrado o no existe'});
        }
        //await connetion.end();
    }catch(err){
        console.error(err);
        res.status(500).send({message: 'Error al obtener el Articulo'});
    }finally {
        if (connetion) {
            await connetion.end();
        }
    }
}

//Función para contar cuantos articulos existen
exports.quantityArticulos = async (req,res)=>{
    let connection
    try{
        //coneccion a bd
        connection = await db.init();

        const countQuery = "SELECT COUNT(*) as totalArticulos FROM articulos";
        const [countResult] = await connection.execute(countQuery);
        res.status(200).send({ message: 'Cantidad de Artículos', totalArticulos: countResult[0].totalArticulos });

        //await connection.end();
    }catch(err){
        console.log(err);
        res.status(500).send({message: 'Error al contar los Artículos'});
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

//Función para filtrar los articulos por categoría
exports.filterArticulosByCategoria = async (req,res)=>{
    let connection
    try{
        //conexion
        connection = await db.init();
        const idCategoria = req.params.id;
        //console.log("idCategoria ",idCategoria)

        const buscarArticulos = "SELECT * FROM articulos WHERE idcategoria = ? and condicion = 1";
        const [articulos] = await connection.execute(buscarArticulos, [idCategoria]);
        //console.log("articulos ",articulos)
        
        res.status(200).send({message: 'Artículos filtrados por categoría',data: articulos});

        //await connection.end();
    }catch(err){
        console.log(err);
        res.status(500).sen({message: 'Error al filtrar los Artículos.'});
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

//Función para obtener los primeros 4 articulos
exports.getFourArticulos = async (req,res)=>{
    let connection
    try{
        //conexion
        connection = await db.init();
        const query = "SELECT * FROM articulos a where a.condicion = 1 LIMIT 4 ";
        const [rows] = await connection.execute(query);
        res.status(200).send({message: 'Artículos Obtenidos Exitosamente', data: rows});
        //await connection.end();
    }catch(err){
        console.log(err);
        res.status(500).send({message: 'Error al obtener los primeros 4 Artículos.'});
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

//Función para obtener los ultimos 4 articulos
exports.getLastFourArticulos = async (req, res) => {
    let connection
    try {
        connection = await db.init();
        const query = "SELECT * FROM articulos where condicion = 1 ORDER BY idarticulo DESC LIMIT 4";
        const [rows] = await connection.execute(query);
        res.status(200).send({ message: 'Últimos 4 Artículos Obtenidos Exitosamente', data: rows });
        //await connection.end();
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Error al obtener los últimos 4 Artículos.' });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

//Funcion para obtener los 4 de en medio de la tabla
exports.getMiddleFourArticulos = async (req, res) => {
    let connection
    try{
        connection = await db.init();

        // Obtén el total de registros
        const [totalRows] = await connection.execute("SELECT COUNT(*) AS total_registros FROM articulos");
        const totalRegistros = totalRows[0].total_registros;

        // Calcula el punto medio
        const puntoMedio = Math.floor(totalRegistros / 2);

        // Selecciona los 4 registros de en medio
        const query = `
            SELECT * FROM articulos
            ORDER BY idarticulo ASC
            LIMIT ${puntoMedio - 2}, 4
        `;
        const [rows] = await connection.execute(query);

        res.status(200).send({ message: '4 Artículos de en medio Obtenidos Exitosamente', data: rows });
        //await connection.end();
    }catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Error al obtener los 4 Artículos de en medio.' });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

//Funcion para agregar un articulo
exports.addArticulo = async (req, res) => {
    let connection
    try {
        // conexion a la base de datos
        connection = await db.init();
        // datos a insertar en la tabla de artículos
        const { nombre,titulo, descripcion, precio_venta, stock, codigo, idcategoria } = req.body;
        const condicion = 1;
        const ofertado = 0;
        const enportada = 0;
        //verificar si el articulo ya existe
        const alreadyArticulo = "SELECT * FROM articulos WHERE nombre = ?";
        const [rowsAlreadyArticulo] = await connection.execute(alreadyArticulo, [nombre]);
        if(rowsAlreadyArticulo.length > 0){
            res.status(400).send({message: "El Articulo ya existe, ingrese uno nuevo", nombre});
        }else{
            // consulta para buscar la categoria
            const queryBuscarCategoria = 'SELECT * FROM categorias WHERE idcategoria = ?';
            const valueBuscarCategoria = [idcategoria];
            const [rows] = await connection.execute(queryBuscarCategoria, valueBuscarCategoria);

            if (rows.length > 0) {
                const imagenes = "";
                //console.log("El ID de la categoría sí existe");
                // Lógica para realizar el INSERT en la tabla de artículos
                const queryInsertArticulo = `INSERT INTO articulos (ofertado,enportada,nombre,titulo, descripcion, precio_venta, stock, imagenes, condicion, codigo, idcategoria) VALUES (?, ?, ?,?, ?, ?, ?, ?, ?,?,?)`;
                const valuesInsertArticulo = [ofertado,enportada, nombre,titulo, descripcion, precio_venta, stock, imagenes, condicion, codigo, idcategoria];
                //guardar y obtener el insert 
                const [resultInsert] = await connection.execute(queryInsertArticulo, valuesInsertArticulo);
                const idArticuloIngresado = resultInsert.insertId;

                // Realizar 4 inserciones en la tabla imagenes_articulo
                for (let i = 0; i < 4; i++) {
                    const queryInsertImagen = `INSERT INTO imagenes_articulo (idarticulo, imagen) VALUES (?, ?)`;
                    const valuesInsertImagen = [idArticuloIngresado, '']; // Insertar un campo vacío, puedes ajustar esto según tus necesidades
                    await connection.execute(queryInsertImagen, valuesInsertImagen);
                }
                const queryBuscarArticulo = "SELECT * FROM articulos WHERE idarticulo  = ?";
                const [rowsArticulo] = await connection.execute(queryBuscarArticulo, [idArticuloIngresado]);

                res.status(200).send({ message: 'Artículo agregado con éxito ', data: rowsArticulo[0]});
            } else {
                //console.log("El ID de la categoría ingresada no existe");
                res.status(404).send({ message: 'ID de Categoría no encontrada' });
            }
        }
        //await connection.end();
    }catch(err){
        console.error(err);
        res.status(500).send({ message: 'Error al Agregar el Artículo', error: err });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
};


//Funcion para actualizar un articulo existente solo para admin
exports.updateArticulo = async (req,res) =>{
    let connection
    try{
        //conexion a la base de datos
        connection = await db.init();
        //datos a enviar en el body
        const {ofertado,enportada,nombre,titulo,descripcion,precio_venta,stock,imagenes,condicion,codigo,idcategoria} = req.body;
        //en la ruta
        const idarticulo = req.params.id;

        //validar si el articulo existe
        const articuloBuscar = "SELECT * FROM articulos WHERE idarticulo = ?";
        const [existeArticulo] = await connection.execute(articuloBuscar, [idarticulo]);

        if(existeArticulo.length > 0){
            //articulo existe actulizar
            //console.log("existeArticulo ",existeArticulo);
            //verificar si la categoris existe
            const categoriaBuscar = "SELECT * FROM categorias WHERE idcategoria = ?";
            const [existeCategoria] = await connection.execute(categoriaBuscar, [idcategoria]);

            if(existeCategoria.length > 0){
                //actualizar el articulo
                //console.log("categoria exuste ", existeCategoria);
                const updateArticulo = "UPDATE articulos SET ofertado=?,enportada=?,nombre=?,titulo=?,descripcion=?,precio_venta=?,stock=?,imagenes=?,condicion=?,codigo=?,idcategoria=? WHERE idarticulo=?";
                const valuesUpdate = [ofertado,enportada,nombre,titulo,descripcion,precio_venta,stock,imagenes,condicion,codigo,idcategoria,idarticulo];
                await connection.execute(updateArticulo,valuesUpdate);
                //articulo actualizaco
                const articuloUpdated = "SELECT * FROM articulos WHERE idarticulo = ?";
                const [mostrarActualizacion] = await connection.execute(articuloUpdated,[idarticulo]);
                res.status(200).send({message: 'Articulo Actualizado Exitosamente ', data: mostrarActualizacion[0]});
            }else{
                res.status(404).send({message: 'La Categoria No Existe'});
            }

        }else{
            res.status(404).send({message: 'Articulo No Encontrado o No Existe'});
        }

        
        //await connection.end();
    }catch(err){
        console.error(err);
        res.status(500).send({message: 'Error al Actualizar el Articulo'});
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

//Funcion par eliminar un articulo existente
exports.deleteArticulo = async (req,res)=>{
    let connection
    try{
        //conexion a base de datos
        connection = await db.init();
        //eliminar por ID
        const articuloID = req.params.id;
        //console.log(articuloID);
        //verificar si el usuario tiene permiso para hacer el delete (only Admin)

        //verificar si el ID del articulo existe
        const buscarArticulo = "SELECT * FROM articulos WHERE idarticulo = ?";
        const [articuloEncontrado] = await connection.execute(buscarArticulo, [articuloID]);
        //console.log(articuloEncontrado);
        if(articuloEncontrado.length > 0){
            //verificar si el articulo esta en una detalle_venta
            const queryArticuloBuscarDetalleVenta = "SELECT idarticulo FROM detalle_venta WHERE idarticulo = ?";
            const [articuloEncontradoDetalleVenta] = await connection.execute(queryArticuloBuscarDetalleVenta, [articuloID]);
            //console.log(articuloEncontradoDetalleVenta);
            if (articuloEncontradoDetalleVenta.length > 0) {
                res.status(400).send({ message: 'El artículo no se puede eliminar porque está en ventas.' });
            }else{
                //primero eliminar el articulo de la tabla de imagenes_articulo
                const deleteImagenes = "DELETE FROM imagenes_articulo WHERE idarticulo = ?";
                await connection.execute(deleteImagenes,[articuloID]);
                //segundo eliminar el articulo
                const deleteArticulo = "DELETE FROM articulos WHERE idarticulo = ?";
                const [articuloDeleted] = await connection.execute(deleteArticulo, [articuloID]);

                if(articuloDeleted){
                    //console.log(articuloDeleted);
                    res.status(200).send({message: 'Articulo Eliminado Exitosamente', data: articuloEncontrado[0]});
                }
            }

        }else{
            res.status(404).send({message: 'El Articulo No Existe'});
        }
        //await connection.end();
    }catch(err){
        console.error(err);
        res.status(500).send({message: 'Error al Eliminar el Articulo'});
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

//Agregar una imagen a un articulo
const bucket = admin.storage().bucket();
exports.addImageArticulo = async (req, res) => {
    let connection
    try {
        // Conexión a la base de datos
        connection = await db.init();
        // ID de la categoría a buscar en la ruta
        const articuloID = req.params.id;

        // Ruta donde se almacenarán las imágenes
        //let pathFile = './uploads/articulos/';

        // Buscar la articulo existente en la base de datos
        const [articuloExistente] = await connection.query('SELECT * FROM articulos WHERE idarticulo = ?', [articuloID]);
        //console.log(articuloExistente);
        if (articuloExistente.length > 0 && articuloExistente[0].imagenes) {
            const file = bucket.file(`uploads/articulos/${articuloExistente[0].imagenes}`);
            await file.delete().catch((error) => {
                console.log("Error al eliminar la imagen existente 1:");
            });
            await connection.end();
        }
        if (!req.files.imagenes || !req.files.imagenes.type) {
            //console.log("req.files.imagenes ",req.files.imagenes);
            //console.log("req.files.imagenes.type ",req.files.imagenes.type);
            return res.status(400).send({ message: 'No se envió una imagen' });
        }
        const filePath1 = req.files.imagenes.path;
        const fileSplit = filePath1.split('\\');
        const fileName1 = fileSplit[2];
        const image = req.files.imagenes;
        const fileName = image.name;
        const remotePath = `uploads/articulos/${fileName}`;

        //ruta temporal
        const readStream = fs.createReadStream(image.path);
        try {
            const fileUpload = bucket.file(remotePath);
            const writeStream = fileUpload.createWriteStream({
                metadata: {
                    contentType: image.type,
                },
            });

            readStream.pipe(writeStream)
                .on('error', (error) => {
                    console.error('Error al subir la imagen a Firebase:', error);
                    return res.status(500).send({ err: error, message: 'Error al subir la imagen a Firebase.' });
                })
                .on('finish', async () => {
                    //updata name en base de datos
                    connection = await db.init();
                    const url = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
                    await connection.execute('UPDATE articulos SET imagenes = ? WHERE idarticulo  = ?', [fileName, articuloID]);
                    await connection.end();
                    return res.status(200).send({ message: 'Imagen añadida con éxito al Artículo.', imageUrl: url });
                });
        } catch (err) {
            console.error('Error al subir la imagen a Firebase:');
            return res.status(500).send({ err, message: 'Error al subir la imagen a Firebase' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al asignarle una imagen al Artículo.' });
    }finally {
        connection.destroy();
    }
}

//Función para agregar mas imagenes a un articulo existente
exports.addMoreImagenesArticulo = async (req,res)=>{
    let connection;
    try{
        // Conexión a la base de datos
        connection = await db.init();
        // ID de la categoría a buscar en la ruta
        const articuloID = req.params.id;
        //id de tabla de imagenes_articulo
        const imagenID = req.params.imagenID;
        // Buscar la articulo existente en la base de datos
        const [articuloExistente] = await connection.query('SELECT * FROM articulos WHERE idarticulo = ?', [articuloID]);
        //console.log("articuloExistente ",articuloExistente);
        //console.log("articuloID ",articuloID);
        //console.log("imagenID ",imagenID);
        if(articuloExistente.length > 0 ){
            const [articuloExistente2] = await connection.query('SELECT * FROM imagenes_articulo WHERE idimagen = ?', [imagenID]);
            if(articuloExistente2.length > 0 && articuloExistente2[0].imagen){
                const file = bucket.file(`uploads/articulos/${articuloExistente2[0].imagen}`);
                await file.delete().catch((error) => {
                    console.log("Error al eliminar la imagen existente 1:");
                });
                await connection.end();
            }
            //res.status(200).send({message: 'Si', data:articuloExistente[0]});
            if (!req.files.imagen || !req.files.imagen.type) {
                return res.status(400).send({ message: 'No se envió una imagen' });
            }
            const image = req.files.imagen;
            const fileName = image.name;
            const remotePath = `uploads/articulos/${fileName}`;
            //ruta temporal
            const readStream = fs.createReadStream(image.path);
            try {
                const fileUpload = bucket.file(remotePath);
                const writeStream = fileUpload.createWriteStream({
                    metadata: {
                        contentType: image.type,
                    },
                });
                readStream.pipe(writeStream)
                    .on('error', (error) => {
                        console.error('Error al subir la imagen a Firebase:', error);
                        return res.status(500).send({ err: error, message: 'Error al subir la imagen a Firebase.' });
                    })
                    .on('finish', async () => {
                        //updata name en base de datos
                        connection = await db.init();
                        const url = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
                        //UPDATE articulos SET imagenes = ? WHERE idarticulo  = ?
                        await connection.execute('UPDATE imagenes_articulo SET imagen = ? WHERE idimagen = ?', [fileName,imagenID]);
                        await connection.end();
                        return res.status(200).send({ message: 'Más imagenes añadida con éxito al Artículo.', imageUrl: url });
                    });
            } catch (err) {
                console.error('Error al subir la imagen a Firebase:');
                return res.status(500).send({ err, message: 'Error al subir la imagen a Firebase' });
            }
        
        }else{
            res.status(404).send({message: 'Artículo no encontrado o no existe.'});
        }
            
    }catch(err){
        console.log(err);
        res.status(500).send({message: 'Error al agregar mas imagenes al articulo.'});
    }finally {
        connection.destroy();
    }
}

//Funcion para obtener la imagen
exports.getImageArticulo = async (req,res)=>{
    try{
        const fileName = req.params.fileName;
        const bucket = admin.storage().bucket();
        const file = bucket.file(`uploads/articulos/${fileName}`);
        const [exists] = await file.exists();
        console.log("exists ",exists);
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
    }catch(err){
        console.error(err);
        res.status(500).send({message: 'Error al obtener la Imagen del Artículo'});
    }
}

//Función para buscar articulos por el buscador
exports.searchArticulos = async (req,res)=>{
    let connection
    try{
        //conexion
        connection = await db.init();
        //buscar por coincidencias
        const {data} = req.body;
        
        const query = `SELECT * FROM articulos WHERE LOWER(nombre) LIKE LOWER(?) OR LOWER(descripcion) LIKE LOWER(?) OR LOWER(titulo) LIKE LOWER(?)`;
        const params = [`%${data}%`, `%${data}%`, `%${data}%`]; 

        const [rows] = await connection.execute(query, params);


        // Enviar los resultados de la búsqueda
        res.status(200).send({ message: 'Artículos encontrados', data: rows });


        //await connection.end();
    }catch(err){
        console.log(err);
        res.status(500).send({message: 'Error al buscar los Artículos.'});
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

//filtrar solo los ofertadps
exports.getOnlyOfertas = async (req,res)=>{
    let connection
    try{
        connection = await db.init();
        const buscar = "SELECT * FROM articulos WHERE enportada=1";
        const [existe] = await connection.execute(buscar);
        if(existe.length > 0){
            res.status(200).send({message: 'En portada obtenidos exitosamente', data:existe});
        }else{
            res.status(404).send({message: 'En portada no existen o no encontrados', });
        }
    }catch(err){
        console.log(err);
        res.status(500).send({message: 'Error al buscar los Artículos de En portada.'});
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}