import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/dashboard/stats-card";
import RecentInvoices from "@/components/dashboard/recent-invoices";
import QuickActions from "@/components/dashboard/quick-actions";
import { DollarSign, FileText, Clock, Users } from "lucide-react";

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

  const recentInvoices = invoices?.slice(0, 5) || [];
  const recentQuotes = quotes?.slice(0, 3) || [];

  return (
    <div className="p-6">
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
