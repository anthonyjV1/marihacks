import { cn } from "@/lib/utils"
import {Loader} from "lucide-react"

export const LoaderPage = ({ className }: { className?: string }) => {
  return (
    <div className={cn(
      "fixed inset-0 flex items-center justify-center bg-white z-[1000]", // Ensure it fully covers the screen
      className
    )}>
      <Loader className="w-6 h-6 animate-spin" />
    </div>
  );
};
