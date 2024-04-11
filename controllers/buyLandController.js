const { INVENTORY, SELLAND, BUYLAND, TREEASURE,TRANSACTIONHISTORY,INCMOINGINSTALLMENTS,OUTGOINGINTSTALLMENT } = require("../modules/schema");
const path = require("path");
const cloudinary = require("cloudinary");
const uniqId = require("uniqid");

async function buyLand(req, res) {
  try {
    const parsedData = req.body;
    let count = null;
    if (!(await BUYLAND.find({})).length > 1) {
      count = 1;
    } else {
      count = (await BUYLAND.find({}).length) + 1;
    }

    let owners = 0;
    let ownersPhoneNumber = 0;
    if ((req.body.ownerCount = 1)) {
      owners = [];
      ownersPhoneNumber = [];
      owners.push(req.body.ownerName);
      ownersPhoneNumber.push(req.body.phoneNumber);
    } else {
      owners = 0;
      ownersPhoneNumber = 0;
      owners = parsedData.ownerName;
      ownersPhoneNumber = parsedData.phoneNumber;
    }

    let galleryUrls = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path);
      galleryUrls.push(result.secure_url);
    }
    let counter = 0;
    if (
      (await BUYLAND.find({})).length < 1 ||
      (await BUYLAND.find({})) == null
    ) {
      counter = 1;
    } else {
      counter = (await BUYLAND.find({})).length + 1;
    }
    const newLand = new BUYLAND({
      counter: counter,
      uniqueId: uniqId(),
      landName: parsedData.landName,
      ownerName: owners,
      ownersPhoneNumber: ownersPhoneNumber,
      location: parsedData.location,
      area: parsedData.area,
      unitPrice: parsedData.unitPrice,
      installmentsAmount: parsedData.installmentAmount,
      installmentsDate: parsedData.installmentDate,
      amountPaid: parsedData.amountPaid,
      totallInstallmentAmount: parsedData.totallInstallmentsAmount,
      totall: parsedData.totall,
      description: parsedData.description,
      gallery: galleryUrls,
    });

    await newLand.save().then(async () => {
      let i=0;
      newLand.installmentsAmount.forEach(async(installment)=>{
      const outGoingInstallments = new OUTGOINGINTSTALLMENT({
        counter: (await OUTGOINGINTSTALLMENT.find({}))
          ? (await OUTGOINGINTSTALLMENT.find({})).length + 1
          : 1,
        buySchemaId: newLand.uniqueId,
        landName:parsedData.landName,
        expectedDate: newLand.installmentsDate[i],
        expectedAmount: installment,
        installmentNo: i+1,
        totallInstallmentAmount: newLand.totallInstallmentAmount,
        totallAmount: newLand.totall,
      });
      await outGoingInstallments.save().then(()=> console.log("Installment no" + i+ " registered.."));
      i++;
})
      const newInventory = new INVENTORY({
        inventoryCount: (await INVENTORY.find({})).length + 1,
        landName: newLand.landName,
        location: newLand.location,
        area: newLand.area,
        unitPrice: newLand.unitPrice,
        description: newLand.description,
        totall: newLand.totall,
        buySchemaId: newLand.uniqueId,
        images: galleryUrls,
      });

      await newInventory
        .save()
        .then(() => {
          console.log(newLand);
          console.log(req.body);
          console.log(newInventory);
        })
        .then(async () => {
          const data = await TREEASURE.findById("64eb8ee871fee0b6c628fac3");
          const updateTreasure = {
            purchases: data.purchases + +parsedData.totall,
            overAllBalance: data.overAllBalance - parsedData.amountPaid,
            outGoingFunds:
              data.outGoingFunds + (parsedData.totall - parsedData.amountPaid),
            totallAssets: parseInt(data.totallAssets) + parseInt(parsedData.totall),
          };
          await TREEASURE.findByIdAndUpdate(
            "64eb8ee871fee0b6c628fac3",
            updateTreasure
          )
          const newTransaction = new TRANSACTIONHISTORY({
            counter: (await TRANSACTIONHISTORY.find({})) ? (await TRANSACTIONHISTORY.find({})).length +1 : 1,
            // userId: req.session.userId,
            treasureId: "64eb8ee871fee0b6c628fac3",
            buySchemaId:newLand.uniqueId,
            transactionAmount: parseInt(parsedData.amountPaid),
            updatedBalance: updateTreasure.overAllBalance,
            transactionMethod: parsedData.paymentMethod,
            transactionType: "Out Going",
            transactionPurpose: "You purchased the " + parsedData.landName,
            transactionReciept: galleryUrls[galleryUrls.length -1],
            transactionRecipient: newLand.ownerName,
          })
          await newTransaction.save()
            .then(() => console.log("Treasure Updated Successfully"))
            .then(() => {
              console.log("New Treasure");
              console.log(updateTreasure);
            });
          //   const initalTreasure = new TREEASURE({
          //     purchases: parsedData.totall,
          //     totall: parsedData.amountPaid - parsedData.totall,
          //     debts: parsedData.totall - parsedData.amountPaid,
          //     mainId:uniqId()
          //   });
          //   await initalTreasure.save()
        });
    });

    res.redirect("/");
  } catch (e) {
    console.log(e);
    res.status(500).send("An error occurred during upload.");
  }
}
module.exports = { buyLand };
