import mongoose from 'mongoose';

const conversationMessageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Types.ObjectId, ref: 'Conversation', required: true },
    senderId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    content: {
      type: String,
      trim: true,
      maxLength: 5000,
      required: function () {
        return !(this.attachments?.length > 0);
      },
    },
    attachments: [String],
  },
  {
    timestamps: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

conversationMessageSchema.index({ conversationId: 1, _id: -1 });

export const ConversationMessageModel =
  mongoose.models.ConversationMessage ||
  mongoose.model('ConversationMessage', conversationMessageSchema);
