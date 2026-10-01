import type { CartItem, Product } from '../types';
import { formatRupiah } from './formatters';

export function createDirectProductWaUrl(
  adminPhone: string,
  product: Product,
  qty: number
): string {
  const total = product.price * qty;
  const message =
`*PESANAN CEPAT BPCAREU*
----------------------------------------
*Produk:* ${product.name}
*Jumlah:* ${qty} PCS
*Total Harga:* Rp ${formatRupiah(total)}
*Legalitas:* ${product.bpom}
----------------------------------------
_Halo Admin BPCareU, saya ingin memesan produk ini. Mohon info nomor rekening dan pengiriman. Terima kasih!_`;

  return `https://api.whatsapp.com/send?phone=${adminPhone}&text=${encodeURIComponent(message)}`;
}

export interface CheckoutOrderInput {
  name: string;
  phone: string;
  address: string;
  notes?: string;
  items: CartItem[];
  adminPhone: string;
}

export function createCartCheckoutWaUrl(input: CheckoutOrderInput): {
  url: string;
  grandTotal: number;
  message: string;
} {
  let grandTotal = 0;
  const itemLines: string[] = [];

  input.items.forEach((item, index) => {
    const lineTotal = item.price * item.qty;
    grandTotal += lineTotal;
    itemLines.push(`${index + 1}. ${item.name} (${item.qty}x) = Rp ${formatRupiah(lineTotal)}`);
  });

  const message =
`*PESANAN RESMI BPCAREU*
----------------------------------------
*Nama:* ${input.name.slice(0, 50)}
*No. WhatsApp:* ${input.phone.slice(0, 20)}
*Alamat Pengiriman:* ${input.address.slice(0, 200)}
*Catatan / Varian:* ${(input.notes || '-').slice(0, 100)}

*RINCIAN ITEM:*
${itemLines.join('\n')}

----------------------------------------
*TOTAL PEMBAYARAN:* Rp ${formatRupiah(grandTotal)}
----------------------------------------
_Halo Admin BPCareU, mohon info rekening resmi dan nomor resi pengiriman. Terima kasih!_`;

  const url = `https://api.whatsapp.com/send?phone=${input.adminPhone}&text=${encodeURIComponent(message)}`;

  return { url, grandTotal, message };
}
