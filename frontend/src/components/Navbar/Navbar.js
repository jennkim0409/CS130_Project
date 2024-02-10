export default function Navbar() {
    return <nav className="nav">
        <h1 className="site-title">book pins</h1>
        <ul className="section">
            <li>
                <a href="/">My Library</a>
            </li>
            <li>
                <a href="/boards">Boards</a>
            </li>
        </ul>
    </nav>
}