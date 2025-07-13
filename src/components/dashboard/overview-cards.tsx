import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertTriangle, Lightbulb, Package } from 'lucide-react';

const overviewData = [
  {
    title: 'Trending Products',
    value: '+78',
    change: '+18.7% from last week',
    icon: TrendingUp,
    color: 'text-green-500',
  },
  {
    title: 'High Stockout Risk',
    value: '12',
    change: '+2 items from yesterday',
    icon: AlertTriangle,
    color: 'text-destructive',
  },
  {
    title: 'New Opportunities',
    value: '32',
    change: 'Emerging social trends',
    icon: Lightbulb,
    color: 'text-blue-500',
  },
  {
    title: 'Total Products Tracked',
    value: '1,250',
    change: 'Across all categories',
    icon: Package,
    color: 'text-muted-foreground',
  },
];

export function OverviewCards() {
  return (
    <>
      {overviewData.map((item, index) => (
        <Card key={index} className="sm:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">{item.change}</p>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
