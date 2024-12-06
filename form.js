// document.getElementById("myForm").addEventListener("submit", function (event) {
//   // Prevent the default form submission behavior
//   event.preventDefault();
//   const fs = require("fs");

//   // Get the form data
//   const formData = new FormData(event.target);

//   // Convert FormData to a simple object
//   const newDocument = {};
//   formData.forEach((value, key) => {
//     newDocument[key] = value;
//   });

//   // Log the form data to the console
//   console.log(newDocument);
//   // Read the existing JSON file
//   fs.readFile("data2.json", "utf8", (err, data) => {
//     if (err) {
//       console.error("Error reading file:", err);
//       return;
//     }

//     // Parse the existing data, or create an empty array if the file is empty
//     let existingData = [];
//     try {
//       existingData = JSON.parse(data);
//     } catch (parseError) {
//       // If the JSON is malformed or empty, it might fail to parse, so we initialize an empty array
//       existingData = [];
//     }

//     // Add the new document to the existing data
//     existingData.push(newDocument);

//     // Write the updated data back to the JSON file
//     fs.writeFile(
//       "data.json",
//       JSON.stringify(existingData, null, 2),
//       "utf8",
//       (err) => {
//         if (err) {
//           console.error("Error writing to file:", err);
//           return;
//         }
//         console.log("New document successfully added to file");
//       }
//     );
//   });
// });

// form.js
document.getElementById("myForm").addEventListener("submit", function (event) {
  // Prevent the default form submission behavior
  event.preventDefault();

  // Get the form data
  const formData = new FormData(event.target);

  // Convert FormData to a simple object
  const newDocument = {};
  formData.forEach((value, key) => {
    newDocument[key] = value;
  });

  // Log the form data to the console
  console.log(newDocument);

  // Create a Blob from the newDocument object
  const blob = new Blob([JSON.stringify(newDocument, null, 2)], {
    type: "application/json",
  });

  // Create a link element
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "data.json"; // Specify the file name

  // Append to the document and trigger the download
  document.body.appendChild(link);
  link.click();

  // Clean up and remove the link
  document.body.removeChild(link);
});
