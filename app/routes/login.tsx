import {ActionFunction, LinksFunction} from "@remix-run/node";
import {Link, useActionData, useSearchParams} from "@remix-run/react";
import {db} from "~/util/db.server";
import {bad_request} from "~/util/request.server";
import styles_url from "~/styles/login.css";
import {create_user_session, login, register} from "~/util/session.server";
import {User} from "@prisma/client";

export var links: LinksFunction = function () {
	return [{rel: "stylesheet", href: styles_url}];
};

export var action: ActionFunction = async function ({request}) {
	var form = await request.formData();
	var login_type = form.get("login_type");
	var password = form.get("password");
	var username = form.get("username");
	var redirect_to = validate_url((form.get("redirect_to") as string) || "/jokes");
	if (typeof login_type !== "string" || typeof password !== "string" || typeof username !== "string")
		return bad_request({field_errors: null, fields: null, form_error: null});

	var fields = {login_type, password, username};
	var field_errors = {
		username: validate_username(username),
		password: validate_password(password),
	};

	if (Object.values(field_errors).some(Boolean))
		return bad_request({field_errors, fields, form_error: null});

	var user: Pick<User, "username" | "id"> | undefined | null;

	switch (login_type) {
		case "login":
			user = await login({username, password});
			if (!user)
				return bad_request({field_errors: null, fields, form_error: "username/password combination is incorrect"});

			return create_user_session(user.id, redirect_to);
		case "register":
			var user_exists = await db.user.findFirst({where: {username}});
			if (user_exists)
				return bad_request({field_errors: null, fields, form_error: `User with username ${username} already exists`});

			user = await register({username, password});
			if (!user)
				return bad_request({field_errors: null, fields, form_error: "error when creating new user"});

			return create_user_session(user.id, redirect_to)
		default:
			return bad_request({field_errors: null, fields, form_error: "invalid login type"});
	}
};


function validate_username(username: string) {
	if (username.length < 3)
		return "Usernames must be at least 3 characters long";
}

function validate_password(password: string) {
	if (password.length < 6)
		return "Passwords must be at least 6 characters long";
}

function validate_url(url: string) {
	var urls = ["/jokes", "/", "https://remix.run"];
	if (urls.includes(url)) return url;
	return "/jokes";
}

function Login() {
	var action_data = useActionData();
	var [search_params] = useSearchParams();

	var form_content = <>
		<input type="hidden" name="redirect_to" value={search_params.get("redirect_to") ?? undefined} />
		<fieldset>
			<legend className="sr-only">Login or Register?</legend>
			<label>
				<input type="radio" name="login_type" value="login" defaultChecked={
					action_data?.fields?.login_type === "login"
				} />
				Login
			</label>
			<label>
				<input type="radio" name="login_type" value="register" defaultChecked={
					action_data?.fields?.login_type === "register"
				} />
				Register
			</label>
		</fieldset>
		<div>
			<label htmlFor="username-input">Username</label>
			<input type="text" id="username-input" name="username"
				defaultValue={action_data?.fields?.username}
				aria-invalid={Boolean(action_data?.field_errors?.username)}
				aria-errormessage={action_data?.field_errors?.username ? "username-error" : undefined}
			/>
			{action_data?.field_errors?.username && <p className="form-validation-error" role="alert" id="username-error">
				{action_data.field_errors.username}
			</p>}
		</div>
		<div>
			<label htmlFor="password-input">Password</label>
			<input id="password-input" name="password" type="password"
				defaultValue={action_data?.fields?.password}
				aria-invalid={Boolean(action_data?.field_errors?.password)}
				aria-errormessage={action_data?.field_errors?.password ? "password-error" : undefined}
			/>
			{action_data?.field_errors?.password && <p className="form-validation-error" role="alert" id="password-error">
				{action_data.field_errors.password}
			</p>}
		</div>
		<div id="form-error-message">
			{action_data?.form_error && <p className="form-validation-error" role="alert">
				{action_data.form_error}
			</p>}
		</div>
		<button type="submit" className="button">
			Submit
		</button>
	</>;

	return <div className="container">
		<div className="content" data-light="">
			<h1>Login</h1>
			<form method="post">{form_content}</form>
		</div>
		<div className="links">
			<ul>
				<li><Link to="/">Home</Link></li>
				<li><Link to="/jokes">Jokes</Link></li>
			</ul>
		</div>
	</div>;
}

export default Login;

