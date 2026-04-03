import { useLocalStorage } from "../hooks/useLocalStorage";
import type { SystemSettings } from "../types/models";

const DEFAULT_SETTINGS: SystemSettings = {
  institutionName: "FTMS Institute",
  institutionNameHindi: "एफटीएमएस संस्थान",
  ratePerHour: 800,
  tdsThreshold: 45000,
  tdsRate: 0.1,
  academicYear: "2025-26",
  address: "123 Education Street, Knowledge City, Rajasthan - 302001",
  phone: "+91-141-2345678",
  email: "admin@ftms.edu.in",
  logoUrl: "",
};

export function useSettingsStore() {
  const [settings, setSettings] = useLocalStorage<SystemSettings>(
    "ftms_settings",
    DEFAULT_SETTINGS,
  );

  const updateSettings = (updates: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetSettings = () => setSettings(DEFAULT_SETTINGS);

  return { settings, updateSettings, resetSettings };
}
