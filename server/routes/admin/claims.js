let router = require("express").Router();
let mongoose = require("mongoose");
let Order = mongoose.model("Order");
let Claim = mongoose.model("Claim");
let httpResponse = require("express-http-response");
let BadRequestResponse = httpResponse.BadRequestResponse;
const { rename_IdToId } = require("../../utilities/utils");

router.get("/", (req, res, next) => {
  const options = {
    page: +req.query.page || 1,
    limit: +req.query.limit || 10
  };

  Claim.paginate({}, options, async (err, result) => {
    if (err) {
      console.log(err);
      next(new BadRequestResponse({ err: err }));
    } else {
      let count = await Claim.find({}).count();
      const data = (result && result.docs.map(rename_IdToId)) || [];
      res.set({
        "Content-Range": `nfts 0-10/${count}`,
        "Access-Control-Expose-Headers": "X-Total-Count",
        "X-Total-Count": count
      });
      res.json(data);
    }
  });
});

module.exports = router;
