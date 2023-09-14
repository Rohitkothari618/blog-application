import { protectedProcedure, publicProcedure, router } from "../trpc";
import slugify from "slugify";
import { TRPCError } from "@trpc/server";
import { tagCreateSchema } from "../../../components/TagForm";
import { z } from "zod";

export const tagRouter = router({
  createTag: protectedProcedure
    .input(tagCreateSchema)
    .mutation(async ({ ctx: { prisma }, input }) => {
      const tag = await prisma.tag.findUnique({
        where: {
          name: input.name,
        },
      });
      if (tag) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Tag already exists",
        });
      }
      await prisma.tag.create({
        data: {
          ...input,
          slug: slugify(input.name),
        },
      });
    }),

  getTags: protectedProcedure.query(async ({ ctx: { prisma } }) => {
    return await prisma.tag.findMany();
  }),

  getPostWithSameTags: publicProcedure
    .input(
      z.object({
        tagname: z.string(),
      })
    )
    .query(async ({ ctx: { prisma, session }, input: { tagname } }) => {
      // Console.log("Something")
      const allTagPost = await prisma.tag.findUnique({
        where: {
          slug: tagname,
        },
        select: {
          posts: {
            select: {
              id: true,
              slug: true,
              title: true,
              description: true,
              createdAt: true,
              featuredImage: true,

              author: {
                select: {
                  name: true,
                  image: true,
                  username: true,
                },
              },
              bookmarks: session?.user?.id
                ? {
                    where: {
                      userId: session?.user?.id,
                    },
                  }
                : false,

              tags: {
                select: {
                  name: true,
                  id: true,
                  slug: true,
                },
              },
            },
          },
        },
      });
      return allTagPost;
    }),
});
