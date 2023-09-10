import db from "~/util/db.server";
import bcrypt from "bcryptjs";
import {createCookieSessionStorage, redirect} from "@remix-run/node";

type LoginForm = {username: string, password: string;};

export let register = async ({password, username}: LoginForm) => {
  let password_hash = await bcrypt.hash(password, 10);
  let user = await db.user.create({data: {password_hash, username}});
  return {id: user.id, username};
};

export let login = async ({username, password}: LoginForm) => {
  let user = await db.user.findUnique({where: {username}});
  if (!user) {return null;}
  let is_correct_password = await bcrypt.compare(password, user.password_hash);
  if (!is_correct_password) {return;}
  return {id: user.id, username};
};

let session_secret = process.env.SESSION_SECRET;
if (!session_secret) {
  throw new Error("SESSION_SECRET must be set");
}

let storage = createCookieSessionStorage({
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

export let get_user_session = (request: Request) => {
  return storage.getSession(request.headers.get("cookie"));
};

export let get_user_id = async (request: Request) => {
  let session = await get_user_session(request);
  let user_id = session.get("user_id");
  if (!user_id || typeof user_id !== "string") {return null;}
  return user_id;
};

export let require_user_id = async (request: Request, redirect_to: string = new URL(request.url).pathname) => {
  let session = await get_user_session(request);
  let user_id = session.get("user_id");
  if (!user_id || typeof user_id !== "string") {
    let search_params = new URLSearchParams([["redirect_to", redirect_to]]);
    throw redirect(`/login?${search_params}`);
  }
  return user_id;
};

export let get_user = async (request: Request) => {
  let user_id = await get_user_id(request);
  if (typeof user_id !== "string") {return null;}

  let user = await db.user.findUnique({
    select: {id: true, username: true},
    where: {id: user_id},
  });

  if (!user) {throw await logout(request);}
  return user;
};

export let logout = async (request: Request) => {
  let session = await get_user_session(request);
  return redirect("/login", {headers: {"set-cookie": await storage.destroySession(session)}});
};

export let create_user_session = async (user_id: string, redirect_to: string) => {
  let session = await storage.getSession();
  session.set("user_id", user_id);
  return redirect(redirect_to, {headers: {"set-cookie": await storage.commitSession(session)}});
};
