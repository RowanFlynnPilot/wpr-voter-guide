import { useRef, useState } from 'react';
import { nextDeadline, daysUntil, formatDate } from '../dates.js';

// Email-safe block for MailerLite: table layout, 600px, every style
// inline, web-safe fonts only. Devon copies the rendered HTML each send.
export default function NewsletterView({ guide }) {
  const { instance, election } = guide;
  const blockRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const days = daysUntil(election.date);
  const next = nextDeadline(election.deadlines);
  const guideUrl = window.location.origin + window.location.pathname;

  const copyHtml = async () => {
    await navigator.clipboard.writeText(blockRef.current.innerHTML.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const serif = "Georgia, 'Times New Roman', serif";
  const sans = 'Arial, Helvetica, sans-serif';

  return (
    <div className="newsletter-page">
      <div className="newsletter-tools">
        <p>
          Email block for MailerLite. Copy the HTML below and paste it into a
          custom-HTML block. All styles are inline; layout is a 600px table.
        </p>
        <button className="print-button" onClick={copyHtml}>
          {copied ? 'Copied!' : 'Copy HTML'}
        </button>
      </div>

      <div ref={blockRef}>
        <table
          role="presentation"
          width="600"
          cellPadding="0"
          cellSpacing="0"
          border="0"
          align="center"
          style={{ width: '600px', maxWidth: '100%', backgroundColor: '#ffffff', border: '1px solid #dddddd', borderCollapse: 'collapse' }}
        >
          <tbody>
            <tr>
              <td style={{ padding: '24px 28px 8px', textAlign: 'center' }}>
                {instance.publication.logo && (
                  <img
                    src={window.location.origin + import.meta.env.BASE_URL + instance.publication.logo}
                    alt={instance.publication.name}
                    width="280"
                    style={{ width: '280px', maxWidth: '100%', height: 'auto', display: 'inline-block' }}
                  />
                )}
                <p
                  style={{
                    margin: '8px 0 0',
                    fontFamily: sans,
                    fontSize: '12px',
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: '#000000',
                  }}
                >
                  Voter Guide
                </p>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '4px 28px 0', textAlign: 'center' }}>
                <p
                  style={{
                    margin: 0,
                    fontFamily: serif,
                    fontSize: '44px',
                    lineHeight: '48px',
                    fontWeight: 'bold',
                    color: '#1F1F1F',
                  }}
                >
                  {days > 0 ? days : 0}
                </p>
                <p
                  style={{
                    margin: '2px 0 0',
                    fontFamily: sans,
                    fontSize: '14px',
                    color: '#1F1F1F',
                  }}
                >
                  {days === 1 ? 'day' : 'days'} until the {election.name},{' '}
                  {formatDate(election.date)}
                </p>
              </td>
            </tr>
            {next && (
              <tr>
                <td style={{ padding: '16px 28px 0' }}>
                  <table
                    role="presentation"
                    width="100%"
                    cellPadding="0"
                    cellSpacing="0"
                    border="0"
                    style={{ borderCollapse: 'collapse' }}
                  >
                    <tbody>
                      <tr>
                        <td
                          style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #ddd6c8',
                            borderLeft: '4px solid #3A867C',
                            padding: '12px 16px',
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontFamily: sans,
                              fontSize: '11px',
                              fontWeight: 'bold',
                              letterSpacing: '1px',
                              textTransform: 'uppercase',
                              color: '#3A867C',
                            }}
                          >
                            Next deadline
                          </p>
                          <p
                            style={{
                              margin: '4px 0 0',
                              fontFamily: sans,
                              fontSize: '15px',
                              fontWeight: 'bold',
                              color: '#1F1F1F',
                            }}
                          >
                            {next.label} — {formatDate(next.date)}
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            )}
            <tr>
              <td style={{ padding: '20px 28px 24px', textAlign: 'center' }}>
                <a
                  href={guideUrl}
                  style={{
                    display: 'inline-block',
                    fontFamily: sans,
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    backgroundColor: '#000000',
                    textDecoration: 'none',
                    padding: '10px 22px',
                  }}
                >
                  Read the full voter guide
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
