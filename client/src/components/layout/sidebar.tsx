import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Quote,
  Users,
  BarChart3,
  Settings,
  X,
  CreditCard,
  Receipt,
  Clock,
  CheckSquare,
  Bell,
  UserCheck,
  Package
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Quotes", href: "/quotes", icon: Quote },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Time Tracking", href: "/time-tracking", icon: Clock },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Teams", href: "/teams", icon: UserCheck },
  { name: "Parts", href: "/parts", icon: Package },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm border-r contractor-border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 contractor-bg-primary-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h1 className="ml-3 text-xl font-bold contractor-text-slate-900">
                  TradeInvoice Pro
                </h1>
              </div>
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-md contractor-text-slate-400 hover:contractor-text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 pb-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "contractor-bg-primary-50 contractor-text-primary-700"
                          : "contractor-text-slate-600 hover:contractor-bg-slate-50 hover:contractor-text-slate-900"
                      )}
                      onClick={onClose}
                    >
                      <Icon
                        className={cn(
                          "mr-3 h-5 w-5 transition-colors",
                          isActive
                            ? "contractor-text-primary-500"
                            : "contractor-text-slate-400 group-hover:contractor-text-slate-500"
                        )}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* User Profile */}
          <div className="px-4 py-6 border-t contractor-border-slate-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium contractor-text-slate-700">
                  JD
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium contractor-text-slate-900">
                  John Doe
                </p>
                <p className="text-xs contractor-text-slate-500">
                  Doe Construction
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
