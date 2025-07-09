import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";
import InvoicePreview from "./invoice-preview";
import { generateInvoicePDF } from "@/lib/pdf-generator";
import { Customer } from "@shared/schema";

interface InvoiceBuilderProps {
  open: boolean;
  onClose: () => void;
}

interface LineItem {
  description: string;
  quantity: string;
  rate: string;
  amount: string;
}

export default function InvoiceBuilder({ open, onClose }: InvoiceBuilderProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    customerId: "",
    projectDescription: "",
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    taxRate: "0",
    notes: "",
    showLineItems: true,
    showLogo: true,
    showPaymentTerms: true,
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: "1", rate: "0", amount: "0" }
  ]);

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"]
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/invoices", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      invoiceNumber: "",
      customerId: "",
      projectDescription: "",
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: "",
      taxRate: "0",
      notes: "",
      showLineItems: true,
      showLogo: true,
      showPaymentTerms: true,
    });
    setLineItems([{ description: "", quantity: "1", rate: "0", amount: "0" }]);
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}${day}-${random}`;
  };

  useEffect(() => {
    if (open && !formData.invoiceNumber) {
      setFormData(prev => ({
        ...prev,
        invoiceNumber: generateInvoiceNumber()
      }));
    }
  }, [open, formData.invoiceNumber]);

  const updateLineItem = (index: number, field: keyof LineItem, value: string) => {
    const newLineItems = [...lineItems];
    newLineItems[index][field] = value;
    
    if (field === 'quantity' || field === 'rate') {
      const quantity = parseFloat(newLineItems[index].quantity) || 0;
      const rate = parseFloat(newLineItems[index].rate) || 0;
      newLineItems[index].amount = (quantity * rate).toFixed(2);
    }
    
    setLineItems(newLineItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: "1", rate: "0", amount: "0" }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const taxRate = parseFloat(formData.taxRate) || 0;
    return subtotal * (taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = () => {
    if (!formData.customerId || !formData.invoiceNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const invoiceData = {
      invoice: {
        ...formData,
        customerId: parseInt(formData.customerId),
        subtotal: calculateSubtotal().toString(),
        taxRate: formData.taxRate,
        taxAmount: calculateTax().toString(),
        total: calculateTotal().toString(),
        issueDate: new Date(formData.issueDate),
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        status: "draft",
      },
      lineItems: lineItems.map((item, index) => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        sortOrder: index,
      })),
    };

    createInvoiceMutation.mutate(invoiceData);
  };

  const handleDownloadPDF = async () => {
    if (!formData.customerId) {
      toast({
        title: "Error",
        description: "Please select a customer first",
        variant: "destructive",
      });
      return;
    }

    const customer = customers?.find(c => c.id === parseInt(formData.customerId));
    if (!customer) return;

    const invoiceData = {
      invoiceNumber: formData.invoiceNumber,
      customer,
      projectDescription: formData.projectDescription,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      lineItems: lineItems.map(item => ({
        description: item.description,
        quantity: parseFloat(item.quantity),
        rate: parseFloat(item.rate),
        amount: parseFloat(item.amount),
      })),
      subtotal: calculateSubtotal(),
      taxRate: parseFloat(formData.taxRate),
      taxAmount: calculateTax(),
      total: calculateTotal(),
      notes: formData.notes,
      showLineItems: formData.showLineItems,
      showLogo: formData.showLogo,
      showPaymentTerms: formData.showPaymentTerms,
    };

    generateInvoicePDF(invoiceData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-semibold contractor-text-slate-900 mb-4">
                Invoice Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    placeholder="INV-2024-001"
                  />
                </div>
                <div>
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold contractor-text-slate-900 mb-4">
                Customer Information
              </h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="customer">Customer</Label>
                  <Select value={formData.customerId} onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="projectDescription">Project Description</Label>
                  <Input
                    id="projectDescription"
                    value={formData.projectDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
                    placeholder="Kitchen Renovation"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold contractor-text-slate-900 mb-4">
                Line Items
              </h4>
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 text-sm font-medium contractor-text-slate-700">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-2">Rate</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-1"></div>
                </div>
                
                {lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <Input
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Description"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                        placeholder="1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateLineItem(index, 'rate', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        value={`$${item.amount}`}
                        readOnly
                        className="contractor-bg-slate-50"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button
                variant="ghost"
                onClick={addLineItem}
                className="mt-3 contractor-text-primary-600 hover:contractor-text-primary-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Line Item
              </Button>
            </div>

            <div>
              <h4 className="text-md font-semibold contractor-text-slate-900 mb-4">
                Customization Options
              </h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showLineItems"
                      checked={formData.showLineItems}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showLineItems: !!checked }))}
                    />
                    <Label htmlFor="showLineItems" className="text-sm">Show line items</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showLogo"
                      checked={formData.showLogo}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showLogo: !!checked }))}
                    />
                    <Label htmlFor="showLogo" className="text-sm">Include company logo</Label>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showPaymentTerms"
                    checked={formData.showPaymentTerms}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showPaymentTerms: !!checked }))}
                  />
                  <Label htmlFor="showPaymentTerms" className="text-sm">Show payment terms</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="contractor-bg-slate-50 rounded-lg p-6">
            <h4 className="text-md font-semibold contractor-text-slate-900 mb-4">
              Invoice Preview
            </h4>
            <InvoicePreview
              invoiceNumber={formData.invoiceNumber}
              customer={customers?.find(c => c.id === parseInt(formData.customerId))}
              projectDescription={formData.projectDescription}
              issueDate={formData.issueDate}
              lineItems={lineItems}
              subtotal={calculateSubtotal()}
              taxRate={parseFloat(formData.taxRate)}
              taxAmount={calculateTax()}
              total={calculateTotal()}
              notes={formData.notes}
              showLineItems={formData.showLineItems}
              showLogo={formData.showLogo}
              showPaymentTerms={formData.showPaymentTerms}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownloadPDF}
            disabled={!formData.customerId}
          >
            Download PDF
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createInvoiceMutation.isPending}
            className="contractor-bg-primary-500 hover:contractor-bg-primary-600"
          >
            {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
