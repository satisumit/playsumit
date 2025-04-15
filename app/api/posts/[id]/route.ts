import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { pusher } from "@/lib/pusher";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } =await params;
    const body = await request.json();

    // Update post in database
    const updatedPost = await prisma.post.update({
      where: { id },
      data: body,
    });

    // Trigger Pusher event for real-time update
    await pusher.trigger("ephemeral-wall", "update-post", updatedPost);

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } =await params;

    // Your deletion logic
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    await prisma.post.delete({
      where: { id },
    });

    // Add Pusher trigger for real-time deletion notification
    await pusher.trigger("ephemeral-wall", "delete-post", { id });

    return NextResponse.json(
      { message: "Post deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { message: "Error deleting post" },
      { status: 500 }
    );
  }
}
