import { isPast, nextDeadline, formatDate } from '../dates.js';
import Sponsor from '../components/Sponsor.jsx';

export default function HowToVote({ guide }) {
  const { election, instance } = guide;
  const next = nextDeadline(election.deadlines);

  return (
    <div>
      <h2 className="view-title">How to vote</h2>

      <section className="timeline">
        <h3 className="section-heading">Key dates</h3>
        <ol className="deadline-list">
          {election.deadlines.map((d) => {
            const past = isPast(d.date);
            const isNext = next && d.id === next.id;
            const cls = isNext ? 'deadline-next' : past ? 'deadline-past' : '';
            return (
              <li key={d.id} className={`deadline ${cls}`}>
                <p className="deadline-date">
                  {formatDate(d.date)}
                  {isNext && <span className="badge badge-next">Next deadline</span>}
                  {past && <span className="deadline-past-label">Passed</span>}
                </p>
                <p className="deadline-label">{d.label}</p>
                <p className="deadline-detail">
                  {d.detail}{' '}
                  <a href={d.link} target="_blank" rel="noopener noreferrer">
                    Details at MyVote →
                  </a>
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <section>
        <h3 className="section-heading">Good to know</h3>
        {election.explainers.map((e) => (
          <div key={e.id} className="explainer">
            <h4 className="explainer-title">{e.title}</h4>
            <p className="explainer-body">{e.body}</p>
          </div>
        ))}
      </section>

      <section>
        <h3 className="section-heading">Look yourself up</h3>
        <ul className="link-list">
          <li>
            <a href={election.links.register} target="_blank" rel="noopener noreferrer">
              Register to vote or check your registration
            </a>
          </li>
          <li>
            <a href={election.links.polling_place} target="_blank" rel="noopener noreferrer">
              Find your polling place
            </a>
          </li>
          <li>
            <a href={election.links.absentee} target="_blank" rel="noopener noreferrer">
              Request an absentee ballot
            </a>
          </li>
          <li>
            <a href={election.links.myvote_home} target="_blank" rel="noopener noreferrer">
              MyVote Wisconsin
            </a>
          </li>
          <li>
            <a href={election.links.wec_hub} target="_blank" rel="noopener noreferrer">
              Wisconsin Elections Commission election hub
            </a>
          </li>
        </ul>
      </section>

      <Sponsor sponsor={instance.sponsor} />
    </div>
  );
}
