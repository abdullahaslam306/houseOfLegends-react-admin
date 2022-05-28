let router = require("express").Router();
let mongoose = require("mongoose");
let httpResponse = require("express-http-response");
const { user } = require("../../middlewares/auth");
let OkResponse = httpResponse.OkResponse;
let ForbiddenResponse = httpResponse.ForbiddenResponse;
let BadRequestResponse = httpResponse.BadRequestResponse;
let User = mongoose.model("User");
let recoverPersonalSignature = require("eth-sig-util").recoverPersonalSignature;

const {
  convertRawIDToMongoDBId,
  rename_IdToId,
  isValid
} = require("../../utilities/utils");

//list all
router.get("/", (req, res, next) => {
  try {
    let range = JSON.parse(req.query.range);
    let filtersJSON = {},
      filters = {};
    const options = {
      skip: parseInt(range[0]) || 0,
      limit: range[1] - range[0] + 1 || 10
    };
    if (isValid(req.query.filter)) {
      filtersJSON = JSON.parse(req.query.filter);
      if (isValid(filtersJSON.walletAddress)) {
        filters.walletAddress = {
          $regex: filtersJSON.walletAddress,
          $options: "i"
        };
      }
      if (isValid(filtersJSON.nonce)) {
        filters.nonce = filtersJSON.nonce;
      }
    }
    let sortFilter = {};
    if (isValid(req.query.sort)) {
      let sorting = JSON.parse(req.query.sort);
      sortFilter[sorting[0]] = sorting[1] == "ASC" ? 1 : -1;
    }
    User.find(filters)
      .sort(sortFilter)
      .limit(options.limit)
      .skip(options.skip)
      .then(async (result) => {
        let count = await User.find({}).count();
        const data = (result && result.map(rename_IdToId)) || [];
        res.set({
          "Content-Range": `users 0-10/${count}`,
          "Access-Control-Expose-Headers": "X-Total-Count",
          "X-Total-Count": count
        });
        res.json(data);
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
});

router.get("/:id", (req, res, next) => {
  if (req.params.id) {
    User.findById(req.params.id)
      .then((user) => {
        res.status(200).send(rename_IdToId(user));
      })
      .catch((err) => {
        console.log("here");
      });
  } else {
    return res.status(400).send({ error: "user id not provided." });
  }
});

router.put("/:id", (req, res, next) => {
  if (!req.params.id) {
    next(new BadRequestResponse({ message: "Please provide valid user id." }));
  }
  const dataToUpdate = {};
  if (req.body.publicAddress) {
    dataToUpdate.walletAddress = req.body.publicAddress;
  }

  if (req.body.nonce) {
    dataToUpdate.nonce = req.body.nonce;
  }
  User.findOneAndUpdate({ _id: req.params.id }, dataToUpdate)
    .then((success) => {
      res.status(200).send(rename_IdToId(success));
    })
    .catch((error) => {
      return res.status(500).send({ error: "Internal Server Error" });
    });
});

router.post("/", (req, res, next) => {
  const walletAddress = req.body.publicAddress;
  const signature = req.body.signature;
  const nonce = req.body.nonce;
  if (!signature || !walletAddress) {
    return res
      .status(400)
      .send({ error: "Request should have signature and publicAddress" });
  }

  const msg = `I am signing-up using my one-time nonce: ${nonce}`;

  // We now are in possession of msg, publicAddress and signature. We
  // will use a helper from eth-sig-util to extract the address from the signature
  const msgBufferHex = bufferToHex(Buffer.from(msg, "utf8"));
  const address = recoverPersonalSignature({
    data: msgBufferHex,
    sig: signature
  });

  // The signature verification is successful if the address found with
  // sigUtil.recoverPersonalSignature matches the initial publicAddress
  if (address.toLowerCase() == walletAddress.toLowerCase()) {
    let user = new User();
    user.walletAddress = req.body.publicAddress;
    user.save((err, result) => {
      if (!err) {
        res.json(rename_IdToId(result));
      }
    });
  } else {
    res.status(401).send({
      error: "Signature verification failed"
    });
    return null;
  }
});

router.delete("/:id", (req, res, next) => {
  if (req.params.id) {
    User.findByIdAndRemove(req.params.id)
      .then((success) => {
        next(new OkResponse({ message: "User deleted successfully" }));
      })
      .catch((err) => {
        return res.status(500).send({ error: "Something went wrong." });
      });
  } else {
    return res.status(400).send({ error: "User id not provided." });
  }
});

module.exports = router;
