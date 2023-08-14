import { json, LinksFunction, LoaderFunction } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import { get_env } from "./env.server";

import global_large_styles_url from "~/styles/global-large.css";
import global_medium_styles_url from "~/styles/global-medium.css";
import global_styles_url from "~/styles/global.css";

export var links: LinksFunction = function () {
	return [
		{ rel: "stylesheet", href: global_styles_url },
		{ rel: "stylesheet", href: global_medium_styles_url, media: "print, (min-width: 640px)" },
		{ rel: "stylesheet", href: global_large_styles_url, media: "print, (min-width: 1024px)" },
	];
};

type LoaderData = {
	ENV: ReturnType<typeof get_env>,
};

export var loader: LoaderFunction = async function (_) {
	return json<LoaderData>({
		ENV: get_env(),
	});
};

function App() {
	var data = useLoaderData();
	return <html lang="en">
		<head>
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width,initial-scale=1" />
			<Meta />
			<Links />
		</head>
		<body>
			<Outlet />
			<ScrollRestoration />
			<Scripts />
			<script dangerouslySetInnerHTML={{
				__html: `window.ENV = ${JSON.stringify(data.ENV)}`
			}} />
			<LiveReload />
		</body>
	</html>;
}

export default App;

