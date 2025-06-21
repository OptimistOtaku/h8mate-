"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Comment {
  _id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
  tierId: string;
  classmateName: string;
}

interface CommentsProps {
  tierId: string;
  classmateName: string;
}

export default function Comments({ tierId, classmateName }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { data: session } = useSession();

  useEffect(() => {
    fetchComments();
  }, [tierId, classmateName]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch(`/api/comments?tierId=${tierId}&classmateName=${classmateName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      alert('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newComment,
          tierId,
          classmateName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to post comment');
      }

      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      setError(error instanceof Error ? error.message : 'Failed to post comment. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 bg-white/5 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={session ? "Add a comment..." : "Sign in to comment"}
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
            disabled={!session || isLoading}
          />
          <button
            type="submit"
            disabled={!session || isLoading || !newComment.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Posting...' : 'Post'}
          </button>
        </div>
        {!session && (
          <p className="text-sm text-white/60 mt-2">Please sign in to comment</p>
        )}
        {error && (
          <p className="text-sm text-red-400 mt-2">{error}</p>
        )}
      </form>

      <div className="space-y-4">
        {isLoading && comments.length === 0 ? (
          <p className="text-center text-white/60">Loading comments...</p>
        ) : error ? (
          <p className="text-center text-red-400">{error}</p>
        ) : comments.length === 0 ? (
          <p className="text-center text-white/60">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="bg-white/10 rounded-lg p-4 break-words animate-fadeIn"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{comment.userName}</span>
                <span className="text-sm text-white/60">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-white/90">{comment.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
