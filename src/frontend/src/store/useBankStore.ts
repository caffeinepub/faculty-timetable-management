import { useLocalStorage } from "../hooks/useLocalStorage";
import type { BankDetails } from "../types/models";

export function useBankStore() {
  const [bankDetails, setBankDetails] = useLocalStorage<BankDetails[]>(
    "ftms_bank_details",
    [],
  );

  const getBankDetailsByFaculty = (facultyId: string) =>
    bankDetails.find((b) => b.facultyId === facultyId) ?? null;

  const saveBankDetails = (
    details: Omit<BankDetails, "isLocked" | "submittedAt">,
  ) => {
    const existing = bankDetails.find((b) => b.facultyId === details.facultyId);
    if (existing?.isLocked) {
      // Only update non-locked fields
      setBankDetails((prev) =>
        prev.map((b) =>
          b.facultyId === details.facultyId
            ? {
                ...b,
                bankName: details.bankName,
                branch: details.branch,
                ifscCode: details.ifscCode,
                mobileNumber: details.mobileNumber,
                email: details.email,
                address: details.address,
                // accountNumber and panNumber remain locked
              }
            : b,
        ),
      );
    } else {
      const newDetails: BankDetails = {
        ...details,
        isLocked: true, // Lock on first save
        submittedAt: new Date().toISOString(),
      };
      if (existing) {
        setBankDetails((prev) =>
          prev.map((b) => (b.facultyId === details.facultyId ? newDetails : b)),
        );
      } else {
        setBankDetails((prev) => [...prev, newDetails]);
      }
    }
  };

  return { bankDetails, getBankDetailsByFaculty, saveBankDetails };
}
