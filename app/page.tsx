import Hero from "@/components/Hero";
import About from "@/components/About";
import ScrollReset from "@/components/ScrollReset";
import Stack from "@/components/Stack";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Resume from "@/components/Resume";
import Contact from "@/components/Contact";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";

export default function Home() {
  return (
    <>
      <ScrollReset />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Stack />
        <Resume />
        {/* <Hobbies /> */}
        <Contact />
      </main>
      <KeyboardShortcuts />
    </>
  );
}
