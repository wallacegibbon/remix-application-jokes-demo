import { json, LoaderFunction } from "@remix-run/node";
import { isRouteErrorResponse, Link, useLoaderData, useRouteError } from "@remix-run/react";
import { Joke } from "@prisma/client";
import db from "~/util/db.server";

export let loader: LoaderFunction = async () => {
  let count = await db.joke.count();
  let random_num = Math.floor(Math.random() * count);
  let [joke] = await db.joke.findMany({ skip: random_num, take: 1 });
  if (!joke)
    throw new Response("No random joke found", { status: 404 });

  return json<Joke>(joke);
};

let JokesIndexRoute: React.FC = () => {
  let joke = useLoaderData<Joke>();
  return (
    <div>
      <p>Here's a random joke:</p>
      <p>{joke.content}</p>
      <Link to={joke.id}>"{joke.name}" Permalink</Link>
    </div>
  );
};

export default JokesIndexRoute;

export let ErrorBoundary = () => {
  let error = useRouteError();
  if (isRouteErrorResponse(error))
    return (
      <div className="error-container">
        <p>There are no jokes to display.</p>
        <Link to="new">Add your own</Link>
      </div>
    );

  return (
    <div className="error-container">
      I did a whoopsies.
    </div>
  );
};
