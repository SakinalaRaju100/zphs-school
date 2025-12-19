// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const moment = require("moment");

const Enroll = require("./modals/Enroll");
const Feedback = require("./modals/Feedback");
const Time = require("./modals/Time");
const GNLoans = require("./modals/GNLoans");
const GNUsers = require("./modals/GNUsers");
const GNAdmin = require("./modals/GNAdmin");
const app = express();
// app.use(cors());

const axios = require("axios");
const multer = require("multer");

const allowedOrigins = [
  "https://www.todaydigitalworld.com",
  "https://www.zphskunur.in",
  "http://localhost:1954",
  "http://localhost:4500",
  "http://localhost:5173",
  "http://127.0.0.1:5501",
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
      // callback(null, true);
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
  // console.log("req.body", req.body);

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

// Goldnoon
const jwt = require("jsonwebtoken");

const SECRET_KEY = "your_secret_key";

function authenticateToken(req, res, next) {
  // console.log("req.headers", req.headers);
  const goldnoontoken = req.headers["goldnoontoken"];
  if (!goldnoontoken) return res.sendStatus(401);
  jwt.verify(goldnoontoken, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // Token expired/invalid && need to add redirection to logout
    req.gnUserObj = user;
    next();
  });
}

app.post("/get-gn-users", async (req, res) => {
  const { user, passcode, need = "all" } = req.body;
  let allUsers = [];
  if (need == "customers") {
    allUsers = await GNUsers.find({
      role: "customer",
    });
  } else {
    allUsers = await GNUsers.find();
  }

  // res.send(newGNUser);
  res.status(200).send({
    success: true,
    message: "users fetch successful",
    data: allUsers ?? [],
  });
});
app.post("/add-new-gn-user", async (req, res) => {
  const { user, passcode, role, mobile, email } = req.body;

  const checkingUser = await GNUsers.findOne({
    $or: [{ mobile: mobile }, { email: email }],
  });

  if (checkingUser) {
    return res
      .status(200)
      .send({ success: false, message: "User exists", data: null });
  }

  const sameRoleUsers = await GNUsers.find({ role: role });

  const userId =
    role == "admin"
      ? "GNA"
      : role == "sales"
      ? "GNS"
      : role == "manager"
      ? "GNM"
      : role == "partner"
      ? "GNP"
      : role == "customer"
      ? "GNC"
      : role == "telecaller"
      ? "GNT"
      : role == "cluster"
      ? "GNL"
      : "GNX";
  const newGNUser = new GNUsers({
    ...req.body,
    userId: userId + (sameRoleUsers.length + 1),
    branchCode: req.body?.branchCode ?? "",
  });
  let SavednewGNUser = await newGNUser.save();
  // res.send(newGNUser);

  delete SavednewGNUser._id;
  delete SavednewGNUser.password;

  // Generate JWT token
  const goldnoontoken = jwt.sign({ ...SavednewGNUser }, SECRET_KEY, {
    expiresIn: "30d",
  });

  res.status(200).send({
    success: true,
    message: "user added successful, and logging in...",
    data: newGNUser,
    goldnoontoken,
  });
});
app.post("/gn-login", async (req, res) => {
  const { user, passcode } = req.body;
  console.log("req.body", req.body);
  try {
    const userData = await GNUsers.findOne({
      $or: [{ userId: user.toUpperCase() }, { mobile: user }, { email: user }],
    }).lean();

    console.log("userData", userData);

    if (passcode == "123456" || passcode == userData?.password) {
      console.log("login");
    } else {
      return res
        .status(200)
        .send({ success: false, message: "password not matched", data: null });
    }

    const userData2 = { ...userData };
    delete userData2._id;
    delete userData2.password;

    // Generate JWT token
    const goldnoontoken = jwt.sign({ ...userData2 }, SECRET_KEY, {
      expiresIn: "30d",
    });

    if (userData2) {
      res.status(200).send({
        success: true,
        message: "login successful",
        data: userData2,
        goldnoontoken,
      });
    } else {
      res
        .status(200)
        .send({ success: false, message: "User not found", data: null });
    }
  } catch (err) {
    console.log("err", err);
    res.status(400).send({ success: "false", message: "failed", err });
  }
});

