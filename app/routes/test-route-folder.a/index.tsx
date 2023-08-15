import {Outlet} from "@remix-run/react";
import InnerComponet from "./blah1";
import OutterComponet from "../test-route-folder.a.blah2";

function Index() {
	return <div>
		<span>{">>> "}</span><Outlet /><br /><br />
		<InnerComponet /><br />
		<OutterComponet /><br />
	</div>;
}

export default Index;

