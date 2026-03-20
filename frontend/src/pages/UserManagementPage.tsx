import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import DashboardLayout from '../component/dashboard/DashboardLayout'
import UserSummaryCards from '../component/users/UserSummaryCards'
import UserTable from '../component/users/UserTable'
import UserModal from '../component/users/UserModal'
import { SEED_USERS, type AppUser, type Role } from '../component/users/userData'

type UserInput = Omit<AppUser, 'id' | 'joinedDate' | 'avatar'> & { id?: string; password?: string }

export default function UserManagementPage() {
  const [users, setUsers]         = useState<AppUser[]>(SEED_USERS)
  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser]   = useState<AppUser | null>(null)

  function handleSave(data: UserInput) {
    if (data.id) {
      setUsers(prev => prev.map(u => u.id === data.id
        ? { ...u, name: data.name, email: data.email, phone: data.phone, role: data.role as Role, status: data.status }
        : u
      ))
    } else {
      const newId = `U${String(users.length + 1).padStart(3, '0')}`
      const initials = data.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
      const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      setUsers(prev => [{
        id: newId, name: data.name, email: data.email, phone: data.phone,
        role: data.role as Role, status: data.status,
        joinedDate: today, avatar: initials,
      }, ...prev])
    }
    setModalOpen(false)
    setEditUser(null)
  }

  function handleEdit(u: AppUser) {
    setEditUser(u)
    setModalOpen(true)
  }

  function handleDelete(id: string) {
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  return (
    <DashboardLayout>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>
            User Management
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>
            Add users, assign roles, and manage system access.
          </p>
        </div>
        <button onClick={() => { setEditUser(null); setModalOpen(true) }} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '11px 22px', borderRadius: 10, border: 'none',
          background: '#724B68', color: '#fff', fontSize: 14, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'Poppins, Inter, sans-serif',
          boxShadow: '0 4px 14px rgba(114,75,104,0.3)', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#5A3A52'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#724B68'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <UserPlus size={17} /> Add User
        </button>
      </div>

      {/* Summary cards */}
      <UserSummaryCards users={users} />

      {/* User table */}
      <UserTable users={users} onEdit={handleEdit} onDelete={handleDelete} />

      {/* Modal */}
      {modalOpen && (
        <UserModal
          user={editUser}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditUser(null) }}
        />
      )}
    </DashboardLayout>
  )
}
