import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  Clock,
  FileText,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useDocumentStore } from "../../store/useDocumentStore";
import type { FacultyProfile, TeacherDocument } from "../../types/models";

interface DocumentsProps {
  profile: FacultyProfile;
}

const DOC_STATUS_CONFIG: Record<
  TeacherDocument["status"],
  { icon: React.ReactNode; color: string }
> = {
  Pending: {
    icon: <Clock className="w-3.5 h-3.5" />,
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  Verified: {
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    color: "bg-green-100 text-green-700 border-green-200",
  },
  Rejected: {
    icon: <XCircle className="w-3.5 h-3.5" />,
    color: "bg-red-100 text-red-700 border-red-200",
  },
};

export function Documents({ profile }: DocumentsProps) {
  const { getDocumentsByTeacher, addDocument } = useDocumentStore();
  const [docType, setDocType] =
    useState<TeacherDocument["docType"]>("Qualification");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const myDocs = getDocumentsByTeacher(profile.id);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 20;
      });
    }, 200);
    await new Promise((r) => setTimeout(r, 1200));
    clearInterval(interval);
    setUploadProgress(100);
    addDocument({
      teacherId: profile.id,
      docType,
      filename: file.name,
      status: "Pending",
    });
    setUploading(false);
    setUploadProgress(0);
    if (fileRef.current) fileRef.current.value = "";
    toast.success("दस्तावेज अपलोड हुआ / Document uploaded");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
      data-ocid="documents.page"
    >
      <div className="flex items-center gap-3 mb-2">
        <FileText className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-bold">दस्तावेज / Documents</h2>
          <p className="text-xs text-muted-foreground">
            {myDocs.length} documents uploaded
          </p>
        </div>
      </div>

      {/* Upload area */}
      <Card className="border-border shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            दस्तावेज अपलोड / Upload Document
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs">दस्तावेज प्रकार / Document Type</Label>
            <Select
              value={docType}
              onValueChange={(v) => setDocType(v as TeacherDocument["docType"])}
            >
              <SelectTrigger className="mt-1" data-ocid="documents.type.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Qualification">
                  Qualification Certificate / योग्यता प्रमाणपत्र
                </SelectItem>
                <SelectItem value="IDProof">ID Proof / पहचान प्रमाण</SelectItem>
                <SelectItem value="Other">अन्य / Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button
            type="button"
            className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
            onClick={() => !uploading && fileRef.current?.click()}
            data-ocid="documents.dropzone"
          >
            {uploading ? (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5 text-primary animate-bounce" />
                </div>
                <p className="text-sm font-medium">
                  अपलोड हो रहा है... {uploadProgress}%
                </p>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  क्लिक करें या फाइल खींचें / Click or drag a file here
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, JPG, PNG up to 10MB
                </p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileSelect}
            />
          </button>

          <Button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full"
            data-ocid="documents.upload_button"
          >
            <Upload className="w-4 h-4 mr-2" />
            फाइल चुनें / Choose File
          </Button>
        </CardContent>
      </Card>

      {/* Documents list */}
      <Card className="border-border shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            अपलोड किए गए दस्तावेज / Uploaded Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2" data-ocid="documents.list">
          {myDocs.map((doc, i) => {
            const config = DOC_STATUS_CONFIG[doc.status];
            return (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
                data-ocid={`documents.item.${i + 1}`}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.docType} &bull;{" "}
                    {new Date(doc.uploadedAt).toLocaleDateString("en-IN")}
                  </p>
                  {doc.adminComment && (
                    <p className="text-xs text-muted-foreground italic">
                      {doc.adminComment}
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] flex items-center gap-1 ${config.color}`}
                >
                  {config.icon}
                  {doc.status}
                </Badge>
              </div>
            );
          })}
          {myDocs.length === 0 && (
            <div
              className="text-center py-8 text-muted-foreground"
              data-ocid="documents.empty_state"
            >
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                कोई दस्तावेज नहीं / No documents uploaded yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
