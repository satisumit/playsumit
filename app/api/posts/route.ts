import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { pusher } from "@/lib/pusher";

// Banned words list
const BANNED_WORDS = [
  "nsfw",
  "offensive",
  "slur",
  "inappropriate",
  // Add more banned words here
];

// Content moderation function
const moderateContent = (
  content: string
): { isValid: boolean; reason?: string } => {
  // Check for minimum length
  if (content.trim().length < 3) {
    return { isValid: false, reason: "Message is too short" };
  }

  // Check for banned words
  const lowerContent = content.toLowerCase();
  for (const word of BANNED_WORDS) {
    if (lowerContent.includes(word)) {
      return {
        isValid: false,
        reason: "Message contains inappropriate content",
      };
    }
  }

  // Check for gibberish (random characters)
  const gibberishPattern = /^[^\w\s]*$/;
  if (gibberishPattern.test(content)) {
    return {
      isValid: false,
      reason: "Message appears to be random characters",
    };
  }

  // Check for excessive capitalization (shouting)
  const uppercaseRatio =
    content.split("").filter((c) => c >= "A" && c <= "Z").length /
    content.length;
  if (uppercaseRatio > 0.7 && content.length > 5) {
    return {
      isValid: false,
      reason: "Please don't use excessive capitalization",
    };
  }

  return { isValid: true };
};

export async function GET() {
  try {
    // Get all non-expired posts
    const posts = await prisma.post.findMany({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, position, color, pinColor, rotation } = body;

    // Validate input
    if (!message || !position || !color || !pinColor) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Moderate content
    const moderation = moderateContent(message);
    if (!moderation.isValid) {
      return NextResponse.json({ error: moderation.reason }, { status: 400 });
    }

    // Calculate expiration time (1 hour from now)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 3600000);

    // Create post in database
    const post = await prisma.post.create({
      data: {
        message,
        positionTop: position.top,
        positionLeft: position.left,
        color,
        pinColor,
        expiresAt,
        zIndex: body.zIndex || 1,
        rotation,
        isPinned: false,
        likes: 0,
      },
    });

    // Trigger Pusher event for real-time update
    await pusher.trigger("ephemeral-wall", "new-post", post);

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
