import dynamic from "next/dynamic";

// excluding lazy-loading or next-dynamic
import { NavBar, Hero} from "./components/Landing";

// Apply lazy-loading or next-dynamic
const AboutMe = dynamic(()=> import('./components/Landing/about'),{
  loading: ()=> <p>Loading....</p>
});
const HLProjects = dynamic(()=> import('./components/Landing/HL-Projects'),{
  loading: ()=> <p>Loading....</p>
});
const Demos = dynamic(()=> import('./components/Landing/demos'),{
  loading: ()=> <p>Loading....</p>
});
const MyStack = dynamic(()=> import('./components/Landing/stack'),{
  loading: ()=> <p>Loading....</p>
});
const HowIWork = dynamic(()=> import('./components/Landing/how-i-work'),{
  loading: ()=> <p>Loading....</p>
});
const WhyHireMe = dynamic(()=> import('./components/Landing/why-hire-me'),{
  loading: ()=> <p>Loading....</p>
});
const HireMe = dynamic(()=> import('./components/Landing/hire-me'),{
  loading: ()=> <p>Loading....</p>
});
const Footer = dynamic(()=> import('./components/Landing/footer'),{
  loading: ()=> <p>Loading....</p>
});


export default function Home() {
  return <>
    <NavBar />
    <Hero/>
    <AboutMe/>
    <HLProjects/>
    <Demos/>
    <MyStack/>
    <HowIWork/>
    <WhyHireMe/>
    <HireMe/>
    <Footer/>
  </>;
}
