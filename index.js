// index.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

// Middleware to parse form data (urlencoded)
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("Well come to school server..");
});
// Route to serve form.html
app.get("/form", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "addStudentForm.html"));
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
  res.redirect("http://127.0.0.1:5500/ZPHSKunur.html");
});

const port = process.env.PORT || 1954;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
