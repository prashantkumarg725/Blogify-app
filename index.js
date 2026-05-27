require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const Blog = require("./models/blog");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");

const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");

const app = express();

const PORT = process.env.PORT || 8000;

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("Mongo Error:", err));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cookieParser());

app.use(checkForAuthenticationCookie("token"));

app.use(express.static(path.resolve("./public")));

// Home Route
app.get("/", async (req, res) => {
  try {
    const allBlogs = await Blog.find({})
      .sort({ createdAt: -1 })
      .populate("createdBy");

    return res.render("home", {
      user: req.user,
      blogs: allBlogs,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
});

// Routes
app.use("/user", userRoute);
app.use("/blog", blogRoute);

// 404 Route
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`Server Started at PORT:${PORT}`)
  );
}

module.exports = app;