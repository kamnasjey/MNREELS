import MobileShell from "@/components/MobileShell";
import { SkeletonSeriesDetail } from "@/components/SkeletonCard";

export default function SeriesLoading() {
  return (
    <MobileShell>
      <SkeletonSeriesDetail />
    </MobileShell>
  );
}
