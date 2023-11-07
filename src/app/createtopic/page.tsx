import React from "react";
import TempSignIn from "@/app/components/TempSignin/TempSignIn";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import CreateTopicForm from "@/app/components/CreateTopicForm/CreateTopicForm";

const CreateTopicPage = async () => {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex justify-center">
      <div className=" w-2/3 flex justify-center">
        <div>
          <h1 className="font-black text-7xl text-secondary text-center">
            Create A New Topic
          </h1>
          <div className="divider"></div>
          <div className="">
            {session?.user?.name ? (
              <CreateTopicForm />
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

export default CreateTopicPage;
