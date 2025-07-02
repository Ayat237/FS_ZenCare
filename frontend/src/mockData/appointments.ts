import { Appointment } from '../types/appointment';

// Mock data for doctor appointments
export const mockAppointments: Appointment[] = [
  {
    id: 'apt001',
    patientName: 'John Smith',
    patientImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    date: '2023-06-15',
    time: '10:30 AM',
    status: 'pending',
    reason: 'Follow-up appointment for heart condition',
    type: 'telemedicine',
  },
  {
    id: 'apt002',
    patientName: 'Emily Johnson',
    patientImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    date: '2023-06-15',
    time: '2:00 PM',
    status: 'accepted',
    reason: 'Initial consultation',
    type: 'in-person',
  },
  {
    id: 'apt003',
    patientName: 'Michael Brown',
    patientImage: 'https://randomuser.me/api/portraits/men/22.jpg',
    date: '2023-06-16',
    time: '9:15 AM',
    status: 'pending',
    reason: 'Chronic pain management',
    type: 'telemedicine',
  },
  {
    id: 'apt004',
    patientName: 'Sarah Wilson',
    patientImage: 'https://randomuser.me/api/portraits/women/28.jpg',
    date: '2023-06-14',
    time: '11:45 AM',
    status: 'completed',
    reason: 'Prescription renewal',
    type: 'in-person',
  },
  {
    id: 'apt005',
    patientName: 'David Lee',
    patientImage: 'https://randomuser.me/api/portraits/men/36.jpg',
    date: '2023-06-17',
    time: '3:30 PM',
    status: 'rejected',
    reason: 'Skin rash examination',
    type: 'in-person',
  },
  {
    id: 'apt006',
    patientName: 'Jennifer Martinez',
    patientImage: 'https://randomuser.me/api/portraits/women/17.jpg',
    date: '2023-06-18',
    time: '1:15 PM',
    status: 'accepted',
    reason: 'Annual physical examination',
    type: 'in-person',
  },
  {
    id: 'apt007',
    patientName: 'Robert Taylor',
    patientImage: 'https://randomuser.me/api/portraits/men/41.jpg',
    date: '2023-06-13',
    time: '10:00 AM',
    status: 'completed',
    reason: 'Post-surgery follow-up',
    type: 'telemedicine',
  },
  {
    id: 'apt008',
    patientName: 'Lisa Anderson',
    patientImage: 'https://randomuser.me/api/portraits/women/63.jpg',
    date: '2023-06-19',
    time: '4:45 PM',
    status: 'pending',
    reason: 'Migraine consultation',
    type: 'telemedicine',
  },
];

// Helper function to get appointments by status
export const getAppointmentsByStatus = (status: string | null) => {
  if (!status || status === 'all') {
    return mockAppointments;
  }
  return mockAppointments.filter(appointment => appointment.status === status);
};

// Helper function to get upcoming appointments (pending or accepted)
export const getUpcomingAppointments = () => {
  return mockAppointments.filter(
    appointment => appointment.status === 'pending' || appointment.status === 'accepted'
  );
};

// Helper function to get past appointments (completed or rejected)
export const getPastAppointments = () => {
  return mockAppointments.filter(
    appointment => appointment.status === 'completed' || appointment.status === 'rejected'
  );
};