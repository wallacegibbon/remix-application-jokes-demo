import { Joke } from "@prisma/client";
import { Form, Link } from "@remix-run/react";

type JokeDisplayProps = {
  joke: Pick<Joke, "content" | "name">,
  is_owner: boolean,
  can_delete?: boolean,
};

export function JokeDisplay({ joke, is_owner, can_delete = true }: JokeDisplayProps) {
  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{joke.content}</p>
      <Link to=".">"{joke.name}" Permalink</Link>
      {is_owner && (
        <Form method="post">
          <button className="button" disabled={!can_delete} name="intent" type="submit" value="delete">Delete</button>
        </Form>
      )}
    </div>
  );
}
