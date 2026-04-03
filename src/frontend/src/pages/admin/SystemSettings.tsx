import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Building2, Save } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSettingsStore } from "../../store/useSettingsStore";

export function SystemSettings() {
  const { settings, updateSettings } = useSettingsStore();
  const [form, setForm] = useState(settings);
  const pf = (field: string, val: string | number) =>
    setForm((p) => ({ ...p, [field]: val }));

  const handleSave = () => {
    updateSettings(form);
    toast.success("Settings saved / सेटिंग सहेजी गई");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-3xl"
      data-ocid="settings.page"
    >
      <div>
        <h2 className="text-lg font-bold">System Settings</h2>
        <p className="text-xs text-muted-foreground">सिस्टम सेटिंग</p>
      </div>

      <Card className="border-border shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Institution Information / संस्था जानकारी
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                Institution Name (English){" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.institutionName}
                onChange={(e) => pf("institutionName", e.target.value)}
                className="mt-1"
                data-ocid="settings.institution_name.input"
              />
            </div>
            <div>
              <Label>Institution Name (Hindi)</Label>
              <Input
                value={form.institutionNameHindi}
                onChange={(e) => pf("institutionNameHindi", e.target.value)}
                className="mt-1"
                data-ocid="settings.institution_name_hindi.input"
              />
            </div>
          </div>
          <div>
            <Label>Address / पता</Label>
            <Input
              value={form.address ?? ""}
              onChange={(e) => pf("address", e.target.value)}
              className="mt-1"
              data-ocid="settings.address.input"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Phone / फ़ोन</Label>
              <Input
                value={form.phone ?? ""}
                onChange={(e) => pf("phone", e.target.value)}
                className="mt-1"
                data-ocid="settings.phone.input"
              />
            </div>
            <div>
              <Label>Email / ईमेल</Label>
              <Input
                type="email"
                value={form.email ?? ""}
                onChange={(e) => pf("email", e.target.value)}
                className="mt-1"
                data-ocid="settings.email.input"
              />
            </div>
          </div>
          <div>
            <Label>Logo URL / लोगो लिंक</Label>
            <Input
              value={form.logoUrl ?? ""}
              onChange={(e) => pf("logoUrl", e.target.value)}
              placeholder="https://..."
              className="mt-1"
              data-ocid="settings.logo_url.input"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Billing Configuration / बिलिंग कॉन्फ़िगरेशन
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 text-xs">
              Note: Changing the rate per hour will not affect previously
              submitted bills. Only new bills will use the updated rate.
            </AlertDescription>
          </Alert>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Rate per Hour (₹)</Label>
              <Input
                type="number"
                min="0"
                value={form.ratePerHour}
                onChange={(e) => pf("ratePerHour", Number(e.target.value))}
                className="mt-1"
                data-ocid="settings.rate_per_hour.input"
              />
            </div>
            <div>
              <Label>TDS Threshold (₹)</Label>
              <Input
                type="number"
                min="0"
                value={form.tdsThreshold}
                onChange={(e) => pf("tdsThreshold", Number(e.target.value))}
                className="mt-1"
                data-ocid="settings.tds_threshold.input"
              />
            </div>
            <div>
              <Label>TDS Rate (decimal)</Label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={form.tdsRate}
                onChange={(e) => pf("tdsRate", Number(e.target.value))}
                className="mt-1"
                data-ocid="settings.tds_rate.input"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {(form.tdsRate * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          <div>
            <Label>Academic Year / शैक्षिक वर्ष</Label>
            <Input
              value={form.academicYear}
              onChange={(e) => pf("academicYear", e.target.value)}
              placeholder="2025-26"
              className="mt-1 max-w-[160px]"
              data-ocid="settings.academic_year.input"
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-border shadow-card bg-gradient-to-r from-[oklch(0.265_0.075_243)] to-[oklch(0.31_0.068_243)] text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white/80">
            Preview / पूर्वावलोकन
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-xl font-bold">{form.institutionName}</div>
          <div className="text-white/70 text-sm">
            {form.institutionNameHindi}
          </div>
          {form.address && (
            <div className="text-white/60 text-xs mt-2">{form.address}</div>
          )}
          {(form.phone || form.email) && (
            <div className="text-white/60 text-xs flex gap-4">
              {form.phone && <span>{form.phone}</span>}
              {form.email && <span>{form.email}</span>}
            </div>
          )}
          <div className="text-white/50 text-[10px] mt-2">
            Academic Year: {form.academicYear} &bull; Rate: ₹{form.ratePerHour}
            /hr &bull; TDS @ {(form.tdsRate * 100).toFixed(0)}% above ₹
            {form.tdsThreshold.toLocaleString("en-IN")}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} data-ocid="settings.save_button">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </motion.div>
  );
}
