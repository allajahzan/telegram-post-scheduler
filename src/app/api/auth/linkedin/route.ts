import { NextResponse } from 'next/server';

export async function GET() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID || '',
    redirect_uri: process.env.LINKEDIN_REDIRECT_URI || '',
    scope: 'openid profile email w_member_social',
    state: 'random_state_string', // In production, generate a secure random string and verify it in callback
  });

  return NextResponse.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`);
}
