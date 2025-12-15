import { ChatbotVariables, StepType } from "./cbTypes";

// DependencyManager.ts
class DependencyManager {
  private static dependencyMap: Record<string, string[]> = {
    selectedOption: ['selectedBrand', 'quantity', 'totalPrice', 'address', 'notes'],
    selectedBrand: ['quantity', 'totalPrice', 'address', 'notes'],
    quantity: ['totalPrice', 'notes'],
    address: ['notes'],
  };
  
  static getDependentVariables(variableName: string): string[] {
    return this.dependencyMap[variableName] || [];
  }
  
  static clearDependentVariables(
    variables: ChatbotVariables,
    changedVariable: string
  ): ChatbotVariables {
    const dependentVars = this.getDependentVariables(changedVariable);
    const updated = { ...variables };
    
    dependentVars.forEach(depVar => {
      (updated as any)[depVar] = null;
    });
    
    return updated;
  }
  
  static getVariableForStepType(stepType: StepType): keyof ChatbotVariables | null {
    const mapping: Record<StepType, keyof ChatbotVariables> = {
      GREETING: null,
      OPTION_SELECTION: 'selectedOption',
      BRAND_SELECTION: 'selectedBrand',
      QUANTITY_SELECTION: 'quantity',
      QUANTITY_CONFIRM: null,
      ADDRESS_INPUT: 'address',
      NOTES_INPUT: 'notes',
      FINAL_CONFIRMATION: null,
    };
    
    return mapping[stepType] || null;
  }
}