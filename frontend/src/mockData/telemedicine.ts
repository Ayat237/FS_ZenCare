import { TelemedicineSession } from '../types/telemedicine';

// Helper function to create dates relative to today
const getRelativeDate = (dayOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

// Mock data for telemedicine sessions
export const mockTelemedicineSessions: TelemedicineSession[] = [
  {
    id: 'tele001',
    patientName: 'John Smith',
    patientImage: require('../assets/images/avatar-placeholder.png'),
    date: getRelativeDate(1), // Tomorrow
    time: '10:00 AM',
    type: 'video',
    status: 'upcoming',
    notes: 'Follow-up on diabetes management'
  },
  {
    id: 'tele002',
    patientName: 'Sarah Johnson',
    patientImage: require('../assets/images/girl.png'),
    date: getRelativeDate(2), // Day after tomorrow
    time: '2:30 PM',
    type: 'voice',
    status: 'upcoming',
    notes: 'Discuss recent lab results'
  },
  {
    id: 'tele003',
    patientName: 'Michael Chen',
    patientImage: require('../assets/images/avatar-placeholder.png'),
    date: getRelativeDate(-1), // Yesterday
    time: '11:15 AM',
    type: 'video',
    status: 'completed',
    notes: 'Post-surgery check-in'
  },
  {
    id: 'tele004',
    patientName: 'Emily Rodriguez',
    patientImage: require('../assets/images/girl.png'),
    date: getRelativeDate(-2), // 2 days ago
    time: '3:45 PM',
    type: 'voice',
    status: 'completed',
    notes: 'Medication review'
  },
  {
    id: 'tele005',
    patientName: 'David Wilson',
    patientImage: require('../assets/images/avatar-placeholder.png'),
    date: getRelativeDate(-3), // 3 days ago
    time: '9:30 AM',
    type: 'video',
    status: 'missed',
    notes: 'Initial consultation'
  },
  {
    id: 'tele006',
    patientName: 'Lisa Thompson',
    patientImage: require('../assets/images/girl.png'),
    date: getRelativeDate(3), // 3 days from now
    time: '1:00 PM',
    type: 'video',
    status: 'upcoming',
    notes: 'Discuss treatment options'
  },
  {
    id: 'tele007',
    patientName: 'Robert Garcia',
    patientImage: require('../assets/images/avatar-placeholder.png'),
    date: getRelativeDate(5), // 5 days from now
    time: '4:15 PM',
    type: 'voice',
    status: 'upcoming',
    notes: 'Review progress on therapy'
  }
];

// Helper functions to filter sessions
export const getUpcomingSessions = (): TelemedicineSession[] => {
  return mockTelemedicineSessions.filter(session => session.status === 'upcoming');
};

export const getCompletedSessions = (): TelemedicineSession[] => {
  return mockTelemedicineSessions.filter(session => session.status === 'completed');
};

export const getMissedSessions = (): TelemedicineSession[] => {
  return mockTelemedicineSessions.filter(session => session.status === 'missed');
};