import React from "react";
import EditTopicForm from "@/app/components/EditTopicForm/EditTopicForm";
import { Topic } from "@/types/topic";
import { headers } from "next/headers";

const EditTopicPage = async ({ params }: { params: { id: string } }) => {
  const headersList = headers();
  const host = headersList.get("x-forwarded-host");
  const proto = headersList.get("x-forwarded-proto");
  console.log(`Proto: ${proto}, Host: ${host}`);
  // const res = await fetch(`${proto}://${host}/api/topics/${params.id}`, {
  //   headers: headersList,
  // });

  const res = await fetch(`${proto}://${host}/api/topics/${params.id}`);

  if (res.status === 404)
    return (
      <div>
        <h1>Topic Not Found</h1>
      </div>
    );

  if (res.status !== 200) {
    const data = await res.json();
    const error = data?.error || null;
    return (
      <div>
        <h1>Error Getting topic: {error || "unknown error"}</h1>
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
