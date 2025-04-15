"use client";
import DarkModeToggle from "@/components/DarkModeToggle";
import { useState } from "react";
import { Gamepad2, Brain, AlignJustify } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import EphemeralWallCard from "@/components/EphemeralWallCard";
import Image from "next/image";

const GameCard = ({ title, concept, category, level, color, imageBg }: any) => {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
      {/* Image Section */}
      <div className={` ${imageBg} bg-cover bg-center relative aspect-[2/1]`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end pt-2 px-2">
          <div className="text-white">
            <span
              className={`text-xs absolute font-medium px-2 py-1 rounded-full backdrop-blur-md  bg-zinc-950/40 bottom-2`}
            >
              {level}
            </span>
          </div>
          <div className="border-t-3 border-x-3 border-zinc-950 flex items-center w-full h-full overflow-hidden rounded-t-md">
            <Image
              src="/EphemeralWall.png"
              alt="Logo"
              width={800}
              height={400}
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        <div className={`w-16 h-1 mb-3 ${color} rounded-full`}></div>
        <h3 className="font-semibold text-lg text-zinc-900 dark:text-amber-50">
          {title}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
          {category}
        </p>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 flex-grow">
          {concept}
        </p>
        <button
          className={`mt-4 text-sm font-medium py-2 px-4 rounded-lg ${color} text-white hover:opacity-90 transition-opacity`}
        >
          Play Now
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const [activeTab, setActiveTab] = useState("games");
  const [searchTerm, setSearchTerm] = useState("");

  const gameItems = [
    {
      title: "Gravity Tic-Tac-Toe",
      concept:
        "Play on a 3D grid where pieces fall to the lowest empty spot. Connect 4 across any dimension to win.",
      category: "3D Strategy",
      level: "Intermediate",
      color: "bg-amber-500 dark:bg-amber-600",
      hoverColor: "hover:bg-amber-600 dark:hover:bg-amber-700",
      borderColor: "border-amber-400 dark:border-amber-500",
      textColor: "text-amber-950 dark:text-amber-50",
      imageBg:
        "bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-700 dark:to-amber-900",
    },
    {
      title: "Sound Guesser",
      concept:
        "Test your ears! Identify locations around the world just by listening to their ambient soundscapes.",
      category: "Audio Geography",
      level: "Beginner",
      color: "bg-orange-500 dark:bg-orange-600",
      hoverColor: "hover:bg-orange-600 dark:hover:bg-orange-700",
      borderColor: "border-orange-400 dark:border-orange-500",
      textColor: "text-orange-950 dark:text-orange-50",
      imageBg:
        "bg-gradient-to-br from-orange-400 to-rose-600 dark:from-orange-700 dark:to-rose-800",
    },
    {
      title: "AI Text or Human Rant?",
      concept:
        "Can you tell the difference between AI-generated text and human writing? Test your detection skills!",
      category: "AI Detection",
      level: "Advanced",
      color: "bg-rose-500 dark:bg-rose-600",
      hoverColor: "hover:bg-rose-600 dark:hover:bg-rose-700",
      borderColor: "border-rose-400 dark:border-rose-500",
      textColor: "text-rose-950 dark:text-rose-50",
      imageBg:
        "bg-gradient-to-br from-rose-400 to-purple-600 dark:from-rose-700 dark:to-purple-800",
    },
    {
      title: "Color Trail Arena",
      concept:
        "Leave colorful trails as you move and avoid crashing into other players' paths in this multiplayer challenge.",
      category: "Multiplayer Action",
      level: "Beginner",
      color: "bg-emerald-500 dark:bg-emerald-600",
      hoverColor: "hover:bg-emerald-600 dark:hover:bg-emerald-700",
      borderColor: "border-emerald-400 dark:border-emerald-500",
      textColor: "text-emerald-950 dark:text-emerald-50",
      imageBg:
        "bg-gradient-to-br from-emerald-400 to-teal-600 dark:from-emerald-700 dark:to-teal-800",
    },
    {
      title: "Global RPS Tournament",
      concept:
        "Compete in Rock Paper Scissors against players worldwide with real-time tournaments and global rankings.",
      category: "Global Competition",
      level: "Beginner",
      color: "bg-blue-500 dark:bg-blue-600",
      hoverColor: "hover:bg-blue-600 dark:hover:bg-blue-700",
      borderColor: "border-blue-400 dark:border-blue-500",
      textColor: "text-blue-950 dark:text-blue-50",
      imageBg:
        "bg-gradient-to-br from-blue-400 to-indigo-600 dark:from-blue-700 dark:to-indigo-800",
    },
  ];

  // Project items with dark mode color customization
  const projectItems = [
    {
      title: "The Ephemeral Wall",
      concept:
        "Post anonymous messages that automatically disappear after a time. No history, no profiles, just fleeting thoughts.",
      category: "Social Experiment",
      level: "Featured",
      color: "bg-purple-500 dark:bg-purple-600",
      hoverColor: "hover:bg-purple-600 dark:hover:bg-purple-700",
      borderColor: "border-purple-400 dark:border-purple-500",
      textColor: "text-purple-950 dark:text-purple-50",
      imageBg:
        "bg-gradient-to-br from-purple-400 to-indigo-600 dark:from-purple-700 dark:to-indigo-800",
    },
    {
      title: "One Definition Wiki",
      concept:
        "A wiki where each topic gets exactly one sentence. Vote on the most concise and accurate definitions.",
      category: "Knowledge Base",
      level: "Popular",
      color: "bg-pink-500 dark:bg-pink-600",
      hoverColor: "hover:bg-pink-600 dark:hover:bg-pink-700",
      borderColor: "border-pink-400 dark:border-pink-500",
      textColor: "text-pink-950 dark:text-pink-50",
      imageBg:
        "bg-gradient-to-br from-pink-400 to-red-600 dark:from-pink-700 dark:to-red-800",
    },
    {
      title: "Absurd Product Wishlist",
      concept:
        "Browse a catalog of impossible products generated by AI. Create wishlists of your favorite fictional items.",
      category: "Creative Humor",
      level: "New",
      color: "bg-indigo-500 dark:bg-indigo-600",
      hoverColor: "hover:bg-indigo-600 dark:hover:bg-indigo-700",
      borderColor: "border-indigo-400 dark:border-indigo-500",
      textColor: "text-indigo-950 dark:text-indigo-50",
      imageBg:
        "bg-gradient-to-br from-indigo-400 to-blue-600 dark:from-indigo-700 dark:to-blue-800",
    },
    {
      title: "Search By Vibe",
      concept:
        "Find content using feelings and moods instead of keywords. Discover media that matches your current vibe.",
      category: "Discovery Tool",
      level: "Experimental",
      color: "bg-teal-500 dark:bg-teal-600",
      hoverColor: "hover:bg-teal-600 dark:hover:bg-teal-700",
      borderColor: "border-teal-400 dark:border-teal-500",
      textColor: "text-teal-950 dark:text-teal-50",
      imageBg:
        "bg-gradient-to-br from-teal-400 to-emerald-600 dark:from-teal-700 dark:to-emerald-800",
    },
  ];

  const renderContent = () => {
    const items = activeTab === "games" ? gameItems : projectItems;

    const filteredItems = items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.concept.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => <GameCard key={index} {...item} />)
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-zinc-600 dark:text-zinc-400">
              No items found matching your search.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-zinc-900 text-zinc-900 dark:text-amber-50">
      {/* Header */}
      <header className="w-full p-4 md:px-8 flex justify-between items-center border-b border-amber-200 dark:border-zinc-800">
        <div className="flex items-center">
          <div className="rounded-full bg-amber-500 dark:bg-amber-400 w-10 h-10 flex items-center justify-center text-zinc-900 font-bold text-xl mr-2">
            PS
          </div>
          <span className="font-bold text-xl">Play Sumit</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <button
            onClick={() => setActiveTab("games")}
            className={`flex items-center transition-colors ${
              activeTab === "games" ? "text-amber-500" : "hover:text-amber-500"
            }`}
          >
            <Gamepad2 size={20} className="mr-2" />
            <span>Games</span>
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center transition-colors ${
              activeTab === "projects"
                ? "text-amber-500"
                : "hover:text-amber-500"
            }`}
          >
            <Brain size={20} className="mr-2" />
            <span>Interactive Projects</span>
          </button>
          <DarkModeToggle />
        </nav>

        {/* Mobile Menu Sheet */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <button aria-label="Menu">
              <AlignJustify size={24} />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="bg-amber-50 dark:bg-zinc-900 border-l border-amber-200 dark:border-zinc-700"
          >
            <nav className="flex flex-col mt-8">
              <SheetClose asChild>
                <button
                  onClick={() => setActiveTab("games")}
                  className={`flex items-center py-3 transition-colors ${
                    activeTab === "games" ? "text-amber-500" : ""
                  }`}
                >
                  <Gamepad2 size={20} className="mr-2" />
                  <span>Games</span>
                </button>
              </SheetClose>
              <SheetClose asChild>
                <button
                  onClick={() => setActiveTab("projects")}
                  className={`flex items-center py-3 transition-colors ${
                    activeTab === "projects" ? "text-amber-500" : ""
                  }`}
                >
                  <Brain size={20} className="mr-2" />
                  <span>Interactive Projects</span>
                </button>
              </SheetClose>
              <div className="py-3">
                <DarkModeToggle />
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-zinc-900 dark:text-amber-50">
              {activeTab === "games"
                ? "Innovative Games"
                : "Interactive Projects"}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              {activeTab === "games"
                ? "Creative and educational gaming experiences"
                : "Unique digital experiments and tools"}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Grid Content */}
        {renderContent()}
      </main>

      {/* Bottom CTA */}
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Ready to Try Something New?
        </h2>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Explore our collection of innovative games and interactive projects
          designed to challenge your mind and spark creativity.
        </p>
        <button className="bg-amber-500 hover:bg-amber-600 text-white py-3 px-8 rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
          Start Playing Now
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-zinc-600 dark:text-zinc-400 text-sm border-t border-amber-200 dark:border-zinc-800">
        <p>© 2025 Play Sumit. All rights reserved.</p>
      </footer>
    </div>
  );
}
