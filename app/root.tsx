import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinkDescriptor } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";

export function links(): Array<LinkDescriptor> {
	return [
		...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
	];
}

function App() {
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
			<LiveReload />
		</body>
	</html>;
}

export default App;

