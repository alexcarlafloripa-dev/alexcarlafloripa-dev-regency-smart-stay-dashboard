export const GESTOR_WHATSAPP = '5548988749258';

export function buildWhatsAppUrl(message: string) {
  return `https://api.whatsapp.com/send?phone=${GESTOR_WHATSAPP}&text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(message: string) {
  window.location.href = buildWhatsAppUrl(message);
}
