export function formatRupiah(amount: number): string {
  return amount.toLocaleString('id-ID');
}

export function escapeHTML(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function validateIndonesianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, '');
  const idPhoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
  return idPhoneRegex.test(cleaned);
}
