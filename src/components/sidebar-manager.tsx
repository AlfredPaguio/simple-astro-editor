// @see https://gist.github.com/inj-src/033178f989199dc74ddfc4341f4b0ff6
// and @see https://github.com/shadcn-ui/ui/issues/5651#issuecomment-3715137601

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { PanelLeftIcon } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

// A record to hold the sidebar context for each named sidebar
type SidebarRegistry = Record<string, SidebarContextProps>;

type SidebarManagerContextProps = {
  register: (name: string, context: SidebarContextProps) => void;
  unregister: (name: string) => void;
  use: (name: string) => SidebarContextProps | null;
};

const SidebarManagerContext = createContext<SidebarManagerContextProps | null>(
  null,
);

function useSidebarManager() {
  const context = useContext(SidebarManagerContext);
  if (!context) {
    throw new Error(
      "useSidebarManager must be used within a SidebarManagerProvider.",
    );
  }
  return context;
}

function SidebarManagerProvider({ children }: { children: React.ReactNode }) {
  const [sidebars, setSidebars] = useState<SidebarRegistry>({});

  const register = useCallback((name: string, context: SidebarContextProps) => {
    setSidebars((prev) => ({ ...prev, [name]: context }));
  }, []);

  const unregister = useCallback((name: string) => {
    setSidebars((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ register, unregister, use: (name: string) => sidebars[name] }),
    [register, unregister, sidebars],
  );

  return (
    <SidebarManagerContext.Provider value={value}>
      {children}
    </SidebarManagerContext.Provider>
  );
}

function SidebarManager({
  children,
  name,
}: {
  children: React.ReactNode;
  name: string;
}) {
  const sidebarContext = useSidebar();
  const manager = useSidebarManager();

  // Use refs to avoid infinite loops - we don't want changes to these
  // objects to trigger re-registration, only changes to `name` should.
  const sidebarContextRef = useRef(sidebarContext);
  const managerRef = useRef(manager);

  // Keep refs up to date
  useLayoutEffect(() => {
    sidebarContextRef.current = sidebarContext;
    managerRef.current = manager;
  });

  // Register on mount / when name changes, unregister on unmount
  useEffect(() => {
    managerRef.current.register(name, sidebarContextRef.current);
    return () => managerRef.current.unregister(name);
  }, [name]);

  // Keep the registry updated when sidebarContext changes (without causing loops)
  useEffect(() => {
    managerRef.current.register(name, sidebarContext);
  }, [name, sidebarContext]);

  return <>{children}</>;
}

function SidebarManagerTrigger({
  name,
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button> & { name: string }) {
  const manager = useSidebarManager();
  const sidebar = manager.use(name);

  return (
    <Button
      data-sidebar="manager-trigger"
      data-slot="sidebar-manager-trigger"
      data-sidebar-name={name}
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event);
        sidebar?.toggleSidebar();
      }}
      disabled={!sidebar}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle {name} Sidebar</span>
    </Button>
  );
}

export {
  SidebarManager,
  SidebarManagerProvider,
  SidebarManagerTrigger,
  useSidebarManager,
};
