import { Elysia, t } from "elysia";
import { getConnection } from "../connection";
import { SnowflakeId } from "@akashrajpurohit/snowflake-id";
import { S3Client } from "bun";
import { jwtService } from "../auth";

const snowflake = SnowflakeId();
const client = new S3Client({
	accessKeyId: process.env.R2_ACCESS_KEY_ID,
	secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
	bucket: process.env.R2_BUCKET_NAME,
	endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
});

const postBlog = new Elysia().use(jwtService).post(
	"/",
	async ({
		jwt,
		body: { title, description, thumbnail, content },
		cookie: { token },
		error,
	}) => {
		try {
			if (!(await jwt.verify(token?.value ?? "")))
				return error(403, "Forbidden");

			const id = snowflake.generate();
			const timestamp = new Date();
			const timezoneOffset = new Date().getTimezoneOffset();
			timestamp.setMinutes(timestamp.getMinutes() + timezoneOffset);

			if (thumbnail) {
				if (thumbnail instanceof File)
				await client.write(`${id}-preview`, thumbnail, {
					type: thumbnail.type,
				});
			}

			await getConnection().query(
				"INSERT INTO blogs (id, title, description, timestamp, thumbnail) VALUES (?, ?, ?, ?, ?)",
				[
					id,
					title,
					description,
					timestamp,
					thumbnail ? `${process.env.R2_DOMAIN}/${id}-preview` : null,
				],
			);

			await getConnection().query(
				"INSERT INTO blogs_content (id, content) VALUES (?, ?)",
				[id, content],
			);

			return { id };
		} catch (e) {
			console.error(e);
			return error(500, "Internal Server Error");
		}
	},
	{
		body: t.Object({
			title: t.String(),
			description: t.String(),
			thumbnail: t.Optional(t.File()),
			content: t.String(),
		}),
		cookie: t.Object({
			token: t.Optional(t.String()),
		}),
	},
);

export default postBlog;
