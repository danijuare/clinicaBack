'use strict'

const db = require('../../configs/mariaDBConfigs');

const { validExtension } = require('../utils/validate');
const stream = require('stream');

//configuracion para las imagenes
const admin = require('../../configs/firebaseConfig');

//Funcion de prueba
exports.pruebaCategoria = async (req, res) => {
    res.status(200).send({ message: 'Controller Categoria is runing !!' });
}


//Función para obtener todas las categorias
exports.getCategorias = async (req, res, next) => {
    let connection
    try {
        //conexion a la base de datos await
        connection = await db.init();
        //consulta a realizar
        const query = 'SELECT * FROM categorias c where c.condicion = 1';
        //guardar y ejecutar
        const [rows] = await connection.execute(query);
        res.status(200).send({ message: 'Categorias Obtenidas Exitosamente ', data: rows });
        //await connection.end();
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Obtener las Categorias' });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

//Función para obtener todas las categorias
exports.getCategoriasAdmin = async (req, res, next) => {
    let connection
    try {
        //conexion a la base de datos await
        connection = await db.init();
        //consulta a realizar
        const query = 'SELECT * FROM categorias';
        //guardar y ejecutar
        const [rows] = await connection.execute(query);
        res.status(200).send({ message: 'Categorias Obtenidas Exitosamente ', data: rows });
        //await connection.end();
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Obtener las Categorias' });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

//Función para obtener una categoria
exports.getOneCategoria = async (req, res, next) => {
    let connection
    try {
        //conexion
        connection = await db.init();
        //id en ruta
        const idcategoria = req.params.id;
        //buscar
        const buscarCategoria = "SELECT * FROM categorias c WHERE c.idcategoria = ? and c.condicion = 1";
        const [existeCategoria] = await connection.execute(buscarCategoria, [idcategoria]);

        if (existeCategoria.length > 0) {
            res.status(200).send({ message: 'Categoría obtenida exitosamente', data: existeCategoria[0] });
        } else {
            res.status(404).send({ message: 'Categoría no encontrada o no existe' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Error al obtener la Categoría' });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

//Función para obtener los primeros 4 categorias
exports.getFourCategorias = async (req, res, next) => {
    let connection
    try {
        //conexion
        connection = await db.init();
        const query = "SELECT * FROM categorias c where c.condicion = 1 LIMIT 4";
        const [rows] = await connection.execute(query);
        res.status(200).send({ message: 'Categorías Obtenidos Exitosamente', data: rows });
        //await connection.end();
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Error al obtener los primeros 4 Categorías.' });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

//Función para agregar una nueva categoria
exports.addCategoria = async (req, res) => {
    let connection
    try {
        // conexion a la base de datos
        connection = await db.init();
        // datos a enviar
        const { nombre, descripcion } = req.body;
        const condicion = 1;

        // query para verificar si la categoria ya existe
        const queryVerificarCategoria = `SELECT * FROM categorias WHERE nombre = ?`;
        const [rows] = await connection.execute(queryVerificarCategoria, [nombre]);

        // categoria existe
        if (rows.length > 0) {
            res.status(400).send({ message: 'Nombre de la Categoría ya existe, ingresar otro nombre.' });
            await connection.end();
            return;
        }

        // query para el insert
        const queryCategoria = `INSERT INTO categorias(nombre, descripcion, condicion)
                                VALUES (?, ?, ?)`;
        // valores para la consulta
        const valuesCategoria = [nombre, descripcion, condicion];
        // ejecutar query de inserción
        const [resultInsert] = await connection.execute(queryCategoria, valuesCategoria);
        // obtener el id de la categoría insertada
        const idCategoriaInsertada = resultInsert.insertId;

        // query para obtener la categoría insertada
        const queryObtenerCategoria = `SELECT * FROM categorias WHERE idcategoria = ?`;
        const [rowsInsertada] = await connection.execute(queryObtenerCategoria, [idCategoriaInsertada]);

        // Verificar si se encontró la categoría
        if (rowsInsertada.length > 0) {
            res.status(200).send({ message: 'Categoria Agregada Exitosamente', data: rowsInsertada[0] });
        } else {
            res.status(404).send({ message: 'Error al agregar categoria' });
        }

        //await connection.end();
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Agregar la Categoria', error: err });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}

//Funcion para actualizar una categoria existente
exports.updateCategoria = async (req, res) => {
    let connection
    try {
        //conexion a la base de datos
        connection = await db.init();
        //datos enviar en el body
        const { nombre, descripcion, condicion } = req.body;
        //ID en la ruta
        const idcategoria = req.params.id;

        //validar si la categoria existe
        const buscarCategoria = "SELECT * FROM categorias WHERE idcategoria = ?";
        const [categoriaExiste] = await connection.execute(buscarCategoria, [idcategoria]);

        if (categoriaExiste.length > 0) {
            const updateCategoria = "UPDATE categorias SET nombre = ?,descripcion = ?,condicion = ? WHERE idcategoria = ?";
            const valuesUpdate = [nombre, descripcion, condicion, idcategoria];
            await connection.execute(updateCategoria, valuesUpdate);

            //devolver la categoria actualizada
            const alreadeUpdate = "SELECT * FROM categorias WHERE idcategoria = ?";
            const [mostrarUpdate] = await connection.execute(alreadeUpdate, [idcategoria]);
            res.status(200).send({ message: 'Categoria actualizada exitosamente', data: mostrarUpdate[0] });

        } else {
            res.status(404).send({ message: 'Categoria no encontrada o no existe.' });
        }


    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al actualizar la Categoria' });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}


//Funcion para eliminar una categoria existente
exports.deleteCategoria = async (req, res) => {
    let connection
    try {
        //conexion a la bd
        connection = await db.init();
        //dato enviar en ruta
        const idcategoria = req.params.id;
        //buscar si existe la categoria
        const buscarCategoria = "SELECT * FROM categorias WHERE idcategoria = ?";
        const [categoriaEncontrada] = await connection.execute(buscarCategoria, [idcategoria]);

        if (categoriaEncontrada.length > 0) {
            //antes de borrar la categoria validar si esta amarrada a un articulo, entonces no se podra eliminar
            const categoriaInArticulos = "SELECT * FROM articulos WHERE idcategoria = ?";
            const [categoriaInArticulosEncontrados] = await connection.execute(categoriaInArticulos, [idcategoria]);

            if (categoriaInArticulosEncontrados.length > 0) {
                //console.log(categoriaInArticulosEncontrados);
                //no eliminar la categoria
                res.status(400).send({ message: 'La categoría no puede ser eliminada porque está asociada a uno o más artículos.' });
            } else {
                //eliminar la categoria
                const deleteCategoria = "DELETE FROM categorias WHERE idcategoria = ?";
                await connection.execute(deleteCategoria, [idcategoria]);
                res.status(200).send({ message: 'Categoría eliminada exitosamente.', data: categoriaEncontrada[0] })
            }
        } else {
            res.status(404).send({ message: 'Categoria no encontrada o no existe.' });
        }

        //await connection.end();
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al eliminar la Categoria' });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
}
