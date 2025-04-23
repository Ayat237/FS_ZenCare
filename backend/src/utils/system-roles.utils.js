export const systemRoles= {
    DOCTOR:"doctor",
    PATIENT : "patient",
}

const {DOCTOR, PATIENT,} = systemRoles;
export const possibleRoles = {
    DOCTOR : DOCTOR,
    PATIENT : PATIENT,
    DOCTOR_PATIENT_ROLE : [DOCTOR, PATIENT]
}