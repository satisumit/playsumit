"use client";

import { useState, useEffect } from "react";

export default function EphemeralWall() {
  const [newPost, setNewPost] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Initial static positions (for SSR)
  const initialPosts = [
    {
      id: 1,
      text: "Testing",
      color: "bg-yellow-100",
      position: { top: "5%", left: "20%" },
    },
    {
      id: 2,
      text: "Hello :)",
      color: "bg-green-100",
      position: { top: "20%", left: "70%" },
    },
    {
      id: 3,
      text: "gone soon...",
      color: "bg-blue-100",
      position: { top: "30%", left: "4%" },
    },
    {
      id: 4,
      text: "how are you?",
      color: "bg-pink-100",
      position: { top: "30%", left: "40%" },
    },
  ];

  const [posts, setPosts] = useState(initialPosts);

  return (
    <div className="max-w-md mx-auto pt-5">
      <div className="border-2 border-black rounded-lg bg-orange-50 p-4">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-4 text-center">
          The ephemeral wall
        </h1>

        {/* Notes container - 2:1 ratio container */}
        <div className="border-2 border-black rounded-lg bg-blue-200 p-4 mb-4 relative h-36">
          {/* Sticky notes */}
          {posts.map((post) => (
            <div
              key={post.id}
              className={`absolute ${
                post.color
              } border border-gray-400 p-2 w-24 h-24 shadow-md transform rotate-${
                isClient ? Math.floor(Math.random() * 6) - 3 : "0"
              }`}
              style={{
                top: post.position.top,
                left: post.position.left,
              }}
            >
              <div className="bg-red-200 w-4 h-4 rounded-full mx-auto -mt-4 mb-1 border border-red-300"></div>
              <p className="text-center font-medium">{post.text}</p>
            </div>
          ))}

          {/* No history text */}
          <div className="absolute bottom-2 right-2 text-sm font-medium">
            No history,
            <br />
            no profiles
          </div>
        </div>
      </div>
    </div>
  );
}
