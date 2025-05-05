// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const Enroll = require("./modals/Enroll");
const Feedback = require("./modals/Feedback");
const Time = require("./modals/Time");
const GNLoans = require("./modals/GNLoans");
const GNUsers = require("./modals/GNUsers");
const app = express();
// app.use(cors());
// const cors = require('cors');

const allowedOrigins = [
  "https://www.zphskunur.in",
  "http://localhost:1954",
  "http://127.0.0.1:5501",
  "https://www.todaydigitalworld.com",
];

const corsOptions = {
  // origin: ["http://localhost:5173", "https://react-vite-app-seven.vercel.app/"], // Allow only this origin
  // origin: ["*"], // Allow only this origin
  // methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
  // origin: "https://react-vite-app-seven.vercel.app", // Replace with your Vite app domain
  // origin: ["https://www.zphskunur.in", "http://localhost:1954"], // Replace with your Vite app domain
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  // origin: "http://localhost:5173", // Replace with your Vite app domain
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // Allow cookies and authorization headers
  // allowedHeaders: ["Content-Type", "Authorization"], // Allow required headers
};

app.use(cors(corsOptions));
// app.use(cors());

app.use(express.json());

// Middleware to parse form data (urlencoded)
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static(path.join(__dirname)));

// new
try {
  mongoose.connect(
    "mongodb+srv://sakinalaraju100:ObBamLOL3fm9X16z@cluster0.4bvgg.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0?tls=true",
    {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      connectTimeoutMS: 30000,
    }
  );

  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", () => {
    console.log("Connected to MongoDB");
  });
} catch (er) {
  console.log("er", er);
}

app.post("/all-enrolls", async (req, res) => {
  try {
    const users = await Enroll.find();
    res.status(200).send(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err });
  }
});

app.post("/new-enroll", async (req, res) => {
  console.log("req.body", req.body);

  try {
    // need to put condition to avaid dublicates
    const exstingUsers = await Enroll.findOne({
      fullName: req.body.fullName,

      batchYear: req.body.batchYear,
    });
    if (!exstingUsers) {
      const existBatchData = await Enroll.find({
        batchYear: req.body.batchYear,
      });
      const newEnroll = new Enroll({
        ...req.body,
        Code:
          req?.body?.batchYear.slice(-4) +
          "/" +
          Number(existBatchData.length + 1),
        flag: false,
        enrolled: false,
        familyMembers: 0,
        new: true,
      });
      await newEnroll.save();

      return res.status(201).send({ message: "Enrollemnt successfully" });
    } else {
      return res.status(202).send({ message: "Same details enrolled" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error in Enrollment", error: err });
  }
});

app.get("/wellcome", (req, res) => {
  res.send("Well come to school server..");
});

// Route to serve form.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/enroll-list", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "enroll-list.html"));
});
app.get("/savineer-book", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "SavineerBook.html"));
});
app.get("/savineer-book2", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "SavineerBook2.html"));
});
app.post("/switch-turn", async (req, res) => {
  const { Code, checked, familyMembers } = req.body;
  try {
    const user = await Enroll.findOneAndUpdate(
      { Code: Code },
      {
        $set: {
          enrolled: checked,
          familyMembers: checked ? Number(familyMembers) : 0,
        },
      }
    );
    res
      .status(201)
      .send({ message: checked ? "Enrollment successful" : "Switched off" });
  } catch (er) {
    console.log("er", er);
    res.status(500).send({ message: er?.message ?? "error" });
  }
});

app.post("/save-feedbacks", async (req, res) => {
  try {
    const newFeedback = new Feedback(req.body);
    await newFeedback.save();

    res.status(200).send(newFeedback);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err });
  }
});
app.get("/get-feedbacks", async (req, res) => {
  try {
    const feedbacks = await Feedback.find();

    res.status(200).send(feedbacks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err });
  }
});

app.get("/feedbacks", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "feedbacks.html"));
});
app.get("/time", async (req, res) => {
  const a = await Time.find();
  res.send(a);
});

app.post("/add-new-gn-user", async (req, res) => {
  // const { user, passcode } = req.body;
  const newGNUser = new GNUsers(req.body);
  await newGNUser.save();
  // res.send(newGNUser);
  res
    .status(200)
    .send({ success: true, message: "login successful", data: newGNUser });
});
app.post("/gn-login", async (req, res) => {
  console.log("req.body", req.body);
  const { user, passcode } = req.body;
  try {
    const userData = await GNUsers.findOne({
      $or: [{ userId: user }, { mobile: user }, { email: user }],
    });
    console.log("userData", userData);

    if (passcode != "123456") {
      return res
        .status(200)
        .send({ success: false, message: "password not matched", data: null });
    }
    if (userData) {
      res
        .status(200)
        .send({ success: true, message: "login successful", data: userData });
    } else {
      res
        .status(200)
        .send({ success: false, message: "User not found", data: null });
    }
  } catch (err) {
    res.status(400).send({ success: "false", message: "failed", err });
  }
});
app.post("/gn-loans", async (req, res) => {
  const loans = await GNLoans.find();
  res.send(loans);
});

app.post("/add-new-gn-loan", async (req, res) => {
  const { user, passcode } = req.body;
  const newGNLoan = new GNLoans(req.body);
  await newGNLoan.save();
  res.send(newGNLoan);
});

const port = process.env.PORT || 1954;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
