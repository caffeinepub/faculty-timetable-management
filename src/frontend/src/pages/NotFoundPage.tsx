import { Button } from "@/components/ui/button";
import { Home, SearchX } from "lucide-react";
import { motion } from "motion/react";
import { useNavigation } from "../App";

export function NotFoundPage() {
  const { navigate } = useNavigation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[70vh] text-center"
      data-ocid="not_found.page"
    >
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <SearchX className="w-10 h-10 text-muted-foreground" />
      </div>
      <h1 className="text-5xl font-bold text-foreground mb-2">404</h1>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        पृष्ठ नहीं मिला / Page Not Found
      </h2>
      <p className="text-muted-foreground mb-6 max-w-xs">
        The page you are looking for doesn't exist or has been moved. Please
        navigate back to your dashboard.
      </p>
      <Button
        onClick={() => navigate("/")}
        className="gap-2"
        data-ocid="not_found.go_home.button"
      >
        <Home className="w-4 h-4" />
        डैशबोर्ड पर जाएं / Go to Dashboard
      </Button>
    </motion.div>
  );
}
