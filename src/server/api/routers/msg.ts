import { randomUUID } from "crypto";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { S3 } from "aws-sdk";
import { getImageExtensions } from "~/utils/getImageExtensions";

const imageExtensions = getImageExtensions()
const s3 = new S3({
  accessKeyId: process.env.S3_BUCKET_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_BUCKET_ACCESS_KEY_SECRET,
  region: process.env.S3_BUCKET_REGION,
  signatureVersion: "v4",
});

export const msgRouter = createTRPCRouter({
  add: publicProcedure
    .input(
      z
        .object({
          content: z.string(),
          hasImage: z.boolean(),
          imgType: z
            .string()
            .regex(new RegExp(`^image\\/(${imageExtensions.join("|")})$`), {
              message: `Only images with extensions ${imageExtensions.join(
                ", "
              )} are allowed`,
            }),
        })
        .partial({
          hasImage: true,
          imgType: true,
        })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.hasImage && input.imgType) {
        const extension = input.imgType.split(
          "/"
        )[1] as (typeof imageExtensions)[number];
        const params = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `${randomUUID()}.${extension}`,
          Expires: 60,
          ContentType: input.imgType,
        };
        const url = await s3.getSignedUrlPromise("putObject", params);
        await ctx.prisma.messages.create({
          data: {
            content: input.content,
            image: url.split("?")[0],
          },
        });
        return {
          preSignedUrl: url,
        };
      }
      await ctx.prisma.messages.create({
        data: {
          content: input.content,
        },
      });
      return {
        preSignedUrl: null,
      };
    }),

  delete: publicProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const message = await ctx.prisma.messages.delete({
      where: {
        messageId: input,
      },
    });
    const imageKey = message.image?.split("/").pop();
    imageKey &&
      s3.deleteObject(
        {
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: imageKey,
        },
        (err, data) => {
          if (err) {
            console.log(err);
          } else {
            console.log(imageKey);
            console.log("Deleted image from S3");
          }
        }
      );
  }),

  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(), // <-- "cursor" needs to exist, but can be any type
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const cursor = input.cursor;
      const messages = await ctx.prisma.messages.findMany({
        take: limit + 1,

        cursor: cursor
          ? {
              messageId: cursor,
            }
          : undefined,

        orderBy: {
          createdAt: "desc",
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.messageId;
      }

      return {
        messages: messages.reverse(),
        nextCursor,
      };
    }),
});
