'use strict'

const jwt = require('jwt-simple');
const secretKey = "secretKeyjwt";


exports.crearToken = async(persona)=>{
    try{
        const payload = {
            /*idpersona: persona.id,
            correo: persona.correo,*/
            login: persona.login,
            iat: Math.floor(Date.now() / 1000)
        }
        return jwt.encode(payload,secretKey);
    }catch(err){
        console.error(err);
        return err;
    }
}