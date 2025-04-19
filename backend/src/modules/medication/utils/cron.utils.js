import cron from 'node-cron';
import { logger } from '../../../utils/index.js';
import { MedicationModel } from '../../../../database/models/medications.model.js';
import database from '../../../../database/databaseConnection.js';
import { DateTime } from 'luxon';



const medicationModel = new MedicationModel(database);

// Schedule the job to run at 00:01 every day (just after midnight)
export const startMissedDosesJob = () => {

  cron.schedule('1 0 * * *', async () => {
    try {
      logger.info('Running missed doses check and reminder reset at start of day...');

      const medications = await medicationModel.find({
        isActive: true,
        endDateTime: { $gte:DateTime.now().toJSDate() },
      });
      console.log("Allmedications : ", medications);
      for (const medication of medications) {
        // This will also reset reminders for past days
        medication.checkMissedDoses(); 
        await medicationModel.save(medication);
        logger.info(`Checked missed doses for medication: ${medication._id}`);
      }

      logger.info('Missed doses check and reminder reset completed');
    } catch (error) {
      logger.error('Missed doses check and reminder reset failed', error);
    }
  });
};