import { Payment } from '../types/payment';

// Helper function to get relative dates
const getRelativeDate = (daysFromNow: number, hoursOffset = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(date.getHours() + hoursOffset);
  return date.toISOString();
};

// Mock payments data
export const mockPayments: Payment[] = [
  {
    id: "pmt01",
    patientName: "Omar Khaled",
    date: getRelativeDate(-2),
    amount: 350,
    method: "Visa",
    status: "paid"
  },
  {
    id: "pmt02",
    patientName: "Sara Ahmed",
    date: getRelativeDate(-5),
    amount: 275,
    method: "Cash",
    status: "paid"
  },
  {
    id: "pmt03",
    patientName: "Mohamed Ali",
    date: getRelativeDate(-7),
    amount: 400,
    method: "Online",
    status: "paid"
  },
  {
    id: "pmt04",
    patientName: "Layla Ibrahim",
    date: getRelativeDate(-10),
    amount: 325,
    method: "Visa",
    status: "refunded"
  },
  {
    id: "pmt05",
    patientName: "Nour Mahmoud",
    date: getRelativeDate(-12),
    amount: 300,
    method: "Online",
    status: "paid"
  },
  {
    id: "pmt06",
    patientName: "Ahmed Saleh",
    date: getRelativeDate(-15),
    amount: 450,
    method: "Cash",
    status: "paid"
  },
  {
    id: "pmt07",
    patientName: "Youssef Kamal",
    date: getRelativeDate(-1),
    amount: 375,
    method: "Visa",
    status: "pending"
  },
  {
    id: "pmt08",
    patientName: "Hana Mostafa",
    date: getRelativeDate(-20),
    amount: 290,
    method: "Online",
    status: "paid"
  },
  {
    id: "pmt09",
    patientName: "Karim Hassan",
    date: getRelativeDate(-25),
    amount: 320,
    method: "Cash",
    status: "pending"
  },
  {
    id: "pmt10",
    patientName: "Fatima Zaki",
    date: getRelativeDate(-30),
    amount: 380,
    method: "Visa",
    status: "paid"
  }
];

// Helper functions
export const getPaymentsByStatus = (status: Payment['status']): Payment[] => {
  return mockPayments.filter(payment => payment.status === status);
};

export const getPaymentsByMonth = (month: number, year: number): Payment[] => {
  return mockPayments.filter(payment => {
    const paymentDate = new Date(payment.date);
    return paymentDate.getMonth() === month && paymentDate.getFullYear() === year;
  });
};

export const getCurrentMonthPayments = (): Payment[] => {
  const now = new Date();
  return getPaymentsByMonth(now.getMonth(), now.getFullYear());
};

export const getTotalEarnings = (payments: Payment[]): number => {
  return payments
    .filter(payment => payment.status === 'paid')
    .reduce((total, payment) => total + payment.amount, 0);
};

export const getPendingPaymentsCount = (): number => {
  return getPaymentsByStatus('pending').length;
};

export const getCompletedPaymentsCount = (): number => {
  return getPaymentsByStatus('paid').length;
};

// Helper function to format date for display
export const formatPaymentDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};