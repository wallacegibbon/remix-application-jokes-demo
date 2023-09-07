import {isRouteErrorResponse, useLoaderData, useParams, useRouteError} from "@remix-run/react"
import {ActionFunction, json, LoaderFunction, redirect, V2_MetaFunction} from "@remix-run/node"
import {Joke} from "@prisma/client"
import db from "~/util/db.server"
import {get_user_id, require_user_id} from "~/util/session.server"
import {JokeDisplay} from "~/components/joke"

export let meta: V2_MetaFunction = ({data}) => {
  let {description, title} = data
    ? {description: `Enjoy the "${data.joke.name}" joke and much more`, title: `"${data.joke.name}" joke`}
    : {description: "No joke found", title: "No joke"}

  return [
    {name: "description", content: description},
    {name: "twitter:description", content: description},
    {title},
  ]
}

type LoaderData = {
  joke: Joke,
  is_owner: boolean,
}

export let loader: LoaderFunction = async ({params, request}) => {
  let user_id = await get_user_id(request)
  let joke = await db.joke.findUnique({where: {id: params.joke_id}})
  if (!joke) {
    throw new Response("joke is not found", {status: 400})
  }
  return json<LoaderData>({
    joke,
    is_owner: user_id === joke.jokester_id,
  })
}

export let action: ActionFunction = async ({params, request}) => {
  let form = await request.formData()
  let intent = form.get("intent")
  if (intent !== "delete") {
    throw new Response(`The intent ${intent} is not supported`, {status: 404})
  }
  let user_id = await require_user_id(request)
  let joke = await db.joke.findUnique({where: {id: params.joke_id}})
  if (!joke) {
    throw new Response("Can't delete what does not exist", {status: 404})
  }
  if (joke.jokester_id !== user_id) {
    throw new Response("Pssh, nice try. That's not your joke", {status: 403})
  }
  await db.joke.delete({where: {id: params.joke_id}})
  return redirect("/jokes")
}

let JokeIdRoute: React.FC = () => {
  let data = useLoaderData<LoaderData>()
  return <JokeDisplay is_owner={data.is_owner} joke={data.joke} />
}

export default JokeIdRoute

export let ErrorBoundary = () => {
  let {joke_id} = useParams()
  let error = useRouteError()

  if (isRouteErrorResponse(error)) {
    if (error.status === 400) {
      return <div className="error-container">What you are trying to do is not allowed.</div>
    } else if (error.status === 403) {
      return <div className="error-container">Sorry, but "{joke_id}" is not your joke.</div>
    } else if (error.status === 404) {
      return <div className="error-container">Huh? What the heck is "{joke_id}"?</div>
    }
  }

  return (
    <div className="error-container">
      There was an error loading joke by the id "{joke_id}". Sorry.
    </div>
  )
}

