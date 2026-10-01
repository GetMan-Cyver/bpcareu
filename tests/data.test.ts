import { describe, it, expect } from 'vitest';
import { PRODUCTS } from '../src/data/products';
import { PACKAGES } from '../src/data/packages';
import { FAQ_ITEMS } from '../src/data/faq';

describe('Database & Content Integrity', () => {
  it('should have 6 official BP Group products with valid fields', () => {
    expect(PRODUCTS).toHaveLength(6);

    PRODUCTS.forEach(product => {
      expect(product.id).toBeDefined();
      expect(product.name).toBeTruthy();
      expect(['propolis', 'stevia', 'specialty']).toContain(product.category);
      expect(product.price).toBe(265000); // Standard single retail price
      expect(product.bpom).toMatch(/^POM (TR|MD|SI) \d+/);
      expect(product.benefits.length).toBeGreaterThan(0);
      expect(product.usage).toBeTruthy();
      expect(product.ingredients).toBeTruthy();
    });
  });

  it('should have 6 official packages with correct pricing calculations', () => {
    expect(PACKAGES).toHaveLength(6);

    PACKAGES.forEach(pkg => {
      expect(pkg.id).toBeTruthy();
      expect(pkg.name).toBeTruthy();
      expect(pkg.qty).toBeGreaterThan(0);
      expect(pkg.unitPrice).toBeGreaterThan(0);
      expect(pkg.totalPrice).toBe(pkg.qty * pkg.unitPrice);
      expect(pkg.badge).toBeTruthy();
    });

    // Check key pricing milestones
    const satuan = PACKAGES.find(p => p.id === 'pkg-satuan');
    expect(satuan?.totalPrice).toBe(265000);

    const family = PACKAGES.find(p => p.id === 'pkg-family');
    expect(family?.totalPrice).toBe(720000);

    const agent = PACKAGES.find(p => p.id === 'pkg-agent');
    expect(agent?.totalPrice).toBe(1125000);

    const ap = PACKAGES.find(p => p.id === 'pkg-ap');
    expect(ap?.totalPrice).toBe(2100000);

    const sap = PACKAGES.find(p => p.id === 'pkg-sap');
    expect(sap?.totalPrice).toBe(7800000);

    const se = PACKAGES.find(p => p.id === 'pkg-se');
    expect(se?.totalPrice).toBe(35000000);
  });

  it('should have FAQ items with non-empty questions and answers', () => {
    expect(FAQ_ITEMS.length).toBeGreaterThanOrEqual(3);
    FAQ_ITEMS.forEach(item => {
      expect(item.id).toBeGreaterThan(0);
      expect(item.question.trim().length).toBeGreaterThan(10);
      expect(item.answer.trim().length).toBeGreaterThan(20);
    });
  });
});
