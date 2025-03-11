import * as readline from 'readline';
import { randomUUID } from 'crypto';

type Reminder = {
    id: string;
    title: string;
    description?: string;
    date: Date;
};

class ReminderDatabase {
    private reminders: Map<string, Reminder>;
    private rl: readline.Interface;

    constructor() {
        this.reminders = new Map<string, Reminder>();

        // Initialize a single readline instance
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }

    private generateId(): string {
        return randomUUID();
    }

    createReminder(title: string, date: Date, description?: string): string {
        const id = this.generateId();
        this.reminders.set(id, { id, title, description, date });
        return id;
    }

    exists(id: string): boolean {
        return this.reminders.has(id);
    }

    getAllReminders(): Reminder[] {
        return Array.from(this.reminders.values());
    }

    getReminder(id: string): Reminder | null {
        return this.reminders.get(id) || null;
    }

    removeReminder(id: string): boolean {
        return this.reminders.delete(id);
    }

    updateReminder(id: string, title?: string, date?: Date, description?: string): boolean {
        if (!this.reminders.has(id)) {
            return false;
        }
        const existingReminder = this.reminders.get(id)!;
        this.reminders.set(id, {
            ...existingReminder,
            title: title ?? existingReminder.title,
            date: date ?? existingReminder.date,
            description: description ?? existingReminder.description,
        });
        return true;
    }

    startInteractiveSession(): void {
        console.log("\nChoose an option:");
        console.log("1. Create Reminder");
        console.log("2. Retrieve Reminder");
        console.log("3. Update Reminder");
        console.log("4. Delete Reminder");
        console.log("5. Show All Reminders");
        console.log("6. Exit");

        this.rl.question("Enter your choice: ", (choice) => {
            switch (choice) {
                case "1":
                    this.promptUserForReminder(() => this.startInteractiveSession());
                    break;
                case "2":
                    this.rl.question("Enter Reminder ID: ", (id) => {
                        const reminder = this.getReminder(id);
                        console.log(reminder ? reminder : "Reminder not found.");
                        this.startInteractiveSession();
                    });
                    break;
                case "3":
                    this.rl.question("Enter Reminder ID to update: ", (id) => {
                        if (!this.exists(id)) {
                            console.log("Reminder not found.");
                            this.startInteractiveSession();
                            return;
                        }
                        this.rl.question("Enter new title (leave empty to keep unchanged): ", (title) => {
                            this.rl.question("Enter new date (YYYY-MM-DD, leave empty to keep unchanged): ", (dateInput) => {
                                this.rl.question("Enter new description (leave empty to keep unchanged): ", (description) => {
                                    const date = dateInput ? new Date(dateInput) : undefined;
                                    this.updateReminder(id, title || undefined, date, description || undefined);
                                    console.log("Reminder updated successfully.");
                                    this.startInteractiveSession();
                                });
                            });
                        });
                    });
                    break;
                case "4":
                    this.rl.question("Enter Reminder ID to delete: ", (id) => {
                        if (this.removeReminder(id)) {
                            console.log("Reminder deleted successfully.");
                        } else {
                            console.log("Reminder not found.");
                        }
                        this.startInteractiveSession();
                    });
                    break;
                case "5":
                    console.log(this.getAllReminders());
                    this.startInteractiveSession();
                    break;
                case "6":
                    console.log("Exiting...");
                    this.rl.close();
                    break;
                default:
                    console.log("Invalid choice. Please try again.");
                    this.startInteractiveSession();
            }
        });
    }

    promptUserForReminder(callback: () => void): void {
        this.rl.question("Enter reminder title: ", (title) => {
            if (!title.trim()) {
                console.log("Title is required.");
                callback();
                return;
            }

            this.rl.question("Enter reminder date (YYYY-MM-DD): ", (dateInput) => {
                const date = new Date(dateInput);
                if (isNaN(date.getTime())) {
                    console.log("Invalid date format.");
                    callback();
                    return;
                }

                this.rl.question("Enter reminder description (optional): ", (description) => {
                    const reminderId = this.createReminder(title, date, description.trim());
                    console.log(`Reminder created with ID: ${reminderId}`);
                    console.log(this.getAllReminders());
                    callback();
                });
            });
        });
    }
}

export { ReminderDatabase };
