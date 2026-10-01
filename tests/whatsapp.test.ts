import { describe, it, expect } from 'vitest';
import { createDirectProductWaUrl, createCartCheckoutWaUrl } from '../src/utils/whatsapp';
import { PRODUCTS } from '../src/data/products';

describe('WhatsApp Integration', () => {
  const adminPhone = '6281288889999';

  it('should generate direct product order WhatsApp link with encoded message', () => {
    const product = PRODUCTS[0]; // British Propolis Reguler
    const url = createDirectProductWaUrl(adminPhone, product, 2);

    expect(url).toContain(`api.whatsapp.com/send?phone=${adminPhone}`);
    expect(url).toContain('text=');

    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('PESANAN CEPAT BPCAREU');
    expect(decoded).toContain(product.name);
    expect(decoded).toContain('2 PCS');
    expect(decoded).toContain(product.bpom);
  });

  it('should generate structured cart checkout WhatsApp message with total and item breakdown', () => {
    const result = createCartCheckoutWaUrl({
      name: 'Ahmad Fauzi',
      phone: '081234567890',
      address: 'Jl. Merdeka No. 10 Jakarta Pusat',
      notes: 'Tolong packing bubble wrap tebal',
      items: [
        { id: 'bp-reguler', name: 'British Propolis Regular (Dewasa)', price: 265000, qty: 2, isPackage: false },
        { id: 'pkg-family', name: 'Paket Family', price: 720000, qty: 1, isPackage: true }
      ],
      adminPhone
    });

    expect(result.grandTotal).toBe(265000 * 2 + 720000 * 1); // 530.000 + 720.000 = 1.250.000
    expect(result.url).toContain(adminPhone);

    const decoded = decodeURIComponent(result.url);
    expect(decoded).toContain('Ahmad Fauzi');
    expect(decoded).toContain('081234567890');
    expect(decoded).toContain('Jl. Merdeka No. 10 Jakarta Pusat');
    expect(decoded).toContain('Tolong packing bubble wrap tebal');
    expect(decoded).toContain('British Propolis Regular (Dewasa) (2x)');
    expect(decoded).toContain('Paket Family (1x)');
    expect(decoded).toContain('TOTAL PEMBAYARAN');
  });
});
