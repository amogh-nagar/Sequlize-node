const mysql=require('mysql2')

const pool=mysql.createPool({
    host:'localhost',
    user:'root',
    database:'practiceaql',
    password:'123Amogh@'
})


module.exports=pool.promise()