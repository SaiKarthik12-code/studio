import { OverviewCards } from '@/components/dashboard/overview-cards';
import { ProductTable } from '@/components/dashboard/product-table';
import { TrendsChart } from '@/components/dashboard/trends-chart';
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { File, ListFilter } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader
        title="Dashboard"
        description="Real-time insights into product trends and demand forecasts."
      >
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <ListFilter className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Filter
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
        </div>
      </PageHeader>
      <main className="grid flex-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewCards />
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <TrendsChart />
        </div>
        <div className="lg:col-span-4">
          <ProductTable />
        </div>
      </main>
    </div>
  );
}
