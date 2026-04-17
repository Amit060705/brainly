import type { Request,Response,NextFunction } from "express";
import mongoose from "mongoose";
import jwt, { type JwtPayload } from "jsonwebtoken";
import {JWT_SECRET} from "./config.js";
export const userMiddleware=(req:Request,res:Response,next:NextFunction)=>{
    const header=req.headers["authorization"];
    const decoded=jwt.verify(header as string,JWT_SECRET);
    if(decoded){
        if(typeof decoded==="string"){
            return res.status(403).json({message:"you are not logged in"})
        }
        req.userId=new mongoose.Types.ObjectId((decoded as JwtPayload).id);
        next();
    }
    else{
        return res.status(403).json({message:"you are not logged in"})
    }
}