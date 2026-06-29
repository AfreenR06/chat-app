import User from "../models/User.model.js";
import Message from "../models/message.model.js";
import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export async function getUsersForSidebar(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-clerkId");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error);

    res.status(500).json({
      message: error.message,
    });
  }
}

export async function getConversationsForSidebar(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const loggedInUserId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: loggedInUserId },
            { receiverId: loggedInUserId },
          ],
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", loggedInUserId] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessageAt: {
            $max: "$createdAt",
          },
        },
      },
      {
        $sort: {
          lastMessageAt: -1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $first: "$user",
          },
        },
      },
      {
        $project: {
          clerkId: 0,
        },
      },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error in getConversationsForSidebar:", error);

    res.status(500).json({
      message: error.message,
    });
  }
}

export async function getMessages(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    console.log("My ID:", myId);
    console.log("Chat User ID:", userToChatId);

    const messages = await Message.find({
      $or: [
        {
          senderId: myId,
          receiverId: userToChatId,
        },
        {
          senderId: userToChatId,
          receiverId: myId,
        },
      ],
    }).sort({
      createdAt: 1,
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error);

    res.status(500).json({
      message: error.message,
    });
  }
}

export async function sendMessage(req, res) {
  try {
    console.log("REQ USER:", req.user);
    console.log("REQ PARAMS:", req.params);
    console.log("REQ BODY:", req.body);

    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    console.log("Sender ID:", senderId);
    console.log("Receiver ID:", receiverId);

    let imageUrl;
    let videoUrl;

    if (req.file) {
      if (!hasImageKitConfig()) {
        return res.status(500).json({
          message: "Media upload is not configured",
        });
      }

      const url = await uploadChatMedia(req.file);

      if (req.file.mimetype.startsWith("video/")) {
        videoUrl = url;
      } else {
        imageUrl = url;
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      video: videoUrl,
    });

    await newMessage.save();

    const receiverSocketId =
      getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit(
        "newMessage",
        newMessage
      );
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("FULL ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
}
export async function deleteMessage(req,res){

try{

const message =
await Message.findById(req.params.id);

if(!message){

return res.status(404).json({
message:"Not found"
});

}

if(String(message.senderId)!==String(req.user._id)){

return res.status(403).json({
message:"Unauthorized"
});

}

const receiverSocketId = getReceiverSocketId(message.receiverId);

await Message.findByIdAndDelete(req.params.id);

if (receiverSocketId) {
  io.to(receiverSocketId).emit("messageDeleted", req.params.id);
}

res.json({
  success: true,
});

}catch(err){

res.status(500).json({
message:err.message
});

}

}