import {LinksFunction} from "@remix-run/node"
import {Link} from "@remix-run/react"
import styles_url from "~/styles/index.css"

export let links: LinksFunction = () => [
  {rel: "stylesheet", href: styles_url},
]

let Index: React.FC = () => {
  return (
    <div className="container">
      <div className="content">
        <h1>Remix <span>Jokes!</span></h1>
        <nav>
          <ul>
            <li><Link to="jokes">Read Jokes</Link></li>
            <li><Link reloadDocument to="/jokes.rss">RSS</Link></li>
          </ul>
        </nav>
      </div>
    </div>
  )
}

export default Index
