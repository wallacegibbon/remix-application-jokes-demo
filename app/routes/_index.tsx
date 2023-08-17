import {LinksFunction} from "@remix-run/node";
import {Link} from "@remix-run/react";
import styles_url from "~/styles/index.css";

export var links: LinksFunction = function () {
	return [{rel: "stylesheet", href: styles_url}];
}

export default function Index() {
	return <div className="container">
		<div className="content">
			<h1>Remix <span>Jokes!</span></h1>
			<nav>
				<ul>
					<li><Link to="jokes">Read Jokes</Link></li>
					<li><Link reloadDocument to="/jokes.rss">RSS</Link></li>
				</ul>
			</nav>
		</div>
	</div>;
}

