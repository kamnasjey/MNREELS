import { getPendingEpisodes, getAllEpisodes } from "@/lib/actions/admin";
import EpisodeModerationClient from "./EpisodeModerationClient";

export default async function AdminEpisodesPage() {
  const [pending, all] = await Promise.all([
    getPendingEpisodes(),
    getAllEpisodes(),
  ]);

  return <EpisodeModerationClient pending={pending} all={all} />;
}
