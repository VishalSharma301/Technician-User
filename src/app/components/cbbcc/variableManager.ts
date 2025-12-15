// utils/VariableManager.ts
import { ChatbotVariables, ServiceOption, ServiceBrand } from './cbTypes';

export class VariableManager {
  static getDefaultVariables(serviceData: any): ChatbotVariables {
    return {
      serviceId: serviceData._id,
      serviceName: serviceData.name,
      selectedOption: null,
      selectedBrand: null,
      quantity: 1,
      totalPrice: serviceData.basePrice || 0,
      address: '',
      notes: '',
      estimatedTime: serviceData.estimatedTime,
    };
  }

  static updateVariables(
    current: ChatbotVariables,
    updates: Partial<ChatbotVariables>,
    serviceData: any
  ): ChatbotVariables {
    const updated = { ...current, ...updates };
    
    // Recalculate total price if necessary
    if (updates.selectedOption !== undefined || updates.quantity !== undefined) {
      updated.totalPrice = this.calculateTotalPrice(
        updates.selectedOption || current.selectedOption,
        updates.quantity || current.quantity,
        serviceData
      );
    }
    
    return updated;
  }

  static calculateTotalPrice(
    option: ServiceOption | null,
    quantity: number,
    serviceData: any
  ): number {
    if (!option) {
      return (serviceData.basePrice || 0) * quantity;
    }
    
    if (quantity === 1) return option.singlePrice;
    if (quantity === 2) return option.doublePrice || option.singlePrice * 2;
    if (quantity === 3) return option.triplePrice || option.singlePrice * 3;
    
    return option.singlePrice * quantity;
  }

  static resetDependentVariables(
    variables: ChatbotVariables,
    changedVariable: keyof ChatbotVariables
  ): ChatbotVariables {
    const resetValues: Partial<ChatbotVariables> = {};
    
    switch (changedVariable) {
      case 'selectedOption':
        resetValues.selectedBrand = null;
        resetValues.quantity = 1;
        resetValues.totalPrice = 0;
        resetValues.address = '';
        resetValues.notes = '';
        break;
        
      case 'selectedBrand':
        resetValues.quantity = 1;
        resetValues.totalPrice = 0;
        resetValues.address = '';
        resetValues.notes = '';
        break;
        
      case 'quantity':
        resetValues.totalPrice = 0;
        resetValues.notes = '';
        break;
        
      case 'address':
        resetValues.notes = '';
        break;
    }
    
    return { ...variables, ...resetValues };
  }
}