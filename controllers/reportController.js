const {
  INVENTORY,
  SELLAND,
  BUYLAND,
  TREEASURE,
  TRANSACTIONHISTORY,
  INCMOINGINSTALLMENTS,
  OUTGOINGINTSTALLMENT,
  MONTHLYREPORT
} = require("../modules/schema");

async function markReport() {
    if(new Date().getDate()==1){
      const treasure = await TREEASURE.findById("64eb8ee871fee0b6c628fac3");
      const totallDealing = treasure.sale + treasure.purchases;
      const report = new MONTHLYREPORT({
        counter: (await MONTHLYREPORT.find({}))
          ? (await MONTHLYREPORT.find({})) + 1
          : 1,
        totallDealing: totallDealing,
        
        purchase: treasure.purchases,
        sale: treasure.sale,
        profit: treasure.profit,
        month: new Date() + 1,
        year:new Date().getFullYear(),
        reportDate:new Date()
      });
      await MONTHLYREPORT.save();
    }
}

module.exports = { markReport };
