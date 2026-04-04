import Form from "next/form";

export default function UpdateOrDeleteComment({ comment, cPId, pPId, uPId }) {


  const comment_public_id = cPId;
  const post_public_id = pPId;
  const user_public_id = uPId;


  return (<>

    <Form>
      <input type="hidden" name="comment_public_id" value={comment_public_id} />
      <input type="hidden" name="post_public_id" value={post_public_id} />
      <input type="hidden" name="user_public_id" value={user_public_id} />
      <input type="text" name="comment" defaultValue={comment} />
      <button type="submit">Update</button>
    </Form>
    <Form>
      <input type="hidden" name="comment_public_id" value={comment_public_id} />
      <input type="hidden" name="post_public_id" value={post_public_id} />
      <input type="hidden" name="user_public_id" value={user_public_id} />
      <button type="submit">Delete</button>
    </Form>



  </>);
}