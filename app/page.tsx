import DarkModeToggle from "@/components/DarkModeToggle";
import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full min-h-screen p-2 md:p-6 flex justify-between bg-amber-50 dark:bg-zinc-900 relative">
      <div className="absolute top-2 right-2 md:top-6 md:right-6 flex items-center gap-2 cursor-pointer">
        <DarkModeToggle />
      </div>
      {/* <h1 className="text-3xl font-bold underline">Hello world!</h1> */}
    </div>
  );
}
