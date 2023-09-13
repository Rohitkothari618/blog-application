import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import isDataURI from "validator/lib/isDataURI";
import { createClient } from "@supabase/supabase-js";
import { env } from "../../../env/server.mjs";

import { TRPCError } from "@trpc/server";
import { decode } from "base64-arraybuffer";

const supabase = createClient(env.SUPABASE_PUBLIC_URL, env.SUPABASE_PUBLIC_KEY);

export const userRouter = router({
  uploadAvatar: protectedProcedure
    .input(
      z.object({
        imageAsDataURI: z
          .string()
          .refine(
            (val) => isDataURI(val),
            "image should be in data uri format"
          ),
        mimetype: z.string(),
        username: z.string(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      // `image` here is a base64 encoded data URI, it is NOT a base64 string, so we need to extract
      // the real base64 string from it.
      // Check the syntax here: https://en.wikipedia.org/wiki/Data_URI_scheme#Syntax
      const imageBase64Str = input.imageAsDataURI.replace(/^.+,/, "");

      const { data, error } = await supabase.storage
        .from("publicavatar")
        .upload(`avatars/${input.username}.png`, decode(imageBase64Str), {
          contentType: "image/png",
          upsert: true,
        });
      console.log(data, error);
      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "UPLOAD FAILED TO SUPABASE",
        });
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from("publicavatar").getPublicUrl(data?.path);
      console.log(publicUrl);

      await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          image: publicUrl,
        },
      });
    }),

  getCurrentUser: protectedProcedure.query(
    async ({ ctx: { session, prisma } }) => {
      return await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          email: true,
          username: true,
          image: true,
          id: true,
          name: true,
        },
      });
    }
  ),
  getUserProfile: publicProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .query(async ({ ctx: { prisma, session }, input: { username } }) => {
      return await prisma.user.findUnique({
        where: {
          username,
        },
        select: {
          name: true,
          username: true,
          id: true,
          image: true,
          _count: {
            select: {
              posts: true,
              followedBy: true,
              followings: true,
            },
          },
          followedBy: session?.user?.id
            ? {
                where: {
                  id: session.user.id,
                },
              }
            : false,
        },
      });
    }),
  getUserReadingList: protectedProcedure.query(
    async ({ ctx: { prisma, session } }) => {
      const userReadingList = await prisma.bookmark.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 4,
        include: {
          post: {
            select: {
              featuredImage: true,
              title: true,
              description: true,
              slug: true,
              author: {
                select: {
                  image: true,
                  name: true,
                },
              },
              createdAt: true,
            },
          },
        },
      });

      return userReadingList;
    }
  ),
  getUserPosts: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx: { prisma, session }, input: { username } }) => {
      return await prisma.user.findUnique({
        where: {
          username,
        },
        select: {
          posts: {
            select: {
              id: true,
              slug: true,
              title: true,
              description: true,
              createdAt: true,

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
    }),

  getSuggeestions: protectedProcedure.query(
    async ({ ctx: { prisma, session } }) => {
      // We need an array of users,those users should liked or bookmarked the same posts,that the current user did
      // Get Likes and bookmarks from current user ->extract tags->Find perople who liked or bookmarked those posts which are having extracted tags
      const tagsQuery = {
        where: {
          userId: session.user.id,
        },
        select: {
          post: {
            select: {
              tags: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        take: 10,
      };
      const likePostTags = await prisma.like.findMany(tagsQuery);
      const bookmarkedPostTags = await prisma.bookmark.findMany(tagsQuery);

      const interstedTags: string[] = [];

      likePostTags.forEach((like) => {
        interstedTags.push(...like.post.tags.map((tag) => tag.name));
      });
      bookmarkedPostTags.forEach((bookmark) => {
        interstedTags.push(...bookmark.post.tags.map((tag) => tag.name));
      });

      const suggestions = await prisma.user.findMany({
        where: {
          OR: [
            {
              likes: {
                some: {
                  post: {
                    tags: {
                      some: {
                        name: {
                          in: interstedTags,
                        },
                      },
                    },
                  },
                },
              },
            },
            {
              bookmarks: {
                some: {
                  post: {
                    tags: {
                      some: {
                        name: {
                          in: interstedTags,
                        },
                      },
                    },
                  },
                },
              },
            },
          ],
          NOT: {
            id: session.user.id,
          },
        },
        select: {
          name: true,
          image: true,
          username: true,
          id: true,
        },
        take: 4,
      });
      return suggestions;
    }
  ),

  followUser: protectedProcedure
    .input(
      z.object({
        followingUserId: z.string(),
      })
    )
    .mutation(
      async ({ ctx: { prisma, session }, input: { followingUserId } }) => {
        //
        if (followingUserId === session.user.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You can not follow your self ",
          });
        }
        await prisma.user.update({
          where: {
            id: session.user.id,
          },
          data: {
            followings: {
              connect: {
                id: followingUserId,
              },
            },
          },
        });
      }
    ),

  unfollowUser: protectedProcedure
    .input(
      z.object({
        followingUserId: z.string(),
      })
    )
    .mutation(
      async ({ ctx: { prisma, session }, input: { followingUserId } }) => {
        //
        await prisma.user.update({
          where: {
            id: session.user.id,
          },
          data: {
            followings: {
              disconnect: {
                id: followingUserId,
              },
            },
          },
        });
      }
    ),

  getAllFollowers: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx: { prisma, session }, input: { userId } }) => {
      return await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          followedBy: {
            select: {
              name: true,
              username: true,
              id: true,
              image: true,
              followedBy: {
                where: {
                  id: session.user.id,
                },
              },
            },
          },
        },
      });
    }),
  getAllFollowing: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx: { prisma, session }, input: { userId } }) => {
      return await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          followings: {
            select: {
              name: true,
              username: true,
              id: true,
              image: true,
            },
          },
        },
      });
    }),
});
