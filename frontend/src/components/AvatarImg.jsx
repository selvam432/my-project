export default function AvatarImg({ src, name = '', size = 40, style = {} }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  if (src) {
    return (
      <img
        src={`/uploads/${src}`}
        alt={name}
        className="avatar"
        style={{ width: size, height: size, ...style }}
        onError={e => { e.target.style.display = 'none'; e.target.nextSibling?.style && (e.target.nextSibling.style.display = 'flex') }}
      />
    )
  }

  return (
    <div
      className="avatar-placeholder"
      style={{
        width: size, height: size,
        fontSize: size * 0.36,
        ...style
      }}
    >
      {initials || '?'}
    </div>
  )
}
