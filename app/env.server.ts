import invariant from "tiny-invariant";

export function get_env() {
	invariant(process.env.ADMIN_EMAIL, "ADMIN_EMAIL should be defined");

	return {
		ADMIN_EMAIL: process.env.ADMIN_EMAIL,
	};
}

export type ENV = ReturnType<typeof get_env>;

declare global {
	var ENV: ENV;
	interface Window {
		ENV: ENV;
	}
}

