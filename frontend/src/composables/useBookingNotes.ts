export function useBookingNotes(booking: any) {
  const hasBookingNotes = (): boolean => {
    const customerData = booking.customer_data as any || {}
    const notes = customerData.notes || {}
    
    // Check if there are any selected notes
    const hasSelectedNotes = Object.keys(notes).some(key => 
      key !== 'comment' && (notes as any)[key] === true
    )
    
    // Check if there's a comment
    const hasComment = (notes as any).comment && (notes as any).comment.trim().length > 0
    
    return hasSelectedNotes || hasComment
  }

  const getSelectedNotes = (): string[] => {
    const customerData = booking.customer_data as any || {}
    const notes = customerData.notes || {}
    const selectedNotes: string[] = []
    
    // Map of note keys to display labels
    const noteLabels: Record<string, string> = {
      honeymooners: 'Медовый месяц',
      regularGuest: 'Постоянный гость отеля',
      twinBeds: 'Две отдельные кровати',
      groundFloor: 'Первый этаж',
      notGroundFloor: 'НЕ первый этаж',
      babyCot: 'Детская кроватка',
      handicapAccessible: 'Доступная комната для инвалидов',
      doubleBed: 'Двуспальная кровать'
    }
    
    // Check each note and add to selectedNotes if true
    Object.keys(noteLabels).forEach(key => {
      if ((notes as any)[key] === true) {
        selectedNotes.push(noteLabels[key])
      }
    })
    
    return selectedNotes
  }

  const getBookingComment = (): string => {
    const customerData = booking.customer_data as any || {}
    const notes = customerData.notes || {}
    
    return (notes as any).comment || ''
  }

  return {
    hasBookingNotes,
    getSelectedNotes,
    getBookingComment
  }
}
