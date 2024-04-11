const mongoose = require("mongoose");
const { object } = require("webidl-conversions");

const treasureSchema = new mongoose.Schema({
  incomingFunds: { type: Number, default: 0 },
  outGoingFunds: { type: Number, default: 0 },
  overAllBalance: { type: Number, default: 0 },
  purchases: { type: Number, default: 0 },
  sale: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  totallAssets: { type: Number, default: 0 },
  investments: { type: Number, default:0},
  mainId: String,
});
const TREEASURE = mongoose.model("Treasure", treasureSchema);

const transactionHistory = new mongoose.Schema({
  counter: { type: Number, default: 0 },
  userId: String,
  treasureId: String,
  transactionAmount: Number,
  updatedBalance: Number,
  date: { type: Date, default: new Date() },
  transactionMethod: String,
  transactionType: String,
  transactionPurpose: String,
  transactionReciept: Object,
  transactionRecipient: Object || String,
  transactionPerformer: Object || String,
  buySchemaId: String,
  reciept:String
});
const TRANSACTIONHISTORY = mongoose.model(
  "transactionHistory",
  transactionHistory
);
const buyLand = new mongoose.Schema({
  counter: { type: Number, default: 1 },
  landName: String,
  uniqueId: String,
  date: { type: String, default: new Date().toLocaleDateString() },
  ownerName: Array,
  ownersPhoneNumber: Array,
  location: String,
  area: String,
  unitPrice: Number,
  NumberOfInstallments: Number,
  installmentsAmount: Array,
  installmentsDate: Array,
  amountPaid: Number,
  totallInstallmentAmount: Number,
  totall: Number,
  description: String,
  gallery: Array,
  documents: Array,
  likes: { type: Number, default: 0 },
});

const BUYLAND = mongoose.model("BUY", buyLand);

const sellLand = new mongoose.Schema({
  counter: { type: Number, default: 1 },
  landName: String,
  date: { type: String, default: new Date().toLocaleDateString() },
  buyerName: Array,
  buyerPhone: Array,
  location: String,
  area: String,
  unitPrice: Number,
  NumberOfInstallments: Number,
  installmentAmount: Array,
  installmentDate: Array,
  amountPaid: Number,
  totallInstallmentAmount: Number,
  totall: Number,
  description: String,
  documents: Array,
  documents: Array,
  buySchemaId: String,
  sellSchemaId: String,
  paymentMethod: String,
  installmentsPlan: String,
  status: { type: String, default: "Open to sale" },
});

const SELLAND = mongoose.model("SELL", sellLand);

const inventory = new mongoose.Schema({
  inventoryCount: { type: Number, default: 1 },
  landName: String,
  location: String,
  area: String,
  status: String,
  unitPrice: Number,
  description: String,
  totall: Number,
  buySchemaId: String,
  sellSchemaId: String,
  images: Array,
  likes: { type: Number, default: 0 },
  status: { type: String, default: "Open to sale" },
});
const INVENTORY = mongoose.model("inventory", inventory);

const incomingInstallmentSchema = new mongoose.Schema({
  counter: { type: Number, default: 1 },
  date: { type: String, default: new Date() },
  buySchemaId: String,
  incomingInstallmentId: String,
  soldSchemaId: String,
  amountPaid: { type: Number, default: 0 },
  reciept: Object || String,
  installmentNo: Number,
  expectedDate: String,
  status: { type: String, default: "Not Paid" },
  expectedAmount: Number,
  totallInstallment: Number,
  totallInstallmentAmount: Number,
  paymentMethod: String,
  totallAmount: Number,
  installmentType: { type: String, default: "Incoming Installment" },
  reciepient: String,
  landName: String,
});
const INCMOINGINSTALLMENTS = mongoose.model(
  "IncomingInstallment",
  incomingInstallmentSchema
);
const outGoingInstallments = new mongoose.Schema({
  counter: { type: Number, default: 1 },
  date: { type: String, default: new Date() },
  reciepient: String,
  buySchemaId: String,
  incomingInstallmentId: String,
  soldSchemaId: String,
  amountPaid: { type: Number, default: 0 },
  reciept: Object || String,
  expectedDate: String,
  paymentMethod: String,
  installmentNo: Number,
  expectedAmount: Number,
  totallInstallment: Number,
  installmentType: { type: String, default: "Out-Going Installment" },
  totallInstallmentAmount: Number,
  status: { type: String, default: "Not Paid" },
  totallAmount: Number,
  landName: String,
});
const OUTGOINGINTSTALLMENT = mongoose.model(
  "outGoingInstallments",
  outGoingInstallments
);

//Non functional
const monthlyReport = new mongoose.Schema({
  counter: { type: Number, default: 1 },
  purchases: Number,
  sales: Number,
  visits: Number,
  profit: Number,
  month: Number,
  year: Number,
  date: Number,
  withdrawl: Number,
  deposits: Number,
});
const MONTHLYREPORT = mongoose.model("MONTHLYREPORT", monthlyReport);

const dailySurvey = new mongoose.Schema({
  counter: Number,
  date: { type: Date },
  month: Number,
  timeStamp: { type: String, default: new Date().toLocaleDateString("en-US") },
  year: { type: Date },
  fullDate: String,
  totallOutflow: Number,
  totallInflow: Number,
  purchases: Number,
  sales: Number,
  profit: Number,
  visits: Number,
  description: String,
  visitedSite: String,
});

const SURVEY = mongoose.model("survey", dailySurvey);

const depositFunds = new mongoose.Schema({
  timeStamp: { type: Date, default: new Date() },
  depositAmount: Number,
  counter: Number,
  purpose: String,
});

const DEPOSITS = mongoose.model("Deposit", depositFunds);
const withdrawFunds = new mongoose.Schema({
  timeStamp: { type: Date, default: new Date() },
  withdrawlAmount: Number,
  purpose: String,
  counter: Number,
});

const WITHDRAWLS = mongoose.model("Withdrawl", withdrawFunds);

const likeSchema = new mongoose.Schema({
  buySchemaId: String,
  inventoryId: String,
  likes: Number,
  landName: String,
});

const LIKES = mongoose.model("Likes", likeSchema);

const userSchema = new mongoose.Schema({
  counter: Number,
  username:{type:"string",unique:true},
  name: String,
  fatherName: String,
  dateOfBirth: String,
  age: Number,
  gender: String,
  phone: Number,
  address: String,
  code: String,
  phone: String,
  additional: String,
  street: String,
  password: String,
  treasureId: String,
  role: String,
  investmentAmount: Number,
  email: String,
  company: String,
  timeStamp: { type: Date, default: new Date() },
});

const USER = mongoose.model("User", userSchema);
module.exports = {
  BUYLAND,
  SELLAND,
  INVENTORY,
  INCMOINGINSTALLMENTS,
  TREEASURE,
  TRANSACTIONHISTORY,
  OUTGOINGINTSTALLMENT,
  MONTHLYREPORT,
  SURVEY,
  USER,
  DEPOSITS,
  WITHDRAWLS,
  LIKES,
};
