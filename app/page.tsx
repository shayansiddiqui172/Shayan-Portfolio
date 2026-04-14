import Hero from "@/components/Hero";
import About from "@/components/About";
import ScrollReset from "@/components/ScrollReset";
import Stack from "@/components/Stack";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Hobbies from "@/components/Hobbies";
import Contact from "@/components/Contact";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import Cursor from "@/components/Cursor";

export default function Home() {
  return (
    <>
      <ScrollReset />
      <Cursor />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Stack />
        <Hobbies />
        <Contact />
      </main>
      <KeyboardShortcuts />
    </>
  );
}
