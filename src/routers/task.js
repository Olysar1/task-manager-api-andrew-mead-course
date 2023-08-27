const express = require("express");
const auth = require("../middleware/auth");
const Task = require("../models/task");
const router = new express.Router();

//////////////TASKS
//CREATE task
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

//READ a single task
router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (error) {
    //No need for this guard anymore. this is handled on line 28
    // if (error.name === "CastError" && error.kind === "ObjectId") {
    //   return res.status(404).send();
    // }
    res.status(500).send();
  }
});

//READ all the tasks
//GET /tasks?completed=[true||false]
//GET /tasks?limit=10&skip=0
//GET /tasks?sortBu=createdAt:[asc||desc]
router.get("/tasks", auth, async (req, res) => {
  const completed = req.query.completed && req.query.completed;

  try {
    const tasks = await Task.find({
      owner: req.user._id,
      ...(completed && { completed }),
    })
      .limit(req.query.limit)
      .skip(req.query.skip)
      .sort({ createdAt: req.query.sort });

    res.send(tasks);
  } catch (error) {
    res.status(500).send();
  }
});

//UPDATE a single task
router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation)
    return res.status(400).send({ error: "Could not update illegal fields" });

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) return res.status(404).send();

    updates.forEach((update) => (task[update] = req.body[update]));

    await task.save();

    //OLD WAY: this method does not work with middleware
    // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    res.send(task);
  } catch (error) {
    //this is now handled on line 67
    // if (error.name === "CastError" && error.kind === "ObjectId") {
    //   return res.status(404).send();
    // }
    res.status(400).send(error);
  }
});

//DELETE a single task
router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) return res.status(404).send();
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
