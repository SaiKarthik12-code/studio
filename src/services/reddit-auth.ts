// src/services/reddit-auth.ts
import fetch from 'node-fetch';

export async function getRedditAccessToken(): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Missing Reddit client ID or secret in environment variables.");
    return null;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'TrendSense/0.1 by karthiksai12'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials'
      })
    });

    const data: any = await response.json();

    if (!response.ok || !data.access_token) {
      console.error('Failed to get Reddit access token:', data);
      return null;
    }

    return data.access_token;
  } catch (error) {
    console.error('Error getting Reddit access token:', error);
    return null;
  }
}

