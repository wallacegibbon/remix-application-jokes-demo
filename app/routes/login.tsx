import {ActionFunction, LinksFunction, V2_MetaFunction} from "@remix-run/node";
import {Form, Link, useActionData, useSearchParams} from "@remix-run/react";
import db from "~/util/db.server";
import {bad_request} from "~/util/request.server";
import styles_url from "~/styles/login.css";
import {create_user_session, login, register} from "~/util/session.server";

export let links: LinksFunction = () => [
  {rel: "stylesheet", href: styles_url},
];

export let meta: V2_MetaFunction = () => {
  let description = "Login to submit your own jokes to Remix Jokes!";
  return [
    {name: "description", content: description},
    {name: "twitter:description", content: description},
    {title: "Remix Jokes | Login"},
  ];
};

export let action: ActionFunction = async ({request}) => {
  let form = await request.formData();
  let login_type = form.get("login_type");
  let password = form.get("password");
  let username = form.get("username");
  let redirect_to = validate_url(form.get("redirect_to") as string);
  if (typeof login_type !== "string" || typeof password !== "string" || typeof username !== "string")
    return bad_request({field_errors: null, fields: null, form_error: null});

  let fields = {login_type, password, username};
  let field_errors = {
    username: validate_username(username),
    password: validate_password(password),
  };

  if (Object.values(field_errors).some(Boolean))
    return bad_request({field_errors, fields, form_error: null});

  switch (login_type) {
    case "login": {
      let user = await login({username, password});
      if (!user)
        return bad_request({
          field_errors: null,
          fields,
          form_error: "username/password combination is incorrect",
        });

      return create_user_session(user.id, redirect_to);
    }

    case "register": {
      let user_exists = await db.user.findFirst({where: {username}});
      if (user_exists)
        return bad_request({
          field_errors: null,
          fields,
          form_error: `User with username ${username} already exists`,
        });

      let user = await register({username, password});
      if (!user)
        return bad_request({
          field_errors: null,
          fields,
          form_error: "error when creating new user",
        });

      return create_user_session(user.id, redirect_to);
    }

    default:
      return bad_request({
        field_errors: null,
        fields,
        form_error: "invalid login type",
      });
  }
};

let validate_username = (username: string) => {
  if (username.length < 3)
    return "Usernames must be at least 3 characters long";
};

let validate_password = (password: string) => {
  if (password.length < 6)
    return "Passwords must be at least 6 characters long";
};

let validate_url = (url: string) => {
  let urls = ["/jokes", "/", "https://remix.run"];
  if (urls.includes(url)) return url;
  return "/jokes";
};

let Login: React.FC = () => {
  let action_data = useActionData<typeof action>();
  let [search_params, _] = useSearchParams();

  return (
    <div className="container">
      <div className="content" data-light="">
        <h1>Login</h1>
        <Form method="post">
          <input type="hidden" name="redirect_to" value={search_params.get("redirect_to") ?? undefined} />
          <fieldset>
            <legend className="sr-only">Login or Register?</legend>
            <label>
              <input type="radio" name="login_type" value="login"
                defaultChecked={action_data?.fields?.login_type !== "register"}
              />
              Login
            </label>
            <label>
              <input type="radio" name="login_type" value="register"
                defaultChecked={action_data?.fields?.login_type === "register"}
              />
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
            {action_data?.field_errors?.username && (
              <p className="form-validation-error" role="alert" id="username-error">
                {action_data.field_errors.username}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="password-input">Password</label>
            <input id="password-input" name="password" type="password"
              defaultValue={action_data?.fields?.password}
              aria-invalid={Boolean(action_data?.field_errors?.password)}
              aria-errormessage={action_data?.field_errors?.password ? "password-error" : undefined}
            />
            {action_data?.field_errors?.password && (
              <p className="form-validation-error" role="alert" id="password-error">
                {action_data.field_errors.password}
              </p>
            )}
          </div>
          <div id="form-error-message">
            {action_data?.form_error && (
              <p className="form-validation-error" role="alert">
                {action_data.form_error}
              </p>
            )}
          </div>
          <button type="submit" className="button">
            Submit
          </button>
        </Form>
      </div>
      <div className="links">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/jokes">Jokes</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Login;
