
const {TRANSACTIONHISTORY,BUYLAND,OUTGOINGINTSTALLMENT,TREEASURE,SELLAND,INCMOINGINSTALLMENTS}=require('../modules/schema');
const cloudinary=require('cloudinary');
async function submitInstallment(req,res){
    const buyLand = await BUYLAND.find({ uniqueId: req.params.id });

    let url = null;
    const result = await cloudinary.uploader.upload(req.file.path);
    url = result.secure_url;
    console.log(url);
    const update = {
      reciepient: req.body.reciepient,
      amountPaid: req.body.amount,
      date: req.body.date,
      status: "Paid",
      reciept: url,
    };
    await OUTGOINGINTSTALLMENT.findByIdAndUpdate(req.params.id, update).then(
      async () => {
        const treasure = await TREEASURE.findById("64eb8ee871fee0b6c628fac3");
        console.log(treasure);
        const updateTreasure = {
          outGoingFunds:
            parseInt(treasure.outGoingFunds) - parseInt(req.body.amount),
          overAllBalance: treasure.overAllBalance - parseInt(req.body.amount),
        };
        await TREEASURE.findByIdAndUpdate(
          "64eb8ee871fee0b6c628fac3",
          updateTreasure
        );
        const transaction = new TRANSACTIONHISTORY({
          counter: (await TRANSACTIONHISTORY.find({})).length + 1,
          treasureId: "64eb8ee871fee0b6c628fac3",
          transactionAmount: req.body.amount,
          updatedBalance: treasure.overAllBalance - parseInt(req.body.amount),
          transactionMethod: req.body.transactionMethod,
          transactionType: "Out Going",
          transactionPurpose:
            "Installment paid on " + req.body.date + " for " + buyLand.landName,
          transactionReciept: url,
          transactionRecipient: req.body.reciepient,
          transactionPerformer: "You",
          buySchemaId: req.params.id,
        });
        transaction
          .save()
          .then(() => console.log("Installment Paid & Transaction completed"));
      }
    );
}

async function submitIncomingInstallment(req,res){
    const sellLand = await SELLAND.find({ buySchemaId: req.params.id });

    let url = null;
    const result = await cloudinary.uploader.upload(req.file.path);
    url = result.secure_url;
    console.log(url);
    const update = {
      reciepient: req.body.reciepient,
      amountPaid: req.body.amount,
      date: req.body.date,
      status: "Paid",
      reciept: url,
    };
    await INCMOINGINSTALLMENTS.findByIdAndUpdate(req.params.id, update).then(
      async () => {
        const treasure = await TREEASURE.findById("64eb8ee871fee0b6c628fac3");
        console.log(treasure);
        const updateTreasure = {
          incomingFunds:
            parseInt(treasure.incomingFunds) - parseInt(req.body.amount),
          overAllBalance: treasure.overAllBalance + parseInt(req.body.amount),
        };
        await TREEASURE.findByIdAndUpdate(
          "64eb8ee871fee0b6c628fac3",
          updateTreasure
        );
        const transaction = new TRANSACTIONHISTORY({
          counter: (await TRANSACTIONHISTORY.find({})).length + 1,
          treasureId: "64eb8ee871fee0b6c628fac3",
          transactionAmount: req.body.amount,
          updatedBalance: treasure.overAllBalance + parseInt(req.body.amount),
          transactionMethod: req.body.transactionMethod,
          transactionType: "In-Coming",
          transactionPurpose:
            "Installment recieved on " +
            req.body.date +
            " for " +
            sellLand.landName,
          transactionReciept: url,
          transactionRecipient: "You",
          paymentMethod: req.body.paymentMethod,
          transactionPerformer: req.body.paire,
          buySchemaId: req.params.id,
        });
        transaction
          .save()
          .then(() => console.log("Installment Paid & Transaction completed"));
      }
    );
}
module.exports={submitInstallment,submitIncomingInstallment}