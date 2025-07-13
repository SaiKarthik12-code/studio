/**
 * @fileOverview A mock scraping service to simulate fetching real-time social media data.
 * In a real-world application, this service would use libraries like Puppeteer or Cheerio
 * to scrape websites, or it would connect to official social media APIs.
 */

// This defines the structure of the data our mock scraper will return.
export interface SocialMediaMention {
  productName: string;
  mentions: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

/**
 * Simulates scraping social media for product mentions.
 * @returns A promise that resolves to an array of social media mentions.
 */
export async function getSocialMediaMentions(): Promise<SocialMediaMention[]> {
  console.log('Simulating social media scraping...');

  // In a real implementation, you would perform asynchronous operations here
  // like fetching data from APIs or scraping websites.
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  // This is mock data representing what a real scraper might find.
  // For the hackathon, you can modify this data to tell a specific story.
  const mockData: SocialMediaMention[] = [
    { productName: 'Cosori Air Fryer', mentions: 25000, sentiment: 'positive' },
    { productName: 'Rare Beauty Liquid Blush', mentions: 45000, sentiment: 'positive' },
    { productName: 'Olaplex No. 3 Hair Perfector', mentions: 12000, sentiment: 'positive' },
    { productName: 'Anker Power Bank', mentions: 8000, sentiment: 'neutral' },
    { productName: 'Walking Pad Under Desk Treadmill', mentions: 30000, sentiment: 'positive' },
    { productName: 'Hoka Clifton 9 Running Shoes', mentions: 18000, sentiment: 'positive' },
    { productName: 'Good Molecules Niacinamide Serum', mentions: 9500, sentiment: 'positive' },
    { productName: 'Cirkul Water Bottle', mentions: 22000, sentiment: 'neutral' },
    { productName: 'Ninja CREAMi Ice Cream Maker', mentions: 28000, sentiment: 'positive' },
    { productName: 'The Ordinary Glycolic Acid Toner', mentions: 15000, sentiment: 'positive' },
    { productName: 'e.l.f. Halo Glow Liquid Filter', mentions: 35000, sentiment: 'positive' },
    { productName: 'Bissell Little Green Machine', mentions: 19000, sentiment: 'positive' },
  ];

  return mockData;
}
