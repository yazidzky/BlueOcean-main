import Chat from "../models/Chat.model.js";
import User from "../models/User.model.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Get all chats for user
// @route   GET /api/chats
// @access  Private
export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate("participants", "name email avatar status")
      .sort({ lastMessageAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get or create chat with another user
// @route   POST /api/chats
// @access  Private
export const getOrCreateChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, userId] },
    }).populate("participants", "name email avatar status");

    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        participants: [req.user._id, userId],
      });

      chat = await Chat.findById(chat._id).populate(
        "participants",
        "name email avatar status"
      );
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages from a chat
// @route   GET /api/chats/:chatId/messages
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.json(chat.messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send message
// @route   POST /api/chats/:chatId/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { text, imageBase64 } = req.body;
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Prepare message
    let imageUrl = "";
    if (imageBase64) {
      const hasCloudinaryConfig =
        !!process.env.CLOUDINARY_CLOUD_NAME &&
        !!process.env.CLOUDINARY_API_KEY &&
        !!process.env.CLOUDINARY_API_SECRET;

      if (hasCloudinaryConfig) {
        try {
          const upload = await cloudinary.uploader.upload(imageBase64, {
            folder: "blueocean/chat",
            resource_type: "auto",
          });
          imageUrl = upload.secure_url;
        } catch (e) {
          imageUrl = imageBase64;
        }
      } else {
        imageUrl = imageBase64;
      }
    }

    const message = {
      sender: req.user._id,
      text: text || "",
      imageUrl,
    };

    chat.messages.push(message);
    chat.lastMessage = text && text.trim() ? text : imageUrl ? "📷 Image" : "";
    chat.lastMessageAt = new Date();

    await chat.save();

    // Populate sender info
    await chat.populate("messages.sender", "name avatar");

    // Get the newly added message
    const newMessage = chat.messages[chat.messages.length - 1];

    // Emit socket event
    const io = req.app.get("io");
    const recipientId = chat.participants.find(
      (id) => id.toString() !== req.user._id.toString()
    );
    io.to(recipientId.toString()).emit("new_message", {
      chatId: chat._id,
      message: newMessage,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chats/:chatId/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Mark all messages from other user as read
    chat.messages.forEach((message) => {
      if (message.sender.toString() !== req.user._id.toString()) {
        message.read = true;
      }
    });

    await chat.save();

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
