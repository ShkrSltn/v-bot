import { Link } from "react-router-dom";
import { Button } from "./ui/button";

interface ModeToggleProps {
  currentMode: "admin" | "chatbot";
}

export function ModeToggle({ currentMode }: ModeToggleProps) {
  return (
    <div className="fixed top-2 right-4 z-50">
      <Button
        asChild
        className="bg-[#A1C611] hover:bg-[#8BA80E] text-white rounded-md px-4 py-2 text-sm font-medium"
      >
        <Link to={currentMode === "admin" ? "/" : "/admin-panel"}>
          {currentMode === "admin" ? "Zum Chatbot" : "Zum Admin-Panel"}
        </Link>
      </Button>
    </div>
  );
} 