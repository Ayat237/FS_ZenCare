import { useState, FC } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doctorService } from "@/services/doctors";
import { PendingDoctor } from "@/types/doctor";
import { Eye, Check, X, MapPin, GraduationCap, UserCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const DoctorModal: FC<{
  doctor: PendingDoctor | null;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (userId: string, approved: boolean) => void;
}> = ({ doctor, isOpen, onClose, onVerify }) => {
  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Doctor Verification
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <img
              src={doctor.profileImageObject.URL.secure_url}
              alt="Doctor"
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold">
                Dr. {doctor.firstName} {doctor.lastName}
              </h3>
              <p className="text-gray-600">{doctor.doctorData.specialty}</p>
              <p className="text-sm text-gray-500">
                {doctor.doctorData.yearsOfExperience} years experience
              </p>
              <p className="text-sm text-gray-500">{doctor.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <GraduationCap className="mr-2 h-5 w-5" />
                Education
              </h4>
              <div className="space-y-2">
                {doctor.doctorData.education.map((edu, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded">
                    <p className="font-medium">{edu.degree}</p>
                    <p className="text-sm text-gray-600">{edu.institution}</p>
                    <p className="text-xs text-gray-500">
                      Graduated: {edu.graduationYear}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Certifications</h4>
              <div className="space-y-2">
                {doctor.doctorData.certifications.map((cert, index) => (
                  <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                    {cert}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Hospital Affiliations</h4>
              <div className="space-y-2">
                {doctor.doctorData.hospitalAffiliation.map(
                  (hospital, index) => (
                    <div
                      key={index}
                      className="p-2 bg-green-50 rounded text-sm"
                    >
                      {hospital.name}
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Clinic Locations
              </h4>
              <div className="space-y-2">
                {doctor.doctorData.clinicBranches.map((clinic, index) => (
                  <div key={index} className="p-3 bg-yellow-50 rounded">
                    <p className="text-sm font-medium">
                      {clinic.address.displayName}
                    </p>
                    <p className="text-xs text-gray-600">
                      {clinic.phoneNumber}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Verification Documents Section */}
          <div className="mt-6">
            <h4 className="font-semibold mb-3 flex items-center">
              <UserCheck className="mr-2 h-5 w-5" />
              Medical License ID
            </h4>
            {doctor.verificationId ? (
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg max-w-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-medium">MEDICAL LICENSE</div>
                  <div className="text-xs opacity-75">UAE MOH</div>
                </div>

                <div className="space-y-2">
                  <div className="text-lg font-bold">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </div>
                  <div className="text-sm opacity-90">
                    {doctor.doctorData.specialty}
                  </div>
                  <div className="text-xs opacity-75">
                    License ID: {doctor.verificationId}
                  </div>
                </div>

                <div className="flex justify-between items-end mt-4">
                  <div className="text-xs opacity-75">Exp: 12/2026</div>
                  <div className="text-xs font-bold">VERIFIED</div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ No medical license ID provided
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => onVerify(doctor.userId, false)}
          >
            <X className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button onClick={() => onVerify(doctor.userId, true)}>
            <Check className="mr-2 h-4 w-4" />
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
};

const PendingDoctorsPage: FC = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<PendingDoctor | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["pending-doctors"],
    queryFn: doctorService.getPendingDoctors,
  });

  const verifyMutation = useMutation({
    mutationFn: ({ userId, approved }: { userId: string; approved: boolean }) =>
      doctorService.verifyDoctor(userId, { isAdminApproved: approved }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-doctors"] });
      setIsModalOpen(false);
      setSelectedDoctor(null);
    },
  });

  const handleViewDoctor = (doctor: PendingDoctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleVerifyDoctor = (userId: string, approved: boolean) => {
    verifyMutation.mutate({ userId, approved });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load pending doctors</p>
      </div>
    );
  }

  const pendingDoctors = data?.data.doctors || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pending Doctor Verifications
          </h1>
          <p className="text-gray-600">
            {pendingDoctors.length} doctors awaiting verification
          </p>
        </div>
      </div>

      {pendingDoctors.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No pending verifications
            </h3>
            <p className="mt-2 text-gray-600">
              All doctor applications have been processed.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingDoctors.map((doctor) => (
            <Card key={doctor.userId}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={doctor.profileImageObject.URL.secure_url}
                    alt="Doctor"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h3>
                    <p className="text-gray-600">
                      {doctor.doctorData.specialty}
                    </p>
                    <p className="text-sm text-gray-500">
                      {doctor.doctorData.yearsOfExperience} years experience
                    </p>
                    <p className="text-xs text-gray-500">{doctor.email}</p>
                    <p className="text-xs text-gray-500">
                      {doctor.doctorData.education.length} education entries,{" "}
                      {doctor.doctorData.certifications.length} certifications
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewDoctor(doctor)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Review
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleVerifyDoctor(doctor.userId, false)}
                    disabled={verifyMutation.isPending}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleVerifyDoctor(doctor.userId, true)}
                    disabled={verifyMutation.isPending}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <DoctorModal
        doctor={selectedDoctor}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDoctor(null);
        }}
        onVerify={handleVerifyDoctor}
      />
    </div>
  );
};

export default PendingDoctorsPage;
