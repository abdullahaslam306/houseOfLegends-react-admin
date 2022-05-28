let router = require("express").Router();
let mongoose = require("mongoose");
let Perk = mongoose.model("Perk");
let httpResponse = require("express-http-response");
let OkResponse = httpResponse.BadRequestResponse;
let BadRequestResponse = httpResponse.BadRequestResponse;
let AWS = require("aws-sdk");
const {
  convertRawIDToMongoDBId,
  rename_IdToId,
  isValid
} = require("../../utilities/utils");

router.post("/", async (req, res, next) => {
  //There will be an auth middleware to check authenticated user
  let perk = new Perk();
  console.log(req.body);
  perk.description = req.body.description;
  perk.price = req.body.price;
  perk.quantity = req.body.quantity;
  perk.showOnTop = req.body.showOnTop;
  perk.type = req.body.type;
  perk.slug = req.body.slug;
  perk.enabled = req.body.enabled;
  console.log(req.body);
  var upload = new AWS.S3.ManagedUpload({
    params: {
      Bucket: "legendary-perks",
      Key: req.body.image.title,
      Body: req.body.image.image,
      ACL: "public-read"
    }
  });
  const response = await upload.promise();
  perk.image = response.Location;

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
  let filtersJSON = {},
    filters = {};
  let range = JSON.parse(req.query.range);
  const options = {
    skip: parseInt(range[0]) || 0,
    limit: range[1] - range[0] + 1 || 10
  };
  if (isValid(req.query.filter)) {
    filtersJSON = JSON.parse(req.query.filter);
    if (isValid(filtersJSON.slug)) {
      filters.slug = { $regex: filtersJSON.slug, $options: "i" };
    }
    if (isValid(filtersJSON.type)) {
      filters.type = {
        $regex: filtersJSON.type,
        $options: "i"
      };
    }
    if (isValid(filtersJSON.description)) {
      filters.description = {
        $regex: filtersJSON.description,
        $options: "i"
      };
    }
    if (isValid(filtersJSON.price)) {
      filters.price = filtersJSON.price;
    }
  }
  let sortFilter = {};
  if (isValid(req.query.sort)) {
    let sorting = JSON.parse(req.query.sort);
    sortFilter[sorting[0]] = sorting[1] == "ASC" ? 1 : -1;
    console.log(sortFilter);
  }
  Perk.find(filters)
    .sort(sortFilter)
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

  console.log("here");
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

router.put("/:id", async (req, res, next) => {
  if (!req.params.id) {
    next(new BadRequestResponse({ message: "Please provide valid perk id." }));
  }
  console.log(req.body);
  const dataToUpdate = {};
  if (req.body.description) {
    dataToUpdate.description = req.body.description;
  }
  if (req.body.image && req.body.image.title && req.body.image.image) {
    console.log("edited");
    var upload = new AWS.S3.ManagedUpload({
      params: {
        Bucket: "legendary-perks",
        Key: req.body.image.title,
        Body: req.body.image.image
      }
    });

    const response = await upload.promise();
    dataToUpdate.image = response.Location;
  }
  if (req.body.price) {
    dataToUpdate.price = req.body.price;
  }
  if (req.body.quantity) {
    dataToUpdate.quantity = req.body.quantity;
  }
  if (req.body.showOnTop != null) {
    dataToUpdate.showOnTop = req.body.showOnTop;
  }
  if (req.body.type) {
    dataToUpdate.type = req.body.type;
  }
  if (req.body.enabled != null) {
    dataToUpdate.enabled = req.body.enabled;
  }
  if (req.body.slug) {
    dataToUpdate.slug = req.body.slug;
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
