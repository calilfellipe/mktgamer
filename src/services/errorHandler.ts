// Error handling service for better reliability
export class ErrorHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Tentativa ${attempt}/${maxRetries} falhou:`, error);
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError!;
  }
  
  static handleSupabaseError(error: any): string {
    if (error?.code === 'PGRST116') {
      return 'Dados não encontrados';
    }
    
    if (error?.code === '23505') {
      return 'Este item já existe';
    }
    
    if (error?.message?.includes('JWT')) {
      return 'Sessão expirada. Faça login novamente.';
    }
    
    if (error?.message?.includes('network')) {
      return 'Problema de conexão. Verifique sua internet.';
    }
    
    return error?.message || 'Erro desconhecido';
  }
  
  static logError(context: string, error: any) {
    console.error(`[${context}] Erro:`, {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      timestamp: new Date().toISOString()
    });
  }
}