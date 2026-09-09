"use client";

import Link from "next/link";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  addArenaShowComment,
  toggleArenaShowLike,
  type ArenaCommentActionState,
} from "@/actions/arena-engagement";

type Comment = { id: string; content: string; createdAt: string | Date; authorName: string };

const initialState: ArenaCommentActionState = { ok: false, message: "" };

export function ArenaShowEngagement({
  showId,
  initialLikes,
  initialLiked,
  initialComments,
  initialCommentsCount,
  compact = false,
}: {
  showId: string;
  initialLikes: number;
  initialLiked: boolean;
  initialComments: Comment[];
  initialCommentsCount: number;
  compact?: boolean;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [likeMessage, setLikeMessage] = useState("");
  const [comments, setComments] = useState(initialComments);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const commentFormRef = useRef<HTMLFormElement>(null);
  const [isLiking, startLikeTransition] = useTransition();
  const [state, action, pending] = useActionState(addArenaShowComment, initialState);
  const displayedComments = compact ? comments.slice(-3) : comments;

  useEffect(() => {
    if (!state.ok || !state.comment) return;
    setComments((current) =>
      current.some((comment) => comment.id === state.comment!.id) ? current : [...current, state.comment!]
    );
    setCommentsCount((current) => current + 1);
    commentFormRef.current?.reset();
  }, [state]);

  function handleLike() {
    setLikeMessage("");
    startLikeTransition(async () => {
      const result = await toggleArenaShowLike(showId);
      if (!result.ok) {
        setLikeMessage(result.message);
        return;
      }
      setLiked(result.liked);
      setLikes(result.count);
    });
  }

  return (
    <section className={`ac-engagement ${compact ? "ac-engagement--compact" : ""}`} aria-label="Réactions et commentaires">
      <div className="ac-engagement__actions">
        <button
          type="button"
          onClick={handleLike}
          disabled={isLiking}
          className={`ac-engagement__like ${liked ? "is-liked" : ""}`}
          aria-pressed={liked}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} />
          {liked ? "Aimé" : "J’aime"} <span>{likes}</span>
        </button>
        <span className="ac-engagement__comments-count"><MessageCircle size={17} /> {commentsCount} commentaire{commentsCount > 1 ? "s" : ""}</span>
      </div>

      {likeMessage ? <p className="ac-engagement__message is-error">{likeMessage} <Link href="/connexion">Se connecter</Link></p> : null}

      <div className="ac-engagement__comments">
          <h2>{compact ? "Commentaires" : "Vos commentaires"}</h2>
          {displayedComments.length ? (
            <ul className="ac-engagement__list">
              {displayedComments.map((comment) => (
                <li key={comment.id}>
                  <strong>{comment.authorName}</strong>
                  <time dateTime={new Date(comment.createdAt).toISOString()}>
                    {new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(comment.createdAt))}
                  </time>
                  <p>{comment.content}</p>
                </li>
              ))}
            </ul>
          ) : <p className="ac-engagement__empty">Soyez le premier à réagir à cette émission.</p>}

          <form ref={commentFormRef} action={action} className="ac-engagement__form">
            <input type="hidden" name="showId" value={showId} />
            <label htmlFor={`arena-comment-${showId}`}>{compact ? "Commenter le prochain invité" : "Ajouter un commentaire"}</label>
            <div className="ac-engagement__field">
              <textarea id={`arena-comment-${showId}`} name="content" rows={3} maxLength={800} placeholder="Partagez votre avis…" required />
              <button type="submit" disabled={pending} aria-label="Publier le commentaire">
                <Send size={17} /> {pending ? "Envoi…" : "Publier"}
              </button>
            </div>
            {state.message ? <p className={`ac-engagement__message ${state.ok ? "is-ok" : "is-error"}`}>{state.message}{!state.ok && state.message.startsWith("Connectez-vous") ? <> <Link href="/connexion">Se connecter</Link></> : null}</p> : null}
          </form>
        </div>
    </section>
  );
}
