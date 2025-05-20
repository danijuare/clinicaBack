'use strict'

//conexion a la base de datos
const db = require('../../configs/mariaDBConfigs');
const PDFDocument = require('pdfkit-table');
const fs = require('fs');

//Función de prueba
exports.test = async (req, res) => {
    res.status(200).send({ message: 'Controller Factura is runing!!' });
}


//Función para obtener todos los cliente
exports.getFacturas = async (req, res) => {
    let connection;
    try {
        connection = await db.init();
        let query = `SELECT * FROM facturas`;
        const [rows] = await connection.execute(query);
        res.status(200).send({ message: 'facturas Obtenidos Exitosamente ', data: rows });
        await connection.end();

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Obtener los facturas ', error: err });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

//Funcion para obtener un cliente por el ID
exports.getFactura = async (req, res) => {
    let connetion
    try {
        //conexion a la bd
        connetion = await db.init();
        //id
        const idfactura = req.params.id;
        //ejecutar
        const buscar = "SELECT * FROM facturas  WHERE idfactura = ?";
        const [existe] = await connetion.execute(buscar, [idfactura]);

        if (existe.length > 0) {
            res.status(200).send({ message: 'factura obtenido exitosamente ', data: existe[0] });
        } else {
            res.status(404).send({ message: 'factura no encontrado o no existe' });
        }
        //await connetion.end();
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al obtener el factura' });
    } finally {
        if (connetion) {
            await connetion.end();
        }
    }
}

// Función para crear una nueva factura
exports.addFactura = async (req, res) => {
    let connection;
    try {
        // Conexión a la base de datos
        connection = await db.init();

        // Datos a enviar
        const { idreservacion, descripcion } = req.body;

        // 1. Obtener los detalles de la reservación
        const [reservacion] = await connection.execute(`
            SELECT idcliente, idhabitacion, estado FROM reservaciones 
            WHERE idreservaciones = ?
        `, [idreservacion]);

        if (reservacion.length === 0) {
            return res.status(404).send({ message: 'Reservación no encontrada.' });
        }

        const { idcliente, idhabitacion, estado } = reservacion[0];

        // Validar si la reservación ya ha sido facturada
        const [facturaExistente] = await connection.execute(`
            SELECT * FROM facturas 
            WHERE idreservaciones = ?
        `, [idreservacion]);

        if (facturaExistente.length > 0) {
            return res.status(400).send({ message: 'La reservación ya ha sido facturada.' });
        }

        // Validar si la reservación está cancelada
        if (estado === 'CANCELADO') {
            return res.status(400).send({ message: 'No se puede facturar una reservación cancelada.' });
        }

        // 2. Obtener el precio de la habitación
        const [habitacion] = await connection.execute(`
            SELECT precio FROM habitaciones 
            WHERE idhabitacion = ?
        `, [idhabitacion]);

        if (habitacion.length === 0) {
            return res.status(404).send({ message: 'Habitación no encontrada.' });
        }

        const precioHabitacion = habitacion[0].precio;

        // 3. Obtener los servicios asociados a la habitación
        const [serviciosDetalles] = await connection.execute(`
            SELECT s.precio 
            FROM detalle_habitaciones dh 
            JOIN servicios s ON dh.idservicios = s.idservicios 
            WHERE dh.idhabitacion = ?
            AND dh.idreservaciones = ?
        `, [idhabitacion,idreservacion]);

        // 4. Calcular subtotal y otros_servicios
        let otros_servicios = 0.00;

        // Calcular el total de los servicios
        serviciosDetalles.forEach(servicio => {
            otros_servicios += parseFloat(servicio.precio);
        });

        otros_servicios = parseFloat(otros_servicios.toFixed(2));

        // Calcular subtotal y total
        const subtotal = parseFloat(precioHabitacion).toFixed(2);
        const total = (parseFloat(subtotal) + parseFloat(otros_servicios)).toFixed(2);

        // 5. Crear la factura
        const [result] = await connection.execute(`
            INSERT INTO facturas (idreservaciones, total, subtotal, otros_servicios, descripcion, fecha_emision)
            VALUES (?, ?, ?, ?, ?, NOW())
        `, [idreservacion, total, subtotal, otros_servicios, descripcion]);

        // 6. Actualizar estado de la habitación a "DISPONIBLE"
        await connection.execute(`
            UPDATE habitaciones 
            SET estado = 'DISPONIBLE' 
            WHERE idhabitacion = ?
        `, [idhabitacion]);

        // 7. Actualizar estado de la reservación a "FINALIZADO"
        await connection.execute(`
            UPDATE reservaciones 
            SET estado = 'FINALIZADO' 
            WHERE idreservaciones = ?
        `, [idreservacion]);

        // 8. Eliminar los servicios de esa habitación después de crear la factura
        /*
        await connection.execute(`
            DELETE FROM detalle_habitaciones
            WHERE idhabitacion = ?
        `, [idhabitacion]);
        */
        res.status(201).send({ message: 'Factura creada con éxito', idfactura: result.insertId });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al crear la factura', error: err });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}


exports.generatePDFByFactura = async (req, res) => {
    let connection;
    try {
        connection = await db.init();
        const idVenta = req.params.id;
        const buscarVenta = `SELECT 
                    f.*, c.*, h.tipo AS tipo_habitacion,h.precio as precio_habitacion, ho.nombre AS nombre_hotel
                FROM facturas f
                INNER JOIN reservaciones r ON f.idreservaciones = r.idreservaciones
                INNER JOIN clientes c ON r.idcliente = c.idcliente
                INNER JOIN habitaciones h ON r.idhabitacion = h.idhabitacion
                INNER JOIN hoteles ho ON h.idhotel = ho.idhotel
                WHERE idfactura = ?`;

        const [ventaEncontrada] = await connection.execute(buscarVenta, [idVenta]);

        if (ventaEncontrada.length > 0) {
            const venta = ventaEncontrada[0];

            const detalleVenta = `SELECT 
                    d.*, s.servicio, s.precio
                FROM detalle_habitaciones d
                INNER JOIN servicios s ON d.idservicios = s.idservicios
                WHERE d.idreservaciones = ?`;

            const [existeDetalles] = await connection.execute(detalleVenta, [venta.idreservaciones]);

            const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

           // const logo = './uploads/logo/LOGO_Version_preferencial.png'; // Ruta al archivo del logo
            //doc.image(logo, 50, 50, { width: 100 });
            doc.text('Hotel | UMG', 50, 50, { align: 'center', fontSize: 14, bold: true });
            doc.text('Teléfono: +502 5821-6179', 50, 70, { align: 'center', fontSize: 12 });

            doc.moveDown(3);

            const fecha = new Date(venta.fecha_emision);
            const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });

            const totalFormateado = new Intl.NumberFormat('es-GT', {
                style: 'currency',
                currency: 'GTQ',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(venta.total);

            const table = {
                title: 'Detalles de tu Estancia',
                headers: [
                    'No. Factura', 'Cliente', 'Fecha', 'Total', 'Tipo de Habitación', 'Hotel', 'Precio Habitacion'
                ],
                rows: [
                    [
                        venta.idfactura,
                        `${venta.nombre} ${venta.apellido}`,
                        fechaFormateada,
                        totalFormateado,
                        venta.tipo_habitacion,
                        venta.nombre_hotel,
                        venta.precio_habitacion
                    ]
                ]
            };

            await doc.table(table);
            doc.moveDown(2);

            const detallesTable = {
                title: 'Detalles de los Servicios',
                headers: [
                    'ID Servicio', 'Servicio', 'Precio', 'Subtotal'
                ],
                rows: []
            };

            for (const detalle of existeDetalles) {
                const subtotalFormateado = new Intl.NumberFormat('es-GT', {
                    style: 'currency',
                    currency: 'GTQ',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(detalle.precio);

                detallesTable.rows.push([
                    detalle.idservicios,
                    detalle.servicio,
                    subtotalFormateado,
                    subtotalFormateado
                ]);
            }

            await doc.table(detallesTable);
            doc.text('Hotel UMG', 10, doc.page.height - 70, { align: 'center', fontSize: 12 });
            doc.text('Teléfono: +502 5821-6179', 10, doc.page.height - 50, { align: 'center', fontSize: 10 });
            doc.text('Dirección: Villa Nueva UMG', 10, doc.page.height - 40, { align: 'center', fontSize: 10 });
            const pdfFileName = `factura_${venta.idfactura}.pdf`;
            res.setHeader('Content-Disposition', `attachment; filename="${pdfFileName}"`);
            res.setHeader('Content-type', 'application/pdf');
            doc.pipe(res);
            doc.end();

        } else {
            res.status(500).send({ message: 'Factura no encontrada.' });
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
