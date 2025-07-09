import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceWithCustomer } from "@shared/schema";

interface RecentInvoicesProps {
  invoices: InvoiceWithCustomer[];
  isLoading: boolean;
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
};

export default function RecentInvoices({ invoices, isLoading }: RecentInvoicesProps) {
  if (isLoading) {
    return (
      <Card className="contractor-border-slate-200">
        <CardHeader>
          <CardTitle className="contractor-text-slate-900">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 contractor-bg-slate-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="contractor-border-slate-200">
      <CardHeader>
        <CardTitle className="contractor-text-slate-900">Recent Invoices</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="contractor-bg-slate-50">
                <TableHead className="contractor-text-slate-500">Invoice</TableHead>
                <TableHead className="contractor-text-slate-500">Customer</TableHead>
                <TableHead className="contractor-text-slate-500">Amount</TableHead>
                <TableHead className="contractor-text-slate-500">Status</TableHead>
                <TableHead className="contractor-text-slate-500">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 contractor-text-slate-500">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium contractor-text-slate-900">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell className="contractor-text-slate-500">
                      {invoice.customer?.name}
                    </TableCell>
                    <TableCell className="contractor-text-slate-900">
                      ${parseFloat(invoice.total).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[invoice.status as keyof typeof statusColors]}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="contractor-text-slate-500">
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="px-6 py-4 border-t contractor-border-slate-200">
          <Link href="/invoices" className="text-sm contractor-text-primary-600 hover:contractor-text-primary-500">
            View all invoices →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
