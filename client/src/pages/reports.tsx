import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, TrendingUp, TrendingDown, DollarSign, FileText, Clock, Users, Calendar } from "lucide-react";
import { InvoiceWithCustomer, QuoteWithCustomer, Customer } from "@shared/schema";
import { STATUS_COLORS } from "@/lib/constants";

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const { data: invoices, isLoading: invoicesLoading } = useQuery<InvoiceWithCustomer[]>({
    queryKey: ["/api/invoices"]
  });

  const { data: quotes, isLoading: quotesLoading } = useQuery<QuoteWithCustomer[]>({
    queryKey: ["/api/quotes"]
  });

  const { data: customers, isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"]
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"]
  });

  const isLoading = invoicesLoading || quotesLoading || customersLoading || statsLoading;

  const revenueData = useMemo(() => {
    if (!invoices) return [];
    
    const monthlyRevenue = invoices
      .filter(invoice => invoice.status === 'paid' && 
        new Date(invoice.issueDate).getFullYear() === parseInt(selectedYear))
      .reduce((acc, invoice) => {
        const month = new Date(invoice.issueDate).getMonth();
        const monthName = new Date(0, month).toLocaleString('default', { month: 'short' });
        acc[monthName] = (acc[monthName] || 0) + parseFloat(invoice.total);
        return acc;
      }, {} as Record<string, number>);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map(month => ({
      month,
      revenue: monthlyRevenue[month] || 0
    }));
  }, [invoices, selectedYear]);

  const statusData = useMemo(() => {
    if (!invoices) return [];
    
    const statusCounts = invoices.reduce((acc, invoice) => {
      acc[invoice.status] = (acc[invoice.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#10B981', '#F59E0B', '#EF4444', '#6B7280'];
    
    return Object.entries(statusCounts).map(([status, count], index) => ({
      name: status,
      value: count,
      color: colors[index % colors.length]
    }));
  }, [invoices]);

  const topCustomers = useMemo(() => {
    if (!invoices) return [];
    
    const customerRevenue = invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((acc, invoice) => {
        const customerId = invoice.customer.id;
        const customerName = invoice.customer.name;
        acc[customerId] = {
          name: customerName,
          revenue: (acc[customerId]?.revenue || 0) + parseFloat(invoice.total),
          invoiceCount: (acc[customerId]?.invoiceCount || 0) + 1
        };
        return acc;
      }, {} as Record<number, { name: string; revenue: number; invoiceCount: number }>);

    return Object.values(customerRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [invoices]);

  const recentActivity = useMemo(() => {
    if (!invoices || !quotes) return [];
    
    const activities = [
      ...invoices.map(invoice => ({
        id: invoice.id,
        type: 'invoice' as const,
        number: invoice.invoiceNumber,
        customer: invoice.customer.name,
        amount: parseFloat(invoice.total),
        status: invoice.status,
        date: new Date(invoice.issueDate),
      })),
      ...quotes.map(quote => ({
        id: quote.id,
        type: 'quote' as const,
        number: quote.quoteNumber,
        customer: quote.customer.name,
        amount: parseFloat(quote.total),
        status: quote.status,
        date: new Date(quote.issueDate),
      }))
    ];

    return activities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 20);
  }, [invoices, quotes]);

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const currentMonthRevenue = useMemo(() => {
    if (!invoices) return 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return invoices
      .filter(invoice => {
        const invoiceDate = new Date(invoice.issueDate);
        return invoice.status === 'paid' && 
               invoiceDate.getMonth() === currentMonth &&
               invoiceDate.getFullYear() === currentYear;
      })
      .reduce((sum, invoice) => sum + parseFloat(invoice.total), 0);
  }, [invoices]);

  const previousMonthRevenue = useMemo(() => {
    if (!invoices) return 0;
    const previousMonth = new Date().getMonth() - 1;
    const year = previousMonth < 0 ? new Date().getFullYear() - 1 : new Date().getFullYear();
    const month = previousMonth < 0 ? 11 : previousMonth;
    
    return invoices
      .filter(invoice => {
        const invoiceDate = new Date(invoice.issueDate);
        return invoice.status === 'paid' && 
               invoiceDate.getMonth() === month &&
               invoiceDate.getFullYear() === year;
      })
      .reduce((sum, invoice) => sum + parseFloat(invoice.total), 0);
  }, [invoices]);

  const monthlyGrowth = calculateGrowth(currentMonthRevenue, previousMonthRevenue);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 contractor-bg-slate-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 contractor-bg-slate-200 rounded" />
            ))}
          </div>
          <div className="h-64 contractor-bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold contractor-text-slate-900">Reports</h1>
        <div className="flex items-center space-x-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="contractor-border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium contractor-text-slate-500">Total Revenue</p>
                <p className="text-2xl font-bold contractor-text-slate-900">
                  ${stats?.totalRevenue?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {monthlyGrowth >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(monthlyGrowth).toFixed(1)}%
              </span>
              <span className="text-sm contractor-text-slate-500 ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="contractor-border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium contractor-text-slate-500">Pending Invoices</p>
                <p className="text-2xl font-bold contractor-text-slate-900">
                  {stats?.pendingInvoices || 0}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="contractor-border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium contractor-text-slate-500">Overdue</p>
                <p className="text-2xl font-bold contractor-text-slate-900">
                  {stats?.overdue || 0}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="contractor-border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium contractor-text-slate-500">Active Customers</p>
                <p className="text-2xl font-bold contractor-text-slate-900">
                  {stats?.activeCustomers || 0}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="invoices">Invoice Analytics</TabsTrigger>
          <TabsTrigger value="customers">Customer Analysis</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <Card className="contractor-border-slate-200">
            <CardHeader>
              <CardTitle>Monthly Revenue - {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="contractor-border-slate-200">
              <CardHeader>
                <CardTitle>Invoice Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="contractor-border-slate-200">
              <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="contractor-text-slate-600">Total Invoices</span>
                    <span className="font-semibold">{invoices?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="contractor-text-slate-600">Average Invoice Value</span>
                    <span className="font-semibold">
                      ${invoices?.length 
                        ? (invoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0) / invoices.length).toFixed(2)
                        : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="contractor-text-slate-600">Paid Invoices</span>
                    <span className="font-semibold text-green-600">
                      {invoices?.filter(inv => inv.status === 'paid').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="contractor-text-slate-600">Outstanding Amount</span>
                    <span className="font-semibold text-red-600">
                      ${invoices?.filter(inv => inv.status !== 'paid')
                        .reduce((sum, inv) => sum + parseFloat(inv.total), 0)
                        .toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card className="contractor-border-slate-200">
            <CardHeader>
              <CardTitle>Top Customers by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Invoices</TableHead>
                      <TableHead>Average Order</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCustomers.map((customer, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>${customer.revenue.toLocaleString()}</TableCell>
                        <TableCell>{customer.invoiceCount}</TableCell>
                        <TableCell>
                          ${(customer.revenue / customer.invoiceCount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="contractor-border-slate-200">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={`${activity.type}-${activity.id}`} className="flex items-center justify-between p-3 contractor-bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'invoice' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        {activity.type === 'invoice' ? (
                          <FileText className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Calendar className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium contractor-text-slate-900">
                          {activity.type === 'invoice' ? 'Invoice' : 'Quote'} {activity.number}
                        </p>
                        <p className="text-sm contractor-text-slate-500">
                          {activity.customer} • {activity.date.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={STATUS_COLORS[activity.status as keyof typeof STATUS_COLORS]}>
                        {activity.status}
                      </Badge>
                      <span className="font-medium contractor-text-slate-900">
                        ${activity.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
