import { User } from "../../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET 

export async function SignIn(req,res){
    try{
        const{email,password} = req.body;
        const  user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message:'User not found'});
        }
        const match = await bcrypt.compare(password,user.password);
        if(!match){
            return res.status(401).json({message:"Invalid Credentials"});
        }
        const token = jwt.sign({email:user.email},JWT_SECRET,{
            expiresIn:"1h"
        });
        return res.json({message:"SignIN Successfull",token})
    }
    catch(err){
        console.error(err);
        return res.status(500).json({message:"SignIn Failed",err})
    }
}
