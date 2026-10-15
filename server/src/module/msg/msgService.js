import { NotFoundException } from '#/common/_EXPORT.js';
import { create, findById, MessageModel, UserModel } from '#/core/_EXPORT.js';

export const createMessage = async ({ content, receiverId } = {}, files = []) => {
  if (!receiverId) {
    throw NotFoundException('Receiver ID is required');
  }
  const checkReceiverExist = await findById({
    model: UserModel,
    id: receiverId,
  });

  if (!checkReceiverExist) {
    throw NotFoundException('Invalid receiver');
  }

  const message = await create({
    model: MessageModel,
    data: {
      receiverId,
      content,
      attachments: files.map((file) => file.path),
    },
  });

  return message;
};
