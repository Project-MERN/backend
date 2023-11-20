require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const userschema = require("./Database/userSchema");
const userSequenceSchema = require("./Database/userSequenceSchema");
const trainerSchema = require("./Database/trainerSchema");
const trainerSequenceSchema = require("./Database/trainerSequenceSchema");


const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(__dirname))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

var data = null;

const User = mongoose.model("Users", userschema);
const UserSequence = mongoose.model('UserSequence', userSequenceSchema);
const Trainer = mongoose.model("Trainers", trainerSchema);
const TrainerSequence = mongoose.model("TrainerSequence", trainerSequenceSchema);

app.listen(PORT, () => {
    console.log("Server started in " + PORT);
})

app.get("/", (req, res) => {
    res.sendFile("/backend/index.html");
})

app.post("/register-data", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const emailExists = await User.findOne({ email })
        if (emailExists === null) {
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
                recentlyViewd: [],
                cart: [],
                enrolled: [],
            });
            await newUser.save();
            res.json({ "result": "Registered" })
        }
        else if (emailExists !== null) {
            res.json({ "result": "Not Registered", "error": "Email Already Registered" })
        }

    }
    catch (e) {
        console.log(e);
    }
})

app.post("/trainer-register-data", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const emailExists = await Trainer.findOne({ email })
        if (emailExists === null) {
            var trainerId = await getNexttrainerSequenceValue("trainer_id");
            data = {
                name,
                email,
                password,
            };
            const newTrainer = new Trainer({
                id: "trainer" + trainerId,
                name: name,
                email: email,
                password: password,
                course: null
            });
            await newTrainer.save();
            res.json({ "result": "Registered" })
        }
    }
    catch (error) {
        console.log(error);
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
        res.json({ status: 400 })
    }
})

app.post("/login-trainer-data",async(req,res) => {
    try {
        const { email, password } = req.body;
        const emailExists = await Trainer.findOne({ email });
        if (emailExists === null) {
            res.json({ loginStatus: "Failed", error: "Not Registered" });
        }
        else if (emailExists !== null) {
            if (password === emailExists.password) {
                res.json({ loginStatus: "Success", id: emailExists._id, });
            } else {
                res.json({
                    loginStatus: "Failed",
                    error: "Password Incorrect",
                });
            }
        }
    }
    catch(error) {
        console.log(error)
    }
})

app.post("/courses",async(req,res) => {
    try {
        const courseCollection = await mongoose.connection.collection("courses");
        const foundItems = await courseCollection.find({}).toArray();
        res.json(foundItems);
    }
    catch (error) {
        console.log(error);
    }
})

app.post("/courses/:courseID",async (req,res) => {
    const courseCollection = await mongoose.connection.collection("courses");
    let courseId = req.params.courseID;
    courseId = parseInt(courseId, 10);
    const courseItems = await courseCollection.findOne({ id: courseId });
    if (courseItems) {
        res.json(courseItems);
    }
    else {
        res.json("No data found");
    }
})

app.post("/wishlistData",async(req,res) => {
    try {
        const wishlistdata = req.body;
        console.log(wishlistdata.courserId);
        const foundData = await User.findOne(new mongoose.Types.ObjectId(wishlistdata.userId));
        await foundData.updateOne({ $push: { cart: wishlistdata.courserId } });
        console.log(foundData);
    }
    catch (error) {
        console.log(error);
    }
})

app.get("/user/:userId",async(req,res) => {
    const userId = req.params.userId;
    const userCollection = await mongoose.connection.collection("users");
    const userItems = await userCollection.findOne({ _id: new mongoose.Types.ObjectId(userId)});
    if (userItems) {
        res.json(userItems);
    }
    else {
        res.json("No data found");
    }
})

const main = async () => {
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


async function getNexttrainerSequenceValue(collectionName) {
    const sequenceDocument = await TrainerSequence.findOneAndUpdate(
        { _id: collectionName },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    return sequenceDocument.seq;
}

main();