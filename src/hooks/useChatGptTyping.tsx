import { useState, useRef } from "react";

export function useChatGPTTyping(disableTyping: boolean = false) {
  const [isTypingIndicator, setIsTypingIndicator] = useState(false);
  const typingTimeouts = useRef<number[]>([]);

  /* ---------------------------------------
     CLEAR ALL TIMERS
  --------------------------------------- */
  const clearAllTimers = () => {
    typingTimeouts.current.forEach((id) => clearTimeout(id));
    typingTimeouts.current = [];
  };

  /* ---------------------------------------
     HUMAN-LIKE TYPING SPEED
     (Used only when typing is enabled)
  --------------------------------------- */
  const getTypingDelay = (char: string) => {
    if (/[.!?]/.test(char)) return 350 + Math.random() * 50;
    if (/[,:;]/.test(char)) return 180 + Math.random() * 40;
    if (char === " ") return 40 + Math.random() * 30;
    if (/[A-Z]/.test(char)) return 70 + Math.random() * 10;
    return 30 + Math.random() * 5;
  };

  /* ---------------------------------------
     SHOW TYPING DOTS
  --------------------------------------- */
  const showTypingIndicator = (pushDotMessage: () => void) => {
    if (disableTyping) return; // ⛔ skip dots completely

    setIsTypingIndicator(true);
    pushDotMessage();
  };

  /* ---------------------------------------
     TYPE TEXT (OR INSTANT MODE)
  --------------------------------------- */
  const typeText = (
    fullText: string,
    updateMessage: (text: string) => void,
    onFinish: () => void
  ) => {
    clearAllTimers();

    // 🚀 INSTANT MODE (typing disabled)
    if (disableTyping) {
      updateMessage(fullText);
      setIsTypingIndicator(false);
      onFinish && onFinish();
      return;
    }

    let index = 0;

    const typeNextChar = () => {
      if (index >= fullText.length) {
        setIsTypingIndicator(false);
        onFinish && onFinish();
        return;
      }

      updateMessage(fullText.slice(0, index + 1));
      index++;

      const delay = getTypingDelay(fullText[index - 1]);
      const timeoutId: any = setTimeout(typeNextChar, delay);
      typingTimeouts.current.push(timeoutId);
    };

    typeNextChar();
  };

  return {
    isTypingIndicator,
    showTypingIndicator,
    typeText,
    clearAllTimers, // optional but useful
  };
}
