export default function Navbar() {
    return <nav className="nav">
        <h1 className="site-title">book pins</h1>
        <ul className="section">
            <li>
                <a href="/">Explore</a>
            </li>
            <li>
                <a href="/saved">Saved</a>
            </li>
        </ul>
    </nav>
}