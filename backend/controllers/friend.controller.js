import User from "../models/User.model.js";
import Chat from "../models/Chat.model.js";

// @desc    Get all friends
// @route   GET /api/friends
// @access  Private
export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "friends",
      "name email avatar status"
    );
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send friend request
// @route   POST /api/friends/request
// @access  Private
export const sendFriendRequest = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user to add as friend
    const friendUser = await User.findOne({ email });

    if (!friendUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (friendUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot add yourself as friend" });
    }

    // Check if already friends
    if (req.user.friends.includes(friendUser._id)) {
      return res.status(400).json({ message: "Already friends" });
    }

    // Check if request already sent
    const existingRequest = friendUser.friendRequests.find(
      (request) =>
        request.from.toString() === req.user._id.toString() &&
        request.status === "pending"
    );

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // Add friend request
    friendUser.friendRequests.push({
      from: req.user._id,
      status: "pending",
    });

    await friendUser.save();

    res.status(201).json({ message: "Friend request sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get friend requests
// @route   GET /api/friends/requests
// @access  Private
export const getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "friendRequests.from",
      "name email avatar"
    );
    const pendingRequests = user.friendRequests.filter(
      (request) => request.status === "pending"
    );
    res.json(pendingRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept friend request
// @route   PUT /api/friends/accept/:requestId
// @access  Private
export const acceptFriendRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const request = user.friendRequests.id(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    // Update request status
    request.status = "accepted";

    // Add to friends list for both users
    user.friends.push(request.from);
    await user.save();

    const friendUser = await User.findById(request.from);
    friendUser.friends.push(user._id);
    await friendUser.save();

    res.json({ message: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject friend request
// @route   PUT /api/friends/reject/:requestId
// @access  Private
export const rejectFriendRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const request = user.friendRequests.id(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    request.status = "rejected";
    await user.save();

    res.json({ message: "Friend request rejected" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove friend
// @route   DELETE /api/friends/:friendId
// @access  Private
export const removeFriend = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const friendUser = await User.findById(req.params.friendId);

    if (!friendUser) {
      return res.status(404).json({ message: "Friend not found" });
    }

    // Remove from both users' friends lists
    user.friends = user.friends.filter(
      (id) => id.toString() !== friendUser._id.toString()
    );
    await user.save();

    friendUser.friends = friendUser.friends.filter(
      (id) => id.toString() !== user._id.toString()
    );
    await friendUser.save();

    // Cascade delete chats between the two users
    await Chat.deleteMany({ participants: { $all: [user._id, friendUser._id] } });

    res.json({ message: "Friend removed and related chats deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
