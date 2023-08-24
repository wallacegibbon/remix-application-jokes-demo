import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { Form, isRouteErrorResponse, Link, useActionData, useNavigation, useRouteError } from "@remix-run/react";
import { JokeDisplay } from "~/components/joke";
import { db } from "~/util/db.server";
import { bad_request } from "~/util/request.server";
import { get_user_id, require_user_id } from "~/util/session.server";

export let loader: LoaderFunction = async ({ request }) => {
  let user_id = await get_user_id(request);
  if (!user_id)
    throw new Response("Unauthorized", { status: 401 });

  return json({});
};

let validate_joke_content = (content: string) => {
  if (content.length < 10) return "That joke is too short";
};

let validate_joke_name = (name: string) => {
  if (name.length < 3) return "That joke's name is too short";
};

export let action: ActionFunction = async ({ request }) => {
  let user_id = await require_user_id(request);
  let form = await request.formData();
  let name = form.get("name");
  let content = form.get("content");

  if (typeof content !== "string" || typeof name !== "string")
    throw new Error("form not submitted correctly");

  let fields = { name, content };
  let field_errors = {
    name: validate_joke_name(name),
    content: validate_joke_content(content),
  };
  if (Object.values(field_errors).some(Boolean))
    return bad_request({ fields, field_errors, form_error: null });

  let joke = await db.joke.create({ data: { ...fields, jokester_id: user_id } });
  return redirect(`/jokes/${joke.id}`);
};

let NewJokeRoute: React.FC = () => {
  let action_data = useActionData<typeof action>();
  let navigation = useNavigation();

  if (navigation.formData) {
    let content = navigation.formData.get("content");
    let name = navigation.formData.get("name");
    if (
      typeof content === "string" && typeof name === "string" &&
      !validate_joke_content(content) && !validate_joke_name(name)
    ) {
      return (
        <JokeDisplay can_delete={false} is_owner={true} joke={{ name, content }} />
      );
    }
  }

  return (
    <div>
      <p>Add your own hilarious joke</p>
      <Form method="post">
        <div>
          <label>
            Name:
            <input type="text" name="name" defaultValue={action_data?.fields?.name}
              aria-invalid={Boolean(action_data?.field_errors?.name)}
              aria-errormessage={action_data?.field_errors?.name ? "name-error" : undefined}
            />
          </label>
          {action_data?.field_errors?.name && (
            <p className="form-validation-error" id="name-error" role="alert" >
              {action_data.field_errors.name}
            </p>
          )}
        </div>
        <div>
          <label>
            Content:
            <textarea name="content" defaultValue={action_data?.fields?.content}
              aria-invalid={Boolean(action_data?.field_errors?.content)}
              aria-errormessage={action_data?.field_errors?.content ? "content-error" : undefined}
            />
          </label>
          {action_data?.field_errors?.content && (
            <p className="form-validation-error" id="content-error" role="alert">
              {action_data.field_errors.content}
            </p>
          )}
        </div>
        {action_data?.form_error && (
          <p className="form-validation-error" role="alert">
            {action_data.form_error}
          </p>
        )}
        <div>
          <button type="submit" className="button">Add</button>
        </div>
      </Form>
    </div>
  );
};

export default NewJokeRoute;

export let ErrorBoundary = () => {
  let error = useRouteError();

  if (isRouteErrorResponse(error))
    return (
      <div className="error-container">
        <p>You must be logged in to create a joke.</p>
        <Link to="/login">Login</Link>
      </div>
    );

  return (
    <div className="error-container">
      Something unexpected went wrong. Sorry about that.
    </div>
  );
};
