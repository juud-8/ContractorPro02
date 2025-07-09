import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Settings() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold contractor-text-slate-900 mb-6">Settings</h1>
      
      <Card className="contractor-border-slate-200">
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="contractor-text-slate-500">
              Settings functionality coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
