//dependencies
const express = require("express");
const dotenv = require("dotenv").config();
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const session = require("express-session");
const uniqid = require("uniqid");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary");
const { Session } = require("inspector");
const { request } = require("http");
const bcrypt = require("bcrypt");
const treasureId = "64eb8ee871fee0b6c628fac3";
//schemas
const {
  BUYLAND,
  SELLAND,
  INVENTORY,
  INCMOINGINSTALLMENTS,
  TREEASURE,
  TRANSACTIONHISTORY,
  OUTGOINGINTSTALLMENT,
  SURVEY,
  MONTHLYREPORT,
  DEPOSITS,
  USER,
  WITHDRAWLS,
  LIKES,
} = require("./modules/schema.js");

//Database Configuration

async function initialisationPhase() {
  mongoose
    .connect(
      process.env.URI
    )
    .then(function () {
      console.log("You've made a succefull connection to the database......");
    });
  let findTreasure = await TREEASURE.findById(treasureId);
  if (!findTreasure) {
    const createTreasure = new TREEASURE({
      _id: "64eb8ee871fee0b6c628fac3",
      incomingFunds: 0,
      purchases: 0,
      sale: 0,
      mainId: "5yvi78uolltr8lir",
      __v: 0,
      outGoingFunds: 0,
      overAllBalance: 0,
      profit: 0,
      totallAssets: 0,
    });
    await createTreasure
      .save()
      .then(() => console.log("Database initalised !"));
  }
}

initialisationPhase();
//App Configuration
const app = express();
// middlewares
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 60 * 1000 }, // The login timeout is set to 30 minutes.You can modify it by changing the figure "30" in the cookie maxAge query...
  })
);
cloudinary.config({
  cloud_name: "dkscouusb",
  api_key: "363549551425893",
  api_secret: "ZNsKnuY28UhpL8kd4k6HgLvTVX4",
});
//controllers
const bulLandController = require("./controllers/buyLandController.js");
const sellLandController = require("./controllers/sellLandController.js");
const surveyController = require("./controllers/survey.js");
const installmentsController = require("./controllers/installmentsController.js");
const fundsController = require("./controllers/fundsController.js");

const soldGallery = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/uploads/sold/gallery");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});
const boughtGallery = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/uploads/bought/gallery");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});

const boughtDocuments = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/uploads/bought/documnents");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});
const soldDocuments = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/uploads/bought/gallery");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});

app.get("/", async function (req, res) {
  if (req.session.userStatus != "authorised") {
    res.redirect("/login?message=Please Login");
  } else {
    if (req.session.user.role != "superUser") {
      res.redirect("/login?message=Please login as a super user");
    } else {
      try {
        const inventory = await INVENTORY.find({});
        const treasure = await TREEASURE.findById("64eb8ee871fee0b6c628fac3");
        const transactionHistoryLength = (await TRANSACTIONHISTORY.find({}))
          .length;
        const transactionHistory = await TRANSACTIONHISTORY.find({})
          .sort({ counter: -1 })
          .limit(4);
        const buyLand = await BUYLAND.find({}).sort({ counter: -1 }).limit(3);
        const sellLand = await SELLAND.find({}).sort({ counter: -1 }).limit(3);
        let inOut = await MONTHLYREPORT.findOne({
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
        });
        let params = {
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
        };
        if (!inOut) {
          const newMonthlyReport = new MONTHLYREPORT({
            counter: (await MONTHLYREPORT.find({})).length + 1,
            deposits: 0,
            year: params.year,
            month: params.month,
            purchases: 0,
            sales: 0,
            withdrawl: 0,
            visits: 0,
            profit: 0,
          });
          await newMonthlyReport.save();
          inOut = {
            deposits: 0,
            year: newDate.getFullYear(),
            month: newDate.getMonth() + 1,
            purchases: 0,
            sales: 0,
            withdrawl: 0,
            visits: 0,
            profit: 0,
          };
        }
        const usersCount = await (await USER.find({})).length;
        res.render("index", {
          pageName: "Home-Property Go",
          inventory: inventory,
          treasure: treasure,
          transactionHistory: transactionHistory,
          buyLand: buyLand,
          sellLand: sellLand,
          inOut,
          installmentsCount:
            (await OUTGOINGINTSTALLMENT.find({})).length +
            (await INCMOINGINSTALLMENTS.find({})).length,
          transactionHistoryLength,
          user: req.session.user,
          usersCount,
        });
      } catch (e) {
        res.redirect("/?message=" + e.message);
      }
    }
  }
});

