export interface SeriesItem {
  id: string;
  title: string;
  creator: string;
  episodes: number;
  category: string;
  rating: number;
  gradient: string;
  watchedEpisodes?: number;
  coverUrl?: string;
}

export interface CreatorItem {
  id: string;
  name: string;
  avatar: string;
  seriesCount: number;
  gradient: string;
}

export interface ContinueWatchingItem {
  episodeId: string;
  seriesId: string;
  seriesTitle: string;
  episodeNumber: number;
  progress: number;
  gradient: string;
  coverUrl?: string;
}

export interface BundlePurchase {
  seriesId: string;
  seriesTitle: string;
  coverUrl?: string;
  expiresAt: string;
  gradient: string;
}

export interface TasalbarTransaction {
  id: string;
  type: string;
  amount: number;
  desc: string;
  time: string;
}

export interface TasalbarPurchaseItem {
  id: string;
  tasalbar_amount: number;
  tugrug_amount: number;
  status: string;
  created_at: string;
}

export interface TasalbarData {
  balance: number;
  transactions: TasalbarTransaction[];
  purchases: TasalbarPurchaseItem[];
  paymentId: number | null;
}

export interface CreatorStats {
  totalEarnings: number;
  totalViews: number;
  seriesCount: number;
}

export interface UserProfile {
  username: string;
  displayName: string;
  avatarInitial: string;
  avatarUrl?: string;
  bio: string;
  followingCount: number;
  isCreator?: boolean;
  isAdmin?: boolean;
  creatorStats?: CreatorStats;
  loginStreak?: number;
}

export interface ProfileFeedProps {
  user: UserProfile;
  watchedSeries: SeriesItem[];
  followedCreators: CreatorItem[];
  followedSeries: SeriesItem[];
  continueWatching: ContinueWatchingItem[];
  bundlePurchases: BundlePurchase[];
  tasalbar: TasalbarData;
  isLoggedIn: boolean;
}
