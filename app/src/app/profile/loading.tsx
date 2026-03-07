import MobileShell from "@/components/MobileShell";
import { SkeletonProfile } from "@/components/SkeletonCard";

export default function ProfileLoading() {
  return (
    <MobileShell>
      <SkeletonProfile />
    </MobileShell>
  );
}
