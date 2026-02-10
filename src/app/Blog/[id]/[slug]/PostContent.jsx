import Image from "next/image";

export default function PostContent({ content }) {
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
             <div
              key={`image-${index}`}
              className="relative w-full max-w-md aspect-video my-2"
            >
              <Image
                src={block.url}
                alt="Blog Image"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  )
}