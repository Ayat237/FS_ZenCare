// queues/worker.js
import taskQueue from './taskQueue.queues.js';
import { sendEmailService } from '../services/sendEmail.service.js';
import { uploadFile } from '../utils/cloudinary.utils.js';
import { logger } from '../utils/logger.utils.js';
import { ErrorHandlerClass } from '../utils/error-class.utils.js';

// Worker to process the queue
taskQueue.process(async (job) => {
  const { taskType, data } = job.data;

  switch (taskType) {
    case 'sendEmail':
      const isEmailSent = await sendEmailService(data);
      if (isEmailSent.rejected.length) {
        logger.error("Failed to send verification email", error);
        return next(
          new ErrorHandlerClass(
            "Failed to send verification email",
            500,
            "Server Error",
            "Error in sending email"
          )
        );
      }
      logger.info("email sent successfully");
      break;

    case 'uploadFile':
      await uploadFile(data.filePath, data.folder);
      break;

    default:
        logger.error('Unknown task type:', taskType);
  }
});

// Handle job failures
taskQueue.on('failed', (job, error) => {
  logger.error('Job failed:', job.id, error);
});