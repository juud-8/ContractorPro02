import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";
import QuotePreview from "./quote-preview";
import { generateQuotePDF } from "@/lib/pdf-generator";
import { Customer } from "@shared/schema";

interface QuoteBuilderProps {
  open: boolean;
  onClose: () => void;
}

interface LineItem {
  description: string;
  quantity: string;
  rate: string;
  amount: string;
}

export default function QuoteBuilder({ open, onClose }: QuoteBuilderProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    quoteNumber: "",
    customerId: "",
    projectDescription: "",
    issueDate: new Date().toISOString().split('T')[0],
    validUntil: "",
    taxRate: "0",
    notes: "",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: "1", rate: "0", amount: "0" }
  ]);

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"]
  });

  const createQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/quotes", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quote created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create quote",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      quoteNumber: "",
      customerId: "",
      projectDescription: "",
      issueDate: new Date().toISOString().split('T')[0],
      validUntil: "",
      taxRate: "0",
      notes: "",
    });
    setLineItems([{ description: "", quantity: "1", rate: "0", amount: "0" }]);
  };

  const generateQuoteNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `QUO-${year}${month}${day}-${random}`;
  };

  useEffect(() => {
    if (open && !formData.quoteNumber) {
      const validUntilDate = new Date();
      validUntilDate.setDate(validUntilDate.getDate() + 30); // 30 days from now
      
      setFormData(prev => ({
        ...prev,
        quoteNumber: generateQuoteNumber(),
        validUntil: validUntilDate.toISOString().split('T')[0]
      }));
    }
  }, [open, formData.quoteNumber]);

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
    if (!formData.customerId || !formData.quoteNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const quoteData = {
      quote: {
        ...formData,
        customerId: parseInt(formData.customerId),
        subtotal: calculateSubtotal().toString(),
        taxRate: formData.taxRate,
        taxAmount: calculateTax().toString(),
        total: calculateTotal().toString(),
        issueDate: new Date(formData.issueDate),
        validUntil: formData.validUntil ? new Date(formData.validUntil) : null,
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

    createQuoteMutation.mutate(quoteData);
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

    const quoteData = {
      quoteNumber: formData.quoteNumber,
      customer,
      projectDescription: formData.projectDescription,
      issueDate: formData.issueDate,
      validUntil: formData.validUntil,
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
    };

    generateQuotePDF(quoteData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Quote</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-semibold contractor-text-slate-900 mb-4">
                Quote Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quoteNumber">Quote Number</Label>
                  <Input
                    id="quoteNumber"
                    value={formData.quoteNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, quoteNumber: e.target.value }))}
                    placeholder="QUO-2024-001"
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
                <div>
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
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
                Additional Information
              </h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, taxRate: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes or terms..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="contractor-bg-slate-50 rounded-lg p-6">
            <h4 className="text-md font-semibold contractor-text-slate-900 mb-4">
              Quote Preview
            </h4>
            <QuotePreview
              quoteNumber={formData.quoteNumber}
              customer={customers?.find(c => c.id === parseInt(formData.customerId))}
              projectDescription={formData.projectDescription}
              issueDate={formData.issueDate}
              validUntil={formData.validUntil}
              lineItems={lineItems}
              subtotal={calculateSubtotal()}
              taxRate={parseFloat(formData.taxRate)}
              taxAmount={calculateTax()}
              total={calculateTotal()}
              notes={formData.notes}
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
            disabled={createQuoteMutation.isPending}
            className="contractor-bg-primary-500 hover:contractor-bg-primary-600"
          >
            {createQuoteMutation.isPending ? "Creating..." : "Create Quote"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}