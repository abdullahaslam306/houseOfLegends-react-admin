let router = require("express").Router();
let mongoose = require("mongoose");
let Order = mongoose.model("Order");
let httpResponse = require("express-http-response");
const { rename_IdToId } = require("../../utilities/utils");

router.get("/", (req, res, next) => {
  console.log(req.query);
  let range = JSON.parse(req.query.range);
  const options = {
    skip: parseInt(range[0]) || 0,
    limit: range[1] - range[0] + 1 || 10
  };

  Order.find({})
    .limit(options.limit)
    .skip(options.skip)
    .then(async (result) => {
      let count = await Order.find({}).count();
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
