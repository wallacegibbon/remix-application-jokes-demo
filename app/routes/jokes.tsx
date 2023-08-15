import {json, LinksFunction, LoaderFunction} from "@remix-run/node";
import {Link, Outlet, useLoaderData} from "@remix-run/react";
import {db} from "~/util/db.server";

import styles_url from "~/styles/jokes.css";

export var links: LinksFunction = function () {
	return [{rel: "stylesheet", href: styles_url}];
};

type LoaderData = {
	joke_list_items: Array<{id: string, name: string}>,
};

export var loader: LoaderFunction = async function () {
	return json<LoaderData>({
		joke_list_items: await db.joke.findMany({
			orderBy: {created_at: "desc"},
			select: {id: true, name: true},
			take: 5,
		}),
	});
};

function JokesRoute() {
	var data = useLoaderData<LoaderData>();

	return <div className="jokes-layout">
		<header className="jokes-header">
			<div className="container">
				<h1 className="home-link">
					<Link to="/" title="Remix Jokes" aria-label="Remix Jokes">
						<span className="logo">🤪</span>
						<span className="logo-medium">J🤪KES</span>
					</Link>
				</h1>
			</div>
		</header>
		<main className="jokes-main">
			<div className="container">
				<div className="jokes-list">
					<Link to=".">Get a random joke</Link>
					<p>Here are a few more jokes to check out:</p>
					<ul>
						{data.joke_list_items.map(function ({id, name}) {
							return <li key={id}>{name}</li>;
						})}
					</ul>
					<Link to="new" className="button">
						Add your own
					</Link>
				</div>
				<div className="jokes-outlet">
					<Outlet />
				</div>
			</div>
		</main>
	</div>;
}

export default JokesRoute;

