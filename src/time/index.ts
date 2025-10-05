/**
 * Converts various time units to total seconds
 * @param options - Object containing optional time units
 * @param options.seconds - Number of seconds (default: 0)
 * @param options.minutes - Number of minutes (default: 0)
 * @param options.hours - Number of hours (default: 0)
 * @param options.days - Number of days (default: 0)
 * @param options.months - Number of months (default: 0, assumes 30 days per month)
 * @param options.years - Number of years (default: 0, assumes 365 days per year)
 * @returns Total time in seconds
 */
export function convertToSeconds(
  options: {
    seconds?: number
    minutes?: number
    hours?: number
    days?: number
    months?: number
    years?: number
  } = {}
): number {
  const {
    seconds = 0,
    minutes = 0,
    hours = 0,
    days = 0,
    months = 0,
    years = 0,
  } = options

  // Time conversion constants
  const SECONDS_PER_MINUTE = 60
  const SECONDS_PER_HOUR = 60 * 60
  const SECONDS_PER_DAY = 60 * 60 * 24
  const SECONDS_PER_MONTH = 60 * 60 * 24 * 30 // Assuming 30 days per month
  const SECONDS_PER_YEAR = 60 * 60 * 24 * 365 // Assuming 365 days per year

  return (
    seconds +
    minutes * SECONDS_PER_MINUTE +
    hours * SECONDS_PER_HOUR +
    days * SECONDS_PER_DAY +
    months * SECONDS_PER_MONTH +
    years * SECONDS_PER_YEAR
  )
}

export const getUnixTimestampMs = (): number => {
  return Date.now()
}

export const getUnixTimestamp = (): number => {
  return Math.floor(getUnixTimestampMs() / 1000)
}

/**
 * Gets the full year from a Date object or the current date
 * @param date - Optional Date object. If not provided, uses current date
 * @returns The full year (4 digits)
 */
export const getFullYear = (date?: Date): number => {
  const targetDate = date || new Date()
  return targetDate.getFullYear()
}
