import React from "react";
import EditTopicForm from "@/app/components/EditTopicForm/EditTopicForm";
import { Topic } from "@/types/topic";
import { headers } from "next/headers";

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

  const res = await fetch(`${proto}://${host}/api/topics/${params.id}`, {
    method: "GET",
    headers: {
      Cookie: cookie!,
    },
  });

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
    <div>
      <h1>Edit Topic</h1>
      <EditTopicForm topic={topic} />
    </div>
  );
};

export default EditTopicPage;
