const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: String,
    email : {
        type :String ,
        unique :true
    },
    password :String,
    firstName :{
        type:String,
        required :true
    },
    lastName :{
        type:String,
        required :false
    },
      purchasedCourses :[{
       courseId :{
        type :mongoose.Schema.Types.ObjectId ,
        ref : "course"
       }
}],
    
})


const user = mongoose.model("user", userSchema)
module.exports = {
    userModel: user
}