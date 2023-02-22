import Image from "next/image";
import { useState } from "react";
import { ProgressBar } from "react-loader-spinner";
import TimeAgo from "timeago-react";
import useDeleteMessage from "~/hooks/useDeleteMessage";
interface IMessage {
  content: string;
  createdAt: Date;
  messageId: string;
  imageURL?: string;
}

function Message({ content, createdAt, imageURL, messageId }: IMessage) {
  const { deleteMessage } = useDeleteMessage({ messageId });
  // some weird bug with S3 bucket for first GET request it's returning 403 and then 200
  const [imageError, setImageError] = useState(false);
  return (
    <div className="group relative w-fit space-y-1 rounded-md  bg-white/30 p-3 font-medium text-white shadow hover:bg-red-200/30 lg:text-lg">
      <button
        className="absolute right-0 top-0 z-50 hidden
       rounded-full p-1 text-xl
      font-bold
      text-white transition duration-300 
      ease-in-out focus:outline-none focus:ring-2
      focus:ring-red-600 
      focus:ring-opacity-50
      group-hover:block
      "
        onClick={() => {
          void deleteMessage(messageId);
        }}
      >
        ❌
      </button>
      <p>{content}</p>
      {imageURL && (
        <div className="relative min-w-[200px]">
          <ProgressBar
            visible={imageError}
            height="80"
            width="80"
            ariaLabel="progress-bar-loading"
            wrapperStyle={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
            wrapperClass="progress-bar-wrapper"
            borderColor="#F4442E"
            barColor="#51E5FF"
          />
          <Image
            alt="chatImage"
            src={imageURL}
            placeholder="blur"
            blurDataURL={imageURL}
            className=" w-full w-fit  rounded-md object-contain "
            width={200}
            height={200}
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/200";
              setImageError(true);
            }}
            onLoadingComplete={() => {
              setImageError(false);
            }}
          />
        </div>
      )}

      <TimeAgo
        datetime={createdAt}
        className=" block text-sm font-normal text-gray-500 "
      />
    </div>
  );
}

export default Message;
