import {Outlet} from "@remix-run/react";
//import InnerComponet from "./blah1";
//import OutterComponet from "../test-route-folder.a.blah2";

export default function Index() {
	return <span>a <Outlet /></span>;
}

