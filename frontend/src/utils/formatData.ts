export function formatDateFromISO(isoString: string): string {
  if (!isoString) return ''

  try {
    const date = new Date(isoString)

    // Format dạng dd/MM/yyyy
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  } catch (error) {
    console.error(`Invalid ISO string: ${error}`, isoString)
    return ''
  }
}
