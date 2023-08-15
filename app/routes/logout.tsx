import {ActionFunction, LoaderFunction, redirect} from "@remix-run/node";
import {logout} from "~/util/session.server";

export var action: ActionFunction = async function ({request}) {
	return logout(request);
}

export var loader: LoaderFunction = async function () {
	return redirect("/");
}

