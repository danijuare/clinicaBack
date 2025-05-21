'use strict';

const mysql = require('mysql2/promise');
require('dotenv').config()

exports.init = async () => {
    try {
        const connection = await mysql.createConnection({
            //NUBE
            
            //LOCAL
            host: 'localhost',
            user: 'root', 
            password: '',
            database: 'clinica',
            port: 3306, 
            multipleStatements: true
            
        });

        console.log('¡Conectado a la base de datos MariaDB!');
        return connection;
    } catch (error) {
        console.error('Error al conectar a la base de datos MariaDB:', error);
        throw error; 
    }
};
