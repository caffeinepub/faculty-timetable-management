import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Save, User } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useFacultyStore } from "../../store/useFacultyStore";
import type { FacultyProfile } from "../../types/models";

interface ProfileProps {
  profile: FacultyProfile;
}

export function Profile({ profile }: ProfileProps) {
  const { updateFaculty } = useFacultyStore();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [qualifications, setQualifications] = useState(profile.qualifications);
  const [department, setDepartment] = useState(profile.department ?? "");
  const [designation, setDesignation] = useState(profile.designation ?? "");
  const [photoUrl, setPhotoUrl] = useState(profile.photoUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    // Use FileReader for local preview (real app would upload to blob storage)
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoUrl(ev.target?.result as string);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateFaculty(profile.id, {
      name,
      email,
      phone,
      qualifications,
      department,
      designation,
      photoUrl: photoUrl || undefined,
    });
    toast.success("प्रोफाइल अपडेट / Profile updated");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
      data-ocid="teacher_profile.page"
    >
      <div className="flex items-center gap-3 mb-2">
        <User className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-bold">मेरी प्रोफाइल / My Profile</h2>
          <p className="text-xs text-muted-foreground">
            Update your personal information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Photo section */}
        <Card className="border-border shadow-card">
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                {photoUrl && <AvatarImage src={photoUrl} />}
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                disabled={uploading}
                data-ocid="teacher_profile.upload_button"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">{name}</p>
              <p className="text-xs text-muted-foreground">{designation}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {department}
              </p>
            </div>
            <div className="w-full bg-secondary rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">अनुमोदन स्थिति</p>
              <p className="text-sm font-semibold capitalize text-green-600">
                {profile.approvalStatus}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Edit form */}
        <Card className="lg:col-span-2 border-border shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              व्यक्तिगत जानकारी / Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">नाम / Full Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                  data-ocid="teacher_profile.name.input"
                />
              </div>
              <div>
                <Label className="text-xs">इमेल / Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  data-ocid="teacher_profile.email.input"
                />
              </div>
              <div>
                <Label className="text-xs">फोन / Phone</Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                  data-ocid="teacher_profile.phone.input"
                />
              </div>
              <div>
                <Label className="text-xs">विभाग / Department</Label>
                <Input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">पदनाम / Designation</Label>
                <Input
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">योग्यता / Qualifications</Label>
              <Textarea
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                className="mt-1 h-20 text-sm"
                data-ocid="teacher_profile.qualifications.textarea"
              />
            </div>
            <Button
              onClick={handleSave}
              className="w-full"
              data-ocid="teacher_profile.save_button"
            >
              <Save className="w-4 h-4 mr-2" />
              सहेजें / Save Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
