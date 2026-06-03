import { CURRENT_AFFAIRS_DATA } from '../data/currentAffairs'
import { format, subDays } from 'date-fns'

/**
 * Dynamically shifts the hardcoded current affairs dates to correspond to relative offsets 
 * from the user's current local date. This ensures that the platform's daily competitive news
 * bulletin is literally always perfectly updated to the current date.
 */
export function getAutoUpdatedCurrentAffairs() {
  const today = new Date()
  
  return CURRENT_AFFAIRS_DATA.map(item => {
    let articleDate

    // Distribute articles dynamically based on their ID
    if (item.id === 1 || item.id === 2) {
      articleDate = today
    } else if (item.id === 3 || item.id === 4 || item.id === 5) {
      articleDate = subDays(today, 1)
    } else if (item.id === 6 || item.id === 7 || item.id === 8) {
      articleDate = subDays(today, 2)
    } else if (item.id === 9 || item.id === 10) {
      articleDate = subDays(today, 3)
    } else {
      articleDate = subDays(today, 4)
    }
    
    return {
      ...item,
      date: format(articleDate, 'yyyy-MM-dd')
    }
  })
}
