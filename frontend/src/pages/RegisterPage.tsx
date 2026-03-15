import RegisterBrand from '../component/RegisterBrand'
import RegisterForm from '../component/RegisterForm'

export default function RegisterPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100svh', fontFamily: 'Poppins, Inter, system-ui, sans-serif' }}>
      <RegisterBrand />
      <RegisterForm />
    </div>
  )
}
