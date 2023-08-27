const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail, sendGoodbyeEmail } = require("../emails/account");
const router = new express.Router();

//////////////USERS
//CREATE user
router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

//Log in the user
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

//log out user
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

//log out user from ALL SESSIONS
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

//READ user profile
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

//READ a single user
//no need to have this anymore
// router.get("/users/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     res.send(user);
//   } catch (error) {
//     if (error.name === "CastError" && error.kind === "ObjectId") {
//       return res.status(404).send();
//     }
//     res.status(500).send();
//   }
// });

//UPDATE a single user
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation)
    return res.status(400).send({ error: "Could not update illegal fields" });

  try {
    // const user = await User.findById(req.params.id);

    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();

    //OLD WAY: this method does not work with middleware
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    res.send(req.user);
  } catch (error) {
    // if (error.name === "CastError" && error.kind === "ObjectId") {
    //   return res.status(404).send();
    // }

    res.status(400).send(error);
  }
});

//DELETE authenticated user
router.delete("/users/me", auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);
    await User.deleteOne(req.user);
    sendGoodbyeEmail(req.user.email, req.user.name);

    // console.log(user);
    ////this guard does not work on other methods
    //no need for guard anymore
    // if (!user) return res.status(404).send();

    // await req.user.remove();
    res.send(req.user);
  } catch (error) {
    ////the following does not work on this method
    //no need for guard anymore
    // if (error.name === "CastError" && error.kind === "ObjectId")
    //   return res.status(404).send();
    res.status(500).send(error.message);
  }
});

//upload user avatar
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
      return cb(new Error("this file must be image(JPG, JPEG, PNG"));

    cb(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//delete user avatar
router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

//read user avatar
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/jpg");
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

///////

module.exports = router;
