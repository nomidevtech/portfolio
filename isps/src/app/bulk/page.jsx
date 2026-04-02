import Form from "next/form";
import { bulkServerAction } from "./bulkSA";

export default function BulkText() {
    return (<>
        <Form action={bulkServerAction}>
            <textarea name="bulk-text" placeholder="Paste the text"  ></textarea>
            <button type="submit">Submit</button>
        </Form>
    </>);
}