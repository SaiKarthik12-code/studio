/**
 * @fileOverview Now actually fetches live data from Reddit & Twitter instead of mock data.
 */

export interface SocialMediaMention {
  productName: string;
  mentions: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

/**
 * Helper to get a Reddit access token dynamically
 */
async function getRedditAccessToken(): Promise<string> {
  const clientId = process.env.REDDIT_CLIENT_ID!;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET!;

  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Trendsense/0.1 by karthiksai12'
    },
    body: 'grant_type=client_credentials'
  });
  const data = await res.json();
  return data.access_token;
}

/**
 * Fetch trending posts from Reddit
 */
async function fetchRedditData(): Promise<SocialMediaMention[]> {
  const token = await getRedditAccessToken();

  const res = await fetch('https://oauth.reddit.com/search?q=trending&limit=5&sort=hot', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'Trendsense/0.1 by karthiksai12'
    }
  });
  const json = await res.json();

  const mentions: SocialMediaMention[] = json.data.children.map((item: any) => ({
    productName: item.data.title,
    mentions: item.data.ups || 0,
    sentiment: 'positive' // Simple default; you could improve with NLP sentiment analysis
  }));

  return mentions;
}

/**
 * Fetch trending tweets from Twitter
 */
async function fetchTwitterData(): Promise<SocialMediaMention[]> {
  const token = process.env.TWITTER_BEARER_TOKEN!;
  const res = await fetch('https://api.twitter.com/2/tweets/search/recent?query=trending&max_results=5', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const json = await res.json();

  const mentions: SocialMediaMention[] = json.data.map((tweet: any) => ({
    productName: tweet.text.slice(0, 50), // shorten
    mentions: 1, // Twitter doesn’t have upvotes; set to 1
    sentiment: 'neutral' // default
  }));

  return mentions;
}

/**
 * Fetch live mentions from Reddit and Twitter
 */
export async function getSocialMediaMentions(): Promise<SocialMediaMention[]> {
  console.log('Fetching live social media data...');

  try {
    const [reddit, twitter] = await Promise.all([
      fetchRedditData(),
      fetchTwitterData()
    ]);

    return [...reddit, ...twitter];
  } catch (err) {
    console.error('Error fetching social data:', err);
    return []; // fallback
  }
}

