export const systemRoles= {
    DOCTOR:"doctor",
    PATIENT : "patient",
    ADMIN : "admin",
}

const {DOCTOR, PATIENT, ADMIN} = systemRoles;
export const possibleRoles = {
    DOCTOR : DOCTOR,
    PATIENT : PATIENT,
    DOCTOR_PATIENT_ROLE : [DOCTOR, PATIENT],
    ADMIN : ADMIN,
    ADMIN_DOCTOR_PATIENT_ROLE : [ADMIN, DOCTOR, PATIENT],
    ADMIN_DOCTOR_ROLE : [ADMIN, DOCTOR]
}