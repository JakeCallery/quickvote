import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import TempSignIn from "@/app/components/TempSignin/TempSignIn";
import TopicList from "@/app/components/TopicList/TopicList";

const TopicsPage = async () => {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex justify-center">
      <div className="bg-green-500 w-1/2 flex justify-center">
        <h1 className="font-black text-5xl text-secondary">TOPICS</h1>

        {session?.user?.name ? (
          <TopicList />
        ) : (
          <div>
            <p>Please sign in to view topics</p>
            <TempSignIn />
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicsPage;
