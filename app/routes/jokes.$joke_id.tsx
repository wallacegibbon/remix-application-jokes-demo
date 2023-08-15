import {Link, useLoaderData} from "@remix-run/react";
import {json, LoaderFunction} from "@remix-run/node";
import {Joke} from "@prisma/client";
import {db} from "~/util/db.server";

export var loader: LoaderFunction = async function ({params}) {
	var joke = await db.joke.findUnique({where: {id: params.joke_id}});
	if (!joke)
		throw new Error("joke not found");
	return json<Joke>(joke);
};

function JokeIdRoute() {
	var joke = useLoaderData<Joke>();
	return <div>
		<p>Here's your hilarious joke:</p>
		<p>{joke.content}</p>
		<Link to=".">"{joke.name}" Permalink</Link>
	</div>;
}

export default JokeIdRoute;

