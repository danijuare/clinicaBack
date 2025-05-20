'use strict'

//const mongoConfig = require('./configs/mongoConfig');
const mariaBD = require('./configs/mariaDBConfigs');
const app = require('./configs/app');
const port = process.env.PORT || 3200;

//mariaBD.init();

app.listen(port,()=>{
    console.log(`Server http running in port ${port}`);
});