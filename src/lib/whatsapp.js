const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || '919833325547').replace(/[^0-9]/g, '');

export function whatsappUrl(message) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
