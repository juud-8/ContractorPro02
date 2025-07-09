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
import { Search, Plus, Edit, Trash2, Eye, Download, Mail, CheckCircle, XCircle } from "lucide-react";
import { QuoteWithCustomer } from "@shared/schema";
import { STATUS_COLORS } from "@/lib/constants";
import QuoteBuilder from "@/components/quotes/quote-builder";
import EmailSender from "@/components/email/email-sender";

export default function Quotes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [quoteBuilderOpen, setQuoteBuilderOpen] = useState(false);
  const { toast } = useToast();

  const { data: quotes, isLoading } = useQuery<QuoteWithCustomer[]>({
    queryKey: ["/api/quotes"]
  });

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"]
  });

  const deleteQuoteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/quotes/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quote deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete quote",
        variant: "destructive",
      });
    },
  });

  const updateQuoteStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PUT", `/api/quotes/${id}`, { 
        quote: { status },
        lineItems: undefined 
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quote status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update quote status",
        variant: "destructive",
      });
    },
  });

  const filteredQuotes = quotes?.filter(quote =>
    quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.projectDescription?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this quote?")) {
      deleteQuoteMutation.mutate(id);
    }
  };

  const handleAccept = (id: number) => {
    updateQuoteStatusMutation.mutate({ id, status: "accepted" });
  };

  const handleReject = (id: number) => {
    updateQuoteStatusMutation.mutate({ id, status: "rejected" });
  };

  const handleSendEmail = (quote: QuoteWithCustomer) => {
    // Mock email functionality
    toast({
      title: "Email Sent",
      description: `Quote ${quote.quoteNumber} has been sent to ${quote.customer.email}`,
    });
  };

  const isQuoteExpired = (quote: QuoteWithCustomer) => {
    if (!quote.validUntil) return false;
    return new Date(quote.validUntil) < new Date();
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
        <h1 className="text-2xl font-bold contractor-text-slate-900">Quotes</h1>
        <Button 
          onClick={() => setQuoteBuilderOpen(true)}
          className="contractor-bg-primary-500 hover:contractor-bg-primary-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Quote
        </Button>
      </div>

      <Card className="contractor-border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quote List</CardTitle>
            <div className="relative">
              <Search className="w-5 h-5 contractor-text-slate-400 absolute left-3 top-2.5" />
              <Input
                placeholder="Search quotes..."
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
                  <TableHead className="contractor-text-slate-500">Quote</TableHead>
                  <TableHead className="contractor-text-slate-500">Customer</TableHead>
                  <TableHead className="contractor-text-slate-500">Project</TableHead>
                  <TableHead className="contractor-text-slate-500">Amount</TableHead>
                  <TableHead className="contractor-text-slate-500">Status</TableHead>
                  <TableHead className="contractor-text-slate-500">Valid Until</TableHead>
                  <TableHead className="contractor-text-slate-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 contractor-text-slate-500">
                      {searchTerm ? "No quotes found matching your search" : "No quotes found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium contractor-text-slate-900">
                        {quote.quoteNumber}
                      </TableCell>
                      <TableCell className="contractor-text-slate-500">
                        {quote.customer.name}
                      </TableCell>
                      <TableCell className="contractor-text-slate-500">
                        {quote.projectDescription || "—"}
                      </TableCell>
                      <TableCell className="contractor-text-slate-900">
                        ${parseFloat(quote.total).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={STATUS_COLORS[quote.status as keyof typeof STATUS_COLORS]}>
                            {quote.status}
                          </Badge>
                          {isQuoteExpired(quote) && quote.status !== 'accepted' && quote.status !== 'rejected' && (
                            <Badge className="bg-red-100 text-red-800">
                              Expired
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="contractor-text-slate-500">
                        {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : "—"}
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
                          {settings && quote.customer.email && (
                            <EmailSender
                              customer={quote.customer}
                              settings={settings}
                              documentType="quote"
                              documentNumber={quote.quoteNumber}
                              onSend={() => handleSendEmail(quote)}
                            />
                          )}
                          {quote.status === 'sent' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleAccept(quote.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleReject(quote.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(quote.id)}
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

      <QuoteBuilder 
        open={quoteBuilderOpen} 
        onClose={() => setQuoteBuilderOpen(false)} 
      />
    </div>
  );
}
