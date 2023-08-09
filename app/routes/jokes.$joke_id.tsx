import {useLoaderData} from "@remix-run/react";
import {LoaderFunction} from "react-router";

export var loader: LoaderFunction = async function ({ params }) {
	console.log(">>>", params);
	return "hello";
};

function JokeIdRoute() {
	var data = useLoaderData();
	return <div>
		<div>{JSON.stringify(data)}</div>
	</div>;
}

export default JokeIdRoute;

