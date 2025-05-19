import { useState } from 'react';
import { toast } from 'sonner';

export function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = async (text: string, message: string = 'متن کپی شد') => {
    if (!navigator.clipboard) {
      toast.error('دسترسی به کلیپ‌بورد امکان‌پذیر نیست');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      toast.success(message, {
        duration: 2000,
        position: 'bottom-center',
      });
      return true;
    } catch (error) {
      console.error('خطا در کپی کردن متن:', error);
      toast.error('خطا در کپی کردن متن');
      return false;
    }
  };

  return { copiedText, copyToClipboard };
}
