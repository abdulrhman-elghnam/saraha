import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    lastReadAt: { type: Date, default: null },
    unreadCount: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const lastMessageSchema = new mongoose.Schema(
  {
    messageId: { type: mongoose.Types.ObjectId, ref: 'ConversationMessage' },
    content: { type: String, default: null },
    senderId: { type: mongoose.Types.ObjectId, ref: 'User' },
    hasAttachments: { type: Boolean, default: false },
    createdAt: { type: Date },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [participantSchema],
      validate: {
        validator: (participants) => participants.length === 2,
        message: 'a conversation must have exactly two participants',
      },
    },
    // Sorted "<idA>_<idB>" — guarantees one conversation per pair of users.
    participantKey: { type: String, required: true, unique: true },
    lastMessage: { type: lastMessageSchema, default: null },
  },
  {
    timestamps: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// Inbox listing / polling: "my conversations ordered by latest activity".
conversationSchema.index({ 'participants.userId': 1, updatedAt: -1 });

export const ConversationModel =
  mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
