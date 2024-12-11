// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const Enroll = require("./modals/Enroll");
const app = express();
app.use(cors());

// Middleware to parse form data (urlencoded)
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// new
mongoose.connect(
  "mongodb+srv://sakinalaraju100:ObBamLOL3fm9X16z@cluster0.4bvgg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/school",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err });
  }
});

app.post("/new-enroll", async (req, res) => {
  try {
    const newEnroll = new Enroll(req.body);
    await newEnroll.save();

    // res.status(201).json({ message: "User created successfully" });
    res.redirect("http://localhost:1954/enroll-list");
  } catch (err) {
    res.status(500).json({ message: "Error creating user", error: err });
  }
});

app.get("/", (req, res) => {
  res.send("Well come to school server..");
});
app.get("/test", (req, res) => {
  res.send("test");
});
// Route to serve form.html
app.get("/enroll-form", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "enroll.html"));
});
app.get("/enroll-list", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "enroll-list.html"));
});
app.get("/form", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "addStudentForm.html"));
});

// Handle form submission
app.post("/en-submit", (req, res) => {
  const { fullName } = req.body;
  console.log("res.body", req.body);

  fs.readFile("enrolls.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    // Parse the existing data, or create an empty array if the file is empty
    let existingData = [];
    try {
      existingData = JSON.parse(data);
    } catch (parseError) {
      // If the JSON is malformed or empty, it might fail to parse, so we initialize an empty array
      existingData = [];
    }

    // Add the new document to the existing data
    existingData.push(req.body);

    // Write the updated data back to the JSON file
    fs.writeFile(
      "enrolls.json",
      JSON.stringify(existingData, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.error("Error writing to file:", err);
          return;
        }
        console.log("Enroll successfully");
      }
    );
  });

  res.send(`Form submitted for ${fullName}.`);
  // res.redirect("https://sakinalaraju100.github.io/zphs-school/");
});
// Handle form submission
app.post("/submit", (req, res) => {
  const { name } = req.body;
  console.log("res.body", req.body);

  fs.readFile("students.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    // Parse the existing data, or create an empty array if the file is empty
    let existingData = [];
    try {
      existingData = JSON.parse(data);
    } catch (parseError) {
      // If the JSON is malformed or empty, it might fail to parse, so we initialize an empty array
      existingData = [];
    }

    // Add the new document to the existing data
    existingData.push(req.body);

    // Write the updated data back to the JSON file
    fs.writeFile(
      "students.json",
      JSON.stringify(existingData, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.error("Error writing to file:", err);
          return;
        }
        console.log("New document successfully added to file");
      }
    );
  });

  // res.send(`Form submitted for ${name}.`);
  res.redirect("https://sakinalaraju100.github.io/zphs-school/");
});
app.get("/get-enroll-list-json", (req, res) => {
  fs.readFile("enrolls.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    // Parse the existing data, or create an empty array if the file is empty
    let existingData = [];
    try {
      existingData = JSON.parse(data);
      return res.send(existingData);
    } catch (parseError) {
      // If the JSON is malformed or empty, it might fail to parse, so we initialize an empty array
      existingData = [];
      return res.send(existingData);
    }
  });
});
app.get("/add-new-enroll-to-json", (req, res) => {
  fs.readFile("enrolls.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    // Parse the existing data, or create an empty array if the file is empty
    let existingData = [];
    try {
      existingData = JSON.parse(data);
    } catch (parseError) {
      // If the JSON is malformed or empty, it might fail to parse, so we initialize an empty array
      existingData = [];
    }

    // Add the new document to the existing data
    existingData.push({
      time: new Date(),
      batchYear: "2015-2016",
      fullName: "Arjunsrihansh2",
      father: "Anitha",
      gender: "Male",
      email: "arjunsrihans@example.com",
      phone: "9908284578",
      village: "Garmilapally",
    });

    // Write the updated data back to the JSON file
    fs.writeFile(
      "enrolls.json",
      JSON.stringify(existingData, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.error("Error writing to file:", err);
          return;
        }
        console.log("New document successfully added to file");
        res.send("success");
      }
    );
  });
});

const port = process.env.PORT || 1954;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
