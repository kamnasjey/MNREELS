import { QPayClient } from "qpay-js";

// QPay client — credentials-ийг .env-ээс авна
// Гэрээ хийсний дараа .env файлд дараах утгуудыг оруулна:
//   QPAY_USERNAME=<merchant_username>
//   QPAY_PASSWORD=<merchant_password>
//   QPAY_INVOICE_CODE=<invoice_code>
//   QPAY_CALLBACK_URL=<your_domain>/api/qpay/callback

let _client: QPayClient | null = null;

export function getQPayClient(): QPayClient {
  if (_client) return _client;

  const baseUrl = process.env.QPAY_BASE_URL || "https://merchant-sandbox.qpay.mn";
  const username = process.env.QPAY_USERNAME || "";
  const password = process.env.QPAY_PASSWORD || "";
  const invoiceCode = process.env.QPAY_INVOICE_CODE || "";
  const callbackUrl = process.env.QPAY_CALLBACK_URL || "";

  if (!username || !password) {
    throw new Error("QPay credentials тохируулаагүй байна. .env файлд QPAY_USERNAME, QPAY_PASSWORD нэмнэ үү.");
  }

  _client = new QPayClient({
    baseUrl,
    username,
    password,
    invoiceCode,
    callbackUrl,
  });

  return _client;
}

// Тасалбар багцууд
export const TASALBAR_PACKAGES = [
  { id: "pkg-20", name: "Турших", amount: 20, priceMNT: 1000 },
  { id: "pkg-65", name: "Жижиг", amount: 65, priceMNT: 2500, bonus: 5 },
  { id: "pkg-135", name: "Дунд", amount: 135, priceMNT: 5000, bonus: 10, popular: true },
  { id: "pkg-290", name: "Том", amount: 290, priceMNT: 10000, bonus: 20 },
  { id: "pkg-600", name: "Супер", amount: 600, priceMNT: 18000, bonus: 50 },
] as const;

export function getPackageById(id: string) {
  return TASALBAR_PACKAGES.find((p) => p.id === id);
}

export function isQPayConfigured(): boolean {
  return !!(process.env.QPAY_USERNAME && process.env.QPAY_PASSWORD);
}
