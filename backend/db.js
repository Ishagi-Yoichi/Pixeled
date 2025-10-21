import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
main().catch(error => console.error("MongoDB connection error",error));

async function main(){
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB!");
}

const userSchema = new mongoose.Schema({
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true}
});

export const User = mongoose.model('User',userSchema);