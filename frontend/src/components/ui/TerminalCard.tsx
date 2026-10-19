import React from "react";

interface TerminalCardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export function TerminalCard({
  title,
  subtitle,
  action,
  icon,
  children,
  className = "",
  headerClassName = "",
  bodyClassName = "",
}: TerminalCardProps) {
  return (
    <div className={`terminal-panel flex flex-col overflow-hidden ${className}`}>
      {title && (
        <div className={`terminal-header flex items-center justify-between shrink-0 select-none ${headerClassName}`}>
          <div className="flex items-center gap-2 min-w-0">
            {icon && <span className="text-amber-500 shrink-0">{icon}</span>}
            <div className="flex items-baseline gap-2 truncate">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200 truncate">
                {title}
              </span>
              {subtitle && (
                <span className="text-[10px] text-slate-500 font-mono hidden sm:inline truncate">
                  {subtitle}
                </span>
              )}
            </div>
          </div>
          {action && <div className="flex items-center gap-1.5 shrink-0 ml-2">{action}</div>}
        </div>
      )}
      <div className={`p-3 flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
}

export default TerminalCard;
