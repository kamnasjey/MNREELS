import { getAllCreators } from "@/lib/actions/admin";
import CreatorsManagementClient from "./CreatorsManagementClient";

export default async function AdminCreatorsPage() {
  const creators = await getAllCreators();
  return <CreatorsManagementClient creators={creators} />;
}
