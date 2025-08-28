import { decrypt } from './crypto';

interface VapiAssistant {
  id: string;
  name: string;
  model: {
    provider: string;
    model: string;
  };
}

interface VapiTestResponse {
  success: boolean;
  message: string;
  assistants?: VapiAssistant[];
}

/**
 * Tests the Vapi API connection by listing assistants
 */
export async function testVapiConnection(encryptedApiKey: string): Promise<VapiTestResponse> {
  try {
    // Decrypt the API key
    const apiKey = decrypt(encryptedApiKey);
    
    if (!apiKey) {
      return {
        success: false,
        message: 'Invalid or missing API key'
      };
    }

    // Make a test call to Vapi API
    const response = await fetch('https://api.vapi.ai/assistant', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `Vapi API error: ${response.status} - ${errorText}`
      };
    }

    const assistants: VapiAssistant[] = await response.json();
    
    return {
      success: true,
      message: `Connection successful! Found ${assistants.length} assistant(s).`,
      assistants
    };
  } catch (error) {
    console.error('Vapi connection test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Gets available voice providers and voices from Vapi
 */
export async function getVapiVoices(encryptedApiKey: string) {
  try {
    const apiKey = decrypt(encryptedApiKey);
    
    if (!apiKey) {
      throw new Error('Invalid API key');
    }

    const response = await fetch('https://api.vapi.ai/voice', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get Vapi voices:', error);
    throw error;
  }
}
