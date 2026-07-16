'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/session'

export type LeaderboardEntry = {
  id: string
  user_id: string
  score: number
  display_name: string
  email: string
  rank: number
  created_at: string
}

export type LeaderboardResult = {
  topTen: LeaderboardEntry[]
  userEntry: LeaderboardEntry | null
}

/**
 * Save or update user's high score
 * Only updates if the new score is higher than the existing one
 */
export async function saveHighScore(score: number): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Check if user has an existing high score
    const { data: existing, error: fetchError } = await supabase
      .from('high_scores')
      .select('id, score')
      .eq('user_id', session.userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is fine
      console.error('Error fetching existing score:', fetchError)
      return { success: false, error: 'Failed to check existing score' }
    }

    if (existing) {
      // Update only if new score is higher
      if (score > existing.score) {
        const { error: updateError } = await supabase
          .from('high_scores')
          .update({ score })
          .eq('id', existing.id)

        if (updateError) {
          console.error('Error updating score:', updateError)
          return { success: false, error: 'Failed to update score' }
        }
      }
    } else {
      // Insert new score
      const { error: insertError } = await supabase
        .from('high_scores')
        .insert({ user_id: session.userId, score })

      if (insertError) {
        console.error('Error inserting score:', insertError)
        return { success: false, error: 'Failed to save score' }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error saving score:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Get leaderboard with top 10 scores and current user's rank if not in top 10
 */
export async function getLeaderboard(): Promise<LeaderboardResult> {
  try {
    const session = await getSession()
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Get top 10 scores using the leaderboard view
    const { data: topTen, error: topTenError } = await supabase
      .from('leaderboard')
      .select('*')
      .limit(10)

    if (topTenError) {
      console.error('Error fetching top 10:', topTenError)
      return { topTen: [], userEntry: null }
    }

    // If no user is logged in, just return top 10
    if (!session) {
      return {
        topTen: topTen || [],
        userEntry: null
      }
    }

    // Check if user is in top 10
    const userInTopTen = topTen?.some(entry => entry.user_id === session.userId)

    let userEntry: LeaderboardEntry | null = null

    // If user is not in top 10, get their entry
    if (!userInTopTen) {
      const { data: userEntryData, error: userError } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('user_id', session.userId)
        .single()

      if (!userError && userEntryData) {
        userEntry = userEntryData
      }
    }

    return {
      topTen: topTen || [],
      userEntry
    }
  } catch (error) {
    console.error('Unexpected error fetching leaderboard:', error)
    return { topTen: [], userEntry: null }
  }
}

/**
 * Get user's current high score
 */
export async function getUserHighScore(): Promise<number | null> {
  try {
    const session = await getSession()
    if (!session) return null

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
      .from('high_scores')
      .select('score')
      .eq('user_id', session.userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No record found
        return null
      }
      console.error('Error fetching user high score:', error)
      return null
    }

    return data?.score || null
  } catch (error) {
    console.error('Unexpected error fetching user high score:', error)
    return null
  }
}
