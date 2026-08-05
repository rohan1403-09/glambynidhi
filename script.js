const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));


// MySQL connection

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "YOUR_MYSQL_PASSWORD",
    database: "glow_nidhi"
});


db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err);
    } else {
        console.log("MySQL connected ✅");
    }
});


// GET REVIEWS

app.get("/api/reviews", (req, res) => {

    db.query(
        "SELECT * FROM reviews ORDER BY id DESC",
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(results);

        }
    );

});


// ADD REVIEW

app.post("/api/reviews", (req, res) => {

    const {
        name,
        service,
        rating,
        text
    } = req.body;


    db.query(
        "INSERT INTO reviews (name, service, rating, review) VALUES (?, ?, ?, ?)",

        [
            name,
            service,
            rating,
            text
        ],

        (err, result)=>{

            if(err){
                return res.status(500).json({
                    error: err.message
                });
            }


            res.json({
                id: result.insertId,
                name,
                service,
                rating,
                text,
                date: new Date()
            });

        }
    );

});



app.listen(3000,()=>{
    console.log("Glow server running on http://localhost:3000");
});
