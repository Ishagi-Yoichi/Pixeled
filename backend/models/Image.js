import mongoose from "mongoose";

const versionSchema = new mongoose.Schema({
    type:{type:String,enum:["original","thumbnail","medium","large"],required:true},
    key:{type:String,required:true},
    url:{type:String,required:true},
    createdAt:{type:Date,default:Date.now}
});

const transformationSchema = new mongoose.Schema({
    type: String,           //  "resize", "compress", "rotate"
    width: Number,
    height: Number,
    appliedAt: { type: Date, default: Date.now }
  });

  const imageSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    originalName: String,
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    uploadDate: { type: Date, default: Date.now },
    size: Number,
    contentType: String,
    url: String,
    versions: [versionSchema],
    transformations: [transformationSchema],
    tags: [String],
    description: String,
    visibility: { type: String, enum: ["public", "private"], default: "private" },
    status: { type: String, enum: ["uploaded", "processing", "processed", "failed"], default: "uploaded" }
  });