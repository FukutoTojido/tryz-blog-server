import { Elysia, t } from "elysia";
import { getConnection } from "../connection";

const getBlogs = new Elysia().get(
	"/",
	async ({ query: { offset }, error }) => {
		try {
			const blogs = await getConnection().query(
				"SELECT * FROM blogs ORDER BY timestamp DESC LIMIT ?, ?",
				[(offset ?? 0) * 5, (offset ?? 0) * 5 + 5],
			);

            return blogs;
		} catch (e) {
			console.error(e);
			return error(500, "Internal Server Error");
		}
	},
	{
		query: t.Object({
			offset: t.Optional(t.Number()),
		}),
	},
);

export default getBlogs;
