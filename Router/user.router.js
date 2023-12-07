const express = require("express");
const userRouter = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../Model/user.model");
const { BlogModel } = require("../Model/blog.model");
const { auth } = require("../Middlewares/auth.middleware");
userRouter.post("/register", async (req, res) => {
    const { username, email, avatar, password } = req.body;
    const user = await UserModel.findOne({ email })
    try {
        if (user) {
            res.status(201).send({ "message": "User is already present, Please Login" })
        }
        else {
            bcrypt.hash(password, 5, async (err, hash) => {
                if (hash) {
                    const user = new UserModel({
                        username, email, avatar, password: hash
                    })
                    await user.save()
                    res.status(200).send({ "message": "User is registered", "user": user })
                }
                else {
                    res.status(202).send({ "message": "Something went wrong while hashing" })
                }
            })
        }
    } catch (error) {
        res.status(400).send({ "message": "Something went wrong", "err": error })
    }
})

userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (user) {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    const token = jwt.sign({ "username": user.username, "userId": user._id }, "user")
                    res.status(200).send({ "message": "Successfully login", "token": token })
                }
                else {
                    res.status(201).send({ "message": "Somethign went wrong", "err": err })
                }
            })
        }
        else {
            res.status(202).send({ "message": "User is not present, Please Register" })
        }
    } catch (error) {
        res.status(400).send({ "message": "Somethign went wrong", "err": error })
    }
})

userRouter.get("/blogs", auth, async (req, res) => {
    const { title, category, sort, ord } = req.query;
    try {
        if (title) {
            const blogs = await BlogModel.find({ username: req.body.username, title })
            res.status(200).send(blogs);
        }
        else if (category) {
            const blogs = await BlogModel.find({ username: req.body.username, category })
            res.status(200).send(blogs);
        }
        else if (sort && ord) {
            if (ord == "asc") {
                const blogs = await BlogModel.aggregate([{ username: req.body.username }, { $sort: { sort: 1 } }])
                res.status(200).send(blogs);
            }
            else if (ord == "desc") {
                const blogs = await BlogModel.aggregate([{ username: req.body.username }, { $sort: { sort: -1 } }])
                res.status(200).send(blogs);
            }
        }
        else {
            const blogs = await BlogModel.find({ username: req.body.username })
            res.status(200).send(blogs);
        }
    } catch (error) {
        res.status(400).send({ "message": "Something went wrong", "err": error })
    }
})

userRouter.post("/blogs", auth, async (req, res) => {
    const { title, content, category, date, likes } = req.body;
    try {
        const blog = new BlogModel({
            title, content, category, date, likes, comments: []
        })
        await blog.save();
        res.status(200).send({ "message": "Blog posted", "blog": blog });
    } catch (error) {
        res.status(400).send({ "message": "Something went wrong", "err": error })
    }
})

userRouter.patch("/blogs/:id", auth, async (req, res) => {
    const { id } = req.params;
    const blog = await BlogModel.findOne({ _id: id })
    try {
        if (blog.username == req.body.username) {
            await BlogModel.findByIdAndUpdate({ _id: id }, req.body);
            res.status(200).send({ "message": "Blog is updated", "blog": blog })
        }
        else {
            res.status(201).send({ "message": "You are not authorized" })
        }
    } catch (error) {
        res.status(400).send({ "message": "something went wrong", "err": error })
    }
})

userRouter.delete("/blogs/:id", auth, async (req, res) => {
    const { id } = req.params;
    const blog = await BlogModel.findOne({ _id: id })
    try {
        if (blog.username == req.body.username) {
            await BlogModel.findByIdAndDelete({ _id: id });
            res.status(200).send({ "message": "Blog is delted" })
        }
        else {
            res.status(201).send({ "message": "You are not authorized" })
        }
    } catch (error) {
        res.status(400).send({ "message": "something went wrong", "err": error })
    }
})

userRouter.patch("/blogs/:id/like", auth, async (req, res) => {
    const { id } = req.params;
    try {
        const blog = await BlogModel.findOne({ _id: id });
        blog.likes = blog.likes++;
        await BlogModel.findByIdAndUpdate({ _id: id }, blog)
        res.status(200).send({ "message": "Like added" })
    } catch (error) {
        res.status(400).send({ "message": "Something went wrong", "err": error })
    }
})

userRouter.patch("/blogs/:id/comment", auth, async (req, res) => {
    const { id } = req.params;
    try {
        const blog = await BlogModel.findOne({ _id: id });
        blog.comments.push(req.body);
        await BlogModel.findByIdAndUpdate({ _id: id }, blog)
        res.status(200).send({ "message": "Like added" })
    } catch (error) {
        res.status(400).send({ "message": "Something went wrong", "err": error })
    }
})
module.exports = { userRouter };