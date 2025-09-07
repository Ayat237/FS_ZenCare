// Mock data for doctor accounts

export const dummyDoctor = {
  id: "doc001",
  userName: "dr.sarah",
  firstName: "Sarah",
  lastName: "Ibrahim",
  email: "doctor@zencare.com",
  password: "12345678",
  mobilePhone: "+201234567890",
  specialty: "Cardiology",
  yearsOfExperience: 8,
  education: [
    {
      degree: "MBBS",
      institution: "Cairo University",
      graduationYear: 2012
    },
    {
      degree: "MD",
      institution: "Ain Shams University",
      graduationYear: 2016
    }
  ],
  certifications: ["ACLS", "BLS", "PALS"],
  hospitalAffiliations: [
    { name: "El Salam Hospital" },
    { name: "Cairo Medical Center" }
  ],
  verificationId: "verification_doc_001.pdf",
  clinicBranches: [
    {
      address: {
        street: "12 Abbas El Akkad",
        city: "Cairo",
        country: "Egypt",
        buildingNumber: 5,
        buildingName: "Doctor Tower",
        neighborhood: "Nasr City",
        coordinates: {
          longitude: 31.3301,
          latitude: 30.0586
        }
      },
      phoneNumber: "01000111222"
    }
  ],
  profileImage: "https://dummyimage.com/200x200/007bff/ffffff",
  role: ["doctor"],
  activeRole: "doctor"
};