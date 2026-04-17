import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, UserModel } from "./db.js";
import { JWT_SECRET } from "./config.js";
import { userMiddleware } from "./middleware.js";
import { random } from "./utils.js";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors());
app.post("/api/v1/signup", async (req, res) => {
    //zod validation,hash the password
    const { username, password } = req.body;
    try {
        await UserModel.create({ username, password });
        return res.status(200).json({ message: "user created successfully" });
    } catch (error) {
        return res.status(411).json({ message: "user already exists" });
    }
})
app.post("/api/v1/signin", async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await UserModel.findOne({
        username,
        password
    })
    if (existingUser) {
        const token = jwt.sign({
            id: existingUser._id,
        }, JWT_SECRET);
        return res.status(200).json({ token });
    }
    else {
        return res.status(403).json({ message: "invalid credentials" });
    }
})
app.post("/api/v1/content", userMiddleware, async (req, res) => {
    const { link, type, title } = req.body;
    await ContentModel.create({
        link,
        type,
        title,
        userId: req.userId,
        tags: []
    })
    return res.status(200).json({ message: "content created successfully" });
})
app.get("/api/v1/content", userMiddleware, async (req, res) => {
    const userId = req.userId;
    const content = await ContentModel.find({
        userId
    }).populate("userId", "username");
    return res.status(200).json({ content });
})
app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    const { contentId } = req.body;
    await ContentModel.deleteOne({
        _id: new mongoose.Types.ObjectId(contentId),
        userId: new mongoose.Types.ObjectId(req.userId)
    });
    return res.status(200).json({
        message: "Deleted successfully"
    });
});
app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
    const { share } = req.body;
    if (share) {
        const existingLink = await LinkModel.findOne({
            userId: req.userId
        });
        if(existingLink){
            return res.status(200).json({
                hash:existingLink.hash
            })
        }
        const hash = random(10);
        await LinkModel.create({
            userId: req.userId,
            hash
        })
        return res.status(202).json({
            message: "/share/" + hash
        })
    }
    else {
        await LinkModel.deleteOne({
            userId: req.userId
        })
        return res.status(400).json({ message: "removed link" })
    }

})
app.get("/api/v1/brain/:shareLink", async (req, res) => {
    const hash = req.params.shareLink;
    const link = await LinkModel.findOne({
        hash
    });
    if (!link) {
        return res.status(411).json({ message: "incorrect input" });
    }
    const content = await ContentModel.find({
        userId: link.userId
    })
    const user = await UserModel.findOne({
        _id: link.userId
    })
    if (!user) {
        return res.status(411).json({
            message: "user not found,error should ideally not happen"
        })
    }
    return res.status(200).json({
        username: user.username,
        content: content
    })
})
app.listen(3000);