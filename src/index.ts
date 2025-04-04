import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";

import blogs from "./blogs";
import auth, { jwtService } from "./auth";

const app = new Elysia()
	.use(swagger())
	.use(cors())
	.group("/api", (app) =>
		app
			.get("/", () => "Hello Try-Z!")
			.use(auth)
			.use(blogs),
	)
	.listen(18122);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
