import { BadRequestException, NotFoundException, toObjectId } from '#/common/_EXPORT.js';
import {
  ConversationMessageModel,
  ConversationModel,
  create,
  find,
  findById,
  findOne,
  findOneAndDelete,
  paginate,
  updateOne,
  UserModel,
} from '#/core/_EXPORT.js';

const PARTICIPANT_FIELDS = 'username firstName lastName profileImage';
const participantPopulate = { path: 'participants.userId', select: PARTICIPANT_FIELDS };

const buildParticipantKey = (a, b) => [String(a), String(b)].sort().join('_');

const formatParticipant = (user) =>
  user && {
    id: String(user._id),
    username: user.username,
    fullName: user.fullName,
    profileImage: user.profileImage,
  };


const formatConversation = (conversation, userId) => {
  const me = conversation.participants.find(
    (p) => String(p.userId?._id ?? p.userId) === String(userId)
  );
  const other = conversation.participants.find((p) => p !== me);

  return {
    id: String(conversation._id),
    participant: formatParticipant(other?.userId),
    lastMessage: conversation.lastMessage ?? null,
    unreadCount: me?.unreadCount ?? 0,
    lastReadAt: me?.lastReadAt ?? null,
    participantLastReadAt: other?.lastReadAt ?? null,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
};

const toLastMessage = (message) =>
  message
    ? {
        messageId: message._id,
        content: message.content ?? null,
        senderId: message.senderId,
        hasAttachments: message.attachments?.length > 0,
        createdAt: message.createdAt,
      }
    : null;


const findUserConversation = async ({ conversationId, user, populate = false }) => {
  const conversation = await findOne({
    model: ConversationModel,
    filter: { _id: conversationId, 'participants.userId': user._id },
    options: populate ? { populate: participantPopulate } : {},
  });

  if (!conversation) {
    throw NotFoundException({ messageCode: 901 });
  }

  return conversation;
};

export const startConversation = async ({ user, participantId }) => {
  if (String(user._id) === String(participantId)) {
    throw BadRequestException({ messageCode: 902 });
  }

  const participant = await findById({ model: UserModel, id: participantId });
  if (!participant || !participant.emailVerifiedAt || participant.deletedAt) {
    throw NotFoundException({ messageCode: 401 });
  }

  const participantKey = buildParticipantKey(user._id, participant._id);
  const findByKey = () =>
    findOne({
      model: ConversationModel,
      filter: { participantKey },
      options: { populate: participantPopulate },
    });

  let conversation = await findByKey();
  let created = false;

  if (!conversation) {
    try {
      await create({
        model: ConversationModel,
        data: {
          participantKey,
          participants: [{ userId: user._id }, { userId: participant._id }],
        },
      });
      created = true;
    } catch (error) {

      if (error?.code !== 11000) throw error;
    }
    conversation = await findByKey();
  }

  return { created, conversation: formatConversation(conversation, user._id) };
};

export const listConversations = async ({ user, page, size, since }) => {
  const filter = { 'participants.userId': user._id };
  if (since) {
    filter.updatedAt = { $gt: since };
  }

  const { result, ...pagination } = await paginate({
    model: ConversationModel,
    filter,
    page,
    size,
    options: { sort: { updatedAt: -1 }, populate: participantPopulate },
  });

  return {
    conversations: result.map((conversation) => formatConversation(conversation, user._id)),
    pagination,
    serverTime: new Date(),
  };
};

export const getConversation = async ({ conversationId, user }) => {
  const conversation = await findUserConversation({ conversationId, user, populate: true });
  return formatConversation(conversation, user._id);
};

export const getUnreadCount = async ({ user }) => {
  const [result] = await ConversationModel.aggregate([
    { $match: { 'participants.userId': user._id } },
    { $unwind: '$participants' },
    { $match: { 'participants.userId': user._id, 'participants.unreadCount': { $gt: 0 } } },
    {
      $group: {
        _id: null,
        unreadMessages: { $sum: '$participants.unreadCount' },
        unreadConversations: { $sum: 1 },
      },
    },
  ]);

  return {
    unreadMessages: result?.unreadMessages ?? 0,
    unreadConversations: result?.unreadConversations ?? 0,
  };
};

export const listConversationMessages = async ({ conversationId, user, after, before, limit }) => {
  const conversation = await findUserConversation({ conversationId, user });
  const other = conversation.participants.find((p) => String(p.userId) !== String(user._id));

  const filter = { conversationId: conversation._id };
  if (after) filter._id = { $gt: toObjectId(after) };
  if (before) filter._id = { $lt: toObjectId(before) };

  // Polling (`after`) walks forward; history / initial load walks backward from the newest.
  const ascending = Boolean(after);
  const messages = await find({
    model: ConversationMessageModel,
    filter,
    options: { sort: { _id: ascending ? 1 : -1 }, limit: limit + 1 },
  });

  const hasMore = messages.length > limit;
  const page = messages.slice(0, limit);
  if (!ascending) page.reverse();

  return {
    messages: page,
    hasMore,
    participantLastReadAt: other?.lastReadAt ?? null,
  };
};

export const sendConversationMessage = async ({ conversationId, user, content, files = [] }) => {
  const conversation = await findUserConversation({ conversationId, user });

  const [message] = await create({
    model: ConversationMessageModel,
    data: {
      conversationId: conversation._id,
      senderId: user._id,
      content: content || undefined,
      attachments: files.map((file) => file.path),
    },
  });

  // Sending implies the sender has read everything; the other side gets +1 unread.
  await updateOne({
    model: ConversationModel,
    filter: { _id: conversation._id },
    update: {
      $set: {
        lastMessage: toLastMessage(message),
        'participants.$[me].lastReadAt': message.createdAt,
        'participants.$[me].unreadCount': 0,
      },
      $inc: { 'participants.$[other].unreadCount': 1 },
    },
    options: {
      arrayFilters: [{ 'me.userId': user._id }, { 'other.userId': { $ne: user._id } }],
    },
  });

  return message;
};

export const markConversationRead = async ({ conversationId, user }) => {
  const conversation = await findUserConversation({ conversationId, user });
  const readAt = new Date();

  await updateOne({
    model: ConversationModel,
    filter: { _id: conversation._id },
    update: {
      $set: {
        'participants.$[me].lastReadAt': readAt,
        'participants.$[me].unreadCount': 0,
      },
    },
    options: { arrayFilters: [{ 'me.userId': user._id }] },
  });

  return { readAt };
};

export const deleteConversationMessage = async ({ conversationId, messageId, user }) => {
  const conversation = await findUserConversation({ conversationId, user });

  const message = await findOneAndDelete({
    model: ConversationMessageModel,
    filter: { _id: messageId, conversationId: conversation._id, senderId: user._id },
  });

  if (!message) {
    throw NotFoundException({ messageCode: 111 });
  }

  const other = conversation.participants.find((p) => String(p.userId) !== String(user._id));
  const otherHadNotRead = !other?.lastReadAt || other.lastReadAt < message.createdAt;
  const wasLastMessage = String(conversation.lastMessage?.messageId ?? '') === String(message._id);

  const update = {};
  if (wasLastMessage) {
    const [previous] = await find({
      model: ConversationMessageModel,
      filter: { conversationId: conversation._id },
      options: { sort: { _id: -1 }, limit: 1 },
    });
    update.$set = { lastMessage: toLastMessage(previous) };
  }
  if (otherHadNotRead && other?.unreadCount > 0) {
    update.$inc = { 'participants.$[other].unreadCount': -1 };
  }

  if (update.$set || update.$inc) {
    await updateOne({
      model: ConversationModel,
      filter: { _id: conversation._id },
      update,
      options: update.$inc ? { arrayFilters: [{ 'other.userId': other.userId }] } : {},
    });
  }

  return message;
};
