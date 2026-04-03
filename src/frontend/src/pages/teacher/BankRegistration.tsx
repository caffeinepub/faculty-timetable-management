import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Lock, Save } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useBankStore } from "../../store/useBankStore";
import type { FacultyProfile } from "../../types/models";

interface BankRegistrationProps {
  profile: FacultyProfile;
}

export function BankRegistration({ profile }: BankRegistrationProps) {
  const { getBankDetailsByFaculty, saveBankDetails } = useBankStore();
  const existing = getBankDetailsByFaculty(profile.id);
  const isLocked = existing?.isLocked ?? false;

  const [bankName, setBankName] = useState(existing?.bankName ?? "");
  const [branch, setBranch] = useState(existing?.branch ?? "");
  const [ifscCode, setIfscCode] = useState(existing?.ifscCode ?? "");
  const [accountNumber, setAccountNumber] = useState(
    existing?.accountNumber ?? "",
  );
  const [mobileNumber, setMobileNumber] = useState(
    existing?.mobileNumber ?? profile.phone ?? "",
  );
  const [panNumber, setPanNumber] = useState(existing?.panNumber ?? "");
  const [email, setEmail] = useState(existing?.email ?? profile.email ?? "");
  const [address, setAddress] = useState(existing?.address ?? "");

  const handleSave = () => {
    if (!bankName || !branch || !ifscCode || !accountNumber || !panNumber) {
      toast.error("कृपया सभी आवश्यक खाने भरें / Please fill all required fields");
      return;
    }
    saveBankDetails({
      facultyId: profile.id,
      bankName,
      branch,
      ifscCode,
      accountNumber,
      mobileNumber,
      panNumber,
      email,
      address,
    });
    toast.success("बैंक जानकारी सहेजी गई / Bank details saved and locked");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
      data-ocid="bank_registration.page"
    >
      <div className="flex items-center gap-3 mb-2">
        <Building2 className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-bold">बैंक पंजीकरण / Bank Registration</h2>
          <p className="text-xs text-muted-foreground">
            बैंक खाते की जानकारी दर्ज करें / Register your bank account details
          </p>
        </div>
      </div>

      {isLocked && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <Lock className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-amber-700">
              खाता संख्या और पैन लॉक / Account Number &amp; PAN Locked
            </p>
            <p className="text-xs text-amber-600">
              पहली जमा के बाद ताला लग गया / These fields are permanently locked
              after first submission
            </p>
          </div>
        </div>
      )}

      <Card className="border-border shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              बैंक विवरण / Bank Details
            </CardTitle>
            {isLocked && (
              <Badge className="bg-amber-100 text-amber-700 border border-amber-200 text-xs">
                <Lock className="w-3 h-3 mr-1" /> Partially Locked
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">बैंक नाम / Bank Name *</Label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. State Bank of India"
                className="mt-1"
                data-ocid="bank_registration.bank_name.input"
              />
            </div>
            <div>
              <Label className="text-xs">शाखा / Branch *</Label>
              <Input
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. Main Branch"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">IFSC कोड / IFSC Code *</Label>
              <Input
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="e.g. SBIN0001234"
                className="mt-1"
              />
            </div>
            <div className="relative">
              <Label className="text-xs flex items-center gap-1">
                खाता संख्या / Account Number *{" "}
                {isLocked && <Lock className="w-3 h-3 text-amber-500" />}
              </Label>
              <Input
                value={accountNumber}
                onChange={
                  isLocked ? undefined : (e) => setAccountNumber(e.target.value)
                }
                readOnly={isLocked}
                placeholder="Enter account number"
                className={`mt-1 ${isLocked ? "bg-secondary cursor-not-allowed" : ""}`}
                data-ocid="bank_registration.account_number.input"
              />
              {isLocked && (
                <Lock className="absolute right-3 top-8 w-3.5 h-3.5 text-amber-500" />
              )}
            </div>
            <div>
              <Label className="text-xs">मोबाइल नंबर / Mobile Number *</Label>
              <Input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="relative">
              <Label className="text-xs flex items-center gap-1">
                पैन नंबर / PAN Number *{" "}
                {isLocked && <Lock className="w-3 h-3 text-amber-500" />}
              </Label>
              <Input
                value={panNumber}
                onChange={
                  isLocked
                    ? undefined
                    : (e) => setPanNumber(e.target.value.toUpperCase())
                }
                readOnly={isLocked}
                placeholder="e.g. ABCDE1234F"
                className={`mt-1 ${isLocked ? "bg-secondary cursor-not-allowed" : ""}`}
                data-ocid="bank_registration.pan_number.input"
              />
              {isLocked && (
                <Lock className="absolute right-3 top-8 w-3.5 h-3.5 text-amber-500" />
              )}
            </div>
            <div>
              <Label className="text-xs">इमेल / Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">पता / Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full address"
              className="mt-1"
            />
          </div>

          {!isLocked && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
              ⚠️ जमा करने के बाद खाता संख्या और पैन नंबर हमेशा के लिए लॉक हो जाएंगे। /
              After submission, Account Number and PAN will be permanently
              locked.
            </div>
          )}

          <Button
            onClick={handleSave}
            className="w-full"
            data-ocid="bank_registration.submit_button"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLocked ? "अपडेट करें / Update Details" : "जमा करें / Submit & Lock"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
