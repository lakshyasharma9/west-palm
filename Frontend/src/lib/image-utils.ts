/**
 * Generate a simple blur placeholder for images
 * This creates a tiny 10x10 SVG with blur effect
 */
export function getBlurDataURL(width = 10, height = 10): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f8faf8;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#e2e8f0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f8faf8;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)" />
    </svg>
  `.trim();

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Shimmer effect for loading state
 */
export function getShimmerDataURL(width = 700, height = 475): string {
  const shimmer = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#f8faf8;stop-opacity:1">
            <animate attributeName="offset" values="-2; 1" dur="2s" repeatCount="indefinite" />
          </stop>
          <stop offset="50%" style="stop-color:#e2e8f0;stop-opacity:1">
            <animate attributeName="offset" values="-1; 2" dur="2s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" style="stop-color:#f8faf8;stop-opacity:1">
            <animate attributeName="offset" values="0; 3" dur="2s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#shimmer)" />
    </svg>
  `.trim();

  const base64 = Buffer.from(shimmer).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}
