import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "react-hot-toast";
import { type InfiniteQueryMsgs, type Msg } from "~/components/Input";
import { api } from "~/utils/api";
const key = [
  ["msg", "list"],
  {
    input: {
      limit: 20,
    },
    type: "infinite",
  },
];

function useSendMessage() {
  const queryClient = useQueryClient();

  const msg = api.msg.add.useMutation({
    onMutate: async (newMsg) => {
      await queryClient.cancelQueries(key);
      const previousMsgs = queryClient.getQueryData<InfiniteQueryMsgs>(key);
      queryClient.setQueryData<InfiniteQueryMsgs>(key, (prev) => {
        const optimisticMsg: Msg = {
          messageId: crypto.randomUUID(),
          content: newMsg.content,
          createdAt: new Date(),
          updatedAt: new Date(),
          image: null,
        };
        if (!prev)
          return {
            pageParams: [],
            pages: [
              {
                messages: [optimisticMsg],
                nextCursor: "",
              },
            ],
          };
        const pageInView = prev.pages[0] ?? { messages: [], nextCursor: null };

        return {
          ...prev,
          pages: [
            {
              ...pageInView,
              messages: [optimisticMsg, ...pageInView.messages],
            },
            ...prev.pages.slice(1),
          ],
        };
      });
      return { previousMsgs };
    },
    onError: (err, newMsg, context) => {
      toast.error("Something went wrong");
      if (context) queryClient.setQueryData(key, context.previousMsgs);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(key);
    },
  });

  const sendMsg = React.useCallback(
    async ({
      content,
      hasImage,
      imgType,
    }: {
      content: string;
      hasImage?: boolean;
      imgType?: string;
    }) => {
      return await msg.mutateAsync({ content, hasImage, imgType });
    },
    [msg]
  );
  return {
    sendMsg,
  };
}

export default useSendMessage;
