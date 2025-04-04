import { Elysia, t } from "elysia";
import { getConnection } from "../connection";
import { jwt } from "@elysiajs/jwt";

export const jwtService = new Elysia({ name: "jwtService" }).use(
	jwt({
		name: "jwt",
		secret: process.env.JWT_SECRET as string,
	}),
);

const auth = new Elysia().group("/auth", (app) =>
	app
		.use(jwtService)
		.get(
			"/",
			async ({ jwt, error, cookie: { token } }) => {
				try {
					const data = await jwt.verify(token.value);
					if (!data) return error(401, "Unauthorized");

					return data.username;
				} catch (e) {
					console.error(e);
					return error(500, "Internal Server Error");
				}
			},
			{
				cookie: t.Object({
					token: t.String(),
				}),
			},
		)
		.post(
			"/login",
			async ({ jwt, body: { username, password }, error }) => {
				try {
					const [user] = await getConnection().query(
						"SELECT * FROM users WHERE username=?",
						[username],
					);

					if (!user) return error(401, "Unauthorized");

					const { hashed_pwd } = user;
					const passwordMatched = await Bun.password.verify(
						password,
						hashed_pwd,
					);

					if (!passwordMatched) return error(401, "Unauthorized");

					const jwt_token = await jwt.sign({ username });
					return {
						token: jwt_token,
						expires_at: Date.now() + 400 * 86400000
					};
				} catch (e) {
					console.error(e);
					return error(500, "Internal Server Error");
				}
			},
			{
				body: t.Object({
					username: t.String(),
					password: t.String(),
				}),
			},
		),
);

export default auth;
