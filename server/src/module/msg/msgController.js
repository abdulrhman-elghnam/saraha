import {
  fileFieldValidation,
  localFileUpload,
  sendSuccess,
} from "#/common/_EXPORT.js";

import { uploadMiddleware } from "#/common/middleware/_EXPORT.js";
import { Router } from "express";
import { createMessage } from "./msgService.js";

export const msgController = Router({
  caseSensitive: true,
  strict: true,
  mergeParams: true,
});

msgController.post(
  "/",
  uploadMiddleware({
    multerMiddleware: localFileUpload({
      validation: fileFieldValidation.image,
      maxFileSize: 5,
    }).array("attachments", 3),
    validation: fileFieldValidation.image,
    customPath: "message",
    isRequired: false,
  }),
  async (req, res) => {
    console.log(req.file);
    
    const data = await createMessage(req.body, req.files);
    return sendSuccess({ res, status: 201, data });
  }
);