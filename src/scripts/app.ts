import { PRODUCTS } from '../data/products';
import { PACKAGES } from '../data/packages';
import type { CartItem, Product } from '../types';
import { calculateDose } from '../utils/calculator';
import { escapeHTML, formatRupiah, validateIndonesianPhone } from '../utils/formatters';
import { createCartCheckoutWaUrl, createDirectProductWaUrl } from '../utils/whatsapp';
import { siteConfig } from '../config/site';

export class BPCareUApp {
  private cart: CartItem[] = [];
  private activeProduct: Product | null = null;
  private toastTimeout: number | null = null;

  constructor() {
    this.initCart();
    this.bindEvents();
  }

  // --- Cart Management ---
  private initCart(): void {
    try {
      const stored = localStorage.getItem('bpcareu_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.cart = parsed.filter(item => {
            const matched = [...PRODUCTS, ...PACKAGES].find(p => p.id === item.id);
            return matched && typeof item.qty === 'number' && item.qty > 0;
          });
        }
      }
    } catch {
      this.cart = [];
    }
    this.updateCartUI();
  }

  private saveCart(): void {
    try {
      localStorage.setItem('bpcareu_cart', JSON.stringify(this.cart));
    } catch (e) {
      console.warn('Storage limit reached', e);
    }
    this.updateCartUI();
  }

  public addProductToCart(productId: string, quantity: number = 1): void {
    const prod = PRODUCTS.find(p => p.id === productId);
    if (!prod) return;

    const exist = this.cart.find(item => item.id === productId);
    if (exist) {
      exist.qty += quantity;
    } else {
      this.cart.push({
        id: prod.id,
        name: prod.name,
        price: prod.price,
        qty: quantity,
        isPackage: false,
      });
    }

    this.saveCart();
    this.showToast(`${quantity}x ${prod.name} ditambahkan ke keranjang!`);
    this.toggleCartDrawer(true);
  }

  public addPackageToCart(packageId: string): void {
    const pkg = PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;

    const exist = this.cart.find(item => item.id === packageId);
    if (exist) {
      exist.qty += 1;
    } else {
      this.cart.push({
        id: pkg.id,
        name: pkg.name,
        price: pkg.totalPrice,
        qty: 1,
        isPackage: true,
      });
    }

    this.saveCart();
    this.showToast(`${pkg.name} ditambahkan ke keranjang!`);
    this.toggleCartDrawer(true);
  }

  public updateCartItemQty(id: string, delta: number): void {
    const index = this.cart.findIndex(item => item.id === id);
    if (index === -1) return;

    this.cart[index].qty += delta;
    if (this.cart[index].qty <= 0) {
      this.cart.splice(index, 1);
    }
    this.saveCart();
  }

  public removeCartItem(id: string): void {
    this.cart = this.cart.filter(item => item.id !== id);
    this.saveCart();
    this.showToast('Item dihapus dari keranjang');
  }

  public toggleCartDrawer(open: boolean): void {
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartBackdrop');
    if (!drawer || !backdrop) return;

    if (open) {
      backdrop.classList.remove('opacity-0', 'pointer-events-none');
      backdrop.classList.add('opacity-100');
      drawer.classList.remove('translate-x-full');
    } else {
      backdrop.classList.remove('opacity-100');
      backdrop.classList.add('opacity-0', 'pointer-events-none');
      drawer.classList.add('translate-x-full');
    }
  }

  public updateCartUI(): void {
    const badge = document.getElementById('cartCountBadge');
    const drawerBadge = document.getElementById('drawerBadgeCount');
    const list = document.getElementById('cartItemsList');
    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn') as HTMLButtonElement | null;

    if (!list || !subtotalEl || !totalEl || !badge || !drawerBadge || !checkoutBtn) return;

    let count = 0;
    let total = 0;

    list.innerHTML = '';

    if (this.cart.length === 0) {
      list.innerHTML = `
        <div class="text-center py-12 space-y-2">
          <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-xl">
            <i class="fa-solid fa-cart-arrow-down"></i>
          </div>
          <p class="text-xs font-semibold text-slate-700">Keranjang masih kosong</p>
          <p class="text-[11px] text-slate-400">Pilih paket hemat atau produk di katalog.</p>
        </div>
      `;
      checkoutBtn.disabled = true;
    } else {
      checkoutBtn.disabled = false;

      this.cart.forEach(item => {
        count += item.qty;
        const lineTotal = item.price * item.qty;
        total += lineTotal;

        const itemNode = document.createElement('div');
        itemNode.className = 'flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white';
        itemNode.innerHTML = `
          <div class="flex-1 min-w-0 pr-2">
            <h4 class="text-xs font-bold text-slate-800 truncate">${escapeHTML(item.name)}</h4>
            <p class="text-[11px] font-semibold text-bpRed-800">Rp ${formatRupiah(item.price)}</p>
          </div>
          <div class="flex items-center gap-1.5">
            <button data-cart-delta="${item.id}" data-delta="-1" class="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">-</button>
            <span class="text-xs font-bold text-slate-800 w-5 text-center">${item.qty}</span>
            <button data-cart-delta="${item.id}" data-delta="1" class="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">+</button>
            <button data-cart-remove="${item.id}" class="ml-1 text-slate-400 hover:text-red-500 text-xs p-1 cursor-pointer" title="Hapus">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        `;
        list.appendChild(itemNode);
      });
    }

    badge.textContent = String(count);
    drawerBadge.textContent = `${count} Item`;
    subtotalEl.textContent = `Rp ${formatRupiah(total)}`;
    totalEl.textContent = `Rp ${formatRupiah(total)}`;
  }

  // --- Product Detail Modal ---
  public openProductDetail(productId: string): void {
    const prod = PRODUCTS.find(p => p.id === productId);
    if (!prod) return;

    this.activeProduct = prod;

    const modal = document.getElementById('productDetailModal');
    const imgEl = document.getElementById('detailImg') as HTMLImageElement | null;
    const titleEl = document.getElementById('detailTitle');
    const taglineEl = document.getElementById('detailTagline');
    const badgeEl = document.getElementById('detailBadge');
    const volumeEl = document.getElementById('detailVolume');
    const categoryEl = document.getElementById('detailCategory');
    const priceEl = document.getElementById('detailPrice');
    const bpomEl = document.getElementById('detailBpom');
    const descEl = document.getElementById('detailDesc');
    const usageEl = document.getElementById('detailUsage');
    const ingredientsEl = document.getElementById('detailIngredients');
    const qtyInput = document.getElementById('detailQtyInput') as HTMLInputElement | null;
    const benefitsContainer = document.getElementById('detailBenefits');

    if (!modal || !imgEl || !titleEl || !priceEl || !bpomEl || !descEl || !benefitsContainer || !qtyInput) {
      return;
    }

    imgEl.src = prod.image;
    imgEl.alt = prod.name;
    imgEl.onerror = () => {
      imgEl.onerror = null;
      imgEl.src = `https://placehold.co/600x600/f8fafc/991b1b?text=${prod.fallbackPlaceholder}`;
    };

    titleEl.textContent = prod.name;
    if (taglineEl) taglineEl.textContent = prod.tagline || '';
    if (badgeEl) badgeEl.textContent = prod.badge || 'BP Group';
    if (volumeEl) volumeEl.textContent = prod.volume;
    if (categoryEl) categoryEl.textContent = prod.category;
    priceEl.textContent = `Rp ${formatRupiah(prod.price)}`;
    bpomEl.textContent = prod.bpom;
    descEl.textContent = prod.description;
    if (usageEl) usageEl.textContent = prod.usage;
    if (ingredientsEl) ingredientsEl.textContent = prod.ingredients;
    qtyInput.value = '1';

    benefitsContainer.innerHTML = prod.benefits
      .map(
        b => `
        <li class="flex items-start gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/60">
          <i class="fa-solid fa-circle-check text-emerald-600 mt-0.5 shrink-0 text-xs"></i>
          <span>${escapeHTML(b)}</span>
        </li>
      `
      )
      .join('');

    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
  }

  public closeProductDetail(): void {
    const modal = document.getElementById('productDetailModal');
    if (!modal) return;
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 200);
    this.activeProduct = null;
  }

  public changeDetailQty(delta: number): void {
    const input = document.getElementById('detailQtyInput') as HTMLInputElement | null;
    if (!input) return;
    let val = parseInt(input.value) || 1;
    val = Math.max(1, Math.min(99, val + delta));
    input.value = String(val);
  }

  public addCurrentDetailToCart(): void {
    if (!this.activeProduct) return;
    const qtyInput = document.getElementById('detailQtyInput') as HTMLInputElement | null;
    const qty = Math.max(1, parseInt(qtyInput?.value || '1') || 1);

    this.addProductToCart(this.activeProduct.id, qty);
    this.closeProductDetail();
  }

  public buyCurrentDetailWA(): void {
    if (!this.activeProduct) return;
    const qtyInput = document.getElementById('detailQtyInput') as HTMLInputElement | null;
    const qty = Math.max(1, parseInt(qtyInput?.value || '1') || 1);

    const waURL = createDirectProductWaUrl(siteConfig.adminWaNumber, this.activeProduct, qty);

    this.closeProductDetail();
    this.showToast('Membuka WhatsApp Admin BPCareU...');
    setTimeout(() => {
      window.open(waURL, '_blank', 'noopener,noreferrer');
    }, 400);
  }

  // --- Catalog Category Filter ---
  public filterCatalog(category: string): void {
    const filterTabs = document.querySelectorAll<HTMLButtonElement>('#filterContainer .filter-tab');
    filterTabs.forEach(btn => {
      if (btn.getAttribute('data-category') === category) {
        btn.className = 'filter-tab px-3.5 py-1.5 rounded-xl text-xs font-bold bg-bpRed-700 text-white shadow-xs cursor-pointer transition-all';
      } else {
        btn.className = 'filter-tab px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer transition-all';
      }
    });

    const cards = document.querySelectorAll<HTMLElement>('#productGrid .product-card');
    cards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      if (category === 'all' || cardCategory === category) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  // --- Checkout Modal ---
  public openCheckoutModal(): void {
    if (this.cart.length === 0) return;

    let total = 0;
    let count = 0;
    this.cart.forEach(item => {
      total += item.price * item.qty;
      count += item.qty;
    });

    const modalTotal = document.getElementById('modalCheckoutTotal');
    const modalCount = document.getElementById('modalCheckoutItemsCount');
    if (modalTotal) modalTotal.textContent = `Rp ${formatRupiah(total)}`;
    if (modalCount) modalCount.textContent = `${count} Item`;

    this.toggleCartDrawer(false);

    const modal = document.getElementById('checkoutModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
  }

  public closeCheckoutModal(): void {
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 200);
  }

  public handleOrderSubmit(event: Event): void {
    event.preventDefault();

    // 1. Anti Spam Trap (Honeypot)
    const honeypot = (document.getElementById('honeypotWebsite') as HTMLInputElement | null)?.value;
    if (honeypot && honeypot.trim() !== '') {
      this.showToast('Pesanan tidak dapat diproses.');
      return;
    }

    // 2. Validate Phone
    const nameInput = document.getElementById('orderName') as HTMLInputElement | null;
    const phoneInput = document.getElementById('orderPhone') as HTMLInputElement | null;
    const addressInput = document.getElementById('orderAddress') as HTMLTextAreaElement | null;
    const notesInput = document.getElementById('orderNotes') as HTMLInputElement | null;
    const phoneError = document.getElementById('phoneError');

    const name = nameInput?.value.trim() || '';
    const phone = phoneInput?.value.trim() || '';
    const address = addressInput?.value.trim() || '';
    const notes = notesInput?.value.trim() || '-';

    if (!validateIndonesianPhone(phone)) {
      phoneError?.classList.remove('hidden');
      return;
    } else {
      phoneError?.classList.add('hidden');
    }

    // 3. Build WhatsApp URL
    const { url } = createCartCheckoutWaUrl({
      name,
      phone,
      address,
      notes,
      items: this.cart,
      adminPhone: siteConfig.adminWaNumber,
    });

    // Reset Cart
    this.cart = [];
    this.saveCart();
    this.closeCheckoutModal();
    this.showToast('Membuka WhatsApp Admin BPCareU...');

    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
    }, 500);
  }

  // --- Dose Calculator ---
  public handleCalculateDose(): void {
    const weightInput = document.getElementById('calcWeight') as HTMLInputElement | null;
    const ageCategorySelect = document.getElementById('calcAgeCategory') as HTMLSelectElement | null;
    const purposeSelect = document.getElementById('calcPurpose') as HTMLSelectElement | null;

    const weight = parseInt(weightInput?.value || '60') || 60;
    const ageCategory = (ageCategorySelect?.value as 'adult' | 'child') || 'adult';
    const purpose = (purposeSelect?.value as 'stamina' | 'recovery' | 'chronic') || 'stamina';

    const result = calculateDose(weight, ageCategory, purpose);

    const doseText = document.getElementById('calcDoseText');
    const productSuggestion = document.getElementById('calcProductSuggestion');

    if (doseText) {
      doseText.textContent = `${result.drops} Tetes, diminum ${result.frequency}.`;
    }
    if (productSuggestion) {
      productSuggestion.innerHTML = `Rekomendasi Utama: <strong>${escapeHTML(result.recommendedProduct)}</strong>. ${escapeHTML(result.advice)}`;
    }

    this.showToast('Kalkulasi dosis disesuaikan!');
  }

  // --- FAQ Accordion ---
  public toggleFaq(btn: HTMLElement): void {
    const parent = btn.closest('.faq-item');
    if (!parent) return;

    const content = parent.querySelector('.faq-content');
    const icon = parent.querySelector('.faq-icon');

    if (!content || !icon) return;

    if (content.classList.contains('hidden')) {
      content.classList.remove('hidden');
      icon.classList.add('rotate-180');
    } else {
      content.classList.add('hidden');
      icon.classList.remove('rotate-180');
    }
  }

  // --- Toast Notification ---
  public showToast(message: string): void {
    const toast = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMessage');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    if (this.toastTimeout) {
      window.clearTimeout(this.toastTimeout);
    }

    this.toastTimeout = window.setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
  }

  // --- Event Bindings ---
  private bindEvents(): void {
    // 1. Cart Drawer Toggle Buttons
    document.getElementById('cartBtn')?.addEventListener('click', () => this.toggleCartDrawer(true));
    document.getElementById('closeCartBtn')?.addEventListener('click', () => this.toggleCartDrawer(false));
    document.getElementById('cartBackdrop')?.addEventListener('click', () => this.toggleCartDrawer(false));
    document.getElementById('checkoutBtn')?.addEventListener('click', () => this.openCheckoutModal());

    // 2. Checkout Modal Buttons & Form
    document.getElementById('closeCheckoutModalBtn')?.addEventListener('click', () => this.closeCheckoutModal());
    document.getElementById('orderForm')?.addEventListener('submit', e => this.handleOrderSubmit(e));

    // 3. Product Detail Modal Controls
    document.getElementById('closeDetailBtn')?.addEventListener('click', () => this.closeProductDetail());
    document.getElementById('qtyDecBtn')?.addEventListener('click', () => this.changeDetailQty(-1));
    document.getElementById('qtyIncBtn')?.addEventListener('click', () => this.changeDetailQty(1));
    document.getElementById('addDetailToCartBtn')?.addEventListener('click', () => this.addCurrentDetailToCart());
    document.getElementById('buyDetailWaBtn')?.addEventListener('click', () => this.buyCurrentDetailWA());

    // 4. Dose Calculator Button
    document.getElementById('btnCalculateDose')?.addEventListener('click', () => this.handleCalculateDose());

    // 5. Delegate Clicks for Dynamic & SSR Elements
    document.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Add package to cart button
      const pkgBtn = target.closest<HTMLButtonElement>('.btn-add-package');
      if (pkgBtn) {
        const pkgId = pkgBtn.getAttribute('data-package-id');
        if (pkgId) this.addPackageToCart(pkgId);
        return;
      }

      // Add product to cart button
      const buyBtn = target.closest<HTMLButtonElement>('.btn-add-cart');
      if (buyBtn) {
        const prodId = buyBtn.getAttribute('data-buy-id');
        if (prodId) this.addProductToCart(prodId);
        return;
      }

      // Open detail from button
      const detailBtn = target.closest<HTMLButtonElement>('.btn-open-detail');
      if (detailBtn) {
        const prodId = detailBtn.getAttribute('data-detail-id');
        if (prodId) this.openProductDetail(prodId);
        return;
      }

      // Open detail when clicking product card
      const prodCard = target.closest<HTMLElement>('.product-card');
      if (prodCard && !target.closest('.action-bar')) {
        const prodId = prodCard.getAttribute('data-id');
        if (prodId) this.openProductDetail(prodId);
        return;
      }

      // Filter catalog tabs
      const filterTab = target.closest<HTMLButtonElement>('.filter-tab');
      if (filterTab) {
        const category = filterTab.getAttribute('data-category');
        if (category) this.filterCatalog(category);
        return;
      }

      // FAQ accordion
      const faqTrigger = target.closest<HTMLButtonElement>('.faq-trigger');
      if (faqTrigger) {
        this.toggleFaq(faqTrigger);
        return;
      }

      // Cart Item quantity adjustment
      const cartDeltaBtn = target.closest<HTMLButtonElement>('[data-cart-delta]');
      if (cartDeltaBtn) {
        const itemId = cartDeltaBtn.getAttribute('data-cart-delta');
        const delta = parseInt(cartDeltaBtn.getAttribute('data-delta') || '0');
        if (itemId && delta) this.updateCartItemQty(itemId, delta);
        return;
      }

      // Cart Item remove
      const cartRemoveBtn = target.closest<HTMLButtonElement>('[data-cart-remove]');
      if (cartRemoveBtn) {
        const itemId = cartRemoveBtn.getAttribute('data-cart-remove');
        if (itemId) this.removeCartItem(itemId);
        return;
      }
    });

    // 6. Image Error Fallback Handler
    document.querySelectorAll<HTMLImageElement>('img.product-img').forEach(img => {
      img.addEventListener('error', function () {
        const fallback = this.getAttribute('data-fallback');
        if (fallback && this.src !== fallback) {
          this.src = fallback;
        }
      });
    });

    // 7. Global Keyboard Handlers (ESC to close modals)
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const detailModal = document.getElementById('productDetailModal');
        if (detailModal && !detailModal.classList.contains('hidden')) {
          this.closeProductDetail();
        }
        const checkoutModal = document.getElementById('checkoutModal');
        if (checkoutModal && !checkoutModal.classList.contains('hidden')) {
          this.closeCheckoutModal();
        }
        const drawer = document.getElementById('cartDrawer');
        if (drawer && !drawer.classList.contains('translate-x-full')) {
          this.toggleCartDrawer(false);
        }
      }
    });
  }
}

// Global initialization
declare global {
  interface Window {
    bpcareuApp?: BPCareUApp;
  }
}

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.bpcareuApp = new BPCareUApp();
  });
}
