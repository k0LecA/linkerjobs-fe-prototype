import { type ChangeEvent, type DragEvent, type FormEvent, useRef, useState } from 'react'
import './App.css'

type Applicant = {
  firstName: string
  lastName: string
  email: string
  phone: string
  portfolio: string
}

const emptyApplicant: Applicant = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  portfolio: '',
}

const mockApplicant: Applicant = {
  firstName: 'Alex',
  lastName: 'Morgan',
  email: 'alex.morgan@example.com',
  phone: '+1 (415) 555-0198',
  portfolio: 'https://alexmorgan.design',
}

function App() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [applicant, setApplicant] = useState<Applicant>(emptyApplicant)
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<'details' | 'review' | 'submitted'>('details')
  const [consented, setConsented] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const updateField = (field: keyof Applicant, value: string) => {
    setApplicant((current) => ({ ...current, [field]: value }))
  }

  const acceptFile = (selectedFile?: File) => {
    if (!selectedFile) return
    setError('')

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Please choose a PDF file.')
      return
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('That file is larger than 10 MB. Choose a smaller PDF.')
      return
    }

    setFile(selectedFile)
    // Prototype behavior: a successful PDF upload simulates text extraction.
    setApplicant((current) => ({
      firstName: current.firstName || mockApplicant.firstName,
      lastName: current.lastName || mockApplicant.lastName,
      email: current.email || mockApplicant.email,
      phone: current.phone || mockApplicant.phone,
      portfolio: current.portfolio || mockApplicant.portfolio,
    }))
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    acceptFile(event.target.files?.[0])
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    acceptFile(event.dataTransfer.files[0])
  }

  const handleContinue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setStep('review')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = () => {
    setStep('submitted')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const removeFile = () => {
    setFile(null)
  }

  const openPicker = () => fileInput.current?.click()

  return (
    <div className="page-shell">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Northstar home">northstar<span>.</span></a>
        <a className="contact-link" href="mailto:careers@northstar.example">
          Questions? <span>Contact us</span>
        </a>
      </header>

      <main id="top" className="main-content">
        {step === 'submitted' ? (
          <section className="success-view" aria-live="polite">
            <div className="success-mark" aria-hidden="true">✓</div>
            <p className="success-kicker">Application received</p>
            <h1>Thanks, {applicant.firstName || 'Alex'}.</h1>
            <p className="success-copy">Your application for Product Designer is on its way to the Northstar team. We’ll be in touch at {applicant.email || 'your email address'}.</p>
            <a className="text-link" href="#top" onClick={() => { setStep('details'); setApplicant(emptyApplicant); setFile(null); setConsented(false) }}>Return to application</a>
          </section>
        ) : (
          <>
            <div className="intro">
              <h1>Apply for Product Designer</h1>
              <p className="company-name">Northstar <span>·</span> Remote <span>·</span> Full-time</p>
              <div className="progress" aria-label={step === 'details' ? 'Step 1 of 2: Your details' : 'Step 2 of 2: Review'}>
                <div className={`progress-step ${step === 'details' ? 'is-current' : 'is-complete'}`}>
                  <span className="progress-dot">{step === 'details' ? '1' : '✓'}</span>
                  <span>Your details</span>
                </div>
                <span className={`progress-line ${step === 'review' ? 'is-complete' : ''}`} />
                <div className={`progress-step ${step === 'review' ? 'is-current' : ''}`}>
                  <span className="progress-dot">2</span>
                  <span>Review</span>
                </div>
              </div>
            </div>

            <div className="application-layout">
              <section className="form-column" aria-labelledby="form-heading">
                {step === 'details' ? (
                  <form onSubmit={handleContinue}>
                    <h2 id="form-heading">Your details</h2>

                    <input ref={fileInput} className="visually-hidden" type="file" accept="application/pdf,.pdf" onChange={handleFileChange} />
                    <div
                      className={`upload-zone ${isDragging ? 'is-dragging' : ''}`}
                      onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={openPicker}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPicker() } }}
                      aria-label="Upload your CV as a PDF, up to 10 megabytes"
                    >
                      <span className="upload-icon" aria-hidden="true">↑</span>
                      <span className="upload-main">Drop your CV here or <span className="browse-link">browse</span></span>
                      <span className="upload-hint">PDF · up to 10 MB</span>
                    </div>
                    {file ? (
                      <div className="file-row">
                        <span className="file-icon" aria-hidden="true">PDF</span>
                        <span className="file-details"><strong>{file.name}</strong><span>{(file.size / (1024 * 1024)).toFixed(1)} MB <span className="extracted-note">· details filled from your CV</span></span></span>
                        <button type="button" className="remove-button" onClick={removeFile}>Remove</button>
                      </div>
                    ) : (
                      <p className="manual-note">No CV handy? You can fill in your details below.</p>
                    )}

                    {error && <p className="form-error" role="alert">{error}</p>}

                    <div className="fields-grid">
                      <label className="field">
                        <span>First name <b>*</b></span>
                        <input autoComplete="given-name" required value={applicant.firstName} onChange={(event) => updateField('firstName', event.target.value)} placeholder="e.g. Alex" />
                      </label>
                      <label className="field">
                        <span>Last name <b>*</b></span>
                        <input autoComplete="family-name" required value={applicant.lastName} onChange={(event) => updateField('lastName', event.target.value)} placeholder="e.g. Morgan" />
                      </label>
                      <label className="field field-wide">
                        <span>Email address <b>*</b></span>
                        <input autoComplete="email" type="email" required value={applicant.email} onChange={(event) => updateField('email', event.target.value)} placeholder="you@example.com" />
                      </label>
                      <label className="field field-wide">
                        <span>Phone number <span className="optional">Optional</span></span>
                        <input autoComplete="tel" type="tel" value={applicant.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="+1 (555) 000-0000" />
                      </label>
                      <label className="field field-wide">
                        <span>Portfolio URL <span className="optional">Optional</span></span>
                        <input type="url" value={applicant.portfolio} onChange={(event) => updateField('portfolio', event.target.value)} placeholder="https://yourportfolio.com" />
                      </label>
                    </div>

                    <label className="consent-row">
                      <input type="checkbox" checked={consented} onChange={(event) => setConsented(event.target.checked)} required />
                      <span>I agree to Northstar’s <a href="#privacy">Privacy Policy</a> and the processing of my personal data for recruitment purposes. <b>*</b></span>
                    </label>

                    <div className="form-actions">
                      <button className="primary-button" type="submit">Continue to review <span aria-hidden="true">→</span></button>
                      <span className="step-caption">Step 1 of 2</span>
                    </div>
                  </form>
                ) : (
                  <section className="review-section" aria-labelledby="form-heading">
                    <h2 id="form-heading">Review your application</h2>
                    <p className="review-intro">Make sure everything looks right before you send it to the Northstar team.</p>
                    <div className="review-block">
                      <div className="review-heading"><h3>Contact details</h3><button type="button" className="text-button" onClick={() => setStep('details')}>Edit</button></div>
                      <dl className="review-list">
                        <div><dt>Name</dt><dd>{applicant.firstName} {applicant.lastName}</dd></div>
                        <div><dt>Email</dt><dd>{applicant.email}</dd></div>
                        <div><dt>Phone</dt><dd>{applicant.phone || 'Not provided'}</dd></div>
                        <div><dt>Portfolio</dt><dd>{applicant.portfolio || 'Not provided'}</dd></div>
                      </dl>
                    </div>
                    <div className="review-block">
                      <div className="review-heading"><h3>CV</h3><button type="button" className="text-button" onClick={() => setStep('details')}>Edit</button></div>
                      <p className="review-file">{file ? file.name : 'No CV attached'}</p>
                    </div>
                    <div className="form-actions review-actions">
                      <button className="primary-button" type="button" onClick={handleSubmit}>Submit application <span aria-hidden="true">→</span></button>
                      <button className="back-button" type="button" onClick={() => setStep('details')}>Back to details</button>
                    </div>
                  </section>
                )}
              </section>

              <aside className="role-column" aria-labelledby="role-heading">
                <h2 id="role-heading">About this role</h2>
                <p className="role-description">Help shape the future of Northstar’s product experience. As a Product Designer, you’ll turn complex problems into simple, intuitive solutions, partnering with product, engineering, and research.</p>
                <dl className="role-facts">
                  <div><dt>Location</dt><dd>Remote</dd></div>
                  <div><dt>Employment type</dt><dd>Full-time</dd></div>
                  <div><dt>Team</dt><dd>Product Design</dd></div>
                </dl>
                <div className="privacy-note" id="privacy">
                  <strong>Your privacy matters.</strong>
                  <p>Your information is shared only with the Northstar hiring team and used for recruitment purposes.</p>
                  <a href="mailto:careers@northstar.example">Read our privacy policy <span aria-hidden="true">↗</span></a>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>

      <footer className="site-footer"><span>© 2025 Northstar</span><span>Hiring with care.</span></footer>
    </div>
  )
}

export default App
