
export function NavBar() {
  return (
      <>
        <nav className="navbar is-white">
          <div className="container">
            <div className="navbar-brand" style={{paddingLeft: 10}}>
              <a className="navbar-item brand-text" href="../index.html">
                <img src="books.svg" />
                Notenbank
              </a>
              <div className="navbar-burger burger" data-target="navMenu">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <div id="navMenu" className="navbar-menu">
              <div className="navbar-start">
                <a className="navbar-item" href="admin.html">
                  Schuljahr 2025/2026
                </a>
                <a className="navbar-item" href="admin.html">
                  Klasse 2b
                </a>
              </div>

            </div>
          </div>
        </nav>
      </>
  );
}