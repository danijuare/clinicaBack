'use strict'

const bcrypt = require('bcrypt-nodejs');
const fs = require('fs');

exports.checkPermission = async (userId, sub,login)=>{
    try{
        if (login === 'admin') {
            return true;
        }
        if (userId != sub){
            return false;
        } 
        else {
            return true;
        }
    } 
    catch (err) {
        console.log(err);
        return err;
    }
}

exports.encrypt = async (password) =>{
    try {
        return bcrypt.hashSync(password);
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.checkPassword = async (password, hash) => {
    try{
        //console.log("password ",password);
        //console.log("hash ",hash);
        return bcrypt.compareSync(password, hash);
    } 
    catch (err){
        console.log(err);
        return err;
    }
}

exports.validExtension = async (ext, filePath)=>{
    try {
        if (ext == '.png' || ext == '.jpg' || ext == '.jpeg') {
            return true;
        } else {
            fs.unlinkSync(filePath);
            return false;
        }
    } 
    catch (err){
        console.log(err);
        return err;
    }
}

exports.validateData = (data) =>{
    let keys = Object.keys(data), msg = '';

    for(let key of keys){
        if(data[key] !== null && data[key] !== undefined && data[key] !== '') continue;
        msg += `El parametró ${key} es obligatorio\n`
    }
    return msg.trim();
}