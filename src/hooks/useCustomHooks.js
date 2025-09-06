import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

// Rate limiting hook
export const useRateLimit = (limit = 10, windowMs = 60000) => {
  const [requests, setRequests] = useState([]);

  const isAllowed = useCallback(() => {
    const now = Date.now();
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= limit) {
      toast.error(`Rate limit exceeded. Please wait before making another request.`);
      return false;
    }
    
    setRequests([...recentRequests, now]);
    return true;
  }, [requests, limit, windowMs]);

  return { isAllowed };
};

// Input validation hook
export const useInputValidation = () => {
  const validatePrompt = useCallback((prompt) => {
    if (!prompt.trim()) {
      return { isValid: false, error: "Please describe your component first" };
    }
    
    if (prompt.length < 10) {
      return { isValid: false, error: "Please provide a more detailed description (at least 10 characters)" };
    }
    
    if (prompt.length > 1000) {
      return { isValid: false, error: "Description is too long (maximum 1000 characters)" };
    }
    
    // Basic sanitization - remove potentially harmful patterns
    const sanitized = prompt.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    return { isValid: true, sanitized };
  }, []);

  const validateApiKey = useCallback((apiKey) => {
    if (!apiKey || apiKey === 'your_actual_api_key_here' || apiKey.trim() === '') {
      return { isValid: false, error: "API key is missing or invalid. Please check your .env file." };
    }
    return { isValid: true };
  }, []);

  return { validatePrompt, validateApiKey };
};

// Debounce hook
export const useDebounce = (callback, delay) => {
  const [debounceTimer, setDebounceTimer] = useState(null);

  const debouncedCallback = useCallback((...args) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      callback(...args);
    }, delay);

    setDebounceTimer(timer);
  }, [callback, delay, debounceTimer]);

  return debouncedCallback;
};

// Code management hook
export const useCodeManager = () => {
  const copyCode = useCallback(async (code) => {
    if (!code.trim()) {
      toast.error("No code to copy");
      return false;
    }
    
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard");
      return true;
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error("Failed to copy");
      return false;
    }
  }, []);

  const downloadFile = useCallback((code, filename = "CodeCraft-Component.html") => {
    if (!code.trim()) {
      toast.error("No code to download");
      return false;
    }

    try {
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("File downloaded");
      return true;
    } catch (err) {
      console.error('Failed to download: ', err);
      toast.error("Failed to download");
      return false;
    }
  }, []);

  return { copyCode, downloadFile };
};
