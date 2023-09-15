import { useRouter } from "next/router";
import React, { useCallback, useContext, useState } from "react";
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
import { globalContext } from "../context/GlobalContextProvider";

import UpdateFormModal from "../components/UpdateFormModal";
import Modal from "../components/Modal";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const PostPage = () => {
  const router = useRouter();
  const { data } = useSession();
  const { setIsUpdateModalOpen } = useContext(globalContext);
  const [deletePostModal, setDeletePostModal] = useState(false);
  const [authorModal, setAuthorModal] = useState(false);

  const { register, watch } = useForm<{ search: string }>({
    resolver: zodResolver(
      z.object({
        search: z.string(),
      })
    ),
  });
  const watchQuery = watch("search", "");

  const postRoute = trpc.useContext().post;

  const getPost = trpc.post.getPost.useQuery(
    {
      slug: router.query.slug as string,
    },
    {
      enabled: Boolean(router.query.slug),
    }
  );

  const getAllUsers = trpc.user.getAllUser.useQuery({ query: watchQuery });

  const invalidateCurrentPage = useCallback(() => {
    postRoute.getPost.invalidate({ slug: router.query.slug as string });
  }, [postRoute.getPost, router.query.slug]);

  const likePost = trpc.post.likePost.useMutation({
    onSuccess: () => {
      invalidateCurrentPage();
      postRoute.invalidate();
    },
  });
  const dislikePost = trpc.post.dislikePost.useMutation({
    onSuccess: () => {
      invalidateCurrentPage();
      postRoute.invalidate();
    },
  });

  const deletePostRoute = trpc.post.deletePost.useMutation({
    onSuccess: () => {
      //
      toast.success("Post deleted successfully");
      router.push("/");
    },
  });
  const deletePost = () => {
    {
      getPost.data?.id && deletePostRoute.mutate({ postId: getPost.data.id });
    }
  };

  const addAuthor = trpc.post.addAuthor.useMutation({
    onSuccess: () => {
      toast.success("Author Add Succesfully");

      postRoute.getPost.invalidate();
    },
  });

  const removerAuthor = trpc.post.removerAuthor.useMutation({
    onSuccess: () => {
      toast.success("Author Remove Succesfully");

      postRoute.getPost.invalidate();
    },
  });

  const getLikes = trpc.post.getLikes.useQuery({
    postId: getPost.data?.id as string,
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
      {getPost.isSuccess && (
        <UpdateFormModal
          title={getPost.data?.title}
          text={getPost.data?.text as string}
          description={getPost.data?.description}
          html={getPost.data?.html as string}
          tags={getPost.data?.tags as any}
          postId={getPost.data?.id as string}
        />
      )}

      <Modal onClose={() => setDeletePostModal(false)} isOpen={deletePostModal}>
        <div className="flex flex-col items-center space-y-4">
          <p className="text-2xl">Are you sure you want to delete this post?</p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={deletePost}
              className="rounded-md border bg-red-400 px-4 py-2 text-white transition-all hover:border-gray-200 hover:bg-white hover:text-black active:scale-105 "
            >
              Yes
            </button>
            <button
              onClick={() => setDeletePostModal(false)}
              className="rounded-md border bg-black px-4 py-2 text-white transition-all hover:border-gray-200 hover:bg-white hover:text-black active:scale-105 "
            >
              No
            </button>
          </div>
        </div>
      </Modal>
      <Modal onClose={() => setAuthorModal(false)} isOpen={authorModal}>
        <div className="h-96 ">
          <input
            className=" w-full rounded-xl border border-gray-300 p-4 outline-none placeholder:text-sm focus:border-gray-600"
            type="text"
            placeholder="Serach People"
            id="shortDescription"
            {...register("search")}
          />
          <div className="mt-4 flex h-full flex-col  space-y-4 overflow-y-scroll px-4 pb-20 ">
            {getAllUsers.data &&
              getAllUsers.data.map((user) => {
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-md border-2 px-3 py-4 "
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative h-10 w-10">
                        <Image
                          fill
                          src={user.image as string}
                          alt="image"
                          className="rounded-full"
                        />
                      </div>

                      <h2> {user.name}</h2>
                    </div>
                    {getPost.data?.authors.some(
                      (author) => author.authorId === user.id
                    ) ? (
                      <button
                        onClick={() =>
                          removerAuthor.mutate({
                            postId: getPost?.data?.id as string,
                            userId: user.id,
                          })
                        }
                        className="rounded-md border bg-black  p-2 text-white transition-all hover:bg-white hover:text-black active:scale-95"
                      >
                        remove Author
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          addAuthor.mutate({
                            userId: user.id,
                            postId: getPost.data?.id ? getPost.data?.id : "",
                          })
                        }
                        className="rounded-md border bg-black  p-2 text-white transition-all hover:bg-white hover:text-black active:scale-95"
                      >
                        Add Author
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </Modal>

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
            <div className="flex cursor-pointer items-center justify-center space-x-3 border-r pr-4 group-hover:border-gray-900">
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
              <p>
                {getLikes.data?.map((like) => {
                  return like._count.likes;
                })}
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 ">
              <BsChat
                className="cursor-pointer text-lg"
                onClick={() => setShowCommentSidebar(true)}
              />
              <p> {getPost.data?.comments?.length}</p>
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
            {data?.user &&
              (getPost.data?.authorId === data.user.id ||
                getPost.data?.authors.some(
                  (author) => author.authorId === data?.user?.id
                )) && (
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
          <div className="flex justify-between  space-x-4">
            <div className="flex  space-x-4">
              {data?.user &&
                (getPost.data?.authorId === data.user.id ||
                  getPost.data?.authors.some(
                    (author) => author.authorId === data?.user?.id
                  )) && (
                  <button
                    onClick={() => setIsUpdateModalOpen(true)}
                    className="z-10 w-fit cursor-pointer rounded-lg bg-black/60 px-4 py-1 text-2xl text-white transition-all hover:scale-95 hover:bg-black"
                  >
                    Edit Post
                  </button>
                )}
              {data?.user?.id === getPost.data?.authorId && (
                <button
                  onClick={() => setDeletePostModal(true)}
                  className=" z-10 w-fit cursor-pointer rounded-lg bg-black/60 px-4    py-1 text-2xl text-white hover:scale-95 hover:bg-black"
                >
                  Delete Post
                </button>
              )}
            </div>

            {data?.user?.id === getPost.data?.authorId && (
              <button
                onClick={() => setAuthorModal(true)}
                className=" z-10 w-fit cursor-pointer rounded-lg bg-black/60 px-4  py-1  text-2xl text-white transition-all hover:scale-95 hover:bg-black"
              >
                Add Author
              </button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PostPage;
