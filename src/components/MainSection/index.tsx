import React from "react";
import { CiSearch } from "react-icons/ci";
import { HiMiniChevronDown } from "react-icons/hi2";
import InfiniteScroll from "react-infinite-scroll-component";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { trpc } from "../../utils/trpc";
import Post from "../Post";
import { BiLoaderCircle } from "react-icons/bi";

const MainSection = () => {
  const getPosts = trpc.post.getPosts.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <main className="col-span-8 h-full w-full border-r border-gray-300 px-24  ">
      <div className="flex flex-col space-y-4 py-10">
        <div className="flex w-full flex-row items-center space-x-4 ">
          <label
            htmlFor="search"
            className="relative w-full rounded-3xl border border-gray-800"
          >
            <div className="absolute left-3 flex h-full   items-center ">
              <CiSearch />
            </div>

            <input
              type="text"
              name="search"
              id="search"
              className=" w-full rounded-3xl px-4 py-2 pl-8 text-sm outline-none placeholder:text-xs placeholder:text-gray-400"
              placeholder="Search...."
            />
          </label>
          <div className="flex w-full items-center justify-end space-x-4 ">
            <div>My Topics:</div>
            <div className="flex items-center space-x-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-3xl bg-gray-200/50 px-4 py-3">
                  tag{i}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-between  border-b border-gray-300 pb-8 ">
          <div>Articles</div>
          <div>
            <button className="flex items-center space-x-2  rounded-3xl border border-gray-800 px-4 py-1.5 font-semibold">
              <div>Following</div>
              <div>
                <HiMiniChevronDown className="text-xl " />
              </div>
            </button>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col justify-center space-y-6">
        {getPosts.isLoading && (
          <div className="flex h-full w-full items-center justify-center space-x-6">
            <div>Loading...</div>
            <div>
              <AiOutlineLoading3Quarters className="animate-spin " />
            </div>
          </div>
        )}
        <InfiniteScroll
          dataLength={
            getPosts.data?.pages.flatMap((page) => page.posts).length ?? 0
          } //This is important field to render the next data
          next={getPosts.fetchNextPage}
          hasMore={!!getPosts.hasNextPage}
          loader={
            <div className="flex h-full w-full items-center justify-center">
              <BiLoaderCircle className="animate-spin" />
            </div>
          }
          endMessage={
            <p style={{ textAlign: "center" }}>
              {!getPosts.isLoading && <b>Yay! You have seen it all</b>}
            </p>
          }
        >
          {getPosts.isSuccess &&
            getPosts.data.pages
              .flatMap((page) => page.posts)
              .map((post) => <Post key={post.id} {...post} />)}
        </InfiniteScroll>
      </div>
    </main>
  );
};

export default MainSection;
