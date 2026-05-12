import SHA256 from "crypto-js/sha256";

export function generateHash(data: string): string {
  return SHA256(data).toString();
}

export function generateAlphanumericCode(length: number = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateUniqueCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = generateAlphanumericCode(6);
  return `VET-${timestamp}-${random}`;
}

export function generateFolio(prefijo: string, numero: number): string {
  return `${prefijo}${String(numero).padStart(6, "0")}`;
}

export function calculateExpiryDate(emissionDate: Date, diasVigencia: number): Date {
  const expiry = new Date(emissionDate);
  expiry.setDate(expiry.getDate() + diasVigencia);
  return expiry;
}

export function formatRut(rut: string): string {
  const clean = rut.replace(/[^0-9kK]/g, "");
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1).toUpperCase();
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted}-${dv}`;
}

export function validateRutChile(rut: string): boolean {
  const clean = rut.replace(/[^0-9kK]/g, "");
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1).toUpperCase();
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const expectedDv = 11 - (sum % 11);
  const dvChar = expectedDv === 11 ? "0" : expectedDv === 10 ? "K" : expectedDv.toString();
  return dv === dvChar;
}

export function formatDateFormat(date: Date): string {
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isPrescriptionValid(fechaVencimiento: string): boolean {
  return new Date(fechaVencimiento) > new Date();
}

export function getSaleConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    venta_libre: "Venta Libre",
    receta_simple: "Receta Médico Veterinaria",
    receta_retenida: "Receta Retenida",
    receta_retenida_control_saldo: "Receta Retenida c/Control Saldo",
    uso_restringido: "Uso Restringido",
  };
  return labels[condition] || condition;
}

export function getPrescriptionTypeBadgeColor(type: string): string {
  const colors: Record<string, string> = {
    receta_simple: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    receta_retenida: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    receta_retenida_control_saldo: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    receta_antimicrobiano: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  };
  return colors[type] || "bg-gray-100 text-gray-800";
}

export function getPrescriptionStatusLabel(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    emitida: { label: "Emitida", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
    vigente: { label: "Vigente", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    vencida: { label: "Vencida", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
    anulada: { label: "Anulada", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
    reemplazada: { label: "Reemplazada", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" },
  };
  return map[status] || { label: status, color: "bg-gray-100 text-gray-800" };
}

export function generateUUID(): string {
  return crypto.randomUUID();
}