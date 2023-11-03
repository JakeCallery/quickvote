import React from "react";
import TempSignIn from "@/app/components/TempSignin/TempSignIn";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import InvitedTopicList from "@/app/topics/invited/components/InvitedTopicList/InvitedTopicList";

const TopicsInvitedToPage = async () => {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex justify-center">
      <div className=" w-2/3 flex justify-center">
        <div>
          <h1 className="font-black text-7xl text-secondary text-center">
            TOPICS TO VOTE ON
          </h1>
          <div className="divider"></div>
          <div className="">
            {session?.user?.name ? (
              <InvitedTopicList />
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

export default TopicsInvitedToPage;
