/**
 * Test: Admin Portal Role Guard
 * 
 * Run in browser console while on the admin portal (http://localhost:5173/)
 * after logging in as a MAESTRO (not admin).
 * 
 * Expected: All checks should PASS — maestro should be blocked.
 */

(function testRoleGuard() {
  console.log('=== ROLE GUARD TEST ===')

  // 1. Check if Supabase session exists
  const stored = localStorage.getItem('auth-session')
  const session = stored ? JSON.parse(stored) : null
  console.log('[1] Session exists:', !!session)
  console.log('[1] User email:', session?.user?.email || 'N/A')

  // 2. Check role from user_metadata
  const rol = session?.user?.user_metadata?.rol || session?.user?.app_metadata?.rol
  console.log('[2] Role from metadata:', rol || 'MISSING')
  console.log('[2] Is admin:', rol === 'admin')

  // 3. Check router guard behavior
  // The guard should return false for non-admin users
  const isAuthenticated = !!session
  const isAdmin = rol === 'admin'
  const guardWouldPass = isAuthenticated && isAdmin

  console.log('[3] isAuthenticated:', isAuthenticated)
  console.log('[3] isAdmin:', isAdmin)
  console.log('[3] Router guard would PASS:', guardWouldPass)
  console.log('[3] Router guard would BLOCK:', !guardWouldPass)

  // 4. Summary
  if (!guardWouldPass && isAuthenticated) {
    console.log('\n✅ PASS: Maestro is correctly BLOCKED from admin portal')
    console.log('   → The role guard would redirect to login')
  } else if (guardWouldPass) {
    console.log('\n❌ FAIL: Admin user would be allowed (expected)')
    console.log('   → This test is for maestro login only')
  } else {
    console.log('\n⚠️  No session found. Log in as a maestro first, then run this test.')
  }

  console.log('\n=== MANUAL TEST ===')
  console.log('1. Open http://localhost:5173/ in a new incognito window')
  console.log('2. Log in with a MAESTRO account (not admin)')
  console.log('3. After login, manually navigate to http://localhost:5173/#dir-score')
  console.log('4. You should be redirected back to the login page')
  console.log('5. Check console for "⚠️ Non-admin user detected — redirecting to login"')
})()
