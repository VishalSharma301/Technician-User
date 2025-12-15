import { ChatbotVariables, ConversationSettings, Service } from "./cbTypes";

// TemplateRenderer.ts
class TemplateRenderer {
  static render(
    template: string,
    variables: ChatbotVariables,
    service: Service,
    settings: ConversationSettings
  ): string {
    const context = this.buildContext(variables, service, settings);
    
    return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      const value = context[varName as keyof typeof context];
      return value?.toString() || '';
    });
  }
  
  private static buildContext(
    variables: ChatbotVariables,
    service: Service,
    settings: ConversationSettings
  ): Record<string, any> {
    return {
      // From variables
      serviceName: variables.serviceName,
      zipcode: variables.zipcode,
      selectedOption: variables.selectedOption,
      selectedBrand: variables.selectedBrand,
      quantity: variables.quantity,
      totalPrice: variables.totalPrice ? `$${variables.totalPrice}` : '',
      address: variables.address,
      notes: variables.notes,
      estimatedTime: variables.estimatedTime,
      
      // From service
      ...service,
      
      // From settings
      ...settings,
      
      // Computed values
      formattedPrice: variables.totalPrice ? `$${variables.totalPrice.toFixed(2)}` : '',
      agentName: settings.agentNames[0] || 'Assistant',
    };
  }
}