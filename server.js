const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const userschema = require("./Database/userSchema");
const userSequenceSchema =require("./Database/userSequenceSchema");

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());

var data = null;

const User =  mongoose.model("Users",userschema);
const UserSequence = mongoose.model('UserSequence', userSequenceSchema);


app.listen(5000,()=> {
    console.log("Server started in port 5000");
})

app.post("/register-data",async(req,res) => {
    try {
        const {name,email,password} = req.body;
        var userId = await getNextuserSequenceValue('user_id');
        data = {
            name,email,password
        }
        const newUser = new User({
            id: "user" + userId,
            name: name,
            email:email,
            password:password,
            recentlyViewd: null,
            cart: null,
            enrolled: null,
        })
        await newUser.save();
    }
    catch(e) {
        console.log(e);
    }
})

app.get("/user-data",async(req,res) => {
    try {
        var foundItems = await User.find({});
        foundItems = JSON.stringify(foundItems);
        res.json(foundItems);
    }
    catch (error) {
        console.log(error);
    }
})


const main = async() => {
    try {
        mongoose.connect("mongodb+srv://rohithchanda7:Rohith1034@cluster0.wcwln0e.mongodb.net/?retryWrites=true&w=majority");
        console.log("Connected to database");
    }
    catch (error) {
        console.log(error);
    }
} 


async function getNextuserSequenceValue(collectionName) {
    const sequenceDocument = await UserSequence.findOneAndUpdate(
        { _id: collectionName },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    return sequenceDocument.seq;
}

main();