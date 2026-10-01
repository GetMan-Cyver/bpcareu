import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Production Build Output Verification', () => {
  const distDir = path.resolve(__dirname, '../dist');
  const indexPath = path.join(distDir, 'index.html');
  const faviconPath = path.join(distDir, 'favicon.svg');
  const robotsPath = path.join(distDir, 'robots.txt');

  it('should have built dist/index.html', () => {
    expect(fs.existsSync(indexPath)).toBe(true);
    const content = fs.readFileSync(indexPath, 'utf-8');
    expect(content.length).toBeGreaterThan(10000);

    // Verify SEO elements
    expect(content).toContain('<title>BPCareU');
    expect(content).toContain('name="description"');
    expect(content).toContain('schema.org');
    expect(content).toContain('canonical');

    // Verify key brand elements
    expect(content).toContain('British Propolis');
    expect(content).toContain('Steffi Pro Natural Sweetener');
    expect(content).toContain('BP Norway Salmon Fish Oil');
    expect(content).toContain('Paket Special Entrepreneur');

    // Verify interactive containers
    expect(content).toContain('id="cartDrawer"');
    expect(content).toContain('id="checkoutModal"');
    expect(content).toContain('id="productDetailModal"');
    expect(content).toContain('id="calcResultBox"');
  });

  it('should have built static public assets', () => {
    expect(fs.existsSync(faviconPath)).toBe(true);
    expect(fs.existsSync(robotsPath)).toBe(true);

    const robotsContent = fs.readFileSync(robotsPath, 'utf-8');
    expect(robotsContent).toContain('User-agent: *');
    expect(robotsContent).toContain('Allow: /');
  });
});
