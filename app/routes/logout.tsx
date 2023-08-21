import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { logout } from "~/util/session.server";

export let action: ActionFunction = async function ({ request }) {
  return logout(request);
};

export let loader: LoaderFunction = async function () {
  return redirect("/");
};
