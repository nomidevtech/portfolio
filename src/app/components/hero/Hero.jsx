import Button1 from "./Button1";
import Button2 from "./Button2";
import Description from "./Description";
import Heading from "./Heading";

export default function Hero() {
  return (
    <main>
      <section className="bg-background transition-colors duration-300 mt-22">
        <div className="py-8 px-4 mx-auto max-w-7xl text-center lg:py-16 lg:px-12">
          <Heading />
          <Description />

          <div className="flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">

            <Button1 />
            <Button2 />

          </div>
        </div>
      </section>
    </main>
  );
}