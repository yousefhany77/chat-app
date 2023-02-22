import { useEffect } from "react";

function useScrollLastMessage({
  chatRef,
  isSuccess,
  isRefetching,
  last,
}: {
  chatRef: React.RefObject<HTMLDivElement>;
  last:React.RefObject<HTMLSpanElement>;
  isSuccess: boolean;
  isRefetching: boolean;
}) {
  useEffect(() => {
    // scroll to bottom on first load
    if (chatRef.current && isSuccess && last.current) {
      // chatRef.current.scrollTop = chatRef.current.scrollHeight;
      last.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatRef, isSuccess, last]);
  useEffect(() => {
    // scroll to bottom on new message when not scrolled up fetching older messages
    if (
      chatRef.current &&
      chatRef.current.scrollTop !== 0 &&
      Math.floor(chatRef.current.scrollTop) <=
        chatRef.current.scrollHeight - chatRef.current.clientHeight
    ) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatRef, isRefetching]);
}

export default useScrollLastMessage;
