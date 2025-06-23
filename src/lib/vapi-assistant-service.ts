/**
 * Vapi Assistant Management Service
 * Handles creation and management of Vapi assistants with enhanced analysis capabilities
 */

interface CreateAssistantParams {
  candidateName: string;
  position: string;
  templateQuestions?: string[];
  templateInstruction?: string;
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
  private static readonly REUSABLE_ASSISTANT_NAME = 'InterQ - Interview Assistant';

  /**
   * Create a new Vapi assistant with enhanced analysis configuration
   */
  static async createInterviewAssistant(params: CreateAssistantParams): Promise<VapiAssistantResponse> {
    console.log('🔧 VapiAssistantService.createInterviewAssistant called with:', JSON.stringify(params, null, 2))
    console.log('🔑 VAPI_API_KEY exists:', !!this.VAPI_API_KEY)
    console.log('🔑 VAPI_API_KEY length:', this.VAPI_API_KEY?.length || 0)
    
    if (!this.VAPI_API_KEY) {
      throw new Error('VAPI_PRIVATE_KEY environment variable is not set')
    }      // Create a clean, valid Vapi assistant configuration
    const questionsList = (params.templateQuestions && params.templateQuestions.length > 0) 
      ? params.templateQuestions.join('\n- ') 
      : 'Ask relevant questions for the position';

    console.log('🎯 Template questions received in service:', params.templateQuestions);
    console.log('🎯 Formatted questions list:', questionsList);

    // Create a shorter name that fits Vapi's 40 character limit
    let assistantName = `Interview - ${params.candidateName}`;
    if (assistantName.length > 40) {
      assistantName = `Interview - ${params.candidateName.split(' ')[0]}`;
    }
    if (assistantName.length > 40) {
      assistantName = 'Interview Assistant';
    }    const systemMessage = `You are an expert AI interviewer conducting a professional job interview for the position: ${params.position}.

**Your Role:**
- Conduct a structured yet conversational interview
- Ask insightful follow-up questions
- Maintain a professional but friendly tone
- Keep the candidate engaged and comfortable
- Gather comprehensive information about their qualifications
- ALWAYS start speaking immediately when the call begins

**Interview Structure:**
1. Start with a warm welcome and brief position overview
2. Ask about their background and experience
3. Cover key competency areas for the role
4. Include behavioral and situational questions
5. Allow time for candidate questions
6. Close professionally with next steps

**SPECIFIC QUESTIONS TO ASK (Ask these questions in order):**
- ${questionsList}

${params.templateInstruction ? `**SPECIAL INSTRUCTIONS:**
${params.templateInstruction}

` : ''}**Additional Guidelines:**
- Listen actively and ask relevant follow-ups
- Keep responses concise but thorough
- Maintain professional interview pace
- Be encouraging and supportive
- Take detailed notes mentally for analysis
- Adapt questions based on candidate responses
- Speak clearly and at a measured pace

**Important:** This interview will be analyzed for:
- Communication effectiveness
- Technical competency
- Cultural fit
- Professional experience
- Overall candidate suitability

Begin with a professional greeting and position introduction.`;

    const config = {
      name: assistantName,
      transcriber: {
        provider: "deepgram" as const,
        model: "nova-2" as const,
        language: "en-US" as const
      },
      voice: {
        provider: "11labs" as const,
        voiceId: "pNInz6obpgDQGcFmaJgB",
        stability: 0.6,
        similarityBoost: 0.9,
        style: 0.2,
        useSpeakerBoost: true
      },
      model: {
        provider: "openai" as const,
        model: "gpt-4" as const,
        temperature: 0.1,        messages: [{
          role: "system" as const,
          content: systemMessage
        }]
      },
      recordingEnabled: true,
      endCallMessage: "Thank you for your time today. We'll be in touch with next steps soon. Have a great day!",
      maxDurationSeconds: 3600,
      backgroundDenoisingEnabled: true,      responseDelaySeconds: 0.4,
      firstMessage: "Hello! I'm your AI interviewer today. I'm excited to learn more about your background and experience for this position. Let's begin - could you please introduce yourself and tell me what interests you most about this role?"
    };

    console.log('🎯 Generated assistant config:', JSON.stringify(config, null, 2))

    // Add company-specific customizations
    if (params.companyName) {
      const systemMessage = config.model.messages[0];
      systemMessage.content = `${systemMessage.content}\n\n**Company Context:**\nYou are interviewing for ${params.companyName}. Tailor your questions and evaluation to assess fit with our company culture and values.`;
    }

    console.log('🚀 Sending request to Vapi API...')
    console.log('🔗 URL:', `${this.VAPI_API_BASE}/assistant`)
    
    try {
      const response = await fetch(`${this.VAPI_API_BASE}/assistant`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });

      console.log('📡 Vapi API response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Vapi API error response:', errorText)
        
        let errorData = {}
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          errorData = { message: errorText }
        }
        
        throw new Error(`Failed to create assistant: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
      }

      const assistant = await response.json();
      console.log('✅ Assistant created successfully:', JSON.stringify(assistant, null, 2))
      return assistant;
    } catch (error) {
      console.error('❌ Error in Vapi API call:', error);
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

  /**
   * Find or create a single reusable assistant for all interviews
   */
  static async findOrCreateReusableAssistant(): Promise<VapiAssistantResponse> {
    console.log('🔍 Looking for existing reusable assistant...');
    
    try {
      // First, try to find an existing reusable assistant
      const assistants = await this.listAssistants();
      const existingAssistant = assistants.find(
        assistant => assistant.name === this.REUSABLE_ASSISTANT_NAME
      );

      if (existingAssistant) {
        console.log('✅ Found existing reusable assistant:', existingAssistant.id);
        return existingAssistant;
      }

      // If no reusable assistant exists, create one
      console.log('🆕 Creating new reusable assistant...');
      return await this.createReusableAssistant();
      
    } catch (error) {
      console.error('❌ Error finding/creating reusable assistant:', error);
      throw error;
    }
  }

  /**
   * Create a single reusable assistant with generic configuration
   */
  private static async createReusableAssistant(): Promise<VapiAssistantResponse> {
    const defaultParams: CreateAssistantParams = {
      candidateName: 'Default',
      position: 'Generic Position',
      templateQuestions: [],
      templateInstruction: '',
      companyName: '',
      interviewType: 'general'
    };

    return this.createInterviewAssistant(defaultParams);
  }
}

export default VapiAssistantService;
