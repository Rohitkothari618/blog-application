import React, { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Image from "next/image";

import { trpc } from "../../utils/trpc";
import useDebounce from "../../hooks/useDebounce";
import Modal from "../Modal";
import { BiLoaderAlt } from "react-icons/bi";
import toast from "react-hot-toast";

export const unsplashSearchRouterSchema = z.object({
  searchQuery: z.string().min(5),
});

type unsplashGalleryProps = {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  slug: string;
};

const UnsplashGallary = ({
  isOpen,
  onClose,
  postId,
  slug,
}: unsplashGalleryProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, watch, reset, handleSubmit } = useForm<{
    searchQuery: string;
  }>({
    resolver: zodResolver(unsplashSearchRouterSchema),
  });

  const WatchsearchQuery = watch("searchQuery");

  const debouncedSearchQuery = useDebounce(WatchsearchQuery, 3000);

  const fetchUnsplashImages = trpc.unsplash.getImages.useQuery(
    {
      searchQuery: debouncedSearchQuery,
    },
    {
      enabled: Boolean(debouncedSearchQuery),
      onError: (error) => {
        const errorObject = JSON.parse(error.message);
        console.log(errorObject[0].message);
        toast.error(errorObject[0].message);
      },
    }
  );

  const [selectedImage, setSelectedImage] = useState("");

  const utils = trpc.useContext();

  const updatePostFeturedImage = trpc.post.updatePostFeaturedImage.useMutation({
    onSuccess: () => {
      onClose();
      reset();
      setIsLoading(false);
      toast.success("Fetured Image Updated");
      utils.post.getPost.invalidate({ slug });
    },
  });

  const onSubmit = ({}) => {
    setIsLoading(true);
  };

  useEffect(() => {
    if (debouncedSearchQuery) {
      setIsLoading(true);
    }
  }, [debouncedSearchQuery]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative flex flex-col items-center  justify-center space-y-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full items-center justify-around space-x-4"
        >
          <input
            type="text"
            id="search"
            {...register("searchQuery")}
            className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none placeholder:text-sm focus:border-gray-600"
            placeholder="search Images..."
          />{" "}
          <button
            type="submit"
            className=" rounded-lg  bg-black  p-1 text-white "
          >
            Get Images
          </button>
        </form>

        {isLoading && fetchUnsplashImages.isLoading && (
          <div className="absolute -z-10 flex h-full  w-full items-center justify-center  ">
            <BiLoaderAlt className="animate-spin text-4xl" />
          </div>
        )}
        <div className="relative   grid h-96 w-full grid-cols-3 place-items-center gap-4 overflow-y-auto">
          {fetchUnsplashImages.isSuccess &&
            fetchUnsplashImages.data?.results.map((imageData) => (
              <div
                key={imageData.id}
                className="group relative aspect-video h-full w-full cursor-pointer rounded-md  hover:bg-black "
                onClick={() => setSelectedImage(imageData.urls.full)}
              >
                <div
                  className={`absolute inset-0 z-10 h-full w-full rounded-md group-hover:bg-black/40 ${
                    selectedImage === imageData.urls.full && "bg-black/40"
                  }`}
                ></div>
                <Image
                  alt={imageData.alt_description ?? ""}
                  src={imageData.urls.regular}
                  fill
                  className="rounded-md"
                />
              </div>
            ))}
        </div>
        {selectedImage && (
          <button
            onClick={() => {
              updatePostFeturedImage.mutate({
                imageUrl: selectedImage,
                postId: postId,
              });
            }}
            className="flex  items-center space-x-3 rounded-md border border-gray-200 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 "
            disabled={updatePostFeturedImage.isLoading}
          >
            {updatePostFeturedImage.isLoading ? "loading" : "Confirm"}
          </button>
        )}
      </div>
    </Modal>
  );
};

export default UnsplashGallary;
