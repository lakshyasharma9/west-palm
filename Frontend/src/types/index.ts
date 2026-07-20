// Project Types
export interface Project {
  id: string;
  name: string;
  type: string;
  address: string;
  bannerUrl: string;
  heroUrl?: string;
  overview?: {
    vision?: string;
    sustainability?: string;
  };
  specs: Array<{
    key: string;
    value: string;
  }>;
  heroStats: Array<{
    key: string;
    value: string;
  }>;
  gallery: Array<{
    id: string;
    type: 'image' | 'video';
    url: string;
  }>;
}

// Related Project Type
export interface RelatedProject {
  id: string;
  title: string;
  image: string;
  address: string;
  type: string;
}

// Contact Form Types
export interface ContactFormData {
  name: string;
  email: string;
  company: string;
  service: string[];
  message: string;
}

export interface ContactAttachment {
  data: string;
  name: string;
  type: string;
}

// Service Types
export interface Service {
  title: string;
  description: string;
  image: string;
  href?: string;
}

// Navigation Types
export interface NavLink {
  label: string;
  href: string;
}

// Footer Types
export interface FooterLink {
  label: string;
  href: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}
