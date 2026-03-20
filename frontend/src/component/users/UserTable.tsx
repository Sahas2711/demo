import { useState } from 'react'
import { Search, Pencil, Trash2, Filter } from 'lucide-react'
import type { AppUser, Role } from './userData'
import { ROLE_CONFIG } from './userData'

interface Props {
  users: AppUser[]
  onEdit:   (u: AppUser) => void
  onDelete: (id: string) => void
}

const AVATAR_COLORS = ['#724B68', '#2563eb', '#059669', '#ca8a04', '#dc2626', '#7c3aed']

export default function UserTable({ users, onEdit, onDelete }: Props) {
  const [search, setSearch]       = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'All'>('All')
  const [confirmId, setConfirmId]   = useState<string | null>(null)

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole   = roleFilter === 'All' || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

      {/* Toolbar */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', marginRight: 'auto' }}>All Users</h3>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: 220 }}>
          <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 8, border: '1.5px solid #E7E9ED', fontSize: 13, color: '#1F2933', background: '#F5F6F8', outline: 'none', boxSizing: 'border-box', fontFamily: 'Poppins, Inter, sans-serif', transition: 'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor = '#724B68'}
            onBlur={e => e.target.style.borderColor = '#E7E9ED'}
          />
        </div>

        {/* Role filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={14} color="#4B5563" />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as Role | 'All')} style={{
            padding: '8px 12px', borderRadius: 8, border: '1.5px solid #E7E9ED',
            fontSize: 13, color: '#1F2933', background: '#F5F6F8', outline: 'none',
            cursor: 'pointer', fontFamily: 'Poppins, Inter, sans-serif',
          }}>
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Staff">Staff</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#F5F6F8' }}>
              {['User', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#4B5563', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No users found.</td></tr>
            ) : filtered.map((u, idx) => {
              const { color, bg } = ROLE_CONFIG[u.role]
              return (
                <tr key={u.id} style={{ borderTop: '1px solid #F5F6F8', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fdf9fc')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  {/* Avatar + name */}
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: AVATAR_COLORS[idx % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                        {u.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1F2933' }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: '#4B5563' }}>{u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '13px 20px', color: '#4B5563', fontSize: 13 }}>{u.email}</td>
                  <td style={{ padding: '13px 20px', color: '#4B5563', fontSize: 13 }}>{u.phone}</td>
                  <td style={{ padding: '13px 20px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: bg, color }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '13px 20px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: u.status === 'Active' ? '#dcfce7' : '#f3f4f6',
                      color: u.status === 'Active' ? '#16a34a' : '#6b7280',
                    }}>{u.status}</span>
                  </td>
                  <td style={{ padding: '13px 20px', color: '#4B5563', fontSize: 13 }}>{u.joinedDate}</td>
                  <td style={{ padding: '13px 20px' }}>
                    {confirmId === u.id ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#4B5563' }}>Delete?</span>
                        <button onClick={() => { onDelete(u.id); setConfirmId(null) }} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Yes</button>
                        <button onClick={() => setConfirmId(null)} style={{ padding: '4px 10px', borderRadius: 6, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 12, fontWeight: 600, color: '#4B5563', cursor: 'pointer' }}>No</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => onEdit(u)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 7, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 12, fontWeight: 600, color: '#724B68', cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#fdf9fc'; e.currentTarget.style.borderColor = '#724B68' }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E7E9ED' }}
                        ><Pencil size={13} /> Edit</button>
                        <button onClick={() => setConfirmId(u.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 7, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 12, fontWeight: 600, color: '#ef4444', cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.borderColor = '#ef4444' }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E7E9ED' }}
                        ><Trash2 size={13} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '12px 20px', borderTop: '1px solid #F5F6F8', fontSize: 13, color: '#4B5563' }}>
        Showing {filtered.length} of {users.length} users
      </div>
    </div>
  )
}
