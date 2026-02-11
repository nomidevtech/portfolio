import { adminLoginCheck } from "@/app/Lib/adminLoginCheck";
import { db } from "@/app/Lib/turso";
import Form from "next/form";
import Image from "next/image";
import { redirect } from "next/navigation";
import editServerAction from "./editServerAction";

export default async function EditPost({ params }) {
  const isAdmin = await adminLoginCheck();
  if (!isAdmin.ok) redirect("/login");

  try {
    const { id, slug } = await params;

    const result = await db.execute(
      `
      SELECT
          posts.*,
          users.username AS author_name,
          taxonomies.name AS taxonomy_name,
          GROUP_CONCAT(DISTINCT tags.name) AS tag_names
      FROM posts
      LEFT JOIN users ON posts.user_id = users.id
      LEFT JOIN post_taxonomies ON post_taxonomies.post_id = posts.id
      LEFT JOIN taxonomies ON post_taxonomies.taxonomy_id = taxonomies.id
      LEFT JOIN post_tags ON post_tags.post_id = posts.id
      LEFT JOIN tags ON post_tags.tag_id = tags.id
      WHERE posts.id = ?
      GROUP BY posts.id
      `,
      [id]
    );

    const postData = result.rows[0];

    if (!postData) {
      return (
        <div className="max-w-3xl mx-auto mt-16 p-6 rounded-2xl bg-red-50 text-red-700 border border-red-200">
          <h2 className="text-xl font-semibold">Post not found</h2>
        </div>
      );
    }

    const content = JSON.parse(postData.content);

    return (
      <div className="max-w-4xl mx-auto mt-10 mb-20 p-8 rounded-2xl bg-white shadow-lg border border-gray-200">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
          <p className="text-sm text-gray-500 mt-1">
            Post ID: <span className="font-semibold">{postData.id}</span> • Author:{" "}
            <span className="font-semibold">{postData.author_name}</span>
          </p>
        </div>

        <Form className="space-y-8" action={editServerAction}>

          {/* post */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Post ID
            </label>
            <input
              type="text"
              name="postId"
              defaultValue={postData.id}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              readOnly
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              defaultValue={postData.title}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter post title..."
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Slug
            </label>
            <input
              type="text"
              name="slug"
              defaultValue={postData.slug}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter slug..."
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Excerpt
            </label>
            <textarea
              name="excerpt"
              defaultValue={postData.excerpt}
              rows={4}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Write excerpt..."
            />
          </div>

          {/* Tags + Taxonomy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                defaultValue={postData.tag_names}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="tag1, tag2, tag3"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Taxonomy / Category
              </label>
              <input
                type="text"
                name="taxonomy"
                defaultValue={postData.taxonomy_name}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Category..."
              />
            </div>

          </div>

          {/* Content Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Post Content</h2>
              <p className="text-sm text-gray-500">
                Blocks: <span className="font-semibold">{content.length}</span>
              </p>
            </div>

            <div className="space-y-6 max-h-125 overflow-y-auto border border-gray-200 rounded-2xl p-6 bg-gray-50">
              {content.map((p, index) => {
                if (p.type === "heading") {
                  return (
                    <div key={index} className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wide text-gray-600">
                        Heading Block #{index + 1}
                      </label>
                      <input
                        type="text"
                        name={`heading${index}`}
                        defaultValue={p.value}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  );
                }

                if (p.type === "paragraph") {
                  return (
                    <div key={index} className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wide text-gray-600">
                        Paragraph Block #{index + 1}
                      </label>
                      <textarea
                        name={`paragraph${index}`}
                        defaultValue={p.value}
                        rows={5}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  );
                }

                if (p.type === "image") {
                  return (
                    <div
                      key={index}
                      className="space-y-3 border border-gray-200 rounded-2xl bg-white p-4 shadow-sm"
                    >
                      <label className="block text-xs font-bold uppercase tracking-wide text-gray-600">
                        Image Block #{index + 1}
                      </label>

                      <div className="rounded-xl overflow-hidden border border-gray-200">
                        <Image
                          src={p.url}
                          alt="Post image"
                          width={900}
                          height={500}
                          className="w-full h-auto object-cover"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Image URL Note* replace with new image url
                        </label>
                        <input
                          type="text"
                          name={`image_url${index}`}
                           defaultValue={JSON.stringify({ url: p.url, publicId: p.publicId })}
                          className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Cloudinary Public ID for current image.
                        </label>
                        <input
                          type="text"
                          name={`publicId`}
                          defaultValue={p.publicId}
                          className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>



                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-800"
                  >
                    Unknown block type: <b>{p.type}</b>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="reset"
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
            >
              Reset
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition"
            >
              Save Changes
            </button>
          </div>
        </Form>
      </div>
    );
  } catch (err) {
    console.log(err);

    return (
      <div className="max-w-3xl mx-auto mt-16 p-6 rounded-2xl bg-red-50 text-red-700 border border-red-200">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="mt-2 text-sm">Post was not found or query failed.</p>
      </div>
    );
  }
}