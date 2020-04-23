import { Link } from 'preact-router/match'

const Header = () => (
  <header>
    <div class="flex justify-between container mx-auto">
      <nav className="lg:flex-row">
        <Link href="/"><h2 class="lg:mr-8 font-semibold no-underline">shopify convert</h2></Link>
        <div className="text-sm text-gray-800">
          <Link activeClassName="link-active" href="/about">About</Link>
        </div>
      </nav>
    </div>
  </header>
)

export default Header
