'use strict'

const db = require('../../configs/mariaDBConfigs');

//Funcion de prueba
exports.prueba = async (req, res) => {
    res.status(200).send({ message: 'Controller Asignacion Consultas is runing !!' });
}


/**
 * SELECT
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
WHERE v.idventanillas = '4'
and asi.atendido = 'NO'
ORDER BY asi.fecha_hora_creacion ASC
 */

