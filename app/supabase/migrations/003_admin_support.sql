-- Add admin column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Admin can read all episodes (including non-published for moderation)
CREATE POLICY "Admins can view all episodes"
  ON public.episodes FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin can update any episode (approve/reject)
CREATE POLICY "Admins can update any episode"
  ON public.episodes FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin can view all withdrawals
CREATE POLICY "Admins can view all withdrawals"
  ON public.withdrawals FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin can update withdrawals (process/complete/reject)
CREATE POLICY "Admins can update withdrawals"
  ON public.withdrawals FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin can view all transactions
CREATE POLICY "Admins can view all transactions"
  ON public.tasalbar_transactions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin can view all earnings
CREATE POLICY "Admins can view all earnings"
  ON public.creator_earnings FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin can update profiles (verify creators, set admin)
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Creator can view own episodes (all statuses)
CREATE POLICY "Creators can view own episodes"
  ON public.episodes FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.series WHERE id = series_id AND creator_id = auth.uid())
  );
