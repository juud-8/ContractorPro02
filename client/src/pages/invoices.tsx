import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Edit, Trash2, Eye, Download, Mail, CreditCard } from "lucide-react";
import { useLocation } from "wouter";
import { InvoiceWithCustomer } from "@shared/schema";
import { STATUS_COLORS } from "@/lib/constants";
import InvoiceBuilder from "@/components/invoices/invoice-builder";
import EmailSender from "@/components/email/email-sender";

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceBuilderOpen, setInvoiceBuilderOpen] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: invoices, isLoading } = useQuery<InvoiceWithCustomer[]>({
    queryKey: ["/api/invoices"]
  });

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"]
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/invoices/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete invoice",
        variant: "destructive",
      });
    },
  });

  const filteredInvoices = invoices?.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.projectDescription?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoiceMutation.mutate(id);
    }
  };

  const handleSendEmail = (invoice: InvoiceWithCustomer) => {
    // Mock email functionality
    toast({
      title: "Email Sent",
      description: `Invoice ${invoice.invoiceNumber} has been sent to ${invoice.customer.email}`,
    });
  };

  const handlePayInvoice = (invoice: InvoiceWithCustomer) => {
    if (invoice.status === 'paid') {
      toast({
        title: "Already Paid",
        description: "This invoice has already been paid",
        variant: "destructive",
      });
      return;
    }
    setLocation(`/payment-checkout/${invoice.id}`);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 contractor-bg-slate-200 rounded w-1/4" />
          <div className="h-64 contractor-bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold contractor-text-slate-900">Invoices</h1>
        <Button 
          onClick={() => setInvoiceBuilderOpen(true)}
          className="contractor-bg-primary-500 hover:contractor-bg-primary-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </div>

      <Card className="contractor-border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoice List</CardTitle>
            <div className="relative">
              <Search className="w-5 h-5 contractor-text-slate-400 absolute left-3 top-2.5" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="contractor-bg-slate-50">
                  <TableHead className="contractor-text-slate-500">Invoice</TableHead>
                  <TableHead className="contractor-text-slate-500">Customer</TableHead>
                  <TableHead className="contractor-text-slate-500">Project</TableHead>
                  <TableHead className="contractor-text-slate-500">Amount</TableHead>
                  <TableHead className="contractor-text-slate-500">Status</TableHead>
                  <TableHead className="contractor-text-slate-500">Date</TableHead>
                  <TableHead className="contractor-text-slate-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 contractor-text-slate-500">
                      {searchTerm ? "No invoices found matching your search" : "No invoices found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium contractor-text-slate-900">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell className="contractor-text-slate-500">
                        {invoice.customer.name}
                      </TableCell>
                      <TableCell className="contractor-text-slate-500">
                        {invoice.projectDescription || "—"}
                      </TableCell>
                      <TableCell className="contractor-text-slate-900">
                        ${parseFloat(invoice.total).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[invoice.status as keyof typeof STATUS_COLORS]}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="contractor-text-slate-500">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          {settings && invoice.customer.email && (
                            <EmailSender
                              customer={invoice.customer}
                              settings={settings}
                              documentType="invoice"
                              documentNumber={invoice.invoiceNumber}
                              onSend={() => handleSendEmail(invoice)}
                            />
                          )}
                          {invoice.status !== 'paid' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePayInvoice(invoice)}
                              className="text-green-600 hover:text-green-700"
                              title="Pay Invoice"
                            >
                              <CreditCard className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(invoice.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <InvoiceBuilder 
        open={invoiceBuilderOpen} 
        onClose={() => setInvoiceBuilderOpen(false)} 
      />
    </div>
  );
}
