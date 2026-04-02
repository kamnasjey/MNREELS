-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- This creates a function that properly deletes a series with all related data

CREATE OR REPLACE FUNCTION delete_series_cascade(p_series_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_creator_id UUID;
  v_episode_ids UUID[];
BEGIN
  -- Verify ownership
  SELECT creator_id INTO v_creator_id
  FROM series WHERE id = p_series_id;

  IF v_creator_id IS NULL OR v_creator_id != p_user_id THEN
    RAISE EXCEPTION 'Эрх байхгүй';
  END IF;

  -- Get all episode IDs
  SELECT ARRAY_AGG(id) INTO v_episode_ids
  FROM episodes WHERE series_id = p_series_id;

  IF v_episode_ids IS NOT NULL THEN
    -- Delete related records (bypasses RLS with SECURITY DEFINER)
    DELETE FROM watch_history WHERE episode_id = ANY(v_episode_ids);
    DELETE FROM purchases WHERE episode_id = ANY(v_episode_ids);
    DELETE FROM creator_earnings WHERE episode_id = ANY(v_episode_ids);

    -- Delete episodes
    DELETE FROM episodes WHERE series_id = p_series_id;
  END IF;

  -- Delete follows related to this creator (not series)
  -- DELETE FROM follows WHERE creator_id = p_user_id;

  -- Delete the series
  DELETE FROM series WHERE id = p_series_id;

  RETURN TRUE;
END;
$$;

-- Also create function for deleting single episode
CREATE OR REPLACE FUNCTION delete_episode_cascade(p_episode_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_creator_id UUID;
BEGIN
  -- Verify ownership through series
  SELECT s.creator_id INTO v_creator_id
  FROM episodes e
  JOIN series s ON s.id = e.series_id
  WHERE e.id = p_episode_id;

  IF v_creator_id IS NULL OR v_creator_id != p_user_id THEN
    RAISE EXCEPTION 'Эрх байхгүй';
  END IF;

  -- Delete related records
  DELETE FROM watch_history WHERE episode_id = p_episode_id;
  DELETE FROM purchases WHERE episode_id = p_episode_id;
  DELETE FROM creator_earnings WHERE episode_id = p_episode_id;

  -- Delete episode
  DELETE FROM episodes WHERE id = p_episode_id;

  RETURN TRUE;
END;
$$;
