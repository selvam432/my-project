import { useEffect, useState, useRef } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
import toast from 'react-hot-toast'
import { Image, Send, Rss } from 'lucide-react'
import AvatarImg from '../components/AvatarImg'

export default function Feed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [posting, setPosting] = useState(false)
  const fileRef = useRef()

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts/')
      setPosts(res.data)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchPosts() }, [])

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handlePost = async () => {
    if (!content.trim()) { toast.error('Write something first'); return }
    setPosting(true)
    try {
      const fd = new FormData()
      fd.append('content', content)
      if (image) fd.append('image', image)
      const res = await api.post('/posts/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setPosts(prev => [res.data, ...prev])
      setContent('')
      setImage(null)
      setImagePreview(null)
      toast.success('Posted!')
    } catch { toast.error('Failed to post') } finally { setPosting(false) }
  }

  const handleDelete = (postId) => setPosts(prev => prev.filter(p => p.id !== postId))

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 680 }}>
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Rss size={22} color="var(--accent)" />
          <h1 style={{ fontSize: 24 }}>Community Feed</h1>
        </div>

        {/* Create post */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="flex-center gap-12" style={{ marginBottom: 14 }}>
            <AvatarImg src={user?.profile_pic} name={user?.full_name} size={42} />
            <textarea
              className="form-textarea"
              placeholder={`What's on your mind, ${user?.full_name?.split(' ')[0]}?`}
              style={{ minHeight: 80, resize: 'none', flex: 1 }}
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>

          {imagePreview && (
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <img src={imagePreview} alt="preview" style={{ width: '100%', borderRadius: 8, maxHeight: 200, objectFit: 'cover' }} />
              <button onClick={() => { setImage(null); setImagePreview(null) }}
                style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
          )}

          <div className="flex-between">
            <button onClick={() => fileRef.current.click()} className="btn btn-ghost btn-sm">
              <Image size={15} /> Add Photo
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
            <button className="btn btn-primary btn-sm" onClick={handlePost} disabled={posting || !content.trim()}>
              {posting ? <span className="spinner spinner-sm" /> : <><Send size={14} /> Post</>}
            </button>
          </div>
        </div>

        {/* Feed */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : posts.length === 0 ? (
          <div className="empty-state"><Rss size={40} /><p style={{ marginTop: 12 }}>No posts yet. Be the first to share!</p></div>
        ) : (
          posts.map(post => <PostCard key={post.id} post={post} onDelete={handleDelete} />)
        )}
      </div>
    </div>
  )
}
