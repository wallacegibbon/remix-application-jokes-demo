import {db} from "./db.server";
import bcrypt from "bcryptjs";
import {createCookieSessionStorage, redirect} from "@remix-run/node";

type LoginForm = {username: string, password: string};

export async function register({password, username}: LoginForm) {
	var password_hash = await bcrypt.hash(password, 10);
	var user = await db.user.create({data: {password_hash, username}});
	return {id: user.id, username};
}

export async function login({username, password}: LoginForm) {
	var user = await db.user.findUnique({where: {username}});
	if (!user) return null;
	var is_correct_password = await bcrypt.compare(password, user.password_hash);
	if (!is_correct_password) return;
	return {id: user.id, username};
}

var session_secret = process.env.SESSION_SECRET;
if (!session_secret)
	throw new Error("SESSION_SECRET must be set");

var storage = createCookieSessionStorage({
	cookie: {
		name: "remix_jokes_session",
		secure: process.env.NODE_ENV === "production",
		secrets: [session_secret],
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 30,
		httpOnly: true,
	},
});

function get_user_session(request: Request) {
	return storage.getSession(request.headers.get("cookie"));
}

export async function get_user_id(request: Request) {
	var session = await get_user_session(request);
	var user_id = session.get("user_id");
	if (!user_id || typeof user_id !== "string") return null;
	return user_id;
}

export async function require_user_id(request: Request, redirect_to: string = new URL(request.url).pathname) {
	var session = await get_user_session(request);
	var user_id = session.get("user_id");
	if (!user_id || typeof user_id !== "string") {
		var search_params = new URLSearchParams([["redirect_to", redirect_to]]);
		throw redirect(`/login?${search_params}`);
	}
	return user_id;
}

export async function get_user(request: Request) {
	var user_id = await get_user_id(request);
	if (typeof user_id !== "string") return null;

	var user = await db.user.findUnique({
		select: {id: true, username: true},
		where: {id: user_id},
	});

	if (!user) throw await logout(request);

	return user;
}

export async function logout(request: Request) {
	var session = await get_user_session(request);
	return redirect("/login", {headers: {"set-cookie": await storage.destroySession(session)}});
}

export async function create_user_session(user_id: string, redirect_to: string) {
	var session = await storage.getSession();
	session.set("user_id", user_id);
	return redirect(redirect_to, {headers: {"set-cookie": await storage.commitSession(session)}});
}

