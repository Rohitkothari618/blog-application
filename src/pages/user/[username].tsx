import React, { useState } from "react";
import MainLayout from "../../layouts/MainLayouts";
import Image from "next/image";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import { BiEdit } from "react-icons/bi";

import toast from "react-hot-toast";
import { SlShareAlt } from "react-icons/sl";
import Post from "../../components/Post";
import { useSession } from "next-auth/react";
import Modal from "../../components/Modal";
import { userRouter } from "../../server/trpc/router/user";

const UserProfilePage = () => {
  const router = useRouter();
  const currentUser = useSession();
  const userProfile = trpc.user.getUserProfile.useQuery(
    {
      username: router.query.username as string,
    },
    {
      enabled: !!router.query.username,
    }
  );

  const userPosts = trpc.user.getUserPosts.useQuery(
    {
      username: router.query.username as string,
    },
    {
      enabled: !!router.query.username,
    }
  );
  const useRoute = trpc.useContext().user;

  const uploadAvatar = trpc.user.uploadAvatar.useMutation({
    onSuccess: () => {
      if (userProfile.data?.username) {
        useRoute.getUserProfile.invalidate({
          username: router.query.username as string,
        });
      }
      toast.success("Avatar Updataed");
    },
  });
  const followUser = trpc.user.followUser.useMutation({
    onSuccess: () => {
      useRoute.getAllFollowers.invalidate();
      useRoute.getAllFollowing.invalidate();
      useRoute.getUserProfile.invalidate();
      toast.success("user Followed Succesfully");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const unfollowUser = trpc.user.unfollowUser.useMutation({
    onSuccess: () => {
      useRoute.getAllFollowers.invalidate();
      useRoute.getAllFollowing.invalidate();
      useRoute.getUserProfile.invalidate();

      toast.success("user Unfollowed Succesfully");
    },
  });

  const [objectImage, setObjectImage] = useState("");

  const handleChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 1.5 * 1000000) {
        return toast.error("images size should not be greator then 1MB");
      }
      setObjectImage(URL.createObjectURL(file));

      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onloadend = () => {
        if (fileReader.result) {
          uploadAvatar.mutate({
            imageAsDataURI: fileReader.result as string,
            username: userProfile.data?.username as string,
            mimetype: file.type,
          });
        }
      };
    }
  };

  const [isFollowModalOpen, setIsFollowModalOpen] = useState({
    isOpen: false,
    modalType: "followers",
  });

  const followers = trpc.user.getAllFollowers.useQuery(
    {
      userId: userProfile?.data?.id as string,
    },
    {
      enabled: Boolean(userProfile?.data?.id),
    }
  );
  const following = trpc.user.getAllFollowing.useQuery(
    {
      userId: userProfile?.data?.id as string,
    },
    {
      enabled: Boolean(userProfile?.data?.id),
    }
  );
  return (
    <MainLayout>
      {followers.isSuccess && following.isSuccess && (
        <Modal
          isOpen={isFollowModalOpen.isOpen}
          onClose={() =>
            setIsFollowModalOpen((prev) => ({ ...prev, isOpen: false }))
          }
        >
          <div className="flex w-full flex-col items-center justify-center space-y-4">
            {isFollowModalOpen.modalType === "followers" && (
              <div className="my-1 flex w-full flex-col justify-center ">
                <h3 className="my-2 p-2 text-xl">Followers </h3>
                {followers.data?.followedBy?.map((user) => (
                  <div
                    key={user.id}
                    className="flex w-full  items-center justify-between rounded-xl bg-gray-300 px-4 py-2"
                  >
                    <div> {user.name}</div>
                    <button
                      className="flex items-center space-x-3 rounded-md border border-gray-400/50 bg-white px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 "
                      onClick={() =>
                        user.followedBy.length > 0
                          ? unfollowUser.mutate({
                              followingUserId: user.id,
                            })
                          : followUser.mutate({
                              followingUserId: user.id,
                            })
                      }
                    >
                      {user.followedBy.length > 0 ? "Unfollow" : "Follow"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {isFollowModalOpen.modalType === "followings" && (
              <div className="my-1 flex w-full flex-col justify-center ">
                <h3 className="my-2 p-2 text-xl">Followings </h3>
                {following.data?.followings?.map((user) => (
                  <div
                    key={user.id}
                    className="flex w-full  items-center justify-between rounded-xl bg-gray-300 px-4 py-2"
                  >
                    <div> {user.name}</div>

                    <button
                      className="flex items-center space-x-3 rounded-md border border-gray-400/50 bg-white px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 "
                      onClick={() =>
                        unfollowUser.mutate({
                          followingUserId: user.id,
                        })
                      }
                    >
                      UnFollow
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
      <div className="flex h-full w-full items-center justify-center">
        <div className="my-10 flex h-full w-full max-w-screen-md flex-col items-center justify-center xl:max-w-screen-lg">
          <div className="flex w-full flex-col rounded-b-3xl  bg-white shadow-lg ">
            <div className="relative h-44 w-full rounded-t-3xl bg-gradient-to-r from-rose-100 to-teal-100">
              <div className="absolute -bottom-10 left-12 ">
                <div className="group relative h-28 w-28  rounded-full border-2 border-white bg-gray-100">
                  {currentUser?.data?.user?.id === userProfile.data?.id && (
                    <label
                      htmlFor="avatarFile"
                      className="absolute z-10 flex h-full w-full cursor-pointer  items-center justify-center  rounded-full transition duration-300 group-hover:bg-black/40"
                    >
                      <BiEdit className="hidden text-3xl text-white group-hover:flex " />
                      {
                        <input
                          type="file"
                          name="avatarFile"
                          id="avatarFile"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleChangeImage}
                          multiple={false}
                        />
                      }
                    </label>
                  )}
                  {!objectImage && userProfile.data?.image && (
                    <Image
                      src={userProfile.data?.image as string}
                      alt={userProfile.data?.name as string}
                      fill
                      className="rounded-full "
                    />
                  )}
                  {objectImage && userProfile.data?.image && (
                    <Image
                      src={objectImage}
                      alt={userProfile.data?.name as string}
                      fill
                      className="rounded-full "
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="wf] ml-12 mt-10 flex flex-col space-y-0.5 py-5">
              <div className="text-2xl font-semibold text-gray-800">
                {userProfile.data?.name}
              </div>
              <div className="text-gray-600">@{userProfile.data?.username}</div>
              <div className="text-gray-600 ">
                {userProfile.data?._count.posts ?? 0}{" "}
                <span className="mx-1">Posts</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() =>
                    setIsFollowModalOpen({
                      isOpen: true,
                      modalType: "followers",
                    })
                  }
                  className="text-gray-600 hover:text-gray-900"
                >
                  <span className="font-bold">
                    {" "}
                    {userProfile.data?._count.followedBy ?? 0}{" "}
                  </span>
                  <span className="mx-1">Followers</span>
                </button>
                <button
                  onClick={() =>
                    setIsFollowModalOpen({
                      isOpen: true,
                      modalType: "followings",
                    })
                  }
                  className="text-gray-600 hover:text-gray-900"
                >
                  <span className="font-bold">
                    {" "}
                    {userProfile.data?._count.followings ?? 0}{" "}
                  </span>
                  <span className="mx-1">Followings</span>
                </button>
              </div>

              <div className=" flex w-full items-center space-x-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("URL Copied to clipboard");
                  }}
                  className=" mt-4 flex items-center space-x-3 rounded-md border border-gray-200 px-4 py-2 transition hover:border-gray-900  hover:text-gray-900 active:scale-95"
                >
                  <div>share</div>
                  <div>
                    <SlShareAlt className="text-gray-600" />
                  </div>
                </button>
                {userProfile.isSuccess && userProfile.data?.followedBy && (
                  <button
                    className="mt-4 flex items-center space-x-3 rounded-md border border-gray-400/50 bg-white px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 "
                    onClick={() => {
                      if (userProfile.data?.id) {
                        userProfile.data.followedBy.length > 0
                          ? unfollowUser.mutate({
                              followingUserId: userProfile.data.id,
                            })
                          : followUser.mutate({
                              followingUserId: userProfile.data.id,
                            });
                      }
                    }}
                  >
                    {userProfile.data?.followedBy.length > 0
                      ? "Unfollow"
                      : "Follow"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="my-10 flex w-full flex-col items-center justify-center space-y-4 px-2">
            {" "}
            {userPosts.isSuccess &&
              userPosts.data?.posts.map((post) => (
                <Post featuredImage={null} key={post.id} {...post} />
              ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfilePage;
