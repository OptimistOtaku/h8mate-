"use client";
import { useState, useEffect } from "react";
import type { IComment } from "../../server/models/Comment";
import type { Types } from "mongoose";

interface CommentsProps {
  tierId: string;
  classmateName: string;
}

interface CommentsResponse {
  error?: string;
  comments?: IComment[];
}

export default function Comments({ tierId, classmateName }: CommentsProps) {
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments?tierId=${encodeURIComponent(tierId)}`);
        const data = await response.json() as CommentsResponse;
        if (data.error) {
          setError(data.error);
        } else {
          setComments(data.comments ?? []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch comments');
      }
    };

    void fetchComments();
  }, [tierId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          tierId,
          classmateName,
        }),
      });

      const data = await response.json() as CommentsResponse;
      if (data.error) {
        setError(data.error);
      } else {
        setComments(data.comments ?? []);
        setNewComment("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    }
  };

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-semibold">Comments</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2"
          rows={3}
          placeholder="Write a comment..."
        />
        <button
          type="submit"
          className="mt-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Post Comment
        </button>
      </form>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={(comment._id as Types.ObjectId).toString()} className="rounded-lg border border-gray-200 p-4">
            <p className="text-gray-800">{comment.content}</p>
            <p className="mt-2 text-sm text-gray-500">
              Posted by {comment.createdBy.toString()} on {new Date(comment.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
