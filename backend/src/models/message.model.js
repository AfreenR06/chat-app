import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  SenderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
  },
  image: {
    type: String,
  },
  video:{
    type: String,
  },
},{timestamps:true}); //created At And updated At will be automatically added by mongoose

const Message = mongoose.model("Message", messageSchema)

export default Message; 