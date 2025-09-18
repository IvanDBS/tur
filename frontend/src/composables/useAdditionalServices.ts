export function useAdditionalServices(booking: any) {
  const hasAdditionalServices = (): boolean => {
    const customerData = booking.customer_data as any || {}
    const additionalServices = customerData.additional_services || {}
    
    return !!(additionalServices.insurance || additionalServices.transfer || additionalServices.covidInsurance)
  }

  const getInsuranceName = (): string => {
    const customerData = booking.customer_data as any || {}
    const additionalServices = customerData.additional_services || {}
    const insurance = additionalServices.insurance || {}
    
    switch (insurance.type) {
      case 'STANDARD':
        return 'STANDARD 10000 EUR'
      case 'STANDARD_PLUS':
        return 'STANDARD PLUS TR 30 000 EUR'
      case 'NONE':
        return 'Без страхования'
      default:
        return insurance.type || 'Тип страхования не указан'
    }
  }

  const getInsuranceDescription = (): string => {
    const customerData = booking.customer_data as any || {}
    const additionalServices = customerData.additional_services || {}
    const insurance = additionalServices.insurance || {}
    
    switch (insurance.type) {
      case 'STANDARD':
        return 'Стандартная страховка на 10000 EUR'
      case 'STANDARD_PLUS':
        return 'Расширенная страховка на 30000 EUR'
      case 'NONE':
        return 'Страхование отключено'
      default:
        return insurance.coverage || ''
    }
  }

  const getInsuranceIncluded = (): boolean => {
    const customerData = booking.customer_data as any || {}
    const additionalServices = customerData.additional_services || {}
    const insurance = additionalServices.insurance || {}
    
    return insurance.included === true
  }

  const getInsurancePrice = (): number => {
    const customerData = booking.customer_data as any || {}
    const additionalServices = customerData.additional_services || {}
    const insurance = additionalServices.insurance || {}
    
    return insurance.price || 0
  }

  const getTransferName = (): string => {
    const customerData = booking.customer_data as any || {}
    const additionalServices = customerData.additional_services || {}
    const transfer = additionalServices.transfer || {}
    
    switch (transfer.type) {
      case 'GROUP':
        return 'GROUP (BUS)'
      case 'INDIVIDUAL':
        return 'INDIVIDUAL TRANSFER'
      case 'VIP':
        return 'VIP IND TRANSFER'
      default:
        return transfer.type || 'Тип трансфера не указан'
    }
  }

  const getTransferDescription = (): string => {
    const customerData = booking.customer_data as any || {}
    const additionalServices = customerData.additional_services || {}
    const transfer = additionalServices.transfer || {}
    
    switch (transfer.type) {
      case 'GROUP':
        return 'Групповой трансфер на автобусе'
      case 'INDIVIDUAL':
        return 'Индивидуальный трансфер'
      case 'VIP':
        return 'VIP индивидуальный трансфер'
      default:
        return ''
    }
  }

  const getTransferIncluded = (): boolean => {
    const customerData = booking.customer_data as any || {}
    const additionalServices = customerData.additional_services || {}
    const transfer = additionalServices.transfer || {}
    
    return transfer.included === true
  }

  const getTransferPrice = (): number => {
    const customerData = booking.customer_data as any || {}
    const additionalServices = customerData.additional_services || {}
    const transfer = additionalServices.transfer || {}
    
    return transfer.price || 0
  }

  const getCovidInsuranceType = (): string => {
    const customerData = booking.customer_data as any || {}
    const additionalServices = customerData.additional_services || {}
    const covidInsurance = additionalServices.covidInsurance || {}
    
    return covidInsurance.type || 'INCLUDED'
  }

  const getCovidInsurancePrice = (): number => {
    const customerData = booking.customer_data as any || {}
    const additionalServices = customerData.additional_services || {}
    const covidInsurance = additionalServices.covidInsurance || {}
    
    return covidInsurance.price || 0
  }

  return {
    hasAdditionalServices,
    getInsuranceName,
    getInsuranceDescription,
    getInsuranceIncluded,
    getInsurancePrice,
    getTransferName,
    getTransferDescription,
    getTransferIncluded,
    getTransferPrice,
    getCovidInsuranceType,
    getCovidInsurancePrice
  }
}
