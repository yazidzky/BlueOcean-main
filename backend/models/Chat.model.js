import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: [2000, "Message cannot be more than 2000 characters"],
    },
    imageUrl: {
      type: String,
      default: "",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a message has either text or image
messageSchema.pre("validate", function (next) {
  if (!this.text && !this.imageUrl) {
    next(new Error("Message must include text or image"));
  } else {
    next();
  }
});

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    messages: [messageSchema],
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only 2 participants per chat
chatSchema.pre("save", function (next) {
  if (this.participants.length !== 2) {
    next(new Error("Chat must have exactly 2 participants"));
  }
  next();
});

// Index for faster queries
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageAt: -1 });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
