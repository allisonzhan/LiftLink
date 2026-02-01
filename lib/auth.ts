import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthUser {
  id: string;
  email: string;
  verified: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, verified: user.verified },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
}

export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export function generateVerificationCode(): string {
  // Generate a 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function verifyEmailDomain(email: string): Promise<boolean> {
  return email.toLowerCase().endsWith('.edu');
}

export function extractUniversityFromEmail(email: string): string | null {
  const lowerEmail = email.toLowerCase();
  
  // Extract domain (everything after @)
  const domainMatch = lowerEmail.match(/@(.+)$/);
  if (!domainMatch) return null;
  
  const domain = domainMatch[1];
  
  // Map common university domains to short codes
  const universityMap: Record<string, string> = {
    'vt.edu': 'vt',
    'vtu.edu': 'vt',
    'virginiatech.edu': 'vt',
    'gmu.edu': 'gmu',
    'georgemason.edu': 'gmu',
    'nvcc.edu': 'nvcc',
    'nova.edu': 'nvcc',
    'northernvirginia.edu': 'nvcc',
    'uva.edu': 'uva',
    'virginia.edu': 'uva',
    'jmu.edu': 'jmu',
    'jamesmadison.edu': 'jmu',
    'vcu.edu': 'vcu',
    'virginiacommonwealth.edu': 'vcu',
    'wlu.edu': 'wlu',
    'washingtonandlee.edu': 'wlu',
  };
  
  // Check if domain is in the map
  if (universityMap[domain]) {
    return universityMap[domain];
  }
  
  // If not in map, extract a short code from the domain
  // e.g., "university.edu" -> "university"
  const domainParts = domain.split('.');
  if (domainParts.length >= 2 && domainParts[domainParts.length - 1] === 'edu') {
    // Take the main domain part (usually the second-to-last)
    const mainPart = domainParts[domainParts.length - 2];
    // Remove common prefixes
    const cleanPart = mainPart.replace(/^(www|mail|web)\.?/, '');
    return cleanPart.substring(0, 10).toLowerCase(); // Limit to 10 chars
  }
  
  return null;
}

