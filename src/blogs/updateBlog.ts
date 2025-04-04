import { Elysia, t } from "elysia";
import { getConnection } from "../connection";
import { S3Client } from "bun";
import { jwtService } from "../auth";

const client = new S3Client({
	accessKeyId: process.env.R2_ACCESS_KEY_ID,
	secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
	bucket: process.env.R2_BUCKET_NAME,
	endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
});

const updateBlog = new Elysia().use(jwtService).post(
	"/:id",
	async ({
		jwt,
        params: { id },
		body: { title, description, thumbnail, content, deleteImage },
		cookie: { token },
		error,
	}) => {
		try {
			if (!(await jwt.verify(token?.value ?? "")))
				return error(403, "Forbidden");

			if (thumbnail?.size) {
				await client.write(`${id}-preview`, thumbnail, {
					type: thumbnail.type,
				});

                await getConnection().query(
                    "UPDATE blogs SET title=?, description=?, thumbnail=? WHERE id=?",
                    [
                        title,
                        description,
                        `${process.env.R2_DOMAIN}/${id}-preview`,
                        id,
                    ],
                );
			}

            if (!thumbnail?.size && deleteImage === "true") {
                await getConnection().query(
                    "UPDATE blogs SET title=?, description=?, thumbnail=? WHERE id=?",
                    [
                        title,
                        description,
                        null,
                        id,
                    ],
                );
            }

            if (!thumbnail?.size && deleteImage === "false") {
                await getConnection().query(
                    "UPDATE blogs SET title=?, description=? WHERE id=?",
                    [
                        title,
                        description,
                        id,
                    ],
                );
            }

			await getConnection().query(
				"UPDATE blogs_content SET content=? WHERE id=?",
				[content, id],
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
            deleteImage: t.Optional(t.String())
		}),
		cookie: t.Object({
			token: t.Optional(t.String()),
		}),
	},
);

export default updateBlog;
