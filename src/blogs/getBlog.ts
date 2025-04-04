import { Elysia, t } from "elysia";
import { getConnection } from "../connection";

const getBlog = new Elysia().get(
	"/:id",
	async ({ params: { id }, error }) => {
		try {
			const [blog] = await getConnection().query(
				"SELECT * FROM blogs NATURAL JOIN blogs_content WHERE blogs.id=?",
				[id],
			);

			return blog ?? error(404, "Not Found");
		} catch (e) {
			console.error(e);
			return error(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			id: t.String(),
		}),
	},
);

export default getBlog;
