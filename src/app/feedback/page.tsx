'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const feedbackSchema = z.object({
  storeId: z.string().min(1, 'Store ID is required.'),
  productSku: z.string().min(1, 'Product SKU or Name is required.'),
  feedbackType: z.enum([
    'Increased Customer Interest',
    'Viral Trend Spotted',
    'Suggest Override',
    'Other',
  ]),
  comments: z.string().min(10, 'Please provide detailed comments.').max(500),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export default function FeedbackPage() {
  const { toast } = useToast();
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      storeId: '5432',
      productSku: '',
      feedbackType: 'Increased Customer Interest',
      comments: '',
    },
  });

  function onSubmit(data: FeedbackFormValues) {
    console.log(data);
    toast({
      title: 'Feedback Submitted!',
      description: 'Thank you for your valuable insight. The AI model will be updated.',
    });
    form.reset();
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader
        title="Store Manager Feedback"
        description="Provide local insights to improve forecast accuracy."
      />
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Feedback Form</CardTitle>
            <CardDescription>
              Your on-the-ground observations are crucial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="storeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 5432" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="productSku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product SKU or Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Stanley Quencher Tumbler"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the identifier for the product you're observing.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="feedbackType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feedback Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a feedback type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Increased Customer Interest">
                            Increased Customer Interest
                          </SelectItem>
                          <SelectItem value="Viral Trend Spotted">
                            Viral Trend Spotted
                          </SelectItem>
                          <SelectItem value="Suggest Override">
                            Suggest Override
                          </SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comments</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Multiple customers came in today asking for the pink tumbler they saw on TikTok."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Submit Feedback</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <div className="flex items-center justify-center">
             <div className="relative w-full max-w-md">
                <Image
                    src="https://placehold.co/600x400.png"
                    width={600}
                    height={400}
                    alt="Store manager providing feedback"
                    className="rounded-lg shadow-xl"
                    data-ai-hint="store manager"
                />
                <div className="absolute -bottom-4 -right-4 rounded-lg bg-card p-4 shadow-lg border">
                    <p className="font-semibold text-card-foreground">"Human-in-the-loop"</p>
                    <p className="text-sm text-muted-foreground">Combining AI with human expertise.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
