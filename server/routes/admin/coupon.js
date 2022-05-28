let router = require("express").Router();
let mongoose = require("mongoose");
let Coupon = mongoose.model("Coupon");
let httpResponse = require("express-http-response");
let OkResponse = httpResponse.OkResponse;
let BadRequestResponse = httpResponse.BadRequestResponse;
const {
  convertRawIDToMongoDBId,
  rename_IdToId,
  isValid
} = require("../../utilities/utils");

router.get("/", (req, res, next) => {
  let range = JSON.parse(req.query.range);
  let filtersJSON = {},
    filters = {};
  const options = {
    skip: parseInt(range[0]) || 0,
    limit: range[1] - range[0] + 1 || 10
  };
  if (isValid(req.query.filter)) {
    filtersJSON = JSON.parse(req.query.filter);
    if (isValid(filtersJSON.coupon)) {
      filters.coupon = { $regex: filtersJSON.coupon, $options: "i" };
    }
    if (isValid(filtersJSON.perk)) {
      filters.perk = {
        $regex: filtersJSON.perk,
        $options: "i"
      };
    }
    if (isValid(filtersJSON.used)) {
      filters.used = filtersJSON.used;
    }
  }
  let sortFilter = {};
  if (isValid(req.query.sort)) {
    let sorting = JSON.parse(req.query.sort);
    sortFilter[sorting[0]] = sorting[1] == "ASC" ? 1 : -1;
    console.log(sortFilter);
  }
  // console.log(options);
  Coupon.find(filters)
    .sort(sortFilter)
    .limit(options.limit)
    .skip(options.skip)
    .then(async (result) => {
      let count = await Coupon.find({}).count();
      const data = (result && result.map(rename_IdToId)) || [];
      res.set({
        "Content-Range": `Coupon 0-10/${count}`,
        "Access-Control-Expose-Headers": "X-Total-Count",
        "X-Total-Count": count
      });
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
    });
});
router.get("/:id", (req, res, next) => {
  if (req.params.id) {
    Coupon.findById({ _id: convertRawIDToMongoDBId(req.params.id) })
      .then((Coupon) => {
        res.json(rename_IdToId(Coupon));
      })
      .catch((err) => {
        console.log(err.message);
      });
  } else {
    return res.status(400).send({ error: "Coupon id not provided." });
  }
});

router.put("/:id", (req, res, next) => {
  if (!req.params.id) {
    next(
      new BadRequestResponse({ message: "Please provide valid Coupon id." })
    );
  }
  console.log(req.body);
  const dataToUpdate = {};
  if (req.body.coupon) {
    dataToUpdate.coupon = req.body.coupon;
  }
  if (req.body.perk) {
    dataToUpdate.perk = req.body.perk;
  }
  if (req.body.used != null) {
    dataToUpdate.used = req.body.used;
  }

  Coupon.findOneAndUpdate({ _id: req.params.id }, dataToUpdate)
    .then((success) => {
      res.json(rename_IdToId(success));
    })
    .catch((error) => {
      return res.status(500).send({ error: "Internal Server Error" });
    });
});

router.post("/", (req, res, next) => {
  try {
    console.log("body", req.body);
    const { coupon, isUsed, perk } = req.body;
    const couponn = new Coupon({ coupon, used: isUsed, perk });
    couponn
      .save()
      .then((success) => {
        res.json(rename_IdToId(couponn));
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(400)
          .send({ error: "Please provide valid information." });
      });
  } catch (e) {
    return res.status(500).send({ error: "Internal Server Error" });
  }
});
router.delete("/:id", (req, res, next) => {
  if (!req.params.id) {
    next(
      new BadRequestResponse({ message: "Please provide valid coupon id." })
    );
  }
  Coupon.findByIdAndRemove({ _id: req.params.id })
    .then((result) => {
      next(new OkResponse({ message: "Coupon deleted successfully" }));
    })
    .catch((err) => {
      return res.status(500).send({ error: "Internal Server Error" });
    });
});

module.exports = router;
