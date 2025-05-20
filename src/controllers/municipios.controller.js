'use strict'

const db = require('../../configs/mariaDBConfigs');

exports.prueba = async (req,res)=>{
    res.status(200).send({message: 'Controller Muni is runing!!'});
}


//Funcion para obtener los municipios por el departamento
exports.getMunicipiosByDepa = async (req,res)=>{
    let connection
    try{
        connection = await db.init();
        const iddepa = req.params.id;
        const buscarMunis = "SELECT * FROM municipios WHERE iddepartamento = ?";
        const [existen] = await connection.execute(buscarMunis,[iddepa]);
        if(existen.length > 0){
            res.status(200).send({message: 'Municipios obtemidos exitosamente.', data:existen});
        }else{
            res.status(404).send({message: 'Municipios no existen o no encontrados.'});
        }

        await connection.end();
    }catch(err){
        console.log(err);
        res.status(500).send({message: 'Error al obtener los municipios por departamento.'});
    }finally {
        if (connection) {
            await connection.end();
        }
    }  
}