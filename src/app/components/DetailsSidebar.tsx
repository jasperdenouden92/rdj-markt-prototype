import { type ReactNode } from "react";

/**
 * DetailsSidebar — reusable sidebar shell with optional tabs,
 * used for cargo/vessel detail views.
 */

export interface DetailsSidebarTab {
  id: string;
  label: string;
}

export interface DetailsSidebarProps {
  /** Sidebar tabs — if omitted, no tab bar is shown */
  tabs?: DetailsSidebarTab[];

  /** Currently active tab id */
  activeTab?: string;

  /** Tab change callback */
  onTabChange?: (tabId: string) => void;

  /** Sidebar width (px), defaults to 400 */
  width?: number;

  /** Sidebar content */
  children: ReactNode;

  /** Optional extra className on the root */
  className?: string;

  /** Whether the sidebar is collapsed */
  collapsed?: boolean;
}

export default function DetailsSidebar({
  tabs,
  activeTab,
  onTabChange,
  width = 400,
  children,
  className,
  collapsed = false,
}: DetailsSidebarProps) {
  return (
    <div
      className={`shrink-0 relative overflow-hidden transition-[width] duration-150 ease-out ${collapsed ? "border-l-0" : "border-l border-rdj-border-secondary"} ${className || ""}`}
      style={{ width: collapsed ? 0 : width }}
    >
      <div className="flex flex-col items-center h-full" style={{ width }}>
        <div className="content-stretch flex flex-col gap-[16px] items-center pt-[16px] px-[24px] relative size-full overflow-y-auto">
          {/* Tab bar */}
          {tabs && tabs.length > 0 && (
            <div className="content-stretch flex flex-col gap-[10px] items-start pb-[16px] relative shrink-0 w-full">
              <div
                aria-hidden="true"
                className="absolute border-rdj-border-secondary border-b border-solid inset-[0_0_-1px_0] pointer-events-none"
              />
              <div className="content-stretch flex gap-[4px] h-[40px] items-center relative shrink-0 w-full">
                {tabs.map((tab) => {
                  const isActive = tab.id === activeTab;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange?.(tab.id)}
                      className={`h-full relative rounded-[4px] shrink-0 ${
                        isActive ? "bg-rdj-bg-brand" : ""
                      }`}
                    >
                      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                        <div className="content-stretch flex h-full items-center justify-center px-[12px] py-[8px] relative">
                          <p
                            className={`font-sans font-bold leading-[20px] relative shrink-0 text-[14px] whitespace-nowrap ${
                              isActive
                                ? "text-rdj-text-primary"
                                : "text-rdj-text-tertiary"
                            }`}
                          >
                            {tab.label}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Section helper ── */

export interface DetailsSidebarSectionProps {
  /** Optional section title */
  title?: string;
  /** Optional description text above the rows */
  description?: string;
  /** Section content (typically DetailRow components) */
  children: ReactNode;
}

export function DetailsSidebarSection({
  title,
  description,
  children,
}: DetailsSidebarSectionProps) {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full pb-[16px]">
      {title && (
        <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px] w-full">
          {title}
        </p>
      )}
      {description && (
        <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px] w-full">
          {description}
        </p>
      )}
      <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full">
        {children}
      </div>
    </div>
  );
}
