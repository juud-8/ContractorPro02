import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Quote, UserPlus, BarChart } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import InvoiceBuilder from "@/components/invoices/invoice-builder";

export default function QuickActions() {
  const [, setLocation] = useLocation();
  const [invoiceBuilderOpen, setInvoiceBuilderOpen] = useState(false);

  return (
    <>
      <Card className="contractor-border-slate-200">
        <CardHeader>
          <CardTitle className="contractor-text-slate-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={() => setInvoiceBuilderOpen(true)}
            className="w-full contractor-bg-primary-500 hover:contractor-bg-primary-600 text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            Create New Invoice
          </Button>
          <Button 
            variant="outline"
            onClick={() => setLocation("/quotes")}
            className="w-full contractor-text-slate-700 border-slate-300 hover:contractor-bg-slate-50"
          >
            <Quote className="w-4 h-4 mr-2" />
            Generate Quote
          </Button>
          <Button 
            variant="outline"
            onClick={() => setLocation("/customers")}
            className="w-full contractor-text-slate-700 border-slate-300 hover:contractor-bg-slate-50"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
          <Button 
            variant="outline"
            onClick={() => setLocation("/reports")}
            className="w-full contractor-text-slate-700 border-slate-300 hover:contractor-bg-slate-50"
          >
            <BarChart className="w-4 h-4 mr-2" />
            View Reports
          </Button>
        </CardContent>
      </Card>
      
      <InvoiceBuilder 
        open={invoiceBuilderOpen} 
        onClose={() => setInvoiceBuilderOpen(false)} 
      />
    </>
  );
}
