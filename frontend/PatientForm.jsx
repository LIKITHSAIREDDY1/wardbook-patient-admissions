import React, { useState } from 'react'

export const fields = {
  name: 'Patient name', age: 'Age', gender: 'Gender', ward: 'Ward',
  department: 'Department', doctor: 'Doctor', admissionDate: 'Admission date', status: 'Status'
}

export function today() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Kolkata' }).format(new Date())
}

export default function PatientForm({ patient, options, onSave, onClose, busy }) {
  const [form, setForm] = useState(patient || {
    name: '', age: '', gender: '', ward: '', department: '', doctor: '',
    admissionDate: today(), status: 'Admitted'
  })

  function submit(event) {
    event.preventDefault()
    const { id, ...values } = form
    onSave({ ...values, name: values.name.trim(), age: Number(values.age) })
  }

  return <form onSubmit={submit}>
    <h2 id="dialog-title">{patient ? 'Edit patient' : 'Add patient'}</h2>
    <div className="form-grid">{Object.entries(fields).map(([key, label]) => {
      const props = { required: true, value: form[key], onChange: e => setForm({ ...form, [key]: e.target.value }) }
      return <label key={key}>{label}
        {options[key] ? <select {...props}><option value="">Select {label.toLowerCase()}</option>
          {options[key].map(item => <option key={item}>{item}</option>)}</select>
        : key === 'age' ? <input type="number" min="0" max="120" step="1" {...props}/>
        : key === 'admissionDate' ? <input type="date" max={today()} {...props}/>
        : <input autoFocus pattern={String.raw`[\p{L}][\p{L}\p{M}]*( [\p{L}][\p{L}\p{M}]*)*`} title="Use letters with single spaces between names." {...props}/>}
      </label>
    })}</div>
    <footer><button type="button" onClick={onClose} disabled={busy}>Cancel</button>
      <button className="primary" disabled={busy}>Save patient</button></footer>
  </form>
}
