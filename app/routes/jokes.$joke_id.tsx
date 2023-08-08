import {LoaderFunction} from "react-router";

export var loader: LoaderFunction = async function ({ params }) {
	console.log(">>>", params);
	return "hello";
};

function JokeIdRoute() {
	return <div>
		<div>nothing yet.</div>
	</div>;
}

export default JokeIdRoute;

