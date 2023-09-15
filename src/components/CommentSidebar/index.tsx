import { Dialog, Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { Fragment } from "react";
import { useForm } from "react-hook-form";
import { HiXMark } from "react-icons/hi2";
import { z } from "zod";
import { trpc } from "../../utils/trpc";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type CommentSidebarProps = {
  showCommentSidebar: boolean;
  setShowCommentSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  postId: string;
};

export const commentFormSchema = z.object({
  text: z.string().min(3),
});

const CommentSidebar = ({
  showCommentSidebar,
  setShowCommentSidebar,
  postId,
}: CommentSidebarProps) => {
  const {
    register,
    handleSubmit,
    formState: { isValid },
    reset,
  } = useForm<{ text: string }>({
    resolver: zodResolver(commentFormSchema),
  });

  const postRoute = trpc.useContext().post;

  const submitComment = trpc.post.submitComment.useMutation({
    onSuccess: () => {
      toast.success("🤩");
      postRoute.getComments.invalidate({
        postId,
      });
      postRoute.invalidate();
      reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const getComments = trpc.post.getComments.useQuery({ postId });
  return (
    <Transition.Root show={showCommentSidebar} as={Fragment}>
      <Dialog onClose={() => setShowCommentSidebar(false)} as="div">
        <div className="fixed right-0 top-0">
          <Transition.Child
            enter="transition duration-1000"
            leave="transition duration-500"
            enterFrom="translate-x-full "
            enterTo="translate-x-0"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full "
          >
            <Dialog.Panel className="relative h-screen w-[200px]  bg-white shadow-md  sm:w-[400px] ">
              <div className="flex h-full w-full flex-col space-y-4 overflow-y-scroll px-6">
                <div className="mb-5 mt-10 flex items-center justify-between  text-xl ">
                  <h2 className=" font-semibold">
                    Responses ({getComments.data?.length})
                  </h2>
                  <div className="text-lg font-semibold">
                    <HiXMark
                      className="cursor-pointer "
                      onClick={() => setShowCommentSidebar(false)}
                    />
                  </div>
                </div>
                <div>
                  <form
                    onSubmit={handleSubmit((data) => {
                      submitComment.mutate({
                        ...data,
                        postId,
                      });
                    })}
                    className="flex flex-col items-end space-y-4 "
                  >
                    <textarea
                      className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none placeholder:text-sm focus:border-gray-600"
                      placeholder="What are your throughts ...."
                      id="comment"
                      rows={3}
                      {...register("text")}
                    />
                    {isValid && (
                      <button
                        className="flex items-center space-x-3 rounded border border-gray-300 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900"
                        type="submit"
                      >
                        {" "}
                        Comment
                      </button>
                    )}
                  </form>
                </div>

                <div className=" flex flex-col items-center space-y-4 ">
                  {getComments.isSuccess &&
                    getComments.data.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex w-full flex-col space-y-4 border-b  border-gray-500 pb-4 last:border-none"
                      >
                        <div className="flex w-full  items-center  space-x-2">
                          <div className="relative h-8 w-8 rounded-full bg-gray-400"></div>
                          <div>
                            <div>
                              <p className="text-xs font-semibold">
                                {comment.user.name}
                                <p className="">
                                  {dayjs(comment.createdAt).fromNow()}
                                </p>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm">{comment.text}</div>
                      </div>
                    ))}
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CommentSidebar;
