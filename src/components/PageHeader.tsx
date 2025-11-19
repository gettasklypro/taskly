import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export const PageHeader = ({ title, description, actions }: PageHeaderProps) => {
  return (
    <div className="border-b bg-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">{title}</h1>
          {description && (
            <p className="text-sm sm:text-base text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
