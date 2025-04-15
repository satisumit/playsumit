import React from "react";
import { cn } from "@/lib/utils";

type NoteProps = {
  content: string;
  color: "yellow" | "pink" | "blue" | "green" | "gray";
  className?: string;
};

type EphemeralWallProps = {
  title?: string;
  notes: NoteProps[];
  className?: string;
};

const Note: React.FC<NoteProps> = ({ content, color, className }) => {
  const colorClasses = {
    yellow: "bg-yellow-100",
    pink: "bg-pink-100",
    blue: "bg-blue-100",
    green: "bg-green-100",
    gray: "bg-gray-200",
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "p-4 min-h-[60px] shadow-sm",
          colorClasses[color],
          className
        )}
      >
        <p className="text-center font-medium text-sm">{content}</p>
      </div>
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-pink-200 rounded-full" />
    </div>
  );
};

const EphemeralWall: React.FC<EphemeralWallProps> = ({
  title = "The ephemeral wall",
  notes,
  className,
}) => {
  return (
    <div
      className={cn(
        "rounded-3xl p-6 bg-[#fff8f2] border-2 border-black shadow-md w-lg max-w-4xl mx-auto",
        className
      )}
    >
      <h1 className="text-3xl font-bold text-center mb-6">{title}</h1>
      <div className="bg-blue-100 p-4 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {notes.map((note, index) => (
            <Note key={index} {...note} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EphemeralWall;
