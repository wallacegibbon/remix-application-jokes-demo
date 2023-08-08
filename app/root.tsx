import { cssBundleHref } from "@remix-run/css-bundle";
import { json, LinkDescriptor, LoaderFunction } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import {get_env} from "./env.server";

export function links(): Array<LinkDescriptor> {
	return [
		...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
	];
}

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

