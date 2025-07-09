import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/dashboard/stats-card";
import RecentInvoices from "@/components/dashboard/recent-invoices";
import QuickActions from "@/components/dashboard/quick-actions";
import { DollarSign, FileText, Clock, Users, TrendingUp, UserCheck, BarChart3, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"]
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/invoices"]
  });

  const { data: quotes, isLoading: quotesLoading } = useQuery({
    queryKey: ["/api/quotes"]
  });

  const { data: teams } = useQuery({
    queryKey: ["/api/teams"]
  });

  const { data: expenses } = useQuery({
    queryKey: ["/api/expenses"]
  });

  const { data: payments } = useQuery({
    queryKey: ["/api/payments"]
  });

  const recentInvoices = invoices?.slice(0, 5) || [];
  const recentQuotes = quotes?.slice(0, 3) || [];
  
  // Calculate additional metrics
  const totalExpenses = expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0;
  const netProfit = (stats?.totalRevenue || 0) - totalExpenses;
  const profitMargin = stats?.totalRevenue ? ((netProfit / stats.totalRevenue) * 100).toFixed(1) : 0;
  const totalPayments = payments?.length || 0;

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold contractor-text-slate-900">Dashboard</h1>
        <p className="text-contractor-slate-600 mt-1">Welcome back! Here's an overview of your business</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Revenue"
          value={stats?.totalRevenue ? `$${stats.totalRevenue.toLocaleString()}` : "$0"}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBg="bg-green-100"
          isLoading={statsLoading}
        />
        <StatsCard
          title="Pending Invoices"
          value={stats?.pendingInvoices?.toString() || "0"}
          icon={FileText}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
          isLoading={statsLoading}
        />
        <StatsCard
          title="Overdue"
          value={stats?.overdue?.toString() || "0"}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-100"
          isLoading={statsLoading}
        />
        <StatsCard
          title="Active Customers"
          value={stats?.activeCustomers?.toString() || "0"}
          icon={Users}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
          isLoading={statsLoading}
        />
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${netProfit.toLocaleString()}</div>
            <p className="text-xs contractor-text-slate-600 mt-1">
              Profit margin: {profitMargin}%
            </p>
            <Progress value={parseFloat(profitMargin)} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <UserCheck className="h-4 w-4" />
              Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams?.length || 0}</div>
            <p className="text-xs contractor-text-slate-600 mt-1">
              Active teams
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <CreditCard className="h-4 w-4" />
              Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPayments}</div>
            <p className="text-xs contractor-text-slate-600 mt-1">
              Total received
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentInvoices 
            invoices={recentInvoices} 
            isLoading={invoicesLoading} 
          />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <div className="bg-white rounded-lg shadow-sm border contractor-border-slate-200 p-6">
            <h3 className="text-lg font-semibold contractor-text-slate-900 mb-4">
              Recent Quotes
            </h3>
            <div className="space-y-3">
              {quotesLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 contractor-bg-slate-100 rounded-md" />
                  ))}
                </div>
              ) : recentQuotes.length === 0 ? (
                <p className="text-sm contractor-text-slate-500">No quotes yet</p>
              ) : (
                recentQuotes.map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-3 contractor-bg-slate-50 rounded-md">
                    <div>
                      <p className="text-sm font-medium contractor-text-slate-900">
                        {quote.projectDescription || "Untitled Project"}
                      </p>
                      <p className="text-xs contractor-text-slate-500">
                        {quote.customer?.name}
                      </p>
                    </div>
                    <div className="text-sm font-medium contractor-text-slate-900">
                      ${parseFloat(quote.total).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
