const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const upload = multer();
const path = require('path');
const app = express();
const dbConfig = {
    host: "localhost",
    user: "root",
    password: "123456",
    database: "wishlist"
}
async function executeQuery(queryText, params) {
    let result={};
    try {
        const connection = await mysql.createConnection(dbConfig);
        [result] = await connection.execute(queryText, params);
        connection.end();
        console.log(result);
    } catch (error){
        throw new Error(error);
    }
    return result;
}
app.use(express.static(path.join(__dirname, 'public')));

app.get('/',(req, res)=>{
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});
app.get('/getWishes',async (req, res)=>{
    try {
        let result = await executeQuery(`SELECT * FROM wishes`, null);
        res.json(result);
    }
    catch (error){
        console.log("Ошибка получения списка из БД: "+error);
        res.status(500).json({error:"Ошибка получения списка из БД: "+error}).send();
    }
})
app.post('/addWish', upload.any(), async (req, res)=>{
    try {
        const name = req.body.name;
        const description = req.body.description;
        let result=await executeQuery(`INSERT INTO wishes (name, description) VALUES (?, ?)`, [name, description])
        res.send(result);
    } catch (error){
        console.error("Ошибка добавления записи в БД", error);
        res.status(500).send({error:"Ошибка добавления записи в БД: "+error});
    }
});
app.delete('/deleteWish', upload.any(),async (req, res)=>{
    try {
        const id = req.body.id;
       let result=await executeQuery(`Delete from wishes where id=?`, [id]);
        res.send(result);
    } catch (error){
        console.log("Ошибка добавления записи в БД", error);
        res.status(500).json({error:"Ошибка добавления записи в БД: "+error}).send();;
    }
});
app.put('/editWish', upload.any(),async (req, res)=>{
    try {
        const id = req.body.id;
        const name = req.body.name;
        const description = req.body.description;
        let result=await executeQuery(`Update wishes set name=?,description=? where id=?`, [name,description,id]);
        res.send(result);
    } catch (error){
        console.error("Ошибка обновления записи в БД", error);
        res.status(500).json({error:"Ошибка добавления записи в БД: "+error}).send();
    }
});
app.listen(3001, ()=>{
    console.log("Сервер запущен! http://localhost:3001");
})