require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const userschema = require("./Database/userSchema");
const userSequenceSchema = require("./Database/userSequenceSchema");
const trainerSchema = require("./Database/trainerSchema");
const trainerSequenceSchema = require("./Database/trainerSequenceSchema");
const courseSchema = require("./Database/CourseSchema");
const courseSequenceSchema  = require("./Database/CourseSequenceSchema");


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
const Courses = mongoose.model("courses",courseSchema);
const CourseSequence = mongoose.model("Courses",courseSequenceSchema);

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
                course: []
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
                res.json({ loginStatus: "Success", id: emailExists.id, _id: emailExists._id });
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

app.post("/login-trainer-data", async (req, res) => {
    try {
        const { email, password } = req.body;
        const emailExists = await Trainer.findOne({ email });
        if (emailExists === null) {
            res.json({ loginStatus: "Failed", error: "Not Registered" });
        }
        else if (emailExists !== null) {
            if (password === emailExists.password) {
                res.json({
                    loginStatus: "Success",
                    id: emailExists.id,
                    _id: emailExists._id,
                });
            } else {
                res.json({
                    loginStatus: "Failed",
                    error: "Password Incorrect",
                });
            }
        }
    }
    catch (error) {
        console.log(error)
    }
})

app.post("/courses", async (req, res) => {
    try {
        const courseCollection = await mongoose.connection.collection("courses");
        const foundItems = await courseCollection.find({}).toArray();
        res.json(foundItems);
    }
    catch (error) {
        console.log(error);
    }
})

app.post("/courses/:courseID", async (req, res) => {
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

app.post("/wishlistData", async (req, res) => {
    try {
        const wishlistdata = req.body;
        const courseID = wishlistdata.courserId;
        const foundData = await User.findOne(new mongoose.Types.ObjectId(wishlistdata.userId));
        if (foundData.cart.includes(courseID)) {
            console.log("alredy exist");
        }
        else {
            await foundData.updateOne({ $push: { cart: wishlistdata.courserId } });
        }
    }
    catch (error) {
        console.log(error);
    }
})



app.post("/Registered", async (req, res) => {
    try {
        var registerArray = [];
        const registerdata = req.body;
        const UserData = await User.findOne(new mongoose.Types.ObjectId(registerdata.userId));
        const cartData = UserData.enrolled;
        for (let i = 0; i < cartData.length; i++) {
            try {
                const courseCollection = await mongoose.connection.collection("courses");
                let courseId = cartData[i];
                courseId = parseInt(courseId, 10);
                const courseData = await courseCollection.findOne({ id: courseId });
                registerArray.push(courseData);
            } catch (error) {
                console.error("Error fetching course data:", error.message);
            }
        }
        res.json(registerArray)

    }
    catch (error) {
        console.log(error);
    }
})

app.post("/user/:userId", async (req, res) => {
    const userId = req.params.userId;
    const userCollection = await mongoose.connection.collection("users");
    const userItems = await userCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    if (userItems) {
        res.json(userItems);
    }
    else {
        res.json("No data found");
    }
})


app.post("/trainer/:trainerId",async (req,res) => {
    const trainerId = req.params.trainerId;
    var courseData;
    var registerArray = [];
    const trainerData = await Trainer.findOne({_id: new mongoose.Types.ObjectId(trainerId)});
    const cartData = trainerData.course;
       
        for (let i = 0; i < cartData.length; i++) {
            try {
                const courseCollection = await mongoose.connection.collection("courses");
                let courseId = cartData[i];
                courseId = parseInt(courseId, 10);
                const courseData = await courseCollection.findOne({ id: courseId });
                registerArray.push(courseData);
            } catch (error) {
                console.error("Error fetching course data:", error.message);
            }
        }
        res.json(registerArray);
})


app.post("/newcourse",async(req,res) => {
    try {
        const newCourseData = req.body;
        const trainer_id = newCourseData.trainerId;
        const courseId = await getNextCourseSequenceValue("course_id");
        const newcourse = new Courses({
            id: "course" +courseId,
            name: newCourseData.course_name,
            tittle: newCourseData.title,
            description: newCourseData.description,
            duration: newCourseData.duration,
        });
        await newcourse.save();
        const foundItems = await Trainer.findOne({_id:new mongoose.Types.ObjectId(trainer_id)});
        await foundItems.updateOne({ $push: { course:courseId } });
    }
    catch (error) {
        console.log(error);
    }
})

app.post("/delete/:courseID", async (req, res) => {
    try {
      const courseId = req.params.courseID;
      const sentData = req.body;
      const trainerId = sentData.trainerId;
  
      // Use findOneAndUpdate to remove the course from the array
      const updatedTrainer = await Trainer.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(trainerId) },
        { $pull: { course: courseId } },
        { new: true } // Return the updated document
      );
  
      if (!updatedTrainer) {
        // Handle the case where the trainer is not found
        return res.status(404).json({ message: 'Trainer not found' });
      }
  
      console.log(`Course ${courseId} removed from trainer ${trainerId}`);
      res.status(200).json({ message: 'Course removed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


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

<<<<<<< HEAD
async function getNextCourseSequenceValue(collectionName) {
    const sequenceDocument = await CourseSequence.findOneAndUpdate(
        { _id: collectionName },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    return sequenceDocument.seq;
}

main();
=======
main();
>>>>>>> cb708febe4d5bc5d93711f9cc7e830bc2d8a657e
