"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { nanoid } from "nanoid";
import { motion, AnimatePresence } from "framer-motion";
import { Pin, Trash2, AlertTriangle, Smile } from "lucide-react";
import Pusher from "pusher-js";

// Types for our posts
interface Post {
  id: string;
  message: string;
  position: {
    top: number;
    left: number;
  };
  color: string;
  createdAt: Date | string;
  expiresAt: Date | string;
  zIndex: number;
  rotation: number;
  pinColor: string;
  isPinned: boolean;
  likes: number;
}

// API Post type that matches our database schema
interface ApiPost {
  id: string;
  message: string;
  positionTop: number;
  positionLeft: number;
  color: string;
  createdAt: string;
  expiresAt: string;
  zIndex: number;
  rotation: number;
  pinColor: string;
  isPinned: boolean;
  likes: number;
}

const EphemeralWall: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [highestZIndex, setHighestZIndex] = useState(1);
  const [theme, setTheme] = useState<"light" | "dark" | "colorful">("light");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [wallBackground, setWallBackground] = useState("cork-board");
  const [isConnected, setIsConnected] = useState(false);
  // Add these state variables
  const [wallHeight, setWallHeight] = useState(0);
  const [averagePostHeight, setAveragePostHeight] = useState(150); // Default estimate

  const wallRef = useRef<HTMLDivElement>(null);
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<any>(null);
  const MAX_CHARACTERS = 100;
  const POST_LIFETIME_MS = 3600000; // 1 hour in milliseconds
  // Add these constants at the top of your component
  const GRID_SIZE = 10; // Define the number of grid cells in each direction

  // Add this function to get a random grid position
  const getRandomGridPosition = useCallback(() => {
    // Generate random grid coordinates
    const gridRow = Math.floor(Math.random() * GRID_SIZE);
    const gridCol = Math.floor(Math.random() * GRID_SIZE);

    // Convert grid coordinates to percentage positions
    return {
      top: (gridRow * 100) / GRID_SIZE,
      left: (gridCol * 100) / GRID_SIZE,
    };
  }, [GRID_SIZE]);

  // Add this useEffect to measure the wall container
  useEffect(() => {
    if (!wallRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWallHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(wallRef.current);

    return () => {
      if (wallRef.current) {
        resizeObserver.unobserve(wallRef.current);
      }
    };
  }, []);
  // Add this useEffect to calculate average post height
  useEffect(() => {
    if (posts.length === 0 || !wallRef.current) return;

    // Use setTimeout to ensure posts have rendered
    const timer = setTimeout(() => {
      const postElements = wallRef.current?.querySelectorAll(".post-note");
      if (!postElements || postElements.length === 0) return;

      let totalHeight = 0;
      postElements.forEach((el) => {
        totalHeight += el.getBoundingClientRect().height;
      });

      const newAverageHeight = totalHeight / postElements.length;
      setAveragePostHeight(newAverageHeight);
    }, 500);

    return () => clearTimeout(timer);
  }, [posts]);
  // Add this function to determine if scrolling is needed
  const isScrollNeeded = React.useMemo(() => {
    // Basic check - if we have more than X posts, enable scrolling
    if (posts.length >= 15) return true;

    // More precise check - calculate total content height
    const estimatedContentHeight = posts.length * averagePostHeight;
    return estimatedContentHeight > wallHeight;
  }, [posts.length, averagePostHeight, wallHeight]);

  // Memoize these arrays to prevent unnecessary re-renders
  const colors = React.useMemo(
    () => [
      "bg-yellow-100 border-yellow-300",
      "bg-blue-100 border-blue-300",
      "bg-pink-100 border-pink-300",
      "bg-green-100 border-green-300",
      "bg-purple-100 border-purple-300",
      "bg-orange-100 border-orange-300",
      "bg-teal-100 border-teal-300",
    ],
    []
  );

  const pinColors = React.useMemo(
    () => [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-amber-500",
      "bg-emerald-500",
    ],
    []
  );

  const backgrounds = React.useMemo(
    () => ({
      "cork-board": "bg-amber-800 bg-[url('/cork-texture.jpg')] bg-repeat",
      chalkboard: "bg-slate-800 bg-[url('/chalk-texture.jpg')] bg-repeat",
      whiteboard: "bg-gray-100",
      bulletin: "bg-blue-900",
    }),
    []
  );

  // Convert API post to client post - memoize this function
  const convertApiPostToClientPost = useCallback((apiPost: ApiPost): Post => {
    return {
      id: apiPost.id,
      message: apiPost.message,
      position: {
        top: apiPost.positionTop,
        left: apiPost.positionLeft,
      },
      color: apiPost.color,
      createdAt: new Date(apiPost.createdAt),
      expiresAt: new Date(apiPost.expiresAt),
      zIndex: apiPost.zIndex,
      rotation: apiPost.rotation,
      pinColor: apiPost.pinColor,
      isPinned: apiPost.isPinned,
      likes: apiPost.likes,
    };
  }, []);

  // Fetch posts from the API - memoize this function
  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch("/api/posts");
      if (!response.ok) throw new Error("Failed to fetch posts");

      const data: ApiPost[] = await response.json();
      const clientPosts = data.map(convertApiPostToClientPost);

      setPosts(clientPosts);

      // Find highest z-index
      const maxZ = clientPosts.reduce(
        (max, post) => Math.max(max, post.zIndex),
        0
      );
      setHighestZIndex(maxZ);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setErrorMessage("Failed to load posts. Please try again later.");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  }, [convertApiPostToClientPost]);

  // Initialize Pusher connection
  const initializePusher = useCallback(() => {
    // Check if Pusher is already initialized
    if (pusherRef.current) return;

    // Make sure we have the required environment variables
    if (
      !process.env.NEXT_PUBLIC_PUSHER_KEY ||
      !process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    ) {
      console.error("Pusher environment variables are missing");
      return;
    }

    // Create new Pusher instance
    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      forceTLS: true,
    });

    // Subscribe to channel
    channelRef.current = pusherRef.current.subscribe("ephemeral-wall");

    // Set up event handlers
    channelRef.current.bind("new-post", (data: ApiPost) => {
      console.log("Received new post:", data);
      setPosts((prevPosts) => {
        // Check if we already have this post (prevent duplicates)
        if (prevPosts.some((p) => p.id === data.id)) return prevPosts;
        return [...prevPosts, convertApiPostToClientPost(data)];
      });
    });

    channelRef.current.bind("update-post", (data: ApiPost) => {
      console.log("Received updated post:", data);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === data.id ? convertApiPostToClientPost(data) : post
        )
      );
    });

    channelRef.current.bind("delete-post", (data: { id: string }) => {
      console.log("Received delete post:", data);
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== data.id));
    });

    // Connection status events
    pusherRef.current.connection.bind("connected", () => {
      console.log("Connected to Pusher");
      setIsConnected(true);
    });

    pusherRef.current.connection.bind("disconnected", () => {
      console.log("Disconnected from Pusher");
      setIsConnected(false);
    });

    pusherRef.current.connection.bind("error", (err: any) => {
      console.error("Pusher connection error:", err);
      setIsConnected(false);
    });
  }, [convertApiPostToClientPost]);

  // Set up Pusher for real-time updates - only run once on mount
  useEffect(() => {
    // Load theme preferences
    const savedTheme = localStorage.getItem("wallTheme") as
      | "light"
      | "dark"
      | "colorful"
      | null;
    const savedBackground = localStorage.getItem("wallBackground");

    if (savedTheme) setTheme(savedTheme);
    if (savedBackground) setWallBackground(savedBackground);

    // Fetch initial posts
    fetchPosts();

    // Initialize Pusher
    initializePusher();

    // Clean up
    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
      }

      if (pusherRef.current) {
        pusherRef.current.unsubscribe("ephemeral-wall");
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
    };
  }, [fetchPosts, initializePusher]);

  // Save theme preference - only run when theme changes
  useEffect(() => {
    localStorage.setItem("wallTheme", theme);
  }, [theme]);

  // Save background preference - only run when background changes
  useEffect(() => {
    localStorage.setItem("wallBackground", wallBackground);
  }, [wallBackground]);

  // Periodically check for expired posts - run every minute
  useEffect(() => {
    const checkExpiredPosts = () => {
      const now = new Date();
      setPosts((prevPosts) =>
        prevPosts.filter((post) => new Date(post.expiresAt) > now)
      );
    };

    // Check once on mount and then every minute
    checkExpiredPosts();
    const intervalId = setInterval(checkExpiredPosts, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const trimmedMessage = newMessage.trim();
      if (trimmedMessage === "") return;

      setIsLoading(true);

      try {
        // Get a random grid position instead of completely random position
        const position = getRandomGridPosition();

        const color = colors[Math.floor(Math.random() * colors.length)];
        const pinColor =
          pinColors[Math.floor(Math.random() * pinColors.length)];
        const newZIndex = highestZIndex + 1;
        setHighestZIndex(newZIndex);

        // Random slight rotation
        const rotation = (Math.random() - 0.5) * 8; // Between -4 and 4 degrees

        // Send post to API
        const response = await fetch("/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: trimmedMessage,
            position,
            color,
            pinColor,
            zIndex: newZIndex,
            rotation,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create post");
        }

        setNewMessage("");
      } catch (error) {
        console.error("Error creating post:", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to create post"
        );
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      } finally {
        setIsLoading(false);
      }
    },
    [newMessage, highestZIndex, colors, pinColors, getRandomGridPosition]
  );

  const handlePostClick = useCallback(
    async (id: string) => {
      const newZIndex = highestZIndex + 1;
      setHighestZIndex(newZIndex);

      try {
        await fetch(`/api/posts/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            zIndex: newZIndex,
          }),
        });
      } catch (error) {
        console.error("Error updating post z-index:", error);
      }
    },
    [highestZIndex]
  );

  const togglePinPost = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();

      const post = posts.find((p) => p.id === id);
      if (!post) return;

      try {
        await fetch(`/api/posts/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isPinned: !post.isPinned,
          }),
        });
      } catch (error) {
        console.error("Error toggling pin status:", error);
      }
    },
    [posts]
  );

  const deletePost = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  }, []);

  const likePost = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();

      const post = posts.find((p) => p.id === id);
      if (!post) return;

      try {
        await fetch(`/api/posts/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            likes: post.likes + 1,
          }),
        });
      } catch (error) {
        console.error("Error liking post:", error);
      }
    },
    [posts]
  );

  // Memoize theme classes to prevent unnecessary calculations
  const getThemeClasses = useCallback(() => {
    switch (theme) {
      case "dark":
        return "bg-gray-900 text-white";
      case "colorful":
        return "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white";
      default:
        return "bg-blue-100 text-gray-800";
    }
  }, [theme]);

  // Handle input change
  const handleMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNewMessage(e.target.value.slice(0, MAX_CHARACTERS));
    },
    [MAX_CHARACTERS]
  );

  // Handle theme change
  const handleThemeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setTheme(e.target.value as "light" | "dark" | "colorful");
    },
    []
  );

  // Handle background change
  const handleBackgroundChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setWallBackground(e.target.value);
    },
    []
  );

  return (
    <div
      className={`flex flex-col lg:flex-row h-screen ${getThemeClasses()} transition-colors duration-300`}
    >
      {/* Wall container - left side on desktop */}
      <div
        ref={wallRef}
        className={`flex-grow lg:w-4/5 relative ${
          backgrounds[wallBackground as keyof typeof backgrounds]
        } ${isScrollNeeded ? "overflow-y-auto" : "overflow-hidden"} p-4`}
      >
        {/* Post rendering code remains the same */}
        <AnimatePresence>
          {posts.map((post) => {
            const timeLeft = new Date(post.expiresAt).getTime() - Date.now();
            const opacity = Math.min(1, timeLeft / (POST_LIFETIME_MS / 2));
            const timeLeftPercent = (timeLeft / POST_LIFETIME_MS) * 100;

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, rotate: post.rotation * 2 }}
                transition={{ duration: 0.3 }}
                className={`absolute ${post.color} rounded-md p-4 lg:w-64 w-48 cursor-pointer shadow-lg border-2 post-note`}
                style={{
                  top: `${post.position.top}%`,
                  left: `${post.position.left}%`,
                  zIndex: post.zIndex,
                  transform: `rotate(${post.rotation}deg)`,
                }}
                onClick={() => handlePostClick(post.id)}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                }}
              >
                {/* Pin */}
                <div
                  className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${
                    post.isPinned ? "scale-125" : ""
                  } transition-transform cursor-pointer`}
                  onClick={(e) => togglePinPost(post.id, e)}
                >
                  <div
                    className={`w-7 h-7 rounded-full shadow-md ${post.pinColor} border-2 border-white flex items-center justify-center hover:scale-110 transition-transform`}
                  >
                    <Pin className="text-white text-xs" />
                  </div>
                </div>

                {/* Post content with responsive text size */}
                <div className="mt-3 pt-1">
                  <p className="text-gray-800 whitespace-pre-wrap break-words font-medium lg:text-base text-sm">
                    {post.message}
                  </p>

                  <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                    <span>
                      {new Date(post.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>{Math.floor(timeLeft / 60000)} min left</span>
                  </div>

                  <div className="w-full h-1.5 bg-gray-200 mt-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        timeLeftPercent > 50
                          ? "bg-green-500"
                          : timeLeftPercent > 20
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${timeLeftPercent}%`,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {posts.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6 bg-white bg-opacity-80 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-2">The Wall is Empty!</h3>
              <p className="text-gray-600">Be the first to post a note.</p>
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar for desktop/tablet - contains title, input, and options */}
      <div
        className={`lg:w-1/5 lg:flex flex-col ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        } p-4 shadow-lg hidden`}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            <span className="mr-2">📝</span>
            The Ephemeral Wall
            {isConnected && (
              <span className="ml-2 text-sm bg-green-500 text-white px-2 py-1 rounded-full">
                Live
              </span>
            )}
          </h1>
        </div>

        {/* Input form */}
        <div className="mb-6">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
            <div className="flex-grow relative">
              <textarea
                value={newMessage}
                onChange={handleMessageChange}
                className={`w-full p-3 border ${
                  theme === "dark"
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-800 border-blue-200"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none`}
                placeholder="Leave your ephemeral message..."
                maxLength={MAX_CHARACTERS}
                rows={4}
              />
              <div
                className={`absolute bottom-2 right-2 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {newMessage.length}/{MAX_CHARACTERS}
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Posting...
                </span>
              ) : (
                "Post Note"
              )}
            </button>
          </form>
          <AnimatePresence>
            {showError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 p-2 bg-red-100 text-red-700 rounded-md flex items-center"
              >
                <AlertTriangle className="mr-2" />
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Personalization options */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Personalize Your Wall</h3>

          <div className="space-y-2">
            <label
              className={`block ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Background Style
            </label>
            <select
              value={wallBackground}
              onChange={handleBackgroundChange}
              className="w-full px-3 py-2 rounded bg-white text-gray-800 border border-gray-300"
            >
              <option value="cork-board">Cork Board</option>
              <option value="chalkboard">Chalkboard</option>
              <option value="whiteboard">Whiteboard</option>
              <option value="bulletin">Bulletin Board</option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              className={`block ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Theme
            </label>
            <select
              value={theme}
              onChange={handleThemeChange}
              className="w-full px-3 py-2 rounded bg-white text-gray-800 border border-gray-300"
            >
              <option value="light">Light Theme</option>
              <option value="dark">Dark Theme</option>
              <option value="colorful">Colorful Theme</option>
            </select>
          </div>
        </div>

        <div className="mt-auto pt-6">
          <p
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Your message will disappear after 1 hour. Click the pin to fix a
            note in place.
          </p>

          {!isConnected && (
            <p className="text-sm text-red-500 flex items-center mt-2">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
              Offline - Reconnecting...
            </p>
          )}
        </div>
      </div>

      {/* Mobile layout - input at bottom */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        } p-3 shadow-lg z-[500]`}
      >
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-grow relative">
            <textarea
              value={newMessage}
              onChange={handleMessageChange}
              className={`w-full p-2 border ${
                theme === "dark"
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-800 border-blue-200"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none text-sm`}
              placeholder="Leave your message..."
              maxLength={MAX_CHARACTERS}
              rows={1}
            />
            <div
              className={`absolute bottom-1 right-2 text-xs ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {newMessage.length}/{MAX_CHARACTERS}
            </div>
          </div>

          <div className="flex space-x-1">
            {/* Personalization buttons for mobile */}
            <button
              type="button"
              onClick={() => {
                const themes = ["light", "dark", "colorful"];
                const currentIndex = themes.indexOf(theme);
                const nextIndex = (currentIndex + 1) % themes.length;
                setTheme(themes[nextIndex] as "light" | "dark" | "colorful");
              }}
              className="p-2 bg-gray-200 rounded-full"
              title="Change Theme"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5"></circle>
                <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"></path>
              </svg>
            </button>

            <button
              type="button"
              onClick={() => {
                const backgrounds = [
                  "cork-board",
                  "chalkboard",
                  "whiteboard",
                  "bulletin",
                ];
                const currentIndex = backgrounds.indexOf(wallBackground);
                const nextIndex = (currentIndex + 1) % backgrounds.length;
                setWallBackground(backgrounds[nextIndex]);
              }}
              className="p-2 bg-gray-200 rounded-full"
              title="Change Background"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <path d="M21 15l-5-5L5 21"></path>
              </svg>
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className={`px-3 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "Post"
              )}
            </button>
          </div>
        </form>

        <AnimatePresence>
          {showError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 p-2 bg-red-100 text-red-700 rounded-md flex items-center text-sm"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EphemeralWall;
