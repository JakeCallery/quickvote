import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import TempSignIn from "@/app/components/TempSignin/TempSignIn";
import TopicList from "@/app/components/TopicList/TopicList";

const TopicsPage = async () => {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex justify-center">
      <div className=" w-2/3 flex justify-center">
        <div>
          <h1 className="font-black text-7xl text-secondary text-center">
            TOPICS
          </h1>
          <div className="divider"></div>
          <div className="">
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
      </div>
    </div>
  );
};

export default TopicsPage;
