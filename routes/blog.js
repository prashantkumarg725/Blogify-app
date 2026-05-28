const { Router } = require("express");
const upload = require("../services/cloudinary");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const { restrictToLoggedInUserOnly } = require("../middlewares/authentication");

const router = Router();

router.get("/add-new", restrictToLoggedInUserOnly, (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

router.get("/:id", restrictToLoggedInUserOnly, async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");
  return res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});

router.post("/comment/:blogId", restrictToLoggedInUserOnly, async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

router.post("/", restrictToLoggedInUserOnly, upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;
  const wordCount = body.trim().split(/\s+/).length;
  const averageWPM = 200;
  const timeToRead = Math.ceil(wordCount / averageWPM);

  // Agar image hai toh use karo, nahi toh default empty string
  let coverImageURL = "";
  if (req.file) {
    coverImageURL = req.file.path;
  }

  const blog = await Blog.create({
    body,
    title,
    createdBy: req.user._id,
    coverImageURL: coverImageURL,
    readingTime: `${timeToRead} min read`,
  });
  return res.redirect(`/blog/${blog._id}`);
});

router.post("/delete/:id", restrictToLoggedInUserOnly, async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (blog && req.user && blog.createdBy.toString() === req.user._id) {
    await Blog.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ blogId: req.params.id });
  }
  return res.redirect("/");
});

router.get("/like/:blogId", restrictToLoggedInUserOnly, async (req, res) => {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    const userId = req.user._id;
    const userLikeIndex = blog.likes.indexOf(userId);
    if (userLikeIndex === -1) blog.likes.push(userId);
    else blog.likes.splice(userLikeIndex, 1);
    await blog.save();
    return res.json({ likes: blog.likes.length, isLiked: userLikeIndex === -1 });
});

module.exports = router;