import dynamic from "next/dynamic";

// excluding lazy-loading or next-dynamic
import { NavBar, Hero} from "./components/Landing";

// Apply lazy-loading or next-dynamic
const AboutMe = dynamic(()=> import('./components/Landing/about/AboutMe'),{
  loading: ()=> <p>Loading....</p>
});
const HLProjects = dynamic(()=> import('./components/Landing/HL-Projects/HLProjects'),{
  loading: ()=> <p>Loading....</p>
});
const Demos = dynamic(()=> import('./components/Landing/demos/Demos'),{
  loading: ()=> <p>Loading....</p>
});
const MyStack = dynamic(()=> import('./components/Landing/stack/MyStack'),{
  loading: ()=> <p>Loading....</p>
});
const HowIWork = dynamic(()=> import('./components/Landing/how-i-work/HowIWork'),{
  loading: ()=> <p>Loading....</p>
});
const WhyHireMe = dynamic(()=> import('./components/Landing/why-hire-me/WhyHireMe'),{
  loading: ()=> <p>Loading....</p>
});
const HireMe = dynamic(()=> import('./components/Landing/hire-me/HireMe'),{
  loading: ()=> <p>Loading....</p>
});
const Footer = dynamic(()=> import('./components/Landing/footer/Footer'),{
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
