import MobileShell from "@/components/MobileShell";
import { SkeletonHomeFeed } from "@/components/SkeletonCard";

export default function HomeLoading() {
  return (
    <MobileShell>
      <SkeletonHomeFeed />
    </MobileShell>
  );
}
