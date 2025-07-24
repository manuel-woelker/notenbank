
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
                  Home
                </a>
                <a className="navbar-item" href="admin.html">
                  Orders
                </a>
                <a className="navbar-item" href="admin.html">
                  Payments
                </a>
                <a className="navbar-item" href="admin.html">
                  Exceptions
                </a>
                <a className="navbar-item" href="admin.html">
                  Reports
                </a>
              </div>

            </div>
          </div>
        </nav>
      </>
  );
}