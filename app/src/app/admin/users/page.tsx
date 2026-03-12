import { getAllUsers } from "@/lib/actions/admin";
import UsersManagementClient from "./UsersManagementClient";

export default async function AdminUsersPage() {
  const users = await getAllUsers();
  return <UsersManagementClient users={users} />;
}
