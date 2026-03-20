import mongoose, { model,Schema } from "mongoose";
// create user models and schema
// mongodb+srv://amitkumar060705_db_user:mdYpQRX5fUYKri53@cluster0.vgnuusl.mongodb.net/
mongoose.connect("mongodb+srv://amitkumar060705_db_user:mdYpQRX5fUYKri53@cluster0.vgnuusl.mongodb.net/brainly");
const UserSchema=new Schema({
    username:{type:String,unique:true},
    password:String
});
export const UserModel=model("User",UserSchema);
const ContentSchema=new Schema({
    title:String,
    link:String,
    type:String,
    tags:[{type:mongoose.Types.ObjectId,ref:'Tag'}],
    userId:{type:mongoose.Types.ObjectId,ref:'User',required:true}
})
export const ContentModel=model("Content",ContentSchema);