app.post("/admin/survey/post", async function (req, res) {
  if (req.session.userStatus != "authorised") {
    res.redirect("/login?message=Please Login");
  } else {
    if (req.session.user.role != "superUser") {
      res.redirect("/login?message=Please login as a super user");
    } else {
      try {
        let user = req.session.user;
        await surveyController.takeSurvey(req, res, user);
      } catch (e) {
        console.log(e);
        res.redirect("/admin/report?message=" + e.message);
      }
    }
  }
});

app.get("/admin/buyLand", async function (req, res) {
  if (req.session.userStatus != "authorised") {
    res.redirect("/login?message=Please Login");
  } else {
    if (req.session.user.role != "superUser") {
      res.redirect("/login?message=Please login as a super user");
    } else {
      try {
        const treasure = await TREEASURE.findById("64eb8ee871fee0b6c628fac3");
        console.log(treasure);
        res.render("buyLand", {
          treasure: treasure,
          pageName: "Buy Land",
          user: req.session.user,
        });
      } catch (e) {
        res.redirect("/?message=" + e.message);
      }
    }
  }
});

app.post(
  "/admin/buyLand",
  boughtGallery.array("gallery"),
  async function (req, res) {
    if (req.session.userStatus != "authorised") {
      res.redirect("/login?message=Please Login");
    } else {
      if (req.session.user.role != "superUser") {
        res.redirect("/login?message=Please login as a super user");
      } else {
        try {
          let user = req.session.user;

          await bulLandController.buyLand(req, res, user);
        } catch (e) {
          res.redirect("/?message=" + e.message);
        }
      }
    }
  }
);

app.get("/admin/inventory/:buySchemaId/sellLand", async function (req, res) {
  if (req.session.userStatus != "authorised") {
    res.redirect("/login?message=Please Login");
  } else {
    if (req.session.user.role != "superUser") {
      res.redirect("/login?message=Please login as a super user");
    } else {
      try {
        const inventory = await INVENTORY.findOne({
          buySchemaId: req.params.buySchemaId,
        });
        const buyLand = await BUYLAND.findOne({
          uniqueId: req.params.buySchemaId,
        });
        const soldLand = await SELLAND.findOne({
          buySchemaId: req.params.buySchemaId,
        });
        let incomingInstallments = [];
        if (inventory.status === "SOLD") {
          let allInstallments = await INCMOINGINSTALLMENTS.find({
            buySchemaId: req.params.buySchemaId,
          });
          allInstallments.forEach((installment) =>
            incomingInstallments.push(installment)
          );
        }
        console.log(incomingInstallments);
        const landStatus = await OUTGOINGINTSTALLMENT.find({
          buySchemaId: req.params.buySchemaId,
        });
        let unpaidInstallments = 0;
        let installmentsWorth = 0;
        landStatus.forEach((land) => {
          if (land.status != "Paid") {
            unpaidInstallments += 1;
            installmentsWorth += land.expectedAmount;
          }
        });
        res.render("sellLand", {
          pageName: "Sell " + buyLand.landName,
          inventory: inventory,
          landDetails: buyLand,
          soldLand: soldLand,
          incomingInstallments,
          unpaidInstallments,
          installmentsWorth,
          user: req.session.user,
        });
      } catch (e) {
        res.redirect("/admin/inventory?message=" + e.message);
      }
    }
  }
});

app.post(
  "/admin/inventory/:buySchemaId/sellLand",
  soldDocuments.array("docs"),
  async function (req, res) {
    if (req.session.userStatus != "authorised") {
      res.redirect("/login?message=Please Login");
    } else {
      if (req.session.user.role != "superUser") {
        res.redirect("/login?message=Please login as a super user");
      } else {
        try {
          let user = req.session.user;

          await sellLandController.sellLand(req, res, user);
        } catch (e) {
          res.redirect("/admin/inventory?message=" + e.message);
        }
      }
    }
  }
);

//inventory
app.get("/admin/inventory", async function (req, res) {
  if (req.session.userStatus != "authorised") {
    res.redirect("/login?message=Please Login");
  } else {
    try {
      const inventory = await INVENTORY.find({});
      res.render("inventory", {
        inventory: inventory,
        pageName: "Inventory-Property Go",
        user: req.session.user,
      });
    } catch (e) {
      res.redirect("/admin/inventory?message=" + e.message);
    }
  }
});

