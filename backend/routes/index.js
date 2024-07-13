const express= require("express");

const router= express.Router();
const userRouter=require("./userRouter");
const accRouter=require("./accRouter");

router.use("/user", userRouter);
router.use("/account",accRouter);


module.exports= router;