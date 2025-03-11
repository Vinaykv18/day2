import { ReminderDatabase } from './Remainder';

const reminderDB = new ReminderDatabase();
reminderDB.startInteractiveSession();
reminderDB.promptUserForReminder(() => {
    console.log("Reminder prompt completed.");
});