import React from "react";
import MainLayout from "../../layouts/MainLayouts";
import { trpc } from "../../utils/trpc";
import { useRouter } from "next/router";
import Post from "../../components/Post";

const TagsPost = () => {
  const router = useRouter();

  const getTagPosts = trpc.tag.getPostWithSameTags.useQuery(
    { tagname: router.query.tagname as string },
    {
      enabled: !!router.query.tagname,
    }
  );
  console.log(getTagPosts.data);
  return (
    <MainLayout>
      <div className="my-10 flex w-full flex-col items-center justify-center space-y-4  px-48">
        {getTagPosts.isSuccess &&
          getTagPosts.data?.posts.map((post) => (
            <Post key={post.id} {...post} />
          ))}
      </div>
    </MainLayout>
  );
};

export default TagsPost;
