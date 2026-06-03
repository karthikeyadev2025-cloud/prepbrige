// Result Service — PrepBridge
// Saves test results to Supabase REST API with localStorage fallback

function getSupabaseCredentials() {
  let url = import.meta.env.VITE_SUPABASE_URL || ''
  let anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  try {
    const local = localStorage.getItem('prepbridge_admin_settings')
    if (local) {
      const data = JSON.parse(local)
      if (data.supabaseUrl) url = data.supabaseUrl
      if (data.supabaseAnonKey) anonKey = data.supabaseAnonKey
    }
  } catch { /* ignore */ }
  return { url: url.trim().replace(/\/$/, ''), anonKey }
}

function getCurrentUserId() {
  try {
    const persisted = localStorage.getItem('prepbridge-user')
    if (persisted) {
      const state = JSON.parse(persisted)
      return state?.state?.user?.uid || state?.state?.profile?.uid || null
    }
  } catch { /* ignore */ }
  return null
}

// Save test result to Supabase or localStorage
export const saveTestResult = async (result) => {
  const userId = getCurrentUserId()

  try {
    const { url, anonKey } = getSupabaseCredentials()

    if (!url || !anonKey || anonKey.length < 20) {
      throw new Error('Supabase not configured')
    }

    if (!userId) {
      throw new Error('User not authenticated')
    }

    const payload = {
      user_id: userId,
      test_id: result.testId,
      title: result.title,
      score: parseFloat(result.score),
      max_score: result.maxScore,
      percentage: parseFloat(result.pct),
      correct: result.correct,
      wrong: result.wrong,
      skipped: result.skipped,
      date: result.date
    }

    const response = await fetch(`${url}/rest/v1/test_results`, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) throw new Error(`Supabase error: ${response.status}`)

    const data = await response.json()
    const newResult = { ...result, id: data[0]?.id || Date.now().toString() }

    // Also save locally
    const localResults = JSON.parse(localStorage.getItem('prepbridge_test_results') || '[]')
    localResults.push(newResult)
    localStorage.setItem('prepbridge_test_results', JSON.stringify(localResults))

    return newResult
  } catch (error) {
    console.warn('Supabase save failed, using localStorage:', error.message)

    const localResults = JSON.parse(localStorage.getItem('prepbridge_test_results') || '[]')
    const newResult = { ...result, id: Date.now().toString(), user_id: userId }
    localResults.push(newResult)
    localStorage.setItem('prepbridge_test_results', JSON.stringify(localResults))

    return newResult
  }
}

// Get user's test results
export const getUserResults = async () => {
  const userId = getCurrentUserId()

  try {
    const { url, anonKey } = getSupabaseCredentials()

    if (!url || !anonKey || anonKey.length < 20) {
      throw new Error('Supabase not configured')
    }

    if (!userId) {
      throw new Error('User not authenticated')
    }

    const response = await fetch(
      `${url}/rest/v1/test_results?user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc`,
      {
        method: 'GET',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) throw new Error(`Supabase error: ${response.status}`)

    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch Supabase results, using localStorage:', error.message)
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

  const scores = results.map(r => parseFloat(r.pct || r.percentage || 0))
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
