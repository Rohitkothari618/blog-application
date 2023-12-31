import React, { useState } from "react";
import { CiBookmarkCheck, CiBookmarkPlus } from "react-icons/ci";

import { trpc } from "../../utils/trpc";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";

type postProps = {
  title: string;
  description: string;
  id: string;
  slug: string;
  featuredImage: string | null;
  createdAt: Date;
  bookmarks: {
    id: string;
    userId: string;
    postId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  author: {
    name: string | null;
    image: string | null;
    username: string;
  };
  tags: {
    name: string;
    id: string;
    slug: string;
  }[];
};

const Post = ({ ...post }: postProps) => {
  const [isBookmarked, setIsBookmarked] = useState(
    Boolean(post.bookmarks?.length)
  );
  const readingListRoute = trpc.useContext().post.getReadingList;

  const bookmarkPost = trpc.post.bookmarkPost.useMutation({
    onSuccess: () => {
      setIsBookmarked((prev) => !prev);
      readingListRoute.invalidate();
    },
  });
  const removeBookmark = trpc.post.removeBookmark.useMutation({
    onSuccess: () => {
      setIsBookmarked((prev) => !prev);
      readingListRoute.invalidate();
    },
  });
  return (
    <div
      key={post.id}
      className=" mt-2 flex flex-col space-y-4  border-b border-gray-300 pb-8 last:border-none"
    >
      <Link
        href={`/user/${post.author.username}`}
        className="group flex  w-full  cursor-pointer  items-center space-x-2 "
      >
        <div className="relative h-10 w-10 rounded-full bg-gray-400">
          {post.author.image && (
            <Image
              src={post.author.image}
              fill
              alt={post.author.name ?? ""}
              className="rounded-full"
            />
          )}
        </div>
        <div>
          <p className="font-semibold  ">
            <span className="mr-2 decoration-indigo-500 group-hover:underline">
              {post.author.name}
            </span>
            &#x2022;{" "}
            <span className="mx-1">
              {dayjs(post.createdAt).format("DD/MM/YYYY")}
            </span>
          </p>
          <p className="text-sm">Founder,teacher & developer</p>
        </div>
      </Link>
      <Link
        href={`/${post.slug}`}
        className="group grid w-full grid-cols-12 gap-4"
      >
        <div className="col-span-6 flex flex-col space-y-4">
          <p className="text-2xl font-bold text-gray-800 decoration-indigo-600 group-hover:underline">
            {post.title}
          </p>
          <p className="text-sm text-gray-500">{post.description}</p>
        </div>
        <div className="col-span-6">
          <div className="aspect-video h-full w-full transform rounded-xl bg-gray-300 transition duration-300 hover:scale-105 hover:shadow-md">
            {post.featuredImage && (
              <Image
                src={post.featuredImage}
                fill
                alt={post.author.name ?? ""}
                className="rounded-xl "
              />
            )}
          </div>
        </div>
      </Link>
      <div>
        <div className="flex w-full items-center justify-between space-x-4 ">
          <div className="flex items-center space-x-2">
            {post.tags &&
              post.tags.map((tag) => (
                <Link
                  href={`/tag/${tag.slug}`}
                  key={tag.id}
                  className="rounded-2xl bg-gray-200/50 px-5 py-3"
                >
                  {tag.name}
                </Link>
              ))}
          </div>
          <div>
            {isBookmarked ? (
              <CiBookmarkCheck
                className="cursor-pointer text-3xl text-indigo-600"
                onClick={() => {
                  removeBookmark.mutate({
                    postId: post.id,
                  });
                }}
              />
            ) : (
              <CiBookmarkPlus
                className="cursor-pointer text-3xl"
                onClick={() => {
                  bookmarkPost.mutate({
                    postId: post.id,
                  });
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
