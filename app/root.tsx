import { json, LinksFunction, LoaderFunction, V2_MetaFunction } from "@remix-run/node";
import { isRouteErrorResponse, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useRouteError } from "@remix-run/react";
import { get_env } from "./env.server";
import type { PropsWithChildren } from "react";
import global_large_styles_url from "~/styles/global-large.css";
import global_medium_styles_url from "~/styles/global-medium.css";
import global_styles_url from "~/styles/global.css";

export var links: LinksFunction = function () {
  return [
    { rel: "stylesheet", href: global_styles_url },
    { rel: "stylesheet", href: global_medium_styles_url, media: "print, (min-width: 640px)" },
    { rel: "stylesheet", href: global_large_styles_url, media: "print, (min-width: 1024px)" },
  ];
}

export var meta: V2_MetaFunction = function () {
  var description = "Learn Remix and laugh at the same time!";
  return [
    { name: "description", content: description },
    { name: "twitter:description", content: description },
    { title: "Remix: So great, it's funny!" },
  ];
}

type LoaderData = {
  ENV: ReturnType<typeof get_env>,
};

export var loader: LoaderFunction = async function () {
  return json<LoaderData>({
    ENV: get_env(),
  });
}

function Document({ children, title }: PropsWithChildren<{ title?: string }>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="keywords" content="Remix,jokes" />
        <meta name="twitter:image" content="https://remix-jokes.lol/social.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@remix_run" />
        <meta name="twitter:site" content="@remix_run" />
        <meta name="twitter:title" content="Remix Jokes" />
        <Meta />
        {title && <title>{title}</title>}
        <Links />
      </head>
      <body>
        <Scripts />
        {children}
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  var data = useLoaderData();
  return (
    <Document>
      <Outlet />
      <ScrollRestoration />
      <script dangerouslySetInnerHTML={{ __html: `window.ENV = ${JSON.stringify(data.ENV)}` }} />
    </Document>
  );
}

export function ErrorBoundary() {
  var error = useRouteError();

  if (isRouteErrorResponse(error))
    return (
      <Document title={`${error.status} ${error.statusText}`}>
        <div className="error-container">
          <h1>{error.status} {error.statusText}</h1>
        </div>
      </Document>
    );

  var error_message = error instanceof Error ? error.message : "unknown error";
  return (
    <Document title="Oops">
      <div className="error-container">
        <h1>App Error</h1>
        <pre>{error_message}</pre>
      </div>
    </Document>
  );
}

