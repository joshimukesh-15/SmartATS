import { Link } from 'react-router-dom';

export function FooterSection({ onEnterApp }) {
  return (
    <footer
      className="footer closing footer--dark ground-inverse"
      id="closing"
      style={{ '--hm': 2 }}
      aria-labelledby="close-h"
    >
      <div className="wrap">
        <div className="closing__cta close--word">
          <div className="section-head--split">
            <div>
              <h2 id="close-h">Screen the next resume shortlist with open math</h2>
              <p className="t-lead">Run locally on FastAPI and PostgreSQL, or open the workspace directly.</p>
            </div>
            <button type="button" className="btn btn--primary btn--xl" onClick={onEnterApp}>
              Open the studio
            </button>
          </div>
          <div
            className="close__word"
            aria-hidden="true"
            style={{
              fontSize: 'clamp(44px, 9.5vw, 132px)',
              lineHeight: 1.15,
              overflow: 'visible',
              paddingBottom: '0.08em',
            }}
          >
            SmartATS
          </div>
        </div>

        <div className="closing__links">
          <div className="grid">
            <div className="footer__col span-4">
              <h4>Product</h4>
              <ul>
                <li>
                  <a href="#workspace">Score explorer</a>
                </li>
                <li>
                  <a href="#pipeline">Intake pipeline</a>
                </li>
                <li>
                  <a href="#architecture">Local stack</a>
                </li>
                <li>
                  <a href="#comparison">Method comparison</a>
                </li>
              </ul>
            </div>

            <div className="footer__col span-4 start-5">
              <h4>Workspace</h4>
              <ul>
                <li>
                  <Link to="/login">Recruiter sign in</Link>
                </li>
                <li>
                  <Link to="/studio">Overview</Link>
                </li>
                <li>
                  <Link to="/studio/jobs">Job requisitions</Link>
                </li>
                <li>
                  <Link to="/studio/candidates">Candidate leaderboard</Link>
                </li>
              </ul>
            </div>

            <div className="footer__col span-4 start-9">
              <h4>Evaluation</h4>
              <ul>
                <li>
                  <a href="#evaluation">Benchmark metrics</a>
                </li>
                <li>
                  <a href="#faq">FAQ</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer__legal">
            <span>SmartATS · Deterministic resume screening workspace</span>
            <details className="credits">
              <summary>Stack icons via gilbarbara/logos, vscode-icons, and Lucide</summary>
              <p>
                Python, FastAPI, React, PostgreSQL, and Docker logos from gilbarbara/logos (CC0-1.0); PDF and
                Word file glyphs from vscode-icons (MIT); UI icons from Lucide (ISC).
              </p>
            </details>
          </div>
        </div>
      </div>
    </footer>
  );
}
