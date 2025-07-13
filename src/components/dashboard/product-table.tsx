
'use client';

import Image from 'next/image';
import { MoreHorizontal, Instagram } from 'lucide-react';
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
import type { Product, SocialPlatform } from '@/lib/types';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '../ui/separator';

const platformIcons: Record<SocialPlatform, React.ReactNode> = {
    Instagram: <Instagram className="h-4 w-4 text-[#E1306C]" />,
    Twitter: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-label="X logo">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </svg>
    ),
    Reddit: (
        <svg role="img" viewBox="0 0 24 24" className="h-4 w-4 fill-[#FF4500]" xmlns="http://www.w3.org/2000/svg"><title>Reddit</title><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.74c.69.02 1.34.42 1.63 1.04.29.62.29 1.32.04 1.96l-1.14 3.26c.27.08.54.16.81.24l1.92-1.82c.83-.83 2.18-.83 3.01 0 .83.83.83 2.18 0 3.01l-1.92 1.82c-.08.08-.16.16-.24.24l3.26 1.14c.64.25 1.14.75 1.39 1.39.25.64.25 1.34 0 1.98s-.75 1.14-1.39 1.39c-1.2.47-2.48.47-3.68 0l-3.26-1.14c-.08-.27-.16-.54-.24-.81l1.82-1.92c.83-.83.83-2.18 0-3.01s-2.18-.83-3.01 0l-1.82 1.92c-.27.08-.54.16-.81.24l1.14 3.26c.25.64.25 1.34 0 1.98s-.75 1.14-1.39 1.39c-1.2.47-2.48.47-3.68 0l-1.14-3.26c-.08-.27-.16-.54-.24-.81l-1.82 1.92c-.83.83-2.18.83-3.01 0s-.83-2.18 0-3.01l1.82-1.92c.08-.08.16-.16.24-.24l-3.26-1.14c-.64-.25-1.14-.75-1.39-1.39-.25-.64-.25-1.34 0-1.98s.75-1.14 1.39-1.39c1.2-.47 2.48-.47 3.68 0l3.26 1.14c.27.08.54.16.81.24l-1.82-1.92c-.83-.83-.83-2.18 0-3.01s2.18-.83 3.01 0l1.82 1.92c.27-.08.54-.16.81-.24L9.36 5.82c-.25-.64-.25-1.34 0-1.98s.75-1.14 1.39-1.39c1.2-.46 2.48-.46 3.68 0zm-2.02 12.3c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-3.44-4.99c.83-.83 2.18-.83 3.01 0s.83 2.18 0 3.01c-.83.83-2.18.83-3.01 0s-.83-2.18 0-3.01z"/></svg>
    ),
    TikTok: (
         <svg role="img" viewBox="0 0 24 24" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg"><title>TikTok</title><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.03-4.83-1-6.7-2.9-1.25-1.25-2.07-2.82-2.34-4.51-.01-.01-.01-.02 0-.03v-2.52c.28 1.13.78 2.18 1.55 3.08 1.52 1.78 3.82 2.72 6.02 2.51 1.01-.1 1.96-.51 2.76-1.15.79-.64 1.32-1.5 1.58-2.48.01-3.32.01-6.64.01-9.97-.02-1.15-.49-2.25-1.22-3.1-.96-1.12-2.38-1.78-3.86-1.78-.01 0-.01 0 0 0-.42 0-.83.06-1.23.19v4.22c.44-.13.9-.19 1.38-.19.98 0 1.93.37 2.63 1.07.7.7 1.07 1.68 1.07 2.67 0 1.01-.39 1.99-1.1 2.71-.71.71-1.69 1.1-2.71 1.1-.98 0-1.95-.39-2.66-1.09-.7-.7-.99-1.61-1-2.58V.02z"/></svg>
    )
}

export function ProductTable({ products }: { products: Product[] }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const handleDialogClose = () => {
    setSelectedProduct(null);
  }

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
    <>
    <Card>
      <CardHeader>
        <CardTitle>Trending Products</CardTitle>
        <CardDescription>
          AI-generated list of trending products based on social media analysis.
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
            {products.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No products match the current filter.
                    </TableCell>
                </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={product.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={product.imageUrl}
                      width="64"
                      data-ai-hint={product.name.toLowerCase().split(' ').slice(0, 2).join(' ')}
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
                        <DropdownMenuItem onSelect={() => setSelectedProduct(product)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Adjust Forecast</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={(isOpen) => !isOpen && handleDialogClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{selectedProduct.name}</DialogTitle>
                    <DialogDescription>
                        Product ID: {selectedProduct.id}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex justify-center items-center">
                            <Image
                                src={selectedProduct.imageUrl}
                                alt={selectedProduct.name}
                                width={128}
                                height={128}
                                className="rounded-lg border"
                                data-ai-hint={selectedProduct.name.toLowerCase().split(' ').slice(0, 2).join(' ')}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div className="font-semibold text-muted-foreground">Category</div>
                            <div>{selectedProduct.category}</div>
                            
                            <div className="font-semibold text-muted-foreground">Inventory Status</div>
                            <div>
                                <Badge
                                    variant="outline"
                                    className={getStatusBadgeClass(selectedProduct.inventoryStatus)}
                                >
                                    {selectedProduct.inventoryStatus}
                                </Badge>
                            </div>

                            <div className="font-semibold text-muted-foreground">Forecasted Demand</div>
                            <div>{selectedProduct.forecastedDemand.toLocaleString()} units</div>

                            <div className="font-semibold text-muted-foreground">Last Updated</div>
                            <div>{selectedProduct.lastUpdated}</div>
                        </div>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Real-Time Social Signals</h4>
                        {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
                           <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                                {selectedProduct.reviews.map((review, index) => (
                                    <a
                                        key={index}
                                        href={review.postUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block transition-all hover:bg-secondary/50 rounded-lg"
                                    >
                                        <Card className="bg-secondary/30 border-secondary/30 hover:border-primary/50">
                                            <CardContent className="p-3">
                                                <div className="flex items-start gap-3">
                                                    <span className="mt-1">{platformIcons[review.platform]}</span>
                                                    <div className="flex-1">
                                                        <p className="text-sm text-foreground">{review.text}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">@{review.username}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground text-center py-4">
                                No specific reviews were highlighted for this trend by the AI.
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )}
    </>
  );
}