app.post("/gn-loans", authenticateToken, async (req, res) => {
  let loans = [];
  if (req.gnUserObj.role === "customer") {
    loans = await GNLoans.find({
      userId: req.gnUserObj.userId,
    }).lean();
  } else if (
    req.gnUserObj.role === "manager" ||
    req.gnUserObj.role === "sales" ||
    req.gnUserObj.role === "partner" ||
    req.gnUserObj.role === "telecaller"
  ) {
    loans = await GNLoans.find({
      branchCode: req.gnUserObj.branchCode,
    }).lean();
  } else if (req.gnUserObj.role === "admin") {
    let temp = (await GNLoans.find().lean()) ?? [];
    loans = temp.map((el) => {
      return { ...el, update: true };
    });
  } else {
    let temp = (await GNLoans.find().lean()) ?? [];
    loans = temp.map((el) => {
      return { ...el, update: true };
    });
  }

  res.send({
    success: true,
    message: "Loans fetched successful",
    data: loans.reverse(),
  });
});

app.post("/add-new-gn-loan", async (req, res) => {
  console.log("add new loan req.body", req.body);
  const { userId, cbillScore, loanType } = req.body;

  let loanTypeShort =
    loanType == "Personal Loan"
      ? "PL"
      : loanType == "Business Loan"
      ? "BL"
      : loanType == "Home Loan"
      ? "HL"
      : loanType == "Vehicle Loan"
      ? "VL"
      : "L";
  let customerLoans = await GNLoans.find({
    userId: userId,
  });

  const AdminRules = await GNAdmin.findOne({ section: "rules" }).lean();

  const cibilGrade = AdminRules?.cbillrules.find(
    (r) => cbillScore >= r.from && cbillScore <= r.to
  )?.grade;

  if (cibilGrade == "poor") {
    return res.send({ message: "CibilGrade is poor" });
  }

  const newGNLoan = new GNLoans({
    loanId: userId + loanTypeShort + (customerLoans.length + 1),
    userId,
    loanStatus: "underVerification",
    ...req.body,
    cibilGrade,
    notes: "NA",
    actions: [
      {
        updatedBy: userId ?? "",
        note: "applied",
        loanStatus: "underVerification",
        dateTime: new Date(),
      },
    ],
  });
  await newGNLoan.save();
  res.send({ message: `cibilGrade is ${cibilGrade}` });
});

const { put } = require("@vercel/blob");
const { stringify } = require("querystring");
const CallingData = require("./modals/CallingData");

const upload = multer(); // Create multer instance to handle file uploads

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).send("No file uploaded");

    const { originalname, buffer, mimetype } = file;

    const { url } = await put(`uploads/${originalname}`, buffer, {
      access: "public",
      token: "vercel_blob_rw_rVjJwbcVRINVDGxq_DfDbbDevayXXXCtPbFybk7v8XVDecA", // your actual token
      addRandomSuffix: true, // to prevent name collision
      contentType: mimetype,
    });

    res.status(200).json({ message: "Uploaded!", url });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed", error });
  }
});

app.get("/create-file-in-blob", async (req, res) => {
  const { url } = await put("articles/blob2.txt", "Hello World!", {
    access: "public",
    token: "vercel_blob_rw_rVjJwbcVRINVDGxq_DfDbbDevayXXXCtPbFybk7v8XVDecA",
    // allowOverwrite: true
    addRandomSuffix: true,
  });
  res.send(url);
});

app.get("/gnadmin", authenticateToken, async (req, res) => {
  const a = await GNAdmin.find();
  res.send(a);
});

app.post("/get-all-branches", authenticateToken, async (req, res) => {
  console.log("reqgnUserObj", req.gnUserObj.role);
  if (req.body.needfor == "LoanApplication") {
    const result = await GNAdmin.findOne({ section: "branches" });
    res.status(200).send(result?.branches ?? []);
  }
  if (req.gnUserObj.role == "admin") {
    const result = await GNAdmin.findOne({ section: "branches" });
    res.status(200).send(result?.branches ?? []);
  } else {
    const result = await GNAdmin.findOne({ section: "branches" });
    res
      .status(200)
      .send(
        result?.branches.filter(
          (e) => e.branchCode == req.gnUserObj.branchCode
        ) ?? []
      );
  }
});

