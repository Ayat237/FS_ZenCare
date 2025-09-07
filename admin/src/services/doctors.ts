import {
  PendingDoctorsResponse,
  VerifyDoctorRequest,
  VerifyDoctorResponse,
  PendingDoctor,
} from "../types/doctor";

// Dummy data for pending doctors
const generateDummyDoctors = (): PendingDoctor[] => {
  // Generate realistic medical license ID
  const generateLicenseId = (index: number): string => {
    const prefixes = ["MOH", "DHA", "HAAD", "DOH"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const year = new Date().getFullYear();
    const randomNum =
      String(index).padStart(3, "0") +
      Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
    return `${prefix}-${year}-${randomNum}`;
  };

  const specialties = [
    "Cardiology",
    "Dermatology",
    "Emergency Medicine",
    "Family Medicine",
    "Internal Medicine",
    "Neurology",
    "Pediatrics",
    "Psychiatry",
    "Radiology",
    "Surgery",
  ];

  const genders = ["male", "female"];

  const firstNames = {
    male: [
      "Ahmed",
      "Mohammad",
      "Omar",
      "Ali",
      "Hassan",
      "Khalid",
      "Youssef",
      "Fadi",
      "Sami",
      "Nasser",
      "Tareq",
      "Waleed",
    ],
    female: [
      "Sarah",
      "Fatima",
      "Aisha",
      "Maryam",
      "Layla",
      "Nour",
      "Reem",
      "Zeinab",
      "Dina",
      "Hala",
      "Rana",
      "Lina",
    ],
  };

  const lastNames = [
    "Al-Ahmad",
    "Al-Hassan",
    "Al-Mohammad",
    "Al-Ali",
    "Mansour",
    "Khalil",
    "Salem",
    "Nasser",
    "Al-Zahra",
    "Abdallah",
    "Qasemi",
    "Al-Rashid",
  ];

  const hospitals = [
    "Dubai Hospital",
    "American Hospital Dubai",
    "Mediclinic Dubai",
    "NMC Royal Hospital",
    "Aster Hospital",
    "Prime Hospital",
    "Saudi German Hospital",
    "Burjeel Hospital",
  ];

  const universities = [
    "University of Dubai Medical School",
    "UAE University College of Medicine",
    "Cairo University Faculty of Medicine",
    "Jordan University of Science and Technology",
    "King Saud University College of Medicine",
    "American University of Beirut Faculty of Medicine",
  ];

  // Professional doctor photos from Unsplash
  const doctorImages = [
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1594824226240-1b23654ce4e8?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1627089772746-86ede9b003f5?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1594824226240-1b23654ce4e8?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1582053433976-25c00369fc93?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1612531420627-c2d0aa5a4555?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1594824226240-1b23654ce4e8?w=400&h=400&fit=crop&crop=face",
  ];

  const dummyDoctors: PendingDoctor[] = [];

  for (let i = 1; i <= 12; i++) {
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const firstName =
      firstNames[gender as keyof typeof firstNames][
        Math.floor(
          Math.random() * firstNames[gender as keyof typeof firstNames].length
        )
      ];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const specialty =
      specialties[Math.floor(Math.random() * specialties.length)];
    const hospital = hospitals[Math.floor(Math.random() * hospitals.length)];
    const university =
      universities[Math.floor(Math.random() * universities.length)];
    const graduationYear = 2010 + Math.floor(Math.random() * 13); // 2010-2022
    const experience = new Date().getFullYear() - graduationYear;

    // Create realistic Gmail address
    const emailUsername = `${firstName.toLowerCase()}.${lastName
      .toLowerCase()
      .replace("al-", "")
      .replace("-", "")}${Math.floor(Math.random() * 99) + 1}`;
    const email = `${emailUsername}@gmail.com`;

    dummyDoctors.push({
      userId: email,
      firstName: firstName,
      lastName: lastName,
      email: email,
      gender: gender,
      doctorData: {
        specialty: specialty,
        yearsOfExperience: experience.toString(),
        education: [
          {
            degree: "Doctor of Medicine (MD)",
            institution: university,
            graduationYear: graduationYear,
          },
          ...(Math.random() > 0.5
            ? [
                {
                  degree: `${specialty} Residency`,
                  institution: hospital,
                  graduationYear: graduationYear + 4,
                },
              ]
            : []),
        ],
        certifications: [
          `Board Certified in ${specialty}`,
          ...(Math.random() > 0.6 ? ["Advanced Life Support (ALS)"] : []),
          ...(Math.random() > 0.7 ? ["Medical Research Certificate"] : []),
        ],
        hospitalAffiliation: [
          { name: hospital },
          ...(Math.random() > 0.6
            ? [
                {
                  name: hospitals[Math.floor(Math.random() * hospitals.length)],
                },
              ]
            : []),
        ],
        clinicBranches: [
          {
            address: {
              displayName: `${hospital} - Dubai Healthcare City, Dubai, UAE`,
              coordinates: {
                latitude: 25.2048 + (Math.random() - 0.5) * 0.1,
                longitude: 55.2708 + (Math.random() - 0.5) * 0.1,
              },
            },
            phoneNumber: `+971 4 ${Math.floor(Math.random() * 900) + 100} ${
              Math.floor(Math.random() * 9000) + 1000
            }`,
          },
          ...(Math.random() > 0.7
            ? [
                {
                  address: {
                    displayName: `${firstName} ${lastName} Private Clinic - Dubai Marina, Dubai, UAE`,
                    coordinates: {
                      latitude: 25.0772 + (Math.random() - 0.5) * 0.1,
                      longitude: 55.1392 + (Math.random() - 0.5) * 0.1,
                    },
                  },
                  phoneNumber: `+971 50 ${
                    Math.floor(Math.random() * 900) + 100
                  } ${Math.floor(Math.random() * 9000) + 1000}`,
                },
              ]
            : []),
        ],
      },
      profileImageObject: {
        URL: {
          secure_url: doctorImages[i - 1] || doctorImages[0],
          public_id: `doctor_profile_${i}`,
        },
        customId: `doctor_${i}_profile_image`,
      },
      verificationId: generateLicenseId(i),
    });
  }

  return dummyDoctors;
};

export const doctorService = {
  async getPendingDoctors(): Promise<PendingDoctorsResponse> {
    try {
      console.log("🔍 ADMIN WEB: Fetching pending doctors (dummy mode)...");

      // Always return dummy data - no API calls
      const dummyData: PendingDoctorsResponse = {
        success: true,
        message: "Pending doctors retrieved successfully (dummy data)",
        data: {
          doctors: generateDummyDoctors(),
        },
      };

      console.log(
        "🔍 ADMIN WEB: Returning dummy doctors:",
        dummyData.data.doctors.length
      );
      return dummyData;
    } catch (error: any) {
      console.error("🔍 ADMIN WEB: Get pending doctors error:", error);
      throw new Error("Failed to fetch pending doctors");
    }
  },

  async verifyDoctor(
    userId: string,
    verificationData: VerifyDoctorRequest
  ): Promise<VerifyDoctorResponse> {
    try {
      console.log(
        `🔍 ADMIN WEB: Verifying doctor ${userId} with data (dummy mode):`,
        verificationData
      );

      // Always return dummy success response - no API calls
      const result = {
        success: true,
        message: verificationData.isAdminApproved
          ? `Doctor ${userId} has been approved successfully (dummy)`
          : `Doctor ${userId} has been rejected (dummy)`,
        data: {
          doctor: { id: userId, verified: verificationData.isAdminApproved },
        },
      };

      console.log("🔍 ADMIN WEB: Dummy verification result:", result);
      return result;
    } catch (error: any) {
      console.error("🔍 ADMIN WEB: Verify doctor error:", error);
      throw new Error("Failed to verify doctor");
    }
  },
};
