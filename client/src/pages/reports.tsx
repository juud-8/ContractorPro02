import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Reports() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold contractor-text-slate-900 mb-6">Reports</h1>
      
      <Card className="contractor-border-slate-200">
        <CardHeader>
          <CardTitle>Financial Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="contractor-text-slate-500">
              Financial reporting functionality coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
