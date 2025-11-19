import { cn } from "@/lib/utils";
import tasklyLogo from "@/assets/taskly-logo.png";

interface LogoProps {
  collapsed?: boolean;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export const Logo = ({ collapsed = false, className }: LogoProps) => {
  return (
    <div className={cn("flex items-center", className)}>
      <img 
        src={tasklyLogo} 
        alt="TASKLY" 
        className={cn("h-8 w-auto object-contain", collapsed && "h-6")}
      />
    </div>
  );
};
