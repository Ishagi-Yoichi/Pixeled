import { User } from "../../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function Signup(req,res){
    try{
        const {email,password} = req.body;
        const existing = await User.findOne({email});
        if(existing){
            return res.status(400).json({message:"Email Already Exists!"});

        } 
        const hashed = await bcrypt.hash(password,10);
        const newUser = await User.create({email,password:hashed});
        res.status(201).json({message:"User Registered,Please SignIn!"});

    }
    catch(err){
        res.status(500).json({error:`SignUp Failed ${err}`});
    }
}

