import sharp from "sharp";

const semiPng = await sharp({
    create:{
        width:48,
        height:48,
        channels:4,
        background:{r:255,g:0,b:0,alpha:0.5}
    }
})
.png()
.toBuffer();