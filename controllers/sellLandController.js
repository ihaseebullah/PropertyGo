const {
  INVENTORY,
  SELLAND,
  BUYLAND,
  TREEASURE,
  TRANSACTIONHISTORY,
  INCMOINGINSTALLMENTS,
} = require("../modules/schema");
const path = require("path");
const cloudinary = require("cloudinary");
const uniqId = require("uniqid");
async function sellLand(req, res) {
  const Availability = await INVENTORY.findOne({
    buySchemaId: req.params.buySchemaId,
  });
  if (Availability.status == "SOLD") {
    res.json({
      message: "This item is not available to sale",
    });
  } else {
    try {
      let docsUrl = [];
      const buySchemaId = req.params.buySchemaId;

      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        docsUrl.push(result.secure_url);
      }

      let counter = 0;
      const sellandCount = await SELLAND.countDocuments();

      if (sellandCount < 1 || sellandCount == null) {
        counter = 1;
      } else {
        counter = sellandCount + 1;
      }

      const sellLand = new SELLAND({
        counter: counter,
        landName: req.body.landName,
        area: req.body.area,
        location: req.body.location,
        buySchemaId: req.params.buySchemaId,
        unitPrice: req.body.unitPrice,
        amountPaid: req.body.amountPaid,
        totallInstallmentAmount: req.body.intallmentsWorth,
        NumberOfInstallments: req.body.installmentAmount.length,
        installmentsPlan: req.body.installmentsPlan,
        installmentAmount: req.body.installmentAmount,
        installmentDate: req.body.installmentDate,
        buyerName: req.body.buyerName,
        buyerPhone: req.body.buyerPhone,
        documents: docsUrl,
        totall: req.body.totall,
        description: req.body.description,
      });

      await sellLand.save();
      let iteration = 0;
      sellLand.installmentAmount.forEach(async (installment) => {
        const incomingInstallments = new INCMOINGINSTALLMENTS({
          counter: (await INCMOINGINSTALLMENTS.find({}))
            ? (await INCMOINGINSTALLMENTS.find({})).length + 1
            : 1,
          buySchemaId: sellLand.buySchemaId,
          expectedDate: sellLand.installmentDate[iteration],
          installmentNo: iteration + 1,
          expectedAmount: installment,
          landName:sellLand.landName,
          totallInstallment: sellLand.installmentAmount.length,
          totallInstallmentAmount: sellLand.totallInstallmentAmount,
          totallAmount: sellLand.totall,
        });
        incomingInstallments.save().then(() => {
          console.log("Installment no " + iteration + 1 + " registered...");
        });
        iteration += 1;
      });

      const updateInventory = {
        status: "SOLD",
      };

      await INVENTORY.findOneAndUpdate(
        { buySchemaId: buySchemaId },
        updateInventory
      );

      const updateBUYLAND = {
        status: "SOLD",
      };

      await BUYLAND.findOneAndUpdate({ uniqueId: buySchemaId }, updateBUYLAND);

      const data = await TREEASURE.findById("64eb8ee871fee0b6c628fac3");
      const buySchema = await BUYLAND.findOne({ uniqueId: buySchemaId });
      const totallAssets = parseInt(data.totallAssets) - buySchema.totall;
      const profit = parseInt(req.body.totall) - parseInt(buySchema.totall);

      const updateTreasure = {
        sale: data.sale + parseInt(req.body.totall),
        incomingFunds:
          data.incomingFunds +
          (parseInt(req.body.totall) - parseInt(req.body.amountPaid)),
        overAllBalance: data.overAllBalance + parseInt(req.body.amountPaid),
        profit: data.profit + profit,
        totallAssets: totallAssets,
      };

      await TREEASURE.findByIdAndUpdate(
        "64eb8ee871fee0b6c628fac3",
        updateTreasure
      );

      const newTransaction = new TRANSACTIONHISTORY({
        counter: (await TRANSACTIONHISTORY.countDocuments())
          ? (await TRANSACTIONHISTORY.countDocuments()) + 1
          : 1,
        treasureId: "64eb8ee871fee0b6c628fac3",
        buySchemaId: buySchemaId,
        transactionAmount: parseInt(req.body.amountPaid),
        updatedBalance: updateTreasure.overAllBalance,
        transactionMethod: req.body.paymentMethod,
        transactionType: "In-Coming",
        transactionPurpose: "You sold " + req.body.landName,
        transactionReciept: docsUrl[docsUrl.length - 1],
        transactionPerformer: sellLand.buyerName,
      });

      await newTransaction.save();

      console.log("Treasure has been updated successfully");
      res.redirect('back')
    } catch (error) {
      console.error("An error occurred:", error);
      // Properly handle the error, send an error response, etc.
      res
        .status(500)
        .json({ error: "An error occurred while processing the request." });
    }
  }
}

module.exports = { sellLand };
