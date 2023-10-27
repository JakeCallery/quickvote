import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import TempSignIn from "@/app/components/TempSignin/TempSignIn";
import CreateTopicForm from "@/app/components/CreateTopicForm/CreateTopicForm";
import TopicList from "@/app/components/TopicList/TopicList";

const TopicsPage = async () => {
  const session = await getServerSession(authOptions);

  return (
    <>
      <h1>Topics Page</h1>

      {session?.user?.name ? (
        <TopicList />
      ) : (
        <div>
          <p>Please sign in to view topics</p>
          <TempSignIn />
        </div>
      )}
    </>
  );
};

export default TopicsPage;
