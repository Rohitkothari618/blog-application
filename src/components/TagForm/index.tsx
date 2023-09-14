import React from "react";
import Modal from "../Modal";
import toast from "react-hot-toast";
import { trpc } from "../../utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const tagCreateSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
});

type TagFormTypes = {
  isOpen: boolean;
  onClose: () => void;
};

const TagForm = ({ isOpen, onClose }: TagFormTypes) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ name: string; description: string }>({
    resolver: zodResolver(tagCreateSchema),
  });

  const tagRoute = trpc.useContext().tag;
  const createTag = trpc.tag.createTag.useMutation({
    onSuccess: () => {
      toast.success("Tags Successfully Created");
      tagRoute.getTags.invalidate();
      reset();
      onClose();
    },
  });
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a Tag">
      <form
        onSubmit={handleSubmit((data) => createTag.mutate(data))}
        className="relative flex flex-col items-center justify-center space-y-4"
      >
        <input
          type="text"
          id="name"
          placeholder="Name of the tag"
          className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none placeholder:text-sm focus:border-gray-600"
          {...register("name")}
        />
        <p className="w-full pb-4 text-sm text-red-400 ">
          {errors.name?.message}
        </p>
        <input
          type="text"
          id="description"
          placeholder="description"
          className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none placeholder:text-sm focus:border-gray-600"
          {...register("description")}
        />
        <p className="w-full pb-4 text-sm text-red-400 ">
          {errors.description?.message}
        </p>
        <div className="flex w-full justify-end">
          <button
            type="submit"
            className="flex items-center space-x-3 rounded-md border border-gray-200 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 "
          >
            Create Tag
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TagForm;
