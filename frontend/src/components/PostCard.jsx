import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import AvatarImg from './AvatarImg'

export default function PostCard({ post, onDelete, onLike }) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes || 0)

  const handleLike = async () => {
    if (liked) return
    try {
      await api.post(`/posts/${post.id}/like`)
      setLiked(true)
      setLikeCount(c => c + 1)
    } catch {}
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return
    try {
      await api.delete(`/posts/${post.id}`)
      onDelete?.(post.id)
    } catch {}
  }

  return (
    <div className="card fade-in" style={{ marginBottom: 16 }}>
      <div className="flex-between" style={{ marginBottom: 14 }}>
        <Link to={`/profile/${post.user_id}`} style={{ textDecoration: 'none' }}>
          <div className="flex-center gap-10" style={{ gap: 10 }}>
            <AvatarImg src={post.author_pic} name={post.author_name} size={42} />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>
                {post.author_name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className={`badge badge-sm ${post.author_role === 'hr' ? 'badge-yellow' : 'badge-accent'}`} style={{ fontSize: 10, padding: '1px 6px' }}>
                  {post.author_role === 'hr' ? 'Recruiter' : 'Job Seeker'}
                </span>
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
        </Link>
        {user?.id === post.user_id && (
          <button onClick={handleDelete} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
            <Trash2 size={14} color="var(--accent-2)" />
          </button>
        )}
      </div>

      <p style={{ color: 'var(--text-1)', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: post.image_path ? 14 : 0 }}>
        {post.content}
      </p>

      {post.image_path && (
        <img
          src={`/uploads/${post.image_path}`}
          alt="post"
          style={{ width: '100%', borderRadius: 8, marginTop: 12, maxHeight: 360, objectFit: 'cover' }}
        />
      )}

      <div className="divider" style={{ margin: '14px 0' }} />

      <div className="flex-center gap-8">
        <button
          onClick={handleLike}
          className="btn btn-ghost btn-sm"
          style={{ color: liked ? 'var(--accent-2)' : 'var(--text-3)', gap: 6 }}
        >
          <Heart size={15} fill={liked ? 'var(--accent-2)' : 'none'} />
          {likeCount > 0 && likeCount}
        </button>
      </div>
    </div>
  )
}
