'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secretKey = 'secretKeyjwt';

exports.ensureAuth = (req, res, next)=>{
    if(!req.headers.authorization){
        return res.status(403).send({message: 'Para realizar esta acción necesita Iniciar Sesión o Registrarse.'});
    }else{
        try{
            var token = req.headers.authorization.replace(/['"]+/g, '');
            var payload = jwt.decode(token, secretKey);
            //console.log(payload)
            req.userId = payload.login;
        }catch(err){
            console.log(err);
            return res.status(404).send({message: 'El Token no es valido.'});
        }
        //req.userId = payload;
        //req .userId = payload.login;
        next();
    }
}