import React from "react";
import { trpc } from "../../utils/trpc";
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

const SideSection = () => {
  const readingList = trpc.post.getReadingList.useQuery();
  const suggestions = trpc.user.getSuggeestions.useQuery();
  const followUser = trpc.user.followUser.useMutation({
    onSuccess: () => {
      // Invalidate Something
      toast.success("user Followed Succesfully");
    },
  });
  return (
    <aside className="col-span-4 flex h-full w-full flex-col space-y-4 p-6">
      {/* People Might Be intersted */}
      <div className="">
        <h3 className="my-6 text-lg font-semibold">
          People you might be intersted
        </h3>
        <div className="flex flex-col space-y-4">
          {suggestions.isSuccess &&
            suggestions.data.map((user) => (
              <div
                key={user.id}
                className="flex flex-row items-center space-x-5"
              >
                <div className="relative h-10 w-10 flex-none overflow-hidden rounded-full bg-gray-300">
                  {user.image && <Image src={user.image} alt={user.id} fill />}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    {user.name}
                  </div>
                  <div className="text-xs">{user.username}</div>
                </div>
                <div>
                  <button
                    className="flex items-center space-x-3 rounded-md border border-gray-400/50 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 "
                    onClick={() =>
                      followUser.mutate({
                        followingUserId: user.id,
                      })
                    }
                  >
                    Follow
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Reading List */}
      <div>
        <h3 className="my-6 text-lg font-semibold">Your Reading List</h3>

        <div className="flex flex-col space-y-4">
          {readingList.data &&
            readingList.data.map((bookmark) => (
              <Link
                href={bookmark.post.slug}
                key={bookmark.id}
                className="group flex items-center space-x-6"
              >
                <div className="relative aspect-square h-full w-2/5 overflow-hidden rounded-xl bg-gray-300">
                  {bookmark.post.featuredImage && (
                    <Image
                      src={bookmark.post.featuredImage}
                      alt={bookmark.post.slug}
                      fill
                    />
                  )}
                </div>
                <div className=" flex w-3/5 flex-col space-y-2">
                  <div className="text-lg font-semibold decoration-indigo-600 group-hover:underline">
                    {bookmark.post.title}
                  </div>
                  <div className="truncate">{bookmark.post.description}</div>
                  <div className="flex w-full items-center space-x-4">
                    <div className="relative h-8 w-8 rounded-full bg-gray-400">
                      {bookmark.post.author.image && (
                        <Image
                          src={bookmark.post.author.image}
                          fill
                          alt={bookmark.post.author.name ?? ""}
                          className="rounded-full"
                        />
                      )}
                    </div>

                    <div>{bookmark.post.author.name} &#x2022;</div>
                    <div>
                      {dayjs(bookmark.post.createdAt).format("DD/MM/YYYY")}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </aside>
  );
};

export default SideSection;