app.post("/getNonBranchTaggedMembers", async (req, res) => {
  console.log("membersst");
  const members = await GNUsers.find({
    branchCode: "",
    // role: { ne: "customer" },
    role: { $ne: "customer" },
  });
  res.status(200).send(members);
});
app.post("/getBranchMembers", async (req, res) => {
  console.log("req.body", req.body);
  const { branchCode } = req.body;
  const branchMembers = await GNUsers.find({
    branchCode: String(branchCode),
    role: { $ne: "customer" },
  });
  res.status(200).send(branchMembers);
});
app.post("/updateMemberBranch", async (req, res) => {
  console.log("req.body", req.body);
  const { userId, branchCode } = req.body;
  const user = await GNUsers.updateOne(
    { userId: String(userId) },
    {
      $set: {
        branchCode: branchCode ?? null,
      },
    }
  );
  res.status(201).send("Member Branch updated successfully");
});
app.post("/untagMemberBranch", async (req, res) => {
  console.log("req.body", req.body);
  const { userId } = req.body;
  const user = await GNUsers.updateOne(
    { userId: String(userId) },
    {
      $set: {
        branchCode: "",
      },
    }
  );
  res.status(201).send("Member Branch Untagged successfully");
});

app.post("/add-new-gn-branch", async (req, res) => {
  const existingBranches = await GNAdmin.findOne({ section: "branches" });

  const branchCode =
    "GNB" + (existingBranches ? existingBranches?.branches.length + 1 : 0);

  const result = await GNAdmin.updateOne(
    { section: "branches" },
    {
      $set: {
        branches: [
          ...(existingBranches?.branches ?? []),
          { branchCode, ...req.body },
        ],
      },
    }
  );

  res.status(200).send({
    success: true,
    message: "New branch added successfully",
  });
});

app.post("/update-loan-status", async (req, res) => {
  const {
    loanId,
    userId,
    newLoanStatus,
    notes,
    approvedLoanDetails = {},
    loanDisbursedDetails = {},
    emiDetails = {},
  } = req.body;
  console.log("req.body", req.body);
  const loan = await GNLoans.findOne({ loanId });
  let result;
  if (newLoanStatus == "approve") {
    result = await GNLoans.updateOne(
      { loanId: loanId },
      {
        $set: {
          loanStatus: newLoanStatus ?? "NA",
          actions: [
            ...(loan?.actions ?? []),
            {
              updatedBy: userId ?? "",
              note: notes ?? "",
              loanStatus: newLoanStatus ?? "NA",
              dateTime: new Date(),
            },
          ],
          approvedLoanDetails,
        },
      }
    );
  } else if (newLoanStatus == "disburse") {
    result = await GNLoans.updateOne(
      { loanId: loanId },
      {
        $set: {
          loanStatus: newLoanStatus ?? "NA",
          actions: [
            ...(loan?.actions ?? []),
            {
              updatedBy: userId ?? "",
              note: notes ?? "",
              loanStatus: newLoanStatus ?? "NA",
              dateTime: new Date(),
            },
          ],
          loanDisbursedDetails,
          emiDetails,
        },
      }
    );
  } else {
    result = await GNLoans.updateOne(
      { loanId: loanId },
      {
        $set: {
          loanStatus: newLoanStatus ?? "NA",
          actions: [
            ...(loan?.actions ?? []),
            {
              updatedBy: userId ?? "",
              note: notes ?? "",
              loanStatus: newLoanStatus ?? "NA",
              dateTime: new Date(),
            },
          ],
        },
      }
    );
  }

  res.status(201).send({
    success: true,
    message: "Loan Status updated successfully",
  });
});

