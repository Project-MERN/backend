require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const userschema = require("./Database/userSchema");
const userSequenceSchema =require("./Database/userSequenceSchema");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(__dirname))
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());

var data = null;

const User =  mongoose.model("Users",userschema);
const UserSequence = mongoose.model('UserSequence', userSequenceSchema);


app.listen(PORT,()=> {
    console.log("Server started in "+PORT);
})

app.get("/",(req,res)=> {
    res.sendFile("/backend/index.html");
})

app.post("/register-data",async(req,res) => {
    try {
        const { name, email, password } = req.body;
        const emailExists = await User.findOne({ email })
        if (emailExists===null) {
                    var userId = await getNextuserSequenceValue("user_id");
                    data = {
                      name,
                      email,
                      password,
                    };
                    const newUser = new User({
                      id: "user" + userId,
                      name: name,
                      email: email,
                      password: password,
                      recentlyViewd: null,
                      cart: null,
                      enrolled: null,
                    });
            await newUser.save();
            res.json({ "result": "Registered" })
        }
        else if(emailExists!==null) {
            res.json({"result":"Not Registered","error":"Email Already Registered"})
        }

    }
    catch(e) {
        console.log(e);
    }
})

app.post("/login-data", async (req, res) => {
    try {
            const { email, password } = req.body;
            const emailExists = await User.findOne({ email });
            if (emailExists === null) {
              res.json({ loginStatus: "Failed", error: "Not Registered" });
            } else if (emailExists !== null) {
              if (password === emailExists.password) {
                res.json({ loginStatus: "Success", id: emailExists._id });
              } else {
                res.json({
                  loginStatus: "Failed",
                  error: "Password Incorrect",
                });
              }
            }
    } catch (error) {
        res.json({status:400})
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
        mongoose.connect(process.env.MONGO_URL);
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