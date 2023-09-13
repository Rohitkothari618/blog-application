import { useRouter } from "next/router";
import React, { useCallback, useState } from "react";
import MainLayout from "../layouts/MainLayouts";
import { trpc } from "../utils/trpc";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { BsChat } from "react-icons/bs";
import CommentSidebar from "../components/CommentSidebar";
import { BiImageAdd } from "react-icons/bi";
import UnsplashGallary from "../components/UnsplashGallary";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Interweave } from "interweave";

const PostPage = () => {
  const router = useRouter();
  const { data } = useSession();

  const postRoute = trpc.useContext().post;

  const getPost = trpc.post.getPost.useQuery(
    {
      slug: router.query.slug as string,
    },
    {
      enabled: Boolean(router.query.slug),
    }
  );

  const invalidateCurrentPage = useCallback(() => {
    postRoute.getPost.invalidate({ slug: router.query.slug as string });
  }, [postRoute.getPost, router.query.slug]);

  const likePost = trpc.post.likePost.useMutation({
    onSuccess: () => {
      invalidateCurrentPage();
    },
  });
  const dislikePost = trpc.post.dislikePost.useMutation({
    onSuccess: () => {
      invalidateCurrentPage();
    },
  });

  const [showCommentSidebar, setShowCommentSidebar] = useState(false);
  const [isUnsplashModalOpen, setIsUnsplashModalOpen] = useState(false);
  return (
    <MainLayout>
      {getPost.isSuccess && (
        <UnsplashGallary
          isOpen={isUnsplashModalOpen}
          onClose={() => setIsUnsplashModalOpen(false)}
          postId={getPost.data?.id as string}
          slug={getPost.data?.slug as string}
        />
      )}
      {getPost.data?.id && (
        <CommentSidebar
          showCommentSidebar={showCommentSidebar}
          setShowCommentSidebar={setShowCommentSidebar}
          postId={getPost.data?.id}
        />
      )}

      {getPost.isLoading && (
        <div className="flex h-full w-full items-center justify-center space-x-6">
          <div>Loading...</div>
          <div>
            <AiOutlineLoading3Quarters className="animate-spin " />
          </div>
        </div>
      )}
      {getPost.isSuccess && (
        <div className="fixed bottom-10 flex w-full items-center justify-center ">
          <div className="group flex items-center space-x-4 rounded-full border border-gray-400 bg-white px-8 py-3 shadow-xl transition duration-300 hover:border-gray-900">
            <div className="cursor-pointer border-r pr-4 group-hover:border-gray-900">
              {getPost.data?.likes && getPost.data.likes.length > 0 ? (
                <FcLike
                  onClick={() =>
                    getPost.data?.id &&
                    dislikePost.mutate({
                      postId: getPost.data?.id,
                    })
                  }
                  className="text-xl"
                />
              ) : (
                <FcLikePlaceholder
                  onClick={() =>
                    getPost.data?.id &&
                    likePost.mutate({
                      postId: getPost.data?.id,
                    })
                  }
                  className="text-xl"
                />
              )}
            </div>
            <div>
              <BsChat
                className="cursor-pointer text-lg"
                onClick={() => setShowCommentSidebar(true)}
              />
            </div>
          </div>
        </div>
      )}
      <div className="flex h-full w-full items-center justify-center p-10">
        <div className="flex w-full max-w-screen-md flex-col space-y-4">
          <div className="relative h-[60vh] w-full rounded-xl bg-gray-300 shadow-lg">
            {getPost.isSuccess && getPost.data?.featuredImage && (
              <Image
                src={getPost.data?.featuredImage}
                alt={getPost.data?.title}
                fill
                className="rounded-xl"
              />
            )}
            {data?.user?.id === getPost.data?.authorId && (
              <div
                onClick={() => setIsUnsplashModalOpen(true)}
                className="absolute left-2 top-2 z-10 cursor-pointer rounded-lg bg-black/30    p-2 text-2xl text-white hover:bg-black"
              >
                <BiImageAdd className=" " />
              </div>
            )}
            <div className="absolute flex h-full w-full items-center justify-center">
              <div className="rounded-xl bg-black/50 p-4 text-3xl text-white">
                {getPost.data?.title}
              </div>
            </div>
          </div>
          <div className="border-l-4 border-gray-800 pl-6">
            {getPost.data?.description}
          </div>
          {/* <div>{getPost.data?.text}</div> */}
          <div className="prose lg:prose-xl">
            <Interweave content={getPost.data?.html} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PostPage;
