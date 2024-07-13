const express=require("express");
const zod=require("zod");
const {User}=require("../db");
const JWT_SECRET=require("../config");
const jwt=require("jsonwebtoken");
const userRouter= express.Router();
const  { authMiddleware } = require("../middleware");
const {Account}=require("../db")


const signupSchema=zod.object({
    username: zod.string().email(),
    password: zod.string(),
    firstName:zod.string(),
    lastName:zod.string()
})

const updateBody= zod.object({
    password : zod.string().optional(),
    firstname : zod.string().optional(),
    lastName : zod.string().optional()
});

const signinSchema= zod.object({
    username:zod.string().email(),
    password:zod.string()
})

userRouter.post("/signup", async (req, res) => {
    try {
        const { success } = signupSchema.safeParse(req.body);
        if (!success) {
            return res.status(411).json({
                message: "Incorrect inputs"
            });
        }

        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
            return res.status(409).json({
                message: "Email already taken"
            });
        }
        else{
            const dbUser = await User.create(req.body);
            const userId = dbUser._id;

        await Account.create({
            userId,
            balance: 1 + Math.random() * 10000
        });

        const token = jwt.sign({
            userId: dbUser._id
        }, JWT_SECRET);

        res.json({
            message: "User created successfully",
            token: token
        });
        }

    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});


userRouter.post("/signin",async (req,res)=>{
    const body=req.body;
    const {success}=signinSchema.safeParse(req.body);
    if(!success){
        res.json({
            message: "Error while logging in"
        })
    }
    const user=await User.findOne({
        userName:req.body.username,
        password: req.body.password
    });
    if(user){
        const token= jwt.sign({
            userId: user._id
        },JWT_SECRET);
    }

    res.status(200).json({
        token:token
    });

    res.status(411).json({
        message: "Error while logging in"
    });
    
})

userRouter.put("/",authMiddleware, async(req,res)=>{
    const{success} = updateBody.safeParse(req.body)
    if(!success){
        res.status(411).json({
            message : "Error while updating information"
        })
    
    }
     await User.updateOne({_id: req.userId}, req.body);

     res.json({
        message : "Updated successfully"
     })
});

userRouter.get("/bulk", async(req,res) => {
    const filter= req.query.filter || "";

    const users= await User.find({
        $or : [{
            firstname: {
                "$regex" : filter
            }
        },{
            lastname : {
                "$regex": filter
            }
        }]
    })

    res.json({
        user : users.map(user =>({
           username : user.username,
           firstname : user.firstname,
           lastname: user.lastname,
           _id :user._id 
        }))
    })
})

module.exports=userRouter;