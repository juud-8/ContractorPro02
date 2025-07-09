import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, Plus, Bell } from "lucide-react";
import { useState } from "react";
import InvoiceBuilder from "@/components/invoices/invoice-builder";

interface HeaderProps {
  onMenuClick: () => void;
}

const pageNames: Record<string, string> = {
  "/": "Dashboard",
  "/invoices": "Invoices",
  "/quotes": "Quotes", 
  "/customers": "Customers",
  "/reports": "Reports",
  "/settings": "Settings",
};

export default function Header({ onMenuClick }: HeaderProps) {
  const [location] = useLocation();
  const [invoiceBuilderOpen, setInvoiceBuilderOpen] = useState(false);
  
  const pageName = pageNames[location] || "Page";

  return (
    <>
      <div className="bg-white shadow-sm border-b contractor-border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-md contractor-text-slate-400 hover:contractor-text-slate-500 hover:contractor-bg-slate-100"
              >
                <Menu className="h-6 w-6" />
              </Button>
              <h2 className="ml-4 lg:ml-0 text-2xl font-bold contractor-text-slate-900">
                {pageName}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setInvoiceBuilderOpen(true)}
                className="contractor-bg-primary-500 hover:contractor-bg-primary-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 rounded-md contractor-text-slate-400 hover:contractor-text-slate-500 hover:contractor-bg-slate-100"
              >
                <Bell className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <InvoiceBuilder 
        open={invoiceBuilderOpen} 
        onClose={() => setInvoiceBuilderOpen(false)} 
      />
    </>
  );
}
