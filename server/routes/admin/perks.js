let router = require("express").Router();
let mongoose = require("mongoose");
let Perk = mongoose.model("Perk");
let httpResponse = require("express-http-response");
let OkResponse = httpResponse.BadRequestResponse;
let BadRequestResponse = httpResponse.BadRequestResponse;
const {
  convertRawIDToMongoDBId,
  rename_IdToId
} = require("../../utilities/utils");

router.post("/", (req, res, next) => {
  //There will be an auth middleware to check authenticated user
  let perk = new Perk();
  console.log(req.body);
  perk.description = req.body.description;
  perk.image = req.body.image;
  perk.price = req.body.price;
  perk.quantity = req.body.quantity;
  perk.showOnTop = req.body.showOnTop;
  perk.type = req.body.type;
  perk.slug = req.body.slug;
  perk.enabled = req.body.enabled;

  perk
    .save()
    .then(() => {
      res.status(200).json(rename_IdToId(perk));
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
});

router.get("/", (req, res, next) => {
  let range = JSON.parse(req.query.range);
  const options = {
    skip: parseInt(range[0]) || 0,
    limit: range[1] - range[0] + 1 || 10
  };

  Perk.find({})
    .limit(options.limit)
    .skip(options.skip)
    .then(async (result) => {
      let count = await Perk.find({}).count();
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

router.get("/:id", (req, res, next) => {
  if (req.params.id) {
    Perk.findById(req.params.id)
      .then((perk) => {
        res.status(200).send(rename_IdToId(perk));
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    return res.status(400).send({ error: "Perk id not provided." });
  }
});

router.put("/:id", (req, res, next) => {
  if (!req.params.id) {
    next(new BadRequestResponse({ message: "Please provide valid perk id." }));
  }

  const dataToUpdate = {};
  if (req.body.description) {
    dataToUpdate.description = req.body.description;
  }
  if (req.body.image) {
    dataToUpdate.image = req.body.image;
  }
  if (req.body.price) {
    dataToUpdate.price = req.body.price;
  }
  if (req.body.quantity) {
    dataToUpdate.quantity = req.body.quantity;
  }
  if (req.body.showOnTop) {
    dataToUpdate.showOnTop = req.body.showOnTop;
  }
  if (req.body.type) {
    dataToUpdate.type = req.body.type;
  }
  if (req.body.enabled) {
    dataToUpdate.enabled = req.body.enabled;
  }

  Perk.findOneAndUpdate({ _id: req.params.id }, dataToUpdate)
    .then((success) => {
      res.status(200).send(rename_IdToId(success));
    })
    .catch((error) => {
      return res.status(500).send({ error: "Internal Server Error" });
    });
});

router.delete("/:id", (req, res, next) => {
  console.log(req.params.id);
  if (req.params.id) {
    Perk.findByIdAndRemove({ _id: convertRawIDToMongoDBId(req.params.id) })
      .then((success) => {
        res.status(200).send({ message: "Perk Deleted" });
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

module.exports = router;
