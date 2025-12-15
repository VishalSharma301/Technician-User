import { useState, useRef } from "react";

export function useChatGPTTyping() {
  const [isTypingIndicator, setIsTypingIndicator] = useState(false);
  const typingTimeouts = useRef<number[]>([]);

  const clearAllTimers = () => {
    typingTimeouts.current.forEach((id) => clearTimeout(id));
    typingTimeouts.current = [];
  };

  // ---------------------------------------
  // HUMAN-LIKE TYPING SPEED
  // ---------------------------------------
  const getTypingDelay = (char: string) => {
    if (/[.!?]/.test(char)) return 350 * Math.random() * 0;
    if (/[,:;]/.test(char)) return 180 * Math.random() * 0;
    if (char === " ") return 40 * Math.random() * 0;
    if (/[A-Z]/.test(char)) return 70 * Math.random() * 0;
    return 30 * Math.random() * 0;
  };
  // const getTypingDelay = (char: string) => {
  //   if (/[.!?]/.test(char)) return 350 + Math.random() * 100;
  //   if (/[,:;]/.test(char)) return 180 + Math.random() * 80;
  //   if (char === " ") return 40 + Math.random() * 60;
  //   if (/[A-Z]/.test(char)) return 70 + Math.random() * 20;
  //   return 30 + Math.random() * 10;
  // };

  // ---------------------------------------
  // SHOW DOT TYPING INDICATOR FIRST
  // ---------------------------------------
  const showTypingIndicator = (pushDotMessage : ()=>void) => {
    setIsTypingIndicator(true);
    return pushDotMessage();
  };

  // ---------------------------------------
  // TYPE THE TEXT NATURALLY
  // ---------------------------------------
  const typeText = (fullText: string, updateMessage : (text : string)=>void, onFinish : ()=>void) => {
    clearAllTimers();

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
      const timeoutId : any = setTimeout(typeNextChar, delay);
      typingTimeouts.current.push(timeoutId);
    };

    typeNextChar();
  };

  return {
    isTypingIndicator,
    showTypingIndicator,
    typeText,
  };
}
