const mongoose=require("mongoose");

mongoose.connect("mongodb+srv://12113065:MaVRTUJKa8tmTGvj@cluster0.ncqptk6.mongodb.net/");

const userSchema=new mongoose.Schema({
    userName : String,
    password : String,
    firstName : String,
    lastName : String
    
});
const accountSchema =new mongoose.Schema({
    userId :{
        type: mongoose.Schema.Types.ObjectId,
        required : true
    },
    balance : {
        type: Number,
        required: true
    }

});

const Account = mongoose.model("Account", accountSchema);
const User= mongoose.model("Users",userSchema);

module.exports={
    User,
    Account
};