app.get("/admin/inventory/:uniqId/delete", async function (req, res) {
  if (req.session.userStatus != "authorised") {
    res.redirect("/login?message=Please Login");
  } else {
    if (req.session.user.role != "superUser") {
      res.redirect("/login?message=Please login as a super user");
    } else {
      try {
        const buyLandDocument = await BUYLAND.findOne({
          uniqueId: req.params.uniqId,
        });

        if (!buyLandDocument) {
          return res.status(404).json({ error: "Document not found" });
        }

        // Delete images from Cloudinary
        for (const imageUrl of buyLandDocument.gallery) {
          const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract public ID
          await cloudinary.uploader.destroy(publicId); // Delete image from Cloudinary
        }

        await INVENTORY.findOneAndDelete({ buySchemaId: req.params.uniqId });
        await BUYLAND.findOneAndDelete({ uniqueId: req.params.uniqId });

        return res.status(200).json({
          message: "Document and associated files deleted successfully",
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "An error occurred" });
      }
    }
  }
});
//inventory
app.get("/admin/inventory/:uniqueId/viewLand", async function (req, res) {
  if (req.session.userStatus != "authorised") {
    res.redirect("/login?message=Please Login");
  } else {
    try {
      const id = req.params.uniqueId;
      const outGoingInstallments = await OUTGOINGINTSTALLMENT.find({
        buySchemaId: id,
      });
      const landDetails = await BUYLAND.findOne({ uniqueId: id });
      const soldLand = await SELLAND.findOne({ uniqueId: id });
      const inventory = await INVENTORY.findOne({ uniqueId: id });
      res.render("view", {
        pageName: "View" + landDetails.landName,
        user: req.session.user,

        landDetails,
        soldLand,
        inventory,
        outGoingInstallments,
      });
    } catch (e) {
      res.redirect("/admin/inventory/" + id + "/viewLand?message=" + e.message);
    }
  }
});

app.get("/admin/transactions/history", async (req, res) => {
  if (req.session.userStatus != "authorised") {
    res.redirect("/login?message=Please Login");
  } else {
    if (req.session.user.role != "superUser") {
      res.redirect("/login?message=Please login as a super user");
    } else {
      try {
        const transactionHistory = await TRANSACTIONHISTORY.find({}).sort({
          counter: -1,
        });
        const treasure = await TREEASURE.findById("64eb8ee871fee0b6c628fac3");
        res.render("transactions", {
          transactionHistory,
          treasure,
          user: req.session.user,

          pageName: "Transaction History",
        });
      } catch (e) {
        res.redirect("/admin/transactions/history?message" + e.message);
      }
    }
  }
});

app.get("/admin/installments/outgoing/", async function (req, res) {
  if (req.session.userStatus != "authorised") {
    res.redirect("/login?message=Please Login");
  } else {
    if (req.session.user.role != "superUser") {
      res.redirect("/login?message=Please login as a super user");
    } else {
      try {
        const outGoingInstallments = await OUTGOINGINTSTALLMENT.find({}).sort({
          counter: -1,
        });
        res.render("outgoinginstallment", {
          user: req.session.user,

          outGoingInstallments,
          pageName: "Out going installments",
        });
      } catch (e) {
        res.redirect("/admin/installments/outgoing?message" + e.message);
      }
    }
  }
});
app.get("/admin/installments/incoming/", async function (req, res) {
  if (req.session.userStatus != "authorised") {
    res.redirect("/login?message=Please Login");
  } else {
    const incomingInstallment = await INCMOINGINSTALLMENTS.find({}).sort({
      counter: -1,
    });
    res.render("installments", {
      incomingInstallment,
      user: req.session.user,

      pageName: "Out going installments",
    });
  }
});
app.post(
  "/admin/installments/og/:id/submit",
  soldDocuments.single("reciept"),
  async function (req, res) {
    if (req.session.userStatus != "authorised") {
      res.redirect("/login?message=Please Login");
    } else {
      if (req.session.user.role != "superUser") {
        res.redirect("/login?message=Please login as a super user");
      } else {
        try {
          await installmentsController.submitInstallment(req, res);
          res.redirect("back");
        } catch (e) {
          res.redirect(
            "/admin/inventory/" +
              req.params.id +
              "/viewLand?message=" +
              e.message
          );
        }
      }
    }
  }
);
app.post(
  "/admin/installments/ic/:id/submit",
  soldDocuments.single("reciept"),
  async function (req, res) {
    if (req.session.userStatus != "authorised") {
      res.redirect("/login?message=Please Login");
    } else {
      if (req.session.user.role != "superUser") {
        res.redirect("/login?message=Please login as a super user");
      } else {
        try {
          await installmentsController.submitIncomingInstallment(req, res);
          res.redirect("back");
        } catch (e) {
          res.redirect(
            "/admin/inventory/" +
              req.params.id +
              "/sellLand?message=" +
              e.message
          );
        }
      }
    }
  }
);

