import { supabase } from './supabaseService'
import { toast } from 'react-hot-toast'

// Save test result to Supabase or localStorage
export const saveTestResult = async (result) => {
  try {
    // Try to store in Supabase first
    const { data, error } = await supabase
      .from('test_results')
      .insert([{
        user_id: supabase.auth.user()?.id,
        test_id: result.testId,
        title: result.title,
        score: parseFloat(result.score),
        max_score: result.maxScore,
        percentage: parseFloat(result.pct),
        correct: result.correct,
        wrong: result.wrong,
        skipped: result.skipped,
        date: result.date
      }])
      .select()

    if (error) throw error

    // Fallback to localStorage if Supabase fails
    let localResults = JSON.parse(localStorage.getItem('prepbridge_test_results') || '[]')
    localResults.push({
      ...result,
      id: data[0]?.id || Date.now().toString() // Use Supabase ID if available
    })
    localStorage.setItem('prepbridge_test_results', JSON.stringify(localResults))

    return data[0]
  } catch (error) {
    console.warn('Supabase save failed, using localStorage:', error.message)

    // Fallback to localStorage
    let localResults = JSON.parse(localStorage.getItem('prepbridge_test_results') || '[]')
    const newResult = {
      ...result,
      id: Date.now().toString()
    }
    localResults.push(newResult)
    localStorage.setItem('prepbridge_test_results', JSON.stringify(localResults))

    return newResult
  }
}

// Get user's test results
export const getUserResults = async () => {
  try {
    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error

    return data
  } catch (error) {
    console.warn('Failed to fetch Supabase results, using localStorage:', error.message)

    // Fallback to localStorage
    return JSON.parse(localStorage.getItem('prepbridge_test_results') || '[]')
  }
}

// Get user's test statistics
export const getUserStats = async () => {
  const results = await getUserResults()

  if (results.length === 0) {
    return {
      totalTests: 0,
      avgScore: 0,
      bestScore: 0,
      improvementTrend: 0
    }
  }

  const scores = results.map(r => parseFloat(r.pct))
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const bestScore = Math.max(...scores)
  const recentScores = scores.slice(0, 5)
  const olderScores = scores.slice(5, 10)
  const improvementTrend = olderScores.length > 0
    ? (recentScores.reduce((a, b) => a + b, 0) / recentScores.length) -
      (olderScores.reduce((a, b) => a + b, 0) / olderScores.length)
    : 0

  return {
    totalTests: results.length,
    avgScore: Math.round(avgScore),
    bestScore: Math.round(bestScore),
    improvementTrend: Math.round(improvementTrend * 100) / 100
  }
}