export const systemRoles= {
    DOCTOR:"doctor",
    PATIENT : "patient",
}

const {DOCTOR, PATIENT,} = systemRoles;
export const possibleRoles = {
    DOCTOR : PATIENT,
    PATIENT : PATIENT,
    DOCTOR_PATIENT_ROLE : [DOCTOR, PATIENT]
}