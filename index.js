// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const Enroll = require("./modals/Enroll");
const app = express();
app.use(express.json());
app.use(cors());

// Middleware to parse form data (urlencoded)
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static(path.join(__dirname)));

// new
mongoose.connect(
  "mongodb+srv://sakinalaraju100:ObBamLOL3fm9X16z@cluster0.4bvgg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/school",
  {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

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
      father: req.body.father,
      batchYear: req.body.batchYear,
    });
    if (!exstingUsers) {
      const newEnroll = new Enroll(req.body);
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

const port = process.env.PORT || 1954;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
