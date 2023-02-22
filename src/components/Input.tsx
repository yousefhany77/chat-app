import Image from "next/image";
import React, { useEffect } from "react";
import { toast } from "react-hot-toast";
import sendIcon from "~/../public/sendIcon.png";
import useSendMessage from "~/hooks/useSendMessage";

import { type RouterOutputs } from "~/utils/api";
export type Msg = RouterOutputs["msg"]["list"]["messages"][0];

export type page = {
  messages: Msg[];
  nextCursor: string | null;
};
export type InfiniteQueryMsgs = {
  pages: page[];
  pageParams: string[];
};
const imageExtensions = ["jpg", "jpeg", "png", "gif"];
function Input() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [fileInput, setFileInput] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { sendMsg } = useSendMessage();

  async function sendFile(url: string) {
    if (!fileInput) return;

    if (fileInput.size > 3000000) {
      toast.error("Image size should be less than 3MB");
      setFileInput(null);
      setPreview(null);
      return;
    }
    await fetch(url, {
      method: "PUT",
      body: fileInput,
    });
    setFileInput(null);
  }

  async function SEND() {
    const messageContent = inputRef.current?.value;
    setPreview(null);
    try {
      if (fileInput) {
        setIsUploading(true);
        // send message with file
        const { preSignedUrl } = await sendMsg({
          content: messageContent || "",
          hasImage: true,
          imgType: fileInput.type,
        });
        preSignedUrl && (await sendFile(preSignedUrl));
      }
      // send message without file
      else {
        messageContent &&
          void sendMsg({
            content: messageContent,
          });
      }
    } catch (error) {
      console.log(error);
    } finally {
      inputRef.current?.value && (inputRef.current.value = "");
      setIsUploading(false);
    }
  }
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  return (
    <section className="relative flex h-full w-full flex-col items-center justify-center gap-3">
      {preview && (
        <Image
          width={200}
          height={200}
          alt="preview image"
          className="absolute bottom-16 left-1/2 object-contain  max-h-[50vh] w-fit max-w-md -translate-x-1/2 self-start  rounded-2xl bg-white/50  shadow-2xl"
          src={URL.createObjectURL(preview)}
        />
      )}
      <div className="relative flex w-full items-center gap-3">
        <input
          type="text"
          placeholder="Type a message..."
          ref={inputRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (e.currentTarget.value.trim() === "" && !fileInput) return;

              void SEND();

              e.currentTarget.value = "";
            }
          }}
          className="h-12   flex-1 rounded-2xl bg-white/60 p-3 px-6 placeholder-gray-400 shadow-lg"
        />
        <input
          type="file"
          accept={imageExtensions.map((ext) => `image/${ext}`).join(",")}
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            if (file) {
              if (file.size > 3000000) {
                toast.error("Image size should be less than 3MB");
                setFileInput(null);
                e.currentTarget.files = null;
                setPreview(null);
              } else {
                setFileInput(file);
                setPreview(file);
              }
            }
          }}
          ref={fileInputRef}
          className="hidden"
        />

        <button
          className={`h-12 w-12 rounded-full ${
            fileInput ? "bg-slate-800" : "bg-white/60"
          } p-1 transition-colors ease-in-out hover:shadow-lg`}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          🖼️
        </button>
        <button
          className=" flex  h-12 w-12 items-center justify-center rounded-full bg-white/60 p-1 hover:shadow-lg"
          onClick={() => {
            void SEND();
          }}
        >
          <Image
            alt="send icon"
            src={sendIcon}
            quality={100}
            width={25}
            className={"object-contain  "}
          />
        </button>
      </div>
    </section>
  );
}

export default Input;
