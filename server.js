const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));


let reviews = [];


app.get("/reviews", (req,res)=>{
    res.json(reviews);
});


app.post("/reviews",(req,res)=>{

    const review = req.body;

    reviews.push(review);

    res.json({
        message:"Review saved"
    });

});


app.listen(3000,()=>{
    console.log("Server running on port 3000");
});
