import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquare,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useState } from "react";

type Page = "dashboard" | "clients" | "compose" | "invoices" | "replies";

interface LayoutProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: {
  id: Page;
  label: string;
  icon: typeof LayoutDashboard;
  ocid: string;
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    ocid: "nav.dashboard_link",
  },
  { id: "clients", label: "Clients", icon: Users, ocid: "nav.clients_link" },
  {
    id: "compose",
    label: "Compose",
    icon: MessageSquare,
    ocid: "nav.compose_link",
  },
  {
    id: "invoices",
    label: "Invoices",
    icon: FileText,
    ocid: "nav.invoices_link",
  },
  {
    id: "replies",
    label: "Replies",
    icon: MessageCircle,
    ocid: "nav.replies_link",
  },
];

export default function Layout({
  children,
  currentPage,
  onNavigate,
}: LayoutProps) {
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="px-4 py-6 border-b"
        style={{ borderColor: "oklch(0.28 0.07 260)" }}
      >
        <div className="flex items-center gap-3">
          <img
            src="/assets/uploads/Final-Crop-Gif-1.gif"
            alt="AMKY & Co."
            className="h-10 w-auto object-contain flex-shrink-0"
          />
          <div>
            <h1
              className="text-sm font-display font-bold leading-tight"
              style={{ color: "oklch(0.78 0.14 85)" }}
            >
              AMKY & Co.
            </h1>
            <p className="text-xs" style={{ color: "oklch(0.65 0.03 260)" }}>
              Chartered Accountants
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              data-ocid={item.ocid}
              onClick={() => {
                onNavigate(item.id);
                setMobileOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active ? "text-foreground" : "hover:opacity-80",
              )}
              style={
                active
                  ? {
                      background: "oklch(0.78 0.14 85)",
                      color: "oklch(0.15 0.04 260)",
                    }
                  : {
                      color: "oklch(0.80 0.03 260)",
                    }
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-4 py-4 border-t"
        style={{ borderColor: "oklch(0.28 0.07 260)" }}
      >
        <div className="flex items-start gap-2 mb-3">
          <MapPin
            className="h-3 w-3 mt-0.5 flex-shrink-0"
            style={{ color: "oklch(0.60 0.03 260)" }}
          />
          <p
            className="text-xs leading-relaxed"
            style={{ color: "oklch(0.55 0.03 260)" }}
          >
            Shop No 28, Palika Bazar, Ghodbunder Rd, Kapurbawdi, Thane West,
            Maharashtra 400607
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start gap-2 text-xs"
          style={{ color: "oklch(0.60 0.03 260)" }}
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "oklch(0.97 0.005 260)" }}
    >
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-56 flex-shrink-0"
        style={{ background: "oklch(0.19 0.07 260)" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -224 }}
              animate={{ x: 0 }}
              exit={{ x: -224 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-56 flex flex-col"
              style={{ background: "oklch(0.19 0.07 260)" }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-1"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Building2
              className="h-4 w-4"
              style={{ color: "oklch(0.78 0.14 85)" }}
            />
            <span
              className="font-display font-semibold text-sm"
              style={{ color: "oklch(0.26 0.09 260)" }}
            >
              AMKY & Co.
            </span>
          </div>
          <div className="w-7" />
        </header>

        <main className="flex-1 overflow-auto">{children}</main>

        <footer className="py-3 px-6 text-center border-t border-border">
          <p className="text-xs" style={{ color: "oklch(0.60 0.03 260)" }}>
            © {new Date().getFullYear()} AMKY & Co. Built with ❤ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
