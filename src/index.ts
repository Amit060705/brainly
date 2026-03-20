import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { ContentModel, UserModel } from "./db.js";
import {JWT_SECRET} from "./config.js";
import { userMiddleware } from "./middleware.js";
const app = express();
app.use(express.json());
app.post("/api/v1/signup", async (req, res) => {
    //zod validation,hash the password
    const { username, password } = req.body;
    try {
        await UserModel.create({ username, password });
        return res.status(200).json({ message: "user created successfully" });
    } catch (error) {
        return res.status(411).json({message:"user already exists"});
    }
})
app.post("/api/v1/signin", async (req, res) => {
    const { username, password } = req.body;
    const existingUser=await UserModel.findOne({
        username,
        password
    })
    if(existingUser){
        const token=jwt.sign({
            id:existingUser._id,
        },JWT_SECRET);
        return res.status(200).json({token});
    }
    else{
        return res.status(403).json({message:"invalid credentials"});
    }
})
app.post("/api/v1/content",userMiddleware, async(req, res) => {
    const {link,type}=req.body;
    await ContentModel.create({
        link,
        type,
        // @ts-ignore
        userId:req.userId,
        tags:[]
    })
    return res.status(200).json({message:"content created successfully"});
})
app.get("/api/v1/content", userMiddleware,async(req, res) => {
    //@ts-ignore
    const userId=req.userId;
    const content=await ContentModel.find({
        userId
    }).populate("userId","username");
    return res.status(200).json({content});
})
app.delete("/api/v1/content", async(req, res) => {
    const {contentId}=req.body;
    await ContentModel.deleteMany({
        contentId,
        //@ts-ignore
        userId:req.userId
    }) 
    return res.status(200).json({message:"deleted"});
})
app.post("/api/v1/brain/share", (req, res) => {

})
app.get("/api/v1/brain/:shareLink", (req, res) => {

})
app.listen(3000);