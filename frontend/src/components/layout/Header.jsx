import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/button'
import { useState, useEffect, useRef } from 'react'

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const mobileMenuRef = useRef(null)
  const userMenuRef = useRef(null)

  const handleCreatePuzzle = () => {
    if (isAuthenticated) {
      navigate('/creator')
    } else {
      navigate('/login', { state: { from: { pathname: '/creator' } } })
    }
    setShowMobileMenu(false)
  }

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    setShowMobileMenu(false)
    navigate('/')
  }

  const closeMobileMenu = () => {
    setShowMobileMenu(false)
  }

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group" onClick={closeMobileMenu}>
          <div className="p-1 rounded-lg group-hover:brightness-110 transition-all">
            <img src="/logo.svg" alt="Crossword Stack" className="h-8 w-8" />
          </div>
          <span className="text-xl font-bold tracking-tight">Crossword Stack</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="sm">Home</Button>
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/my-puzzles">
                <Button variant="ghost" size="sm">My Puzzles</Button>
              </Link>
              <Button size="sm" onClick={handleCreatePuzzle}>
                Create Puzzle
              </Button>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.username}</span>
                </Button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-1">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium">{user?.username}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-accent/10 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Button size="sm" onClick={handleCreatePuzzle}>
                Create Puzzle
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden p-2 rounded-lg hover:bg-accent/10 transition-colors"
          aria-label="Toggle menu"
        >
          {showMobileMenu ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {showMobileMenu && (
        <nav ref={mobileMenuRef} className="md:hidden border-t border-border bg-card/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <Link to="/" onClick={closeMobileMenu}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                Home
              </Button>
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/my-puzzles" onClick={closeMobileMenu}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    My Puzzles
                  </Button>
                </Link>
                <Button size="sm" onClick={handleCreatePuzzle} className="w-full justify-start">
                  Create Puzzle
                </Button>

                {/* User Info in Mobile Menu */}
                <div className="border-t border-border pt-2 mt-2">
                  <div className="px-3 py-2 bg-muted/50 rounded-lg mb-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {user?.username}
                    </p>
                    <p className="text-xs text-muted-foreground ml-6">{user?.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMobileMenu}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Login
                  </Button>
                </Link>
                <Button size="sm" onClick={handleCreatePuzzle} className="w-full justify-start">
                  Create Puzzle
                </Button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
