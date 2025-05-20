'use strict'

//conexion a la base de datos
const db = require('../../configs/mariaDBConfigs');
const PDFDocument = require('pdfkit-table');

//Función de prueba
exports.test = async (req, res) => {
    res.status(200).send({ message: 'Controller Reservacion is runing!!' });
}

//Función para obtener todos los reservaciones
exports.getReservaciones = async (req, res) => {
    let connection;
    try {
        //conexion a la base de datos
        connection = await db.init();
        //consulta a realizar
        let query = `SELECT 
            r.*,
            h.numero_habitacion,
            c.nombre AS nombre_cliente,
            h.precio,
            COALESCE(SUM(s.precio), 0) AS total_servicios
        FROM 
            reservaciones r
        INNER JOIN 
            clientes c ON r.idcliente = c.idcliente
        INNER JOIN 
            habitaciones h ON r.idhabitacion = h.idhabitacion
        LEFT JOIN 
            detalle_habitaciones dh ON r.idhabitacion = dh.idhabitacion
        LEFT JOIN 
            servicios s ON dh.idservicios = s.idservicios AND r.idreservaciones = dh.idreservaciones 
        GROUP BY 
            r.idreservaciones, h.numero_habitacion, c.nombre, h.precio`;
        //guardar y ejecutar la consulta
        const [rows] = await connection.execute(query);
        res.status(200).send({ message: 'Reservaciones Obtenidos Exitosamente ', data: rows });
        await connection.end();

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Obtener las Reservaciones ', error: err });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

//Funcion para obtener una Reservacion por el ID
exports.getReservacion = async (req, res) => {
    let connetion
    try {
        //conexion a la bd
        connetion = await db.init();
        //id
        const reservacionid = req.params.id;
        //ejecutar
        const buscar = "SELECT * FROM reservaciones WHERE idreservaciones = ?";
        const [exis] = await connetion.execute(buscar, [reservacionid]);

        if (exis.length > 0) {
            res.status(200).send({ message: 'Reservacion obtenido exitosamente ', data: exis[0] });
        } else {
            res.status(404).send({ message: 'Reservacion no encontrado o no existe' });
        }
        //await connetion.end();
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al obtener el Reservacion' });
    } finally {
        if (connetion) {
            await connetion.end();
        }
    }
}

// Función para agregar nuevo hotel
exports.addReservacion = async (req, res) => {
    let connection;
    try {
        connection = await db.init();

        const { idcliente, idhabitacion, fecha_inicio, fecha_fin, estado } = req.body;

        const today = new Date();
        const startDate = new Date(fecha_inicio);
        const endDate = new Date(fecha_fin);
        // Validar fechas
        console.log("today ",today);
        console.log("startDate ",startDate);
        console.log("endDate ",endDate);
        /*
        if (startDate < today) {
            return res.status(400).send({ message: 'Debes de hacer la Reservación con más de 24hrs de anticipación.' });
        }
        */
        //fechas validas
        if (startDate >= endDate) {
            return res.status(400).send({ message: 'La fecha de inicio debe ser anterior a la fecha de fin.' });
        }

        /*
        //2 habitacion disponible de estado
        const [habitacionSi] = await connection.execute(`SELECT * FROM habitaciones where idhabitacion = ?`, [idhabitacion]);

        if (habitacionSi[0].estado == "NO DISPONIBLE") {
            return res.status(400).send({ message: 'La habitación no está disponible.' });
        }
            */

        //habitacion disponible en esas fechas
        const [reservas] = await connection.execute(`
            SELECT 
                r.*
            FROM 
                reservaciones r
            WHERE 
                r.idhabitacion = ? 
                AND (
                    (r.fecha_inicio < ? AND r.fecha_fin > ?) OR 
                    (r.fecha_inicio < ? AND r.fecha_fin > ?)
                )
        `, [idhabitacion, endDate, startDate, startDate, endDate]);

        if (reservas.length > 0) {
            return res.status(400).send({ message: 'La habitación ya está reservada en esas fechas.' });
        }

        //registrar reservacion
        const [result] = await connection.execute(`
            INSERT INTO reservaciones (idcliente, idhabitacion, fecha_inicio, fecha_fin, estado)
            VALUES (?, ?, ?, ?, ?)
        `, [idcliente, idhabitacion, fecha_inicio, fecha_fin, estado]);

        await connection.execute(`
            UPDATE habitaciones 
            SET estado = 'NO DISPONIBLE' 
            WHERE idhabitacion = ?
        `, [idhabitacion]);

        res.status(201).send({ message: 'Reservación agregada con éxito', idreservacion: result.insertId });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al agregar la reservación', error: err });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}


//Funcion para actualizar
exports.updateReservacion = async (req, res) => {
    let connection
    try {
        //conexion a la base de datos
        connection = await db.init();
        //datos enviar en el body
        const { idcliente, idhabitacion, fecha_inicio, fecha_fin, estado } = req.body;
        //ID en la ruta
        const idreservaciones = req.params.id;

        //validar si el hotel existe
        const buscar = "SELECT * FROM reservaciones WHERE idreservaciones = ?";
        const [existe] = await connection.execute(buscar, [idreservaciones]);

        if (existe.length > 0) {
            const buscar = "SELECT * FROM reservaciones WHERE idreservaciones = ?";
            const [existeRe] = await connection.execute(buscar, [idreservaciones]);
            const reservacion = existeRe[0];
            if (reservacion.estado === 'CANCELADO') {
                return res.status(400).send({ message: 'La reservación ya está cancelada, no se puede actualizar.' });
            }
            const update = "UPDATE reservaciones SET idcliente=?,idhabitacion=?,fecha_inicio=?,fecha_fin=?,estado=? WHERE idreservaciones = ?";
            const valuesUpdate = [idcliente, idhabitacion, fecha_inicio, fecha_fin, estado, idreservaciones];
            await connection.execute(update, valuesUpdate);

            //devolver hotel actualizada
            const alreadeUpdate = "SELECT * FROM reservaciones WHERE idreservaciones = ?";
            const [mostrarUpdate] = await connection.execute(alreadeUpdate, [idreservaciones]);
            res.status(200).send({ message: 'Reservacion actualizada exitosamente', data: mostrarUpdate[0] });

        } else {
            res.status(404).send({ message: 'Reservacion no encontrada o no existe.' });
        }


    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al actualizar la Reservacion' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Función para cancelar reservación
exports.cancelarReservacion = async (req, res) => {
    let connection;
    try {
        connection = await db.init();
        const idreservaciones = req.params.id;

        // Validar si la reservación existe
        const buscar = "SELECT * FROM reservaciones WHERE idreservaciones = ?";
        const [existe] = await connection.execute(buscar, [idreservaciones]);

        if (existe.length > 0) {
            const reservacion = existe[0];
            if (reservacion.estado === 'CANCELADO') {
                return res.status(400).send({ message: 'La reservación ya está cancelada.' });
            }

            const idhabitacion = existe[0].idhabitacion; 

            // Actualizar el estado de la reservación a CANCELADO
            const updateReservacion = "UPDATE reservaciones SET estado = 'CANCELADO' WHERE idreservaciones = ?";
            await connection.execute(updateReservacion, [idreservaciones]);

            // Actualizar el estado de la habitación a DISPONIBLE
            const updateHabitacion = "UPDATE habitaciones SET estado = 'DISPONIBLE' WHERE idhabitacion = ?";
            await connection.execute(updateHabitacion, [idhabitacion]);

            // Devolver respuesta exitosa
            res.status(200).send({ message: 'Reservación cancelada exitosamente' });
        } else {
            res.status(404).send({ message: 'Reservación no encontrada o no existe.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al cancelar la reservación' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

exports.generatePDFByReservacion = async (req, res) => {
    let connection;
    try {
        connection = await db.init();
        const idReservacion = req.params.id;

        const buscarReservacion = `SELECT 
                r.*,
                c.nombre AS nombre_cliente,
                h.tipo AS tipo_habitacion,
                h.precio AS precio_habitacion
            FROM reservaciones r
            INNER JOIN clientes c ON r.idcliente = c.idcliente
            INNER JOIN habitaciones h ON r.idhabitacion = h.idhabitacion
            WHERE r.idreservaciones = ?`;

        const [reservacionEncontrada] = await connection.execute(buscarReservacion, [idReservacion]);

        if (reservacionEncontrada.length > 0) {
            const reservacion = reservacionEncontrada[0];
            const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
            doc.text('Hotel | UMG', 50, 50, { align: 'center', fontSize: 14, bold: true });
            doc.text('Teléfono: +502 5821-6179', 50, 70, { align: 'center', fontSize: 12 });

            doc.moveDown(3);
            const fecha = new Date(reservacion.fecha_inicio);
            const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
            const fecha2 = new Date(reservacion.fecha_fin);
            const fechaFormateada2 = fecha2.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });

            const totalFormateado = new Intl.NumberFormat('es-GT', {
                style: 'currency',
                currency: 'GTQ',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(reservacion.total);
            const table = {
                title: 'Detalles de tu Reservación',
                headers: [
                    'ID Reservación', 'Cliente', 'Fecha Inicio', 'Fecha Fin', 'Estado','Habitacion','Precio Habitacion'
                ],
                rows: [
                    [
                        reservacion.idreservaciones,
                        reservacion.nombre_cliente,
                        fechaFormateada,
                        fechaFormateada2,
                        reservacion.estado,
                        reservacion.tipo_habitacion,
                        reservacion.precio_habitacion
                    ]
                ]
            };

            await doc.table(table);
            doc.moveDown(2);
            doc.text('Hotel UMG', 10, doc.page.height - 70, { align: 'center', fontSize: 12 });
            doc.text('Teléfono: +502 5821-6179', 10, doc.page.height - 50, { align: 'center', fontSize: 10 });
            doc.text('Dirección: Villa Nueva UMG', 10, doc.page.height - 40, { align: 'center', fontSize: 10 });
            const pdfFileName = `reservacion_${reservacion.idreservaciones}.pdf`;
            res.setHeader('Content-Disposition', `attachment; filename="${pdfFileName}"`);
            res.setHeader('Content-type', 'application/pdf');
            doc.pipe(res);
            doc.end();

        } else {
            res.status(404).send({ message: 'Reservación no encontrada.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al generar el PDF.' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};
