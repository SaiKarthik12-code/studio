'use client';

import Image from 'next/image';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Product } from '@/lib/types';

const products: Product[] = [
  {
    id: 'prod-001',
    name: 'Stanley Quencher Tumbler',
    category: 'Drinkware',
    forecastedDemand: 1200,
    inventoryStatus: 'Understock',
    lastUpdated: '2 hours ago',
    imageUrl: 'https://placehold.co/64x64.png',
  },
  {
    id: 'prod-002',
    name: 'Organic Avocadoes (4-pack)',
    category: 'Groceries',
    forecastedDemand: 800,
    inventoryStatus: 'Optimal',
    lastUpdated: '1 day ago',
    imageUrl: 'https://placehold.co/64x64.png',
  },
  {
    id: 'prod-003',
    name: 'LEGO Star Wars Set',
    category: 'Toys',
    forecastedDemand: 350,
    inventoryStatus: 'Overstock',
    lastUpdated: '5 hours ago',
    imageUrl: 'https://placehold.co/64x64.png',
  },
  {
    id: 'prod-004',
    name: 'Great Value Milk',
    category: 'Groceries',
    forecastedDemand: 2500,
    inventoryStatus: 'Optimal',
    lastUpdated: '30 minutes ago',
    imageUrl: 'https://placehold.co/64x64.png',
  },
  {
    id: 'prod-005',
    name: 'Nintendo Switch OLED',
    category: 'Electronics',
    forecastedDemand: 600,
    inventoryStatus: 'Understock',
    lastUpdated: '8 hours ago',
    imageUrl: 'https://placehold.co/64x64.png',
  },
];

export function ProductTable() {
  const getStatusBadgeClass = (status: Product['inventoryStatus']) => {
    switch (status) {
      case 'Understock':
        return 'bg-red-500/20 text-red-700 border-red-500/30 dark:text-red-400';
      case 'Overstock':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:text-yellow-400';
      case 'Optimal':
        return 'bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-400';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
        <CardDescription>
          Manage your products and view their demand forecasts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Inventory Status</TableHead>
              <TableHead className="hidden md:table-cell">
                Forecasted Demand
              </TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt="Product image"
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={product.imageUrl}
                    width="64"
                    data-ai-hint={`${product.category} product`}
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getStatusBadgeClass(product.inventoryStatus)}
                  >
                    {product.inventoryStatus}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {product.forecastedDemand.toLocaleString()} units
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {product.category}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Adjust Forecast</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
