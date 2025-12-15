// utils/StepProcessor.ts
import {
  ConversationStep,
  ServiceData,
  ChatbotVariables,
  ConversationStepType,
} from './cbTypes';

export class StepProcessor {
  static shouldSkipStep(step: ConversationStep, serviceData: ServiceData): boolean {
    const config = step.config || {};
    
    switch (step.stepType) {
      case 'BRAND_SELECTION':
        return config.showBrands === false || serviceData.brands.length === 0;
      case 'OPTION_SELECTION':
        return config.showOptions === false || serviceData.options.length === 0;
      default:
        return false;
    }
  }

  static getStepDependencies(stepType: ConversationStepType): string[] {
    const dependencyMap: Record<ConversationStepType, string[]> = {
      GREETING: [],
      OPTION_SELECTION: ['selectedBrand', 'quantity', 'totalPrice', 'address', 'notes'],
      BRAND_SELECTION: ['quantity', 'totalPrice', 'address', 'notes'],
      QUANTITY_SELECTION: ['totalPrice', 'notes'],
      QUANTITY_CONFIRM: [],
      ADDRESS_INPUT: ['notes'],
      NOTES_INPUT: [],
      FINAL_CONFIRMATION: [],
    };
    
    return dependencyMap[stepType] || [];
  }

  static calculatePrice(
    option: any,
    quantity: number,
    basePrice: number
  ): number {
    if (!option) return basePrice * quantity;
    
    if (quantity === 1) return option.singlePrice;
    if (quantity === 2 && option.doublePrice) return option.doublePrice;
    if (quantity === 3 && option.triplePrice) return option.triplePrice;
    
    return option.singlePrice * quantity;
  }

  static getNextStep(
    currentStep: ConversationStep,
    steps: ConversationStep[],
    serviceData: ServiceData
  ): ConversationStep | null {
    const activeSteps = steps
      .filter(step => step.isActive)
      .sort((a, b) => a.stepNumber - b.stepNumber);
    
    const currentIndex = activeSteps.findIndex(s => s._id === currentStep._id);
    
    for (let i = currentIndex + 1; i < activeSteps.length; i++) {
      const nextStep = activeSteps[i];
      if (!this.shouldSkipStep(nextStep, serviceData)) {
        return nextStep;
      }
    }
    
    return null;
  }
}