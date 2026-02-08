export default function PostContent ({content}){
    const contentBlocks = JSON.parse(content);
    return (
        <div className="my-4">
              {contentBlocks.map((block, index) => {
                if (block.type === "heading") {
                  return <h2 key={index}>{block.value}</h2>;
                }

                if (block.type === "paragraph") {
                  return <p key={index}>{block.value}</p>;
                }

                if (block.type === "image") {
                  return (
                    <img
                      key={index}
                      src={block.url}
                      alt="Blog Image"
                      className="w-full max-w-md my-2"
                    />
                  );
                }

                return null;
              })}
            </div>
    )
}