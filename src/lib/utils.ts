import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Toast wrapper for server actions
export async function withToast<T>(
  promise: Promise<T>,
  options?: {
    loading?: string;
    success?: string | ((data: T) => string);
    error?: string | ((error: any) => string);
  }
): Promise<T> {
  const loadingToast = options?.loading ? toast.loading(options.loading) : null;
  
  try {
    const result = await promise;
    
    if (loadingToast) {
      toast.dismiss(loadingToast);
    }
    
    if (options?.success) {
      const message = typeof options.success === 'function' 
        ? options.success(result) 
        : options.success;
      toast.success(message);
    }
    
    return result;
  } catch (error) {
    if (loadingToast) {
      toast.dismiss(loadingToast);
    }
    
    const message = options?.error 
      ? (typeof options.error === 'function' 
          ? options.error(error) 
          : options.error)
      : 'An error occurred';
    
    toast.error(message);
    throw error;
  }
}