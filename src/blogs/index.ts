import { Elysia } from "elysia";
import getBlogs from "./getBlogs";
import getBlog from "./getBlog";
import postBlog from "./postBlog";
import updateBlog from "./updateBlog";

const blogs = new Elysia().group("/blogs", (app) =>
	app.use(getBlogs).use(getBlog).use(postBlog).use(updateBlog),
);

export default blogs;
