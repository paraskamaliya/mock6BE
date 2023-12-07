const mongoose = require("mongoose");

const blogSchema = mongoose.Schema({
    title: String,
    content: String,
    category: String,
    date: String,
    likes: Number,
    comments: Array
}, {
    versionKey: false
})
const BlogModel = mongoose.model("blog", blogSchema);
module.exports = { BlogModel };