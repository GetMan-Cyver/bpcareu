export interface Product {
  id: string;
  name: string;
  category: 'propolis' | 'stevia' | 'specialty';
  volume: string;
  price: number;
  bpom: string;
  badge: string;
  tagline: string;
  image: string;
  fallbackPlaceholder: string;
  shortDesc: string;
  description: string;
  benefits: string[];
  usage: string;
  ingredients: string;
}

export interface Package {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  badge: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  isPackage: boolean;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  adminWaNumber: string;
  googleAppsScriptUrl: string;
  siteUrl: string;
}