app.get("/admin/report", async function (req, res) {
  if (req.session.userStatus != "authorised") {
    res.redirect("/login?message=Please Login");
  } else {
    const survey = await SURVEY.find({}).sort({ counter: -1 });

    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const allMonths = await MONTHLYREPORT.find({}).sort({ counter: -1 });
    const monthlyReport = await MONTHLYREPORT.findOne({
      month: month,
      year: year,
    });
    res.render("report", {
      user: req.session.user,

      survey,
      monthlyReport,
      pageName: "Success Tracker",
      allMonths,
    });
  }
});

app.post("/admin/withdrawFunds", async function (req, res) {
  if (req.session.userStatus != "authorised") {
    res.redirect("/login?message=Please Login");
  } else {
    if (req.session.user.role != "superUser") {
      res.redirect("/login?message=Please login as a super user");
    } else {
      try {
        await fundsController.withdrawFunds(req, res);
      } catch (e) {
        res.redirect("/?message=" + e.message);
      }
    }
  }
});

app.post("/admin/depositFunds", async function (req, res) {
  try {
    await fundsController.depositFunds(req, res);
  } catch (e) {
    res.redirect("/?message=" + e.message);
  }
});

app.post("/admin/inventory/:id/like", async function (req, res) {
  if (req.session.userStatus != "authorised") {
    res.redirect("/login?message=Please Login");
  } else {
    if (req.session.user.role != "superUser") {
      res.redirect("/login?message=Please login as a super user");
    } else {
      let schema = await BUYLAND.findOne({ uniqueId: req.params.id });
      let inventory = await INVENTORY.findOne({ buySchemaId: req.params.id });
      await BUYLAND.findOneAndUpdate(
        { uniqueId: req.params.id },
        { likes: schema.likes + 1 }
      ).then(() => {
        console.log("liked ❤");
      });
      await INVENTORY.findOneAndUpdate(
        { buySchemaId: req.params.id },
        { likes: inventory.likes + 1 }
      ).then(() => {
        console.log("liked ❤");
      });
      res.redirect("/admin/inventory?message=Love to hear that !");
    }
  }
});

app.get("/admin/inventory/:id/edit", async function (req, res) {
  if (req.session.userStatus != "authorised") {
    res.redirect("/login?message=Please Login");
  } else {
    if (req.session.user.role != "superUser") {
      res.redirect("/login?message=Please login as a super user");
    } else {
      const id = req.params.id;
      const outGoingInstallments = await OUTGOINGINTSTALLMENT.find({
        buySchemaId: id,
      });
      const landDetails = await BUYLAND.findOne({ uniqueId: id });
      const soldLand = await SELLAND.findOne({ uniqueId: id });
      const inventory = await INVENTORY.findOne({ uniqueId: id });
      res.render("edit", {
        user: req.session.user,

        pageName: "Edit " + landDetails.landName,
        landDetails,
        soldLand,
        inventory,
        outGoingInstallments,
      });
    }
  }
});

app.post("/admin/inventory/:id/update", async function (req, res) {
  if (req.session.userStatus != "authorised") {
    res.redirect("/login?message=Please Login");
  } else {
    if (req.session.user.role != "superUser") {
      res.redirect("/login?message=Please login as a super user");
    } else {
      const data = req.body;
      console.log(data);
      const loadata = await BUYLAND.findOne({ uniqueId: req.params.id });

      console.log(req.params.id);
      await BUYLAND.findOneAndUpdate(
        { uniqueId: req.params.id },
        {
          landName: data.landName,
          ownerName: data.partnerName,
          ownersPhoneNumber: data.partnerPhone,
          area: data.area,
          location: data.location,
          description: data.description,
        }
      );
      res.redirect("/admin/inventory/" + req.params.id + "/edit");
    }
  }
});

app.get("/login", async (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const user = await USER.findOne({ username: req.body.username });
  if (!user) {
    res.redirect("/login?error=Incorrect username");
  } else {
    let auth = await bcrypt.compare(req.body.password, user.password);
    if (!auth) {
      res.redirect("/login?error=Incorrect password");
    } else {
      req.session.userStatus = "authorised";
      req.session.userRole = user.role;
      req.session.user = user;
      if (req.session.user.role == "superUser") {
        res.redirect("/?message=Welcome back " + req.session.user.name + '!"');
      } else {
        res.redirect(
          "/admin/inventory?message=Welcome back " +
            req.session.user.name +
            '!"'
        );
      }
    }
  }
});

