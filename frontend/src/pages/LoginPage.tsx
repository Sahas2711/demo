import LoginBrand from '../component/LoginBrand'
import LoginForm from '../component/LoginForm'

export default function LoginPage() {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100svh',
      fontFamily: 'Poppins, Inter, system-ui, sans-serif'
    }}>
      <LoginBrand />
      <LoginForm />
    </div>
  )
}
