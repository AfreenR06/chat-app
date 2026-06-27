import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    clerkId:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    fullName:{   
        type: String,
        required: true   
    },
    profilePic:{
        type:String,    
        default:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
    }
    
},{timestamps:true }); //created At And updated At will be automatically added by mongoose

// is meember since
//createdAT updatedAT
const User = mongoose.model("User", userSchema);
export default User;