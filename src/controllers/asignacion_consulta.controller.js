'use strict'

const db = require('../../configs/mariaDBConfigs');
//PARA REPORTES
const PDFDocument = require('pdfkit-table');

//Funcion de prueba
exports.prueba = async (req, res) => {
    res.status(200).send({ message: 'Controller Asignacion Consultas is runing !!' });
}

exports.getAsignaciones = async (req, res, next) => {
    let connection
    try {
        connection = await db.init();

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

        const [rows] = await connection.execute(query);
        res.status(200).send({ message: 'Asignaciones Obtenidas Exitosamente ', data: rows });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Obtener las Asignaciones' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

exports.getAsignacionesPendientes = async (req, res, next) => {
    let connection
    try {

        connection = await db.init();

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

        const [rows] = await connection.execute(query);
        res.status(200).send({ message: 'Asignaciones Pendientes Obtenidas Exitosamente ', data: rows });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Obtener las Asignaciones Pendientes' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

exports.addAsignacionConsulta = async (req, res) => {
    let connection;
    try {

        connection = await db.init();

        const {
            idtipo_consulta,
            descripcion,
            nombre_cliente,
            telefono_cliente,
            fecha_hora_creacion,
            fecha_hora_salida
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

        const insertedId = result.insertId;

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

exports.getAsignacionesPorVentanilla = async (req, res, next) => {
    let connection
    try {
        const { id } = req.params;

        connection = await db.init();

        const query = `SELECT 
            v.idventanillas,
            v.nombre AS nombre_ventanilla,
            tc.nombre AS tipo_consulta,
            ac.idasignacion_consulta,
            ac.nombre_cliente,
            ac.telefono_cliente,
            ac.descripcion AS motivo_consulta,
            ac.fecha_hora_creacion,
            ac.atendido,
            ac.revisado,
            ac.fecha_hora_salida
        FROM ventanillas v
        JOIN tipo_consulta tc ON v.idtipo_consulta = tc.idtipo_consulta
        JOIN asignacion_consulta ac ON ac.idtipo_consulta = tc.idtipo_consulta
        WHERE v.idventanillas = ?
        AND ac.revisado = 'NO'
        ORDER BY ac.fecha_hora_creacion ASC`;
        const [rows] = await connection.execute(query, [id]);
        res.status(200).send({ message: 'Asignaciones Por Ventanilla Obtenidas Exitosamente ', data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Obtener las Asignaciones Por Ventanilla' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

exports.getAsignacionesPorVentanillaRevisadas = async (req, res, next) => {
    let connection
    try {
        const { id } = req.params;

        connection = await db.init();

        const query = `SELECT 
            v.idventanillas,
            v.nombre AS nombre_ventanilla,
            tc.nombre AS tipo_consulta,
            ac.idasignacion_consulta,
            ac.nombre_cliente,
            ac.telefono_cliente,
            ac.descripcion AS motivo_consulta,
            ac.fecha_hora_creacion,
            ac.fecha_hora_salida,
            ac.atendido,
            ac.revisado,
            ac.fecha_hora_salida
        FROM ventanillas v
        JOIN tipo_consulta tc ON v.idtipo_consulta = tc.idtipo_consulta
        JOIN asignacion_consulta ac ON ac.idtipo_consulta = tc.idtipo_consulta
        WHERE v.idventanillas = ?
        AND ac.revisado = 'SI'
        ORDER BY ac.fecha_hora_creacion ASC`;

        const [rows] = await connection.execute(query, [id]);
        res.status(200).send({ message: 'Asignaciones Por Ventanilla Revisadas Obtenidas Exitosamente ', data: rows });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Obtener las Asignaciones Por Ventanilla Revisadas' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}



exports.getVentanillas = async (req, res, next) => {
    let connection
    try {

        connection = await db.init();

        const query = `SELECT v.*,t.* FROM ventanillas v
        INNER JOIN tipo_consulta t ON v.idtipo_consulta = t.idtipo_consulta
        WHERE v.condicion = 1 AND t.condicion = 1`;

        const [rows] = await connection.execute(query);
        res.status(200).send({ message: 'Ventanillas Obtenidas Exitosamente ', data: rows });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al Obtener las Ventanillas' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

exports.updateAtendido = async (req, res) => {
    let connection;
    try {
        connection = await db.init();
        const idasignacion_consulta = req.params.id;

        const query = `
            UPDATE asignacion_consulta
            SET atendido = 'SI', fecha_hora_salida = NOW()
            WHERE idasignacion_consulta = ?
        `;
        const [result] = await connection.execute(query, [idasignacion_consulta]);

        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Asignación no encontrada o ya actualizada' });
        }

        res.status(200).send({
            message: 'Asignación marcada como Atendida correctamente',
            id: idasignacion_consulta
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al actualizar la asignación', error: err });
    } finally {
        if (connection) await connection.end();
    }
};

exports.updateRevisado = async (req, res) => {
    let connection;
    try {
        connection = await db.init();
        const idasignacion_consulta = req.params.id;

        const query = `
            UPDATE asignacion_consulta
            SET revisado = 'SI', fecha_hora_salida = NOW()
            WHERE idasignacion_consulta = ?
        `;
        const [result] = await connection.execute(query, [idasignacion_consulta]);

        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Asignación no encontrada o ya actualizada' });
        }

        res.status(200).send({
            message: 'Asignación marcada como revisada correctamente',
            id: idasignacion_consulta
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al actualizar la asignación', error: err });
    } finally {
        if (connection) await connection.end();
    }
};


//REPORTE 1
exports.generatePDFConsultasAtendidas = async (req, res) => {
    let connection;
    try {
        connection = await db.init();

        const { fecha_inicio, fecha_fin } = req.body;

        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).send({ message: 'Debe proporcionar fecha_inicio y fecha_fin en el query string.' });
        }

        const consultaSQL = `
            SELECT
                a.idasignacion_consulta,
                a.fecha_hora_salida,
                a.nombre_cliente,
                a.telefono_cliente,
                a.atendido,
                a.revisado,
                t.nombre AS tipo_consulta_nombre
            FROM asignacion_consulta a
            INNER JOIN tipo_consulta t ON a.idtipo_consulta = t.idtipo_consulta
            WHERE a.atendido = 'SI' AND a.revisado = 'SI'
            AND DATE(a.fecha_hora_salida) BETWEEN ? AND ?
        `;

        const [resultados] = await connection.execute(consultaSQL, [fecha_inicio, fecha_fin]);

        if (resultados.length > 0) {
            const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

            doc.fontSize(16).text('Clínica | UMG', { align: 'center' });
            doc.fontSize(12).text('Teléfono: +502 5821-6179', { align: 'center' });
            doc.fontSize(14).text(`Consultas Atendidas y Revisadas del ${fecha_inicio} al ${fecha_fin}`, { align: 'center' });
            doc.moveDown(2);

            const headers = [
                'ID Ticket',
                'Tipo Consulta',
                'Nombre Cliente',
                'Teléfono Cliente',
                'Fecha y Hora de Atención',
                'Atendido',
                'Revisado'
            ];

            const rows = resultados.map(row => [
                row.idasignacion_consulta,
                row.tipo_consulta_nombre,
                row.nombre_cliente,
                row.telefono_cliente,
                new Date(row.fecha_hora_salida).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }),
                row.atendido,
                row.revisado
            ]);

            await doc.table({ headers, rows }, {
                columnSpacing: 5,
                padding: 5,
                prepareHeader: () => doc.fontSize(10).font('Helvetica-Bold'),
                prepareRow: () => doc.fontSize(9).font('Helvetica')
            });

            doc.moveDown(2);
            doc.fontSize(12).text('Clínica UMG', 10, doc.page.height - 70, { align: 'center' });
            doc.fontSize(10).text('Teléfono: +502 5821-6179', 10, doc.page.height - 60, { align: 'center' });
            doc.fontSize(10).text('Dirección: Villa Nueva UMG', 10, doc.page.height - 45, { align: 'center' });

            const pdfFileName = `consultas_atendidas_${fecha_inicio}_a_${fecha_fin}.pdf`;
            res.setHeader('Content-Disposition', `attachment; filename="${pdfFileName}"`);
            res.setHeader('Content-type', 'application/pdf');

            doc.pipe(res);
            doc.end();
        } else {
            res.status(404).send({ message: 'No hay consultas atendidas y revisadas en el rango de fechas.' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al generar el PDF.' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
exports.generateConsultasAtendidas = async (req, res) => {
    let connection;
    try {
        connection = await db.init();

        const { fecha_inicio, fecha_fin } = req.body;

        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).send({ message: 'Debe proporcionar fecha_inicio y fecha_fin en el query string.' });
        }

        const consultaSQL = `
            SELECT
                a.idasignacion_consulta,
                a.fecha_hora_salida,
                a.nombre_cliente,
                a.telefono_cliente,
                a.atendido,
                a.revisado,
                t.nombre AS tipo_consulta_nombre
            FROM asignacion_consulta a
            INNER JOIN tipo_consulta t ON a.idtipo_consulta = t.idtipo_consulta
            WHERE a.atendido = 'SI' AND a.revisado = 'SI'
            AND DATE(a.fecha_hora_salida) BETWEEN ? AND ?
        `;

        const [resultados] = await connection.execute(consultaSQL, [fecha_inicio, fecha_fin]);

        if (resultados.length > 0) {
            res.json(resultados);
        } else {
            res.status(404).send({ message: 'No hay consultas atendidas y revisadas en el rango de fechas.' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al generar datos.' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
//REPORTE 2
exports.generatePDFConsultasRevisadasNoAtendidas = async (req, res) => {
    let connection;
    try {
        connection = await db.init();

        const { fecha_inicio, fecha_fin } = req.body;

        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).send({ message: 'Debe proporcionar fecha_inicio y fecha_fin en el query string.' });
        }
        const consultaSQL = `
            SELECT
                a.idasignacion_consulta,
                a.fecha_hora_salida,
                a.nombre_cliente,
                a.telefono_cliente,
                a.atendido,
                a.revisado,
                t.nombre AS tipo_consulta_nombre
            FROM asignacion_consulta a
            INNER JOIN tipo_consulta t ON a.idtipo_consulta = t.idtipo_consulta
            WHERE a.atendido = 'NO' AND a.revisado = 'SI'
            AND DATE(a.fecha_hora_salida) BETWEEN ? AND ?
        `;

        const [resultados] = await connection.execute(consultaSQL, [fecha_inicio, fecha_fin]);

        if (resultados.length > 0) {
            const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

            doc.fontSize(16).text('Clínica | UMG', { align: 'center' });
            doc.fontSize(12).text('Teléfono: +502 5821-6179', { align: 'center' });
            doc.fontSize(14).text(`Consultas Revisadas pero No Atendidas del ${fecha_inicio} al ${fecha_fin}`, { align: 'center' });
            doc.moveDown(2);

            const headers = [
                'ID Ticket',
                'Tipo Consulta',
                'Nombre Cliente',
                'Teléfono Cliente',
                'Fecha y Hora Programada',
                'Atendido',
                'Revisado'
            ];

            const rows = resultados.map(row => [
                row.idasignacion_consulta,
                row.tipo_consulta_nombre,
                row.nombre_cliente,
                row.telefono_cliente,
                row.fecha_hora_salida
                    ? new Date(row.fecha_hora_salida).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    })
                    : 'Sin Fecha',
                row.atendido,
                row.revisado
            ]);

            await doc.table({
                headers,
                rows
            }, {
                columnSpacing: 5,
                padding: 5,
                prepareHeader: () => doc.fontSize(10).font('Helvetica-Bold'),
                prepareRow: (row, i) => doc.fontSize(9).font('Helvetica')
            });

            doc.moveDown(2);
            doc.fontSize(12).text('Clínica UMG', 10, doc.page.height - 70, { align: 'center' });
            doc.fontSize(10).text('Teléfono: +502 5821-6179', 10, doc.page.height - 60, { align: 'center' });
            doc.fontSize(10).text('Dirección: Villa Nueva UMG', 10, doc.page.height - 45, { align: 'center' });

            const pdfFileName = `consultas_revisadas_no_atendidas.pdf`;
            res.setHeader('Content-Disposition', `attachment; filename="${pdfFileName}"`);
            res.setHeader('Content-type', 'application/pdf');

            doc.pipe(res);
            doc.end();
        } else {
            res.status(404).send({ message: 'No hay consultas revisadas sin atender.' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al generar el PDF.' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
exports.generateConsultasRevisadasNoAtendidas = async (req, res) => {
    let connection;
    try {
        connection = await db.init();

        const { fecha_inicio, fecha_fin } = req.body;

        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).send({ message: 'Debe proporcionar fecha_inicio y fecha_fin en el query string.' });
        }

        const consultaSQL = `
            SELECT
                a.idasignacion_consulta,
                a.fecha_hora_salida,
                a.nombre_cliente,
                a.telefono_cliente,
                a.atendido,
                a.revisado,
                t.nombre AS tipo_consulta_nombre
            FROM asignacion_consulta a
            INNER JOIN tipo_consulta t ON a.idtipo_consulta = t.idtipo_consulta
            WHERE a.atendido = 'NO' AND a.revisado = 'SI'
            AND DATE(a.fecha_hora_salida) BETWEEN ? AND ?
        `;

        const [resultados] = await connection.execute(consultaSQL, [fecha_inicio, fecha_fin]);

        if (resultados.length > 0) {
            res.json(resultados);
        } else {
            res.status(404).send({ message: 'No hay consultas revisadas y no atendidas' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al generar datos.' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
//REPORTE 3
exports.generatePDFConsultasTotalPorVentanilla = async (req, res) => {
    let connection;
    try {
        connection = await db.init();

        const { fecha_inicio, fecha_fin } = req.body;

        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).send({ message: 'Debe proporcionar fecha_inicio y fecha_fin en el query string.' });
        }
        const consultaSQL = `
                SELECT 
                v.idventanillas,
                v.nombre AS nombre_ventanilla,
                COUNT(ac.idasignacion_consulta) AS total_atendidos
            FROM asignacion_consulta ac
            JOIN tipo_consulta tc ON ac.idtipo_consulta = tc.idtipo_consulta
            JOIN ventanillas v ON tc.idtipo_consulta = v.idtipo_consulta
            WHERE ac.atendido = 'SI' 
            AND DATE(ac.fecha_hora_salida) BETWEEN ? AND ?
            GROUP BY v.idventanillas, v.nombre;
        `;

        const [resultados] = await connection.execute(consultaSQL, [fecha_inicio, fecha_fin]);

        if (resultados.length > 0) {
            const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

            doc.fontSize(16).text('Clínica | UMG', { align: 'center' });
            doc.fontSize(12).text('Teléfono: +502 5821-6179', { align: 'center' });
            doc.fontSize(14).text(`Consultas Canitdad Tickets Atendidos Por Ventanilla del ${fecha_inicio} al ${fecha_fin}`, { align: 'center' });
            doc.moveDown(2);

            const headers = [
                'ID Ventanilla',
                'Nombre Ventanilla',
                'Cantidad Atendidos',
            ];

            const rows = resultados.map(row => [
                row.idventanillas,
                row.nombre_ventanilla,
                row.total_atendidos
            ]);

            await doc.table({
                headers,
                rows
            }, {
                columnSpacing: 5,
                padding: 5,
                prepareHeader: () => doc.fontSize(10).font('Helvetica-Bold'),
                prepareRow: (row, i) => doc.fontSize(9).font('Helvetica')
            });

            doc.moveDown(2);
            doc.fontSize(12).text('Clínica UMG', 10, doc.page.height - 70, { align: 'center' });
            doc.fontSize(10).text('Teléfono: +502 5821-6179', 10, doc.page.height - 60, { align: 'center' });
            doc.fontSize(10).text('Dirección: Villa Nueva UMG', 10, doc.page.height - 45, { align: 'center' });

            const pdfFileName = `consultas_atendidos_por_ventanilla.pdf`;
            res.setHeader('Content-Disposition', `attachment; filename="${pdfFileName}"`);
            res.setHeader('Content-type', 'application/pdf');

            doc.pipe(res);
            doc.end();
        } else {
            res.status(404).send({ message: 'No hay datos.' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al generar el PDF.' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
exports.generateConsultasTotalPorVentanilla = async (req, res) => {
    let connection;
    try {
        connection = await db.init();

        const { fecha_inicio, fecha_fin } = req.body;

        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).send({ message: 'Debe proporcionar fecha_inicio y fecha_fin en el query string.' });
        }

        const consultaSQL = `
                SELECT 
                v.idventanillas,
                v.nombre AS nombre_ventanilla,
                COUNT(ac.idasignacion_consulta) AS total_atendidos
            FROM asignacion_consulta ac
            JOIN tipo_consulta tc ON ac.idtipo_consulta = tc.idtipo_consulta
            JOIN ventanillas v ON tc.idtipo_consulta = v.idtipo_consulta
            WHERE ac.atendido = 'SI' 
            AND DATE(ac.fecha_hora_salida) BETWEEN ? AND ?
            GROUP BY v.idventanillas, v.nombre;
        `;

        const [resultados] = await connection.execute(consultaSQL, [fecha_inicio, fecha_fin]);

        if (resultados.length > 0) {
            res.json(resultados);
        } else {
            res.status(404).send({ message: 'No hay consultas Total por Ventanilla' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al generar datos.' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
//REPORTE 4
exports.generatePDFConsultasGeneral = async (req, res) => {
    let connection;
    try {
        connection = await db.init();
        const consultaSQL = `
            SELECT
                a.*,
                t.nombre AS consulta,
                v.nombre AS ventanilla
            FROM asignacion_consulta a
            INNER JOIN tipo_consulta t ON a.idtipo_consulta = t.idtipo_consulta
            INNER JOIN ventanillas v ON a.idtipo_consulta = v.idtipo_consulta
        `;

        const [resultados] = await connection.execute(consultaSQL);

        if (resultados.length > 0) {
            const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

            doc.fontSize(16).text('Clínica | UMG', { align: 'center' });
            doc.fontSize(12).text('Teléfono: +502 5821-6179', { align: 'center' });
            doc.fontSize(14).text('Consultas Reporte General', { align: 'center' });
            doc.moveDown(2);

            const headers = [
                'ID Ticket',
                'Ventanilla',
                'Tipo Consulta',
                'Nombre Cliente',
                'Telefono Cliente',
                'Descripcion',
                'Fecha C Ticket',
                'Fecha Atendido',
                'Atendido',
                'Revisado',
            ];

            const rows = resultados.map(row => [
                row.idasignacion_consulta,
                row.ventanilla,
                row.consulta,
                row.nombre_cliente,
                row.telefono_cliente,
                row.descripcion,
                new Date(row.fecha_hora_creacion).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }),
                new Date(row.fecha_hora_salida).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }),
                row.atendido,
                row.revisado
            ]);

            await doc.table({
                headers,
                rows
            }, {
                columnSpacing: 5,
                padding: 5,
                prepareHeader: () => doc.fontSize(10).font('Helvetica-Bold'),
                prepareRow: (row, i) => doc.fontSize(9).font('Helvetica')
            });

            doc.moveDown(2);
            doc.fontSize(12).text('Clínica UMG', 10, doc.page.height - 70, { align: 'center' });
            doc.fontSize(10).text('Teléfono: +502 5821-6179', 10, doc.page.height - 60, { align: 'center' });
            doc.fontSize(10).text('Dirección: Villa Nueva UMG', 10, doc.page.height - 45, { align: 'center' });

            const pdfFileName = `consultas_reporte_general.pdf`;
            res.setHeader('Content-Disposition', `attachment; filename="${pdfFileName}"`);
            res.setHeader('Content-type', 'application/pdf');

            doc.pipe(res);
            doc.end();
        } else {
            res.status(404).send({ message: 'No hay datos.' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al generar el PDF.' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
exports.generateConsultasGeneral = async (req, res) => {
    let connection;
    try {
        connection = await db.init();

        const { fecha_inicio, fecha_fin } = req.body;

        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).send({ message: 'Debe proporcionar fecha_inicio y fecha_fin en el query string.' });
        }

        const consultaSQL = `
            SELECT
                a.*,
                t.nombre AS consulta,
                v.nombre AS ventanilla
            FROM asignacion_consulta a
            INNER JOIN tipo_consulta t ON a.idtipo_consulta = t.idtipo_consulta
            INNER JOIN ventanillas v ON a.idtipo_consulta = v.idtipo_consulta
        `;

        const [resultados] = await connection.execute(consultaSQL, [fecha_inicio, fecha_fin]);

        if (resultados.length > 0) {
            res.json(resultados);
        } else {
            res.status(404).send({ message: 'No hay consultas General' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al generar datos.' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

/**
 * SELECT
    a.*,
    t.nombre AS tipo_consulta_nombre
FROM asignacion_consulta a
INNER JOIN tipo_consulta t ON a.idtipo_consulta = t.idtipo_consulta
WHERE a.atendido = 'SI' AND a.revisado = 'SI';


SELECT
    a.*,
    t.nombre AS tipo_consulta_nombre
FROM asignacion_consulta a
INNER JOIN tipo_consulta t ON a.idtipo_consulta = t.idtipo_consulta
WHERE atendido = 'NO' AND revisado = 'SI';


SELECT 
    v.idventanillas,
    v.nombre AS nombre_ventanilla,
    COUNT(ac.idasignacion_consulta) AS total_atendidos
FROM asignacion_consulta ac
JOIN tipo_consulta tc ON ac.idtipo_consulta = tc.idtipo_consulta
JOIN ventanillas v ON tc.idtipo_consulta = v.idtipo_consulta
WHERE ac.atendido = 'SI'
GROUP BY v.idventanillas, v.nombre;


SELECT
    a.*,
    t.nombre AS consulta,
    v.nombre AS ventanilla
FROM asignacion_consulta a
INNER JOIN tipo_consulta t ON a.idtipo_consulta = t.idtipo_consulta
INNER JOIN ventanillas v ON a.idtipo_consulta = v.idtipo_consulta



 */