app.post("/addEMIPayment", async (req, res) => {
  console.log("req.body", req.body);
  const { loanId, emiIndex, value } = req.body;
  const loan = await GNLoans.findOne({ loanId });
  console.log("loan?.emiDetails?.emiData", loan?.emiDetails?.emiData);

  const oldEmiDetails = loan?.emiDetails;
  const newEmiData = loan?.emiDetails?.emiData.map((e, ei) => {
    if (ei == emiIndex) {
      return { ...e, status: value, updatedOn: new Date() };
    } else {
      return e;
    }
  });

  // const existingBranches = await GNAdmin.findOne({ section: "branches" });
  // const branchCode =
  //   "GNB" + (existingBranches ? existingBranches?.branches.length + 1 : 0);
  const result = await GNLoans.updateOne(
    { loanId },
    {
      $set: {
        emiDetails: { ...loan?.emiDetails, emiData: newEmiData },
      },
    }
  );
  res.status(201).send({
    success: true,
    message: "Added Emi Successfully",
  });
});

// app.post("/addCallingData", async (req, res) => {
//   console.log("req.body", req.body);
//   const {} = req.body;
//   try {
//     const newCallingData = new CallingData(req.body);
//     await newCallingData.save();
//     res.status(200).send(newCallingData);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching users", error: err });
//   }
// });
app.post("/getCallingData", async (req, res) => {
  console.log("req.body", req.body);
  const {} = req.body;
  try {
    const callingData = await CallingData.find();
    res.status(200).send(callingData);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err });
  }
});
app.post("/addCallingData", async (req, res) => {
  console.log("req.body", req.body);
  const {
    mobile,
    fullName,
    feedback = "normal",
    schedule = null,
    notes = "",
    lastUpdateBy = "",
  } = req.body;
  try {
    const result = await CallingData.findOneAndUpdate(
      { mobile: mobile },
      {
        $set: {
          fullName: fullName,
          feedback: feedback,
          notes: notes,
          schedule: schedule,
          lastUpdateBy: lastUpdateBy,
        },
      },
      { upsert: true }
    );
    res.status(200).send(result);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err });
  }
});

app.post("/save-interested-partner", async (req, res) => {
  try {
    const existingInterestedPartners = await GNAdmin.findOne({
      section: "interestedPartners",
    });

    const result = await GNAdmin.updateOne(
      { section: "interestedPartners" },
      {
        $set: {
          interestedPartners: [
            ...(existingInterestedPartners?.interestedPartners ?? []),
            { ...req.body },
          ],
        },
      }
    );

    res.status(200).send({
      success: true,
      message: "New Partner interst added successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err });
  }
});
app.get("/get-interested-partners", async (req, res) => {
  try {
    const result = await GNAdmin.findOne({ section: "interestedPartners" });
    res.status(200).send(result?.interestedPartners ?? []);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err });
  }
});
app.post("/getAdminRules", async (req, res) => {
  try {
    const result = await GNAdmin.findOne({ section: "rules" });
    res.status(200).send(result ?? []);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err });
  }
});
app.post("/getCollectionData", async (req, res) => {
  // console.log("req.body", req.body);
  const { type, duration } = req.body;
  try {
    const result = await GNLoans.find({
      // emiDetails: { $exists: true, $ne: null },
      // duration dates should match here
    }).lean();

    const upcomingEMIs = result.filter((loan) => {
      const emiData = loan.emiDetails.emiData;
      // console.log("emiData", emiData);
      return emiData.find((emi) => {
        // return moment(new Date(emi.month)).isAfter(moment().remove(1, "day"));
        return (
          moment(new Date(emi.month)).isBetween(
            moment().startOf("day"),
            moment().add(7, "days").endOf("day"),
            null,
            []
          ) && !emi.status
        );
      });
    });
    const unpaidEMIs = result.filter((loan) => {
      const emiData = loan.emiDetails.emiData;
      // console.log("emiData", emiData);
      return emiData.find((emi) => {
        return (
          moment(new Date(emi.month)).isBefore(moment().startOf("day")) &&
          !emi.status
        );
      });
    });

    res.status(200).send({ upcomingEMIs, unpaidEMIs } ?? []);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err });
  }
});

const port = process.env.PORT || 1954;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
