const {
  BUYLAND,
  SELLAND,
  INVENTORY,
  INCMOINGINSTALLMENTS,
  TREEASURE,
  TRANSACTIONHISTORY,
  OUTGOINGINTSTALLMENT,
  MONTHLYREPORT,
  SURVEY,
  DEPOSITS,
  WITHDRAWLS,
} = require("../modules/schema");
const treasureId = "64eb8ee871fee0b6c628fac3";



async function withdrawFunds(req,res){
    const widthdrawl = new WITHDRAWLS({
    withdrawlAmount: req.body.withdrawl,
    purpose: req.body.purpose,
    counter: (await WITHDRAWLS.find({}))
      ? (await WITHDRAWLS.find({})).length + 1
      : 1,
  });
  await widthdrawl.save().then(async () => {
    const treasure = await TREEASURE.findById(treasureId);
    const updateTreasure = {
      overAllBalance: treasure.overAllBalance - req.body.withdrawl,
    };
    await TREEASURE.findByIdAndUpdate(treasureId, updateTreasure);
    const params = {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    };
    const report = await MONTHLYREPORT.findOne({
      year: params.year,
      month: params.month,
    });
    console.log(report);
    const update = {
      withdrawl:
        (report.withdrawl ? report.withdrawl : 0) +
        parseInt(req.body.withdrawl),
      purpose: req.body.purpse,
    };
    await MONTHLYREPORT.findOneAndUpdate(
      {
        year: params.year,
        month: params.month,
      },
      update
    ).then(async () => {
      const netBalance =
        parseInt(treasure.overAllBalance) - parseInt(req.body.withdrawl);
      console.log(req.body.widthdrawl);
      const newTransaction = new TRANSACTIONHISTORY({
        counter: (await TRANSACTIONHISTORY.find({}))
          ? (await TRANSACTIONHISTORY.find({})).length + 1
          : 0,
        userId: req.session.userId,
        treasureId: treasureId,
        transactionAmount: parseInt(req.body.withdrawl),
        updatedBalance: netBalance,
        transactionMethod: "Withdrawl",
        transactionType: "Withdrawl",
        transactionPurpose: req.body.purpose,
      });

      await newTransaction.save();
    });
  });
  res.redirect("/?message=Withdrawal Successful");
}

async function depositFunds(req,res){
    const deposit = new DEPOSITS({
      depositAmount: req.body.depositAmount,
      purpose: req.body.purpose,
      counter: (await DEPOSITS.find({}))
        ? (await DEPOSITS.find({})).length + 1
        : 1,
    });
    await deposit.save().then(async () => {
      const treasure = await TREEASURE.findById(treasureId);
      const updateTreasure = {
        overAllBalance:
          treasure.overAllBalance + parseInt(req.body.depositAmount),
      };
      console.log(updateTreasure);
      await TREEASURE.findByIdAndUpdate(treasureId, updateTreasure);
      const params = {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      };
      const report = await MONTHLYREPORT.findOne({
        year: params.year,
        month: params.month,
      });
      const update = {
        deposits: report.deposits + parseInt(req.body.depositAmount),
      };
      console.log(update);
      await MONTHLYREPORT.findOneAndUpdate(
        {
          year: params.year,
          month: params.month,
        },
        update
      ).then(async () => {
        const newTransaction = new TRANSACTIONHISTORY({
          counter: (await TRANSACTIONHISTORY.find({}))
            ? (await TRANSACTIONHISTORY.find({})).length + 1
            : 0,
          userId: req.session.userId,
          treasureId: treasureId,
          transactionAmount: parseInt(req.body.depositAmount),
          updatedBalance:
            treasure.overAllBalance + parseInt(req.body.depositAmount),
          transactionMethod: "Deposit",
          transactionType: "Deposit",
          transactionPurpose: req.body.purpose,
        });
        await newTransaction.save();
      });
    });
    res.redirect("/?message=Deposit Successful");
}
module.exports = { withdrawFunds, depositFunds };