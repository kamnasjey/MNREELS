import { getPendingPurchases } from "@/lib/actions/admin";
import PurchasesClient from "./PurchasesClient";

export default async function AdminPurchasesPage() {
  const purchases = await getPendingPurchases();
  return <PurchasesClient purchases={purchases} />;
}
