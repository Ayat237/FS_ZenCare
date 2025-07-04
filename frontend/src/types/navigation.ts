import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
// We'll define our own DrawerScreenProps type to avoid the import issue
// Instead of importing from @react-navigation/drawer

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  SignUpDetails: {
    role: "patient" | "doctor";
  };
  PhotoUpload: {
    role: "patient" | "doctor";
    userData: {
      firstName: string;
      lastName: string;
      userName: string;
      email: string;
      mobilePhone: string;
      gender: string;
      birthDate: string;
      password: string;
      confirmedPassword: string;
      doctorData?: {
        specialty: string;
        yearsOfExperience: number | string;
        education: Array<{
          degree: string;
          institution: string;
          graduationYear: number;
        }>;
        certifications: string[];
        hospitalAffiliations: Array<{
          name: string;
        }>;
        clinicBranches: Array<{
          address: {
            street: string;
            city: string;
            country: string;
            buildingNumber?: number;
            buildingName?: string;
            neighborhood?: string;
            coordinates: {
              longitude: number;
              latitude: number;
            };
          };
          phoneNumber: string;
        }>;
        verificationId?: string;
        verificationDocumentType?: string;
        verificationDocumentName?: string;
      };
    };
  };
  EmailVerification: {
    emailToken: string | null;
  };
  ResetPasswordEmail: undefined;
  ResetPasswordVerification: {
    email: string;
    emailToken: string;
  };
  NewPassword: {
    email: string;
    emailToken: string;
  };
  MainTabs: undefined;
  Drawer: {
    screen?: keyof DrawerParamList;
  } | undefined;
  DoctorDrawer: {
    screen?: keyof DoctorDrawerParamList;
  } | undefined;
  PDFViewerTest: undefined;
  LabResult: {
    filePath: string;
    title?: string;
  };
};

export type TabParamList = {
  HomeTab: undefined;
  CalendarTab: undefined;
  AIBotTab: undefined;
  MedicationsTab: undefined;
  ProfileTab: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = BottomTabScreenProps<
  TabParamList,
  T
>;

export type DrawerParamList = {
  MainTabs: undefined;
  Appointments: undefined;
  MedicalHistory: undefined;
  Prescriptions: undefined;
  Telemedicine: undefined;
  Notifications: undefined;
  Payments: undefined;
  PDFViewerTest: undefined;
  LabResult: {
    filePath: string;
    title?: string;
  };
};

export type DoctorDrawerParamList = {
  DoctorHome: undefined;
  DoctorDashboard: undefined;
  DoctorAppointments: undefined;
  DoctorPrescriptions: undefined;
  DoctorProfile: undefined;
  DoctorClinicLocation: undefined;
  PatientList: undefined;
  PatientMedicalHistory: { patientId: string };
  TelemedicineSessions: undefined;
  DoctorTelemedicine: { session?: import('./telemedicine').TelemedicineSession } | undefined;
  DoctorNotifications: undefined;
  DoctorPayments: undefined;
  TelemedicineTest: undefined;
  Availability: undefined;
  LabResult: {
    filePath: string;
    title?: string;
  };
};

// Define our own DrawerScreenProps type without importing from @react-navigation/drawer
export type DrawerScreenProps<T extends keyof DrawerParamList> = {
  navigation: any;
  route: {
    key: string;
    name: T;
    params?: DrawerParamList[T];
  };
};
