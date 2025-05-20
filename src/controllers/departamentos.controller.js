'use strict'

const db = require('../../configs/mariaDBConfigs');

exports.prueba = async (req,res)=>{
    res.status(200).send({message: 'Controller Depa is runing!!'});
}


//Funcion para obtener los departamentos
exports.getDepartamentos = async (req,res)=>{
    let connection
    try{
        connection = await db.init();
        const buscarDepas = "SELECT * FROM departamentos";
        const [existen] = await connection.execute(buscarDepas);
        if(existen.length > 0){
            res.status(200).send({message: 'Departamentos obtenidos exitosamente.', data:existen});
        }else{
            res.status(404).sen({message: 'Departamentos no encontrados o no existen.'});
        }
        await connection.end();
    }catch(err){
        console.log(err);
        res.status(500).send({message: 'Error al obtener los departamentos.'});
    }finally {
        if (connection) {
            await connection.end();
        }
    }   
}