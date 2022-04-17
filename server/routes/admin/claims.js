let router = require("express").Router();
let mongoose = require("mongoose");
let Order = mongoose.model("Order");
let Claim = mongoose.model("Claim");
let httpResponse = require("express-http-response");
let BadRequestResponse = httpResponse.BadRequestResponse;
const { rename_IdToId } = require("../../utilities/utils");

router.get("/", (req, res, next) => {
  let range = JSON.parse(req.query.range);
  const options = {
    skip: parseInt(range[0]) || 0,
    limit: range[1] - range[0] + 1 || 10
  };

  Claim.find({})
    .limit(options.limit)
    .skip(options.skip)
    .then(async (result) => {
      let count = await Claim.find({}).count();
      const data = (result && result.map(rename_IdToId)) || [];
      res.set({
        "Content-Range": `orders 0-10/${count}`,
        "Access-Control-Expose-Headers": "X-Total-Count",
        "X-Total-Count": count
      });
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
