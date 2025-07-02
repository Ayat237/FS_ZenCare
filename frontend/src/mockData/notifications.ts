import { Notification } from '../types/notification';

// Helper function to get relative dates
const getRelativeDate = (daysFromNow: number, hoursOffset = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(date.getHours() + hoursOffset);
  return date.toISOString();
};

// Mock notifications data
export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'New Appointment Request',
    message: 'You have a new appointment with Ahmed Saleh',
    date: getRelativeDate(0, 1), // Today, 1 hour from now
    type: 'appointment',
    read: false
  },
  {
    id: 'n2',
    title: 'Prescription Filled',
    message: 'Patient Sara Ahmed has filled the prescription you wrote yesterday',
    date: getRelativeDate(0, -2), // Today, 2 hours ago
    type: 'prescription',
    read: true
  },
  {
    id: 'n3',
    title: 'System Maintenance',
    message: 'ZenCare will undergo scheduled maintenance tonight from 2 AM to 4 AM',
    date: getRelativeDate(0, -5), // Today, 5 hours ago
    type: 'system',
    read: false
  },
  {
    id: 'n4',
    title: 'Appointment Reminder',
    message: 'You have an appointment with Mohamed Ali tomorrow at 10:30 AM',
    date: getRelativeDate(1), // Tomorrow
    type: 'reminder',
    read: false
  },
  {
    id: 'n5',
    title: 'Patient Canceled Appointment',
    message: 'Layla Ibrahim has canceled her appointment scheduled for tomorrow',
    date: getRelativeDate(-1), // Yesterday
    type: 'appointment',
    read: true
  },
  {
    id: 'n6',
    title: 'New Lab Results',
    message: 'New lab results are available for patient Omar Hassan',
    date: getRelativeDate(-2), // 2 days ago
    type: 'prescription',
    read: false
  },
  {
    id: 'n7',
    title: 'Account Security Alert',
    message: 'Your account was accessed from a new device. Please verify this was you.',
    date: getRelativeDate(-3), // 3 days ago
    type: 'system',
    read: true
  },
  {
    id: 'n8',
    title: 'Patient Message',
    message: 'You have a new message from Nour Mahmoud regarding her medication',
    date: getRelativeDate(-4), // 4 days ago
    type: 'reminder',
    read: true
  },
  {
    id: 'n9',
    title: 'Telemedicine Session Scheduled',
    message: 'A telemedicine session has been scheduled with Youssef Kamal for next week',
    date: getRelativeDate(7), // 7 days from now
    type: 'appointment',
    read: false
  },
  {
    id: 'n10',
    title: 'Profile Update Reminder',
    message: 'Please update your professional profile with your latest certifications',
    date: getRelativeDate(-7), // 7 days ago
    type: 'system',
    read: false
  }
];

// Helper functions to filter notifications
export const getUnreadNotifications = (): Notification[] => {
  return mockNotifications.filter(notification => !notification.read);
};

export const getNotificationsByType = (type: Notification['type']): Notification[] => {
  return mockNotifications.filter(notification => notification.type === type);
};

// Helper function to format date for display
export const formatNotificationDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if the date is today
  if (date.toDateString() === now.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Check if the date is yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // For other dates
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
         ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};