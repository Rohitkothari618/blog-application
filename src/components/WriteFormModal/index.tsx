import React, { useContext, useState } from "react";
import Modal from "../Modal";
import { globalContext } from "../../context/GlobalContextProvider";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "../../utils/trpc";
import toast from "react-hot-toast";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import TagsAutoCompletion from "../TagsAutoCompletion";
import type { Tag } from "../TagsAutoCompletion";
import TagForm from "../TagForm";
import { FaTimes } from "react-icons/fa";

import dynamic from "next/dynamic";
const ReactQuill = dynamic(import("react-quill"), {
  ssr: false,
});
import "react-quill/dist/quill.snow.css";

type WriteFormType = {
  title: string;
  description: string;
  text: string;
  html: string;
};

export const writeFormSchema = z.object({
  title: z.string().min(10),
  description: z.string().min(60),
  text: z.string().min(100).optional(),
  html: z.string().min(100),
});

const WriteFormModal = () => {
  const { isWriteModalOpen, setIsWriteModalOpen } = useContext(globalContext);
  const [isTagCreateModalOpen, setIsTagCreateModalOpen] = useState(false);
  const [selectedTags, setSelcetedTags] = useState<Tag[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<WriteFormType>({
    resolver: zodResolver(writeFormSchema),
  });

  const postRoute = trpc.useContext().post;

  const createPost = trpc.post.createPost.useMutation({
    onSuccess: () => {
      toast.success("Post Created Succesfully");
      setIsWriteModalOpen(false);
      reset();
      postRoute.getPosts.invalidate();
    },
  });

  const onSubmit = (data: WriteFormType) => {
    const mutationData =
      selectedTags.length > 0 ? { ...data, tagsIds: selectedTags } : data;

    createPost.mutate(mutationData);
  };
  const getTags = trpc.tag.getTags.useQuery();

  return (
    <>
      <Modal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
      >
        {getTags.isSuccess && (
          <>
            <TagForm
              isOpen={isTagCreateModalOpen}
              onClose={() => setIsTagCreateModalOpen(false)}
            />
            <div className=" my-4 flex w-full items-center space-x-4">
              <div className="z-10 w-4/5">
                <TagsAutoCompletion
                  tags={getTags.data}
                  setSelectedTags={setSelcetedTags}
                  selectedTags={selectedTags}
                />
              </div>
              <button
                onClick={() => setIsTagCreateModalOpen(true)}
                className=" whitespace-nowrap rounded-md border border-gray-200 px-4 py-2 text-sm transition hover:border-gray-900 hover:text-gray-900 "
              >
                Create Tag
              </button>
            </div>
            <div className="my-4 flex w-full  flex-wrap items-center justify-center space-x-4">
              {selectedTags.map((tag, i) => (
                <div
                  onClick={() => {
                    // Redirect the user to speciphic tag page,wher all the post related to that tag should be shown
                  }}
                  key={i}
                  className="my-2 flex items-center justify-center  space-x-4 whitespace-nowrap rounded-2xl bg-gray-200/50 px-5 py-3 shadow-md"
                >
                  <div>{tag.name}</div>
                  <div
                    onClick={() =>
                      setSelcetedTags((prev) =>
                        prev.filter((currTag) => currTag.id !== tag.id)
                      )
                    }
                    className="cursor-pointer"
                  >
                    <FaTimes />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative flex flex-col items-center justify-center space-y-4"
        >
          {createPost.isLoading && (
            <div className="absolute flex h-full w-full items-center justify-center">
              <AiOutlineLoading3Quarters className="animate-spin " />
            </div>
          )}
          <input
            type="text"
            id="title"
            placeholder="Title of the blog"
            className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none placeholder:text-sm focus:border-gray-600"
            {...register("title")}
          />
          <p className="w-full pb-4 text-sm text-red-400 ">
            {errors.title?.message}
          </p>
          <input
            className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none placeholder:text-sm focus:border-gray-600"
            type="text"
            placeholder="Enter short Description"
            {...register("description")}
            id="shortDescription"
          />
          <p className="w-full pb-4 text-sm text-red-400 ">
            {errors.description?.message}
          </p>
          {/* <textarea
            className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none placeholder:text-sm focus:border-gray-600"
            {...register("text")}
            placeholder="Blog Main Body"
            id="mainBody"
            cols={10}
            rows={10}
          /> */}
          <Controller
            name="html"
            control={control}
            render={({ field }) => (
              <div className="w-full">
                <ReactQuill
                  theme="snow"
                  {...field}
                  value={field.value}
                  placeholder="Write The blog body here"
                  onChange={(value) => field.onChange(value)}
                />
              </div>
            )}
          />

          <p className="w-full pb-4 text-sm text-red-400 ">
            {errors.html?.message}
          </p>
          <div className="flex w-full justify-end">
            <button
              type="submit"
              className="flex items-center space-x-3 rounded-md border border-gray-200 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 "
            >
              Publish
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default WriteFormModal;
