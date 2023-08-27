const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URL);

///challenge///
// const Task = mongoose.model("Tasks", {
//   description: { type: String, trim: true, required: true },
//   completed: { type: Boolean, default: false },
// });

// const task = new Task({
//   description: "               Water my plants ",
//   //   completed: true,
// });