app.get("/signup", async (req, res) => {
  if (req.session.userStatus != "authorised") {
    res.redirect("/login?message=Please Login");
  } else {
    if (req.session.user.role != "superUser") {
      res.redirect("/login?message=Please login as a super user");
    } else {
      res.render("signup");
    }
  }
});

app.post(
  "/admin/signup/user",
  soldDocuments.single("reciept"),
  async (req, res) => {
    if (req.session.userStatus != "authorised") {
      res.redirect("/login?message=Please Login");
    } else {
      if (req.session.user.role != "superUser") {
        res.redirect("/login?message=Please login as a super user");
      } else {
        try {
          console.log(req.body);
          console.log(req.file);
          let reciept = "";
          if (req.body.role == "investor") {
            const url = await cloudinary.uploader.upload(req.file.path);
            reciept = url.secure_url;
          }
          let salt = 10;
          let hashes = [];
          let saltRounds = 10;
          bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(req.body.password, salt, function (err, hash) {
              hashes.push(hash);
            });
          });
          const newUser = new USER({
            counter: (await USER.find({})) ? (await USER.find({})).length : 1,
            username: req.body.username,
            name: req.body.firstName + " " + req.body.lastName,
            fatherName: req.body.fatherName,
            company: req.body.company,
            dateOfBirth: req.body.dob,
            age: req.body.age,
            gender: req.body.gender,
            phone: req.body.code + " " + req.body.phone,
            address: req.body.address,
            additional: req.body.additional,
            street: req.body.street,
            password: hashes[0],
            treasureId: treasureId,
            role: req.body.role,
            investmentAmount: req.body.investementAmount,
            email: req.body.email,
            company: req.body.company,
            reciept: reciept[0],
          });

          await newUser.save();
          if (req.body.role == "investor") {
            const treasure = await TREEASURE.findById(treasureId);
            await TREEASURE.findByIdAndUpdate(treasureId, {
              overAllBalance:
                treasure.overAllBalance + parseInt(req.body.investementAmount),
              investments: treasure.investments
                ? treasure.investments + parseInt(req.body.investementAmount)
                : 0 + req.body.investementAmount,
            }).then(async () => {
              const investment = new TRANSACTIONHISTORY({
                counter: (await TRANSACTIONHISTORY.find({}))
                  ? (await TRANSACTIONHISTORY.find({})).length + 1
                  : 1,
                treasureId: treasureId,
                transactionAmount: parseInt(req.body.investementAmount),
                updatedBalance:
                  treasure.overAllBalance +
                  parseInt(req.body.investementAmount),
                date: new Date().toLocaleDateString(),
                transactionMethod: "Investment",
                transactionType: "Investment",
                transactionPurpose:
                  req.body.firstName +
                  " " +
                  req.body.lastName +
                  " invested " +
                  req.body.investementAmount,
                transactionRecipient: req.session.user.name,
                transactionPerformer:
                  req.body.firstName + " " + req.body.lastName,
                reciept: reciept,
              });
              await investment.save();
            });
          }
          res.redirect(
            "/signup?message=Success the user has been added as a" +
              req.body.role
          );
        } catch (err) {
          console.log(err.message);
          if (err.message.indexOf("E11000") > -1) {
            res.redirect(
              "/signup?error=This username is already taken !"
            );
          } else {
            res.redirect("/signup?error=" + err.message);
          }
        }
      }
    }
  }
);
app.get("/admin/database", async function (req, res) {
  if (req.session.userStatus != "authorised") {
    res.redirect("/login?message=Please Login");
  } else {
    if (req.session.user.role != "superUser") {
      res.redirect("/login?message=Please login as a super user");
    } else {
      const investors = await USER.find({ role: "investor" });
      const superUser = await USER.find({ role: "superUser" });
      const viewers = await USER.find({ role: "viewer" });
      const treasure = await TREEASURE.findById(treasureId);
      res.render("database", {
        pageName: "Database @ Propertya-Go",
        user: req.session.user,
        investors: investors ? investors : [],
        superUser,
        viewers: viewers ? viewers : [],
        treasure,
      });
    }
  }
});

app.get('/projects',async function(req,res){
  res.render('projects')
})
const PORT = process.env.PORT;
app.listen(process.env.PORT || PORT, function () {
  console.log("The server is being launched on " + PORT + "...");
  setTimeout(() => {
    console.log("Server launched attemting to connect to database...");
  }, 3000);
});
