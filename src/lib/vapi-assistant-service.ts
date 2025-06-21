/**
 * Vapi Assistant Management Service
 * Handles creation and management of Vapi assistants with enhanced analysis capabilities
 */

import { createInterviewAssistantConfig } from './vapi-assistant-config';

interface CreateAssistantParams {
  candidateName: string;
  position: string;
  templateQuestions?: string[];
  companyName?: string;
  interviewType?: 'technical' | 'behavioral' | 'cultural' | 'general' | 'leadership' | 'sales';
}

interface VapiAssistantResponse {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export class VapiAssistantService {
  private static readonly VAPI_API_BASE = 'https://api.vapi.ai';
  private static readonly VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY;

  /**
   * Create a new Vapi assistant with enhanced analysis configuration
   */
  static async createInterviewAssistant(params: CreateAssistantParams): Promise<VapiAssistantResponse> {
    const config = createInterviewAssistantConfig(
      params.candidateName,
      params.position,
      params.templateQuestions || []
    );

    // Add company-specific customizations
    if (params.companyName) {
      config.name = `${params.companyName} - Interview Assistant for ${params.candidateName}`;
      
      // Update system message to include company context
      if (config.model && 'messages' in config.model && config.model.messages) {
        const systemMessage = config.model.messages[0];
        if (systemMessage && systemMessage.role === 'system') {
          systemMessage.content = `${systemMessage.content}\n\n**Company Context:**\nYou are interviewing for ${params.companyName}. Tailor your questions and evaluation to assess fit with our company culture and values.`;
        }
      }
    }

    // Customize based on interview type
    if (params.interviewType) {
      config.name += ` (${params.interviewType.charAt(0).toUpperCase() + params.interviewType.slice(1)})`;
    }

    try {
      const response = await fetch(`${this.VAPI_API_BASE}/assistant`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to create assistant: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
      }

      const assistant = await response.json();
      return assistant;
    } catch (error) {
      console.error('Error creating Vapi assistant:', error);
      throw error;
    }
  }

  /**
   * List all assistants
   */
  static async listAssistants(): Promise<VapiAssistantResponse[]> {
    try {
      const response = await fetch(`${this.VAPI_API_BASE}/assistant`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.VAPI_API_KEY}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to list assistants: ${response.status} ${response.statusText}`);
      }

      const assistants = await response.json();
      return assistants;
    } catch (error) {
      console.error('Error listing Vapi assistants:', error);
      throw error;
    }
  }

  /**
   * Delete an assistant
   */
  static async deleteAssistant(assistantId: string): Promise<void> {
    try {
      const response = await fetch(`${this.VAPI_API_BASE}/assistant/${assistantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.VAPI_API_KEY}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete assistant: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting Vapi assistant:', error);
      throw error;
    }
  }

  /**
   * Update an existing assistant
   */
  static async updateAssistant(assistantId: string, updates: Partial<CreateAssistantParams>): Promise<VapiAssistantResponse> {
    try {
      // First get the current assistant config
      const response = await fetch(`${this.VAPI_API_BASE}/assistant/${assistantId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.VAPI_API_KEY}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get assistant: ${response.status} ${response.statusText}`);
      }

      const currentAssistant = await response.json();

      // Merge updates with current config
      const updatedConfig = {
        ...currentAssistant,
        ...updates
      };

      // Update the assistant
      const updateResponse = await fetch(`${this.VAPI_API_BASE}/assistant/${assistantId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedConfig)
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to update assistant: ${updateResponse.status} ${updateResponse.statusText}`);
      }

      const updatedAssistant = await updateResponse.json();
      return updatedAssistant;
    } catch (error) {
      console.error('Error updating Vapi assistant:', error);
      throw error;
    }
  }

  /**
   * Get assistant by ID
   */
  static async getAssistant(assistantId: string): Promise<VapiAssistantResponse> {
    try {
      const response = await fetch(`${this.VAPI_API_BASE}/assistant/${assistantId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.VAPI_API_KEY}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get assistant: ${response.status} ${response.statusText}`);
      }

      const assistant = await response.json();
      return assistant;
    } catch (error) {
      console.error('Error getting Vapi assistant:', error);
      throw error;
    }
  }

  /**
   * Create a specialized assistant for specific interview types
   */
  static async createSpecializedAssistant(
    type: 'technical' | 'behavioral' | 'leadership' | 'sales',
    params: CreateAssistantParams
  ): Promise<VapiAssistantResponse> {
    const specializedConfig = { ...params, interviewType: type };

    // Add type-specific configurations
    switch (type) {
      case 'technical':
        specializedConfig.templateQuestions = [
          "Walk me through your technical background and expertise.",
          "Describe the most challenging technical problem you've solved recently.",
          "How do you approach debugging complex issues?",
          "Tell me about a time you had to learn a new technology quickly.",
          "How do you ensure code quality and maintainability?",
          "Describe your experience with system design and architecture.",
          "What testing strategies do you use in your development process?"
        ];
        break;

      case 'behavioral':
        specializedConfig.templateQuestions = [
          "Tell me about a time you faced a significant challenge at work.",
          "Describe a situation where you had to work with a difficult team member.",
          "Give me an example of when you had to meet a tight deadline.",
          "Tell me about a project you're particularly proud of and why.",
          "Describe a time when you made a mistake. How did you handle it?",
          "Tell me about a time you had to adapt to significant changes.",
          "Give me an example of when you went above and beyond expectations."
        ];
        break;

      case 'leadership':
        specializedConfig.templateQuestions = [
          "Describe your leadership style and approach.",
          "Tell me about a time you had to make a difficult decision with limited information.",
          "How do you handle conflicts within your team?",
          "Give me an example of how you've mentored or developed team members.",
          "Describe a time when you had to lead through a challenging situation.",
          "How do you motivate and inspire your team?",
          "Tell me about a time you had to influence stakeholders without authority."
        ];
        break;

      case 'sales':
        specializedConfig.templateQuestions = [
          "Tell me about your sales experience and approach.",
          "Describe your most successful sales achievement.",
          "How do you handle objections and rejections?",
          "Walk me through your typical sales process.",
          "Tell me about a time you turned around a difficult client relationship.",
          "How do you stay motivated during slow periods?",
          "Describe your approach to building long-term client relationships."
        ];
        break;
    }

    return this.createInterviewAssistant(specializedConfig);
  }
}

export default VapiAssistantService;
