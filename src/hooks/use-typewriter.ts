import { useEffect, useState } from "react";

export function useTypewriter(text: string, speed = 30, loopDelay = 5000) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let index = 0;
    let typingInterval: any;
    let resetTimeout: any;

    function startTyping() {
      typingInterval = setInterval(() => {
        setDisplayed(text.slice(0, index + 1));
        index++;

        if (index >= text.length) {
          clearInterval(typingInterval);

          resetTimeout = setTimeout(() => {
            index = 0;
            setDisplayed("");
            startTyping();
          }, loopDelay);
        }
      }, speed);
    }

    startTyping();

    return () => {
      clearInterval(typingInterval);
      clearTimeout(resetTimeout);
    };
  }, [text, speed, loopDelay]);

  return displayed;
}