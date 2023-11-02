import React from "react";
import EditTopicForm from "@/app/components/EditTopicForm/EditTopicForm";
import { Topic } from "@/types/topic";
import { headers } from "next/headers";
import { TOPICS_API_ENDPOINT } from "@/app/config/paths";
import TempSignIn from "@/app/components/TempSignin/TempSignIn";

const EditTopicPage = async ({ params }: { params: { id: string } }) => {
  const headersList = headers();
  const host = headersList.get("x-forwarded-host");
  const proto = headersList.get("x-forwarded-proto");
  const cookie = headersList.get("cookie");

  if (!host || !proto) {
    return (
      <div>
        <h1>
          Error Getting topic:{" "}
          {"There is a problem on the server, please try again later."}
        </h1>
      </div>
    );
  }

  if (!cookie) {
    return (
      <div>
        <p>Please sign in to view topics</p>
        <TempSignIn />
      </div>
    );
  }

  const res = await fetch(
    `${proto}://${host}${TOPICS_API_ENDPOINT}/${params.id}`,
    {
      method: "GET",
      headers: {
        Cookie: cookie!,
      },
    },
  );

  if (res.status === 404)
    return (
      <div>
        <h1>Topic Not Found</h1>
      </div>
    );

  if (res.status !== 200) {
    let error;
    try {
      const data = await res.json();
      error = data?.error || "Unknown Error";
    } catch (err) {
      error = err;
    }

    return (
      <div>
        <h1>Error Getting topic: {error?.toString() || "Unknown Error"}</h1>
      </div>
    );
  }

  const topic = (await res.json()) as Topic;
  return (
    <div className="flex justify-center">
      <div className=" w-2/3 flex justify-center">
        <div>
          <h1 className="font-black text-7xl text-secondary text-center">
            EDIT TOPIC
          </h1>
          <div className="divider"></div>
          <EditTopicForm topic={topic} />
        </div>
      </div>
    </div>
  );
};

export default EditTopicPage;
