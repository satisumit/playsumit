import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { pusher } from "@/lib/pusher";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Delete post from database
    await prisma.post.delete({
      where: { id },
    });

    // Trigger Pusher event for real-time update
    await pusher.trigger("ephemeral-wall", "delete-post", { id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
