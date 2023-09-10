import {PassThrough} from "node:stream";
import type {AppLoadContext, EntryContext} from "@remix-run/node";
import {Response} from "@remix-run/node";
import {RemixServer} from "@remix-run/react";
import isbot from "isbot";
import {renderToPipeableStream} from "react-dom/server";
import {get_env} from "./env.server";

global.ENV = get_env();

let ABORT_DELAY = 5_000;

let handle_request = (req: Request, status: number, resp_headers: Headers, ctx: EntryContext, _: AppLoadContext) =>
  isbot(req.headers.get("user-agent"))
    ? handle_bot_request(req, status, resp_headers, ctx)
    : handle_browser_request(req, status, resp_headers, ctx);

export default handle_request;

let handle_bot_request = (req: Request, status: number, resp_headers: Headers, ctx: EntryContext) => {
  let shell_rendered = false;
  return new Promise((resolve, reject) => {
    let {pipe, abort} = renderToPipeableStream(
      <RemixServer context={ctx} url={req.url} abortDelay={ABORT_DELAY} />,
      {
        onAllReady() {
          shell_rendered = true;
          let body = new PassThrough();
          resp_headers.set("Content-Type", "text/html");
          resolve(new Response(body, {headers: resp_headers, status: status}));
          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          status = 500;
          if (shell_rendered) {
            console.error(error);
          }
        },
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
};

let handle_browser_request = (req: Request, status: number, resp_headers: Headers, ctx: EntryContext) => {
  let shell_rendered = false;
  return new Promise((resolve, reject) => {
    let {pipe, abort} = renderToPipeableStream(
      <RemixServer context={ctx} url={req.url} abortDelay={ABORT_DELAY} />,
      {
        onShellReady() {
          shell_rendered = true;
          let body = new PassThrough();
          resp_headers.set("Content-Type", "text/html");
          resolve(new Response(body, {headers: resp_headers, status: status}));
          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          status = 500;
          if (shell_rendered) {
            console.error(error);
          }
        },
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
};
