import { useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
import { TailSpin } from "react-loader-spinner";
import useScrollLastMessage from "~/hooks/useScrollLastMessage";
import { api } from "~/utils/api";
import Input from "./Input";
import Message from "./Message";

function Chat() {
  const messages = api.msg.list.useInfiniteQuery(
    {
      limit: 20,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      select: (data) => ({
        pages: [...data.pages].reverse(),
        pageParams: [...data.pageParams].reverse(),
      }),
    }
  );
  const last = useRef<HTMLSpanElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  useScrollLastMessage({
    isRefetching: messages.isFetching,
    isSuccess: messages.isSuccess,
    chatRef,
    last,
  });

  useEffect(() => {
    const onScroll = () => {
      if (chatRef.current && messages.isSuccess) {
        if (chatRef.current.scrollTop === 0) {
          void messages.fetchNextPage();
        }
      }
    };
    const chat = chatRef.current;
    chat?.addEventListener("scroll", onScroll);
    return () => {
      chat?.removeEventListener("scroll", onScroll);
    };
  }, [messages]);

  return (
    <section className="mx-auto grid h-full w-full grid-rows-[auto_1fr]  items-center gap-4 rounded-t-xl  bg-white/50 p-4 shadow-xl   md:rounded-xl">
      {/* Messages */}
      <div
        ref={chatRef}
        className="scrollbar-thumb-rounded-full scrollbar-track-rounded-full flex 
        max-h-[80vh]
        min-h-[30vh] w-full flex-col gap-2 overflow-y-scroll 
        scroll-smooth p-4  scrollbar-thin scrollbar-track-transparent scrollbar-thumb-transparent md:scrollbar-track-purple-600
        md:scrollbar-thumb-purple-400
        xl:max-h-[50vh]
        "
      >
        {messages.isFetchingNextPage && (
          <TailSpin
            height="50"
            width="50"
            color="#9333ea"
            ariaLabel="tail-spin-loading"
            radius="1"
            wrapperStyle={{}}
            wrapperClass="mx-auto"
            visible={true}
          />
        )}
        {messages.isSuccess &&
          messages.data.pages.map((page) =>
            page.messages.map((message) => (
              <Message
                key={message.messageId}
                messageId={message.messageId}
                content={message.content}
                createdAt={message.createdAt}
                imageURL={message.image ?? undefined}
              />
            ))
          )}
        {messages.isError && (
          <div className="text-red-500">Error loading messages</div>
        )}
        <span className="invisible block" ref={last}>
          last
        </span>
      </div>
      {messages.isLoading && (
        <TailSpin
          height="50"
          width="50"
          color="#9333ea"
          ariaLabel="tail-spin-loading"
          radius="1"
          wrapperStyle={{}}
          wrapperClass="mx-auto"
          visible={true}
        />
      )}

      <Input />
      <Toaster position="top-center" reverseOrder={false} />
    </section>
  );
}

export default Chat;
