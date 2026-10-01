import type { Package } from '../types';

export const PACKAGES: Package[] = [
  {
    id: 'pkg-satuan',
    name: 'Paket Satuan',
    qty: 1,
    unitPrice: 265000,
    totalPrice: 265000,
    badge: 'Konsumsi Pribadi',
  },
  {
    id: 'pkg-family',
    name: 'Paket Family',
    qty: 3,
    unitPrice: 240000,
    totalPrice: 720000,
    badge: 'Hemat Keluarga',
  },
  {
    id: 'pkg-agent',
    name: 'Paket Agent',
    qty: 5,
    unitPrice: 225000,
    totalPrice: 1125000,
    badge: 'Mulai Usaha',
  },
  {
    id: 'pkg-ap',
    name: 'Paket Agent Plus (AP)',
    qty: 10,
    unitPrice: 210000,
    totalPrice: 2100000,
    badge: 'Paling Populer',
  },
  {
    id: 'pkg-sap',
    name: 'Paket Special Agent Plus (SAP)',
    qty: 40,
    unitPrice: 195000,
    totalPrice: 7800000,
    badge: 'Kemitraan Grosir',
  },
  {
    id: 'pkg-se',
    name: 'Paket Special Entrepreneur (SE)',
    qty: 200,
    unitPrice: 175000,
    totalPrice: 35000000,
    badge: 'Distributor Resmi',
  },
];
