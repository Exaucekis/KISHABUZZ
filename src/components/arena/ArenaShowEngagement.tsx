"use client";

import Link from "next/link";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useState, useTransition } from "react";
import {
  addArenaShowComment,
  toggleArenaShowLike,
  type ArenaCommentActionState,
} from "@/actions/arena-engagement";

type Comment = { id: string; content: string; createdAt: string | Date; authorName: string };

const initialState: ArenaCommentActionState = { ok: false, message: "" };

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

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
  const [isLiking, startLikeTransition] = useTransition();
  const [isCommenting, startCommentTransition] = useTransition();
  const [commentState, setCommentState] = useState<ArenaCommentActionState>(initialState);
  const displayedComments = compact ? comments.slice(-3) : comments;

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

  function handleCommentSubmit(form: HTMLFormElement) {
    startCommentTransition(async () => {
      const next = await addArenaShowComment(initialState, new FormData(form));
      setCommentState(next);
      if (!next.ok || !next.comment) return;
      setComments((current) => [...current, next.comment!]);
      setCommentsCount((current) => current + 1);
      form.reset();
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
          <div className="ac-engagement__comments-heading">
            <h2>{compact ? "Commentaires" : "Vos commentaires"}</h2>
            <span>{commentsCount} {commentsCount > 1 ? "réactions" : "réaction"}</span>
          </div>
          {displayedComments.length ? (
            <ul className="ac-engagement__list">
              {displayedComments.map((comment) => (
                <li key={comment.id}>
                  <span className="ac-engagement__avatar" aria-hidden="true">{initials(comment.authorName)}</span>
                  <div className="ac-engagement__comment-copy">
                    <div className="ac-engagement__comment-meta">
                      <strong>{comment.authorName}</strong>
                      <time dateTime={new Date(comment.createdAt).toISOString()}>
                        {new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(comment.createdAt))}
                      </time>
                    </div>
                    <p>{comment.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="ac-engagement__empty">Soyez le premier à réagir à cette émission.</p>}

          <form
            className="ac-engagement__form"
            onSubmit={(event) => {
              event.preventDefault();
              handleCommentSubmit(event.currentTarget);
            }}
          >
            <input type="hidden" name="showId" value={showId} />
            <label htmlFor={`arena-comment-${showId}`}>{compact ? "Commenter le prochain invité" : "Écrire un commentaire"}</label>
            <div className="ac-engagement__field">
              <textarea id={`arena-comment-${showId}`} name="content" rows={3} maxLength={800} placeholder="Partagez votre avis…" required />
              <button type="submit" disabled={isCommenting} aria-label="Publier le commentaire">
                <Send size={17} /> {isCommenting ? "Envoi…" : "Publier"}
              </button>
            </div>
            {commentState.message ? <p className={`ac-engagement__message ${commentState.ok ? "is-ok" : "is-error"}`}>{commentState.message}{!commentState.ok && commentState.message.startsWith("Connectez-vous") ? <> <Link href="/connexion">Se connecter</Link></> : null}</p> : null}
          </form>
        </div>
    </section>
  );
}
