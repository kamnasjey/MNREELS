import { getPendingWithdrawals } from "@/lib/actions/admin";
import WithdrawalManagementClient from "./WithdrawalManagementClient";

export default async function AdminWithdrawalsPage() {
  const withdrawals = await getPendingWithdrawals();
  return <WithdrawalManagementClient withdrawals={withdrawals} />;
}
