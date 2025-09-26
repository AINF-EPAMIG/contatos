import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function getServerSession(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    return token;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function isAuthenticated(req: NextRequest) {
  const session = await getServerSession(req);
  return !!session;
}

export async function isAdmin(req: NextRequest) {
  const session = await getServerSession(req);
  return session?.tipo === 'admin';
}