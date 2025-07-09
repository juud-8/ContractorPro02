import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  isLoading?: boolean;
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor, 
  iconBg, 
  isLoading 
}: StatsCardProps) {
  return (
    <Card className="contractor-border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={cn("w-8 h-8 rounded-md flex items-center justify-center", iconBg)}>
              <Icon className={cn("w-5 h-5", iconColor)} />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium contractor-text-slate-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-semibold contractor-text-slate-900">
                {isLoading ? (
                  <div className="h-6 contractor-bg-slate-200 rounded animate-pulse" />
                ) : (
                  value
                )}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
