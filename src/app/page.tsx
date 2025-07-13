'use client';

import { useState, useMemo, useEffect } from 'react';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { ProductTable } from '@/components/dashboard/product-table';
import { TrendsChart } from '@/components/dashboard/trends-chart';
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { File, ListFilter } from 'lucide-react';
import { getTrendingProducts } from '@/ai/flows/get-trending-products';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState<Set<string>>(new Set());

  const allCategories = useMemo(() => {
    const categories = new Set(products.map((p) => p.category));
    return Array.from(categories).sort();
  }, [products]);

  useEffect(() => {
    const getProducts = async () => {
      setIsLoading(true);
      try {
        const fetchedProducts = await getTrendingProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Failed to fetch trending products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    getProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (categoryFilter.size === 0) {
      return products;
    }
    return products.filter((product) => categoryFilter.has(product.category));
  }, [products, categoryFilter]);

  const toggleCategoryFilter = (category: string) => {
    setCategoryFilter((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const exportToCSV = () => {
    const headers = 'ID,Name,Category,Forecasted Demand,Inventory Status,Last Updated,Image URL';
    const rows = filteredProducts.map(p => 
      [p.id, `"${p.name}"`, p.category, p.forecastedDemand, p.inventoryStatus, p.lastUpdated, p.imageUrl].join(',')
    ).join('\n');
    
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'trending_products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader
        title="Dashboard"
        description="Real-time insights into product trends and demand forecasts."
      >
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filter
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allCategories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={categoryFilter.has(category)}
                  onSelect={(e) => e.preventDefault()}
                  onCheckedChange={() => toggleCategoryFilter(category)}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" className="h-8 gap-1" onClick={exportToCSV} disabled={isLoading}>
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
          {isLoading ? (
             <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-48" />
                   <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-2">
                            <Skeleton className="h-16 w-16" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/4" />
                            </div>
                        </div>
                    ))}
                    </div>
                </CardContent>
             </Card>
          ) : (
            <ProductTable products={filteredProducts} />
          )}
        </div>
      </main>
    </div>
  );
}
