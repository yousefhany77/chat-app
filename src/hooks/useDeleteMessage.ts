import { api } from "~/utils/api";
import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { type InfiniteQueryMsgs } from "~/components/Input";
import { toast } from "react-hot-toast";
const key = [
  ["msg", "list"],
  {
    input: {
      limit: 20,
    },
    type: "infinite",
  },
];
function useDeleteMessage({ messageId }: { messageId: string }) {
  const queryClient = useQueryClient();

  const deleteMsgMutation = api.msg.delete.useMutation({
    onMutate: async () => {
      await queryClient.cancelQueries(key);
      const previousMsgs = queryClient.getQueryData<InfiniteQueryMsgs>(key);
      queryClient.setQueryData<InfiniteQueryMsgs>(key, (prev) => {
        const old = prev ?? {
          pageParams: [],
          pages: [
            {
              messages: [],
              nextCursor: null,
            },
          ],
        };
        return {
          ...old,
          pages: old.pages.map((page) => {
            return {
              ...page,
              messages: page.messages.filter(
                (msg) => msg.messageId !== messageId
              ),
            };
          }),
        };
      });
      return { previousMsgs };
    },
    onError: (err, newMsg, context) => {
      queryClient.setQueryData(key, context?.previousMsgs);
      toast.error("Error deleting message");
    },
    onSuccess: () => {
      toast.success("Message deleted 🗑️");
    },
    onSettled: () => {
      void queryClient.invalidateQueries(key);
    },
  });

  const deleteMessage = React.useCallback(
    async (messageId: string) => {
      await deleteMsgMutation.mutateAsync(messageId);
      
    },
    [deleteMsgMutation]
  );
  return {deleteMessage, isDeleting: deleteMsgMutation.isLoading};
  
}

export default useDeleteMessage;
