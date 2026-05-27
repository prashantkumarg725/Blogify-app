const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();

// Routes
const userRoutes = require("./routes/user");
const blogRoutes = require("./routes/blog");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// View Engine
app.set("view engine", "ejs");

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/", userRoutes);
app.use("/", blogRoutes);

// Home Route
app.get("/", async (req, res) => {
  try {
    const Blog = require("./models/blog");
    const blogs = await Blog.find().sort({ createdAt: -1 });

    res.render("home", { blogs });
  } catch (error) {
    console.log(error);
    res.send("Server Error");
  }
});

// PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});