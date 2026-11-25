import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import PatientForm, { fields } from './PatientForm'
import './style.css'

async function api(path, method = 'GET', body) {
  const res = await fetch('/api/' + path, {
    method, headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Request failed. Refresh and try again.')
  if (method === 'GET') return res.json()
}

function App() {
  const [patients, setPatients] = useState([])
  const [options, setOptions] = useState(null)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})
  const [modal, setModal] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const dialog = useRef(null)

  async function load() {
    setError('')
    try {
      const [rows, choices] = await Promise.all([api('patients'), api('options')])
      setPatients(rows)
      setOptions(choices)
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])
  useEffect(() => {
    if (modal) dialog.current.showModal()
    else dialog.current.close()
  }, [modal])

  function open(type, patient) { setError(''); setModal({ type, patient }) }
  async function mutate(method, patient, data) {
    setBusy(true)
    setError('')
    try {
      const path = patient ? 'patients/' + patient.id : 'patients'
      await api(method === 'PATCH' ? path + '/discharge' : path, method, data)
      setModal(null)
      await load()
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }

  const visible = patients.filter(p => p.name.toLowerCase().includes(search.trim().toLowerCase())
    && Object.entries(filters).every(([key, value]) => !value || p[key] === value))
  const admitted = patients.filter(p => p.status === 'Admitted').length
  const filtered = Boolean(search || Object.values(filters).some(Boolean))
  const alert = error && <p role="alert">{error}</p>
  return <>
    <header><div className="wrap brand"><b className="cross" aria-hidden="true">✚</b> Wardbook</div></header>
    <main className="wrap">
      <div className="heading"><h1>Patient admissions</h1><button className="primary" disabled={!options || busy} onClick={() => open('add')}>＋ Add patient</button></div>
      <section className="stats" aria-label="Admission totals">
        {Object.entries({'Total patients':patients.length, Admitted:admitted, Discharged:patients.length-admitted}).map(([label,count]) =>
          <div key={label}><span>{label}</span><strong>{options ? count : '—'}</strong></div>)}
      </section>
      <section className="register">
        <div className="register-head"><h2>Patient register</h2>{filtered && <button onClick={() => { setSearch(''); setFilters({}) }}>Clear filters</button>}</div>
        <div className="filters"><label>Patient name<input type="search" placeholder="Search by name" value={search} onChange={e=>setSearch(e.target.value)}/></label>
          {['ward','department','doctor'].map(key=><label key={key}>{fields[key]}<select value={filters[key] || ''} onChange={e=>setFilters({...filters,[key]:e.target.value})}>
            <option value="">All {key === 'ward' ? 'wards' : key === 'doctor' ? 'doctors' : 'departments'}</option>
            {options?.[key].map(v=><option key={v}>{v}</option>)}</select></label>)}</div>
        {!modal && alert}
        {error && !modal && <button onClick={load}>Retry</button>}
        <table><thead><tr>{['Patient','Age','Gender','Care team','Admission date','Status','Actions'].map(t=><th scope="col" key={t}>{t}</th>)}</tr></thead>
          <tbody>{visible.map(p=><tr key={p.id}>
            <td data-label="Patient"><b>{p.name}</b></td>
            <td data-label="Age">{p.age}</td>
            <td data-label="Gender">{p.gender}</td>
            <td data-label="Care team"><b>{p.doctor}</b><small>{p.department} · {p.ward}</small></td>
            <td data-label="Admission date">{p.admissionDate}</td>
            <td data-label="Status"><span className={'badge '+p.status}>{p.status}</span></td>
            <td><div className="actions"><button disabled={busy} onClick={()=>open('edit',p)}>Edit</button>
              {p.status === 'Admitted' && <button disabled={busy} onClick={()=>mutate('PATCH',p)}>Discharge</button>}
              <button className="danger" disabled={busy} onClick={()=>open('delete',p)}>Delete</button></div></td>
          </tr>)}</tbody></table>
        {!visible.length && <div className="empty">{!options ? error ? 'Register unavailable' : 'Loading register…' : filtered ? 'No matching patients' : 'No patients yet'}</div>}
      </section>
    </main>
    <dialog ref={dialog} aria-labelledby="dialog-title" onCancel={e=>{e.preventDefault(); if (!busy) setModal(null)}}>
      {modal && <>{alert}{modal.type === 'delete' ? <><h2 id="dialog-title">Delete patient?</h2><p>Remove {modal.patient.name} from the register? This is permanent.</p>
        <footer><button autoFocus disabled={busy} onClick={()=>setModal(null)}>Cancel</button><button className="remove" disabled={busy} onClick={()=>mutate('DELETE',modal.patient)}>Delete patient</button></footer></>
        : <PatientForm patient={modal.patient} options={options} busy={busy} onClose={()=>setModal(null)} onSave={data=>mutate(modal.patient?'PUT':'POST',modal.patient,data)}/>}</>}
    </dialog>
  </>
}
createRoot(document.getElementById('root')).render(<App/>)

