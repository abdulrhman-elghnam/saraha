import { NotFoundException } from '#/common/_EXPORT.js';
import {
  create,
  find,
  findById,
  findOneAndDelete,
  findOne,
  MessageModel,
  UserModel,
} from '#/core/_EXPORT.js';

export const createMessage = async ({ receiverId, content, files = [], user } = {}) => {
  const receiver = await findById({
    model: UserModel,
    id: receiverId,
  });

  if (!receiver || !receiver.emailVerifiedAt || receiver.deletedAt) {
    throw NotFoundException({ messageCode: 401 });
  }

  const [message] = await create({
    model: MessageModel,
    data: {
      receiverId,
      content: content || undefined,
      attachments: files.map((file) => file.path),
      senderId: user?._id,
    },
  });

  return message;
};

export const getMessages = async (user) => {
  return find({
    model: MessageModel,
    filter: {
      $or: [{ receiverId: user._id }, { senderId: user._id }],
    },
    select: '-senderId',
    options: { sort: { createdAt: -1 } },
  });
};

export const getMessage = async (messageId, user) => {
  const message = await findOne({
    model: MessageModel,
    filter: {
      _id: messageId,
      $or: [{ receiverId: user._id }, { senderId: user._id }],
    },
    select: '-senderId',
  });

  if (!message) {
    throw NotFoundException({ messageCode: 111 });
  }

  return message;
};

export const deleteMessage = async (messageId, user) => {
  const message = await findOneAndDelete({
    model: MessageModel,
    filter: {
      _id: messageId,
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    },
  });

  if (!message) {
    throw NotFoundException({ messageCode: 111 });
  }

  return message;
};
