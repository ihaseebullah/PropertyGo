const { SURVEY, INVENTORY, MONTHLYREPORT } = require("../modules/schema");

async function takeSurvey(req, res) {
  const option = {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  };
  const newSurvey = new SURVEY({
    counter: (await SURVEY.find({})) ? (await SURVEY.find({})).length + 1 : 1,
    date: new Date().getDate(),
    month:new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    fullDate: new Date().toLocaleDateString("en-US", option),
    totallOutflow: req.body.totallOutflow,
    totallInflow: req.body.totallInflow,
    visits: req.body.visits,
    visitedSite: req.body.visitedSite,
    purchases: req.body.purchases,
    sales: req.body.sales,
    profit: req.body.profit,
    description: req.body.description,
  });
  await newSurvey.save();
  const date = new Date().getMonth();
  const year = new Date().getFullYear();
  let schema = await MONTHLYREPORT.findOne({ year: year, month: date +1 });
  if (!schema) {
    const newReport = new MONTHLYREPORT({
      counter: (await MONTHLYREPORT.find({})).length + 1,
      month: date + 1,
      year: year,
      purchases: parseInt(req.body.purchases),
      sales: parseInt(req.body.sales),
      profit: parseInt(req.body.profit),
      visits: parseInt(req.body.visits),
      deposits: 0,
      withdrawl: 0,
    });
    await newReport.save();
  }else{
    schema = await MONTHLYREPORT.findOne({ year: year, month: date + 1 });
    const updateReport = {
      purchases: schema.purchases + parseInt(req.body.purchases),
      sales: schema.sales + parseInt(req.body.sales),
      profit: schema.profit + parseInt(req.body.profit),
      visits: schema.visits + parseInt(req.body.visits),
    };

    await MONTHLYREPORT.findOneAndUpdate(
      { year: year, month: date + 1 },
      updateReport
    ).then(async () => {
      const showMe = await MONTHLYREPORT.findOne({ year: year, month: date +1 });
      console.log(showMe);
    });
  }
  res.redirect("/?message=The data has been saved successfully");
}

module.exports = { takeSurvey };
