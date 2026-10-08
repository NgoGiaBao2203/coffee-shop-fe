import { ENV } from '@/constants/evn';

export function resolveImageUrl(imageUrl?: string | null): string {
  if (!imageUrl || !imageUrl.trim()) {
    return '';
  }

  // Return unchanged if already an absolute external link
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Use API_HOST from project ENV or fallback to local backend port
  const backendBaseUrl = ENV?.API_HOST || 'http://localhost:8080';
  const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;

  return `${backendBaseUrl}${normalizedPath}`;
}
