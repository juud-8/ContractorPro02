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
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import { Customer } from "@shared/schema";
import { STATUS_COLORS } from "@/lib/constants";
import CustomerForm from "@/components/customers/customer-form";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();
  const { toast } = useToast();

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"]
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/customers/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete customer",
        variant: "destructive",
      });
    },
  });

  const filteredCustomers = customers?.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteCustomerMutation.mutate(id);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerFormOpen(true);
  };

  const handleNewCustomer = () => {
    setEditingCustomer(undefined);
    setCustomerFormOpen(true);
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
        <h1 className="text-2xl font-bold contractor-text-slate-900">Customers</h1>
        <Button 
          onClick={handleNewCustomer}
          className="contractor-bg-primary-500 hover:contractor-bg-primary-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <Card className="contractor-border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customer List</CardTitle>
            <div className="relative">
              <Search className="w-5 h-5 contractor-text-slate-400 absolute left-3 top-2.5" />
              <Input
                placeholder="Search customers..."
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
                  <TableHead className="contractor-text-slate-500">Name</TableHead>
                  <TableHead className="contractor-text-slate-500">Contact</TableHead>
                  <TableHead className="contractor-text-slate-500">Address</TableHead>
                  <TableHead className="contractor-text-slate-500">Type</TableHead>
                  <TableHead className="contractor-text-slate-500">Status</TableHead>
                  <TableHead className="contractor-text-slate-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 contractor-text-slate-500">
                      {searchTerm ? "No customers found matching your search" : "No customers found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-slate-300 flex items-center justify-center">
                              <span className="text-sm font-medium contractor-text-slate-700">
                                {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium contractor-text-slate-900">
                              {customer.name}
                            </div>
                            <div className="text-sm contractor-text-slate-500">
                              {customer.customerType}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm contractor-text-slate-900">
                          {customer.email || "—"}
                        </div>
                        <div className="text-sm contractor-text-slate-500">
                          {customer.phone || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="contractor-text-slate-500">
                        {customer.address ? (
                          <div>
                            {customer.address}<br />
                            {customer.city && customer.state && 
                              `${customer.city}, ${customer.state} ${customer.zipCode || ''}`
                            }
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[customer.customerType as keyof typeof STATUS_COLORS]}>
                          {customer.customerType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[customer.status as keyof typeof STATUS_COLORS]}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(customer)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(customer.id)}
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

      <CustomerForm 
        open={customerFormOpen} 
        onClose={() => setCustomerFormOpen(false)}
        customer={editingCustomer}
      />
    </div>
  );
}
