// Auto-generated types for Supabase schema
// Run `supabase gen types typescript` to regenerate

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          bio: string;
          is_creator: boolean;
          creator_verified: boolean;
          is_admin: boolean;
          bank_name: string | null;
          bank_account: string | null;
          tasalbar_balance: number;
          payment_id: number | null;
          login_streak: number;
          last_login_date: string | null;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string;
          is_creator?: boolean;
          creator_verified?: boolean;
          is_admin?: boolean;
          bank_name?: string | null;
          bank_account?: string | null;
          tasalbar_balance?: number;
          payment_id?: number | null;
          login_streak?: number;
          last_login_date?: string | null;
          last_seen_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      series: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          description: string;
          cover_url: string | null;
          category: string;
          age_rating: string;
          free_episodes: number;
          is_published: boolean;
          total_views: number;
          rating: number;
          bundle_price: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          title: string;
          description?: string;
          cover_url?: string | null;
          category: string;
          age_rating?: string;
          free_episodes?: number;
          is_published?: boolean;
          bundle_price?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["series"]["Insert"]>;
        Relationships: [];
      };
      episodes: {
        Row: {
          id: string;
          series_id: string;
          episode_number: number;
          title: string;
          duration: number;
          video_url: string | null;
          thumbnail_url: string | null;
          is_free: boolean;
          tasalbar_cost: number;
          status: "processing" | "moderation" | "published" | "rejected";
          views: number;
          published_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          series_id: string;
          episode_number: number;
          title: string;
          duration?: number;
          video_url?: string | null;
          thumbnail_url?: string | null;
          is_free?: boolean;
          tasalbar_cost?: number;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["episodes"]["Insert"]>;
        Relationships: [];
      };
      follows: {
        Row: {
          id: string;
          user_id: string;
          creator_id: string | null;
          series_id: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          creator_id?: string | null;
          series_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["follows"]["Insert"]>;
        Relationships: [];
      };
      watch_history: {
        Row: {
          id: string;
          user_id: string;
          episode_id: string;
          progress: number;
          completed: boolean;
          last_watched_at: string;
        };
        Insert: {
          user_id: string;
          episode_id: string;
          progress?: number;
          completed?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["watch_history"]["Insert"]>;
        Relationships: [];
      };
      purchases: {
        Row: {
          id: string;
          user_id: string;
          episode_id: string;
          tasalbar_spent: number;
          expires_at: string;
          is_bundle: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          episode_id: string;
          tasalbar_spent: number;
          expires_at: string;
          is_bundle?: boolean;
        };
        Update: never;
        Relationships: [];
      };
      tasalbar_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: "buy" | "spend" | "earn" | "withdraw";
          description: string | null;
          payment_method: string | null;
          payment_ref: string | null;
          episode_id: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          amount: number;
          type: "buy" | "spend" | "earn" | "withdraw";
          description?: string | null;
          payment_method?: string | null;
          payment_ref?: string | null;
          episode_id?: string | null;
        };
        Update: never;
        Relationships: [];
      };
      creator_earnings: {
        Row: {
          id: string;
          creator_id: string;
          episode_id: string;
          buyer_id: string;
          total_tasalbar: number;
          creator_share: number;
          platform_share: number;
          is_withdrawn: boolean;
          created_at: string;
        };
        Insert: {
          creator_id: string;
          episode_id: string;
          buyer_id: string;
          total_tasalbar: number;
          creator_share: number;
          platform_share: number;
        };
        Update: {
          is_withdrawn?: boolean;
        };
        Relationships: [];
      };
      withdrawals: {
        Row: {
          id: string;
          creator_id: string;
          tasalbar_amount: number;
          tugrug_amount: number;
          bank_name: string;
          bank_account: string;
          status: "pending" | "processing" | "completed" | "rejected";
          created_at: string;
          processed_at: string | null;
        };
        Insert: {
          creator_id: string;
          tasalbar_amount: number;
          tugrug_amount: number;
          bank_name: string;
          bank_account: string;
        };
        Update: {
          status?: string;
          processed_at?: string;
        };
        Relationships: [];
      };
      tasalbar_purchases: {
        Row: {
          id: string;
          user_id: string;
          payment_id: number | null;
          package_id: string;
          tasalbar_amount: number;
          tugrug_amount: number;
          transfer_description: string | null;
          status: "pending" | "approved" | "rejected";
          created_at: string;
          processed_at: string | null;
        };
        Insert: {
          user_id: string;
          payment_id?: number | null;
          package_id: string;
          tasalbar_amount: number;
          tugrug_amount: number;
          transfer_description?: string | null;
          status?: string;
        };
        Update: {
          status?: string;
          processed_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_balance: {
        Args: { user_id: string; amount: number };
        Returns: undefined;
      };
      search_series: {
        Args: { search_query: string };
        Returns: Database["public"]["Tables"]["series"]["Row"][];
      };
      get_continue_watching: {
        Args: { p_user_id: string };
        Returns: {
          episode_id: string;
          series_title: string;
          episode_title: string;
          episode_number: number;
          video_url: string;
          thumbnail_url: string;
          progress: number;
          duration: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
