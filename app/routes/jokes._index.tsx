import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Joke } from "@prisma/client";
import { db } from "~/util/db.server";

export var loader: LoaderFunction = async function () {
	var count = await db.joke.count();
	var random_num = Math.floor(Math.random() * count);
	var [ joke ] = await db.joke.findMany({ skip: random_num, take: 1 });
	return json<Joke>(joke);
};

function JokesIndexRoute() {
	var joke = useLoaderData<Joke>();
	return <div>
		<p>Here's a random joke:</p>
		<p>{joke.content}</p>
		<Link to={joke.id}>"{joke.name}" Permalink</Link>
	</div>;
}

export default JokesIndexRoute;

